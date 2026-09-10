/* 宣纸 Xuanzhi · 全站唯一 JS：明暗切换 + 代码复制 */
(function () {
  'use strict';

  /* 明暗切换：light <-> dark，初值由 head 内联脚本根据系统偏好决定。
     切换以 #theme-toggle 按钮中心为圆心做圆形揭示：
     切暗色旧页面向按钮收缩，切亮色新页面从按钮扩张（动画在 main.css） */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';

      function apply() {
        root.dataset.theme = next;
        try { localStorage.setItem('xuanzhi-theme', next); } catch (err) { /* 隐私模式忽略 */ }
      }

      /* 不支持 View Transitions 或用户偏好减少动画：维持原瞬时切换 */
      var reduce = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (typeof document.startViewTransition !== 'function' || reduce) { apply(); return; }

      /* 圆心 = 按钮中心；半径 = 圆心到视口最远角的距离，保证圆形能铺满全屏。
         坐标写成百分比：浏览器缩放≠100% 时过渡快照盒不按 CSS 像素取尺寸
         （如 Edge 125% 下按设备像素），绝对 px 会让圆心偏离按钮，
         百分比按动画盒自身比例解析，任何缩放下都落在按钮上 */
      var rect = toggle.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var w = root.clientWidth;  /* 排除滚动条的布局视口，与快照盒一致 */
      var h = root.clientHeight;
      var r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
      var diag = Math.sqrt(w * w + h * h) / Math.SQRT2; /* clip-path 百分比半径的解析基准 */
      root.style.setProperty('--theme-x', (x / w * 100).toFixed(3) + '%');
      root.style.setProperty('--theme-y', (y / h * 100).toFixed(3) + '%');
      root.style.setProperty('--theme-r', (r / diag * 100).toFixed(3) + '%');
      document.startViewTransition(apply);
    });
  }

  /* 代码块复制按钮：动态注入到每个 pre，事件委托 */

  /* 外观面板：背景 + 点缀色切换，状态存 localStorage */
  (function () {
    var btn = document.getElementById('appearance-toggle');
    var panel = document.getElementById('appearance-panel');
    if (!btn || !panel) return;

    var root = document.documentElement;

    function close() {
      panel.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.hasAttribute('hidden');
      if (open) { close(); } else {
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        syncPressed();
      }
    });

    document.addEventListener('click', function (e) {
      if (!panel.hasAttribute('hidden') && !e.target.closest('.appearance')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hasAttribute('hidden')) close();
    });

    /* 选中态扫全文档：样张有两组（桌面浮层面板 + 移动端下拉面板），
       只查自己那个 panel 的话，另一组的高亮不会跟着变 */
    function syncPressed() {
      document.querySelectorAll('button[data-bg]').forEach(function (b) {
        b.setAttribute('aria-pressed', String((root.dataset.bg || 'grid') === b.dataset.bg));
      });
      document.querySelectorAll('button[data-accent]').forEach(function (b) {
        b.setAttribute('aria-pressed', String((root.dataset.accent || 'terracotta') === b.dataset.accent));
      });
      document.querySelectorAll('button[data-hr]').forEach(function (b) {
        b.setAttribute('aria-pressed', String((root.dataset.hr || 'ink') === b.dataset.hr));
      });
    }

    /* 委托挂在 document 上，两处样张都管 */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-bg], button[data-accent], button[data-hr]');
      if (!b) return;
      if (b.dataset.bg) {
        root.dataset.bg = b.dataset.bg;
        try { localStorage.setItem('xuanzhi-bg', b.dataset.bg); } catch (err) {}
      }
      if (b.dataset.accent) {
        root.dataset.accent = b.dataset.accent;
        try { localStorage.setItem('xuanzhi-accent', b.dataset.accent); } catch (err) {}
      }
      if (b.dataset.hr) {
        root.dataset.hr = b.dataset.hr;
        try { localStorage.setItem('xuanzhi-hr', b.dataset.hr); } catch (err) {}
      }
      syncPressed();
    });

    syncPressed();
  })();

  /* 站内搜索：Pagefind（构建后由 npx pagefind --site public 生成 /pagefind/ 索引）。
     运行期按需 import pagefind.js（headless API），全程自托管、不发外部网络请求。
     两个搜索框（桌面浮层 + 移动下拉面板）共用同一个 Pagefind 实例与状态。
     部署没跑 pagefind 时（如本地 hugo server），面板提示「索引未生成」。 */
  (function () {
    var root = document.documentElement;
    /* 包地址来自 <html data-pagefind-index>（baseof 用 relURL 输出，子路径部署也正确） */
    var PF_URL = root.dataset.pagefindIndex || '/pagefind/pagefind.js';
    /* 结果 URL 前缀：从包地址反推出站点根（含子路径），喂给 pagefind.options({ baseUrl }) */
    var BASE = PF_URL.slice(0, PF_URL.length - 'pagefind/pagefind.js'.length);
    var MAX_HITS = 12;
    var T = {
      empty: root.dataset.searchEmpty || '没有找到相关文章',
      loading: root.dataset.searchLoading || '正在搜索…',
      unindexed: root.dataset.searchUnindexed || '索引未生成——发布前请运行 pagefind',
      error: root.dataset.searchError || '搜索出错了，请刷新页面重试'
    };

    var pfPromise = null;      /* 共享 Pagefind 实例 Promise（懒加载一次） */
    var pfFailed = false;
    var waiters = [];          /* 各实例「引擎就绪/失败」回调 */

    function notify() { waiters.forEach(function (fn) { fn(); }); }

    /* 懒加载 Pagefind：成功把实例 resolve 出来并调 options({ baseUrl })；
       失败 resolve null——不让 promise 抛给调用方 */
    function ensure() {
      if (pfPromise) return pfPromise;
      pfPromise = import(PF_URL).then(function (m) {
        var pf = m && (m.default || m);
        var base = BASE || '/';
        if (pf && pf.options) {
          return pf.options({ baseUrl: base }).then(function () { return pf; });
        }
        return pf;
      }).then(function (pf) {
        notify();
        return pf;
      }).catch(function () {
        pfFailed = true;
        notify();
        return null;
      });
      return pfPromise;
    }

    /* 一个搜索框实例：绑自己的输入框/结果列表/提示行，共用上面的 Pagefind 实例 */
    function makeSearch(input, list, hint) {
      var initialHint = hint ? hint.textContent : '';
      var seq = 0;             /* 令牌：丢弃过期请求 */
      var pendingEnter = false;

      function setHint(text) {
        if (!hint) return;
        if (text) { hint.textContent = text; hint.removeAttribute('hidden'); }
        else { hint.setAttribute('hidden', ''); }
      }

      function openFirst() {
        var first = list.querySelector('a');
        if (first) { window.location.href = first.getAttribute('href'); return true; }
        return false;
      }

      function render(items) {
        list.textContent = '';
        var frag = document.createDocumentFragment();
        items.forEach(function (d) {
          var meta = d.meta || {};
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = d.url;

          var head = document.createElement('span');
          head.className = 'search-result-head';
          var hasDate = false;
          if (meta.date) {
            hasDate = true;
            var t = document.createElement('time');
            t.textContent = meta.date;
            head.appendChild(t);
          }
          var title = document.createElement('span');
          title.className = 'search-result-title';
          title.textContent = meta.title || d.url;    /* 标题/地址只走 textContent */
          head.appendChild(title);
          if (!hasDate) head.className += ' no-date';
          a.appendChild(head);

          var excerpt = d.excerpt || d.plain_excerpt;
          if (excerpt) {
            var sn = document.createElement('span');
            sn.className = 'search-result-snippet';
            sn.innerHTML = excerpt;                   /* Pagefind 已转义并带 <mark> */
            a.appendChild(sn);
          }
          li.appendChild(a);
          frag.appendChild(li);
        });
        list.appendChild(frag);
        if (pendingEnter) { pendingEnter = false; openFirst(); }
      }

      /* 引擎状态变化（就绪/未生成索引）时刷新本实例提示 */
      waiters.push(function () {
        if (pfFailed) { setHint(T.unindexed); return; }
        if (input.value.trim()) setHint(T.loading);
      });

      function run(q) {
        var token = ++seq;
        pendingEnter = false;
        list.textContent = '';
        var needle = String(q || '').trim();
        if (!needle) { setHint(initialHint); return; }
        setHint(T.loading);
        ensure().then(function (pf) {
          if (token !== seq) return;                  /* 已有更新的输入，丢弃 */
          if (!pf) { setHint(T.unindexed); return; }
          return pf.search(needle).then(function (res) {
            if (token !== seq) return;
            var hits = (res && res.results || []).slice(0, MAX_HITS);
            if (!hits.length) { setHint(T.empty); return; }
            return Promise.all(hits.map(function (r) { return r.data(); })).then(function (ds) {
              if (token !== seq) return;
              setHint('');
              render(ds);
            });
          }).catch(function () {
            if (token !== seq) return;
            setHint(T.error);
          });
        });
      }

      var debTimer = null;
      input.addEventListener('input', function () {
        window.clearTimeout(debTimer);
        debTimer = window.setTimeout(function () { run(input.value); }, 120);
      });
      input.addEventListener('focus', function () { ensure(); });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (!openFirst()) pendingEnter = true;   /* 结果还没回来时记住，渲染后跳转 */
      });

      setHint(initialHint);
    }

    /* 桌面浮层面板：按钮开合 + 打开时聚焦输入框 */
    (function () {
      var btn = document.getElementById('search-toggle');
      var panel = document.getElementById('search-panel');
      var input = document.getElementById('search-input');
      var hint = document.getElementById('search-hint');
      var list = document.getElementById('search-results');
      if (!btn || !panel || !input || !list) return;

      function close() {
        panel.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      }
      function open() {
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        input.focus();
        ensure();
      }
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (panel.hasAttribute('hidden')) open(); else close();
      });
      document.addEventListener('click', function (e) {
        if (!panel.hasAttribute('hidden') && !e.target.closest('.search')) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hasAttribute('hidden')) close();
      });

      makeSearch(input, list, hint);
    })();

    /* 移动端下拉面板里的搜索框：没有开合按钮，聚焦或输入即触发 */
    (function () {
      var panel = document.getElementById('nav-panel');
      if (!panel) return;
      var input = panel.querySelector('[data-search-input]');
      var list = panel.querySelector('[data-search-results]');
      var hint = panel.querySelector('[data-search-hint]');
      if (!input || !list) return;
      makeSearch(input, list, hint);
    })();
  })();

  /* 移动端下拉导航面板：≤640px 由 ☰ 开合（桌面端 CSS 恒 display:none）。
     面板里的搜索框与外观样张由上面两段逻辑各自接管，这里只管开合与关闭 */
  (function () {
    var btn = document.getElementById('nav-toggle');
    var panel = document.getElementById('nav-panel');
    if (!btn || !panel) return;

    var root = document.documentElement;
    var labelOpen = root.dataset.menuOpen || '打开菜单';
    var labelClose = root.dataset.menuClose || '关闭菜单';

    function isOpen() { return !panel.hasAttribute('hidden'); }

    function setLabel(text) {
      btn.setAttribute('aria-label', text);
      btn.setAttribute('title', text);
    }

    /* 刻意不把焦点送进面板：头栏吸顶，页面滚到很深处时给面板内元素
       focus() 会把视口拽回头部。关闭时若焦点还在面板里才收回来 */
    function close(restoreFocus) {
      panel.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
      setLabel(labelOpen);
      if (restoreFocus && panel.contains(document.activeElement)) btn.focus();
    }

    function open() {
      panel.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
      setLabel(labelClose);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isOpen()) close(false); else open();
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !e.target.closest('#nav-panel') && !e.target.closest('#nav-toggle')) close(true);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close(true);
    });
  })();

  /* 文章工具栏：收成一枚朱印，点开展开三个按钮（回到顶部 / 分享 / 目录）。
     整枚可拖动，位置存 localStorage；拖动超过 5px 就不再触发展开——
     否则拖完松手会把按钮栈一起点开。 */
  (function () {
    var bar = document.getElementById('post-toolbar');
    var stack = document.getElementById('post-toolbar-stack');
    var seal = bar && bar.querySelector('.post-seal');
    if (!bar || !stack || !seal) return;

    var POS_KEY = 'xuanzhi-toolbar';
    var DRAG_THRESHOLD = 5;
    var dragging = false, moved = false;
    var startX = 0, startY = 0, originX = 0, originBottom = 0;

    /* ---- 位置：以「左缘 + 下边缘」为准，夹回视口 ----
       两个约束都不能少：
       1. 锚下边缘——展开按钮栈时整列只往上长，朱印不会往下跑
       2. 上边界让开吸顶头栏——工具栏层级 5、头栏 10，拖到顶部就藏进头栏后面抓不回来了 */
    function headerOffset() {
      var header = document.querySelector('.site-header');
      return header ? header.getBoundingClientRect().height + 8 : 8;
    }

    function clamp(x, bottom) {
      var w = bar.offsetWidth || 40, h = bar.offsetHeight || 40;
      var maxBottom = window.innerHeight - h - headerOffset();
      return {
        x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - w)),
        bottom: Math.min(Math.max(0, bottom), Math.max(0, maxBottom))
      };
    }

    function apply(x, bottom) {
      var p = clamp(x, bottom);
      bar.classList.add('is-moved');
      bar.style.left = p.x + 'px';
      bar.style.bottom = p.bottom + 'px';
      /* 拖到屏幕左三分之一时，悬停提示与分享卡片改贴右侧，免得跑出视口 */
      bar.classList.toggle('tip-right', p.x < window.innerWidth / 3);
      syncStackSide();
    }

    /* 按钮栈朝哪边开：朱印上方放得下就朝上，放不下翻到下方。
       测的是**朱印**上方的余量——按钮栈是绝对定位的，翻边不会改变容器高度 */
    function syncStackSide() {
      if (stack.hasAttribute('hidden')) return;
      var roomAbove = seal.getBoundingClientRect().top - headerOffset();
      bar.classList.toggle('stack-below', roomAbove < stack.offsetHeight + 8);
    }

    try {
      var saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
      if (saved && typeof saved.x === 'number') {
        /* 兼容旧格式 {x, y}：把「上边缘」换算成「下边缘」 */
        var b = typeof saved.bottom === 'number'
          ? saved.bottom
          : window.innerHeight - (saved.y + (bar.offsetHeight || 40));
        apply(saved.x, b);
      }
    } catch (err) { /* 隐私模式 / 脏数据，忽略 */ }

    /* ---- 阅读进度：朱印外圈那一环 ----
       以正文为界算，不用整页——页脚和上下篇导航不该计入进度。 */
    var content = document.querySelector('.post-content');
    var spanMax = 0;
    var lastPct = -1;
    var ticking = false;

    function measure() {
      if (!content) return;
      var top = content.getBoundingClientRect().top + window.scrollY;
      /* 正文里的图没有固定尺寸，offsetHeight 会随解码变化，
         所以 resize / load 都得重量一次，不是冗余 */
      spanMax = Math.max(0, top + content.offsetHeight - window.innerHeight);
    }

    function syncProgress() {
      ticking = false;
      if (!content) return;
      var pct = spanMax <= 0
        ? 100                                              /* 不足一屏的短笺，直接算读完 */
        : Math.round(Math.min(100, Math.max(0, window.scrollY / spanMax * 100)));
      /* 只在整数百分比变化时写 DOM——每帧改样式会招来无谓的重排 */
      if (pct === lastPct) return;
      lastPct = pct;
      bar.style.setProperty('--seal-progress', String(pct));
      /* 按钮栈里那一格的读数（百分号是 CSS 画的，这里只写数字） */
      var out = bar.querySelector('[data-xz="pct"]');
      if (out) out.textContent = pct;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncProgress);
    }, { passive: true });
    window.addEventListener('load', function () {
      measure();
      lastPct = -1;
      syncProgress();
    });
    measure();
    syncProgress();

    window.addEventListener('resize', function () {
      if (bar.classList.contains('is-moved')) apply(parseFloat(bar.style.left), parseFloat(bar.style.bottom));
      else syncStackSide();
      measure();
      lastPct = -1;
      syncProgress();
    });

    /* ---- 拖动 ---- */
    seal.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var r = bar.getBoundingClientRect();
      dragging = true;
      moved = false;
      startX = e.clientX; startY = e.clientY;
      originX = r.left;
      originBottom = window.innerHeight - r.bottom;   /* 以「离视口底部的距离」为锚 */
      if (seal.setPointerCapture) {
        try { seal.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      }
    });

    seal.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      if (!moved) { moved = true; bar.classList.add('is-dragging'); }
      e.preventDefault();
      apply(originX + dx, originBottom - dy);   /* 往上拖 dy<0 → bottom 变大 */
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove('is-dragging');
      if (!moved) return;
      try {
        localStorage.setItem(POS_KEY, JSON.stringify({
          x: parseFloat(bar.style.left) || 0,
          bottom: parseFloat(bar.style.bottom) || 0
        }));
      } catch (err) { /* 忽略 */ }
    }
    seal.addEventListener('pointerup', endDrag);
    seal.addEventListener('pointercancel', endDrag);

    /* ---- 分享卡片：亮出来 + 6 秒后自动收起 ----
       --card-lift 让开按钮栈的高度，上方放不下就翻到下方。
       数组形态是之前有两张卡片时留下的，现在只剩分享这一张；
       留着是为了收/放仍走同一条路径，以后再加卡片不用重写。 */
    var shareCard = document.getElementById('post-share-card');
    var cards = [shareCard].filter(Boolean);
    var cardTimer = null;
    var openCard = null;

    function showCard(card) {
      if (!card) return;
      hideCards();
      /* 按钮栈朝上展开时，卡片要让开一整个栈的高度，否则会压在按钮上 */
      var lift = (!stack.hasAttribute('hidden') && !bar.classList.contains('stack-below'))
        ? stack.offsetHeight + 8
        : 0;
      bar.style.setProperty('--card-lift', lift + 'px');
      card.removeAttribute('hidden');
      /* 上方放不下就翻到下方 */
      var cardTop = bar.getBoundingClientRect().top - 8 - lift - card.offsetHeight;
      bar.classList.toggle('card-below', cardTop < headerOffset());
      openCard = card;
      window.clearTimeout(cardTimer);
      cardTimer = window.setTimeout(hideCards, 6000);
    }

    function hideCards() {
      window.clearTimeout(cardTimer);
      openCard = null;
      cards.forEach(function (c) { c.setAttribute('hidden', ''); });
    }

    /* 目录浮层统一开关：改 <html> 的 xz-toc-open，并同步窄屏触发条的 aria */
    function setTocOverlay(open) {
      document.documentElement.classList.toggle('xz-toc-open', !!open);
      var b = document.querySelector('.toc-bar');
      if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    /* ---- 按钮行为 ---- */
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-act]');
      if (!btn) return;
      /* 刚拖过就不算点击 */
      if (btn === seal && moved) { moved = false; return; }
      var act = btn.dataset.act;

      if (act === 'expand') {
        var open = stack.hasAttribute('hidden');
        if (open) stack.removeAttribute('hidden');
        else stack.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', String(open));
        /* is-open 让 CSS 把进度方框隐去——展开后印面回到纯朱印 */
        bar.classList.toggle('is-open', open);
        syncStackSide();
        return;
      }

      if (act === 'top') {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        return;
      }

      if (act === 'share') {
        /* 不走系统分享：统一把「站名 - 标题 - 地址」写进剪贴板，同时亮出卡片让读者看见复制了什么 */
        var text = bar.getAttribute('data-share-text') || location.href;
        var flash = function () {
          btn.classList.add('is-copied');
          window.setTimeout(function () { btn.classList.remove('is-copied'); }, 1500);
          showCard(shareCard);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(flash, flash);
        } else {
          flash();
        }
        return;
      }

      if (act === 'toc') {
        var memo = document.querySelector('.toc-memo');
        if (!memo) return;
        if (window.innerWidth >= 1200) {
          memo.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } else {
          setTocOverlay(!document.documentElement.classList.contains('xz-toc-open'));
        }
      }
    });

    /* 窄屏浮层目录：点它外面关掉 */
    document.addEventListener('click', function (e) {
      if (!document.documentElement.classList.contains('xz-toc-open')) return;
      if (e.target.closest('.toc-memo') || e.target.closest('[data-act="toc"]') || e.target.closest('.toc-bar')) return;
      setTocOverlay(false);
    });

    /* 窄屏顶部「目录」触发条：与朱印目录按钮同源，开闭同一份 memo 浮层 */
    var tocBar = document.querySelector('.toc-bar');
    if (tocBar) {
      tocBar.addEventListener('click', function () {
        if (window.innerWidth >= 1200) return;
        setTocOverlay(!document.documentElement.classList.contains('xz-toc-open'));
      });
    }

    /* 分享卡片：点它外面或按 Esc 收起 */
    document.addEventListener('click', function (e) {
      if (!openCard) return;
      if (e.target.closest('.post-share-card') || e.target.closest('[data-act="share"]')) return;
      hideCards();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideCards();
    });
  })();

  /* 复制按钮文案由 baseof.html 写在 <html data-copy/data-copied> 上——
     JS 拿不到 Hugo 的 i18n，只能由模板传进来；没传时退回中文默认值 */
  var COPY = document.documentElement.dataset.copy || '复制';
  var COPIED = document.documentElement.dataset.copied || '已复制';

  document.querySelectorAll('.post-content pre > code').forEach(function (code) {
    var pre = code.parentElement;
    if (!pre || pre.querySelector('.copy-code-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-btn';
    btn.textContent = COPY;
    btn.setAttribute('aria-label', COPY);
    pre.appendChild(btn);
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-code-btn');
    if (!btn) return;
    var pre = btn.closest('pre');
    var code = pre && pre.querySelector('code');
    if (!code) return;
    navigator.clipboard.writeText(code.innerText).then(function () {
      btn.classList.add('copied');
      btn.textContent = COPIED;
      window.setTimeout(function () {
        btn.classList.remove('copied');
        btn.textContent = COPY;
        btn.setAttribute('aria-label', COPY);
      }, 1500);
    });
  });

  /* 目录便签 scrollspy：滚动到哪一节，便签上就亮哪一条 */
  (function () {
    var memo = document.querySelector('.toc-memo');
    if (!memo || typeof IntersectionObserver === 'undefined') return;
    var links = memo.querySelectorAll('nav a[href^="#"]');
    /* 长目录折叠：条目超过十条时切换折叠式——明面只列一级条目，划入展开子目；
       正在阅读的分支由 CSS :has(a.toc-active) 自动保持展开，高亮不藏进折页 */
    if (links.length > 10) memo.classList.add('toc-fold');
    var map = {};
    links.forEach(function (l) {
      map[decodeURIComponent(l.hash.slice(1))] = l;
    });
    var heads = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!heads.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('toc-active'); });
        var active = map[en.target.id];
        if (active) active.classList.add('toc-active');
      });
    }, { rootMargin: '-70px 0px -70% 0px' });
    heads.forEach(function (h) { observer.observe(h); });
  })();

  /* 图片灯箱：点正文图开图窗（render-image.html 已把每张图包进 <a class="img-zoom">，
     href 指向最大档 WebP）。增强项：←→ 翻页、滚轮/双击缩放、拖动平移、双指捏合、
     窄屏左右滑动翻页；Esc / 点遮罩 / 点 ✕ 关闭。无 JS 时 .img-zoom 本身就是指向原图的
     链接，退化成「点开看原图」——所以这里只做增强，不做唯一入口 */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.post-content .img-zoom'));
    if (!links.length) return;

    /* 图标来源：@material-design-icons/svg (Apache 2.0) filled/close、chevron_left、chevron_right */
    var D_CLOSE = 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
    var D_LEFT = 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z';
    var D_RIGHT = 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z';
    var CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var MAX_SCALE = 4;

    var box = null, view = null, img = null, cap = null;
    var closeBtn = null, prevBtn = null, nextBtn = null, countEl = null;
    var idx = 0, trigger = null, isOpen = false;
    var scale = 1, tx = 0, ty = 0;
    var pointers = {}, dragging = false, lastX = 0, lastY = 0;
    var downX = 0, downY = 0, moved = false;
    var pinchStart = 0, pinchBase = 1;
    var bodyOverflow = '';

    function svgIcon(d) {
      var NS = 'http://www.w3.org/2000/svg';
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      s.setAttribute('width', '20');
      s.setAttribute('height', '20');
      s.setAttribute('fill', 'currentColor');
      s.setAttribute('aria-hidden', 'true');
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      s.appendChild(p);
      return s;
    }

    /* 汉字篇数（1–99），与归档/标签页的写法同源 */
    function cnNum(n) {
      if (n < 10) return CN[n];
      if (n === 10) return '十';
      var t = Math.floor(n / 10), o = n % 10;
      return (t > 1 ? CN[t] : '') + '十' + (o ? CN[o] : '');
    }

    function build() {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('hidden', '');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', '图片查看');

      var veil = document.createElement('div');
      veil.className = 'lightbox-veil';

      var figure = document.createElement('figure');
      figure.className = 'lightbox-figure';

      var mount = document.createElement('div');
      mount.className = 'lightbox-mount';
      view = document.createElement('div');
      view.className = 'lightbox-view';
      img = document.createElement('img');
      img.className = 'lightbox-img';
      img.setAttribute('decoding', 'async');
      view.appendChild(img);
      mount.appendChild(view);

      cap = document.createElement('figcaption');
      cap.className = 'lightbox-cap';

      figure.appendChild(mount);
      figure.appendChild(cap);

      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'lightbox-close';
      closeBtn.setAttribute('aria-label', '关闭');
      closeBtn.appendChild(svgIcon(D_CLOSE));

      prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'lightbox-nav lightbox-prev';
      prevBtn.setAttribute('aria-label', '上一张');
      prevBtn.appendChild(svgIcon(D_LEFT));

      nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'lightbox-nav lightbox-next';
      nextBtn.setAttribute('aria-label', '下一张');
      nextBtn.appendChild(svgIcon(D_RIGHT));

      countEl = document.createElement('p');
      countEl.className = 'lightbox-count';

      box.appendChild(veil);
      box.appendChild(figure);
      box.appendChild(closeBtn);
      box.appendChild(prevBtn);
      box.appendChild(nextBtn);
      box.appendChild(countEl);
      document.body.appendChild(box);

      /* 只有一张图时，翻页与篇数全收起 */
      if (links.length < 2) {
        prevBtn.setAttribute('hidden', '');
        nextBtn.setAttribute('hidden', '');
        countEl.setAttribute('hidden', '');
      }

      box.addEventListener('click', function (e) {
        if (e.target === veil) close();
      });
      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', function () { show(idx - 1); });
      nextBtn.addEventListener('click', function () { show(idx + 1); });

      img.addEventListener('wheel', onWheel, { passive: false });
      img.addEventListener('dblclick', onDblClick);
      img.addEventListener('pointerdown', onDown);
      img.addEventListener('pointermove', onMove);
      img.addEventListener('pointerup', onUp);
      img.addEventListener('pointercancel', onUp);
      document.addEventListener('keydown', onKey);
    }

    /* ---- 缩放 / 平移 ---- */

    function apply() {
      img.style.transform = scale === 1
        ? ''
        : 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      box.classList.toggle('is-zoomed', scale > 1);
    }

    /* 放大后把画面约束在视口内，不让纸边跑进空白 */
    function clampPan() {
      if (scale <= 1) { scale = 1; tx = 0; ty = 0; return; }
      var r = view.getBoundingClientRect();
      var mx = (scale - 1) * r.width / 2;
      var my = (scale - 1) * r.height / 2;
      if (tx > mx) tx = mx; else if (tx < -mx) tx = -mx;
      if (ty > my) ty = my; else if (ty < -my) ty = -my;
    }

    /* 以视口坐标 (cx, cy) 为不动点缩放 */
    function zoomTo(next, cx, cy) {
      if (next > MAX_SCALE) next = MAX_SCALE;
      if (next < 1) next = 1;
      if (next === scale) return;
      var r = view.getBoundingClientRect();
      var k = 1 - next / scale;
      tx += (cx - (r.left + r.width / 2) - tx) * k;
      ty += (cy - (r.top + r.height / 2) - ty) * k;
      scale = next;
      clampPan();
      apply();
    }

    function resetZoom() {
      scale = 1; tx = 0; ty = 0;
      apply();
    }

    function onWheel(e) {
      e.preventDefault();
      zoomTo(scale * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX, e.clientY);
    }

    function onDblClick(e) {
      e.preventDefault();
      if (scale > 1) resetZoom();
      else zoomTo(2.5, e.clientX, e.clientY);
    }

    function pointerCount() {
      var n = 0;
      for (var k in pointers) { if (pointers.hasOwnProperty(k)) n++; }
      return n;
    }

    function pinchIds() {
      var ids = [];
      for (var k in pointers) { if (pointers.hasOwnProperty(k)) ids.push(k); }
      return ids;
    }

    function pinchDist() {
      var ids = pinchIds();
      var a = pointers[ids[0]], b = pointers[ids[1]];
      return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    function onDown(e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (e.preventDefault) e.preventDefault();
      if (pointerCount() === 2) {
        pinchStart = pinchDist();
        pinchBase = scale;
        dragging = false;
        img.classList.remove('is-dragging');
        return;
      }
      downX = e.clientX; downY = e.clientY; moved = false;
      if (scale <= 1) return;
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      img.classList.add('is-dragging');
      if (img.setPointerCapture) {
        try { img.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      }
    }

    function onMove(e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId].x = e.clientX;
      pointers[e.pointerId].y = e.clientY;

      if (pointerCount() === 2 && pinchStart) {
        var d = pinchDist();
        if (d > 0) {
          var ids = pinchIds();
          var a = pointers[ids[0]], b = pointers[ids[1]];
          zoomTo(pinchBase * (d / pinchStart), (a.x + b.x) / 2, (a.y + b.y) / 2);
        }
        return;
      }
      if (Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4) moved = true;
      if (!dragging) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      clampPan();
      apply();
    }

    function onUp(e) {
      var wasSingle = pointerCount() === 1;
      delete pointers[e.pointerId];
      if (pointerCount() < 2) pinchStart = 0;
      dragging = false;
      img.classList.remove('is-dragging');

      /* 一指抬起、还有一指按着：接着拖 */
      var ids = pinchIds();
      if (ids.length === 1 && scale > 1) {
        dragging = true;
        lastX = pointers[ids[0]].x;
        lastY = pointers[ids[0]].y;
        img.classList.add('is-dragging');
        return;
      }

      /* 未放大的原图上横向滑动 = 翻页（窄屏没有两侧按钮） */
      if (wasSingle && scale === 1 && links.length > 1) {
        var dx = e.clientX - downX, dy = e.clientY - downY;
        if (Math.abs(dx) > 60 && Math.abs(dy) < 40) show(idx + (dx < 0 ? 1 : -1));
      }
    }

    /* ---- 开合 / 翻页 ---- */

    function show(i) {
      var n = links.length;
      idx = ((i % n) + n) % n;
      var a = links[idx];
      var src = a.querySelector('img');
      var href = a.getAttribute('href');
      if (href && img.getAttribute('src') !== href) img.setAttribute('src', href);
      img.setAttribute('alt', (src && src.getAttribute('alt')) || '');
      cap.textContent = a.getAttribute('data-caption') || '';
      if (links.length > 1) countEl.textContent = cnNum(idx + 1) + ' / ' + cnNum(n);
      resetZoom();
    }

    function open(a) {
      if (!box) build();
      trigger = a;
      show(links.indexOf(a));
      box.removeAttribute('hidden');
      isOpen = true;
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      box.setAttribute('hidden', '');
      document.body.style.overflow = bodyOverflow;
      resetZoom();
      if (trigger && trigger.focus) trigger.focus();
      trigger = null;
    }

    function onKey(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (links.length > 1 && e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); return; }
      if (links.length > 1 && e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); return; }
      if (e.key !== 'Tab') return;
      /* 焦点锁在图窗内 */
      var f = box.querySelectorAll('button:not([hidden])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('.img-zoom') : null;
      if (!a || links.indexOf(a) === -1) return;
      e.preventDefault();
      open(a);
    });
  })();

  /* 首页诗笺：每次到访向诗泉 API 随机取一首绝句（构建期已烘入一首兜底，
     网络/CORS 失败时静默保留烘入的诗） */
  (function () {
    var scroll = document.getElementById('poem-scroll');
    if (!scroll || typeof fetch !== 'function' || typeof AbortController === 'undefined') return;

    var API = scroll.getAttribute('data-poem-api') || 'https://poetry.palemoky.com/api/poems/random';
    /* 五言绝句 / 七言绝句，URL 预编码 */
    var TYPES = ['%E4%BA%94%E8%A8%80%E7%BB%9D%E5%8F%A5', '%E4%B8%83%E8%A8%80%E7%BB%9D%E5%8F%A5'];
    var type = TYPES[Math.floor(Math.random() * TYPES.length)];

    var ctrl = new AbortController();
    var timer = window.setTimeout(function () { ctrl.abort(); }, 6000);

    fetch(API + '?type=' + type + '&lang=zh-Hant', { signal: ctrl.signal })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        var d = json && json.data;
        if (!d || !d.title || !d.content || !d.content.length) throw new Error('empty poem');
        if (!isClean(d)) throw new Error('标题或诗句过长');
        render(d);
      })
      .catch(function () { /* 保留构建期烘入的诗 */ })
      .then(function () { window.clearTimeout(timer); });

    /* 与构建期同口径的校验：标题 ≤12 字、朝代 ≤6 字、作者 ≤8 字、两句到六句、每句 ≤16 字。
       诗泉偶尔返回带考据注释/超长的条目（标题如「果州百姓爲史謙恕歌（題從《古謠諺》卷五三）」，
       或句尾缀《海錄碎事》卷十二…）——任一超限即整首弃用，静默保留构建期烘入的默认诗 */
    function isClean(d) {
      var runes = function (s) { return Array.from(String(s || '')).length; };
      var auth = (d.author && d.author.name) || '';
      var dyn = (d.dynasty && d.dynasty.name) || '';
      var lines = d.content || [];
      if (runes(d.title) > 12) return false;
      if (runes(auth) > 8 || runes(dyn) > 6) return false;
      if (lines.length < 2 || lines.length > 6) return false;
      return lines.every(function (l) { return runes(l) <= 16; });
    }

    function el(cls, text) {
      var n = document.createElement('span');
      n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }

    /* 重建诗笺子节点，逐列淡入动画随新节点自动重放 */
    function render(d) {
      var author = (d.author && d.author.name) || '佚名';
      var dynasty = (d.dynasty && d.dynasty.name) || '';
      /* isClean 已保证 2–6 行，整首渲染，不再截断 */
      var lines = d.content || [];

      var frag = document.createDocumentFragment();
      frag.appendChild(el('poem-heading', '「' + d.title + '」'));

      var body = el('poem-body');
      lines.forEach(function (line) {
        body.appendChild(el('poem-line', String(line)));
      });
      frag.appendChild(body);

      var sign = el('poem-sign');
      sign.appendChild(el('poem-author', dynasty ? dynasty + ' · ' + author : author));
      sign.appendChild(el('poem-seal', Array.from(author)[0] || '佚'));
      frag.appendChild(sign);

      scroll.textContent = '';
      scroll.appendChild(frag);
    }
  })();

  /* 诗笺意象：首页诗笺右下角的 8 式水墨小品，每次到访随机亮一枚 */
  (function () {
    var arts = document.querySelectorAll('.poem-art.inkcard-print');
    if (!arts.length) return;
    var pick = function () {
      for (var i = 0; i < arts.length; i++) arts[i].classList.remove('is-on');
      arts[Math.floor(Math.random() * arts.length)].classList.add('is-on');
    };
    pick();
  })();

  /* 播放器：视频交给 Plyr、音频交给 APlayer（都在 assets/vendor/，见那里的 README）。
     短代码只出标记与数据，控件与播放逻辑都在两个库里——这里只做初始化胶水。

     选它们的着眼点是媒体播放器真正的难点：seek 节流、缓冲状态机、移动端自动播放
     策略。这三样在真实浏览器环境里的打磨，正是这两个库的价值所在。

     两个静默失效点，都会让人以为是别的问题：
     1. Plyr 的 iconUrl 默认指向 cdn.plyr.io——不指到自托管的 svg，图标全空；
     2. APlayer 的 lrcType 默认是 0（不显示歌词），传了 lrc 也不会有歌词，且不报错。 */
  (function () {
    var D = document.documentElement.dataset;

    function each(scope, sel, fn) {
      Array.prototype.forEach.call(scope.querySelectorAll(sel), fn);
    }

    var plyrs = [];
    var aplayers = [];

    /* 视频与音频之间也要互斥。APlayer 的 mutex 只管它自己那几个实例，
       管不到 Plyr；一篇同时有视频和播放列表的文章会两个一起响。 */
    function pauseOthers(kind, self) {
      var mine = kind === 'plyr' ? plyrs : aplayers;
      var theirs = kind === 'plyr' ? aplayers : plyrs;
      for (var i = 0; i < theirs.length; i++) theirs[i].pause();
      for (var j = 0; j < mine.length; j++) {
        if (mine[j] !== self) mine[j].pause();
      }
    }

    /* ---- 视频：Plyr ---- */
    each(document, '[data-xz-video]', function (host) {
      var media = host.querySelector('video');
      if (!media || !window.Plyr) return;

      var start = parseFloat(host.dataset.xzStart || '0');
      if (isFinite(start) && start > 0) {
        media.addEventListener('loadedmetadata', function () {
          media.currentTime = Math.min(start, media.duration || start);
        }, { once: true });
      }
      if (host.dataset.xzLoop) media.loop = true;

      var player = new window.Plyr(media, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        iconUrl: D.plyrIcon || '',
        i18n: {
          play: D.playerPlay || '播放',
          pause: D.playerPause || '暂停',
          mute: D.playerMute || '静音',
          unmute: D.playerUnmute || '取消静音',
          enterFullscreen: D.playerFullscreen || '全屏',
          exitFullscreen: D.playerExitFullscreen || '退出全屏',
          restart: D.playerRestart || '重播',
          rewind: D.playerRewind || '后退 {seektime} 秒',
          fastForward: D.playerFastForward || '快进 {seektime} 秒'
        },
        tooltips: { controls: true, seek: true },
        clickToPlay: true,
        resetOnEnd: false
      });
      player.on('play', function () { pauseOthers('plyr', player); });
      plyrs.push(player);
    });

    /* ---- 音频：APlayer ---- */
    each(document, '[data-xz-aplayer]', function (host) {
      if (!window.APlayer) return;
      var el = host.querySelector('script[data-xz-tracks]');
      if (!el) return;

      var tracks;
      try {
        tracks = JSON.parse(el.textContent);
      } catch (err) {
        return;   /* JSON 坏了就整块不渲染，别抛到控制台 */
      }
      if (!tracks || !tracks.length) return;

      var player = new window.APlayer({
        container: host,
        audio: tracks,
        /* 主题色给 CSS 变量而不是死色值：APlayer 只是把它写进 style.backgroundColor，
           不做颜色运算，所以运行时切明暗 / 点缀色会实时跟着变 */
        theme: 'var(--color-accent)',
        /* 3 = 歌词是文件 URL。默认 0 是不显示歌词，传了 lrc 也不会出现 */
        lrcType: parseInt(host.dataset.xzLrctype, 10) || 0,
        /* 默认是 auto，会把每一首都预载；博客场景没必要 */
        preload: 'metadata',
        volume: 0.7,
        listFolded: true,
        listMaxHeight: '220px',
        mutex: true
      });
      player.on('play', function () { pauseOthers('aplayer', player); });
      aplayers.push(player);
    });
  })();
})();

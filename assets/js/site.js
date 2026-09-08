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

    function syncPressed() {
      panel.querySelectorAll('button[data-bg]').forEach(function (b) {
        b.setAttribute('aria-pressed', String((root.dataset.bg || 'grid') === b.dataset.bg));
      });
      panel.querySelectorAll('button[data-accent]').forEach(function (b) {
        b.setAttribute('aria-pressed', String((root.dataset.accent || 'terracotta') === b.dataset.accent));
      });
      panel.querySelectorAll('button[data-hr]').forEach(function (b) {
        b.setAttribute('aria-pressed', String((root.dataset.hr || 'ink') === b.dataset.hr));
      });
    }

    panel.addEventListener('click', function (e) {
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

  var COPY = '复制';
  var COPIED = '已复制';

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

    /* 与构建期同口径的校验：标题 ≤12 字、每句 ≤16 字、至少两句。
       诗泉偶尔返回带考据注释的条目（标题如「果州百姓爲史謙恕歌（題從《古謠諺》卷五三）」，
       或句尾缀《海錄碎事》卷十二…），竖排诗笺会被撑爆——这时静默保留当前这首 */
    function isClean(d) {
      var runes = function (s) { return Array.from(String(s)).length; };
      if (runes(d.title) > 12) return false;
      var lines = Array.prototype.slice.call(d.content, 0, 6);
      if (lines.length < 2) return false;
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
      var lines = Array.prototype.slice.call(d.content, 0, 6);

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
})();

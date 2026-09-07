/* 宣纸 Xuanzhi · 全站唯一 JS：明暗切换 + 代码复制 */
(function () {
  'use strict';

  /* 头栏宽度过渡：文章页展开至阅读区等宽，返回其他页收回。
     MPA 每次导航都是新文档，先强制设为旧宽度再放开到目标宽度，过渡才必然发生；
     bfcache 恢复（后退/前进）时也重放一次 */
  (function () {
    var inner = document.querySelector('.header-inner');
    var main = document.querySelector('main');
    if (!inner) return;
    /* 两档宽度须与 CSS 保持一致：窄 = --content-width(800px)，宽 = 阅读区 1150px */
    var NARROW = '800px';
    var WIDE = '1150px';

    function play() {
      var wide = document.body.getAttribute('data-layout') === 'page';
      inner.style.transition = 'none';
      inner.style.maxWidth = wide ? NARROW : WIDE; /* 起步 = 旧状态的宽度 */
      void inner.offsetWidth;                      /* 强制回流，吞掉起始帧 */
      inner.style.transition = '';
      inner.style.maxWidth = wide ? WIDE : NARROW; /* 放开，过渡到当前页目标宽度 */
    }

    function replayMain() {
      if (!main) return;
      main.style.animation = 'none';
      void main.offsetWidth;
      main.style.animation = '';
    }

    play();
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { play(); replayMain(); }
    });
  })();

  /* 明暗切换：light <-> dark，初值由 head 内联脚本根据系统偏好决定 */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('xuanzhi-theme', next); } catch (err) { /* 隐私模式忽略 */ }
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
        render(d);
      })
      .catch(function () { /* 保留构建期烘入的诗 */ })
      .then(function () { window.clearTimeout(timer); });

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

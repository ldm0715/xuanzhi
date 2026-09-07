/* 宣纸 Xuanzhi · 全站唯一 JS：明暗切换 + 代码复制 */
(function () {
  'use strict';

  /* 明暗切换：light <-> dark，初值由 head 内联脚本根据系统偏好决定 */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('xuanzhi-theme', next); } catch (e) { /* 隐私模式忽略 */ }
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
        b.setAttribute('aria-pressed', String(root.dataset.accent === b.dataset.accent));
      });
    }

    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-bg], button[data-accent]');
      if (!b) return;
      if (b.dataset.bg) {
        root.dataset.bg = b.dataset.bg;
        try { localStorage.setItem('xuanzhi-bg', b.dataset.bg); } catch (err) {}
      }
      if (b.dataset.accent) {
        root.dataset.accent = b.dataset.accent;
        try { localStorage.setItem('xuanzhi-accent', b.dataset.accent); } catch (err) {}
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
})();

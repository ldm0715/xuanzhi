# P1 · 渲染管线

三条。前两条是**输出侧**的缺失（链接、公式），第三条是**列表侧**的缺失。

---

## 1. 缺 `render-link.html`（七个渲染钩子里缺的第 3 个）

**现状**：`layouts/_markup/` 下只有 `render-image.html`、`render-heading.html`、`render-table.html`（P0 新增）。**没有 `render-link.html`**，所以 Markdown 链接走 Hugo 内置渲染——外链就是裸的 `<a href="https://…">`，没有 `target`，没有 `rel`，没有视觉区分。

**为什么要修**：
- **读者体验**：正文里点一个外链，直接离开站点，返回靠浏览器后退。技术博客里外链很多，这个体验损耗是持续的
- **安全**：`target="_blank"` 必须配 `rel="noopener"`，否则新开的页面能通过 `window.opener` 操纵原页面。现在的链接干脆不开新页，等于回避了问题但也没解决体验
- **视觉**：站内链接和外链现在长得一模一样（都是 `main.css:78` 那套朱色下划线）。读者点之前无法预判

**怎么修**：新增 `layouts/_markup/render-link.html`，要点：
- 用 `urls.Parse .Destination` 判断是否外链（**和 `render-image.html` 同一套写法**，保持一致性）
- 外链：`target="_blank" rel="noopener noreferrer"` + 一个类名（如 `link-external`），类名交给 CSS 加"↗"标记
- 内链：保持原样，`.RelPermalink` 归一化
- 别用 CSS 的 `a[href^="http"]` 判断外链——站点自己用绝对 URL 写的内链会被误伤，服务端判断才准

**代价**：新增约 15 行模板 + 3 行 CSS。风险是钩子会接管**所有** Markdown 链接，要确保内链/锚点链接的行为不变。

**验证**：`content/posts/hello-xuanzhi.md` 里已有外链（`https://gohugo.io/`）。构建后 `grep -o '<a[^>]*gohugo.io[^>]*>' public/posts/hello-xuanzhi/index.html`，确认 `target` / `rel` / 类名都在；再点一次站内链接确认没被误判。

---

## 2. 数学只有客户端渲染

**现状**：`hugo.toml` 开了 passthrough（`\( \)` / `$$` / `\[ \]`），`head.html` 用 `findRE` 检测到公式才加载 KaTeX 的 CSS + JS，然后**在浏览器里**用 `renderMathInElement` 渲染。所以：

- `public/posts/math-formulas/index.html` 的静态 HTML 里是**原始 LaTeX**（`\(E = mc^2\)`）
- 只有这一个页面加载了 `katex.min.js`

**为什么要修**：
- **爬虫**看到的是 `\(E = mc^2\)`，不是公式。搜索引擎无法索引公式内容
- **禁用 JS / JS 加载失败**时，读者看到的是一串反斜杠和美元号
- **RSS 阅读器**不执行 JS，订阅里全是 LaTeX 源码
- 客户端渲染还有**闪烁**（先出 LaTeX 再变公式），且多加载 ~300KB JS

Hugo 0.132+ 提供 `transform.ToMath`，能在**构建期**把公式渲染成静态 HTML（Go 版 KaTeX），彻底解决上面四条。

**怎么修**：
- 新增 `layouts/_markup/render-passthrough.html`，调 `transform.ToMath`（`output: "htmlAndMathml"`，`displayMode` 按 `.Type` 是否 `block` 决定）
- KaTeX 的 **CSS 继续自托管**（`static/katex/katex.min.css`）——构建期渲染出的 HTML 仍需要它排版
- `head.html` 里那套「检测公式 → 加载 JS → 客户端渲染」可以整个去掉，省 300KB 和一个闪烁
- P0 已给 `.katex-display` 加了横向滚动，构建期渲染后同样适用

**代价**：新增约 12 行模板；`head.html` 减约 18 行。风险是 `transform.ToMath` 与客户端 KaTeX 的细微差异（少见但存在，比如某些宏）；建议先在 `math-formulas.md` 上逐条比对渲染结果再删旧路径。

**验证**：`hugo` 构建后 `grep -c 'class="katex"' public/posts/math-formulas/index.html` 应 > 0（改前是 0）；然后**禁用 JS**打开该页，公式应正常显示。

---

## 3. 列表页无摘要、无「阅读更多」

**现状**：
- 归档页（`layouts/partials/post-item.html`，全文 4 行）只输出**日期 + 标题**，没有任何摘要
- 首页卡片（`layouts/partials/post-card.html:12`）有 52 字纯文本摘要，但**整张卡就是链接，没有"阅读更多"入口**

**为什么要修**：
- **归档页**：读者面对一串标题，无法判断哪篇值得点。这是归档页的核心功能缺失——归档页不是索引，是"选哪篇读"的界面
- **首页**：摘要有，但 `truncate 52` 是硬截断（`.Summary | plainify | chomp | truncate 52`），**可能截在句子中间**，且没有视觉上的"未完待续"提示

**怎么修**：
- 归档页：`post-item.html` 里补一行 `.Summary`（用 P0 给 `head.html` 写的那套 `plainify | chomp | replaceRE` 压成单行，再 `truncate`），字号降到 0.9rem、颜色 `--color-text-secondary`
- 首页卡片：摘要改用 `<!--more-->` 优先、否则截断；末尾加一个「续读」样式的链接（与落款行的细竖线分隔语言一致）
- 注意 `.Summary` 在没有 `<!--more-->` 时是**自动摘要**，会带上各级标题文字（P0 的 description 就是这个坑）——**一定要 `plainify` + 压空白**

**代价**：`post-item.html` +4 行，`post-card.html` 改 1 行，CSS 约 10 行。风险是归档页信息密度上升，需要调间距。

**验证**：`/posts/` 页看每篇是否有一行摘要且不越界；`content/posts/markdown-elements.md` 有 `<!--more-->`，它的摘要应恰好截在分隔符处。

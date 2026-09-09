# P1 · 内容元素样式

Goldmark 能产出、主题却没写样式的元素。共同点是：**不写也能看，但看得很将就**——要么掉回浏览器默认（和主题的墨阶排版格格不入），要么用错字体（文楷没有真斜体）。

证据统一在 `assets/css/main.css`：`grep` 不到对应选择器即为未样式化。

---

## 1. `<em>` / `<i>` —— 假斜体（**最该先修的一条**）

**现状**：`main.css` 里没有任何 `em` / `i` 规则。正文里 `*斜体*` 渲染出的是浏览器**合成的假斜**。

**为什么要修**：`--font-sans` 是霞鹜文楷（`token.css`），**这套字没有真斜体字面**。浏览器只能用几何倾斜去伪造——汉字被斜切之后笔画歪、重心散，在小字号正文里尤其脏。这是中文排版的经典坑：**西文斜体是字体设计，中文斜体是几何变形**。目前 `content/posts/markdown-elements.md` 里就有一处 `*斜体*` 在演示这个坏效果。

**怎么修**：中文强调的传统写法是**着重号**——字下加圆点。CSS 一行就能做：

```
.post-content em,
.post-content i {
  font-style: normal;
  text-emphasis: filled dot;          /* 实心圆点 */
  text-emphasis-position: under right; /* 中文习惯：字下方 */
}
```

这样既不假斜，又比加粗更符合"宣纸/古籍"的气质。注意 `text-emphasis` 在 Firefox/Safari/Chrome 都已支持，但**要留回落**：不支持时保持 `font-style: normal`（即不加斜也不加着重号），比假斜好看。

**代价**：约 6 行 CSS。风险是着重号会增加行高一点点，长段落里要留意。

**验证**：打开 `content/posts/markdown-elements.md` 的「行内元素」一节，看 `*斜体*` 是**字下圆点**而不是歪字；再在暗色 + 黛青下看一遍颜色（`text-emphasis` 默认取 `currentColor`，会跟着墨色走）。

---

## 2. `<strong>` / `<b>`

**现状**：无规则。浏览器默认 `font-weight: bolder`——文楷有 medium 字重，但**粗体切片是否加载取决于字体切片 CSS**，可能只是合成加粗。

**为什么要修**：加粗是正文里最常用的强调手段，现在它的视觉分量和「墨阶四档」没有关系，是浏览器给的。要让强调色/墨色深浅参与主题的墨阶体系（比如用 `--color-title` 的浓墨）。

**怎么修**：给 `strong` 指定 `color: var(--color-title)` + `font-weight: 700`，让"强调"体现为**墨色加深**而不是单纯变粗——这更符合主题「浓墨/重墨」的语言。

**代价**：3 行。

**验证**：`markdown-elements` 页看加粗处是否比正文更浓，而不是只有字重变化。

---

## 3. `<del>` / `<s>`

**现状**：无规则，`~~删除线~~` 走浏览器默认。

**为什么要修**：默认删除线是**与文字同色的实线**，在墨色正文里和文字混在一起，扫读时分不清是删除还是下划线。主题的任务列表已有一处 `text-decoration: line-through`（`.post-content` 任务项），两者风格应该统一。

**怎么修**：`color: var(--color-text-secondary)`（淡化）+ `text-decoration-color: var(--color-ink-weak)`（更淡的线），让"已作废"的语义靠**褪色**表达。

**代价**：3 行。

**验证**：`markdown-elements` 页「行内元素」一节的 `~~删除线~~`。

---

## 4. `<sub>` / `<sup>`

**现状**：无规则。脚注角标是 `.footnote-ref`（P0 已单独样式化），但**内容里手写的** `H~2~O`（需开 `extras` 扩展）或原始 `<sup>` 没有样式。

**为什么要修**：浏览器默认 `vertical-align: super` + `font-size: smaller` 会把行高撑开——**中文行高本来就靠 1.9 撑着，一个上标能让那一行明显跳一下**。

**怎么修**：`font-size: 0.75em` + `line-height: 0`（或 `vertical-align: baseline; position: relative; top: -0.5em`）避免撑行高。注意 `line-height: 0` 有副作用（可能和相邻元素重叠），**更稳的是 `position: relative` 方案**。

**代价**：4 行。

**验证**：造一个带 `H<sub>2</sub>O` 的段落，对比上下行行距有没有变化。

---

## 5. `<abbr>` / `<small>` / `<cite>` / `<q>` / `<var>` / `<samp>` / `<time>`

**现状**：全部无规则。

**为什么要修**：这些是**语义元素**，Markdown 原生写不出来（要手写 HTML，而 `unsafe = true` 允许），但技术文章里很常见：
- `<abbr title="…">` 缩写 —— 默认只有点状下划线，鼠标悬停才显示全称，**移动端完全看不出**
- `<small>` 附属说明 —— 默认 `font-size: smaller`，在 17px 正文里偏小且无墨阶
- `<cite>` / `<q>` 引文书名 —— 默认斜体，**又是假斜**

**怎么修**：`abbr` 加 `text-decoration: underline dotted` + `cursor: help`；`small` 用 `--color-text-secondary` 并明确字号（0.85em）；`cite`/`q` 走 `font-style: normal` + 主题色（同第 1 条的思路）。

**代价**：约 10 行。

**验证**：需要手写一段含这些标签的测试内容。

---

## 6. `<dl>` / `<dt>` / `<dd>`

**现状**：无规则。而且——**Goldmark 的 `definitionList` 扩展默认是开的**（`hugo config` 里 `definitionlist = true`），所以 `术语\n: 释义` 这种写法**能渲染出 `<dl>`**，只是没有任何样式。

**为什么要修**：`<dl>` 掉回浏览器默认 = 定义项顶格、释义缩进 40px，和主题列表那套「墨点三级递进 + 引导虚线 + 顿号序号」完全脱节。定义列表在术语解释、参数表这类内容里很有用。

**怎么修**：`dt` 走 `--font-title` 宋体 + `--color-title`，`dd` 加左侧细线（`border-left: 1px dashed var(--color-ink-weak)`）与缩进，和 `ul ul` 的虚线引导保持一致。

**代价**：约 8 行。

**验证**：`content/posts/markdown-elements.md` 里加一段 `术语\n: 释义`，看是否成形。

---

## 7. 嵌套 `<blockquote>` 无分级

**现状**：`main.css:1188` 的 `.post-content blockquote` 是**后代选择器**，所以每嵌套一层就再叠一层 `border-left: 2px solid` + 一层 `--color-quote-bg` 底色。`markdown-elements.md` 里有三级嵌套，实测堆了三道边框、三层底色。

**为什么要修**：三层叠起来左侧像一道粗重的三色墙，而且**分不清哪层是哪层**——引用层级的信息完全丢失。

**怎么修**：给 `.post-content blockquote blockquote` 降低左边框宽度/换色（如 `--color-ink-weak`），第三层再去掉底色只留边框。核心是让**每层只增加一点点，而不是复制整套**。

**代价**：约 6 行。

**验证**：`markdown-elements` 页「引用嵌套」一节，看三级引用能否一眼分清层级。

---

## 8. 裸 `<figure>` / `<figcaption>`

**现状**：只有 `.post-figure` 这个类有样式（`render-image.html` 在图有 title 时加上）。**手写的** `<figure>`（`unsafe = true` 允许）完全没样式。

**为什么要修**：主题的图注是「题跋式」——细楷居中 + 两侧各一段短引线。作者手写 figure 时拿不到这套语言，只能得到浏览器默认的斜体图注，风格断裂。

**怎么修**：把 `.post-figure` 的规则**同时挂到裸 `figure`/`figcaption` 上**（写成 `.post-content figure` / `.post-content figcaption`，`.post-figure` 作为兼容类保留）。注意别把首页卡片的 `<figure>` 卷进来——那些不在 `.post-content` 内，安全。

**代价**：改选择器，约 4 处。

**验证**：在文章里手写一段 `<figure><img><figcaption>…</figcaption></figure>`，看是否自动获得题跋图注。

---

## 9. 零打印样式

**现状**：三个 CSS 文件里 `grep "@media print"` → 0。

**为什么要修**：博客的核心价值是文章，读者打印/存 PDF 时，现在会连**头栏毛玻璃、页脚、目录便签、外观面板按钮、浅色底纹**一起打出来——深色模式下更糟，整页墨黑，费墨且几乎无法阅读。这也是可访问性的一环。

**怎么修**：加一段 `@media print`：
- 隐藏 `.site-header` / `.site-footer` / `.toc-memo` / `.appearance` / `.copy-code-btn` / `.lightbox`
- 强制 `color: #000; background: #fff`（打印不该用宣纸底）
- 图片与表格避免跨页断开（`break-inside: avoid`）
- 链接后附 URL（`a[href^="http"]::after { content: " (" attr(href) ")" }`）

**代价**：约 25 行。**注意**：这是全站唯一允许"不用 token"的地方——打印必须是黑白，`--color-*` 在这里没有意义。

**验证**：浏览器打印预览（Ctrl+P）看每一类页面。

---

## 10. `:target` 无高亮

**现状**：全站 `grep ":target"` → 0。（P0 已给脚注加了 `.footnotes li:target`，但**标题锚点**跳转仍然没有任何落点提示。）

**为什么要修**：目录点标题、外链带 `#anchor` 进来，页面会跳过去，但**读者看不出落在哪一行**——尤其标题多的时候。这是导航体验里很基础的一环。

**怎么修**：`.post-content :target` 或 `.post-content h2:target, h3:target…` 加一层淡朱底/左侧朱砂短竖（和归档页悬停的朱砂短竖同源），并考虑加 `scroll-margin-top`（避开吸顶头栏）。

**代价**：约 5 行。`scroll-margin-top` 要按头栏高度（56px）取值。

**验证**：从目录点一个标题，看落点是否有朱色标记、标题是否被头栏挡住。

---

## 11. `a:visited` 与外链视觉标记

**现状**：`main.css:78` 有 `a` 与 `a:hover`，**没有 `:visited`**；也没有任何区分站内/站外的样式。

**为什么要修**：
- `:visited` —— 长文里读者回头找"刚才点过的那个链接"全靠它；现在所有链接一个色
- 外链无标记 —— 读者点下去**直接离开站点**且无预警。传统做法是在外链后加一个极小的"↗"或换色

注意 `:visited` 能改的属性被浏览器严格限制（只有 `color` 等少数几个），这是隐私设计，别试图改背景/边框。

**怎么修**：`:visited { color: var(--color-text-secondary) }`；外链标记建议配合 `render-link.html`（见 `03-rendering-pipeline.md` 第 1 条）在**服务端**加类，比 CSS 的 `a[href^="http"]` 更可靠（后者会把站内绝对链接也误判）。

**代价**：3 行 + 一条渲染钩子（另计）。

**验证**：点几个链接再回来，看颜色是否变化。

---

## 12. 滚动条未样式化

**现状**：三个 CSS 文件里 `grep "scrollbar-width\|::-webkit-scrollbar"` → 0。代码块 `pre`（`main.css:1422` 附近）和 P0 新增的 `.table-wrap` 都是滚动容器，用的是**平台默认滚动条**——在暗色模式下，亮色滚动条会突兀地贴在 `--color-code-bg` 上。

**为什么要修**：滚动条是暗色模式里少数几个"漏出来"的系统控件。默认亮色滚动条在夜墨底上像一道白光，破坏整体。

**怎么修**：用标准属性（`scrollbar-width: thin` + `scrollbar-color: <thumb> <track>`，token 驱动），WebKit 前缀作为补充。**别只写 `::-webkit-scrollbar`**——Firefox 不支持。

**代价**：约 8 行。

**验证**：暗色模式下看代码块横向滚动条是否融进底色。

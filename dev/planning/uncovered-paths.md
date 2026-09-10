# 内容未覆盖的路径与仓库杂项

不是"没样式"，是**没有内容走到过这些分支**——所以它们既没被验证，也可能在第一次用到时才发现问题。加上几条仓库层面的杂项。

---

## 1. front matter `cover` / `description`：主题接了线，但没人用

**现状**：
- `layouts/partials/post-card-cover.html:10` 读 `.Params.cover`，没填就按标题哈希生成八式水墨小品
- `layouts/partials/head.html` 读 `.Description`（P0 改造后优先级：`description` → 自动摘要 → 站点描述）
- **`description` 已不是未覆盖路径**（2026-09-10）：`exampleSite/content/` 与 `docs/` 下每一篇都填了它，演示站的文档索引页还直接拿它当条目说明
- **但 `cover` 仍然全站零使用**——`post-card-cover.html` 那条自定义图分支从未被真实数据跑过

**为什么要关注**：自定义 `cover` 会走 Hugo 图片管线（`.Resize`），如果 `cover` 指向 SVG 或尺寸异常的图，`post-card-cover.html` 可能报错——而这个错误只有在第一篇文章填了 `cover` 时才会暴露。

**怎么修**：给**一篇文章**（不是文档页——只有文章会进首页卡片）真的填上 `cover`。`cover` 要么是 page bundle 里的资源、要么是以 `/` 开头的静态路径，所以：

- 简单做法：把 `exampleSite/content/posts/ink-gradation.md` 改成 bundle（`ink-gradation/index.md` + 一张图），front matter 写 `cover: "那张图.png"`
- 或者先拿静态路径试：`cover: "/images/covers/…png"`

**验证**：构建后确认卡片右下角的印记换成了自己的图，且 `<head>` 里的 `og:image` 指向按 `1200x630` 裁好的版本。

---

## 2. Goldmark 扩展与语法：开了没用过

| 能力 | 状态 | 说明 |
|---|---|---|
| `definitionList` | **默认开着**，零内容使用 | `术语\n: 释义` 能渲染出 `<dl>`，但没样式（见 `../archive/02-content-elements.md` 第 6 条） |
| `extras`（`==mark==`、`++ins++`、`~sub~`、`^sup^`） | **未开启** | 内容里的 `<mark>` 是手写 HTML 不是扩展 |
| h5 / h6 | 从未出现 | 正文最深只到 h4；`hugo.toml` 的 `tableOfContents.endLevel = 4` 也没被压到 |
| 引用式链接 `[文本][id]` | 零使用 | 长文里能显著降低重复 URL，值得知道它可用 |
| `{.class}` 属性语法 | 零使用 | `hugo.toml` 开了 `attribute.block = true`，但内容只用了 `{#id}`。**注意**：P0 修掉的重复 `id` 就是它引起的 |
| 外链图片分支 | 零使用 | `render-image.html` 里 `$u.IsAbs` 那条分支（外链图原样输出）没被任何内容走到 |
| TOML front matter | 唯一一篇是草稿 | `content/posts/my-first-post.md` 用 `+++` 且 `draft = true`，从未构建 |

**为什么要关注**：这些都是"一用就可能踩"的地方。尤其 `{.class}` 属性——它是 P0 那个重复 `id` 的成因，说明**开了的语法如果没有测试内容兜底，就会在第一次真用时暴露**。

**怎么修**：在 `docs/writing/index.md` 里逐条加一小段演示。那一篇的定位正是「写作约定 + 各类元素的版式」，而且**它就是演示站的正文**——加进去既当文档又当回归面，成本很低。

**验证**：加完后构建，确认 `public/` 里出现 `<dl>`、h5、引用式链接等标签。

---

## 3. 关于页：只在构建层验证过，没进过浏览器

**现状**：关于页（`layouts/about.html` + 四颗短代码，见 [`../archive/07-about-page.md`](../archive/07-about-page.md)）的验证全部停在**构建层与 DOM 层**——模板被选中、i18n 解析无空串、CSS 进包、短代码闭合正确、同级选择器命中，这些都是实测的。**但没有一处在浏览器里目视确认过**：

| 没验证的 | 风险 |
|---|---|
| 明暗 × 陶土/黛青 四种组合 | 样式全走 token，理论上四种都成立——而"理论上"正是这个主题前几轮反复出问题的地方 |
| ≤640px 窄屏 | 题录式退化为单列、引首与联系行的折行，都没看过 |
| `@media print` | 只加了 `.xz-nameplate-seal` 的隐藏与 `.xz-project` 的 `break-inside`，没真打印过 |
| 分节内容与标题文字的对齐 | 那条 27px 缩进是按公式推出来的，实际视觉是否对齐未经确认 |
| `nameplate` 的 **page bundle 人像**分支 | **默认人像**（`static/images/me.jpg`）与**静态路径**两条都已实测。但指向 bundle 资源时会走 `.Fill "264x264 Center webp q85"` 的图片管线，**这段从未执行过**——而 `content/about.md` 是单个 `.md`、不是 bundle，要用本地图得先改成 `content/about/index.md` + 图片同目录，否则 `Resources.GetMatch` 找不到（会 `warnf` 并落到朱印，不会静默） |
| `static/images/me.jpg` 的体积 | 940×940 的 JPG **84KB**，而它显示出来只有 132px（2× 也就 264px），等于按 3.5× 出图。它在 `static/` 下**不走图片管线**（static 不是 resource），原样发布；同目录 `og-default.png` 只有 20KB。挪进 `assets/` 用 `resources.Get` + `.Fill` 能压到十几 KB，但那就失去"站点同名覆盖"的便利。**折中**：用工具重编码成 400×400 放回原处，代码一个字不用动 |

**为什么要关注**：这个主题的历史一再表明，**构建通过离「看起来对」很远**——列表墨点歪在文字左上方、内联 SVG 被撑成 300×150、右下横线与文字右端各停各的，全都是构建零报错、肉眼一眼就看出来的问题。关于页目前一次浏览器检验都没有。

**怎么修**：起 `hugo server --source F:/hugo_gcnanmu --port 1314`，过一遍 `/about`——四种外观组合、缩到 640px、打印预览各看一次。

**验证**：上面那张表四行都能打上勾。

---

## 4. `themes/ananke` 子模块：死重

> **已清理（2026-09-09）**：站点仓库已 `git submodule deinit -f themes/ananke` + `git rm` 移除，`.gitmodules` 与 git 模块元数据一并清掉；`themes/` 下现在只剩 `xuanzhi`。下方为当时的记录。

**现状**：站点 `.gitmodules` 注册了 `themes/ananke` 子模块，目录也检出了，但 `hugo.toml` 里 `theme = 'xuanzhi'`——**ananke 从未被引用**。

**为什么要关注**：
- 它出现在 `themes/` 下，会让"主题查找路径"多一个候选（虽然当前不生效）
- 克隆仓库时多拉一个无关仓库
- 新人看到两个主题会困惑

**怎么修**：确认没有依赖后 `git rm --cached themes/ananke` + 删 `.gitmodules` 对应条目（**注意**：这是删除操作，按仓库规矩要先确认）。

**代价**：零风险，但属于"清理"而非"修复"。

**验证**：`git submodule status` 不再列出 ananke；`hugo` 构建正常。

---

## 5. 杂项

| 项 | 说明 |
|---|---|
| ~~`qr` 短代码把 PNG 写到站点根目录~~ | **已修**：默认 `targetDir = "images/qr"`，产物落在 `public/images/qr/qr_<hash>.png`；仍可传 `targetDir` 覆盖 |
| ~~`single.html` 的 TOC 渲染两次~~ | **已修**（2026-09-09）：正文那份 `<details class="toc">` 移除，改为窄屏顶部触发条 `.toc-bar`，点开**同一份** `.toc-memo` 浮层；宽屏 `.toc-memo` 仍作侧栏。目录树只渲染一次，`id="TableOfContents"` 全页唯一（构建实测 count = 1） |
| ~~`fileExists "themes/xuanzhi/static/..."`~~ | **已修**：字体 @font-face CSS 挪进 `assets/fonts/`，`head.html` 改用 `resources.Get` 探测（module-aware，不依赖主题目录名）。woff2 切片仍留在 `static/fonts/`，两边相对位置保持一致 |

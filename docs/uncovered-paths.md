# 内容未覆盖的路径与仓库杂项

不是"没样式"，是**没有内容走到过这些分支**——所以它们既没被验证，也可能在第一次用到时才发现问题。加上几条仓库层面的杂项。

---

## 1. front matter `cover` / `description`：主题接了线，但没人用

**现状**：
- `layouts/partials/post-card-cover.html:10` 读 `.Params.cover`，没填就按标题哈希生成八式水墨小品
- `layouts/partials/head.html` 读 `.Description`（P0 改造后优先级：`description` → 自动摘要 → 站点描述）
- 但**全站 13 个内容文件没有一个设过 `cover` 或 `description`**

**为什么要关注**：这两条路径**从未被真实数据跑过**。风险在于：
- 自定义 `cover` 会走 Hugo 图片管线（`.Resize`），如果 `cover` 指向的是 SVG 或尺寸异常的图，`post-card-cover.html` 可能报错——而这个错误只有在第一篇文章填了 `cover` 时才会暴露
- `description` 只在 `head.html` 里用，长文本/含引号/含换行的边界情况没试过

**怎么修**：不是改代码，是**给一篇文章真的填上这两项**，当作回归测试。填完看一眼首页卡片和 `<head>`。

**验证**：给 `content/posts/with-images/index.md` 加 `cover: "paper-test.png"` 和一段 `description`，构建后确认卡片换图、meta 用的是手写描述。

---

## 2. Goldmark 扩展与语法：开了没用过

| 能力 | 状态 | 说明 |
|---|---|---|
| `definitionList` | **默认开着**，零内容使用 | `术语\n: 释义` 能渲染出 `<dl>`，但没样式（见 `content-elements.md` 第 6 条） |
| `extras`（`==mark==`、`++ins++`、`~sub~`、`^sup^`） | **未开启** | 内容里的 `<mark>` 是手写 HTML 不是扩展 |
| h5 / h6 | 从未出现 | 正文最深只到 h4；`hugo.toml` 的 `tableOfContents.endLevel = 4` 也没被压到 |
| 引用式链接 `[文本][id]` | 零使用 | 长文里能显著降低重复 URL，值得知道它可用 |
| `{.class}` 属性语法 | 零使用 | `hugo.toml` 开了 `attribute.block = true`，但内容只用了 `{#id}`。**注意**：P0 修掉的重复 `id` 就是它引起的 |
| 外链图片分支 | 零使用 | `render-image.html` 里 `$u.IsAbs` 那条分支（外链图原样输出）没被任何内容走到 |
| TOML front matter | 唯一一篇是草稿 | `content/posts/my-first-post.md` 用 `+++` 且 `draft = true`，从未构建 |

**为什么要关注**：这些都是"一用就可能踩"的地方。尤其 `{.class}` 属性——它是 P0 那个重复 `id` 的成因，说明**开了的语法如果没有测试内容兜底，就会在第一次真用时暴露**。

**怎么修**：在 `content/posts/markdown-elements.md` 里逐条加一小段演示（那篇的定位就是"功能总览 + 视觉回归"）。成本很低，收益是**下次改主题时有一页能跑回归**。

**验证**：加完后构建，确认 `public/` 里出现 `<dl>`、h5、引用式链接等标签。

---

## 3. `themes/ananke` 子模块：死重

**现状**：站点 `.gitmodules` 注册了 `themes/ananke` 子模块，目录也检出了，但 `hugo.toml` 里 `theme = 'xuanzhi'`——**ananke 从未被引用**。

**为什么要关注**：
- 它出现在 `themes/` 下，会让"主题查找路径"多一个候选（虽然当前不生效）
- 克隆仓库时多拉一个无关仓库
- 新人看到两个主题会困惑

**怎么修**：确认没有依赖后 `git rm --cached themes/ananke` + 删 `.gitmodules` 对应条目（**注意**：这是删除操作，按仓库规矩要先确认）。

**代价**：零风险，但属于"清理"而非"修复"。

**验证**：`git submodule status` 不再列出 ananke；`hugo` 构建正常。

---

## 4. 杂项

| 项 | 说明 |
|---|---|
| `qr` 短代码把 PNG 写到站点根目录 | 构建产物里会出现 `public/qr_<hash>.png`。短代码支持 `targetDir` 参数，建议约定写到 `images/qr/` 下，别污染根目录 |
| `single.html` 的 TOC 渲染两次 | `single.html:37` 在 `<details>` 里一份、`:65` 在侧栏 `.toc-memo` 一份。宽屏时 CSS 隐藏页内那份，但**HTML 里确实有两份**（DOM 重复、`id` 也重复）。P0 只修了标题的重复 `id`，TOC 这份还在 |
| `fileExists "themes/xuanzhi/static/..."` | `head.html` 里三处字体探测**写死了 `themes/xuanzhi` 这个挂载路径**。主题目录一改名（或改用 submodule 的别的路径），字体就会静默不加载 |

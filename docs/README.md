# 宣纸主题 · 待办与理由

记录**主题还没做、但值得做**的事，以及每件事**为什么要做**。每条都带证据路径、修法、代价、验证方法，方便排期时直接判断值不值得动。

与 `CLAUDE.md` 的分工：

- `CLAUDE.md` —— **已定的实现约定**与踩过的坑（做了的）
- `docs/` —— **待办清单 + 理由**（没做的）

档位：**P0 已修** · **P1 已实施** · **P2 结构性**（改动大，看需求）。

> **状态（2026-09-08）**：P1 三篇（`seo-and-distribution.md` / `content-elements.md` / `rendering-pipeline.md`）已全部实施完毕，实现约定与踩到的坑已并入 `CLAUDE.md`。这三篇保留作**决策记录**（为什么当初要做、当时怎么想），不再是待办。P2 的**菜单系统**与 **i18n 补齐**也已完成；**搜索索引**调研后搁置（结论见 `structure.md`），「其他」一篇仍是待办。

---

## 速览

### P1 · 分发与 SEO —— [`seo-and-distribution.md`](seo-and-distribution.md)

| 条目 | 一句话理由 |
|---|---|
| 无 `robots.txt` | 爬虫没有抓取指引，sitemap 也没被声明 |
| 无 `og:image` | 分享卡片没图，点击率明显吃亏 |
| OG 字段不全 | 缺 `og:site_name` / `og:locale` / `article:*`，平台无法归类 |
| 无 JSON-LD | 拿不到结构化数据，出不了富摘要 |
| RSS 走内置模板 | `<description>` 塞整篇原始 HTML，阅读器渲染错乱 |
| 单页缺 RSS alternate | 在文章页订阅会失败 |
| `twitter:card` 是 `summary` | 有图后应改大图卡片 |

### P1 · 内容元素 —— [`content-elements.md`](content-elements.md)

`strong` / `em` / `del` / `sub` / `sup` / `abbr` / `small` / `cite` / `q`、`dl/dt/dd`、嵌套 `blockquote` 分级、裸 `figure` / `figcaption`、`@media print`、`:target`、`a:visited`、外链视觉标记、滚动条样式。

**最实在的一条**：`<em>` 在文楷下是浏览器合成的假斜体，中文看着很脏。

### P1 · 渲染管线 —— [`rendering-pipeline.md`](rendering-pipeline.md)

| 条目 | 一句话理由 |
|---|---|
| 缺 `render-link.html` | 外链没有 `rel="noopener"`，也加不了视觉标记 |
| 数学只有客户端渲染 | 爬虫 / 禁 JS / RSS 看到的都是原始 LaTeX |
| 列表页无摘要无「阅读更多」 | 归档页只有日期和标题，读者无法判断要不要点 |

### P2 · 结构性 —— [`structure.md`](structure.md)

**已完成**：菜单系统 ✅ · i18n 补齐 ✅ · 搜索索引 ✅（「能用」版，无中文分词；升级选型见 `structure.md`）
**备查**：相关文章 · `lastmod` / `enableGitInfo` · 面包屑 · series 分类法 · 作者页

### 其他 —— [`uncovered-paths.md`](uncovered-paths.md)

内容从未用到的路径（`cover` / `description` front matter、h5/h6、TOML front matter…）与仓库死重。

---

## 已完成的 P0（2026-09-08）

九项真 bug 已修，构建产物核对 + 目视确认通过。实现约定写进了 `CLAUDE.md`：

| 修了什么 | 落在 |
|---|---|
| `emoji` 配置位置错 → 顶层 `enableEmoji` | 站点 `hugo.toml` |
| `<meta name="description">` 未转义、未裁剪（326 字符 16 换行 → 162 字符 0 换行） | `layouts/partials/head.html` |
| 标题重复 `id` 属性 + SVG 滤镜 id 每页重复 | `layouts/_markup/render-heading.html` |
| `.post-content h1` 零样式 | `assets/css/main.css` |
| 脚注角标 / 回跳箭头 / 双分割线 / `:target` 高亮 | `assets/css/main.css` |
| 宽表格溢出（新增表格渲染钩子包滚动容器） | `layouts/_markup/render-table.html` + `main.css` |
| KaTeX 长公式溢出 | `assets/css/main.css` |
| `qr` 短代码无 `alt` | `layouts/shortcodes/qr.html` |
| `details` 短代码参数名错（渲染出英文 "Details"） | `layouts/shortcodes/details.html` + 内容 |

---

## 怎么用这份文档

1. 先看上面的速览，挑一条感兴趣的
2. 打开对应文件，看 **为什么要修** 决定值不值
3. 要动时看 **怎么修** 的落点，按 **验证** 一节自测
4. 做完了把条目从 `docs/` 移到 `CLAUDE.md`（那里的规矩是记约定，不记待办）

# Xuanzhi 主题 · 待优化清单（沉淀版）

汇总分散在各处讨论里"值得做、但还没做"的事，避免只存在对话里。与 `dev/planning/` 其它文档的分工：

- `structure.md` / `uncovered-paths.md` 已有细节的，本文件只**索引不重复**（见 §1）
- §2 是**尚未成文**的待办（主要是站点侧发布前清理）
- §3 是讨论过、**倾向不做**的增强，记下来免得以后再纠结一遍

> 动工前先读 `../CLAUDE.md`（约定与坑）；完成一条就把结论沉淀进根 `CLAUDE.md`，若单独立了篇再整篇归档到 `../archive/`。

## 1. 已落在既有文档的待办（索引）

| 事项 | 落在哪 | 状态 |
|---|---|---|
| ~~`single.html` TOC 渲染两份（DOM/id 重复）~~ | `uncovered-paths.md` §4 杂项 | **已修**（2026-09-09，见该行） |
| ~~`qr` 短代码 PNG 写到站点根~~ | `uncovered-paths.md` §4 杂项 | **已修**（2026-09-09，见该行） |
| 给 `cover` / `description` / h5–h6 / 引用式链接 / `{.class}` / TOML front matter / definitionList / 外链图补真实回归内容 | `uncovered-paths.md` §1–2 | 待办（建议补到 exampleSite 与站点，作回归面） |
| ~~`themes/ananke` 死子模块清理~~ | `uncovered-paths.md` §3 | **已修**（2026-09-09，见该行） |
| ~~搜索无中文分词 → 将来换 Pagefind~~ | `structure.md` §3 | **已实施**（2026-09-09，升级为 Pagefind） |
| 相关文章 / `lastmod`+`enableGitInfo` / 面包屑 / series / 作者页 | `structure.md` 文末「备查」 | 备查 |

## 2. 尚未成文的待办

### 站点侧（非主题，作者本人的博客 `F:\hugo_gcnanmu`，发布前必修）

| 事项 | 现状 | 怎么修 / 代价 | 验证 |
|---|---|---|---|
| `baseURL` 占位 | `hugo.toml` 仍是 `https://example.org/`，canonical / OG / RSS / sitemap 全指向它 | 改成真实域名（末尾带 `/`）。零成本 | 构建产物里无 example.org |
| `params.author` / `params.description` 没设 | JSON-LD author 回落成站点 title；无站点级 meta description | `hugo.toml` 补两项。零成本 | `<head>` 出现作者与描述 |
| `content/posts/test.md` 非草稿会发布 | 占位正文 "gogogo" 会成一篇真实页面 | 删掉或转草稿/改真文。零成本 | 构建产物无「我的test」 |
| `my-first-post.md` | Hugo scaffold 草稿残留 | 清理。零成本 | 发布列表干净 |
| `static/` 两个 dev 预览 HTML | `header-extend-demo.html` / `mobile-nav-demo.html` 会被发布到站点根 | 移出 `static/` 或删除 | 产物根目录没有这两个文件 |
| 真实首篇带 `cover` 的文章 | 主题 `cover` 路径从未被真实数据跑过（回归风险） | 写正式文章时填 `cover`（同时回归 §1 那条） | 首页卡片换图、OG 正常 |

### 内容/页面候选

- **About / 关于页**：菜单系统已支持，加一篇内容页 + `[[menus.main]]` 即可。这是单人博客最自然的下一步，但纯内容决策，不涉及主题改动。

## 3. 讨论过、倾向不做（避免重复评估）

| 候选 | 当时结论 |
|---|---|
| 站内评论（giscus / waline 等） | 破坏"纸笺"静谧气质，单作者场景收益低 |
| 阅读进度条 | 可做可不做，极简气质优先 |
| 面包屑 / series / 作者页 / `enableGitInfo` | 单作者、缓存不友好的代价 > 收益（详见 `structure.md` 备查逐条理由） |
| ~~现在就换 Pagefind~~ | — | **已实施**（2026-09-09）：构建步骤成为部署要求；UI 走原生面板（headless API）；定位已改写为「零第三方网络依赖」 |

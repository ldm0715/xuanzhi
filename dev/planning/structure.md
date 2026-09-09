# P2 · 结构性改造

三条**已勾选**（菜单系统 / i18n 补齐 / 搜索索引），四条**备查**。这三条都比 P1 重：会动模板结构，不是加几行 CSS。所以单独立档，做之前先掂量。

---

## 1. 菜单系统

**现状**：`layouts/partials/header.html:5-15` 的导航是**算出来的**，不是配出来的：

```go-html-template
{{- with site.MainSections -}}
{{- with site.GetPage (index . 0) -}}
<a href="{{ .RelPermalink }}">{{ i18n "archive" }}</a>
{{- end -}}
{{- end -}}
{{ with site.GetPage "categories" -}}<a …>{{ .Title }}</a>{{ end }}
{{ with site.GetPage "tags" -}}<a …>{{ i18n "tags" }}</a>{{ end }}
```

`hugo.toml` 里 `[menus]` 是空的。站点 `content/` 下放 `_index.md` 只为把标题本地化成「归档」「分类」「标签」（见站点提交 `91b77c2`）。

**为什么要修**：
- **加一个页面就得改模板**。想加"关于""友链"，必须动 `header.html`——这不是配置驱动的静态站该有的样子
- `site.MainSections` 的排序**不可控**。它按 Hugo 内部规则返回，现在恰好 `posts` 排第一；哪天多一个顶层内容目录，导航第一项可能就换页了（`index . 0` 取的是第一个）
- 导航项的**顺序、显示名、是否外链**都无法表达

**怎么修**：
- 站点 `hugo.toml` 加 `[menus]`，如 `[[menus.main]] name/url/weight`
- `header.html` 改成 `{{ range site.Menus.main }}`，用 `.Name` / `.URL` / `.Weight`
- `footer.html` 的 RSS 链接也可以一并收进菜单（加 `[[menus.footer]]`）
- **迁移要小心**：现在三项的 URL 依赖 `site.GetPage`，改配置时要写成显式路径（`/posts/`、`/categories/`、`/tags/`），别用 `relref` 之外的相对写法

**代价**：`header.html` 重写约 10 行 + `hugo.toml` 一段配置。风险是**站点和主题要同时改**（主题改了导航逻辑，站点必须补 `[menus]`，否则导航空白）——这两件事必须同一次提交，不能只推主题。

**验证**：构建后头栏三个链接仍在、顺序正确；再加一个 `[[menus.main]]` 试一次，确认不用改模板就能出现。

---

## 2. i18n 补齐

**现状**：`i18n/zh-cn.yaml` 定义了 15 条，**闲置 6 条**：`tag`、`posts.other`、`newer`、`older`、`copy`、`copied`。同时大量界面文案**硬编码中文**：

| 位置 | 硬编码文案 |
|---|---|
| `layouts/single.html:57,60` | 「上一篇」「下一篇」——`newer`/`older` 两条 key 就摆着没用 |
| `layouts/partials/header.html` | 「外观」「背景」「点缀色」「分隔线」 |
| `layouts/home.html` | 「向下翻阅」「近期文章」 |
| `layouts/single.html:19` | 「撰于」 |
| 分类/标签 partials | 「篇」「只」「枚」等量词 |
| `layouts/_markup/render-heading.html` | `aria-label="跳转到此节"` |

**为什么要修**：
- **闲置的 key 是坏味道**：`copy`/`copied` 定义了，`site.js` 里却写死 `var COPY = '复制'`——将来改文案要改两个地方，且改错一个就静默不一致
- **多语言是单向门**：现在只配了 `zh-cn`（`hugo.toml` 只有 `defaultContentLanguage`，没有 `[languages]`）。**硬编码的每一处，都是将来加繁体/英文版时的返工点**。补 i18n 的成本随硬编码处数线性增长，越晚做越贵
- 即使永远不出第二语言，**集中管理文案**本身也有价值

**怎么修**：
- 先把硬编码文案抽成 key（`header.appearance` / `single.postedAt` / `home.recent` / `home.scrollHint` …），补进 `i18n/zh-cn.yaml`
- 把 `site.js` 里的 `COPY`/`COPIED` 改成从 `<html data-*>` 或内联脚本读 i18n 值（JS 拿不到 Hugo 的 i18n，得由模板传进去）
- 把闲置的 `newer`/`older` 接到上下篇，`copy`/`copied` 接到复制按钮，`tag`/`posts.other` 接到标签页

**代价**：约 25 处模板改动 + `i18n/zh-cn.yaml` 扩到 30 条左右。风险低（纯字符串替换），但**面广**，容易漏——建议用 `grep` 找中文字符串逐条清点，而不是靠记忆。

**验证**：`grep -rn '[一-龥]' layouts/` 里**只剩注释和示例**，不再有界面文案；界面显示不变。

---

## 3. 搜索索引（**已升级为 Pagefind**，2026-09-09）

> **2026-09-09 升级为 Pagefind**：旧子串引擎（`home.json → /index.json`）已废弃删除。实现约定见 `../CLAUDE.md`「站内搜索」条；下方表格是当时（2026-09-08）的选型记录。

**现状**：头栏放大镜 → 素纸面板，引擎 = **Pagefind**（中文分词原生）。索引由构建后的一步 `npx pagefind --site public` 生成 `/pagefind/`；`site.js` 在打开/输入时才懒加载 `pagefind.js`。正文只在 `single.html` 的 `<article>` 标 `data-pagefind-body`（显式模式，首页/归档/分类等不入索引）；结果要显示的日期在 `<time>` 上标 `data-pagefind-meta="date[datetime]"`。

**已验证（2026-09-09）**：示例站 `hugo` 构建 + `npx pagefind` 索引成功；每篇文章 HTML 含 `data-pagefind-body`、首页不含（不入索引）；`data-pagefind-index` 子路径部署为 `/demo/pagefind/pagefind.js`；没生成索引时面板提示「索引未生成」。

### 当时的选型对比（2026-09-09 已落地为 Pagefind，下表留档）

| 方案 | 中文分词 | 索引 | UI | 代价 |
|---|---|---|---|---|
| **Pagefind** | ✅ **原生**（扩展版按词切分：`每個月都` → `每個`/`月`/`都`；查询侧走 `Intl.Segmenter`） | 构建后索引 HTML，**分片**（每次查询只拉 10–30KB） | 自带 Component UI（模态框、无障碍） | 多一个构建步骤 |
| **FlexSearch** | ⚠️ 要自己写 CJK 分词器（bigram）；**默认分词器不认中文** | 自建 JSON | 无，自己写 | 自己实现分词 + 排序 + 高亮 |
| **Orama** | ⚠️ `@orama/tokenizers` 有中文分词器，标注 experimental | 自建 | 无 | 同上 |
| **MiniSearch / Fuse** | ❌ 默认按空格切，中文基本不可用 | 自建 | 无 | 自己写分词器 |

**升级首选 Pagefind**，理由只有一条：中文分词是自己造不出来的那块。它的索引从**构建后的 HTML** 抓，所以目录式标记、`data-pagefind-ignore` 排除项都能精确控制；`<html lang="zh-cn">` 正好命中它多语言机制的 `zh-` 前缀。

**当时列的 Pagefind 三个代价**（落地后的处置）：
1. **多一个构建步骤**：`hugo` 之后跑 `npx pagefind --site public`。`hugo server` 看不到搜索结果，本地得 `hugo --gc && npx pagefind --site public && npx serve public` 才验得了。
2. **UI 是别人的**：能靠 CSS 变量调成宣纸色，但等于在别人的设计上刷漆，不如现在这块面板原生。要 100% 原生 UI 就只剩 FlexSearch 那条自写分词的路。
3. **定位要改**：不管选哪个，主题「零第三方**运行时**依赖」都得改写成「零第三方**网络**依赖（全部自托管、随仓库走）」。KaTeX 已经是这个先例。

---

## 备查（未勾选，先记着）

| 条目 | 一句话说明 |
|---|---|
| **相关文章 `.Related`** | Hugo 内置按关键词/日期算相关度（`hugo config` 里的 `[related] threshold = 80` 是 Hugo 默认值，站点 `hugo.toml` 没写过）。文末加「延伸阅读」能显著提升停留时长；不做的代价是每篇文章都是"死胡同" |
| **`lastmod` / `enableGitInfo`** | 现在只显示发布日期（`single.html:19`），改过的文章看不出来。开 `enableGitInfo` 后 `.Lastmod` 取自 Git 提交时间，适合"长期维护的技术文"。注意：**它会让每次 commit 都改变页面**，对缓存不友好 |
| **面包屑** | 文章页没有"首页 › 分类 › 文章"的路径。可以用 `BreadcrumbList` JSON-LD 一并做（见 `../archive/01-seo-and-distribution.md` 第 4 条） |
| **series 分类法** | 连载型内容（如"从零搭一个博客"）用 `series` 比 tags 更合适——Hugo 加一行 `[taxonomies]` 即可，但需要配套模板 |
| **作者页** | 单作者站用不上；将来多人写才需要 |

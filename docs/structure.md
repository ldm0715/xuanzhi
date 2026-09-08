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

## 3. 搜索索引

**现状**：站内**没有任何搜索**。`hugo.toml` 没配 `outputs`，构建产物里 `find public -name "*.json"` 只有字体的 `reporter.json`。

**为什么要修**：
- 文章一多，**归档页靠翻页找文章**就不好用了
- 纯静态站的搜索有成熟做法（构建期出 JSON 索引 + 前端检索），**不需要任何后端或第三方服务**——正好符合主题「零第三方运行时依赖」的定位

**怎么修**：
- `hugo.toml` 的 `[outputs]` 给 `home` 加 `json`
- 新增 `layouts/home.json`（或 `layouts/index.json`），输出形如 `[{title, permalink, date, tags, content}]` 的数组——**`content` 用 `.Plain` 截断**（比如前 2000 字），别塞整篇，否则索引文件几 MB
- `assets/js/site.js` 加一段：打开搜索面板 → `fetch` 索引 → 简单子串匹配（中文不需要分词，子串匹配足够）→ 高亮命中的标题
- 入口放在头栏（和外观面板同一排），样式复用 `.appearance-panel` 那套开合语言
- 页面多起来再考虑**按需分片**（每 200 篇一个 JSON），先别过度设计

**代价**：新增一个 JSON 模板（约 20 行）+ `site.js` 约 80 行 + CSS 约 30 行 + 头栏按钮。风险是索引文件大小——**文章过千后要分片**，一开始不用管。

**验证**：`hugo` 后 `ls public/index.json` 存在且体积合理；前端搜一个只在某篇文章里出现的词，应能定位到那篇。

---

## 备查（未勾选，先记着）

| 条目 | 一句话说明 |
|---|---|
| **相关文章 `.Related`** | Hugo 内置按关键词/日期算相关度（`hugo config` 里的 `[related] threshold = 80` 是 Hugo 默认值，站点 `hugo.toml` 没写过）。文末加「延伸阅读」能显著提升停留时长；不做的代价是每篇文章都是"死胡同" |
| **`lastmod` / `enableGitInfo`** | 现在只显示发布日期（`single.html:19`），改过的文章看不出来。开 `enableGitInfo` 后 `.Lastmod` 取自 Git 提交时间，适合"长期维护的技术文"。注意：**它会让每次 commit 都改变页面**，对缓存不友好 |
| **面包屑** | 文章页没有"首页 › 分类 › 文章"的路径。可以用 `BreadcrumbList` JSON-LD 一并做（见 `seo-and-distribution.md` 第 4 条） |
| **series 分类法** | 连载型内容（如"从零搭一个博客"）用 `series` 比 tags 更合适——Hugo 加一行 `[taxonomies]` 即可，但需要配套模板 |
| **作者页** | 单作者站用不上；将来多人写才需要 |

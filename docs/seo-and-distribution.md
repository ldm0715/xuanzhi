# P1 · 分发与 SEO

七条。共同点是：**站内看着都正常，损失发生在站外**——搜索引擎、社交平台、RSS 阅读器。这类问题自己浏览时永远发现不了，所以值得单独记一笔。

---

## 1. 完全没有 `robots.txt`

**现状**：`hugo.toml` 没设 `enableRobotsTXT`，主题也没有 `layouts/robots.txt`。构建产物 `public/` 里没有这个文件（`ls public/robots.txt` → 不存在）。sitemap 倒是 Hugo 默认生成了（`public/sitemap.xml`）。

**为什么要修**：爬虫进站第一件事就是找 `/robots.txt`。没有它，抓取行为全凭各家默认策略——而 sitemap 也不会被主动发现（现在只能靠搜索引擎自己猜）。对纯静态站来说这是最便宜的一环：一个文件、一次配置。

**怎么修**：站点 `hugo.toml` 加 `enableRobotsTXT = true`；主题加 `layouts/robots.txt`，内容形如：

```
User-agent: *
Allow: /

Sitemap: {{ "sitemap.xml" | absURL }}
```

（`absURL` 是必须的，robots.txt 里的 sitemap 必须写绝对地址。）

**代价**：约 5 行。唯一要注意的是草稿/未来日期页面——Hugo 默认不渲染，所以 robots.txt 不需要额外排除逻辑。

**验证**：`hugo` 构建后 `ls public/robots.txt`，`cat` 看 sitemap 那行是不是完整绝对 URL。

---

## 2. 没有 `og:image`

**现状**：`layouts/partials/head.html` 的 OG 区块只有 `og:title` / `og:type` / `og:url` / `og:description`，没有 `og:image`。全站构建产物 `grep -c "og:image"` → 0。

**为什么要修**：微信、微博、X、Telegram、Slack 分享卡片**有没有图，点击率差得很明显**——无图时平台只给一行标题，几乎没人点。这是分发环节投入产出比最高的一条。

主题其实已经有现成的图源：front matter 的 `cover`（`layouts/partials/post-card-cover.html` 已在读），以及首页卡片那套按标题哈希生成的八式水墨小品。

**怎么修**：
- 文章页：`.Params.cover` 有值就经 Hugo 图片管线裁成 **1200×630** 的 WebP 输出 `og:image`（`fill 1200x630` 保证是标准 OG 比例，别直接给原图，平台裁切位置不可控）
- 没有 `cover` 的文章：回落到站点默认图
- 站点默认图需要**新增**一张：`static/images/og-default.png`（1200×630，宣纸底 + 站名印章即可）

注意首页卡片那套水墨小品是**内联 SVG**，不能直接当 `og:image`——SVG 在多数平台不被接受，且需要栅格化。所以默认图要单独出一张位图。

**代价**：`head.html` 约 10 行；新增一张静态图。风险是图片处理会增加构建时间（可接受，一篇文章一张）。

**验证**：构建后 `grep -o '<meta property="og:image"[^>]*>' public/posts/*/index.html`；再丢进任一平台的调试工具（或 https://opengraph.dev ）看抓取结果。

---

## 3. OG 其余字段缺失

**现状**：只有 `og:title` / `og:type` / `og:url` / `og:description`。缺 `og:site_name`、`og:locale`、`article:published_time`、`article:section`、`article:tag`。

**为什么要修**：
- `og:site_name` —— 卡片上会显示站名，现在这个位置是空的
- `og:locale` —— 站点是 `zh-cn`，不声明的话平台可能按英文处理
- `article:published_time` —— 时间轴上排期/排序用；新闻类聚合尤其在意
- `article:section` / `article:tag` —— 分类聚合的入口

**怎么修**：`head.html` 里 `.IsPage` 分支补这几条。`article:tag` 要 `range .GetTerms "tags"` 逐条输出。

Hugo 有内置 `_internal/opengraph.html` 可一步到位，但主题现在是手写版、且手写版能精确控制 `og:type` 与描述裁剪——**建议继续手写**，只把缺的字段补上（用内置模板会覆盖掉已调好的描述逻辑）。

**代价**：约 10 行。

**验证**：构建后 `grep 'og:site_name\|og:locale\|article:published_time' public/posts/*/index.html`。

---

## 4. 没有 JSON-LD 结构化数据

**现状**：全站构建产物 `grep -c "application/ld+json"` → 0。主题仓库里 `grep schema.org` → 0。

**为什么要修**：搜索引擎靠结构化数据判断"这是一篇文章还是导航页"，也是富摘要（作者、发布时间、面包屑）的前提。不声明不会掉排名，但会**失去一切增强展示机会**，属于"不做没损失、做了有增益"的一类。

**怎么修**：在 `head.html` 末尾按页面类型输出：
- 文章页 → `BlogPosting`（headline / datePublished / author / image / description）
- 首页 → `WebSite`（name / url / potentialAction SearchAction，接搜索后才有意义）
- 列表/分类页 → 可选 `CollectionPage`

Hugo 内置 `_internal/schema.html` 只做 `BlogPosting`，字段固定；若要加 `BreadcrumbList` 得手写。**建议手写一个 partial**，字段可控。

注意：JSON-LD 必须放在 `<script type="application/ld+json">` 里且**内容要是合法 JSON**——Go 模板里用 `jsonify` 或 `transform.Remarshal` 生成，别手工拼字符串。

**代价**：新增一个 partial，约 30 行。

**验证**：构建后把页面丢进 Google Rich Results Test 或 https://validator.schema.org 。

---

## 5. RSS 走 Hugo 内置模板

**现状**：主题没有 `layouts/rss.xml`，用的是 Hugo 内置 RSS。产物 `public/index.xml` 的 `<description>` 里塞的是**整篇 HTML 原文**——含内联 SVG（标题的毛笔圈点）、`<defs>`、`<filter>`。

**为什么要修**：
- 阅读器里渲染**错乱**：那些内联 SVG 是为页面上下文设计的，在阅读器里变成一堆乱码般的图形
- 体积膨胀：一篇文章的 description 动辄几十 KB
- 缺 `<content:encoded>`：很多阅读器优先读它，没有就只能读被转义的 description

**怎么修**：主题加 `layouts/rss.xml`（Hugo 0.146+ 顶层；老版本是 `layouts/_markup` 之外的 `layouts/_default/rss.xml`），要点：
- `<description>` 用 `.Summary | plainify` 或截断后的纯文本
- 完整正文放 `<content:encoded>`（需要声明 `xmlns:content` 命名空间）
- 保留 Hugo 内置模板的 `<atom:link rel="self">` 和 `<lastBuildDate>`

**代价**：约 40 行模板。风险是 RSS 格式细节多，容易漏字段——建议直接以 Hugo 内置模板为底本改，别从零写。

**验证**：`hugo` 后把 `public/index.xml` 丢进 https://validator.w3.org/feed/ ；再订阅进任一阅读器看排版。

---

## 6. 单页缺 RSS alternate 链接

**现状**：`head.html` 里是 `{{ with .OutputFormats.Get "rss" }}`——对普通文章页这个查询是 **nil**（Hugo 默认只给 home/section/taxonomy/term 配 RSS 输出），所以文章页的 `<head>` 里没有 `<link rel="alternate" type="application/rss+xml">`。

**为什么要修**：读者在文章页点"订阅"，浏览器的订阅功能依赖这个 link 发现 feed。缺了就只能订阅失败，或者错误地订阅到别处。

**怎么修**：改成查站点首页的 RSS，而不是当前页：

```go-html-template
{{ with site.Home.OutputFormats.Get "rss" }}
<link rel="alternate" type="{{ .MediaType.Type }}" href="{{ .Permalink }}" title="{{ site.Title }}">
{{ end }}
```

**代价**：1 行改动。**注意别在 404 页也输出**——`.IsHome`/`.IsPage` 判断一下更稳。

**验证**：`grep 'application/rss' public/posts/hello-xuanzhi/index.html`。

---

## 7. `twitter:card` 用的是 `summary`

**现状**：`head.html` 里写死 `<meta name="twitter:card" content="summary">`。

**为什么要修**：`summary` 是小方图卡片，`summary_large_image` 是通栏大图。**这条依赖第 2 条**——现在没有 `og:image`，改成大图卡片反而会因为缺图而显示成空白框。所以顺序是：先做 `og:image`，再改这一条。

**怎么修**：`head.html` 里当 `og:image` 有值时输出 `summary_large_image`，否则保持 `summary`。用同一个变量判断，别两处各写一遍。

**代价**：2 行。

**验证**：与第 2 条一起验——卡片调试工具里看预览。

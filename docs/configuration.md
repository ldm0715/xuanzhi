---
title: "三、站点配置"
date: 2026-09-10T10:00:00+08:00
weight: 30
description: "hugo.toml 逐项：哪一行管什么功能，不配会怎样"
tags:
  - 配置
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- [二、安装与升级](installation.md)
- **三、站点配置**（当前篇）
- [四、写作](writing/index.md)
- [五、短代码参考](shortcodes.md)
- [六、自定义](customization.md)
- [七、部署](deployment.md)
- [八、常见问题](troubleshooting.md)
- [九、设计理念](design.md)
- [十、许可](licenses.md)
{{< /details >}}

主题有一批功能是**模板在主题、开关在站点**——不配就是没有。这一篇把 `hugo.toml` 里所有要写的东西列全，按「不配会怎样」排。

## 最小可用配置

先确认站点的 `hugo.toml` 至少有这三行：

```toml
baseURL = 'https://你的域名/'    # 末尾必须带 /
title = '站点名'
theme = 'xuanzhi'
```

能跑起来，但只有骨架。下面这些不补，主题的功能会**静默消失**——不报错，就是没有。

## 功能 → 配置 → 不配的后果

| 主题功能 | 需要的配置 | 不配会怎样 |
|---|---|---|
| `robots.txt` | `enableRobotsTXT = true` | 主题的 `layouts/robots.txt` **不生成**，构建产物里没有这个文件 |
| emoji 短代码 | `enableEmoji = true`（**顶层**） | `:+1:` 原样输出。写进 `[markup.goldmark.extensions]` 不报错但静默失效 |
| 代码高亮跟随明暗 | `markup.highlight.noClasses = false` | 用 Hugo 的内联样式，切明暗时代码块不跟随 |
| 标题自定义锚点 `{#id}` | `markup.goldmark.parser.attribute.block = true` | 锚点语法被当字面文本渲染出来 |
| 公式**构建期**渲染 | `markup.goldmark.extensions.passthrough.enable = true` + delimiters | 公式不被识别，页面上是原始 LaTeX（客户端渲染已移除，没有回落） |
| 正文手写 HTML | `markup.goldmark.renderer.unsafe = true` | `<mark>` / `<kbd>` / `<figure>` / 语义标签被转义成文本 |
| 头栏菜单 | `[[menus.main]]` | **退回自动导航**（主内容段 + 分类法页）——不是坏，但加页面就得改模板 |
| 关于页 | `content/about.md` 里写 `layout = "about"` + `frame = "narrow"`，再往 `[[menus.main]]` 加一条入口 | 不写 `layout` 就落到普通文章模板（带日期、字数、上下篇导航）；不写 `frame` 头栏页脚会展开到 1150px、比 800px 的正文宽出一截；不写菜单条目则建了也不出现在头栏 |
| 首页卡片与 RSS 收哪些栏目 | `params.mainSections = ['posts']` | Hugo 会自己挑**页数最多的顶层栏目**。站点里有一个页数比文章多的栏目（文档、笔记、周刊…）时，首页卡片会被它占满，你的文章一篇都上不去。见下方「首页卡片为什么全是文档」 |
| 站内搜索（Pagefind） | 构建后跑一步 `npx pagefind --site public` | 没跑这步时，面板提示「索引未生成」。详见[部署](deployment.md#站内搜索) |
| 绝对地址正确 | `baseURL`（末尾带 `/`） | sitemap / canonical / og:url / og:image / JSON-LD / RSS 全指向 `example.org` |
| 首页欢迎语 | `params.hero.greeting` | 用主题默认（i18n 的 `greeting`） |
| 默认点缀色 | `params.accent` | `terracotta`（访客仍可在外观面板自行切换） |
| JSON-LD 作者 | `params.author` | 回落成站点 `title` |
| 站点描述（meta description） | `params.description`（站点级兜底）；单篇可用 front matter `description` 优先 | 单篇没写描述时，`<meta name="description">` 用该页自动摘要（压平到 160 字）；站点级兜底缺失 |

> 不走 `hugo.toml` 的自定义还有两处——**界面文案**和**头栏图标按钮**，改的是站点仓库里的文件，见[自定义](customization.md)。

## 复制粘贴

一份完整可用的样板。**改成你自己的域名、站名、作者，其余照抄**：

```toml
baseURL = 'https://你的域名/'
title = '站点名'
theme = 'xuanzhi'

enableRobotsTXT = true
enableEmoji = true

[markup]
  [markup.highlight]
    noClasses = false
  [markup.tableOfContents]
    startLevel = 2
    endLevel = 4
  [markup.goldmark.parser]
    attribute.block = true
  [markup.goldmark.extensions.passthrough]
    enable = true
    [markup.goldmark.extensions.passthrough.delimiters]
      inline = [['\(', '\)']]
      block = [['\[', '\]'], ['$$', '$$']]
  [markup.goldmark.renderer]
    unsafe = true

[params]
  accent = 'terracotta'   # terracotta（陶土橘）/ indigo（黛青）
  author = '你的名字'      # 可省；省略则回落成站点 title
  description = '一句话介绍你的博客'   # 可省；站点级 meta description 兜底
  mainSections = ['posts']   # 首页卡片与 RSS 只收这个栏目，理由见下
  [params.hero]
    greeting = '一纸短笺，见字如面'

# 头栏导航：加页面只改这里，不用动模板
[[menus.main]]
  name = '归档'
  pageRef = '/posts'
  weight = 10
[[menus.main]]
  name = '分类'
  pageRef = '/categories'
  weight = 20
[[menus.main]]
  name = '标签'
  pageRef = '/tags'
  weight = 30
[[menus.main]]
  name = '关于'
  pageRef = '/about'
  weight = 40      # 需要先有 content/about.md；页面配置见短代码参考「关于页的四颗短代码」
```

> **TOML 有两个地方特别容易写错**：
> ① `passthrough` 的键是 **`enable`**，写成 `enabled` 不报错但静默失效；
> ② `enableEmoji` 是**顶层**键，塞进 `[markup.goldmark.extensions]` 里同样不报错、同样静默失效。
> 另外 TOML 里 `[table]` 一旦开始，后面的键就全归它了——所以**带 `[params]`、`[module]` 这类段的东西一律写在文件末尾**。

## 首页卡片与 RSS 收哪些栏目

首页卡片和 RSS 收的是 `site.MainSections` 里的页面。而 Hugo 在**没有显式配置**时的规则是：`MainSections` = **页数最多的那（几）个顶层栏目**。

平时这没问题——站点里只有一个文章栏目，它就是页数最多的。但只要多出一个页数更多的栏目（文档、笔记、周刊、手记…），首页立刻被它占满，你的文章一篇都上不去，而且**不报任何错**。

修法是一行，写在 `[params]` 里：

```toml
[params]
  mainSections = ['posts']     # 你的文章放在哪个栏目就写哪个
```

> 这一行同时会改掉**没配菜单时**的自动导航兜底（`nav-links.html` 也读 `site.MainSections`）。配了 `[[menus.main]]` 的站点不受影响。
>
> 演示站的 `exampleSite/hugo.toml` 里也配了这行，注释讲清了来龙去脉，可对着看。

## 页面级开关（不写在 hugo.toml）

有些开关属于**某一页**，写在那一页的 front matter 上，站点级配置管不着：

| 写在哪 | 字段 | 作用 |
|---|---|---|
| `content/about.md` | `layout: "about"` | 用关于页模板，而不是文章模板 |
| 任意页 | `frame: "narrow"` | 把这一页的框架收窄到版心宽（否则走文章页的 1150px 宽档） |
| 任意页 | `cover: "assets/cover.jpg"` | 首页卡片右下角的印记换成自己的图，同时作为分享卡片的 `og:image` |
| 任意页 | `description: "…"` | 覆盖该页的 meta description；没写时首页卡片用正文摘要 |

哪些是站点级、哪些是页面级，上面那张表和[写作](writing/index.md)分头写清楚了。

## 不用配（Hugo 默认已开，主题直接吃）

`definitionList`（定义列表）、`footnote`（脚注）、`table`、`taskList`、`strikethrough`、`linkify` —— 这些不写进 `hugo.toml` 也生效。

## 媒体短代码也不用配

`video` / `audio` / `playlist` 三个短代码开箱即用，**没有开关**。两个播放器库（Plyr 管视频、APlayer 管音频）由 `head.html` 按 `.HasShortcode` 判断，**只有嵌了媒体的页面才加载**——不放媒体的站点不会为此多背 200 多 KB，其余页面的资源体积与从前一致。

需要你自备的是素材本身：

- **媒体文件**放 `static/media/` 或任何站内路径（写 `/media/x.flac` 或 `media/x.flac` 都行，会过 `relURL` 归一化；`http(s)://` 开头的外链原样放行）
- **歌词**是标准 `.lrc`，与音频放一起即可
- **封面要单独给一张图**——Hugo 读不了音频文件里内嵌的元数据，`cover=` 必须显式写。很多音频自带封面，抽出来就行：`ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg`

写法与参数见[短代码参考](shortcodes.md)。

## 另一个容易踩的：`public/` 里的地址

**`public/` 里看到的 URL 依赖 `baseURL`。** 开发服务器运行时 Hugo 会把 baseURL 覆盖成 `http://localhost:1313/`，所以**别在 `hugo server` 开着的时候去 `public/` 检查绝对地址**——那会儿看什么都是 localhost。跑一次 `hugo` 再看。

## 一些值得知道的行为

- 手机端（≤640px）头栏只留 **☰ · 站名 · 明暗按钮**：导航链接、搜索、外观都收进 ☰ 下拉面板（面板里可滚动，矮屏也不会被截断）。桌面端不受影响，两个浮层面板照旧
- **文章页**的头栏站名随滚动切换：正文标题滚过头栏之后，站名那一格换成文章标题（长标题也不会挤走导航，换的是同一格里那段文字）；滚回顶部换回站名。首页、归档、分类法页、关于页没有这个行为。窄屏切换态居中，与站名的位置对齐
- 页脚的 RSS 入口是一枚图标（带 `aria-label`），只在站点启用了 RSS 输出时出现
- 站内搜索**两个搜索框共用一个 Pagefind 实例**：桌面浮层面板一个、手机 ☰ 面板一个，谁先输入谁触发一次索引加载，不重复初始化
- 明暗模式：访客首次进入跟随系统偏好，点页头按钮手动切换后记忆在 localStorage（键 `xuanzhi-theme`）
- 外观面板的选择也存 localStorage（键前缀 `xuanzhi-`）；不选时回落 `params.accent` 与默认格纹
- 站名首字会渲染成页脚的印章与文章工具栏的朱印，改 `title` 即生效
- 文章页那枚朱印同时是**阅读进度印**：收起时外圈方框随进度填充，展开后末位一格显示已读百分比。它按 `.post-content`（正文）计，不含页脚与上下篇
- **标签最多显示 4 枚**（文章页的落款行与首页卡片的落款行都是），超出的收成一枚 `+N`：文章页那枚是链接，指向 `/tags/` 印谱墙；卡片那枚是纯文字——整张卡已经是链接，里面不能再套。上限写在 `layouts/single.html` 与 `layouts/partials/post-card.html` 各一处，**改要两处同改**；那枚签的悬停提示与读屏名走 i18n `moreTags`
- 首页的分页链接带 `#recent` 锚点：翻页后直接落到「近期文章」，而不是停在整屏诗笺上再往下滑。锚点的 `scroll-margin-top` 已让开吸顶头栏。**注意**：若那一页的内容短到不足以滚到锚点（例如只余两三篇），浏览器会停在能滚到的最大位置——锚点没写错，是页面不够长

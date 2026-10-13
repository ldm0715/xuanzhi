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
- [四、内容组织](structure.md)
- [五、写作](writing/index.md)
- [六、短代码参考](shortcodes.md)
- [七、自定义](customization.md)
- [八、部署](deployment.md)
- [九、常见问题](troubleshooting.md)
- [十、设计理念](design.md)
- [十一、许可](licenses.md)
- [十二、评论](comments.md)
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
| 评论（Waline） | `params.comments.serverURL`（填你自己部署的服务端地址） | 整块不出现，客户端脚本也不下载——首屏与从前完全一致。**服务端要自己部署**，见下方「评论（Waline）」 |

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

> 这一行同时会改掉**没配菜单时**的自动导航兜底（`layouts/partials/nav-links.html` 也读 `site.MainSections`）。配了 `[[menus.main]]` 的站点不受影响。
>
> 演示站的 `exampleSite/hugo.toml` 里也配了这行，注释讲清了来龙去脉，可对着看。

## 页面级开关（不写在 hugo.toml）

有些开关属于**某一页**，写在那一页的 front matter 上，站点级配置管不着：

| 写在哪 | 字段 | 作用 |
|---|---|---|
| `content/about.md` | `layout: "about"` | 用关于页模板，而不是文章模板 |
| 任意页 | `frame: "narrow"` | 把这一页的框架收窄到版心宽（否则走文章页的 1150px 宽档） |
| 任意页 | `description: "…"` | 该页的一句话简介：首页卡片、RSS、meta description 都用它；前两者在没写时回落正文开头 |
| 任意页 | `comments: false` | 这一页不显示评论区（站点配了 Waline 时才有意义） |

哪些是站点级、哪些是页面级，上面那张表和[写作](writing/index.md)分头写清楚了。

## 不用配（Hugo 默认已开，主题直接吃）

`definitionList`（定义列表）、`footnote`（脚注）、`table`、`taskList`、`strikethrough`、`linkify` —— 这些不写进 `hugo.toml` 也生效。

## 媒体短代码也不用配

`video` / `audio` / `playlist` 三个短代码开箱即用，**没有开关**。两个播放器库（Plyr 管视频、APlayer 管音频）由 `layouts/partials/head.html` 按 `.HasShortcode` 判断，**只有嵌了媒体的页面才加载**——不放媒体的站点不会为此多背 200 多 KB，其余页面的资源体积与从前一致。

需要你自备的是素材本身：

- **媒体文件**放 `static/media/` 或任何站内路径（写 `/media/x.flac` 或 `media/x.flac` 都行，会过 `relURL` 归一化；`http(s)://` 开头的外链原样放行）
- **歌词**是标准 `.lrc`，与音频放一起即可
- **封面要单独给一张图**——Hugo 读不了音频文件里内嵌的元数据，`cover=` 必须显式写。很多音频自带封面，抽出来就行：`ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg`

写法与参数见[短代码参考](shortcodes.md)。

## 评论（Waline）：可选，不配就没有

> 这一节只管**配置项**。开启步骤、上游那个「非管理员点赞必然失败」的 bug、以及服务端该用哪个仓库，单独写在[十二、评论](comments.md)。

评论走 [Waline](https://waline.js.org/)——**服务端你自己部署**，客户端三个文件在主题的 `static/vendor/waline/`，不挂第三方 CDN。主题不带服务端，所以这一步得先做完，否则配了也没用。

### 一、先拿到服务端地址

Waline 官方推荐 Vercel，全程点按钮，见[部署文档](https://waline.js.org/guide/deploy/vercel.html)。大致是「用模板建项目 → 在 Vercel 的 Storage 里建数据库（选 Neon）→ 到 Neon 的 SQL Editor 跑一遍 [`waline.pgsql`](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql) 建表 → 回 Vercel 点一次 Redeploy」。

部署完，项目首页那个地址就是 `serverURL`；管理端在同地址的 `/ui`，第一次访问 `/ui/register` 注册的那个人会成为管理员。

### 二、填进 hugo.toml

```toml
[params.comments]
  serverURL = 'https://你的-waline.vercel.app'
```

这一行就够，全站文章页立刻都有评论区。

> **开关在「有没有 serverURL」上，不在某个 `enabled` 上。** 删掉这行、或把值留空，评论区连同客户端脚本一起消失——构建产物里一个字都没有，首屏也不受任何影响。

### 三、某一页不想开

那一页的 front matter 写一行：

```yaml
comments: false
```

### 四、可选配置

下面这些都有默认值，按需写：

| 键 | 默认 | 说明 |
|---|---|---|
| `lang` | `zh-CN` | 也可 `zh-TW`。只影响**没被 i18n 覆写**的那部分文案 |
| `login` | `enable` | `enable` / `disable`（只能填信息，不能注册登录）/ `force`（必须登录） |
| `pageSize` | `10` | 每页评论条数 |
| `commentSorting` | `latest` | `latest` / `oldest` / `hottest` |
| `requiredMeta` | `[]` | 必填项，如 `['nick']` 或 `['nick', 'mail']` |
| `meta` | `['nick', 'mail', 'link']` | 评论框显示哪几个字段 |
| `wordLimit` | `0` | 字数上限，`0` 为不限 |
| `reaction` | `false` | 文章表情互动 |
| `noCopyright` | `false` | 隐藏 Waline 的页脚版权行。**建议留着**，支持一下这个项目 |
| `emoji` | `false` | 表情包，见下 |

其余 Waline 选项照它的[组件属性文档](https://waline.js.org/reference/client/props.html)写，键名用文档里的 camelCase 拼法即可。

> **`emoji` 为什么默认关掉。** Waline 自带的默认值是去 unpkg 拉微博表情包——主题自托管了所有资产，唯一的对外请求是首页诗笺，凭空多一条第三方 CDN 请求不划算。想开就自己填地址（`emoji = ['https://unpkg.com/@waline/emojis@1.1.0/weibo']`），或指向自托管的图库。

> **新增多词选项要动模板。** Hugo 会把 `params` 的键**一律小写化**，`pageSize` 存进去就成了 `pagesize`，Waline 一个都不认——而且是静默失效，评论区像没配一样空着，构建不报任何错。主题在 `layouts/partials/comments.html` 里用一张 `$alias` 表把多词的键还原回 camelCase（单词的不用，`lang` / `emoji` / `login` / `meta` / `reaction` 小写后本来就是对的）。**要加的多词选项不在表里，就去那张表补一行**，否则配了等于没配。

### 界面文案

在站点自己的 `i18n/zh-cn.yaml` 里覆写，key 是「评论（Waline）」那一组（`commentsTitle`、`commentPlaceholder`、`commentSofa`、`commentSubmit`…），和主题其余文案同一条路。没被覆写的部分（错误提示、读屏专用标签、用户等级名）仍走 `lang` 的内置中文。

### 客户端不是首屏加载的

`waline.umd.js` 有 275KB。评论区在文章最底部，所以主题**滚到视口前 400px 才注入**样式与脚本——滚到那儿的人本来就是想看评论的人，所以这里不加点击门槛，只延迟下载，首屏完全不受影响。

> 试过更狠的一版：默认折叠、点标题那行才加载。撤了——给每个想看评论的人加一次点击，换来的只是省掉一次他本来就要发的请求，不划算。滚到跟前再加载已经把两头都占上了。

加载失败时（断网、地址写错、被网络环境拦掉）静默留白，不报错、也不挡页面其余部分。

### 头像：QQ 头像开箱可用

不用写代码。Waline 服务端默认的头像规则就是这样：

| 评论者填的 | 头像取自 |
|---|---|
| 昵称是**纯数字** | QQ 头像（把昵称当 QQ 号） |
| 邮箱是 `<QQ号>@qq.com` | QQ 头像 |
| 其余 | Gravatar / Libravatar |

所以读者在「邮箱」里填 `你的QQ号@qq.com`，头像自动就是 QQ 头像。主题把这个约定提示在**正文框的占位文字**里（i18n 的 `commentPlaceholder`），邮箱那一格仍旧只写「邮箱」——挤在下拉框里既不好看，也容易被当成「必须这么填」。两个 key 都在站点自己的 `i18n/zh-cn.yaml` 里覆盖。

要换整套规则是服务端的事：`@waline/vercel` 读环境变量 `GRAVATAR_STR`，值是一段 nunjucks 模板（可用的过滤器有 `md5`、`sha256`，变量就是评论的 `nick` / `mail`）。

配色怎么改见[自定义](customization.md#改评论区配色)。

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
- **文章页落款行：标签最多 4 枚**，超出的收成一枚 `+N`（是链接，指向 `/tags/` 印谱墙）。上限写在 `layouts/single.html`；那枚签的悬停提示与读屏名走 i18n `moreTags`
- **首页卡片落款行**：分类只出第 1 枚；标签按落款行的实际宽度动态取舍，放不下的收成一枚纯文字 `+N`——整张卡已经是链接，里面不能再套
- 首页的分页链接带 `#recent` 锚点：翻页后直接落到「近期文章」，而不是停在整屏诗笺上再往下滑。锚点的 `scroll-margin-top` 已让开吸顶头栏。**注意**：若那一页的内容短到不足以滚到锚点（例如只余两三篇），浏览器会停在能滚到的最大位置——锚点没写错，是页面不够长

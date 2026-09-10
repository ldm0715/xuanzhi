# 站点配置（hugo.toml）

主题有一批功能是**模板在主题、开关在站点**——不配就是没有。下面是全清单，按「不配会怎样」排。

## 功能 → 需要的配置 → 不配的后果

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
| 站内搜索（Pagefind） | 构建后跑一步 `npx pagefind --site public`（见下文「能力与边界」） | 没跑这步时，面板提示「索引未生成」 |
| 绝对地址正确 | `baseURL`（末尾带 `/`） | sitemap / canonical / og:url / og:image / JSON-LD / RSS 全指向 `example.org` |
| 首页欢迎语 | `params.hero.greeting` | 用主题默认（i18n 的 `greeting`） |
| 默认点缀色 | `params.accent` | `terracotta`（访客仍可在外观面板自行切换） |
| JSON-LD 作者 | `params.author` | 回落成站点 `title` |
| 站点描述（meta description） | `params.description`（站点级兜底）；单篇可用 front matter `description` 优先 | 单篇没写描述时，`<meta name="description">` 用该页自动摘要（压平到 160 字）；站点级兜底缺失 |

> 不走 `hugo.toml` 的自定义还有两处——**界面文案**和**头栏图标按钮**，改的是站点仓库里的文件，见 [customization.md](customization.md)。

## 复制粘贴

```toml
baseURL = 'https://你的域名/'
title = '站点名'
theme = 'xuanzhi'

enableRobotsTXT = true
enableEmoji = true

[markup]
  [markup.highlight]
    noClasses = false
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
  weight = 40      # 需要先有 content/about.md；页面配置见 writing.md「关于页」
```

> **页面级开关不走 `hugo.toml`。** 有些东西是写在**那一页的 front matter** 上的，
> 比如关于页的 `layout = "about"` 与 `frame = "narrow"`。哪些是站点级、哪些是页面级，
> 上面那张表和 [writing.md](writing.md) 分头写清楚了。

> `passthrough` 的键是 **`enable`**，写成 `enabled` 不报错但静默失效。
> 文章页的目录层级可用 `[markup.tableOfContents]` 的 `startLevel` / `endLevel` 调（示例站点用 2–4）。

## 不用配（Hugo 默认已开，主题直接吃）

`definitionList`（定义列表）、`footnote`（脚注）、`table`、`taskList`、`strikethrough`、`linkify` —— 这些不写进 `hugo.toml` 也生效。

## 媒体短代码也不用配

`video` / `audio` / `playlist` 三个短代码开箱即用，**没有开关**。两个播放器库（Plyr 管视频、APlayer 管音频）由 `head.html` 按 `.HasShortcode` 判断，**只有嵌了媒体的页面才加载**——不放媒体的站点不会为此多背 200 多 KB，其余页面的资源体积与从前一致。

需要你自备的是素材本身：

- **媒体文件**放 `static/media/` 或任何站内路径（写 `/media/x.flac` 或 `media/x.flac` 都行，会过 `relURL` 归一化；`http(s)://` 开头的外链原样放行）
- **歌词**是标准 `.lrc`，与音频放一起即可
- **封面要单独给一张图**——Hugo 读不了音频文件里内嵌的元数据，`cover=` 必须显式写。很多音频自带封面，抽出来就行：`ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg`

写法与参数见 [writing.md](writing.md)。

## 容易踩的

- **`public/` 里看到的 URL 依赖 `baseURL`**。开发服务器运行时 Hugo 会把 baseURL 覆盖成 `http://localhost:1314/`，所以别在 `hugo server` 开着的时候去 `public/` 检查绝对地址——那会儿看什么都是 localhost。跑一次 `hugo` 再看。

## 站内搜索：能力与边界

头栏放大镜 → 素纸面板的搜索由 **Pagefind** 驱动，**中文分词原生支持**（搜「排版设计」也能命中「排版与设计」）。注意：索引不是 Hugo 生成的，而是在构建**之后**单独跑一步 Pagefind：

```bash
hugo
npx pagefind --site public        # 在 public/ 里生成 pagefind/ 索引
```

这一步要由**你的构建 / 部署流程**执行（GitHub Actions 就在 `hugo` 之后加这一行），主题不会替你自动跑。两点要知道的：

- **本地 `hugo server` 预览时搜索不可用**——它不生成索引，面板会提示「索引未生成——发布前请运行 pagefind」。要看效果，本地按上面的命令先构建 + 索引，再用 `npx serve public` 之类的静态服务器打开。
- 子路径部署（如 GitHub Pages 项目站点）无需额外处理：`pagefind/` 目录随 `public/` 一起发布即可；主题读索引用 `relURL`、结果链接会带上站点前缀。

**GitHub Actions 示例**：在你的部署 workflow 里，`hugo` 构建之后、上传产物之前加这一步（按你的目录/分支改）：

```yaml
      - name: Hugo
        run: hugo --minify --baseURL "https://${{ github.repository_owner }}.github.io/<repo>/"

      - name: Pagefind index
        run: npx --yes pagefind@latest --site public
```

> 主题自带的演示站 workflow（`.github/workflows/demo.yml`）已经内置了这一步，可照着抄。

## 一些值得知道的行为

- 手机端（≤640px）头栏只留 **☰ · 站名 · 明暗按钮**：导航链接、搜索、外观都收进 ☰ 下拉面板（面板里可滚动，矮屏也不会被截断）。桌面端不受影响，两个浮层面板照旧
- 页脚的 RSS 入口是一枚图标（带 `aria-label`），只在站点启用了 RSS 输出时出现
- 站内搜索**两个搜索框共用一个 Pagefind 实例**：桌面浮层面板一个、手机 ☰ 面板一个，谁先输入谁触发一次索引加载，不重复初始化
- 明暗模式：访客首次进入跟随系统偏好，点页头按钮手动切换后记忆在 localStorage（键 `xuanzhi-theme`）
- 外观面板的选择也存 localStorage（键前缀 `xuanzhi-`）；不选时回落 `params.accent` 与默认格纹
- 站名首字会渲染成页脚的印章与文章工具栏的朱印，改 `title` 即生效
- 文章页那枚朱印同时是**阅读进度印**：收起时外圈方框随进度填充，展开后末位一格显示已读百分比。它按 `.post-content`（正文）计，不含页脚与上下篇

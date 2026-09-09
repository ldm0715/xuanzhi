# Xuanzhi 宣纸

暖纸底、稿纸格纹、霞鹜文楷、墨阶排版的极简中文博客主题（Hugo ≥ 0.146）。

- 亮色 = 宣纸：`#F7F3EB` 底 + 24px 稿纸格纹 + 墨阶四档文字
- 暗色 = 夜墨：`#282219` 底 + 纸色文字（跟随系统或手动切换，带防闪白）
- 明暗切换带**圆形揭示动画**（View Transitions API）：切暗色页面以按钮为圆心收缩，切亮色从按钮放出；圆心用百分比定位，浏览器缩放≠100% 依然对准按钮；不支持的浏览器或系统减弱动画时瞬时切换
- 点缀色双版并存，`hugo.toml` 一行切换，主页朱饰（信封框/邮戳/落款印）随点缀色换色：
  - `terracotta` 陶土橘 `#DA7756`（默认，朱砂装饰）
  - `indigo` 黛青 `#425066`（青印装饰）
- **外观面板**（导航栏调色板按钮）：**样张格**——每个选项一张大样张（占满格宽 × 44px）+ 下方小字标签，纹理按页面真实尺度铺（稿纸格 24px、信笺 48px 行距，不是缩小版）；选中项压一道朱砂细边、标签染朱；开合淡入并自上轻移 4px。选择存 localStorage
  - 背景 5 种：稿纸格（默认）/ 素纸 / 微噪点 / 噪点+暗角 / 稀疏信笺纹
  - 点缀色 2 种：陶土橘 / 黛青
  - 分隔线 4 种：一笔 / 断栏 / 墨点 / 飞白
  - 无记录时回落到 `hugo.toml` 的 `params.accent` 与默认格纹
- 首页两段式：诗笺欢迎区（诗泉 API 随机绝句、繁体竖排，构建期预取兜底；标题 ≤12 字、每句 ≤16 字才收，否则保留兜底）+ 双栏**红框封卡片**：素纸底 + 一道朱丝框，右上朱砂日期邮戳（悬停轻微「盖章」），右下角一枚**淡印**——八式水墨小品缩成 124×83、约 34% 不透明度 + 轻微模糊 + 径向羽化，如渗进纸里；下方题字式标题、灰褐摘要与落款行（分类 + 标签，细竖线分隔）；悬停整卡飘起带暖灰柔影
- 头栏宽度随页面类型过渡（窄 800px / 文章页 1150px），页面入场淡入，时长同曲线；**等首帧绘制完再起步**（动画时钟从样式计算就开跑、不等绘制，直接放开的话首屏那几百毫秒里动画已跑掉大半）
- **手机端头栏收起**（≤640px）：头栏只留 ☰ · 站名 · 明暗按钮，导航链接 / 搜索 / 外观收进 ☰ 下拉面板——面板从栏下缘整宽展开，导航三格横排，下面依次是搜索框与外观样张，矮屏时面板内可滚动。桌面端布局与两个浮层面板不受影响；想往头栏加自己的东西见「头栏自定义入口」
- 霞鹜文楷 GB 自托管切片字体（cn-font-split，按 unicode-range 按需加载，首屏只拉几十 KB）；标题走自托管**思源宋体 700** 切片（`--font-title` 宋体优先、无则落文楷）
- 文章页书卷排版：题跋折痕双线分割、落款式元数据（「撰于」引首章 + 朱砂界栏 + **分类的毛笔记号**——一撇，取传统评点的「抹」，粗起笔 + 细收锋 + 湍流毛边，配宋体墨色名 + 印章式标签）、文末**落款章**（站名四字印，逐字入格、按字数自动成阵，印泥飞白 mask）、线装书式上下篇翻页（悬停轻移 + 淡朱暖洇）
- 归档页「毛笔纪年·朱印领月」：细宋年份压淡朱小印、左侧垂竖排干支闲章（模板按年份推算，任何年份都对）；年份下压一道**折痕双细线**（与文章页题跋同款）；月份不再是浮在笺纸卡上的引首章，改成**行内一枚小朱印 + 汉字篇数**，月份之间全靠留白分开；文章行是传统目录式：日期居左、点线引导、题名贴右，悬停引导线染朱、题名右侧洇出朱砂短竖
- 分类页「通栏长架」：函套站在搁板上——搁板不是独立元素，用重复背景按行高画出来，函套折到第几层都自动有完整一条通栏长板（桌面 ≥800px 一排钉死 5 只、搁板两端出檐各留 72px 摆一只**淡墨线稿胆瓶**；窄屏清供自动收起）
- 标签页「印谱」：每个标签一方朱印，朱文/白文按奇偶相间、逐枚微倾，篇数作汉字边款缀于印下
- 分类法索引页与单词页都是**分发器**：`taxonomy.html` 按 `.Data.Plural` 分流到「书架」/「印谱」；`term.html` 按父分类页的 `.Data.Plural` 分流——**分类词页 = 打开的函套**（顶边露出一排册脊、函面折痕、素纸签条写类名与篇数、右端压「类」印），**标签词页 = 钤在纸上**（96px 朱印 + 印泥毛边 + 外圈一圈极淡的朱色晕）
- 书函折叠块：木函底折痕双线、起首墨线（墨线吊在函体左缘，题名与展开正文左对齐）、「展/阖」楷体批注、抽出的宣纸内阴影做旧，开合双向动画（`::details-content`，旧浏览器瞬时回退）
- 物理细节：图片相片贴纸质感（白边细框柔影）与题跋式图注、列表墨点三级递进 + 引导虚线 + 顿号序号 + 盖章式任务框、引用块淡赭石底、表格泛黄虚线格、三竿竹影与雁阵淡墨水印
- 800px 单栏；代码高亮明暗两套（CSS 变量驱动）；代码复制按钮
- 图片管线：page bundle 图片自动 WebP + 三档 srcset + lazy + 宽高防抖动；每张图再包一层指向最大档的链接，供图窗使用
- **图窗（点开看大图）**：点正文图，照片在同一张纸上放大——「同纸虚化」遮罩（当前纸色 90% + 高斯模糊，明暗自动跟随，照片仍像贴在同一张宣纸上）+「画框立轴」裱装（18px 宽裱边、`--color-frame` 细框、一道朱砂内细边、深柔影），图注沿用题跋式两侧引线。支持 ←→ 翻页（篇数是汉字）、滚轮/双击缩放、拖动平移、双指捏合、窄屏左右滑动翻页、Esc 与点遮罩关闭。**无 JS 时退化为「点开看原图」的普通链接**
- **分发与 SEO**：`robots.txt`（声明 sitemap）、Open Graph 全套（含 `og:image`——取 front matter `cover` 裁成 1200×630，没有就用主题默认图）、`BlogPosting` / `WebSite` JSON-LD、自定义 RSS（摘要是纯文本、完整正文进 `<content:encoded>`、去掉阅读器里会变成乱码的锚点 SVG）
- **渲染与排版**：公式**构建期**渲染（`transform.ToMath`，禁 JS / 爬虫 / RSS 阅读器都能拿到排好版的公式，客户端不再加载 300KB JS）、外链在服务端标记并开新标签、`@media print` 打印样式（隐藏界面元素、黑白还原、外链印出地址）、`:target` 落点朱砂短竖、滚动条随点缀色、语义元素（`abbr`/`cite`/`q`/`var`…）与定义列表、`<em>` 用中文着重号代替假斜体
- **站内搜索**：头栏放大镜 → 素纸面板；索引在构建期由 `layouts/home.json` 生成（`/index.json`），**打开面板才 fetch**，纯前端子串匹配、标题命中优先、正文命中给片段并高亮。**没有中文分词**——搜「排版设计」命中不了「排版与设计」；要真正的分词得换 Pagefind（选型对比见 `docs/structure.md`）
- **文章工具栏**：右下角一枚朱印（站名首字），点开展开「回到顶部 / 分享 / 目录」。**整枚可拖动**（位置记忆在 localStorage，拖出视口会被夹回来，上边界让开吸顶头栏）；按钮栈默认朝上开，上方放不下时自动翻到下方，朱印始终不动。分享把「站名 - 标题 - 地址」写进剪贴板并弹出一张牛皮纸卡片（6 秒自动收起，Esc / 点外面也能收）；目录在宽屏滚到侧栏便签、窄屏把同一份便签当浮层打开。悬停有即时出现的牛皮纸标签
- 内置：归档按年/月分组、分类、标签、目录（TOC）、分页、RSS、404

## 把主题推到 GitHub

主题仓库目前**没有远端**（`git remote -v` 为空），提交都只在本地。首次发布按四步走。

### 1. 在 GitHub 建一个空仓库

- 仓库名建议就叫 **`xuanzhi`**——README 和 `theme.toml` 的例子都用这个名字
- **不要**勾 "Add a README / .gitignore / license"：本地已经是完整仓库，勾了会多出一个无关的初始提交，推的时候冲突

### 2. 关联远端并推送

```powershell
cd F:\hugo_theme
git remote add origin https://github.com/<你的用户名>/xuanzhi.git
git push -u origin master        # 本仓库当前分支是 master
```

> 想让默认分支叫 `main` 的话，先 `git branch -M main` 再推。演示站的 workflow 两个分支都监听了。

### 3. 开启 GitHub Pages（演示站）

仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

不选的话 `.github/workflows/demo.yml` 跑完也不会发布。设好之后每次 push 自动更新：

```
https://<你的用户名>.github.io/xuanzhi/
```

> **推的是 `master` 分支的话，还要再改一处**（否则 deploy 步骤必失败）：
>
> GitHub 新建仓库时会往 `github-pages` 环境里预置一条**只允许 `main`** 的部署分支策略，而本仓库分支叫 `master`，于是报
> 「`master` 分支不允许部署到 github-pages 上。部署被拒绝或不符合其他保护规则」——注意 build 步骤是绿的，只有 deploy 挂。
>
> 去 **Settings → Environments → `github-pages` → Deployment branches and tags**，加一条 `master`（或直接选 No restriction），然后手动重跑一次 workflow。

### 4. 回填 `theme.toml` 的 homepage

还空着，填上仓库地址（Hugo 主题站提交表单会读这一项）：

```toml
homepage = 'https://github.com/<你的用户名>/xuanzhi'
```

```powershell
git add theme.toml
git commit -m 'docs: fill theme homepage'
git push
```

### 之后每次改动

```powershell
cd F:\hugo_theme
git add -A
git commit -m 'type(scope): subject'
git push
```

## 引入你的博客

当前为开发期挂载（junction），主题改动即时生效，无需同步文件：

```powershell
# 已存在：F:\hugo_gcnanmu\themes\xuanzhi -> F:\hugo_theme
```

定稿后推荐改为 submodule 方式（主题独立仓库 + 站点锁定版本）。**先按上一节把主题推到 GitHub**，然后：

```powershell
cd F:\hugo_gcnanmu
git rm --cached themes/xuanzhi   # 移除 junction 记录（文件仍在 F:\hugo_theme）
rmdir themes\xuanzhi             # 删掉 junction 本身（不影响 F:\hugo_theme）
git submodule add <你的主题仓库地址> themes/xuanzhi
```

## 演示站

仓库里的 `exampleSite/` 就是主题演示站——内容用的是主题的测试稿（代码高亮、数学公式、图片管线、短代码、长文排版…），用来展示主题在各种内容形态下的样子。

本地预览：

```bash
hugo server --source exampleSite      # http://localhost:1313/
```

`exampleSite/hugo.toml` 用 **module mount** 把仓库根目录的主题挂进来（**不是** `themesDir = '../..'` + `theme = 'xuanzhi'`），所以**不挑仓库目录名**——克隆下来的目录叫 `hugo_theme` 还是 `xuanzhi` 都行。那套常规写法要求目录名必须等于主题名，换个名字就报 `module not found`。站点接入主题本身仍走 `theme = 'xuanzhi'`。

部署：`.github/workflows/demo.yml` 在 push 时构建 `exampleSite` 并发布到 GitHub Pages：

```
https://<owner>.github.io/<repo>/
```

首次启用要去仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**，否则 workflow 跑完也不发布。

> 项目型 Pages 站点在 `/<repo>/` 子路径下，所以 workflow 里用 `--baseURL` 带上这个前缀——不带的 CSS、字体、图片会全 404。

## 站点配置（hugo.toml）

主题有一批功能**模板在主题、开关在站点**——不配就是没有。全清单如下，按「不配会怎样」排：

### 功能 → 需要的配置 → 不配的后果

| 主题功能 | 需要的配置 | 不配会怎样 |
|---|---|---|
| `robots.txt` | `enableRobotsTXT = true` | 主题的 `layouts/robots.txt` **不生成**，构建产物里没有这个文件 |
| emoji 短代码 | `enableEmoji = true`（**顶层**） | `:+1:` 原样输出。写进 `[markup.goldmark.extensions]` 不报错但静默失效 |
| 代码高亮跟随明暗 | `markup.highlight.noClasses = false` | 用 Hugo 的内联样式，切明暗时代码块不跟随 |
| 标题自定义锚点 `{#id}` | `markup.goldmark.parser.attribute.block = true` | 锚点语法被当字面文本渲染出来 |
| 公式**构建期**渲染 | `markup.goldmark.extensions.passthrough.enable = true` + delimiters | 公式不被识别，页面上是原始 LaTeX（客户端渲染已移除，没有回落） |
| 正文手写 HTML | `markup.goldmark.renderer.unsafe = true` | `<mark>` / `<kbd>` / `<figure>` / 语义标签被转义成文本 |
| 头栏菜单 | `[[menus.main]]` | **退回自动导航**（主内容段 + 分类法页）——不是坏，但加页面就得改模板 |
| 站内搜索 | `[outputs] home = ['html', 'rss', 'json']` | `/index.json` 不生成，面板打开后提示「索引加载失败」 |
| 绝对地址正确 | `baseURL`（末尾带 `/`） | sitemap / canonical / og:url / og:image / JSON-LD / RSS 全指向 `example.org` |
| 首页欢迎语 | `params.hero.greeting` | 用主题默认（i18n 的 `greeting`） |
| 默认点缀色 | `params.accent` | `terracotta`（访客仍可在外观面板自行切换） |
| JSON-LD 作者 | `params.author` | 回落成站点 `title` |

> 不走 `hugo.toml` 的自定义还有两处——**界面文案**和**头栏图标按钮**，改的是站点仓库里的文件，见下面「站点的其他自定义」一节。

### 复制粘贴

```toml
baseURL = 'https://你的域名/'
title = '站点名'
theme = 'xuanzhi'

enableRobotsTXT = true
enableEmoji = true

# 站内搜索：首页多输出一份 json（主题的 layouts/home.json 生成 /index.json）
[outputs]
  home = ['html', 'rss', 'json']

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
```

> `passthrough` 的键是 **`enable`**，写成 `enabled` 不报错但静默失效。

### 不用配（Hugo 默认已开，主题直接吃）

`definitionList`（定义列表）、`footnote`（脚注）、`table`、`taskList`、`strikethrough`、`linkify` —— 这些不写进 `hugo.toml` 也生效。`tableOfContents` 的 `startLevel` / `endLevel` 可按需调（示例用 2–4）。

### 容易踩的

- **`public/` 里看到的 URL 依赖 `baseURL`**。开发服务器运行时 Hugo 会把 baseURL 覆盖成 `http://localhost:1314/`，所以别在 `hugo server` 开着的时候去 `public/` 检查绝对地址——那会儿看什么都是 localhost。跑一次 `hugo` 再看。

## 站点的其他自定义

下面两项**不写在 `hugo.toml` 里**，改的是站点仓库中的文件——和上面那批配置项分开看。

### 改界面文案

界面上的字（外观面板、归档的「岁在」「N 篇」、上下篇、复制按钮…）全在主题的 `i18n/zh-cn.yaml`。**站点想改哪个词，就在自己的 `i18n/zh-cn.yaml` 里写同名 key 覆盖**——Hugo 会合并主题与站点的 i18n 目录，站点优先：

```yaml
# 站点 i18n/zh-cn.yaml
recentPosts: 最新文章
scrollHint: 往下翻
unitPosts: 则
```

> 主题的 i18n key 一律**扁平**，别写成嵌套 map 再用点号取（`i18n "posts.other"` 会静默返回空串）。

### 头栏自定义入口

**先看你想让它长什么样：**

| 想要的样子 | 怎么加 |
|---|---|
| 跟「归档 / 分类 / 标签」排在一起的**文字链接** | 加 `[[menus.main]]`，不用碰模板——桌面头栏和手机 ☰ 面板都会自动出现 |
| 跟搜索 / 外观 / 明暗排在一起的**图标按钮**（GitHub、RSS、邮件、友链…） | 用下面的**插槽** |

文字链接走菜单：

```toml
[[menus.main]]
  name = '关于'
  pageRef = '/about'                     # 站内页面
  weight = 40
[[menus.main]]
  name = 'GitHub'
  url = 'https://github.com/你的账号'     # 外链
  weight = 50
```

图标按钮走插槽——在**站点仓库**新建 `layouts/partials/header-extra.html`，写自己的 markup 即可。Hugo 的模板查找顺序是「站点先于主题」，同名 partial 会顶掉主题里那份空的（主题那份只有一段注释，不用改它）。

#### 例一：加一个链接（最普通的情况）

`href` 写死，图标和文字自己换：

```html
{{/* 站点 layouts/partials/header-extra.html */}}
<a class="header-extra" href="mailto:you@example.com" aria-label="邮件联系">
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
  <span class="header-extra-label">邮件</span>
</a>
```

跳站外（GitHub 之类）建议加 `target="_blank" rel="noopener"`。

#### 例二：href 用模板表达式

站内地址别写死路径，用 Hugo 变量取。比如 RSS：

```html
<a class="header-extra"
   href="{{ with site.Home.OutputFormats.Get "rss" }}{{ .RelPermalink }}{{ end }}"
   aria-label="RSS 订阅">
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <circle cx="6.18" cy="17.82" r="2.18"/>
    <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
  </svg>
  <span class="header-extra-label">RSS 订阅</span>
</a>
```

#### 例三：放多个

插槽就是一段 markup，想放几个写几个，顺序即显示顺序：

```html
<a class="header-extra" href="https://github.com/你的账号" target="_blank" rel="noopener" aria-label="GitHub">
  <svg …>…</svg><span class="header-extra-label">GitHub</span>
</a>
<a class="header-extra" href="{{ with site.Home.OutputFormats.Get "rss" }}{{ .RelPermalink }}{{ end }}" aria-label="RSS 订阅">
  <svg …>…</svg><span class="header-extra-label">RSS 订阅</span>
</a>
```

#### 渲染成什么样

**同一份 markup 会渲染到两处**，主题按上下文分别样式化：

| 渲染位置 | 长什么样 |
|---|---|
| 桌面头栏 `.site-nav` | 30×30 圆形图标按钮，和搜索 / 外观 / 明暗那组同排；`.header-extra-label` 自动隐藏 |
| 手机 ☰ 面板 | 整宽一行，图标 + `.header-extra-label` 文字 |

两条约定：

- 根元素挂 **`class="header-extra"`**，文字包在 **`<span class="header-extra-label">`** 里——主题靠这两个 class 做两套样式。只想显示图标就省略那个 span。
- ≤640px 时 `.site-nav` 里除明暗按钮外一律隐藏，所以插槽内容**不会挤进手机头栏**，只出现在 ☰ 面板里。这正是想要的，不用额外处理。

> **图标从哪来**：通用图标（邮件 / 链接 / RSS…）取 `@material-design-icons/svg` 官方包；品牌图标（GitHub / Bilibili / 微博）Material 包里没有，用 Simple Icons 之类的包取 `<path>`。**一律别凭记忆手写**——主题所有图标都是这么来的。

> 新建 / 删除 partial 文件后如果页面没变化，**重启 `hugo server`**：Hugo 的 watcher 对文件增删的响应不可靠（实测删掉插槽文件后页面还是旧的），改已有文件才一定热重建。

## 行为说明

- 手机端（≤640px）头栏只留 **☰ · 站名 · 明暗按钮**：导航链接、搜索、外观都收进 ☰ 下拉面板（面板里可滚动，矮屏也不会被截断）。桌面端不受影响，两个浮层面板照旧
- 页脚的 RSS 入口是一枚图标（带 `aria-label`，不是文字链接），只在站点启用了 RSS 输出时出现
- 站内搜索的索引**两个搜索框共用一份**：桌面浮层面板里一个、手机 ☰ 面板里一个，先打开哪个就由谁触发 `/index.json` 的加载，之后两处都能用，不会重复请求
- 明暗模式：访客首次进入跟随系统偏好，点页头按钮手动切换后记忆在 localStorage（键 `xuanzhi-theme`）
- 站名首字会渲染成页脚的印章，改 `title` 即生效
- 滚动条滑块、着重号、缩写点线、外链 ↗、锚点落点的朱砂短竖、文章工具栏的朱印、首页「续读」——这些**装饰性标记**都走朱饰系，随 `accent` 在朱砂/黛青之间切换；`strong` 的浓墨、`del` 的褪色、定义列表的引导虚线属于**语义性**标记，留墨阶不动
- 公式在**构建期**渲染（`transform.ToMath`），禁 JS、爬虫、RSS 阅读器都能拿到排好版的公式；客户端只加载 `katex.min.css`
- 自托管的 `static/katex/katex.min.css` 版本必须与 Hugo `transform.ToMath` 输出匹配（现代类名 `.sizing`；若误用旧版 `.katex-sizing`，上下标不会缩小/抬起）。模板中对 KaTeX 样式表这类静态资源一律用**不带前导 `/` 的 `relURL`** 引用——写成 `/katex/…` 这类根绝对路径时，部署在项目型 Pages 子路径会 404，表现是公式旁露出 LaTeX 原文、搜索索引加载失败（2026-09-09，详见 `docs/2026-09-09-math-formula-subsuper-and-subpath-fixes.md`）

## 写作约定

- 图片与文章同目录（page bundle）：

```
content/posts/my-post/
├── index.md
└── photo.jpg
```

正文中直接 `![说明](photo.jpg)`，构建时自动压缩转 WebP 并生成响应式 srcset。**不要把图片放到外部图床**——图片和文章在同一个 Git 仓库里，是本主题和整个博客架构的根基约定。

点图可以放大查看（图窗）。图窗里的题跋图注按这个优先级取：`![说明](photo.jpg "图注")` 的 `title`，没有则退回 `![说明]` 的 `alt`。

### 首页卡片的印记

每张卡右下角有一枚淡印。默认按文章标题哈希自动生成八式水墨小品（远山晓日 / 竹影 / 空亭听雨 / 汀洲孤雁 / 孤舟远影 / 红杏出墙 / 云岫 / 杨柳岸），同一篇文章永远同一幅；各式的定妆预览稿在主题 `static/images/covers/`。想换成自己的图，在 front matter 里给 `cover`：

```yaml
---
title: "我的文章"
cover: "cover.jpg"   # page bundle 内的文件名，或以 / 开头的静态图片路径
---
```

自定义图会经图片管线压成 WebP；不填 `cover` 就用生成的印记。

## 目录结构

```
layouts/
├── baseof.html          # 全站骨架
├── home.html            # 首页（诗笺欢迎区 + 红框封卡片，最近 8 篇）
├── list.html            # 归档（毛笔纪年 + 朱印领月）
├── single.html          # 文章页
├── taxonomy.html        # 分类法索引页分发器 → 书架 / 印谱
├── term.html            # 单词页分发器 → 开函 / 钤印
├── 404.html
├── partials/            # head / header / footer / nav-links / appearance-tiles / header-extra
│                        # / post-item / post-card / post-card-cover / seal-count / pagination
│                        # / taxonomy-shelf / taxonomy-sealwall / term-category / term-tag
└── _markup/
    ├── render-image.html   # 图片渲染钩子（WebP/srcset 管线 + 图窗触发链接）
    └── render-heading.html # 标题毛笔圈点 + 锚点
assets/
├── css/token.css        # 设计 token（全部颜色/字体/版式变量在这里）
├── css/chroma.css       # 代码高亮（变量驱动，明暗自动跟随）
├── css/main.css         # 版式
├── fonts/               # 自托管字体的 @font-face CSS（head.html 用 resources.Get 探测）
└── js/site.js           # 明暗切换 + 外观面板 + 站内搜索 + 移动端下拉面板 + 复制按钮
                         # + scrollspy + 长目录折叠 + 诗笺刷新 + 图片灯箱
static/fonts/       # 字体二进制切片（woff2），原样发布到 /fonts/... 供上面的 CSS 相对引用
static/images/covers/    # 八式水墨小品定妆预览稿（页面按题哈希内联渲染）
scripts/                 # 开发辅助脚本
```

## 想改颜色？

全部在 `assets/css/token.css`：亮色一套、暗色一套、点缀色两版、背景纹理变量（`--bg-image` / `--bg-size` / `--tex-noise` / `--vignette`）。改完 `hugo server` 即时预览。

图窗的裱边宽度是 `main.css`「图片灯箱」段的 `--lb-mat`，遮罩模糊半径是同一段的 `blur(10px)`——两个都在那一处调，别散落到别处。

## 外观面板的取舍

面板由三部分组成，调试完想精简时按需移除：

- 面板 HTML：`layouts/partials/header.html` 中 `class="appearance"` 的整块（里面的样张是 `partials/appearance-tiles.html`，**移动端下拉面板共用同一份**，要删就两处一起删）
- 面板样式与背景切换规则：`assets/css/main.css` 中「外观面板」「背景方案」两段注释之间
- 面板交互：`assets/js/site.js` 中「外观面板」一段——注意样张的点击委托和 `syncPressed()` 是**文档级**的（为了让移动端那组样张也能用），删面板后它们仍会命中别处样张，一并删；另删除 `head.html` 内联脚本里 `xuanzhi-bg` / `xuanzhi-accent` 两行恢复逻辑

背景与点缀色本身的 CSS 变量建议保留——那是主题的配色系统，删面板不影响它们。

## 字体更新

字体来自 npm 包 `lxgw-wenkai-gb-web`（LXGW WenKai GB，SIL OFL 许可）。更新时：

```bash
npm view lxgw-wenkai-gb-web dist.tarball   # 拿最新地址
# 下载解压后，用 package/lxgwwenkaigb-regular 与 lxgwwenkaigb-medium
# 覆盖 static/fonts/lxgw/regular 与 medium（woff2 切片）
# 对应的 @font-face CSS 在 assets/fonts/lxgw/ 下，一并更新 result.min.css
```

> 字体分成两半放：**CSS 在 `assets/fonts/`**（走 Hugo 的资源管线，`head.html` 用 `resources.Get` 探测——这是 module-aware 的，主题目录改名或用 Hugo Modules 安装都找得到），**woff2 切片在 `static/fonts/`**（原样发布）。两边的相对位置必须保持一致，因为 CSS 里是 `url(220.woff2)` 这种相对引用。

## 第三方资产与许可

主题本体（模板 / CSS / JS）是 **MIT**，见仓库根目录的 `LICENSE`。

仓库里随主题分发的第三方资产**各有各的许可，不因打包在一起而变成 MIT**：

| 资产 | 位置 | 许可 |
|---|---|---|
| 霞鹜文楷 GB（LXGW WenKai GB） | `static/fonts/lxgw/` + `assets/fonts/lxgw/` | SIL OFL 1.1 |
| 思源宋体 700 切片（Source Han Serif / Noto Serif SC） | `static/fonts/noto-serif-sc/` + `assets/fonts/noto-serif-sc/` | SIL OFL 1.1 |
| JetBrains Mono | `static/fonts/jbm/` + `assets/fonts/jbm/` | SIL OFL 1.1 |
| KaTeX（只用到样式表） | `static/katex/` | MIT |
| Material Design 图标 path | 模板内联（`header.html` / `footer.html` 等） | Apache-2.0 |

图标取自 `@material-design-icons/svg`。

> OFL 字体允许随任何软件打包分发，但**必须保留各自的版权与许可声明**，也不得单独改标协议。想换掉字体（比如改用自己的）：删掉 `static/fonts/` 与 `assets/fonts/` 下对应的目录即可——`head.html` 用 `resources.Get` 探测，文件不在了就自动不输出那几行 `<link>`，不会 404。

## 备份建议

本主题仓库与你的博客内容仓库各自独立成仓，建议各配双远端（GitHub 主远端 + Codeberg 或自建 bare 仓库镜像），定期 `git push` 双推。远端构成备份，不构成依赖——任一平台消失，本地仓库 + Hugo 二进制即可完整重建。

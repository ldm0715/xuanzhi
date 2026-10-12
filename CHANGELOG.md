# 更新日志

本主题遵循[语义化版本](https://semver.org/lang/zh-CN/)，变更记录的写法参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

> **版本号的唯一出处就是本文件。** 发布新版本时：先在这里加一段 `## [x.y.z] - YYYY-MM-DD`，
> 提交，再打同名 tag（`git tag vx.y.z && git push --tags`）。发布 workflow 会校验 tag 与本文
> 的版本段是否对得上，对不上直接失败——所以 tag 和本文件不可能各说各话。

## [Unreleased]

### 新增

- **用户手册新增「十二、评论」一章**（`docs/comments.md`）：把「怎么开启评论区」从「三、站点配置」那一节里独立成一章，并补上原来没地方写的两件事——① 上游 `@waline/vercel` 1.43.4 的一个真 bug：**非管理员点赞必然 500**（服务端给待写数据里塞了个 `comment: undefined`，数据库适配器回传时把正文整个覆盖掉，markdown 渲染随即抛错），而且客户端把 500 当成失败，界面不更新，所以表现成「点了没反应、刷新才对」；② 服务端该走「上游原版自己打一行补丁」还是「用作者打好补丁的仓库」，两条路都写清了，并提示先确认上游修没修。同一章还记了 Cloudflare 橙云会让服务端记成节点 IP（定位显示成机房、限流全局撞车）。**部署细节不再展开**，只指向 Waline 官方文档。各章的「手册目录」折叠块同步到十二条，「三、站点配置」那一节保留配置表并加了一条指回本章的引用
- **可选的评论区（Waline）**：`params.comments.serverURL` 填上就全站文章页出现评论区，不配则连客户端脚本都不下载——整块不输出，首屏与从前完全一致；单页可用 front matter `comments: false` 关掉。服务端由使用者自行部署（Vercel 最省事），客户端两个文件（`waline.umd.js` 275KB + `waline.css`）自托管在 `static/vendor/waline/`，由 `site.js` 的「评论」段滚到视口前 400px 才注入；同理不放进 `head.html` 的产物拼接，否则每个开评论的文章页都要白下这一份。界面文案进 `i18n/zh-cn.yaml` 的「评论（Waline）」组，模板拼成 `locale` 覆写传给 Waline；配色整段映到主题 token（朱砂/黛青与明暗四象限自动跟随，连 Waline 把「已赞」写死成行内 `fill="red"` 的爱心也压回 `currentColor`），皮肤写在 `main.css` 的「评论（Waline）」段；动作按钮另给了一个按下即缩的反馈——Waline 的点赞**不是乐观更新**，数字与红心都要等服务端往返回来才变，Vercel 冷启动时能到一两秒，按下先缩一下才不至于像点空了。表情包默认关掉——Waline 的默认值会去 unpkg 拉微博表情包，那是诗笺之外凭空多出来的一条外部请求。**四条踩过的坑都写进了注释与文档**：① 运行期注入的 `waline.css` 必然落在 `main.css` **之后**，同特异性时反倒赢，所以皮肤整段用 `#waline`（ID 特异性）压上去，不赌加载顺序；② Hugo 会把 `params` 的键**一律小写化**，`serverURL` 存成 `serverurl` 后透传给 Waline 是**静默失效**——评论区像没配一样空着、构建零报错，主题用 `comments.html` 里一张 `$alias` 表还原 camelCase；③ 评论区不能放进 `.post-content`，那里挂着 `ul > li::before` 的朱砂墨点，而 Waline 内部大量用 `<ul>`；④ `.post-layout` 是 grid、`.post` 是 `display:contents`，评论块必须显式给 `grid-area: comm`，否则右侧目录笺会在评论区上方就断掉。`dev/planning/optimizations.md` 里「站内评论」原列在「讨论过、倾向不做」，本条把它改成有条件放行
- **评论区的四处打磨**：① 「地址 / 浏览器 / 系统」那排小签原本**根本没有图标**——Waline 把图标放在**另一份样式表** `waline-meta.css` 里，而我们只 vendor 了 `waline.css`；补上之后 18 个变体一枚不差。图标颜色是烤在 data-URI 里的 `#999`，CSS 的 `color` 够不着它（那是 `background-image`），改用 `filter: brightness(0)` 压成墨色、夜墨下再 `invert(1)` 提亮。② 加载转圈是 Waline 的 SVG **SMIL**（`<animateTransform type="rotate">`），不是 CSS 动画——主题的样式表既碰不到也救不回来，而且 SMIL 本身是被浏览器逐步淘汰的老机制；改成 CSS 画的朱砂弧线，从此跟着点缀色走、受 `prefers-reduced-motion` 约束。③ **QQ 头像不必写代码**：`@waline/vercel` 服务端本来就会按「昵称是纯数字」或「邮箱是 `<QQ号>@qq.com`」去取 `q1.qlogo.cn` 的头像（实测线上 1.43.4 的 `service/avatar.js` 里有这段），主题只把这个约定提示在**正文框的占位文字**里，邮箱那一格仍旧只写「邮箱」。④ 嵌套回复左侧那道竖线原本在亮色下**看不见**：Waline 给的是 `rgba(237,237,237,.5)`，一道近白，是配它自己那套白底做的，落到宣纸底上就没了、只有夜墨里才显形；改用 `--color-rule`，随 `data-accent` 在朱砂/黛青之间换，与评论标题那道横线同源。`waline-meta.css` 已同步补进 `assets/vendor/README.md` 的目录表与「已做的改动」，以及 `docs/licenses.md` 的第三方资产清单
- **用户手册新增「四、内容组织」一章**（`docs/structure.md`）：`content/` 的目录怎么变成 URL、新开一个存放文章的地方要做哪三个动作（`_index.md` / `mainSections` / 菜单项）、哪些路径已经被 Hugo 与主题占用、`slug` / `url` / `aliases` 怎么换 URL 不换目录。两条写进去的都是实测结论：**在分类法根目录下放内容文件会静默吞掉同名词条的词条页**（配对测试，两边都是零报错零警告），**新建栏目的列表页默认继承归档版式**——`layouts/list.html` 不渲染 `_index.md` 的正文，无日期的内容还会掉进「0001 年」那一组。要自己的形制就给栏目单独一个 `layouts/<section>/list.html`
- **`docs/customization.md` 新增「主题的文件都在哪」一节**：手册此前只在正文里零散提到 `head.html` / `site.js` / `token.css`，却从没说明它们在主题的哪个目录下，读者没有锚点。补一张 `layouts/` / `assets/` / `static/` / `i18n/` 的对照表（顺带一句「模板在 `layouts/`，样式与脚本在 `assets/`」），并把几处裸文件名补成完整路径：`layouts/partials/head.html`、`layouts/partials/nav-links.html`、`assets/js/site.js`、`layouts/single.html`、`layouts/about.html`。短代码那篇的媒体素材也补上了「站内文件放站点的 `static/media/`」——此前只说了短代码参数里怎么写 `/media/…`，没说文件该放哪
- **演示站新增 `exampleSite/README.md`**：讲清用户手册在仓库根 `docs/`（靠 `exampleSite/hugo.toml` 末尾的 module mount 挂成 `content/posts`，所以翻 `exampleSite/` 目录找文档会扑空），并写明**别把这份 `hugo.toml` 抄进自己的站**——它没有 `theme = 'xuanzhi'`，靠的是 `../layouts`、`../assets` 这些只在主题仓库里成立的相对路径；抄过去 Hugo 不报错、直接当空，构建会硬失败在第一个短代码上

### 变更

- **手册顺延编号**：新增「四、内容组织」后，原「四、写作」起各章后移一位，现为「五、写作」…「十一、许可」。各章顶部的「手册目录」折叠块、正文里的章号引用、README 与快速开始的导航表同步
- **演示站四篇示例文章的标题加「案例——」前缀**：首页每页 8 张卡，手册十一章加这四篇共 15 篇时，第 2 页会把「九、十、十一」三章和它们摆在一起；前缀是读者分辨「教程 / 演示数据」的唯一线索
- **演示站四篇示例文章的 weight 从 110-140 移到 210-240**：`110` 已被「十一、许可」占用，同时把 120-200 让给以后新增的手册章节
- 删掉演示站 `long-form` 与 `ink-gradation` 两篇之间近乎逐字重复的两段——「淡墨的用处」整节（该段在 `ink-gradation` 已完整存在）与「清之一阶」的收尾半句

### 移除

- **front matter `cover`**：字段整体移除——页面级不再有配图入口，社交卡片的 `og:image` 固定取主题默认图（站点在 `static/images/og-default.png` 放一张同名图即可覆盖）。已填 `cover` 的文章不受影响、也不会报错——这个字段现在被忽略。同步删掉了 `head.html` 里 `cover` → `1200×630` 的裁剪链与 CSS 的 `.inkcard-print-img` 规则（两条分支都从未被真实内容跑过）
- **卡片上的水墨印记**：首页卡片右下角不再渲染印记，八式水墨小品只留在诗笺右下角（八枚叠放，访客每次到访随机亮一枚）——那枚淡印会破坏卡面的留白与秩序。随之下线 CSS 的 `.inkcard-print` 基础几何与 ≤640px 覆盖（该规则此前已被 `display:none` 暂隐，卡片上其实一直看不到）。`partials/post-card-cover.html` 就此改名 `partials/ink-art.html`——它现在只服务诗笺，「card cover」这个名字已名不副实；描色命名空间也从 `.inkcard-print *` 换成 `.poem-art *`，预览稿目录 `static/images/covers/` → `static/images/ink-art/`

## [1.0.0-rc.1] - 2026-09-11

首个版本的候选版。原先按 `1.0.0` 记的那批内容已并入本节——`v1.0.0` 从未打过 tag，没有已发布的旧版本要对照。

### 新增 · 版面与阅读

- 首页两段式：欢迎区「诗笺」+ 文章卡片网格。诗笺在构建期向诗泉 API 预取一首绝句烘进 HTML，浏览器端每次到访再随机换新；取不到或校验不合格时静默保留已烘入的那首（内置《鹿柴》兜底）
- 文章卡片：素纸底 + 一道朱丝框 + 右上邮戳 + 右下淡印 + 落款行。淡印按标题哈希从八式水墨小品（远山晓日 / 竹影 / 空亭听雨 / 汀洲孤雁 / 孤舟远影 / 红杏出墙 / 云岫 / 杨柳岸）中选一枚，也可用 front matter `cover`（写 `assets/cover.jpg`）换成自己的图；落款行是分类 + 最多 4 枚标签，超出的收成一枚 `+N` 纯文字签——整张卡已是链接，那里不能再套链接
- 归档页按年 / 月分组：年份下压一道折痕双细线，月份用行内小朱印领月、篇数是汉字数字；干支闲章按年份推算
- 四套分类法页面各有形制：分类索引 = 通栏长架（≥800px 一排 5 只，余下摆淡墨胆瓶），标签索引 = 印谱印章墙（朱文 / 白文按奇偶相间，篇数为汉字边款），分类词页 = 打开函套，标签词页 = 钤在纸上
- 文章页目录（TOC）+ scrollspy；目录条目超过 10 条自动折叠，阅读分支常开
- 分页器与线装式上下篇翻页
- 文章页右下角一枚可拖动的朱印：收起时外圈方框随阅读进度描边填充，展开为「回到顶部 / 分享 / 目录 / 进度读数」。位置随拖动记忆在 localStorage
- 明暗双模式，首次到访跟随系统偏好，手动切换后记忆；切换时圆形揭示动画
- 外观面板：纸面纹理 5 种、点缀色（陶土橘 / 黛青）2 种、分隔线 4 种，选择持久化并有防闪烁的内联恢复脚本
- 框架宽度分两档（常规窄版 / 文章页 1150px），跨页导航时按档位差异播放过渡
- 打印样式：黑白还原、隐藏头栏 / 页脚 / 目录 / 外观面板 / 浮动工具栏，外链把地址印出来
- 文章页元信息里的标签最多 4 枚，超出的收成一枚指向 `/tags/` 印谱墙的 `+N` 小签（悬停提示走 i18n `moreTags`）
- 文章页的头栏站名随滚动切换：正文标题滚过头栏之后，站名那一格换成文章标题，滚回顶部换回站名（窄屏切换态居中，与站名的位置对齐）。首页、归档、分类法页、关于页没有这个行为

### 新增 · 内容形态

- 图片管线：正文图与 `cover` 按约定收在文章目录下的 `assets/`（正文写 `![](assets/photo.jpg)`），构建时自动转 WebP + 三档 srcset + 懒加载；点击进入图窗灯箱，支持翻页、滚轮与双击缩放、拖动平移、双指捏合、窄屏滑动翻页、Esc 关闭与焦点锁
- 公式**构建期**渲染（KaTeX，输出 `htmlAndMathml`）：爬虫、禁 JS 的读者、RSS 阅读器都能拿到排好版的公式；`katex.min.css` 只在有公式的页面引入
- 代码块双明暗高亮、复制按钮、行号、长行横向滚动
- 脚注、表格、任务列表、定义列表、嵌套列表与引用、删除线各有版式；`<em>` 用中文着重号代替合成斜体
- 短代码：`details` / `qr` / `relref` / `highlight` / `video` / `audio` / `playlist` / `nameplate` / `social` / `project` / `colophon`
- 自托管的视频 / 音频 / 播放列表（Plyr 管视频、APlayer 管音频），皮肤已覆写成宣纸风；只在嵌了媒体的页面加载
- 关于页：`nameplate` / `social` / `project` / `colophon` 四颗短代码 + 普通 markdown，无私有 front matter schema
- 渲染钩子：标题毛笔圈点与锚点、图片转 WebP 与图窗、服务端判定的外链标记与 `target`/`rel`
- 自定义 RSS：`<description>` 走纯文本，完整正文放 `<content:encoded>` 并摘掉标题锚点的内联 SVG

### 新增 · 分发与 SEO

- `robots.txt`、sitemap、Open Graph、Twitter Card、JSON-LD（文章页 `BlogPosting`、首页 `WebSite`）
- 社交卡片图优先取 front matter `cover`，无 cover 时回落主题默认图（站点放同名文件即可覆盖）
- 站内搜索基于 Pagefind，中文分词原生支持；桌面与移动端两个搜索框共用一份索引，子路径部署安全

### 新增 · 自定义

- 头栏导航走 `hugo.toml` 的 `[[menus.main]]`，加页面不改模板；未配置菜单时回落成「主内容段 + 分类法页」的自动导航
- 界面文案全部走 i18n，站点可在自己的 `i18n/zh-cn.yaml` 里同名 key 覆盖
- `partials/header-extra.html` 头栏图标按钮插槽，站点在自己仓库建同名文件即可覆盖
- 站点参数：`params.accent`、`params.author`、`params.description`、`params.hero.greeting`
- 颜色与纹理一律走 `assets/css/token.css` 的设计 token，改一处两处点缀色与明暗自动跟随

### 新增 · 资产自托管

- 霞鹜文楷、思源宋体 700、JetBrains Mono 字体切片自托管，`@font-face` 走 Hugo 资源管线探测
- KaTeX 样式、Material / Simple Icons 图标、Plyr 与 APlayer 全部随主题分发，无第三方 CDN 依赖

### 修复

- 折叠块展开后，内容区的列表缩进被面板样式顶掉、朱砂墨点探出纸面左缘——面板规则 `details[open] > :not(summary)` 的特异性压过了 `.post-content ul`。内容体现在包一层 `.case-body`，顺带修好内容区有多个块时「每块各画一张纸面」
- 开篇第一段只有一句话时也被扣上 3em 的首字下沉，看着像戴了顶帽子。现在首段不足一行（约 47 个汉字）构建期就不再下沉
- 首页翻页后停在整屏诗笺区，得再往下滑一屏才看到卡片。分页链接现在带 `#recent` 锚点，直接落到「近期文章」；那一页内容短到滚不过去时仍会停在能滚到的最大位置（锚点没写错，是页面不够长）

### 已知限制

- **唯一的对外请求**是首页诗笺（诗泉 API），构建期与运行期各一次，失败即静默兜底。不想要这个外部依赖的话见 [docs/design.md](docs/design.md)
- 站内搜索的索引不由 Hugo 生成，需要在构建之后单独跑一步 `npx pagefind --site public`
- 界面文案目前只有 `zh-cn` 一种语言
- 要求 **Hugo ≥ 0.146（extended）**，图片管线需要 extended 版本

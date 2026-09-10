# 关于页：短代码 + 普通 markdown

关于页 = `layouts/about.html` + 四颗短代码（`nameplate` / `social` / `project` / `colophon`），页面主体是短代码加普通 markdown。另附一个页面级宽度开关 `frame: "narrow"`。

这一篇记**当初为什么这么做**，以及走到这一步推翻过的两版。操作说明在 [`../../docs/shortcodes.md`](../../docs/shortcodes.md)「关于页的四颗短代码」，实现约定在根 `CLAUDE.md`。

## 一、形制：这一页不做成器物

主题的规矩是「每页借一件器物」（诗笺 / 函套 / 印谱 / 书卷）。关于页是**刻意的例外**——不套框、不加印、不设站语，就是普通 markdown 排下来，只在两处收一收：分节标题沿用文章页那套（毛笔记号 + 字号层级），版权页压到注脚体量。

试过两条路，都撤了：

| 试过的 | 为什么撤 |
|---|---|
| 版权页做成**藏书票**（双线朱框 + 白文站名印 + 站语） | 那套形制要成立，就得替使用者决定印面取哪个字、站语用哪一句、框用几道线。可「关于本站」本来就是顺手交代几句出处，**不值得为它规定这么多** |
| 版权页**完全不套样式**，纯 markdown | 退回正文体量（17px 楷体），和上一段正文字对字地抢读——注脚就该小一档 |

结论：**器物化的前提是那件东西本身有分量**。分量不够时硬套，套出来的是装饰。这条判断写进了 [`design.md`](../../docs/design.md)。

## 二、架构：短代码 + markdown，不用 front matter schema

第一版是**私有的 front matter schema**：`self` / `projects` / `colophon` 三个数组，模板按固定字段渲染。撤了，两条理由：

1. **做不出层次**。`colophon` 是 `label` + `text` 的扁平数组，只能一行一个标签；想分组、想嵌套、想在某一节里多写一句话，都表达不了。
2. **换个人用就对不上字段**。主题其余每个页面形制都**派生自 Hugo 原生结构**（首页 ← `site.Home.Pages`、归档 ← `date`、分类标签 ← taxonomy、文章页 ← 通用 front matter），唯独这套 schema 是凭空发明的。

改走主题既有的那条路：**凡「用户要填结构」的地方一律用短代码**（`video` / `audio` / `playlist` / `details` 都是这个路子），页面主体回到普通 markdown。

## 二·补：自述块推翻过一次，但骨架没变

自述块（`nameplate`）的第一版是**单栏**：引首印与名号并排一行，自述横跨整宽。后来改成**左右双栏**——左栏 132px 放方像（没图回退成朱印），名号 / 身份 / 自述 / 联系全在右栏，像垂直居中。

值得记的是：**这个双栏骨架早先做过一版、被否掉了**。当时左栏只放一枚 50px 的印，右栏文字块比它高 100px 出头（量到两栏差 146px），重心整个偏右，因此推翻。

现在它成立，不是因为骨架变了，而是**变量的量级变了**：像放大到 132px 之后左栏有了实打实的体量，右栏承载文字就不再失衡。

> **教训**：一次失败的版式 ≠ 那个版式错了。先量清楚失败的**量级**（50px 撑不住一栏），再看换一个量级会不会就成立——比换一种版式更省事，也更可能对上作者真正想要的东西。当时若只记「双栏不行」，这版就不会出现。

**连带的结构改动**：`nameplate` 从自闭合变成了**闭合**。名号要和内容体同处右栏，而它们在 DOM 里与内容体是平级兄弟，CSS 排不了，必须有个盒子包住。改一颗短代码的闭合方式**等于改它的写法约定**——站点内容、文档、示例必须同一次改完，漏一处就是构建失败（06 篇记过这条约定，这次是它第二次生效）。

**人像的三级取值**：

| 级 | 条件 | 结果 |
|---|---|---|
| ① | 传了 `image=` | 用它。静态路径（`/` 开头）原样引用；bundle 资源过图片管线压 WebP（2× 出 264px）；传了却找不到 → `warnf` |
| ② | 没传 | 主题自带的 `static/images/me.jpg`。站点放一张同名同路径的即可覆盖 |
| ③ | ①② 都拿不到 | 朱印（四字田字格 / 单字）。**这条从"常态"降成了"错误提示"**——②总会成功，所以朱印只在 `image=` 指错或主题删掉默认图时出现 |

第 ② 级沿用了主题处理 `og-default.png` 的套路：**主题带一张默认、站点同名覆盖、不引入任何配置项**。这条路子比"加一个 front matter / hugo.toml 开关"省事，也更难配错。

## 三、四颗短代码

| 短代码 | 产出 | 闭合 |
|---|---|---|
| `nameplate` | 自述块：左像 + 右文（名号 / 身份 / 内容体） | **是** |
| `social` | 带图标的联系行 | 否 |
| `project` | 一个题录式项目条目 | **是** |
| `colophon` | 版权页小字 | **是** |

**闭合与否不是随便定的**：Hugo 按模板里有没有引用 `.Inner` 决定。引用了的（`project` / `colophon`）写成 `{{< project … >}}` 而不闭合会直接构建失败——这条约定与 `video` / `playlist` 同源，见 [`06-self-hosted-media-player.md`](06-self-hosted-media-player.md)。

`social` 的品牌图标（GitHub / Bilibili）取自 **Simple Icons（CC0）**——Google 的 `@material-design-icons/svg` 不含品牌 logo，主题原来那条「图标一律从 Material 取」的规矩对品牌标识执行不了。`email` / `rss` 仍走 Material。出处记在 [`../../docs/licenses.md`](../../docs/licenses.md)。

## 四、页面级开关 `frame: "narrow"`，三处必须同步

Hugo 给**每个普通内容页**的 `.Kind` 都是 `"page"`——文章是，`about.md` 也是。而主题的宽度档位原本就认 `.Kind == "page"`，于是关于页被当成文章页：头栏与页脚展开到 1150px，正文却仍是 800px，两边对不齐。

加了一个**独立的** `data-frame="narrow"` 标记（没有去改 `data-layout` 本身，因为 `main.css` 里 ≤900px 隐去飞鸟水印那条也吃它，而那条**应该继续对关于页生效**——两个消费者的判据不同，就得分开标记）。三处必须一致：

1. `layouts/baseof.html` 写出 `data-frame`
2. `assets/css/main.css` 的宽度规则写成 `:not([data-frame="narrow"])`
3. `layouts/partials/header.html` 末尾内联脚本的档位判据

漏掉第 3 处不会报错，只会让页面**从宽档起步再被 CSS 拽回窄档**，白播一次收缩动画。

## 五、样式作用域是 `.post-content .xz-*`，不是 `.about`

四颗短代码是**通用短代码**，文章正文里也要能用（写作手册就在文章里演示它们），所以作用域挂在正文层而不是关于页外壳上。带 `.post-content` 前缀不是啰嗦，是**承重的**：

- 主题的正文规则如 `.post-content > p` 特异性是 (0,1,1)，单写 `.xz-social` 是 (0,1,0)，会被压掉 margin
- 加上前缀才是 (0,2,0)，压得过；**去掉前缀会静默失效**

`.about` 只留两件事：页面外壳的内边距，以及关于页专属的分节缩进与首字下沉抑制。

## 六、踩到的坑

### 1. 标题的 27px 偏移，与分节内容对齐

渲染钩子给每个 h2 塞一枚毛笔朱砂圈，它是**内联**的，把标题的**文字**顶右了 17px（圈宽）+ 10px（锚点 `margin-right`）。而标题的**盒子**仍在版心左缘，段落、列表都从盒子起排——所以紧接着标题的分节块，左缘会比标题文字探出 27px。

修法**不能写死 27**：抽成 `--heading-mark-w` / `--heading-mark-gap` / `--heading-mark-advance` 三个变量，让标题规则与缩进规则引用同一来源。每个 `var()` 都带终值兜底——**这几个值正是 SVG 的尺寸，一旦解析失败，内联 SVG 会退回替换元素默认的 300×150 撑开**（这个坑单独踩过一次）。

### 2. 主题的列表圆点不是 `list-style`

`.post-content ul > li::before` 画一枚 5px 朱砂墨点 + 印泥晕，挂在 `left: -1.02em`（正文左缘之外）、`top: .68em`。两个后果：

- 想去掉圆点，**光写 `list-style: none` 一点用没有**，必须显式 `content: none`
- 那两个值是按正文的字号与行高推的，**凡在非正文语境复用 `<ul>`（小字、注脚、更大行距），墨点就会歪在文字左上方并探出左缘**

版权页两条都中了。当时还误判成「标题记号的 27px 偏移」，绕了两轮才找到真凶。

### 3. 版权页里的链接要另做待遇

版权页一写就是七八个外部链接。按主题默认（点缀色字 + 下划线）渲染，这块小字会比上面的正文还响。改成**字与谱录同色、只有下划线是点缀色**，悬停整块转色，并把外链那枚 `↗` 去掉（彩色下划线已经说明可点，再叠一个记号是重复的）。**代价要认**：新标签页打开这件事没有提示了（`target` 仍由渲染钩子照加）。

### 4. `markdownify` 在 0.165 上不包 `<p>`

自述那段原本用 `markdownify`，单段看不出问题；一旦写成两段，`.about-bio p { margin: 0 }` 会让两段贴死没有段间距。改用 `RenderString (dict "display" "block")`。

### 5. Hugo 会解析**围栏代码块里**的短代码

写手册时才发现：```` ``` ```` 不能豁免短代码——`{{< qr … >}}` 写在围栏里照样被当真的短代码执行（报错直接指到围栏内那一行）。要给用户看短代码原文，必须用 Hugo 的注释转义 `{{</* … */>}}`。**行内反引号同样拦不住**。这条影响所有「文档里演示短代码」的写法，记在这里备查。

## 验证

```
构建               零 error / warning（hugo v0.165.0 extended）
模板被选中          layouts/about.html 生效，未回落 single.html
i18n                三节标题与 socialGithub 等 key 全部解析成中文，无空串
CSS 进包            about-seal / xz-project / xz-colophon 等在产物中实测存在
存档结构            </h2> 后紧接 .xz-project / .xz-colophon，确认同级兄弟选择器命中
短代码闭合          四颗在 about 页与文章页两处均正确渲染
文档围栏            六份文档代码围栏全部成对
```

**未做**：**没有在浏览器里目视验证过**——四种外观组合（明暗 × 陶土/黛青）、窄屏、打印都没看过。视觉判断全部由站点作者人工确认，这篇档记录的是构建层与 DOM 层的实测。

## 涉及文件

```
layouts/about.html                          新增
layouts/shortcodes/nameplate.html           新增
layouts/shortcodes/social.html              新增
layouts/shortcodes/project.html             新增
layouts/shortcodes/colophon.html            新增
layouts/baseof.html                         data-frame 开关
layouts/partials/header.html                档位判据同步
assets/css/main.css                         「关于页」段 + 标题记号变量抽离
i18n/zh-cn.yaml                             socialGithub / Bilibili / Email / RSS
docs/writing.md / configuration.md / customization.md / design.md / README.md / licenses.md
CLAUDE.md（同步 AGENTS.md）
dev/archive/07-about-page.md（本文）· dev/archive/README.md · dev/README.md
dev/planning/uncovered-paths.md（登记未验证项）
exampleSite/content/posts/theme-writing-guide.md
```

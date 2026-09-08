# Xuanzhi（宣纸）Hugo 主题

自研 Hugo 博客主题（≥0.146 extended），设计语言：暖宣纸底、稿纸格纹、霞鹜文楷、墨阶排版、朱砂/黛青双点缀色。定位是"资产化"主题——源全在 Git、零第三方运行时依赖。

## 目录关系（重要）

- 本仓库 = 主题，独立 Git 仓库（远端未配置，勿 push）
- 配套博客站点：`F:\hugo_gcnanmu`（另一个独立仓库，主题以 **junction** 挂载：`F:\hugo_gcnanmu\themes\xuanzhi → F:\hugo_theme`，两个路径是同一目录；站点 `.gitignore` 已排除该 junction，勿删）
- 主题改动即时生效于站点，无需同步文件

## 常用命令

```bash
# 预览（1313 端口常被占，用 1314）
hugo server --source F:/hugo_gcnanmu --bind 127.0.0.1 --port 1314
# 构建
hugo --source F:/hugo_gcnanmu --gc
# 测试图生成（PowerShell 脚本，勿用 bash 内联传 $ 变量——会被吞）
powershell -NoProfile -ExecutionPolicy Bypass -File F:/hugo_theme/scripts/make-test-image.ps1
```

## 结构与规则

- `assets/css/token.css`：**全部设计 token**（色彩、字体、纹理 data-uri、分隔线用色，亮暗各一套）。改样式从这里进，禁止在别处硬编码颜色
- `assets/js/site.js`：全站唯一 JS（明暗切换、外观面板、代码复制、目录 scrollspy、长目录折叠）。新增交互必须并进这个文件
- 外观系统全走 `html` 的 `data-*` 属性 + CSS 变量：`data-theme`(light/dark)、`data-accent`(terracotta/indigo)、`data-bg`(5 种纸面纹理)、`data-hr`(4 种分隔线)；选择持久化在 localStorage（键前缀 `xuanzhi-`），`head.html` 内联脚本负责防闪烁恢复
- `layouts/` 是 0.146+ 顶层模板结构；`_markup/render-image.html`（page bundle 图片 → WebP/srcset）和 `_markup/render-heading.html`（标题毛笔圈点 + 锚点）是渲染钩子
- 图窗（点开看大图）：`render-image.html` 把每张正文图包进 `<a class="img-zoom" href="{最大档 WebP}">`——**这是渐进增强，不是唯一入口**，无 JS 时它就是「点开看原图」的链接，所以别把 href 换成 `#`。`site.js`「图片灯箱」段接管点击：开合 + ←→ 翻页 + 滚轮/双击缩放 + 拖动平移 + 双指捏合 + 窄屏滑动翻页 + Esc + 焦点锁/回焦。样式在 `main.css`「图片灯箱」段，遮罩取**同纸虚化**（当前纸色 90% + blur 10px，照片仍像贴在同一张纸上）、大图裱成**画框立轴**（`--lb-mat: 18px` 宽裱边 + `--color-frame` 细框 + 一道 `--color-zhu-soft` 内细边 + `--lb-shadow`），图注复刻 `.post-figure figcaption` 的题跋式两侧引线。`--lb-mat` 一变，`.lightbox-img` 的 max-width/height 里的 `calc` 会跟着走，别再写死 22px 之类的常数
- 首页 = 诗笺 + 红框封卡片两段：诗笺由 `home.html` 构建期 `resources.GetRemote` 预取绝句（`try` + 内置《鹿柴》兜底）、`site.js` 每次到访随机刷新（`lang=zh-Hant` 繁体）；**取到的诗要过校验**（标题 ≤12 字、每句 ≤16 字、至少两句，两处同口径）——诗泉偶尔返回带考据注释的条目，竖排诗笺会被撑爆，不合格就静默保留当前这首。卡片 = `partials/post-card.html`（结构：素纸 + 一道朱丝框 + 右上邮戳 + 右下角淡印 + 落款行）+ `partials/post-card-cover.html`（印记：front matter `cover` 自定义图，否则按标题哈希生成八式水墨小品——远山晓日/竹影/空亭听雨/汀洲孤雁/孤舟远影/红杏出墙/云岫/杨柳岸，定妆预览稿在 `static/images/covers/`）；印记由 CSS 压成 124×83、约 34% 不透明度 + 模糊 0.5px + 径向羽化，**因此不再套 feTurbulence 毛边滤镜**（那个浓度下看不出来，只白付每张卡的栅格化）；卡片颜色一律走 token（摘要/标签用 `--color-text-note`，题字字体栈 `--font-title` 宋体优先、无则落文楷）
- 朱饰系 token（`--color-zhu` / `--color-zhu-strong` / `--color-zhu-soft` / `--color-seal`）随 `data-accent` 换色：terracotta = 朱砂，indigo = 黛青（青印）；新增朱饰必须同步补 token 四象限（亮暗 × 双点缀色），别在组件里写死红值；`--tex-*` 纹理 token（`--tex-seal` / `--tex-bamboo` / `--tex-birds` 等 data-uri）的颜色烤在 URI 里，同样必须补齐亮暗 × 双点缀色四象限；无色遮罩类（`--tex-mask-paste` 印泥飞白 mask）单份即可
- 章界横线统一用 `--color-rule`（点缀色 28% 与 `--color-frame` 调和），随点缀色橘/青自动切换；正文「纸」系元素（纸底/格纹/折痕浅线）刻意不跟点缀色
- 头栏是半透明宣纸毛玻璃（`--color-header-bg` + backdrop-filter）；框架宽度分两档：窄 `--content-width` / 文章页 1150px（头栏与页脚同步变档）。档位切换动画由 `header.html` 末尾内联脚本驱动：sessionStorage 记上一页档位，仅档位不同才从上一档起步过渡，同档导航（文章→文章）与刷新一次成型不重播；动画期间给 `html` 挂 `xz-frame-anim` 暂停毛玻璃（`transitionend` 后撤），`xz-page-in` 同步正文淡入。两档宽度定义在 main.css「文章页阅读区更宽」段
- 分类法共四套页面，两个模板都是**分发器**：`taxonomy.html` 按 `.Data.Plural` 分流，`term.html` 按**父分类页**的 `.Data.Plural` 分流（term 页自身的 `.Data.Plural` 不可靠）
  - 分类索引 = 「通栏长架」（`partials/taxonomy-shelf.html`）：搁板用重复背景按行高画出（`--h` / `--gap-y` 同源），函套折到第几层都自动有完整一条通栏长板；≥800px 一排钉死 5 只、搁板两端出檐撑满 `.container` 的 800px，余下各 72px 摆淡墨线稿胆瓶（窄屏清供收起）
  - 标签索引 = 「印谱·印章墙」（`partials/taxonomy-sealwall.html`）：每个标签一方朱印，朱文/白文按奇偶相间，形制同文章页落款章（`--tex-mask-paste` 印泥毛边蒙版）；篇数边款是汉字数字（`seal-count.html` 支持 1–99，超出退回阿拉伯数字）；≤2 字的短标签印文竖排，>4 字收小一号
  - 分类词页 = 「打开函套」（`partials/term-category.html`）：顶边一排册脊 + 函面折痕 + 素纸签条写类名与篇数 + 右端「类」印
  - 标签词页 = 「钤在纸上」（`partials/term-tag.html`）：96px 朱印 + 印泥毛边 + 外圈极淡朱色晕；印面已写标签名，故 h1 用 `.sr-only` 视觉隐藏
  - term 页的文章列表复用归档的目录样式：`.term-page` 已并入 `.archive-month .post-item*` 那组选择器
- 归档页是**平贴纸面**的：年份下压一道折痕双细线（同文章页题跋），月份作**行内小朱印 + 汉字篇数**、月份之间只靠留白分开——**不要退回实色笺纸卡片**（全站唯一实色块，读起来像 UI 卡片，已返工）
- 长目录折叠：目录条目 >10 时 `site.js` 给 `.toc-memo` 加 `toc-fold`，CSS 以 `li:hover > ul` 划入展开、`li:has(> ul a.toc-active) > ul` 让阅读分支常开；缩进阶梯 = 每级一个 15px 墨签位，可展开条目的墨签锚在行盒 `a` 上
- 明暗切换圆形揭示：`site.js`「明暗切换」段写 `--theme-x/y/r`（**百分比**，理由见已知坑），`main.css`「明暗切换圆形揭示」段定义方向与 keyframes；方向靠「动画运行时 `data-theme` 已是新值」判定（dark 收缩旧快照、light 扩张新快照），改时长/曲线只动 main.css 两条 `animation`
- **公式构建期渲染**：`_markup/render-passthrough.html` 用 `transform.ToMath`（`output: htmlAndMathml`）在构建期把 LaTeX 变成静态 HTML，`head.html` 只按需引入 `katex.min.css`——客户端 `katex.min.js` / `auto-render.min.js` 已去掉（爬虫、禁 JS、RSS 阅读器现在都能拿到排好版的公式）
- **链接渲染钩子**：`_markup/render-link.html` 在**服务端**判断外链（`http`/`https` scheme 才算，`mailto:`/`tel:` 不开新标签），加 `class="link-external"` + `target`/`rel`；**别用 CSS 的 `a[href^="http"]` 判断**——站内绝对链接会被误伤
- **JSON-LD**：`partials/schema.html` 用 `dict` + `jsonify` 生成（文章页 `BlogPosting`、首页 `WebSite`），**必须 `| jsonify | safeJS`**，否则 `<script>` 的 JS 上下文会把它转义成一个带引号的字符串字面量
- **社交卡片**：`head.html` 里 `og:image` 优先取 front matter `cover`（裁 `1200x630`），无 cover 回落主题默认图 `static/images/og-default.png`（站点放同名文件即可覆盖）；`twitter:card` 随之用 `summary_large_image`；单页的 RSS 发现链接查 `site.Home.OutputFormats`（普通页的 `.OutputFormats.Get "rss"` 是 nil）
- **自定义 RSS**：`layouts/rss.xml`——`<description>` 走 `plainify`，完整正文放 `<content:encoded>` 并摘掉标题锚点那串内联 SVG（阅读器里没有 CSS 会变成乱码图形）
- **归档/分类页刻意不放摘要**：`.post-item` 是传统目录式（日期居左、点线引导、题名贴右），加一行摘要会破坏这个语言——试过又撤了，别再往上加。只有首页卡片带摘要：`.Summary | plainify | chomp | replaceRE \s+ " " | truncate`（`.Summary` 是 `template.HTML`，不 plainify 会带出各级标题文字）
- **打印样式**：`main.css` 末尾 `@media print` 是全站**唯一刻意不用 token 的地方**（打印必须黑白，宣纸底/夜墨底都要还原成纸），隐藏头栏/页脚/目录/外观面板，外链把地址印出来
- 正文 `<em>` 用**着重号**（`text-emphasis: filled dot` + `text-emphasis-color: var(--color-zhu)`）而不是斜体：`--font-sans` 是文楷，没有真斜体字面，浏览器合成假斜在汉字上很脏
- **滚动条**：滑块走 `--scrollbar-thumb`（token.css 里由 `color-mix(in srgb, var(--color-zhu) 55%, transparent)` 派生，随点缀色换朱砂/黛青，派生式写法不必补四象限）。作用域是 `html`（窗口那根竖向滚动条）+ 内容里**四个**横向滚动容器：`pre`、`.lntable`（chroma 带行号代码块，定义在 chroma.css，最容易漏）、`.table-wrap`、`.katex-display`
- **新增标记先问它是「装饰」还是「语义」**：装饰性的一律走朱饰系（`--color-zhu` / `--color-zhu-soft`），随 `data-accent` 换色——着重号、缩写点线、外链 ↗、锚点落点朱砂短竖、「续读」都是这一类；语义性的留墨阶——`strong` 浓墨、`del` 褪色、`dd`/`ul ul` 引导虚线（引导线要和墨阶一致，染色会喧宾夺主）
- `static/` 下约 30MB 是自托管资产（霞鹜文楷切片、思源宋体 700 切片、JetBrains Mono、KaTeX），属正常入库内容

## 已知坑（都踩过）

- goldmark passthrough 的启用键是 **`enable = true`**，写成 `enabled` 不报错但静默失效（行内公式 `\(` 会被当转义吃掉）
- Hugo 0.146+ 模板在 `layouts/` 顶层（`home.html`/`single.html`…），`site.MainSections` 返回字符串数组不是页面对象，`Pager.PageGroups` 已不可用（归档年分组用 `.Pages.GroupByDate "2006"`，月分组在年内嵌套 `GroupByDate "01"`；干支闲章按 `(年份-4) mod 10/12` 查天干地支表推算，别写死某一年）
- 分页器 Pager 只有 `.URL` / `.PageNumber` 等字段，**没有 `.RelPermalink`**——pagination partial 里写 `.RelPermalink` 只有一页时不炸，出现第二页才炸（已踩过）
- Hugo `int` 函数不接受进制参数，字符串转整数哈希用 `hash.FNV32a`
- 测试文章日期写成未来时间会"消失"（默认不渲染 future content）
- CSS mask 方案里 `background-color: transparent` 会让整条形状消失——mask 只管形状，颜色必须给非透明 `background-color`
- SVG 图标 path 一律从官方 npm 包取（`@material-design-icons/svg`），不凭记忆手写
- 印记容器 124×83（窄屏 104×70）且 SVG 用 `slice` 铺满，四周径向羽化——关键元素要落在 viewBox 的**中间六七成**里，贴着边角的形状会被羽化吃掉
- 水墨小品的语言约定：疏笔淡墨、大面积留白，**要有"场景"**（地面/水面/墙脚之类的一条线，加浓淡分层做远近），线条为主、忌实心大色块与机械直线；单式元素别太少——只有两竿竹浮在空中、或一条船配两道水，缩成淡印后就成了孤零零几笔（都返工过）；同一式的形状在 `post-card-cover.html` 与 `static/images/covers/` 预览稿两处同步
- View Transitions 的快照盒在**浏览器缩放≠100% 时不按 CSS 像素取尺寸**（Edge 页面缩放 125% 实测圆心大幅偏移）：圆形揭示的圆心/半径必须写**百分比**（对 `root.clientWidth/clientHeight` 取比例，半径对 `sqrt(w²+h²)/√2` 解析基准取比例），绝对 px 只在 100% 缩放下正确（已踩过）
- `<details>` 收起瞬间内容即被移出渲染树，CSS 做不了退出动画——收合动画必须挂在 `::details-content` 伪元素上并配合 `interpolate-size: allow-keywords`（Chrome 131+/Safari 18.2+，Firefox 回退瞬时收合，可接受）
- Git Bash 里 grep 生成的文件清单带 CRLF，直接拼进 curl URL 会报 `(3) Malformed input to a URL function`——先 `tr -d '\r'`（思源宋体 97 个切片批量下载时已踩）；另外批量下载 jsdelivr 切片逐个串行即可，并发 xargs 全军覆没过
- 写死的行高/字号推导（如落款章 `height` 撑竖排换列）会随配置漂移——文末落款章已改为 `split` 逐字入 grid 格、模板按字数算行列，别再回退到文本流换行
- 同一容器的内阴影会被自身 `z-index:-1` 的伪元素盖住（容器背景层画在负 z 子元素之前），挂 `filter: blur` 又会把阴影一起糊掉——归档笺纸的分层就是为此：纸面在 `::before`（负 z + blur），起伏阴影单独一层 `::after` 盖在纸面上（`pointer-events: none`），要浮到最上层的元素（月份引首章）给正 `z-index`
- MPA 每次导航都是新文档：宽度档位过渡若交给 defer 脚本，会先按最终宽度画一帧再拽回起步宽度，必闪——起步宽度必须在 `header.html` 末尾内联设置（解析到即执行、早于首帧）；且仅当前后档位不同才播（sessionStorage 记上一档），否则文章→文章也闪（旧实现两样都踩过）
- 行内元素跨行后包围盒不可靠：abs-pos 伪元素锚在跨行 span 上，`top:50%` 会落到整块中间——要贴行定位的伪元素（目录墨签、归档朱砂短竖）改锚块级行盒，或用 `top:0.5lh`（行高的一半）锚首行字面。**别用 `0.5em`**：span 一旦成了 flex 项就会被块级化，盒高是整行行高而不是字号，`0.5em` 会跑到文字上方约 10px（归档朱砂短竖踩过）
- 通用子选择器会压过组件自己的定位：`.card > *:not(.print){position:relative}` 的特异性（0,2,0）高于 `.postmark{position:absolute}`（0,1,0），后者被强制成 `relative`、`right` 失效，邮戳掉回文档流左上角——写这种"给所有子元素加定位"的规则时，要把绝对定位的子元素一并 `:not()` 掉
- CSS 动画/过渡的时钟从**样式计算**就开跑，不等首帧绘制：首屏要几百毫秒的页面，450ms 的动画在画面出来时已跑掉大半（实测动画 313ms 起步、763ms 结束，而 FCP 908ms）。跨页动画必须等第一帧画出来再放开（双 `requestAnimationFrame`），放开前用 `xz-page-hold` 把正文按住（并加 setTimeout 兜底，免得 rAF 没跑到就把正文永久扣住）
- 淡印类元素的浓度要按**最终叠乘**估：印记整体 34% × 元素自带 0.4–0.5 的不透明度，有效浓度只剩一成多，横向色带一淡就没了形状——所以八式里横向实色带全改成了笔线，且淡印里别再叠最淡一档的墨（`--color-text-secondary`）
- backdrop-filter 毛玻璃叠宽度动画：模糊区随每帧尺寸重算重绘，是动画卡顿最大来源——框架动画期间挂 `xz-frame-anim` 暂停毛玻璃，`transitionend` 后恢复（另加 setTimeout 兜底，transitionend 偶发不触发）
- 全屏遮罩层用 `position:absolute`、被遮的内容用 `static` 时，**遮罩会盖在内容之上**：定位元素绘在流内元素之上。图窗第一版就是这样——图片被遮罩挡掉，滚轮/拖动/滑动全部失灵，图还被洗淡（看着像"渲染正常"）。遮罩里的内容必须自己进定位层（`.lightbox-figure` 给 `position:relative`），或在 DOM 里排在遮罩之后且同样定位
- `<script>` 里输出 JSON 必须 `jsonify | safeJS`：html/template 把 `<script>` 当 JS 上下文，只写 `{{ . | jsonify }}` 会被转义成一个**带引号的字符串字面量**，页面看着正常、`JSON.parse` 却拿到字符串（JSON-LD 踩过，表现为 `Object.keys` 全是数字下标）
- `:target` 的 `:is(...)` 白名单要**含 h1**：给标题加落点标记时只写了 h2–h6，正文 h1 永远匹配不到——而 h1 恰恰是"最少见、最容易漏测"的那一档
- PowerShell 5.1 把**无 BOM 的 UTF-8 `.ps1` 按 GBK 读**：脚本里写中文字面量（连注释也算）会让解析器报 `MissingEndParenthesisInMethodCall`。生成 OG 图的脚本踩过，改成全 ASCII + `[char]0x5BA3` 取字形才通

## 相关文档

- `README.md`：站点引入方式（junction → submodule）、主题配置项、字体更新方法
- git stash 里有失败的书桌场景实验（`desk scene experiment`），仅作参考，未验收

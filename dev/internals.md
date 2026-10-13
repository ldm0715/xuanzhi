# Xuanzhi · 关键信息（坑与决策）

> 本文**只记代码里看不出来的东西**：踩过的坑、以及"为什么是这样"的决策理由。**实现细节一律以代码为准**——类名、数值、partial 清单、版式步骤都不在此复述（读代码即得，写在这里只会过时）。改代码前的必读约定见 `../CLAUDE.md`，待办见 [`todo.md`](todo.md)。

## 一、Hugo / 模板层的坑

- **i18n key 必须扁平**：`i18n "a.b"` 这种点号嵌套访问**不报错、静默返回空串**，界面上的字直接消失。
- **`<script>` 里输出 JSON 必须 `jsonify | safeJS`**：只写 `jsonify` 会被 html/template 按 JS 字符串字面量再转义一次，`JSON.parse` 拿到的是字符串而非对象。
- **`resources.Concat` 按目标路径缓存**：同一模板给不同内容拼产物时目标名必须区分，否则先算出来的那份被复用给所有页面，**结果随构建顺序漂移**。
- **`resources.Get` 站点先于主题**：站点放同名文件即可覆盖主题的（改颜色、`og-default.png` 都靠这个）。
- **`site.MainSections` 是「页数最多的顶层栏目」**（站点没配 `params.mainSections` 时），不是"所有栏目"——站点多一个页数更多的栏目，文章会**静默**从首页与 RSS 消失，站点须配 `[params] mainSections`。
- **goldmark passthrough 的键是 `enable = true`**：写成 `enabled` 不报错但静默失效。
- **短代码是否闭合由模板里有没有引用 `.Inner` 决定**——`nameplate` / `project` / `colophon` / `playlist` 因此是闭合短代码，改它的闭合方式等于改写法约定（站点内容 / 文档 / 示例必须同一次改完）。
- **Hugo 会解析围栏代码块里的短代码**：要展示短代码原文必须用 Hugo 注释转义 `{{</* … */>}}`，行内反引号也拦不住。
- **`markdownify` 在 0.165 上不包 `<p>`**（单段看不出，两段会贴死），改用 `RenderString (dict "display" "block")`。
- **删/建 partial 后 Hugo 的 watcher 不一定重建**：没生效就重启 `hugo server`。
- `layouts/list.html` 是归档专用、不渲染 `.Content`——无日期的内容直接套它会掉进「0001 年」组。
- Pager **没有** `.RelPermalink`；`site.MainSections` 返回字符串数组不是页面对象；`Pager.PageGroups` 已不可用。未来日期的内容默认不渲染。

## 二、CSS / 浏览器层的坑

- **元素自己写了 `display` 时 `hidden` 属性会失效**（UA 规则特异性低于作者的 `display:flex`）——必须显式补 `[hidden]{display:none}`。
- **列表圆点不是 `list-style`**：想去掉必须显式 `content: none`；且那两个偏移值按正文字号行高定的，**非正文语境复用 `<ul>` 时圆点会错位并探出左缘**。
- **全屏遮罩用 `position:absolute`、被遮内容 `static` 时，遮罩会盖在内容之上**——遮罩里的内容必须自己进定位层。
- **弹层别留在流里**（一出现会把锚点元素顶跑），以及**绝对定位 + `right:0` 的元素要给宽度**（可用宽度可能只有一个图标那么小）。
- **通用子选择器会压过组件自己的定位**（如 `.card > *:not(.print){position:relative}` 会压掉邮戳的 `absolute`）——写这类规则要把绝对定位的子元素一并 `:not()` 掉。
- **CSS 动画的时钟从样式计算就开跑、不等首帧绘制**——跨页动画必须等第一帧画出来再放开（双 rAF + 兜底）。
- **`<details>` 收起瞬间内容即被移出渲染树**，退出动画只能挂 `::details-content` + `interpolate-size`。
- **行内元素跨行后包围盒不可靠**——贴行定位的伪元素改锚块级行盒或用 `top:0.5lh`，**别用 `0.5em`**（span 成 flex 项会被块级化）。
- **View Transitions 快照盒在浏览器缩放 ≠100% 时不按 CSS 像素取尺寸**——圆形揭示的圆心 / 半径必须写百分比。
- 内阴影会被自身 `z-index:-1` 的伪元素盖住，挂 `filter: blur` 又会连阴影一起糊掉。
- **淡印类元素的浓度要按最终叠乘估**（容器 50% × 元素自带不透明度，有效浓度只剩两成）。
- backdrop-filter 叠宽度动画是卡顿最大来源——动画期间要暂停毛玻璃。
- `:target` 的白名单要**含 h1**；CSS mask 里 `background-color: transparent` 会让形状整体消失。

## 三、关键决策（为什么是这样，别轻易推翻）

- **`nameplate` / `project` / `colophon` 是闭合短代码**：名号与内容体要同处一栏，而它们在 DOM 里是平级兄弟，CSS 排不了，必须有个盒子包住。（左栏宽度是量出来的，不是拍的。）
- **关于页不器物化**（不套框 / 印 / 站语）——那件"器物"本身没分量时硬套，套出来的是装饰。
- **归档 / 分类页刻意不放摘要**：`.post-item` 是传统目录式（日期居左、点线引导、题名贴右），加摘要破坏这个语言，**试过又撤了，别再往上加**；只有首页卡片带摘要。
- **首页卡片落款行：标签按实际宽度动态取舍，只能由 JS 做**（CSS 数不出「塞得下几枚」）；放不下的收进 `+N`，全放得下就不出。判据用「容器溢没溢出」，别做宽度算术——余量常常只有几像素。
- **`+N` 必须待在 `.inkcard-tags` 之外**（那容器会裁剪，放里面会被超长标签一起裁掉）；「续读」的 `margin-left:auto` 同理别动——它钉在右缘是位置语言。
- **改 `.inkcard-tag` 的 `display` 会连坐分隔线**：那几条细竖线都是 `::before`，父级从 `inline-flex` 变 `block` 后它们退化成 inline 盒、宽高失效，整条消失。
- **验落款行要把字体样式表引全**：`@font-face` 不在主 CSS 里（在 `/fonts/...` 那几张），只引主 CSS 浏览器就用回退字体排版，量出来的宽度全是错的。
- **归档不能退回实色笺纸卡片**（全站唯一实色块，读起来像 UI 卡片，返工过）。
- **公式在构建期渲染**（`transform.ToMath`）而非客户端——爬虫、禁 JS、RSS 阅读器都要能拿到排好版的公式。
- **外链在服务端渲染钩子里判定**，不用 CSS `a[href^="http"]`（会误伤站内绝对链接）。
- **站内搜索用 Pagefind**：中文分词是自己造不出来的那块。
- **媒体播放器用第三方库**（Plyr / APlayer）：真正的难点是 seek 节流、缓冲状态机、移动端自动播放策略。开发中曾出现"播放中途卡住"、**根因始终未定位**——换库是权衡**不是确诊**；若根因在网络 / 素材 / 浏览器策略上，换库会以完全相同的方式复现。
- **新增标记先分「装饰 / 语义」**：装饰性走朱饰系（随点缀色换色），语义性留墨阶。
- **评论验证码（Turnstile）**：挂件落点与尺寸在 Waline 里写死（面板页脚第一格、compact），主题包了 `turnstile.render`——落点换到面板下面自己造的一行、尺寸改 flexible、明暗随站点、挑战一过摘掉挂件。三处都栽过：**面板所在的 `.wl-comment` 是不换行的 flex 行**，不先开 wrap 塞节点只会跟面板并排；**空容器上的 flex 声明会凭空占掉一整行**（页脚那次把按钮顶下去了）；**flexible 按容器当时的宽度算**，得在渲染前就把宽度让出来。**别提前占住 `window.turnstile`**——CF 的 api.js 有「该全局已存在就拒绝初始化」的守卫，占了位挂件根本出不来；钩子要挂在它那个 `<script>` 的 load 事件上。

## 四、维护要点（升级 / 部署时容易漏）

- **vendor 升级必做两步**：① 删末行 `//# sourceMappingURL=`（`.map` 没 vendor 会 404；且它不以换行结尾、参与 `Concat` 会把后一个文件的首行整行吞掉，构建不报错、运行时才炸）；② Plyr 的 `plyr.svg` 必须 vendor 到 `static/`（运行时取，不走构建管线）。
- **KaTeX 的 CSS 版本必须与 Hugo `transform.ToMath` 的输出匹配**（现代类名 `.sizing`；旧版上下标不缩、不抬起）。
- **字体两半放**：`@font-face` CSS 在 `assets/fonts/`、woff2 切片在 `static/fonts/`，两边**相对位置必须一致**（CSS 里是相对引用）。
- **站内搜索多一个构建步骤**：部署要跑 `npx pagefind --site public`；`hugo server` 看不到搜索结果。
- **发布**：版本号唯一出处是 `CHANGELOG.md`，格式 `## [x.y.z] - YYYY-MM-DD`，否则发版 workflow 拒绝；包里放什么由根 `.gitattributes` 的 `export-ignore` 决定（不是 workflow）。
- **GitHub Pages 部署**：环境预置了只允许 `main` 的部署分支策略，仓库是 `master` 会导致 **build 绿但 deploy 挂**——去 Settings → Environments 加 `master`。

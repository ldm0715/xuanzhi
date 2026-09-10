# 写作约定

## 图片：与文章同目录（page bundle）

一篇文章连同它的图片放进同一个文件夹，这就是 Hugo 的 **page bundle**：

```
content/posts/my-post/
├── index.md
└── photo.jpg
```

正文直接写 `![说明](photo.jpg)`。构建时自动做三件事：

- 压缩并转 **WebP**，生成三档**响应式 srcset** + 懒加载
- 每张图包一层指向最大档的链接——点图进入**图窗**（放大镜浏览，见 design 篇）
- 图窗里的题跋图注按这个优先级取：`![说明](photo.jpg "图注")` 的 `title`，没有则退回 `![说明]` 的 `alt`

**不要把图片放到外部图床**——图片和文章在同一个 Git 仓库里，是本主题和整个博客架构的根基约定（本地所见即所得、整站可镜像）。远端的图（HTTP 图）不会被压缩管线处理，只按原图展示。

## 公式：构建期渲染

公式用 goldmark passthrough 的定界符，在**构建期**被 KaTeX 渲染成静态 HTML（客户端不加载脚本）：

- 行内：`\( E = mc^2 \)`
- 块级：`\[ ... \]` 或 `$$ ... $$`

```markdown
质量与能量：\( E = mc^2 \)。

块级公式：
\[
  \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
\]
```

这套定界符需要在 `hugo.toml` 里开 passthrough（见 [configuration.md](configuration.md)），否则公式会以原始 LaTeX 露在页面上。

## 代码块

围栏代码块走 Chroma 高亮，双明暗两套配色（变量驱动）、右上带复制按钮：

````markdown
```go
func main() { fmt.Println("hello") }
```
````

明暗跟随需要 `markup.highlight.noClasses = false`（见配置篇）。

## 标题与锚点

- 每个标题渲染时带毛笔圈点记号 + 锚点链接（悬停出现），正文 h1 也有落点朱砂短竖
- 想在标题上写死锚点 ID：`## 小节 {#my-anchor}`（需开 `attribute.block`）

## 短代码

### 内容类

- **`details` 书函折叠块**（可折叠内容）：默认标签是「展卷」，用 **`summary=`** 改：

  ```markdown
  {{< details summary="答案" >}}
  折叠起来的内容……
  {{< /details >}}
  ```

  > **别用 `title=`。** 那是 HTML 的 `title` 提示属性，写了会让可见标题消失、只剩悬停提示。
  > 主题为了兼容旧内容仍然认它（`summary` 缺席时把 `title` 当标题用），但新内容一律写 `summary`。

- **`qr`**：包装 Hugo 内置二维码。**文字体用 `text=` 传，并且要自闭合**：

  ```markdown
  {{< qr text="https://example.com" level="high" />}}
  ```

  默认 `alt` 已设为编码文本，另有 `level`（容错级别）/ `scale`（尺寸，默认 4）。
  > 这里有两个会直接让构建失败的坑：① 写成 `{{< qr "https://…" >}}`（位置参数）**取不到值**——
  > 短代码只读 `.Get "text"` 与 `.Inner`，位置参数不在其中；② 它引用了 `.Inner`，
  > 所以**必须闭合或自闭合**，漏了会报 `must be closed or self-closed`。

### 关于页

关于页不是普通文章。**三件事要配，都在你自己仓库里，主题不用改。**

**① 建 `content/about.md`**，front matter 至少写这两行：

```yaml
---
title: "关于"
layout: "about"    # 不写就落到普通文章模板，会带上日期、字数、上下篇导航
frame: "narrow"    # 不写，头栏与页脚会按文章页展开到 1150px，比 800px 的正文宽出一截
---
```

> `frame` 是主题认的页面级开关，只对这一页生效。文章页不需要写（它们本来就该宽）。
> 页面级开关与站点级配置的分工见 [configuration.md](configuration.md)。

**② 加进头栏**——导航只认 `hugo.toml` 的菜单，不写这条，页面建好了也不出现在头栏：

```toml
[[menus.main]]
  name = '关于'
  pageRef = '/about'
  weight = 40
```

**③ 正文写普通 markdown**——分节标题自己写 `##`，结构件用下面四颗短代码。
**不存在私有的 front matter schema**：那一版做不出层次，换个人用也对不上字段。

完整的样子：

```markdown
---
title: "关于"
layout: "about"
frame: "narrow"
---

{{< nameplate name="宫城楠木" seal="宫" role="独立开发者 · 居杭州" >}}

写代码，也写字。……

{{< social github="https://github.com/…" bilibili="https://…" email="mailto:…" rss="/index.xml" >}}

## 在做的事

{{< project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="https://…" >}}
一句话描述，可以用 markdown。
{{< /project >}}

## 关于本站

{{< colophon >}}
- **本站** 引擎 `Hugo` · 主题 **宣纸 xuanzhi**（原创）
- **许可** 主题 MIT
{{< /colophon >}}
```

| 短代码 | 用途 | 必填 | 可选 | 是否需闭合 |
|---|---|---|---|---|
| `nameplate` | 引首印 + 名号 + 身份 | `name` | `seal` `role` | 否 |
| `social` | 带图标的联系行 | — | `github` `bilibili` `email` `rss` | 否 |
| `project` | 一个项目条目（题录式） | `name` | `code` `year` `status` `tags` `url` `archived` | **是** |
| `colophon` | 页尾版权页小字 | — | *（无参数）* | **是** |

**`nameplate`** —— `seal` 是印面字，缺省取名号首字；`role` 是身份那一行：

```markdown
{{< nameplate name="宫城楠木" seal="宫" role="独立开发者 · 居杭州" >}}
```

**`social`** —— 四项都可选，**至少给一个**，只渲染传了值的；`email` 写 `mailto:`，`rss` 一般写 `/index.xml`：

```markdown
{{< social github="https://github.com/…" bilibili="https://…" email="mailto:…" rss="/index.xml" >}}
```

标签文案走 i18n（`socialGithub` 等），想改「Email」为「邮箱」就在站点自己的 `i18n/zh-cn.yaml` 里覆盖。
图标里 github / bilibili 是品牌标识，取自 Simple Icons（CC0），不在 Material 那套里——出处见 [licenses.md](licenses.md)。

**`project`** —— `tags` 用逗号分隔（`"Hugo, CSS, Go"`，会自动 trim）；`archived="true"` 时状态印从朱文换成白文：

```markdown
{{< project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="https://…" >}}
一句话描述，可以用 markdown。
{{< /project >}}
```

**没给 `url` 就渲染成纯文字**——已归档、没入口的项目不该给一个点不进去的链接。
多条连着写就是一个条目列表，外面不用包容器（分隔线由 CSS 画在相邻两条之间）。

**`colophon`** —— 内容体是普通 markdown，一行一条写成无序列表：

```markdown
{{< colophon >}}
- **本站** 引擎 [Hugo](https://gohugo.io) · 主题 **宣纸 xuanzhi**（原创）
- **许可** 主题 MIT · 旧文与代码见 GitHub
{{< /colophon >}}
```

这颗短代码只做一件事：**把内容从正文体量压低到注脚体量**——字号 0.84rem、行距拉开、
列表去圆点、行首加粗词对齐成标签列。

为什么需要这一层：正文默认字号（17px 楷体）是给阅读用的，而版权页是
"顺手交代几句出处"的注脚，不压一档就会和上一段正文字对字地抢读。
去掉这颗短代码、直接写 markdown 的话，它就会退回正文体量——**试过，很难看。**

试过另一条岔路也撤了：把它做成一枚藏书票（双线朱框 + 白文站名印 + 站语）。
那套形制要成立，就得替文字体决定印面取哪个字、站语用哪一句——可这一节
不值得为它规定这么多。**不是每节都非得是件器物。**

一行一条**要写成无序列表**——连续几行普通文本会被 markdown 并成一个段落，
软换行在 HTML 里塌成空格，几条会挤成一行。顶层列表的圆点已由 CSS 去掉
（注意：主题的列表圆点是 `li::before` 伪元素画的，不是 `list-style`，
所以这里必须显式 `content: none`，光写 `list-style: none` 去不掉）。

**这一节里的链接是特殊待遇**：字与谱录同色，只有下划线是点缀色，悬停整块转色，
外链那枚 `↗` 也去掉了。版权页一写就是七八个外部链接，全按主题默认渲染会让这块
小字比上面的正文还响。写法不用变（照写 `[Hugo](https://gohugo.io)`），样式自己接上。

四颗都遵循主题的短代码约定：不引用 `.Inner` 的可以自闭合，引用了的（`project` / `colophon`）必须闭合，
否则 Hugo 会报 `must be closed or self-closed`。

Hugo 内置的 `highlight` 等短代码同样可用；`relref` 适合站内互链。详见 `exampleSite/content/posts/shortcode-demo.md`。

### 媒体类

分工是：**外部平台用裸 iframe，自托管媒体用短代码**。bilibili / YouTube 没有可直链的媒体文件，短代码不去假装能包住它们。

自托管媒体由两个成熟库渲染——**视频走 Plyr、音频走 APlayer**（APlayer 只做音频）。它们在 `assets/vendor/`，出处与版本见那里的 `README.md`；两个库合计约 212KB，所以只有**真正嵌了媒体**的页面才会把它们拼进产物（`head.html` 用 `.HasShortcode` 判断）。皮肤覆写在 `main.css` 的「播放器」一节，**不要改 vendor 里的文件**，升级会被冲掉。

| 短代码 | 用途 | 是否需闭合 |
|---|---|---|
| `video` | 单个视频 | 否 |
| `audio` | 单个音频 | 否 |
| `playlist` | 音频播放列表 | **是** |

**`video`** —— `src` 必需，另有 `poster` / `caption` / `start`（起播秒数）/ `loop`：

```markdown
{{< video src="/media/demo.mp4" poster="/media/cover.jpg" caption="片头三十秒" start="12" >}}
```

**`audio`** —— `src` 必需，另有 `title` / `artist` / `cover` / `lrc` / `start`：

```markdown
{{< audio src="/media/nocturne.mp3" title="夜曲" artist="肖邦" >}}
```

**`playlist`** —— 内容体写 YAML 列表，每项字段同上：

```markdown
{{< playlist >}}
- title: 夜曲
  artist: 肖邦
  src: /media/nocturne.mp3
  cover: /media/nocturne.jpg
  lrc: /media/nocturne.lrc
- title: 雨滴
  artist: 肖邦
  src: /media/raindrop.mp3
{{< /playlist >}}
```

为什么单曲和列表是两颗短代码、而不是一颗加参数：Hugo 是按**模板里有没有引用 `.Inner`** 来决定短代码要不要闭合的。一旦引用了 `.Inner`，`{{< audio src="…" >}}` 这种单曲写法就会被判成「未闭合」而构建失败（报 `must be closed or self-closed`）。拆开之后两种写法都自然。列表之所以用 YAML 而不是管道分隔的一行一曲，是因为标题里出现分隔符就崩。

歌词由 APlayer 自己去拉 `.lrc`（标准 `[mm:ss.xx]词` 格式，`[offset:±ms]` 也认），所以 `.lrc` 和音频放一起、在曲目里写 `lrc:` 指过去即可。有一处默认值会静默坑人：**APlayer 的 `lrcType` 默认是 0（不显示歌词）**，主题已在 `player-audio.html` 里按「有没有 lrc」自动设成 3，不用你管。

**封面要单独给，不会从音频文件里自动取**——Hugo 读不了 FLAC / MP3 的内嵌元数据。这两个库都不做这件事，是构建期的能力问题，不是配置漏了。很多音频文件其实自带封面，抽出来就行：

```bash
ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg
```

没给 `cover` 时 APlayer 显示一块**点缀色**方块（它把封面底色设成主题色），不会留空洞。

播放列表默认折叠（`listFolded`），点一下展开；多首之间、以及音视频之间都会互相打断。

媒体路径写 `/media/…` 或 `media/…` 都会过 `relURL` 归一化；`http(s)://`、`//`、`data:` 开头的一律原样放行。

## 首页卡片的印记（封面）

每张首页卡片右下角有一枚淡印。默认按文章标题哈希自动生成八式水墨小品（远山晓日 / 竹影 / 空亭听雨 / 汀洲孤雁 / 孤舟远影 / 红杏出墙 / 云岫 / 杨柳岸），**同一篇文章永远同一幅**。想换成自己的图，在 front matter 给 `cover`：

```yaml
---
title: "我的文章"
cover: "cover.jpg"   # page bundle 内的文件名，或以 / 开头的静态图片路径
---
```

自定义图会经图片管线压成 WebP；社交分享的 `og:image` 也取这张 `cover`（裁成 1200×630），没填就用主题默认图。

## 内容形态速查

主题对 markdown 各类语义元素都有版式：脚注、表格（宽表自动套滚动容器）、任务列表（盖章式方框）、删除线、定义列表、嵌套引用（分级），以及 `<mark>` / `<kbd>` 等内联语义。写法样例见 `exampleSite` 里的 `markdown-elements.md` 与 `long-form.md`。

正文允许少量手写 HTML（需开 `unsafe = true`），例如语义标签、裸 `<figure>`。

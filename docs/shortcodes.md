---
title: "五、短代码参考"
date: 2026-09-10T10:00:00+08:00
weight: 50
description: "折叠块、二维码、代码高亮、站内引用、视频音频，以及关于页的四颗短代码"
tags:
  - 短代码
  - 媒体
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- [二、安装与升级](installation.md)
- [三、站点配置](configuration.md)
- [四、写作](writing/index.md)
- **五、短代码参考**（当前篇）
- [六、自定义](customization.md)
- [七、部署](deployment.md)
- [八、常见问题](troubleshooting.md)
- [九、设计理念](design.md)
- [十、许可](licenses.md)
{{< /details >}}

短代码（shortcode）是 markdown 之外的扩展通道：在正文里写一对 `{{</* … */>}}`，构建时被替换成一段结构化的 HTML。这一篇列全主题与 Hugo 内置的可用短代码及其参数。

正文本身怎么写见[写作](writing/index.md)。

## 内容类

### `details` · 折叠块

正文里可以折起来的一段，形制是一封旧木函。里面**整体是一张纸**——放列表、多段、代码块都共用同一张纸面，不会一格一块。

```markdown
{{</* details summary="答案" */>}}
折叠起来的内容……
{{</* /details */>}}
```

{{< details summary="点开看看：墨的五阶" >}}
焦、浓、重、淡、清。黄宾虹说「画用焦墨与宿墨，是求其苍老」——博客排版用不上焦墨，但折叠块里可以放很多字而页面依然干净。
{{< /details >}}

> **别用 `title=`。** 那是 HTML 的 `title` 提示属性，写了会让可见标题消失、只剩悬停提示。主题为了兼容旧内容仍然认它（`summary` 缺席时把 `title` 当标题用），但新内容一律写 `summary`。

### `qr` · 构建期生成二维码

```markdown
{{</* qr text="https://example.com" level="high" */>}}
```

{{< qr text="https://example.com" level="high" />}}

二维码在**构建时本地生成**，零网络依赖。参数：`text`（要编码的内容）、`level`（容错级别，默认 `low`）、`scale`（尺寸，默认 4）。`alt` 默认就是编码的文本。

> 这里有两个会**直接让构建失败**的坑：
> ① 位置参数无效——写成 `{{</* qr "https://…" */>}}` 取不到值，短代码只读 `.Get "text"`；
> ② 必须自闭合或闭合——它引用了内容体，漏了尾巴会报 `must be closed or self-closed`。

### `highlight` · 带行号与高亮的代码块

围栏代码块不够用时（要给行号、要高亮某几行）用这个，参数是 Chroma 的那套：

```markdown
{{</* highlight go "linenos=table,hl_lines=3-4,linenostart=100" */>}}
package main
{{</* /highlight */>}}
```

{{< highlight go "linenos=table,hl_lines=3-4,linenostart=100" >}}
package main

// Grind 研墨：水越多墨越淡
func Grind(ink string, water float64) string {
    return ink
}
{{< /highlight >}}

上面这一块：左侧行号从 100 起算，第三、四行带高亮背景。

### `relref` · 站内引用（带构建期链接检查）

**写法：**

```markdown
去看[站点配置]({{</* relref "configuration.md" */>}})。
```

**效果：**

去看[站点配置]({{< relref "configuration.md" >}})。

生成站内绝对链接，且**引用不存在的页面会直接让构建失败**——它同时是个链接检查器，很适合放在「相关阅读」里。

## 媒体

主题的立场是**外部平台用裸 iframe，自托管媒体用短代码**。bilibili、YouTube 没有可直链的媒体文件，短代码不去假装能包住它们。

### 外部平台：直接写 iframe

主题把所有 iframe 统一接管成全宽、16:9、圆角，所以裸 iframe 就有正确版式：

```html
<iframe src="//player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1"
        scrolling="no" frameborder="no" allowfullscreen="true"></iframe>
```

<iframe src="//player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1&autoplay=0&danmaku=0" scrolling="no" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

Hugo 还内置了一个 `youtube` 短代码（构建期零网络依赖，只是生成一个隐私模式的 iframe）：

```markdown
{{</* youtube dQw4w9WgXcQ */>}}
```

{{< youtube dQw4w9WgXcQ >}}

> **为什么主题不把外部平台也包成短代码**：Hugo 历史上反复废弃、移除、更名视频类短代码（`tweet`→`x`，`gist` 已除名）。依赖它们会让主题和特定 Hugo 版本绑死。裸 iframe + 主题 CSS 接管对版本变化免疫。

### 自托管：`video` / `audio` / `playlist`

文件在你自己手里的视频和音频，交给两个成熟库渲染——**视频走 Plyr、音频走 APlayer**。播放器难的不是控件外观，是 seek 节流、缓冲状态机、移动端自动播放策略这些边界。

两个库都在 `assets/vendor/`，**只有嵌了媒体的页面才会加载**（合计约 212KB，不放媒体的页面一个字节都不多背）。

| 短代码 | 用途 | 是否需闭合 |
|---|---|---|
| `video` | 单个视频 | 否 |
| `audio` | 单个音频 | 否 |
| `playlist` | 音频播放列表 | **是** |

#### `video`

`src` 必需，另有 `poster` / `caption` / `start`（起播秒数）/ `loop`。**写法：**

```markdown
{{</* video src="https://mdn.github.io/shared-assets/videos/flower.mp4" caption="Plyr 接管：播放、可拖进度、时间、音量、全屏，控件文案走主题 i18n。" */>}}
```

**效果**（`start` 在元数据就绪后定位，`loop` 走原生属性）：

{{< video src="https://mdn.github.io/shared-assets/videos/flower.mp4" caption="Plyr 接管：播放、可拖进度、时间、音量、全屏，控件文案走主题 i18n。" >}}

> 这一例用的素材是 MDN 的可自由分发素材（CC0）。

#### `audio` · 单曲

`src` 必需，另有 `title` / `artist` / `cover` / `lrc` / `start`。**写法：**

```markdown
{{</* audio src="https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3" title="T-Rex Roar" artist="MDN shared-assets（CC0）" lrc="/media/demo.lrc" */>}}
```

**效果：**

{{< audio src="https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3" title="T-Rex Roar" artist="MDN shared-assets（CC0）" lrc="/media/demo.lrc" >}}

歌词面在播放器下方，随播放高亮当前行并自动滚动；点歌词行可以跳到对应位置。（这一例的歌词文本与音频内容无关，只为演示歌词面本身。）

#### `audio` · 播放列表

曲目多了就用短代码内容写 YAML——**不用管道分隔的一行一曲**，因为标题里出现分隔符就崩。播放列表默认折叠，点一下展开。**写法：**

```markdown
{{</* playlist */>}}
- title: T-Rex Roar
  artist: MDN shared-assets（CC0）
  src: https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3
  lrc: /media/demo.lrc
- title: Countdown
  artist: MDN shared-assets（CC0）
  src: https://mdn.github.io/shared-assets/audio/countdown.mp3
{{</* /playlist */>}}
```

**效果：**

{{< playlist >}}
- title: T-Rex Roar
  artist: MDN shared-assets（CC0）
  src: https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3
  lrc: /media/demo.lrc
- title: Countdown
  artist: MDN shared-assets（CC0）
  src: https://mdn.github.io/shared-assets/audio/countdown.mp3
{{< /playlist >}}

> APlayer 在只有一首曲目时不渲染列表，所以要两条以上。

#### 关于 `video` / `playlist` 的一处设计

单曲和多曲是**两颗短代码**，不是同一颗加参数。原因是 Hugo 按「模板里有没有引用 `.Inner`」来决定短代码要不要闭合——一旦引用了 `.Inner`，`{{</* audio src="…" */>}}` 这种单曲写法就会被判成「未闭合」而构建失败（报 `must be closed or self-closed`）。拆开之后两种写法都自然。

### 媒体素材要注意的

- **封面不会从音频文件里自动取。** Hugo 读不了 FLAC / MP3 的内嵌元数据，这是构建期能力问题、不是配置漏了。很多音频自带封面，抽出来就行：
  ```bash
  ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg
  ```
  没给 `cover` 时 APlayer 显示一块点缀色方块，不会留空洞
- **歌词**是标准 `.lrc`（`[mm:ss.xx]词` 格式，`[offset:±ms]` 也认），和音频放一起、在曲目里写 `lrc:` 指过去即可
- **路径**写 `/media/…` 或 `media/…` 都会过 `relURL` 归一化；`http(s)://`、`//`、`data:` 开头的一律原样放行
- **别把有版权的商业录音随公开仓库分发**——那等于二次分发

## 关于页的四颗短代码

关于页不是普通文章。它由**短代码 + 普通 markdown** 组成，**没有私有的 front matter schema**——分几节、怎么分层，属于内容、不属于模板。

要建关于页，三件事：

**① 建 `content/about.md`**，front matter 至少写这两行：

```yaml
---
title: "关于"
layout: "about"    # 不写就落到普通文章模板，会带上日期、字数、上下篇导航
frame: "narrow"    # 不写，头栏与页脚会按文章页展开到 1150px，比 800px 的正文宽出一截
---
```

**② 加进头栏**（导航只认 `hugo.toml` 的菜单，不写这条，页面建好了也不出现在头栏）：

```toml
[[menus.main]]
  name = '关于'
  pageRef = '/about'
  weight = 40
```

**③ 正文用下面四颗短代码**。完整的样子：

```markdown
{{</* nameplate name="宫城楠木" role="独立开发者 · 居杭州" image="assets/avatar.jpg" */>}}
写代码，也写字。……

{{</* social github="https://github.com/…" email="mailto:…" */>}}
{{</* /nameplate */>}}

## 在做的事

{{</* project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="https://…" */>}}
一句话描述，可以用 markdown。
{{</* /project */>}}

## 关于本站

{{</* colophon */>}}
- **本站** 引擎 `Hugo` · 主题 **宣纸 xuanzhi**（原创）
- **许可** 主题 MIT
{{</* /colophon */>}}
```

| 短代码 | 用途 | 必填 | 可选 | 是否需闭合 |
|---|---|---|---|---|
| `nameplate` | 自述块：左像 + 右文 | `name` | `role` `image` `seal` `alt` | **是** |
| `social` | 带图标的联系行 | — | `github` `bilibili` `email` `rss` | 否 |
| `project` | 一个项目条目（题录式） | `name` | `code` `year` `status` `tags` `url` `archived` | **是** |
| `colophon` | 页尾版权页小字 | — | *（无参数）* | **是** |

### `nameplate` · 自述块

左栏 132px 放一张方像，右栏是名号 / 身份 / 内容体。

**这是闭合短代码**：名号要和自述同处右栏，而它们与内容体在 DOM 里是平级兄弟，CSS 排不了，必须有个盒子包住。

**写法：**

```markdown
{{</* nameplate name="宫城楠木" role="独立开发者 · 居杭州" */>}}
写代码，也写字。这个页面叫「宣纸」——把博客装进一张纸里的主题。
{{</* /nameplate */>}}
```

**效果**（不传 `image` 就用主题自带的默认人像）：

{{< nameplate name="宫城楠木" role="独立开发者 · 居杭州" >}}
写代码，也写字。这个页面叫「宣纸」——把博客装进一张纸里的主题。
{{< /nameplate >}}

- `role` 是身份那一行
- `image` 是方形人像：文章 `assets/` 下的文件名（如 `assets/avatar.jpg`），或以 `/` 开头的静态路径。
  **不传就用主题自带的默认人像** `static/images/me.jpg`——站点想换，在自己的 `static/images/` 放一张同名 `me.jpg` 即可顶掉（与 `og-default.png` 同一个套路）。指向 bundle 资源时走图片管线压 WebP（按 2× 出 264px）
- `seal` 是回退印的印文，**只在人像拿不到时才出现**。只认四字（田字格）或一字——132px 见方里 2/3 字的印章撑不住。缺省：名号正好四字就用整个名号，否则取首字
- `alt` 是人像的 alt，缺省用名号

> `social` 写在 `nameplate` 里面就落在右栏，写在外面就落在自述下面整宽，两种都行。

### `social` · 联系行

四项都可选，**至少给一个**，只渲染传了值的。`email` 写 `mailto:`，`rss` 一般写 `/index.xml`。

**写法：**

```markdown
{{</* social github="https://github.com/ldm0715" bilibili="https://space.bilibili.com/000000" email="mailto:hi@example.com" */>}}
```

**效果：**

{{< social github="https://github.com/ldm0715" bilibili="https://space.bilibili.com/000000" email="mailto:hi@example.com" >}}

标签文案走 i18n（`socialGithub` 等），想改「Email」为「邮箱」就在站点自己的 `i18n/zh-cn.yaml` 里覆盖（见[自定义](customization.md)）。

### `project` · 项目条目

`tags` 用逗号分隔（`"Hugo, CSS, Go"`，会自动 trim）；`archived="true"` 时状态印从朱文换成白文。

**写法：**

```markdown
{{</* project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="https://github.com/ldm0715/xuanzhi" */>}}
一个原创的 Hugo 博客主题：暖纸底、稿纸格纹、霞鹜文楷。
{{</* /project */>}}
```

**效果：**

{{< project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="https://github.com/ldm0715/xuanzhi" >}}
一个原创的 Hugo 博客主题：暖纸底、稿纸格纹、霞鹜文楷。
{{< /project >}}

**没给 `url` 就渲染成纯文字**——已归档、没入口的项目不该给一个点不进去的链接。多条连着写就是一个条目列表，外面不用包容器（分隔线由 CSS 画在相邻两条之间）。

### `colophon` · 版权页小字

内容体是普通 markdown，**一行一条写成无序列表**。

**写法：**

```markdown
{{</* colophon */>}}
- **本站** 引擎 [Hugo](https://gohugo.io) · 主题 **宣纸 xuanzhi**（原创）
- **许可** 主题 MIT
{{</* /colophon */>}}
```

**效果：**

{{< colophon >}}
- **本站** 引擎 [Hugo](https://gohugo.io) · 主题 **宣纸 xuanzhi**（原创）
- **许可** 主题 MIT
{{< /colophon >}}

这颗短代码只做一件事：**把内容从正文体量压低到注脚体量**——字号 0.84rem、行距拉开、列表去圆点、行首加粗词对齐成标签列。版权页是「顺手交代几句出处」的注脚，不压一档就会和上一段正文字对字地抢读。

> 一行一条**必须写成无序列表**——连续几行普通文本会被 markdown 并成一个段落，几条会挤成一行。

## 内置短代码的可用性

Hugo 内置的 `highlight` / `relref` / `qr` / `youtube` 都可用（上面各节都给了例子）。

**`gist` 已被 Hugo 移除**（v0.143 起废弃、v0.156 移除）。需要嵌 GitHub gist 时直接写 script 标签，效果等价：

```html
<script src="https://gist.github.com/user/gistid.js"></script>
```

加载发生在浏览器端，本地构建不受影响；GitHub 不可达时该区域空白，这是预期行为。

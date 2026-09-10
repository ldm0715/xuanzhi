---
title: "宣纸主题写作手册：短代码与 front matter"
date: 2026-09-10T10:00:00+08:00
tags:
  - 主题
  - 建站
categories:
  - 建站
---

这篇是**写法速查**：想在这个主题里写出某种效果，该写什么。只讲「怎么写」，不讲「为什么这么设计」——后者记在主题仓库的 `docs/design.md`，更细的写作约定在 `docs/writing.md`。

短代码分三组：内容类、媒体类、关于页。每组的**可运行示例**都在同目录的测试文章里，这篇负责把参数列全。

## front matter 里能写什么

通用字段（Hugo 自带的）：

```yaml
---
title: "文章标题"
date: 2026-09-10T10:00:00+08:00
tags: [主题, 建站]
categories: [建站]
---
```

主题另外认三个：

| 字段 | 作用 | 用在哪 |
|---|---|---|
| `cover` | 首页卡片的封面图，同时作为分享卡片的 `og:image`（裁 1200×630） | 普通文章 |
| `layout` | 指定用哪个页面模板 | 关于页写 `"about"` |
| `frame` | 框架宽度档位 | 关于页写 `"narrow"` |

`cover` 可以是 page bundle 里的文件名，也可以是以 `/` 开头的静态图片路径。不写就按标题哈希自动生成一枚水墨印记（八式，同一篇永远同一幅）。

## 内容类

### details：折叠块

```markdown
{{</* details summary="点开查看：墨的五阶" */>}}
焦、浓、重、淡、清。
{{</* /details */>}}
```

**`summary=` 写标题，不要用 `title=`。** 后者是 HTML 的 `title` 提示属性，写了会让可见标题消失、只剩悬停提示——主题为了兼容旧内容还认它，但新内容一律用 `summary`。

实际效果：

{{< details summary="点开查看：墨的五阶" >}}
焦、浓、重、淡、清。黄宾虹说「画用焦墨与宿墨，是求其苍老」——博客排版用不上焦墨，但折叠块里可以放很多字而页面依然干净。
{{< /details >}}

### qr：构建期生成二维码

```markdown
{{</* qr text="https://example.com" level="high"/*/>}}
```

`text` 是内容，另有 `level`（容错级别）、`scale`（尺寸，默认 4）。二维码在**构建时本地生成**，零网络依赖。

### relref：站内引用

```markdown
去看[写作手册]({{</* relref "theme-writing-guide.md" */>}})。
```

生成站内绝对链接，而且**引用不存在的页面会直接让构建失败**——它同时是一个链接检查器。站内互链一律用它，别手写路径。

## 媒体类

分工是**外部平台用裸 iframe，自托管媒体用短代码**。bilibili / YouTube 没有可直链的媒体文件，短代码不去假装能包住它们。

| 短代码 | 用途 | 必填 | 可选 | 需闭合 |
|---|---|---|---|---|
| `video` | 单个视频 | `src` | `poster` `caption` `start` `loop` | 否 |
| `audio` | 单个音频 | `src` | `title` `artist` `cover` `lrc` `start` | 否 |
| `playlist` | 音频播放列表 | — | 内容体写 YAML | **是** |

```markdown
{{</* video src="/media/demo.mp4" poster="/media/cover.jpg" caption="片头三十秒" start="12" */>}}

{{</* audio src="/media/nocturne.mp3" title="夜曲" artist="肖邦" lrc="/media/nocturne.lrc" */>}}

{{</* playlist */>}}
- title: 夜曲
  artist: 肖邦
  src: /media/nocturne.mp3
  cover: /media/nocturne.jpg
{{</* /playlist */>}}
```

视频走 Plyr、音频走 APlayer。这两个库**只在真正嵌了媒体的页面加载**，没媒体的页面一个字节都不带。

**封面要单独给，不会从音频文件里自动取**——Hugo 读不了 FLAC / MP3 的内嵌元数据。用 `ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg` 抽出来。

可运行示例见[媒体嵌入测试]({{< relref "media-embeds.md" >}})。

## 关于页的四个短代码

关于页不是普通文章。**三件事要配，都在你自己仓库里，主题不用改。**

**① 建 `content/about.md`**，front matter 至少这两行：

```yaml
---
title: "关于"
layout: "about"    # 不写就落到普通文章模板，会带上日期、字数、上下篇导航
frame: "narrow"    # 不写，头栏与页脚会展开到 1150px，比 800px 的正文宽出一截
---
```

**② 加进头栏**——导航只认 `hugo.toml` 的菜单，不写这条，页面建好了也不出现在头栏：

```toml
[[menus.main]]
  name = '关于'
  pageRef = '/about'
  weight = 40
```

**③ 正文写普通 markdown**——分节标题自己写 `##`，下面四颗短代码只负责产出 markdown 表达不了的结构件。**不存在私有的 front matter schema**（试过一版 `self` / `projects` / `colophon` 三个数组，撤了：做不出层次，换个人用也对不上字段）。

### nameplate：引首印 + 名号

```markdown
{{</* nameplate name="宫城楠木" seal="宫" role="独立开发者 · 居杭州" */>}}
```

`name` 必需；`seal` 是印面字，留空自动取名号首字；`role` 可选。

{{< nameplate name="宫城楠木" seal="宫" role="独立开发者 · 居杭州" >}}

### social：带图标的联系行

```markdown
{{</* social github="https://github.com/…" bilibili="https://…" email="mailto:…" rss="/index.xml" */>}}
```

四个都可选，至少给一个，**只渲染传了值的**。标签文案走 i18n（`socialGithub` 等），想改「Email」为「邮箱」就在站点自己的 `i18n/zh-cn.yaml` 里写同名 key 覆盖。

{{< social github="#" bilibili="#" email="#" >}}

### project：一个项目条目

```markdown
{{</* project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="https://…" */>}}
一句话描述，可以用 markdown。
{{</* /project */>}}
```

`name` 必需；`code` / `year` / `status` / `tags`（逗号分隔）/ `url` 可选；`archived="true"` 时状态印从朱文换成白文。

**不给 `url` 就渲染成纯文字**——已归档、没入口的项目不该给一个点不进去的链接。多条连着写就是一个条目列表，外面不用包容器。

{{< project name="宣纸" code="xuanzhi" year="二〇二五" status="维护中" tags="Hugo, CSS, Go" url="#" >}}
暖宣纸底的 Hugo 主题：竖排诗笺、题跋素纸、函架与钤印；明暗双纸、陶土与黛青双点缀。
{{< /project >}}

{{< project name="旧工具" year="二〇二三" status="已归档" archived="true" tags="Go" >}}
早期自动化小件，已归档收着，留作脚手架参考。
{{< /project >}}

### colophon：版权页小字

内容体是普通 markdown，这颗短代码只做一件事：**把它从正文体量压低到注脚体量**——字号 0.84rem、行距拉开、列表去圆点、行首加粗词对齐成标签列。

```markdown
{{</* colophon */>}}
- **本站** 引擎 `Hugo` · 主题 **宣纸 xuanzhi**（原创）
- **许可** 主题 MIT
{{</* /colophon */>}}
```

**为什么需要这一层**：正文默认字号（17px 楷体）是给阅读用的，而版权页是"顺手交代几句出处"的注脚，不压一档就会和上一段正文字对字地抢读。去掉短代码直接写 markdown 的话，它就会退回正文体量——**试过，很难看。**

一行一条**要写成无序列表**——连续几行普通文本会被 markdown 并成一个段落，软换行在 HTML 里塌成空格，几条会挤成一行。

（顺带记一个坑：主题的列表圆点是 `li::before` 伪元素画的，**不是** `list-style`。所以这里去掉圆点必须显式写 `content: none`，光写 `list-style: none` 一点用没有——我照着普通列表的思路改过一次，圆点照旧在，还因为 `left: -1.02em` 挂在文字左缘外面。）

**链接在这一节是特殊待遇。** 版权页一写就是七八个外部链接，全按主题默认渲染（点缀色字 + 下划线）会让这块小字比上面正文还响。这里的链接改成**字与谱录同色、只有下划线是点缀色**，悬停整块转色，外链那枚 `↗` 也去掉了。写法一个字不用变——照写 `[Hugo](https://gohugo.io)`，样式自己接上：

{{< colophon >}}
- **本站** 引擎 [Hugo](https://gohugo.io) · 主题 **宣纸 xuanzhi**（原创）
- **纸墨** 思源宋 / [LXGW 文楷](https://github.com/lxgw/LxgwWenKai) / JetBrains Mono，SIL OFL 1.1，本地自托管
- **插件** 播放器 [Plyr](https://github.com/sampotts/plyr) / [APlayer](https://github.com/DIYgod/APlayer)、搜索 [Pagefind](https://pagefind.app)，均 MIT
- **许可** 主题 MIT · 旧文与代码见 GitHub
{{< /colophon >}}

## 图片：与文章同目录

一篇文章连它的图片放进同一个文件夹（Hugo 的 page bundle）：

```
content/posts/my-post/
├── index.md
└── photo.jpg
```

正文直接写 `![说明](photo.jpg)`。构建时自动压成 WebP、生成三档响应式 srcset、包一层指向大图的链接（点图进图窗）。图注取 `![说明](photo.jpg "图注")` 的 `title`。

**不要把图片放到外部图床**——图片和文章在同一个 Git 仓库里，是这个主题的根基约定（本地所见即所得、整站可镜像）。远端的图不会被压缩管线处理。

## 公式

用 goldmark passthrough 的定界符，**构建期**渲染成静态 HTML（客户端不加载脚本，爬虫和 RSS 阅读器都能读到排好的公式）：

```markdown
行内：\( E = mc^2 \)

块级：
\[
  \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
\]
```

这套定界符**需要在 `hugo.toml` 里开 passthrough**，否则公式会以原始 LaTeX 露在页面上。配置片段：

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    inline = [['\(', '\)']]
    block = [['\[', '\]'], ['$$', '$$']]
```

注意键名是 `enable` 不是 `enabled`——**写成 `enabled` 不报错但静默失效**。可运行示例见[数学公式测试]({{< relref "math-formulas.md" >}})。

## 几个会静默坑人的地方

短代码里**引用了 `.Inner` 的必须闭合**。`details` / `project` / `colophon` / `playlist` 都要有 `{{</* /xxx */>}}` 收尾；`qr` 没有内容体，用自闭合写法（`/>` 结尾）。漏了这一步，Hugo 会报 `must be closed or self-closed`，**构建直接失败**。

`nameplate` / `social` / `video` / `audio` 不引用 `.Inner`，写成 `{{</* xxx … */>}}` 就是对的——**给它们补闭合标签反而会出错**。判断依据就一条：模板里有没有用 `.Inner`。

**colophon 一行一条要写成无序列表。** 连续几行普通文本会被 markdown 并成**一个段落**，软换行在 HTML 里塌成空格，五条会挤成一行。

**日期写成未来时间，文章会消失**（Hugo 默认不渲染 future content）。本地预览时别把日期写成明天。

**i18n 的 key 必须扁平。** 站点的 `i18n/zh-cn.yaml` 想覆盖主题文案时，写 `socialEmail: 邮箱`；写成 `social.email` 这种点号嵌套**不报错、返回空串**，页面上那个词直接消失。

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

- **`details` 书函折叠块**（可折叠内容）：默认标签是「展卷」，可用 `title=` 改：

  ```markdown
  {{< details title="答案" >}}
  折叠起来的内容……
  {{< /details >}}
  ```

- **`qr`**：包装 Hugo 内置二维码，`{{< qr "https://example.com" >}}`，默认 `alt` 已设为编码文本

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

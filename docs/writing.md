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

主题自带的两个：

- **`details` 书函折叠块**（可折叠内容）：默认标签是「展卷」，可用 `title=` 改：

  ```markdown
  {{< details title="答案" >}}
  折叠起来的内容……
  {{< /details >}}
  ```

- **`qr`**：包装 Hugo 内置二维码，`{{< qr "https://example.com" >}}`，默认 `alt` 已设为编码文本

Hugo 内置的 `highlight`、`gist` 等短代码同样可用；`relref` 适合站内互链。详见 `exampleSite/content/posts/shortcode-demo.md`。

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

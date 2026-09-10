---
title: "八、常见问题"
date: 2026-09-10T10:00:00+08:00
weight: 80
description: "卡住了先翻这里：构建、渲染、资源、升级四类问题的排查"
tags:
  - 排错
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- [二、安装与升级](installation.md)
- [三、站点配置](configuration.md)
- [四、写作](writing/index.md)
- [五、短代码参考](shortcodes.md)
- [六、自定义](customization.md)
- [七、部署](deployment.md)
- **八、常见问题**（当前篇）
- [九、设计理念](design.md)
- [十、许可](licenses.md)
{{< /details >}}

按症状找。每条先说**为什么**，再给**怎么改**——知道原因下次就不会再踩。

## 先做两件事

1. **改完配置没生效，先重启 `hugo server`。** Hugo 的热重建对**文件增删**响应不可靠（新建 / 删除 partial 模板尤其），改已有文件才一定热重建
2. **别在 `hugo server` 开着的时候去 `public/` 里查地址。** 开发服务器运行时 Hugo 会把 `baseURL` 覆盖成 `http://localhost:1313/`，那会儿看什么都是 localhost。跑一次 `hugo` 再看

## 构建与渲染

### 页面上是原始 LaTeX，公式没被渲染

`hugo.toml` 里的 passthrough 没开，或者**键名写错了**。

```toml
[markup.goldmark.extensions.passthrough]
  enable = true        # ← 是 enable，不是 enabled
```

写成 `enabled` **不报错**，但静默失效。加上 delimiters 那两行（见[站点配置](configuration.md#复制粘贴)）才算配全。

### 公式显示出来了，但上下标不缩小、不抬起

自托管的 KaTeX 样式表版本与 Hugo 的 `transform.ToMath` 输出对不上。这是主题维护层面的问题，正常使用不会遇到；如果你替换过 `static/katex/`，换回主题自带的那份。

### emoji 写成 `:+1:` 没变成表情

`enableEmoji` 必须是**顶层**键：

```toml
enableEmoji = true       # 顶层
```

塞进 `[markup.goldmark.extensions]` 里**不报错、也不生效**。

### 标题里的 `{#custom-anchor}` 被当普通文字渲染出来了

没开标题属性：

```toml
[markup.goldmark.parser]
  attribute.block = true
```

### 手写的 `<mark>` `<kbd>` 这些标签变成了一堆转义字符

没开 unsafe：

```toml
[markup.goldmark.renderer]
  unsafe = true
```

### `**加粗**` 没生效，两个星号原样露在页面上

八成是**加粗紧跟「」引号**：`**「模板在主题、开关在站点」**` 开不了加粗。

CommonMark 的强调符号有条**翼侧规则**：`**` 后面紧跟标点（「、引号、括号…）时，只有它前面也是空格或标点，才被认作「左翼侧」、才能开加粗。汉字是文字、不是标点，所以 `是**「…` 这种「汉字紧贴 `**`、`**` 又紧贴「」」的写法开不了加粗，两个星号就原样输出。

两种正确写法（让 `**` 后面直接跟汉字，别跟「」）：

```markdown
**模板在主题、开关在站点**       # 加粗时省略引号
「**模板在主题、开关在站点**」     # 引号放加粗外面
```

上面的写法渲染出来是这样——坏的写法露着星号、两种好的写法真加粗：

**「模板在主题、开关在站点」**

**模板在主题、开关在站点**

「**模板在主题、开关在站点**」

> 反过来，让 `**` 前面是空格或标点也能开——比如 `：**「…」**`。上面两种写法是最稳的。

### 切明暗模式时，代码块配色不跟着变

```toml
[markup.highlight]
  noClasses = false
```

设成 `true`（或删掉这一行）会退回 Hugo 的内联样式，明暗就跟随不了。

### 引用的图片是原图，没有转 WebP、没有响应式

图片管线需要 **Hugo extended**，标准版跑不了。`hugo version` 确认输出里有 `+extended`。另外图片要走管线，必须和文章放在同一个**page bundle**（`content/posts/my-post/index.md` + 图片），单独放在 `static/` 里的是原样发布、不做处理。

## 文章不出现 / 显示不对

### 新建的文章不见了

两个原因，按可能性排：

1. **`draft: true`。** Hugo 默认不渲染草稿。写的时候用 `hugo server -D`，发布前改成 `false`
2. **`date` 写成了未来时间。** Hugo 默认不渲染未来日期的内容——`date: 2027-01-01` 的文章现在就是看不见。改成过去的时间

### 文章在归档页好好的，但首页卡片上一篇都没有

站点里有一个**页数比文章多**的栏目（文档、笔记、周刊…），把首页占满了。

首页卡片和 RSS 收的是 `site.MainSections`，而 Hugo 在没显式配置时按「页数最多的顶层栏目」算——多出来的那个栏目一超过文章数，文章就从首页消失了，**不报任何错**。

一行修好：

```toml
[params]
  mainSections = ['posts']     # 你的文章放在哪个栏目就写哪个
```

见[站点配置](configuration.md#首页卡片与-rss-收哪些栏目)。

### 关于页建好了，但头栏上不出现

导航只认 `hugo.toml` 的菜单，不写这一条，页面建好了也不出现在头栏：

```toml
[[menus.main]]
  name = '关于'
  pageRef = '/about'
  weight = 40
```

### 关于页的头栏和页脚比正文宽出一截

`content/about.md` 的 front matter 少了 `frame: "narrow"`：

```yaml
---
title: "关于"
layout: "about"
frame: "narrow"     # ← 少了这行，框架会按文章页展开到 1150px
---
```

### 某个列表的小圆点位置歪在文字左上方、还探出了左缘

主题的列表圆点不是 CSS 的 `list-style`，而是 `li::before` 画的一枚朱砂墨点，位置是按**正文字号与行高**推出来的。在小字、注脚这类非正文语境里复用 `<ul>`，墨点就会歪。

想让某处不显示圆点，**光写 `list-style: none` 是去不掉的**，必须显式写 `content: none`。

## 样式与资源

### 部署到子路径后，CSS / 字体 / 图片全 404，页面是裸的

`baseURL` 的问题，两种情形：

- **末尾少了 `/`**——补上
- **项目型 GitHub Pages**（`https://<用户名>.github.io/<仓库名>/`）——站点在子路径下，`hugo.toml` 的 `baseURL` 要带这个前缀，或者在构建时用 `--baseURL` 覆盖。见[部署](deployment.md#关于-baseurl)

### 字体没生效，用的像是系统默认字体

字体是自托管的。如果你**删过 `static/fonts/` 或 `assets/fonts/`** 下的目录，主题探测不到文件就不会输出对应的 `<link>`（**不会 404**，只是静默回退）——这是设计如此。想把字体换回来，从主题的对应版本取回那两个目录。

注意字体是**分两半放**的：`@font-face` 的 CSS 在 `assets/fonts/`，woff2 切片在 `static/fonts/`，两边相对位置必须一致（CSS 里是 `url(220.woff2)` 这种相对引用），挪动任一边都会断。

### 关于页的人像变成了一枚朱印

说明人像没找到。`nameplate` 短代码的人像取值顺序是：`image=` 参数 → 主题自带的 `static/images/me.jpg` → **朱印**。

**朱印是错误提示，不是常态。** 检查 `image` 指的路径对不对（page bundle 内的文件名，或以 `/` 开头的静态路径）。用默认人像的话，确认站点或主题的 `static/images/me.jpg` 在。

### 首页卡片的印记想换成自己的图

在那一篇的 front matter 里给 `cover`。写法见[写作](writing/index.md#首页卡片的印记封面)。

## 改了没效果 / 升级后丢了

### 我改了 `themes/xuanzhi/` 里的文件，升级主题后改动没了

**主题目录不应该直接改。** 升级时那个目录会被整体替换。

正确的做法是在**站点侧建同名文件覆盖**（Hugo 的查找顺序是「站点先于主题」）——改颜色、界面文案、头栏插槽各有各的做法，见[自定义](customization.md)。

### 改了 `i18n/zh-cn.yaml`，界面上的字没变，或者干脆消失了

八成是 **key 写成了嵌套结构**。主题的 i18n 全是 `recentPosts` 这种**扁平** key：

```yaml
# ✅ 对
recentPosts: 最新文章
```

```yaml
# ❌ 错：模板里 {{ i18n "posts.other" }} 不报错，但返回空串，字直接消失
posts:
  other: 篇
```

### 新建了 `layouts/partials/xxx.html` 但页面没变化

**重启 `hugo server`。** Hugo 的热重建对模板文件的**增删**响应不可靠，改已有文件才一定热重建。

## 搜索

### 本地预览时搜索框提示「索引未生成」

**这是正常的。** Pagefind 索引不由 Hugo 生成，要在构建之后单独跑：

```bash
hugo --minify
npx pagefind@latest --site public
```

想看效果就用上面的命令构建 + 索引，再 `npx serve public` 打开。部署时把这一步加进构建流程即可，见[部署](deployment.md#站内搜索)。

### 线上搜索能用，但结果点进去 404

多半是 `baseURL` / 子路径没配对——Pagefind 的结果链接前缀由主题按站点路径补，站点路径本身错了就全错。对照上面的「样式与资源 → CSS / 字体 / 图片全 404」排查。

## 都没解决？

- 对着[Hugo 官方文档](https://gohugo.io/documentation/)确认 Hugo 本身的行为，尤其是 `hugo.toml` 的键名
- 开 `hugo --logLevel debug` 看构建期到底发生了什么
- 到[主题仓库的 Issues](https://github.com/ldm0715/xuanzhi/issues) 提问，**带上 `hugo version` 的输出**和最小复现步骤

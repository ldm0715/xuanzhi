---
title: "一、快速开始"
date: 2026-09-10T10:00:00+08:00
weight: 10
description: "五分钟把站点跑起来，写下第一篇。全程可复制粘贴。"
tags:
  - 上手
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- **一、快速开始**（当前篇）
- [二、安装与升级](installation.md)
- [三、站点配置](configuration.md)
- [四、写作](writing/index.md)
- [五、短代码参考](shortcodes.md)
- [六、自定义](customization.md)
- [七、部署](deployment.md)
- [八、常见问题](troubleshooting.md)
- [九、设计理念](design.md)
- [十、许可](licenses.md)
{{< /details >}}

这一篇只做一件事：**让你在五分钟内看到一个跑起来的站点**。不解释原理，不讲可选项，每一条命令都可以直接复制。

已经装好 Hugo、只是想把主题挂上去的话，看[安装与升级](installation.md)。

## 一、装 Hugo（必须是 extended 版）

主题的图片管线（自动转 WebP、生成响应式 srcset）依赖 **Hugo extended**，标准版会在构建时报错。版本要求 **≥ 0.146**。

**Windows**（PowerShell）：

```powershell
winget install Hugo.Hugo.Extended
```

**macOS**：

```bash
brew install hugo
```

**Linux**：从 [Hugo 的 Releases 页](https://github.com/gohugoio/hugo/releases)下载 `hugo_extended_*_linux-amd64.tar.gz` 解压，把 `hugo` 放进 `PATH`。

装完确认一下，输出里要带 **`extended`** 这个词：

```bash
hugo version
# hugo v0.165.0+extended ...  ← 要看到 +extended
```

## 二、建一个空站点

```bash
hugo new site myblog
cd myblog
```

## 三、把主题挂进去

`themes/xuanzhi` 这个目录名不能改——`hugo.toml` 里的 `theme = 'xuanzhi'` 就是按这个名字找的。

```bash
git init
git submodule add https://github.com/ldm0715/xuanzhi.git themes/xuanzhi
```

> 不想用 git 的话，去[主题的 Releases 页](https://github.com/ldm0715/xuanzhi/releases)下载最新版的 `xuanzhi-v*.zip`，解压后把里面的 `xuanzhi/` 整个目录放进 `themes/`。三种引入方式的取舍见[安装与升级](installation.md)。

## 四、写 `hugo.toml`

把站点根目录的 `hugo.toml` 整个换成下面这份：

```toml
baseURL = 'https://你的域名/'
title = '我的博客'
theme = 'xuanzhi'

enableRobotsTXT = true
enableEmoji = true

[markup]
  [markup.highlight]
    noClasses = false
  [markup.goldmark.parser]
    attribute.block = true
  [markup.goldmark.extensions.passthrough]
    enable = true
    [markup.goldmark.extensions.passthrough.delimiters]
      inline = [['\(', '\)']]
      block = [['\[', '\]'], ['$$', '$$']]
  [markup.goldmark.renderer]
    unsafe = true

[params]
  accent = 'terracotta'

[[menus.main]]
  name = '归档'
  pageRef = '/posts'
  weight = 10
```

这几行不是装饰——**关掉任何一行都会有功能静默消失**（公式不渲染、代码块不跟明暗、emoji 变成 `:+1:` 的字面文本……）。每一条管什么、不配会怎样，逐项列在[站点配置](configuration.md)里。

## 五、写第一篇

```bash
hugo new content posts/hello.md
```

打开 `content/posts/hello.md`，把 `draft: true` 改成 `false`，正文随便写几句。

> **`draft: true` 是个坑。** Hugo 默认不渲染草稿，改了 `true` 又忘了改回来，页面就是空的。想一边写一边看，用 `hugo server -D`（`-D` = 显示草稿）。

## 六、跑起来

```bash
hugo server
```

打开 <http://localhost:1313/>。看到首页的诗笺和文章卡片就成功了。

现在改任何文件浏览器都会自动刷新——标题写 `hugo.toml` 的 `title`，站点底色的点缀色改 `params.accent`（`terracotta` 陶土橘 / `indigo` 黛青）。

## 下一步

| 想做的事 | 去哪 |
|---|---|
| 加「关于」页、分类、标签 | [站点配置](configuration.md) |
| 往文章里放图、公式、代码块 | [写作](writing/index.md) |
| 用折叠块、二维码、视频、音频 | [短代码参考](shortcodes.md) |
| 改导航、改界面上的字 | [自定义](customization.md) |
| **部署上线，并让站内搜索能用** | [部署](deployment.md) |

> 站内搜索要多跑一步 `npx pagefind --site public`，这一步只在部署时做，**本地 `hugo server` 下搜索会提示「索引未生成」，这是正常的**，不是配置错了。

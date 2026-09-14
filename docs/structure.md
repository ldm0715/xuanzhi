---
title: "四、内容组织"
date: 2026-09-10T10:00:00+08:00
weight: 40
description: "content/ 目录怎么变成 URL、新开一个存放文章的地方要做哪三件事、哪些路径已经名花有主"
tags:
  - 内容组织
  - section
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- [二、安装与升级](installation.md)
- [三、站点配置](configuration.md)
- **四、内容组织**（当前篇）
- [五、写作](writing/index.md)
- [六、短代码参考](shortcodes.md)
- [七、自定义](customization.md)
- [八、部署](deployment.md)
- [九、常见问题](troubleshooting.md)
- [十、设计理念](design.md)
- [十一、许可](licenses.md)
{{< /details >}}

这一篇讲**文件放哪儿**：`content/` 下的目录结构怎么变成站上的 URL，新开一个存放文章的地方要做哪几件事，以及哪些路径是 Hugo 自己占着的、别拿去用。

## 目录就是 URL

Hugo 没有「注册栏目」这一步。`content/` 下每个一级目录**自动**成为一个 section，路径原样进 URL：

```
content/
├── posts/
│   ├── _index.md            →  /posts/
│   ├── hello.md             →  /posts/hello/
│   └── my-post/
│       ├── index.md         →  /posts/my-post/
│       └── assets/photo.jpg
├── samples/
│   ├── _index.md            →  /samples/
│   └── long-form.md         →  /samples/long-form/
└── about.md                 →  /about/
```

新开一个目录**不需要改任何配置**：建好目录、往里放 `.md`，站上立刻就有了。演示站的「样例」那一节就是这么来的——`exampleSite/content/samples/` 一个目录加一个 `_index.md`，再在头栏菜单里加一行，它就开始工作。之所以挪过去就能被解析，没有别的机关，就是因为 Hugo 认目录。

## `_index.md` 和 `index.md`，差一个下划线差很多

最容易混的一处：

| 文件名 | 它是什么 | 自己有没有列表页 | 图片放哪 |
|---|---|---|---|
| `_index.md` | 这个**目录**的说明页（branch bundle） | 有——这个目录的列表页 | 不往这儿放 |
| `index.md` | **这一篇**文章（leaf bundle） | 没有——它本身就是内容页 | 放同目录的 `assets/` |

- `posts/_index.md` 里写 `title: 归档`，**/posts/ 列表页的大标题就是「归档」**。目录叫 `posts`、显示名可以完全不一样，这是两件事
- `posts/my-post/index.md` 是一篇文章，图片收在 `posts/my-post/assets/`，正文写 `![说明](assets/photo.jpg)`。这就是[五、写作](writing/index.md)里的 page bundle

## 新开一个存放文章的地方：三个动作

以演示站的 `samples/` 为例，从无到有只需要三步。

### 1. 建目录，给一个 `_index.md`

```markdown
---
title: 样例
description: 一句话说明这一节放什么
---
```

`_index.md` 的 `title` 就是列表页的大标题；不写的话标题会空着。

### 2. 决定它上不上首页、进不进 RSS

首页卡片和 RSS 只收 `site.MainSections` 里的 section，在 `hugo.toml` 配：

```toml
[params]
  mainSections = ['posts']
```

演示站写死 `['posts']`，所以「样例」那一节**不进首页卡片**——这正是它想要的：教程归教程，演示数据归演示数据。不写这行时 Hugo 会自己算出「页数最多的那个栏目」。

### 3. 给它一个入口

加进头栏菜单，只改 `hugo.toml`：

```toml
[[menus.main]]
  name = '样例'
  pageRef = '/samples'
  weight = 15
```

`pageRef` 写 section 的路径（**不带**结尾斜杠），`name` 是显示在头栏上的字。站点完全没配菜单时，主题会兜底成「主内容段 + 分类法页」，所以不配也不会空着。详见[七、自定义](customization.md)。

## 哪些路径已经名花有主

`content/` 下的目录名不是随便都能用的。

### 被 Hugo 占着的

| 路径 | 谁占的 | 说明 |
|---|---|---|
| `/categories/` | 分类法 | 由 front matter 的 `categories` 自动生成 |
| `/tags/` | 分类法 | 同上，对应 `tags` |
| `/` | 首页 | 主题的 `layouts/home.html` |
| `/page/2/`、`/page/3/` … | 分页 | 列表页翻页时自动生成 |

改分类法和标签的**显示标题**，Hugo 给的正规做法是在那个路径下放一个 `_index.md`：

```markdown
---
title: 标签
---
```

演示站就是这么做的——`content/tags/_index.md` 和 `content/categories/_index.md` 各一行 `title`。这类文件**只改标题，不放文章**。

### 在 `tags/` 下放文章会静默吞掉词条

上面那句「不放文章」不是洁癖，是实测出来的坑。

假设某篇文章的 front matter 里写了 `tags: [foo]`，正常情况下会有一个 `/tags/foo/` 词条页，`/tags/` 列表里也会列出 foo。现在再放一个 `content/tags/foo.md` 进去：

| | `/tags/foo/` 是什么 | `/tags/` 列表里有 foo 吗 | 报错 / 警告 |
|---|---|---|---|
| 只有 `tags: [foo]` 的文章 | 词条页 | **有** | 无 |
| 再加 `content/tags/foo.md` | 变成那篇文章 | **没有**，词条消失 | **仍然没有** |

Hugo 对这场撞车**一个字都不说**。内容文件赢，词条页被顶掉，而你在 `/tags/` 上只是发现某个标签莫名其妙没了。所以：**分类法和标签的根目录下，只放 `_index.md`**。

### 被主题占着的

| 路径 | 谁占的 |
|---|---|
| `/about/` | 主题的 `layouts/about.html`，靠 front matter 的 `layout: about` 认领 |
| `/404.html`、`/sitemap.xml`、`/robots.txt`、`/index.xml` | 主题模板生成 |

### `/posts/` 不在这两张表里

它是**纯粹的自建 section**。「归档」这个名字是 `content/posts/_index.md` 里的 `title` 给的，不是路径带来的。你想换个显示名，改那个 `title` 就行；想改目录名（比如改成 `blog/`），也能改——只是要同步三处：`mainSections`、菜单里的 `pageRef`、以及任何指向 `/posts/` 的内链。

## 换 URL 但不换目录

偶尔目录名和想要的 URL 对不上，两个 front matter 字段可以把它们解耦：

```yaml
slug: hello-world      # 只换这一篇的最后一段
url: /blog/hello/      # 整条路径写死
```

`slug` 改末段，`url` 改整条，都只影响 URL、不动文件位置。**改了 URL 记得留重定向**，Hugo 有 `aliases` 字段，见[八、部署](deployment.md)。

## 目录结构是会长的

一开始 `content/` 下只有一个 `posts/` 就够用。等某一类文章攒多了——「笔记」「周记」「读书」——再拆成独立 section。拆完要动的就是上面那三个动作：`_index.md`、`mainSections`、菜单。**没有任何一处需要改主题模板。**

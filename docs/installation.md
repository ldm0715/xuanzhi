---
title: "二、安装与升级"
date: 2026-09-10T10:00:00+08:00
weight: 20
description: "把主题挂进已有站点的三种方式，以及升级、回退和换主题版本"
tags:
  - 安装
  - 主题
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- **二、安装与升级**（当前篇）
- [三、站点配置](configuration.md)
- [四、写作](writing/index.md)
- [五、短代码参考](shortcodes.md)
- [六、自定义](customization.md)
- [七、部署](deployment.md)
- [八、常见问题](troubleshooting.md)
- [九、设计理念](design.md)
- [十、许可](licenses.md)
{{< /details >}}

这一篇解决「主题怎么进到我的站点里、之后怎么升」。从零建站请看[快速开始](quick-start.md)。

## 环境要求

| 要求 | 说明 |
|---|---|
| Hugo **≥ 0.146** | 主题用的是 0.146 起的顶层模板结构，低版本会找不到模板 |
| **extended** 版 | 图片管线（自动转 WebP、生成响应式 srcset）依赖它，标准版构建即报错 |
| 可选：Node.js | 只有想用站内搜索才需要——部署时多跑一步 `npx pagefind`，见[部署](deployment.md) |

```bash
hugo version      # 输出里要带 +extended
```

## 把主题放进站点

主题目录必须落在站点的 `themes/xuanzhi`——`hugo.toml` 里的 `theme = 'xuanzhi'` 就是按这个目录名找的，**目录名不能改**。

### 方式 A · Git submodule（推荐）

主题独立成仓，站点锁定具体版本，升级是显式的一次提交：

```bash
cd 你的站点
git submodule add https://github.com/ldm0715/xuanzhi.git themes/xuanzhi
```

### 方式 B · 下载主题包

不用 git 就选这条。去[主题的 Releases 页](https://github.com/ldm0715/xuanzhi/releases)下载最新版的 `xuanzhi-v*.zip`，解压后把里面的 `xuanzhi/` 整个目录放进站点的 `themes/`。

包里的顶层目录名就叫 `xuanzhi`，是特意这么打的——解压进 `themes/` 即可对上 `theme = 'xuanzhi'`，不用改名。

### 方式 C · Hugo Modules

站点用 Hugo Modules 管理依赖时（站点要有 `go.mod`）：

```bash
cd 你的站点
hugo mod init github.com/你的用户名/你的站点
```

`hugo.toml` 里改成 import 而不是 `theme`：

```toml
[module]
  [[module.imports]]
    path = 'github.com/ldm0715/xuanzhi'
```

```bash
hugo mod get github.com/ldm0715/xuanzhi@v1.0.0
```

> 这条路依赖主题**已经打过版本 tag**——`v1.0.0` 是首个正式版。想跟最新的开发进度就用 `@master`。

## 声明主题并补齐配置

`hugo.toml` 里至少要写：

```toml
baseURL = 'https://你的域名/'
title = '站点名'
theme = 'xuanzhi'      # 用方式 C 的则跳过这行，改用 module.imports
```

然后**务必照[快速开始](quick-start.md#四写-hugotoml)那份配置补齐 `[markup]` 各段**——主题有一批功能是「模板在主题、开关在站点」，不配就没有：公式不渲染、代码块不跟明暗、robots.txt 不生成。每一项管什么见[站点配置](configuration.md)的「功能 → 配置 → 不配的后果」表。

跑一次 `hugo server` 确认首页出得来，再继续。

## 升级

先看 [CHANGELOG](https://github.com/ldm0715/xuanzhi/blob/master/CHANGELOG.md) 里目标版本有没有 **破坏性变更**，再动手。

**方式 A（submodule）**——在子模块里切到新 tag，然后回站点仓库提交这次指针变更：

```bash
cd themes/xuanzhi
git fetch --tags
git checkout v1.0.1
cd ../..
git add themes/xuanzhi
git commit -m "chore: bump xuanzhi theme to v1.0.1"
```

**方式 B（下载包）**——下载新版 zip，把 `themes/xuanzhi/` 整个目录替换掉。

**方式 C（Hugo Modules）**——把版本号改掉，或直接升到最新：

```bash
hugo mod get github.com/ldm0715/xuanzhi@v1.0.1
hugo mod get -u                                       # 升到最新
hugo mod tidy
```

**回退**就是把上面命令里的版本号换成旧的 tag。站点自己的内容、配置、`static/` 下的图片都不在主题目录里，所以换版本不会碰到它们——这也是**不要直接改 `themes/xuanzhi/` 里的文件**的原因：升级时改动会被冲掉。要改主题行为，走[自定义](customization.md)里的站点侧覆盖。

## 附：开发期的 junction → 定稿后的 submodule

如果你在**同时改主题和站点**（主题作者场景），开发期常用 junction 让主题改动即时生效：站点的 `themes/xuanzhi` 是一个指向主题仓库真实路径的目录连接。它和 `theme = 'xuanzhi'` 同样生效。

定稿、想让站点锁定版本时，换成正式的 submodule：

```bash
cd 你的站点
git rm --cached themes/xuanzhi      # 移除 junction 的记录（主题文件仍在原路径）
rmdir themes\xuanzhi                # 删掉 junction 本身（不影响主题仓库）
git submodule add https://github.com/ldm0715/xuanzhi.git themes/xuanzhi
```

> `rmdir` 在 Windows 上删的是目录连接本身，**不会**动到它指向的主题仓库。不放心的话先把主题仓库在别处备份或确认已 push。

## 预览演示站

主题仓库自带的 `exampleSite/` 就是你在线的那个演示站：

```bash
git clone https://github.com/ldm0715/xuanzhi.git
cd xuanzhi
hugo server --source exampleSite      # http://localhost:1313/
```

演示站用 Hugo 的 **module mount** 把仓库根目录的主题挂进来，**没有**用 `themesDir = '../..'` 那套写法——所以它不挑仓库目录名，克隆下来的目录叫 `xuanzhi` 还是别的都行。站点接入主题走的是常规 `theme = 'xuanzhi'`，不涉及 mount。

# 安装与引入

## 环境要求

Hugo ≥ **0.146（extended）**。主题需要 extended 版本来跑图片管线（WebP / srcset）。可选：启用 `hugo server` 前先确认 Hugo 版本 `hugo version`。

## 把主题放进站点

主题目录必须落在站点的 `themes/xuanzhi`（`hugo.toml` 里 `theme = 'xuanzhi'` 对应这个名字）。两种做法：

**方式 A · Git submodule（定稿后推荐）** —— 主题独立成仓，站点锁定版本：

```bash
cd 你的站点
git submodule add <主题仓库地址> themes/xuanzhi
```

**方式 B · 下载 / 复制** —— 把主题仓库内容（`layouts/`、`assets/`、`static/`、`i18n/`、`theme.toml`…）放进 `themes/xuanzhi`。

> 若主题与你站点开发期以 junction 挂载（作者本人场景），站点 `themes/xuanzhi` 是指向主题路径的连接，`theme = 'xuanzhi'` 同样生效；定稿后想改成正式 submodule，见下文「开发期 junction → 定稿 submodule」。

## 开发期 junction → 定稿 submodule

主题开发期作者常用 junction 让主题改动即时生效于站点（站点 `themes/xuanzhi → <主题路径>`）。定稿后改成 submodule（主题独立仓库 + 站点锁版本）的步骤：

```bash
cd 你的站点
git rm --cached themes/xuanzhi      # 移除 junction 记录（主题文件仍在原路径）
rmdir themes\xuanzhi                # 删掉 junction 本身（不影响主题仓库）
git submodule add <主题仓库地址> themes/xuanzhi
```

## 声明主题并最小起步

在 `hugo.toml`：

```toml
baseURL = 'https://你的域名/'
title = '站点名'
theme = 'xuanzhi'
```

然后**务必按 [configuration.md](configuration.md) 的「复制粘贴」段补齐配置**——主题有一批功能是"模板在主题、开关在站点"，不配就没有（例如代码高亮不跟明暗、公式不渲染、robots 不生成；站内搜索还要在部署时多跑一步 pagefind，见 configuration 的搜索一节）。第一次写完后跑一次 `hugo server` 看首页。

## 预览演示站

主题仓库里的 `exampleSite/` 就是演示站，每种内容形态（代码、公式、图片、短代码、长文）都有一篇测试稿：

```bash
cd <主题仓库>
hugo server --source exampleSite     # http://localhost:1313/
```

演示站用 module mount 把主题挂进来，所以**不挑主题仓库的目录名**；站点接入主题仍走 `theme = 'xuanzhi'`，不涉及 mount。

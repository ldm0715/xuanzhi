<p align="center">
  <img src="static/images/logo.svg" width="96" height="96" alt="Xuanzhi">
</p>

<h1 align="center">Xuanzhi 宣纸</h1>

<p align="center">
  一套为中文写作设计的 Hugo 博客主题<br>
  暖纸底 · 稿纸格纹 · 霞鹜文楷 · 墨阶排版
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="license: MIT"></a>
  <a href="https://gohugo.io/"><img src="https://img.shields.io/badge/Hugo-%E2%89%A50.146%20extended-ff4088" alt="Hugo ≥ 0.146 extended"></a>
  <img src="https://img.shields.io/badge/lang-zh--CN-blue" alt="lang: zh-CN">
  <a href="https://github.com/ldm0715/xuanzhi/releases"><img src="https://img.shields.io/github/v/release/ldm0715/xuanzhi" alt="release"></a>
</p>

<p align="center">
  <a href="https://ldm0715.github.io/xuanzhi/"><b>在线演示</b></a> · <a href="docs/">使用文档</a>
</p>

## 快速开始

```bash
git submodule add https://github.com/ldm0715/xuanzhi.git themes/xuanzhi
# 在 hugo.toml 里声明：theme = 'xuanzhi'
hugo server
```

要求 **Hugo extended ≥ 0.146**（图片管线需要 extended）。这三步只是骨架——公式、代码高亮随明暗、robots.txt 等开关不配就没有，照[快速开始](docs/quick-start.md)补齐即可。

## 特性

- **写作即所得**：图片自动转 WebP 与多档清晰度，点击进入灯箱；公式在构建期排版好，禁 JS 的读者、爬虫与 RSS 阅读器都能读到。
- **中文排版**：霞鹜文楷正文字体、中文着重号代替假斜体，脚注、表格、引用等元素各有版式。
- **内容组织**：归档、分类书架、标签印谱各有形制；文章页有目录、阅读进度与一枚可拖动的朱印。
- **站内搜索**：由 Pagefind 驱动，中文分词原生支持。
- **媒体与评论**：自托管的视频 / 音频 / 播放列表；评论区可选，不配置就完全不出现。
- **自托管**：字体、图标、播放器、搜索索引全部随主题分发。

## 自定义

主题自带几处素材，可以**直接在站点里替换**，不用改任何模板——在你自己站点的 `static/` 下放一份同名同路径的文件即可顶掉：

| 想换掉的 | 放一份自己的 |
|---|---|
| 站点图标（浏览器标签页那枚小印） | `static/images/logo.svg` |
| 分享到社交平台的卡片配图 | `static/images/og-default.png` |

关于页的人像不在这张表里——**主题不带默认人像**，图属站点私有：把自己的图放进 `static/images/`，再在 `nameplate` 短代码上写 `image="/images/xxx.jpg"`。

配色、字体、界面文案与菜单见[自定义](docs/customization.md)。

## 文档

完整手册在 [`docs/`](docs/)——**它同时就是演示站的正文**。

| 想做什么 | 看这里 |
|---|---|
| 五分钟先跑起来 | [快速开始](docs/quick-start.md) |
| 引入方式、升级与回退 | [安装与升级](docs/installation.md) |
| `hugo.toml` 全量配置 | [站点配置](docs/configuration.md) |
| 写作：front matter / 图片 / 公式 | [写作](docs/writing/index.md) |
| 短代码参数表 | [短代码参考](docs/shortcodes.md) |
| 自定义：菜单、界面文案、配色 | [自定义](docs/customization.md) |
| 部署与站内搜索索引 | [部署](docs/deployment.md) |
| 页面不对劲 | [常见问题](docs/troubleshooting.md) |
| 设计理念 | [设计理念](docs/design.md) |

## 许可

| 组成 | 许可 |
|---|---|
| 主题本体（模板 / CSS / JS） | MIT（见 [LICENSE](LICENSE)） |
| 霞鹜文楷 GB、思源宋体 700、JetBrains Mono | SIL OFL 1.1 |
| KaTeX 样式表 | MIT |
| Material Design 图标 | Apache-2.0 |
| Simple Icons 品牌图标 | CC0 1.0 |
| Plyr（视频）、APlayer（音频） | MIT |
| Waline 评论客户端 | MIT |

第三方资产不因打包在一起而变为 MIT，各自要保留的署名与出处见[许可](docs/licenses.md)。

更新记录见 [CHANGELOG.md](CHANGELOG.md)，发布产物在 [Releases](https://github.com/ldm0715/xuanzhi/releases)。维护与开发见 [CLAUDE.md](CLAUDE.md) 与 [`dev/`](dev/README.md)。

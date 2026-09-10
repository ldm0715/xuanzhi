# 主题与第三方资产许可

主题本体（模板 / CSS / JS）是 **MIT**，见仓库根目录的 `LICENSE`。

仓库里随主题分发的第三方资产**各有各的许可，不因打包在一起而变成 MIT**：

| 资产 | 位置 | 许可 |
|---|---|---|
| 霞鹜文楷 GB（LXGW WenKai GB） | `static/fonts/lxgw/` + `assets/fonts/lxgw/` | SIL OFL 1.1 |
| 思源宋体 700 切片（Source Han Serif / Noto Serif SC） | `static/fonts/noto-serif-sc/` + `assets/fonts/noto-serif-sc/` | SIL OFL 1.1 |
| JetBrains Mono | `static/fonts/jbm/` + `assets/fonts/jbm/` | SIL OFL 1.1 |
| KaTeX（只用到样式表） | `static/katex/` | MIT |
| Material Design 图标 path | 模板内联（`header.html` / `footer.html` 等） | Apache-2.0 |
| Simple Icons 品牌 path | 模板内联（`about.html` 的 GitHub / Bilibili） | CC0 1.0 |
| **Plyr 3.8.3**（视频播放器） | `assets/vendor/plyr/` + `static/vendor/plyr.svg` | MIT © Sam Potts |
| **APlayer 1.10.1**（音频播放器） | `assets/vendor/aplayer/` | MIT © DIYgod |

一般图标取自 `@material-design-icons/svg`（Apache-2.0）。

**品牌标识是例外**：GitHub、Bilibili 这类 logo 不在 Google 那套里，只能另找源——
关于页的联系图标取自 [Simple Icons](https://simpleicons.org/)（CC0 1.0，无署名义务）。
CC0 虽不要求署名，但**出处仍要记在这里**，否则下次换图标的人不知道该去哪儿核对。

> OFL 字体允许随任何软件打包分发，但**必须保留各自的版权与许可声明**，也不得单独改标协议。

### 播放器两个库的说明

只在你**真正嵌了媒体**的页面上才会被加载（`head.html` 用 `.HasShortcode` 判断），没有媒体的页面一个字节都不带。两者的升级方式、以及升级时必须重做的改动（删掉末行的 `sourceMappingURL`、把 Plyr 的图标 sprite 放到 `static/`）记在 [`assets/vendor/README.md`](../assets/vendor/README.md)。

> **版权声明保留在哪**：这两个库的 min 版**都把 MIT 版权头剥掉了**，所以那份 `assets/vendor/README.md` 同时充当它们的许可声明——里头写了上游仓库地址、版本与版权人。删它等于丢掉署名。

想换掉字体（比如改用自己的）：删掉 `static/fonts/` 与 `assets/fonts/` 下对应的目录即可——主题会探测到文件不在就自动不输出那几个 `<link>`，不会 404。关于字体版本的更新方法见主题仓库 `dev/maintenance.md`。

**Pagefind**（MIT）：不随主题仓库分发。它是可选构建工具——用站内搜索时在你的部署里跑 `npx pagefind`，生成的 `pagefind/` 索引与运行时进入你自己的站点产物；不用搜索就不需要它。

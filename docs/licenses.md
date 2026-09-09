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

图标取自 `@material-design-icons/svg`。

> OFL 字体允许随任何软件打包分发，但**必须保留各自的版权与许可声明**，也不得单独改标协议。

想换掉字体（比如改用自己的）：删掉 `static/fonts/` 与 `assets/fonts/` 下对应的目录即可——主题会探测到文件不在就自动不输出那几个 `<link>`，不会 404。关于字体版本的更新方法见主题仓库 `dev/maintenance.md`。

**Pagefind**（MIT）：不随主题仓库分发。它是可选构建工具——用站内搜索时在你的部署里跑 `npx pagefind`，生成的 `pagefind/` 索引与运行时进入你自己的站点产物；不用搜索就不需要它。

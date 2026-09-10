# Xuanzhi 宣纸

[![license: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Hugo](https://img.shields.io/badge/Hugo-%E2%89%A50.146%20extended-ff4088)](https://gohugo.io/)
[![lang](https://img.shields.io/badge/lang-zh--CN-blue)]()

> 暖纸底 · 稿纸格纹 · 霞鹜文楷 · 墨阶排版 —— 一个把博客装进一张宣纸里的极简中文博客主题。

宣纸为 **Hugo（≥ 0.146，extended）** 设计：亮色是「宣纸」、暗色是「夜墨」；点缀色在陶土橘 / 黛青之间切换，访客还可在头栏外观面板自选纸面、点缀色与分隔线。字体、KaTeX、图标、媒体播放器（Plyr / APlayer）、站内搜索索引一律**自托管**（搜索索引由构建时的 Pagefind 生成本地文件）。

**对外请求只有一处**：首页诗笺向「诗泉」API 取一首绝句——构建期烘一首进 HTML，浏览器端每次到访再取一次随机换新；取不到、超时或不合格时静默保留已烘入的那首，页面不受影响。不想要这个外部依赖的话，见 [design.md](docs/design.md) 的说明。

## 演示站

- 在线演示：`https://ldm0715.github.io/xuanzhi/`（主题仓库推上 GitHub Pages 后可用）
- 本地预览：仓库自带 `exampleSite/` 演示站（每种内容形态都有一篇测试稿）

```bash
git clone <本仓库>
cd xuanzhi
hugo server --source exampleSite      # http://localhost:1313/
```

## 特性

**写作即所得**
- 图片自动转 WebP + 三档 srcset + 懒加载；点图进入「同纸虚化」的图窗灯箱
- 公式**构建期**渲染（KaTeX），禁 JS / 爬虫 / RSS 阅读器都能读到排版好的公式
- 代码块双明暗高亮、带复制按钮；脚注 / 表格 / 任务列表 / 定义列表 / 嵌套引用各有版式；`<em>` 用中文着重号代替假斜体
- 自托管的**视频 / 音频 / 播放列表**三个短代码，支持封面与 `.lrc` 歌词同步；皮肤已覆写成宣纸风，且只在嵌了媒体的页面加载

**内容组织**
- 首页诗笺欢迎区 + 红框封文章卡片；归档按年 / 月（毛笔纪年 · 朱印领月）
- 分类 = 通栏书柜，标签 = 印谱；分类词页开函、标签词页钤印
- 目录（TOC）+ scrollspy、长目录自动折叠、分页、线装式上下篇翻页
- 文章页右下角一枚**朱印**：可拖动；收起时外圈方框随阅读进度描边填充，展开是「回到顶部 / 分享 / 目录 / 进度读数」

**分发与 SEO**
- robots.txt / sitemap / 自定义 RSS / Open Graph 全套 / JSON-LD
- **站内搜索（Pagefind）**：中文分词原生支持；构建后跑一步 `npx pagefind --site public` 即生成自托管索引

**可定制**
- 头栏导航走 `hugo.toml` 菜单，加页面不改模板
- 界面文案用 i18n 覆盖；头栏图标按钮有预留插槽
- 首页卡片印记可用 front matter `cover` 换成自己的图

## 快速开始

```bash
# 1. 把主题放进站点（submodule 方式；或下载解压到 themes/xuanzhi）
git submodule add <你的主题仓库地址> themes/xuanzhi

# 2. hugo.toml 声明主题
theme = 'xuanzhi'

# 3. 预览
hugo server
```

> 环境要求：**Hugo extended ≥ 0.146**（图片管线需要 extended）。站内搜索是可选增强，想用的话在部署时于 `hugo` 后多跑一步 `npx pagefind --site public`（详见下方「搜索」与配置文档）。

## 使用

| 想做什么 | 看这里 |
|---|---|
| 安装、引入方式、junction → submodule | [docs/installation.md](docs/installation.md) |
| `hugo.toml` 全量配置（含「功能 → 配置 → 不配的后果」与复制粘贴样板） | [docs/configuration.md](docs/configuration.md) |
| 写作约定：图片 / 公式 / 短代码 / **媒体嵌入** / 封面印记 | [docs/writing.md](docs/writing.md) |
| 自定义：菜单、界面文案、头栏图标按钮 | [docs/customization.md](docs/customization.md) |
| 设计理念：这套视觉语言为什么长这样 | [docs/design.md](docs/design.md) |
| 主题与第三方资产许可 | [docs/licenses.md](docs/licenses.md) |

**站内搜索（可选，Pagefind）**：头栏放大镜 → 素纸面板，中文分词原生支持。索引不在 Hugo 构建里生成，需要在你的构建流程里多跑一步：

```bash
hugo
npx pagefind --site public
```

本地 `hugo server` 预览时搜索会提示「索引未生成」，这属预期——只有构建后跑过 pagefind 才有索引。GitHub Actions 写法与更多说明见 [docs/configuration.md「站内搜索：能力与边界」](docs/configuration.md#站内搜索能力与边界)。

## 开发

维护者与 AI 编码的完整指引在仓库根 [`CLAUDE.md`](CLAUDE.md)（与 `AGENTS.md` 逐字相同），发布 / 维护运行手册、待办台账与决策记录在 [`dev/`](dev/README.md)。主题仓库尚未正式发布，首次发布流程见 [`dev/publishing.md`](dev/publishing.md)。

## 许可

主题本体（模板 / CSS / JS）为 **MIT**，见 [LICENSE](LICENSE)。随主题分发的字体（霞鹜文楷 / 思源宋体 / JetBrains Mono）、KaTeX 样式与图标各有其许可，不因打包而变为 MIT，明细见 [docs/licenses.md](docs/licenses.md)。

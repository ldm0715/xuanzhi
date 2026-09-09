# Xuanzhi 宣纸

暖纸底、稿纸格纹、霞鹜文楷、墨阶排版的**极简中文博客主题**，为 Hugo ≥ 0.146（extended）设计。

把博客装进一张宣纸：亮色是「宣纸」、暗色是「夜墨」；点缀色在陶土橘 / 黛青之间切换，访客还能在头栏的外观面板里自选纸面、点缀色与分隔线。字体、KaTeX、图标、站内搜索全部**自托管、无第三方网络请求**（搜索索引由构建时的 Pagefind 生成本地文件，运行期不发任何外部请求）。

## 特性一览

**写作即所得的渲染管线**
- 图片自动转 WebP + 三档 srcset + 懒加载，点开进入「同纸虚化」的图窗灯箱
- 公式**构建期**渲染（KaTeX），禁 JS / 爬虫 / RSS 阅读器都能读到排好的公式；代码块双明暗高亮、带复制按钮
- 脚注、表格、任务列表、定义列表、嵌套引用等语义元素各有版式；中文着重号代替假斜体

**内容组织**
- 首页诗笺欢迎区 + 红框封文章卡片；归档按年/月（毛笔纪年 · 朱印领月）
- 分类索引是通栏书柜、标签索引是印谱；分类词页像打开函套、标签词页像钤在纸上
- 目录（TOC）+ scrollspy、长目录自动折叠、分页、线装式上下篇翻页

**分发与 SEO**
- robots.txt / sitemap / 自定义 RSS / Open Graph 全套 / JSON-LD
- **站内搜索（Pagefind）**：中文分词原生支持；构建后跑一次 `npx pagefind --site public` 生成索引，运行时只加载自托管文件

**可定制**
- 头栏导航走 `hugo.toml` 菜单，加页面不改模板
- 界面文案用 i18n 覆盖；头栏图标按钮有预留插槽
- 首页卡片印记可用 front matter `cover` 换成自己的图

## 快速开始

```bash
# 1. 把主题放进站点（示例用 submodule；也可下载解压到 themes/xuanzhi）
git submodule add <你的主题仓库地址> themes/xuanzhi

# 2. hugo.toml 声明主题
theme = 'xuanzhi'

# 3. 补最小配置并预览（完整配置项见 docs/configuration.md）
hugo server
```

## 文档

- [docs/installation.md](docs/installation.md) — 安装、引入方式与本地演示
- [docs/design.md](docs/design.md) — 设计理念：这套视觉语言为什么长这样
- [docs/configuration.md](docs/configuration.md) — 站点配置参考（含「功能 → 配置 → 不配的后果」）
- [docs/writing.md](docs/writing.md) — 写作约定：图片 / 公式 / 短代码 / 封面印记
- [docs/customization.md](docs/customization.md) — 菜单、界面文案、头栏图标按钮等自定义
- [docs/licenses.md](docs/licenses.md) — 主题与第三方资产许可

仓库里的 `exampleSite/` 是演示站，本地预览：`hugo server --source exampleSite`。

## 许可

主题本体（模板 / CSS / JS）为 **MIT**（见 `LICENSE`）。随主题分发的字体与图标各有其许可，不因打包而变为 MIT，明细见 [docs/licenses.md](docs/licenses.md)。

---

面向维护者与 AI 编码：开发指引在仓库根 [`CLAUDE.md`](CLAUDE.md)（与 `AGENTS.md` 逐字相同，供其他 agent 读取）；发布 / 维护运行手册与待办台账在 [`dev/`](dev/README.md)。

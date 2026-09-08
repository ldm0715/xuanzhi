# Xuanzhi 宣纸

暖纸底、稿纸格纹、霞鹜文楷、墨阶排版的极简中文博客主题（Hugo ≥ 0.146）。

- 亮色 = 宣纸：`#F7F4EC` 底 + 24px 稿纸格纹 + 墨阶四档文字
- 暗色 = 夜墨：`#282219` 底 + 纸色文字（跟随系统或手动切换，带防闪白）
- 明暗切换带**圆形揭示动画**（View Transitions API）：切暗色页面以按钮为圆心收缩，切亮色从按钮放出；圆心用百分比定位，浏览器缩放≠100% 依然对准按钮；不支持的浏览器或系统减弱动画时瞬时切换
- 点缀色双版并存，`hugo.toml` 一行切换，主页朱饰（信封框/邮戳/落款印）随点缀色换色：
  - `terracotta` 陶土橘 `#DA7756`（默认，朱砂装饰）
  - `indigo` 黛青 `#425066`（青印装饰）
- **外观面板**（导航栏调色板按钮）：访客可实时切换背景纹理与点缀色，选择存 localStorage
  - 背景 5 种：稿纸格（默认）/ 素纸 / 微噪点 / 噪点+暗角 / 稀疏信笺纹
  - 点缀色 2 种：陶土橘 / 黛青
  - 无记录时回落到 `hugo.toml` 的 `params.accent` 与默认格纹
- 首页两段式：诗笺欢迎区（诗泉 API 随机绝句、繁体竖排，构建期预取兜底）+ 双栏老式信封卡片（支持 front matter `cover` 自定义封面）
- 头栏宽度随页面类型过渡（窄 800px / 文章页 1150px），页面入场淡入，时长同曲线
- 霞鹜文楷 GB 自托管切片字体（cn-font-split，按 unicode-range 按需加载，首屏只拉几十 KB）
- 800px 单栏；代码高亮明暗两套（CSS 变量驱动）；代码复制按钮（全站唯一 JS）
- 首页 = 诗笺欢迎区（诗泉 API 随机绝句，竖排）+ 双栏老式信封卡片
- 图片管线：page bundle 图片自动 WebP + 三档 srcset + lazy + 宽高防抖动
- 内置：归档按年分组、标签、目录（TOC）、分页、RSS、404

## 引入你的博客

当前为开发期挂载（junction），主题改动即时生效，无需同步文件：

```powershell
# 已存在：F:\hugo_gcnanmu\themes\xuanzhi -> F:\hugo_theme
```

定稿后推荐改为 submodule 方式（主题独立仓库 + 站点锁定版本）：

```powershell
# 1. 把本仓库推到 GitHub
cd F:\hugo_theme
git remote add origin <你的主题仓库地址>
git push -u origin main

# 2. 站点里替换为 submodule
cd F:\hugo_gcnanmu
git rm --cached themes/xuanzhi   # 移除 junction 记录（文件仍在 F:\hugo_theme）
rmdir themes\xuanzhi             # 删掉 junction 本身（不影响 F:\hugo_theme）
git submodule add <你的主题仓库地址> themes/xuanzhi
```

## 站点配置示例（hugo.toml）

```toml
theme = 'xuanzhi'

[params]
  accent = 'terracotta'   # 点缀色：terracotta（陶土橘）/ indigo（黛青）

  # 首页诗笺欢迎语
  [params.hero]
    greeting = '一纸短笺，见字如面'

[markup]
  [markup.highlight]
    noClasses = false        # 必须，主题用 class 模式接管高亮配色
  [markup.tableOfContents]
    startLevel = 2
    endLevel = 4
```

- 明暗模式：访客首次进入跟随系统偏好，点页头按钮手动切换后记忆在 localStorage（键 `xuanzhi-theme`）
- 站名首字会渲染成页脚的印章，改 `title` 即生效

## 写作约定

- 图片与文章同目录（page bundle）：

```
content/posts/my-post/
├── index.md
└── photo.jpg
```

正文中直接 `![说明](photo.jpg)`，构建时自动压缩转 WebP 并生成响应式 srcset。**不要把图片放到外部图床**——图片和文章在同一个 Git 仓库里，是本主题和整个博客架构的根基约定。

### 首页信封卡封面

首页的每封信会带一幅「画片」。默认按文章标题哈希自动生成四式水墨小品（远山雾月 / 竹影 / 夜雨灯火 / 汀洲孤雁），同一篇文章永远同一幅。想用自定义封面，在 front matter 里给 `cover`：

```yaml
---
title: "我的文章"
cover: "cover.jpg"   # page bundle 内的文件名，或以 / 开头的静态图片路径
---
```

自定义图会经图片管线压成 WebP；不填 `cover` 就用生成的封面。

## 目录结构

```
layouts/
├── baseof.html          # 全站骨架
├── home.html            # 首页（诗笺欢迎区 + 信封卡片，最近 8 篇）
├── list.html            # 归档（按年分组）
├── single.html          # 文章页
├── taxonomy.html        # 标签汇总
├── term.html            # 单个标签下的文章
├── 404.html
├── partials/            # head / header / footer / post-item / post-card / post-card-cover / pagination
└── _markup/
    └── render-image.html  # 图片渲染钩子（WebP/srcset 管线）
assets/
├── css/token.css        # 设计 token（全部颜色/字体/版式变量在这里）
├── css/chroma.css       # 代码高亮（变量驱动，明暗自动跟随）
├── css/main.css         # 版式
└── js/site.js           # 明暗切换 + 复制按钮
static/fonts/lxgw/       # 霞鹜文楷 GB 切片字体（regular / medium）
scripts/                 # 开发辅助脚本
```

## 想改颜色？

全部在 `assets/css/token.css`：亮色一套、暗色一套、点缀色两版、背景纹理变量（`--bg-image` / `--bg-size` / `--tex-noise` / `--vignette`）。改完 `hugo server` 即时预览。

## 外观面板的取舍

面板由三部分组成，调试完想精简时按需移除：

- 面板 HTML：`layouts/partials/header.html` 中 `class="appearance"` 的整块
- 面板样式与背景切换规则：`assets/css/main.css` 中「外观面板」「背景方案」两段注释之间
- 面板交互：`assets/js/site.js` 中「外观面板」一段；另删除 `head.html` 内联脚本里 `xuanzhi-bg` / `xuanzhi-accent` 两行恢复逻辑

背景与点缀色本身的 CSS 变量建议保留——那是主题的配色系统，删面板不影响它们。

## 字体更新

字体来自 npm 包 `lxgw-wenkai-gb-web`（LXGW WenKai GB，SIL OFL 许可）。更新时：

```bash
npm view lxgw-wenkai-gb-web dist.tarball   # 拿最新地址
# 下载解压后，用 package/lxgwwenkaigb-regular 与 lxgwwenkaigb-medium
# 覆盖 static/fonts/lxgw/regular 与 medium（result.min.css 一并更新）
```

## 备份建议

本主题仓库与你的博客内容仓库各自独立成仓，建议各配双远端（GitHub 主远端 + Codeberg 或自建 bare 仓库镜像），定期 `git push` 双推。远端构成备份，不构成依赖——任一平台消失，本地仓库 + Hugo 二进制即可完整重建。

# Xuanzhi 主题 · 维护手册

作者向：改主题内部结构、配色、精简外观面板、更新字体与 KaTeX 自托管资产时用。使用者不需要读（配色/许可相关问题请看 `docs/`）。

## 内部目录结构

```
layouts/
├── baseof.html          # 全站骨架
├── home.html            # 首页（诗笺欢迎区 + 红框封卡片，最近 8 篇）
├── list.html            # 归档（毛笔纪年 + 朱印领月）
├── single.html          # 文章页
├── about.html           # 关于页：一个版心 + .Content，结构与样式全在短代码里
├── taxonomy.html        # 分类法索引页分发器 → 书架 / 印谱
├── term.html            # 单词页分发器 → 开函 / 钤印
├── 404.html
├── shortcodes/          # 覆写 details / qr，自带媒体三颗（video / audio / playlist）
│                        # 与关于页四颗（nameplate / social / project / colophon）
├── partials/            # head / header / footer / nav-links / appearance-tiles / header-extra
│                        # / post-item / post-card / post-card-cover / seal-count / pagination
│                        # / taxonomy-shelf / taxonomy-sealwall / term-category / term-tag
└── _markup/
    ├── render-image.html   # 图片渲染钩子（WebP/srcset 管线 + 图窗触发链接）
    └── render-heading.html # 标题毛笔圈点 + 锚点
assets/
├── css/token.css        # 设计 token（全部颜色/字体/版式变量在这里）
├── css/chroma.css       # 代码高亮（变量驱动，明暗自动跟随）
├── css/main.css         # 版式
├── fonts/               # 自托管字体的 @font-face CSS（head.html 用 resources.Get 探测）
└── js/site.js           # 明暗切换 + 外观面板 + 站内搜索(Pagefind) + 移动端下拉面板 + 复制按钮
                         # + scrollspy + 长目录折叠 + 诗笺刷新 + 图片灯箱
static/fonts/            # 字体二进制切片（woff2），原样发布到 /fonts/... 供上面的 CSS 相对引用
static/images/me.jpg     # 关于页自述块的**默认人像**（站点放同名同路径即可覆盖）
static/images/og-default.png  # 分享卡片默认图（同样靠站点同名覆盖）
static/images/covers/    # 八式水墨小品定妆预览稿（页面按题哈希内联渲染）
static/vendor/plyr.svg   # Plyr 图标 sprite（运行时取，必须放 static，不能放 assets）
```

## 想改颜色？

全部在 `assets/css/token.css`：亮色一套、暗色一套、点缀色两版（terracotta / indigo）、背景纹理变量（`--bg-image` / `--bg-size` / `--tex-noise` / `--vignette`）。改完 `hugo server` 即时预览。

图窗的裱边宽度是 `main.css`「图片灯箱」段的 `--lb-mat`，遮罩模糊半径是同一段的 `blur(10px)`——两个都在那一处调，别散落到别处。

## 外观面板的取舍

面板由三部分组成，调试完想精简时按需移除：

- 面板 HTML：`layouts/partials/header.html` 中 `class="appearance"` 的整块（里面的样张是 `partials/appearance-tiles.html`，**移动端下拉面板共用同一份**，要删就两处一起删）
- 面板样式与背景切换规则：`assets/css/main.css` 中「外观面板」「背景方案」两段注释之间
- 面板交互：`assets/js/site.js` 中「外观面板」一段——注意样张的点击委托和 `syncPressed()` 是**文档级**的（为了让移动端那组样张也能用），删面板后它们仍会命中别处样张，一并删；另删除 `head.html` 内联脚本里 `xuanzhi-bg` / `xuanzhi-accent` 两行恢复逻辑

背景与点缀色本身的 CSS 变量建议保留——那是主题的配色系统，删面板不影响它们。

## 字体更新

字体来自 npm 包 `lxgw-wenkai-gb-web`（LXGW WenKai GB，SIL OFL 许可）。更新时：

```bash
npm view lxgw-wenkai-gb-web dist.tarball   # 拿最新地址
# 下载解压后，用 package/lxgwwenkaigb-regular 与 lxgwwenkaigb-medium
# 覆盖 static/fonts/lxgw/regular 与 medium（woff2 切片）
# 对应的 @font-face CSS 在 assets/fonts/lxgw/ 下，一并更新 result.min.css
```

> 字体分成两半放：**CSS 在 `assets/fonts/`**（走 Hugo 的资源管线，`head.html` 用 `resources.Get` 探测——这是 module-aware 的，主题目录改名或用 Hugo Modules 安装都找得到），**woff2 切片在 `static/fonts/`**（原样发布）。两边的相对位置必须保持一致，因为 CSS 里是 `url(220.woff2)` 这种相对引用。
>
> 想换掉字体（比如改用自己的）：删掉 `static/fonts/` 与 `assets/fonts/` 下对应的目录即可——`head.html` 用 `resources.Get` 探测，文件不在了就自动不输出那几行 `<link>`，不会 404。

## KaTeX 自托管版本的坑

自托管的 `static/katex/katex.min.css` 版本必须与 Hugo `transform.ToMath` 输出匹配（现代类名 `.sizing`；若误用旧版 `.katex-sizing`，上下标不会缩小/抬起）。

模板中对 KaTeX 样式表这类静态资源一律用**不带前导 `/` 的 `relURL`** 引用——写成 `/katex/…` 这类根绝对路径时，部署在项目型 Pages 子路径会 404，表现是公式旁露出 LaTeX 原文、搜索索引加载失败（2026-09-09，详见 [`archive/04-math-formula-subsuper-and-subpath-fixes.md`](archive/04-math-formula-subsuper-and-subpath-fixes.md)）。

## 第三方资产归属

主题随附字体 / KaTeX / 图标的**归属与许可表**（以及哪些改动算改协议）现在放在用户文档 [`docs/licenses.md`](../docs/licenses.md)——那是分发时必须向使用者交代的信息，别在这里维护第二份。本手册只管"怎么更新/换掉它们"。

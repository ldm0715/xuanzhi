# Xuanzhi（宣纸）Hugo 主题

自研 Hugo 博客主题（≥0.146 extended），设计语言：暖宣纸底、稿纸格纹、霞鹜文楷、墨阶排版、朱砂/黛青双点缀色。定位是"资产化"主题——源全在 Git、零第三方运行时依赖。

## 目录关系（重要）

- 本仓库 = 主题，独立 Git 仓库（远端未配置，勿 push）
- 配套博客站点：`F:\hugo_gcnanmu`（另一个独立仓库，主题以 **junction** 挂载：`F:\hugo_gcnanmu\themes\xuanzhi → F:\hugo_theme`，两个路径是同一目录；站点 `.gitignore` 已排除该 junction，勿删）
- 主题改动即时生效于站点，无需同步文件

## 常用命令

```bash
# 预览（1313 端口常被占，用 1314）
hugo server --source F:/hugo_gcnanmu --bind 127.0.0.1 --port 1314
# 构建
hugo --source F:/hugo_gcnanmu --gc
# 测试图生成（PowerShell 脚本，勿用 bash 内联传 $ 变量——会被吞）
powershell -NoProfile -ExecutionPolicy Bypass -File F:/hugo_theme/scripts/make-test-image.ps1
```

## 结构与规则

- `assets/css/token.css`：**全部设计 token**（色彩、字体、纹理 data-uri、分隔线用色，亮暗各一套）。改样式从这里进，禁止在别处硬编码颜色
- `assets/js/site.js`：全站唯一 JS（明暗切换、外观面板、代码复制、目录 scrollspy）。新增交互必须并进这个文件
- 外观系统全走 `html` 的 `data-*` 属性 + CSS 变量：`data-theme`(light/dark)、`data-accent`(terracotta/indigo)、`data-bg`(5 种纸面纹理)、`data-hr`(4 种分隔线)；选择持久化在 localStorage（键前缀 `xuanzhi-`），`head.html` 内联脚本负责防闪烁恢复
- `layouts/` 是 0.146+ 顶层模板结构；`_markup/render-image.html`（page bundle 图片 → WebP/srcset）和 `_markup/render-heading.html`（标题毛笔圈点 + 锚点）是渲染钩子
- 首页 = 诗笺 + 信封卡片两段：诗笺由 `home.html` 构建期 `resources.GetRemote` 预取绝句（`try` + 内置《鹿柴》兜底）、`site.js` 每次到访随机刷新（`lang=zh-Hant` 繁体）；信封卡片 = `partials/post-card.html`（结构）+ `partials/post-card-cover.html`（封面：front matter `cover` 自定义图，否则按标题哈希生成四式水墨小品）
- 朱饰系 token（`--color-zhu` / `--color-zhu-strong` / `--color-zhu-soft`）随 `data-accent` 换色：terracotta = 朱砂，indigo = 黛青（青印）；新增装饰色一律进 token.css 并补齐亮暗 + 双点缀色四象限
- 头栏是半透明宣纸毛玻璃（`--color-header-bg` + backdrop-filter）；头栏宽度随页面类型过渡：窄 `--content-width` / 文章页 1150px，CSS 基础值与 `site.js`「头栏宽度过渡」段的 NARROW/WIDE 常量必须同步改
- 明暗切换圆形揭示：`site.js`「明暗切换」段写 `--theme-x/y/r`（**百分比**，理由见已知坑），`main.css`「明暗切换圆形揭示」段定义方向与 keyframes；方向靠「动画运行时 `data-theme` 已是新值」判定（dark 收缩旧快照、light 扩张新快照），改时长/曲线只动 main.css 两条 `animation`
- KaTeX 按需加载：`head.html` 用 `findRE` 检测 `.RawContent` 里的公式定界符，只有含公式的页面引入
- `static/` 下 27MB 是自托管资产（霞鹜文楷切片、JetBrains Mono、KaTeX），属正常入库内容

## 已知坑（都踩过）

- goldmark passthrough 的启用键是 **`enable = true`**，写成 `enabled` 不报错但静默失效（行内公式 `\(` 会被当转义吃掉）
- Hugo 0.146+ 模板在 `layouts/` 顶层（`home.html`/`single.html`…），`site.MainSections` 返回字符串数组不是页面对象，`Pager.PageGroups` 已不可用（归档用 `.Pages.GroupByDate "2006"`）
- 分页器 Pager 只有 `.URL` / `.PageNumber` 等字段，**没有 `.RelPermalink`**——pagination partial 里写 `.RelPermalink` 只有一页时不炸，出现第二页才炸（已踩过）
- Hugo `int` 函数不接受进制参数，字符串转整数哈希用 `hash.FNV32a`
- 测试文章日期写成未来时间会"消失"（默认不渲染 future content）
- CSS mask 方案里 `background-color: transparent` 会让整条形状消失——mask 只管形状，颜色必须给非透明 `background-color`
- SVG 图标 path 一律从官方 npm 包取（`@material-design-icons/svg`），不凭记忆手写
- View Transitions 的快照盒在**浏览器缩放≠100% 时不按 CSS 像素取尺寸**（Edge 页面缩放 125% 实测圆心大幅偏移）：圆形揭示的圆心/半径必须写**百分比**（对 `root.clientWidth/clientHeight` 取比例，半径对 `sqrt(w²+h²)/√2` 解析基准取比例），绝对 px 只在 100% 缩放下正确（已踩过）

## 相关文档

- `README.md`：站点引入方式（junction → submodule）、主题配置项、字体更新方法
- git stash 里有失败的书桌场景实验（`desk scene experiment`），仅作参考，未验收

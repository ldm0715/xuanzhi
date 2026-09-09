# 2026-09-09 · 公式上下标渲染 与 子路径部署下的静态资源

> 日期命名文档：本次记录「KaTeX 公式上下标显示异常」与「子路径部署下样式表 404 导致公式旁露出 LaTeX 原文」两个问题。同批次还处理了搜索索引的子路径 404（同类病根，见文末）。

## 问题一：公式上下标不生效（`mc^2` 的 `2`、`a_{11}` 的 `11` 不缩小/不抬起）

### 现象

公式主体能渲染，但上标/下标退化成正文大小——比如 `E=mc^2` 的 `2` 与 `c` 同字号，几乎在同一行，不像真正的上标。

CDP 实测（`getComputedStyle`）：上标 `2` 字号 = 正文 20.57px（应为 14.4px ≈ 0.7×）。

### 根因

Hugo `transform.ToMath` 内置的是较新 KaTeX，其上下标包装类名用 **`.sizing`**：

```html
<span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span>
```

而主题自托管的 `static/katex/katex.min.css` 是旧版 KaTeX，尺寸缩放规则只认旧类名 **`.katex-sizing`**：

```css
/* 旧（匹配不到 markup 的 .sizing） */
.katex .katex-sizing.reset-size6.size3 { font-size: .7em }
/* 新（匹配 Hugo ToMath 输出） */
.katex .sizing.reset-size6.size3 { font-size: .7em }
```

旧 CSS 匹配不到 `.sizing` → 上/下标包装不会缩小字号，KaTeX 又照常做垂直偏移，于是得到"全尺寸、只偏高一点"的伪上下标。

### 修复

- 用与 Hugo ToMath 输出匹配的现代 KaTeX CSS（0.16.x，`.sizing` 命名）替换 `static/katex/katex.min.css`。
- 字体无需变动：校验过新 CSS 引用的 20 个 `fonts/*.woff2` 本地均已存在。
- 验证：替换后上标 `2` 字号 20.57 → 14.4px，且正确抬起。

## 问题二：子路径部署（GitHub Pages 项目型）下，公式正常但下方/旁边还显示一行 LaTeX 原文

### 现象

`https://<owner>.github.io/<repo>/posts/math-formulas/` 上，渲染好的公式下面会出现原始字符，例如矩阵 `A=(a11?a21??…)`。本地根路径开发无此问题。

### 根因

KaTeX 的 `output: htmlAndMathml` 会输出**双份**：

- `.katex-html`：给人看的渲染结果；
- `.katex-mathml`：给读屏的 MathML 副本，其中的 `<annotation>` 存着**原始 LaTeX**。

KaTeX CSS 靠 `.katex-mathml { clip: rect(...); position:absolute; … }` 把这份 MathML 视觉隐藏。但主题模板把样式表写成了**从域名根算起的绝对路径**：

```html
<link rel="stylesheet" href="/katex/katex.min.css">
```

项目型 Pages 部署在 `/repo/` 子路径，浏览器请求的是 `https://<owner>.github.io/katex/katex.min.css` → **404**，隐藏规则没加载，MathML 原文就漏出来贴在公式下方。与「搜索 `/index.json` 在子路径 404」是同一类病根。

### 修复

`layouts/partials/head.html` 里 KaTeX 样式表改用 baseURL 相对引用：

```html
<link rel="stylesheet" href="{{ "katex/katex.min.css" | relURL }}">
```

注意：

- 不能写前导 `/`，也不能用 `absURL`/`relURL` 配 `/katex/…`——Hugo 对以 `/` 开头的串会跳过 baseURL 的子路径（返回域名根）。
- 用不带前导 `/` 的 `relURL`，子路径下得到 `/xuanzhi/katex/katex.min.css`，根路径下仍是 `/katex/katex.min.css`。

### 验证

- 子路径 baseURL 构建：`href=/xuanzhi/katex/katex.min.css`
- 根路径 baseURL 构建：`href="/katex/katex.min.css"`
- 输出根目录仍含 `katex/katex.min.css`
- 线上生效需**重新跑 demo 部署工作流**（`.github/workflows/demo.yml`）

## 关联问题：站内搜索索引在子路径 404

同根因、同日处理：`assets/js/site.js` 原先硬编码 `fetch('/index.json')`，子路径部署 404 →「索引加载失败」。改为 `layouts/baseof.html` 在 `<html>` 上输出 `data-search-index`（取首页 json 输出的 `RelPermalink`），`site.js` 读它、缺省回落 `/index.json`。

## 配置说明

以上修复**都不需要改动站点 `hugo.toml`**。已满足的既有配置仍应保留：

- 公式：`markup.goldmark.extensions.passthrough.enable = true`（见 README 配置表）
- 搜索：`[outputs] home = ['html', 'rss', 'json']`
- 部署在子路径时 `baseURL` 末尾带 `/`（GitHub Pages workflow 已用 `--baseURL` 传入）

## 涉及文件

- `static/katex/katex.min.css` —— 升级到匹配 `.sizing` 的 KaTeX CSS
- `layouts/partials/head.html` —— KaTeX 样式表改 `relURL`
- `layouts/baseof.html` —— 输出 `data-search-index`
- `assets/js/site.js` —— 索引 URL 读 `data-search-index`

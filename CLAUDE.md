# Xuanzhi（宣纸）Hugo 主题

原创 Hugo 博客主题（≥0.146 extended）。设计语言：暖宣纸底、稿纸格纹、霞鹜文楷、墨阶排版、朱砂/黛青双点缀色。**资产化**：字体 / KaTeX / 图标 / 播放器 / 搜索索引一律自托管（Pagefind 等只在构建期跑）。**首页诗笺要联网**（诗泉 API），构建期与运行期各取一次，失败静默兜底；端点写在 `layouts/home.html` 与 `site.js` 两处，**改要一起改**。

> 开发指引，位于仓库根；改主题代码前读完。使用者看 `README.md` 与 `docs/`。**读代码看不出来**的坑与关键决策在 [`dev/internals.md`](dev/internals.md)，待办在 [`dev/todo.md`](dev/todo.md)。

## 目录关系

- 本仓库 = 主题，独立 Git 仓库。配套站点 `F:\hugo_gcnanmu` 以 **git submodule** 引主题（`themes/xuanzhi` → 本仓库的 GitHub 远端）；**改动要 push 后、在站点侧 `git submodule update --remote themes/xuanzhi` 才生效**——直接改本仓库不会自动进到站点。
- `docs/` = 用户手册，**同时是演示站正文**（`exampleSite` 用 module mount 挂成 `content/posts`），只有这一份源文件；正文从 `##` 起、不写 H1。

## 常用命令

```bash
hugo server --source F:/hugo_gcnanmu --bind 127.0.0.1 --port 1314   # 预览
hugo --source F:/hugo_gcnanmu --gc                                   # 构建
hugo server --source exampleSite                                     # 演示站
git tag vx.y.z && git push --tags   # 发版：先在 CHANGELOG.md 顶部加 ## [x.y.z] - YYYY-MM-DD
```

## 核心约定

- **颜色唯一来源是 `token.css`**：别处禁止硬编码；朱饰 / 纹理 token 要补「亮暗 × 双点缀色」四象限。
- **`site.js` 是唯一自家 JS**（新交互并进去）；**`vendor/` 不自改**，皮肤覆写写在 `main.css`，且只在嵌媒体的页面打包（`head.html` 用 `.HasShortcode` 判）。
- **`Concat` 按目标名缓存**：同一模板给不同内容拼产物时，目标名必须区分。
- **外观走 `html` 的 `data-*` + CSS 变量**，选择持久化在 localStorage（前缀 `xuanzhi-`），`head.html` 内联脚本防闪烁。
- **渲染钩子都在 `_markup/`**：图片图窗是渐进增强（href 别换成 `#`）；外链在**服务端**判定，别用 CSS `a[href^="http"]`。
- **界面文案唯一出处是 `i18n/zh-cn.yaml`**，禁止硬编码中文，key 必须扁平；JS 拿不到 i18n，由模板经 `data-*` 传进去。
- **`<script>` 里输出 JSON 必须 `jsonify | safeJS`**。
- **导航走 Hugo 菜单**（改配置不改模板）；注意 `site.MainSections` 是"页数最多的栏目"，站点须配 `params.mainSections`。
- **装饰性标记走朱饰系（随点缀色）、语义性留墨阶**；通用短代码的样式挂正文作用域（`.post-content` 前缀承重，去掉会静默失效）。
- **`em` 用着重号不用斜体**（文楷无真斜体）；**打印样式是全站唯一刻意不用 token 处**。
- **字体 / KaTeX 自托管两半放**：CSS 在 `assets/fonts/`、二进制在 `static/fonts/`，相对位置必须一致；`resources.Get` 站点先于主题。
- **`docs/` 演示站挂载**必须同时补 `content → content`；手册各篇 front matter（`title`/`date`/`weight`/`description`）要齐。
- **`CHANGELOG.md` 是 Release Notes 的来源**——发版 workflow 直接读取它当发布说明；**只在用户明确说要发布时才写入**，平时不要往里加内容。
- **发版**：版本号唯一出处是 `CHANGELOG.md`（格式 `## [x.y.z] - YYYY-MM-DD`）；包里放什么由 `.gitattributes` 决定。
- 写/dev文档不要写细节，只要写关键部分的摘要就行了，细节以代码为准

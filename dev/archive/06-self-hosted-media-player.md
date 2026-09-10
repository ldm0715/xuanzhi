# 自托管媒体播放器（Plyr + APlayer）

> 记录于 2026-09-10。本次为站内自托管的视频 / 音频加了一套播放能力。控件与播放逻辑交给两个成熟库（Plyr 管视频、APlayer 管音频），主题这边负责短代码、皮肤与初始化胶水。

## 一、选型：为什么用第三方

着眼点是媒体播放器真正的难点：

- **seek 节流**——若不节流地在 `pointermove` 上写 `currentTime`，高刷屏上是上百次/秒，
  每次都会中止在途加载、重发 Range 请求
- **缓冲状态机**——`readyState` / `waiting` / `stalled` 各种组合下的恢复
- **移动端自动播放策略**——各家浏览器对 `play()` 的拦截条件不一样

这三样在真实浏览器环境里的打磨，正是这两个库的价值所在。

### 一条要留着的提醒：换库不等于问题已解决

开发过程中出现过「播放中途卡住」的症状，**始终没有定位到根因**。选第三方是在这个前提下
做的权衡，不是确诊后的治疗。**如果根因在网络、素材或浏览器策略上，换成 Plyr 会以完全
相同的方式复现。** 写在这里，是为了避免后人误以为「换了库所以问题解决了」。

顺带记两个当时查出来的边界缺陷。与选型无关，但任何自己实现进度条的人都会撞上：

- 进度条的 `pointerup` / `pointercancel` 只绑在进度条元素上时，指针在窗口外松开会让
  `is-scrubbing` 永久卡住，之后鼠标划过进度条就一直在 seek
- `<source type="audio/mp3">` 是错的 MIME，规范值是 `audio/mpeg`

## 二、短代码 API

| 短代码 | 渲染方 | 需闭合 |
|---|---|---|
| `video` | Plyr | 否 |
| `audio` | APlayer（单曲） | 否 |
| `playlist` | APlayer（多曲，内容体是 YAML 列表） | **是** |

参数面：`video` 收 `src` / `poster` / `caption` / `start` / `loop`；
`audio` 与 `playlist` 的每条曲目收 `src` / `title` / `artist` / `cover` / `lrc`。

### 为什么单曲与列表是两颗短代码

**Hugo 是按「模板里有没有引用 `.Inner`」来决定短代码要不要闭合的。** 初版写成一颗 `audio`，
既收参数又读 `.Inner`——结果 `{{< audio src="…" >}}` 直接构建失败：

```
failed to extract shortcode: shortcode "audio" must be closed or self-closed
```

拆开之后两种写法都自然。这条约束在写任何"可选内容体"的短代码时都会撞上，值得记住。

列表用 YAML 而不是管道分隔的一行一曲：标题里出现分隔符就崩。

## 三、vendor：两个必须做的改动

两个库自托管在 `assets/vendor/`（出处、版本、许可见那里的 `README.md`），没有 npm 构建链，
dist 是手工放进来的。**升级时必须重做**下面两步：

### 1. 删掉末行的 `//# sourceMappingURL=`

两个原因，第二个是会出事的那个：

- `.map` 没一起 vendor，留着就是一条必然 404 的请求；
- **`APlayer.min.js` 不以换行结尾**，末行又正好是 `//` 行注释。直接参与 `resources.Concat`
  的话，紧跟在它后面的 `site.js` **第一行会被这行注释整行吞掉**——而且构建不报错，
  运行时才炸。

```bash
sed -i '/^\/\/# sourceMappingURL=/d' <file>
```

### 2. Plyr 的图标 sprite 必须放 `static/`

Plyr 默认从 `cdn.plyr.io` 取图标。自托管后必须把 `plyr.svg` 也 vendor 下来，
并让 `site.js` 通过 `data-plyr-icon` 指过去——**不指就是一片空白**。
它放 `static/vendor/plyr.svg` 而非 `assets/`，因为这是浏览器**运行时**去取的，
不走构建管线。

## 四、按页面条件加载

两个库合计约 212KB，而绝大多数页面根本不嵌媒体。`head.html` 用 `.HasShortcode` 在构建期判断：

```go-html-template
{{- $hasPlayer := or (.HasShortcode "video") (.HasShortcode "audio") (.HasShortcode "playlist") -}}
```

有媒体的页面把 vendor 与 `token.css` / `chroma.css` / `main.css` 或 `site.js` 拼成**单份产物**，
其余页面一个字节都不多背。实测：媒体页 194KB JS / 137KB CSS，普通文章页 22KB / 92KB。

顺带把原来 3 个 `<link>` 合成 1 个，请求数反而更少。

### 踩到的坑：`resources.Concat` 按目标路径缓存

两个分支（有 / 无 vendor）最初共用了 `css/xuanzhi.css` 这个目标名，结果先算出来的那份
**被复用给所有页面**——媒体页永远拿不到 vendor CSS，而且**结果随构建顺序漂移**，
是个会随时序变化的不确定性 bug。**不同内容必须给不同目标名。**

另外：只 minify 自家 CSS/JS。vendor 那份已经压过，重复压没有收益，还多一分把已压缩代码压坏的风险。

## 五、皮肤覆写

- **Plyr** 官方支持压 `--plyr-*` 变量，不用跟选择器打架。
- **APlayer** 的主题色是**行内样式**（`theme()` 直接写 `style.backgroundColor`），选择器压不过，
  几处只能上 `!important`。好处是它**不做颜色运算**，所以传 `var(--color-accent)` 能跟着
  明暗 / 点缀色**实时**变，比传死色值好。

### 事故：把"纸上的墨色"用到了视频画面上

初版写了 `--plyr-video-control-color: var(--paper-tool-ink)`（深棕 `#4A3A22`）。
但 Plyr 的控件条**不在纸上**，它压在视频画面上，自带一层深色渐变：

```css
.plyr__controls { background: linear-gradient(#0000, #000000bf); color: #fff; }
```

深棕压近黑。**纸的隐喻在这里不成立。** 实算对比度（WCAG 对非文字图形要求 ≥ 3:1）：

| 位置 | 修复前 | 修复后 |
|---|---|---|
| 控件条图标 | 1.17 – 1.49 : 1 | 8.47 – 14.72 : 1 |
| 中间大播放按钮 | **1.05 : 1**（基本看不见） | 10.34 : 1 |

同一个错误连带三处：进度条的已缓冲段、`.plyr__control--overlaid`（Plyr 让它复用同一个变量）、
以及 APlayer 封面上的播放按钮（`opacity: .8` 的白三角压 `rgba(0,0,0,.2)` 圆，封面一偏亮就虚）。

修复引入了两个**不参与四象限翻转**的 token，因为它们的背景永远是视频帧或封面，不是纸：

```css
--on-video: #F7F3EB;                      /* 压在画面上的字 ⇒ 常亮 */
--on-video-veil: rgba(0, 0, 0, 0.55);     /* 压在画面上的底 ⇒ 常深 */
```

## 六、`site.js` 的初始化胶水

只剩约 110 行。三个必须知道的点：

1. **Plyr 的 i18n 由 `baseof.html` 写到 `<html>` 的 `data-player-*` 上**——JS 拿不到 Hugo 的
   i18n。连字符映射成 camelCase，所以是 `data-player-exit-fullscreen` → `dataset.playerExitFullscreen`，
   属性名要按这个写。
2. **APlayer 的 `lrcType` 默认是 0（不显示歌词）**，传了 `lrc` 也不会有任何提示，纯静默。
   模板按「这组曲目有没有 lrc」自动设成 3（3 = 歌词是文件 URL）。
3. **`mutex: true` 是 APlayer 的默认值**（自带多实例互斥），但它**管不到 Plyr**。
   `site.js` 里补了一层音视频互斥，否则一页同时有视频和播放列表会两个一起响。

曲目数据经 `jsonify | safeJS` 塞进 `<script type="application/json">`。
**`safeJS` 不能省**：`jsonify` 返回普通字符串，而 `<script>` 里是 JS 上下文，
html/template 会把它当 JS 字符串字面量再转义一次，输出成 `"[{\"url\":…}]"`——
`JSON.parse` 拿到的是字符串不是数组。安全性由 jsonify 自身保证（Go 的 encoding/json
默认把 `<` `>` `&` 转成 `<` 之类）。

## 七、封面不能从音频文件里自动读（已验证，别再试）

需求是「丢一个 FLAC 进去，主题自动用它的内嵌封面」。**Hugo 模板做不到**，
不是配置问题，是语言能力问题。用真实的 26.7 MB FLAC 实测过：

- 字节偏移**能**算出来：`split` 之后取第一段的 `len` 就是字节位置（`strings.Index` 在 Hugo 里
  根本不存在）。实测 JPEG 起始偏移 `soi=3389`，数值合理。
- 但**没有任何字节安全的切片原语**能消费这个偏移。Hugo 的 `substr` 是**按 rune 切**的，
  二进制里的非法 UTF-8 字节会被替换成 `U+FFFD`，偏移和长度全错——实测 `jpeglen=49158337`，
  比整个文件（26730518）还大，抽出来的东西 `file` 判为 `data` 而非 JPEG。
- base64 绕道也不成立：base64 是 3 字节一组，而 3 字节的 JPEG 标记（`FF D8 FF`）落在哪一组
  取决于偏移，得试三种对齐，仍然脆弱。
- 顺带量到的代价：`os.ReadFile` 在 `head.html` 里就是**每页读一遍 26 MB**，
  构建从 1.4 秒涨到 11 秒。

所以封面**必须单独给**。很多音频文件自带封面，抽出来就行：

```bash
ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg
```

没给 `cover` 时 APlayer 显示一块**点缀色**方块（它把封面底色设成主题色），不会留空洞。

## 验证

- `hugo` 构建通过，无 warn
- 拼接产物 `node --check` 通过（这是验证 sourceMappingURL 陷阱已排除的关键检验）
- 媒体页 / 非媒体页资源分流实测正确
- 曲目 JSON 能被 `JSON.parse` 直接吃掉（1 首 / 2 首都验过）
- Plyr sprite 已发布到 `/vendor/plyr.svg`
- `.lrc` 实测响应头为 `text/plain; charset=utf-8`（中文不乱码）；`.flac` 为 `audio/x-flac`
  且支持 Range（HTTP 206）
- **未做视觉与运行时验收**：歌词是否真的显示、Plyr 图标是否出来、音视频互斥、
  以及**原症状是否真的消失**，都需要人眼确认

## 涉及文件

- `assets/vendor/`（Plyr、APlayer + `README.md`）、`static/vendor/plyr.svg`
- `layouts/shortcodes/{video,audio,playlist}.html`
- `layouts/partials/{player-src,player-audio}.html`
- `layouts/partials/head.html` —— `.HasShortcode` 条件拼接、两个变体的目标名
- `layouts/baseof.html` —— `data-player-*` 与 `data-plyr-icon`
- `assets/js/site.js` —— 播放器初始化胶水
- `assets/css/{token,main}.css` —— `--on-video` 系列与 Plyr / APlayer 覆写
- `i18n/zh-cn.yaml`、`docs/writing.md`

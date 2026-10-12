# vendor · 第三方库

这里没有 npm 构建链，dist 文件都是手工放进来的，升级时按下面的地址重下、
重跑一次「已做的改动」。

## 目录

| 文件 | 来源 | 版本 | 许可 |
|---|---|---|---|
| `plyr/plyr.min.js`、`plyr/plyr.css` | https://cdn.jsdelivr.net/npm/plyr@3.8.3/dist/ | 3.8.3 | MIT © Sam Potts |
| `aplayer/APlayer.min.js`、`aplayer/APlayer.min.css` | https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/ | 1.10.1 | MIT © DIYgod |
| `static/vendor/waline/waline.umd.js`、`waline.css`、`waline-meta.css` | https://cdn.jsdelivr.net/npm/@waline/client@3.16.0/dist/ | 3.16.0 | MIT © lizheming |

Waline 是**两份**样式表，缺一不可：`waline.css` 是组件本体，`waline-meta.css`
只管评论卡片上「地址 / 浏览器 / 系统」那排小签的图标（一堆 Font Awesome 的
data-URI，还按 `[data-value^=chrome]` 这种前缀分浏览器）。只 vendor 前者的话，
那排就只有字、没有图标——不是样式没写，是图根本没下发。

## 两类库，取用方式不同

**构建期拼接（播放器）** —— 由 `head.html` 在**含媒体短代码的页面**上，与
`token.css` / `chroma.css` / `main.css` 或 `site.js` 用 `resources.Concat`
拼成单份产物。**vendor 的 CSS 排在 `main.css` 之前**，同特异性的覆写靠源码顺序取胜。

**运行期取用（Waline）** —— 文件在 `static/`，由 `site.js` 的「评论」段滚到
视口前 400px 才注入两份 `<link>` 与 `<script>`。放 `static/` 而不是 `assets/`，是因为
`assets/` 下的资源没被构建管线引用时不保证发布；它和 `static/vendor/plyr.svg`
是同一条路子。代价是没有 `fingerprint`，升级 Waline 后旧缓存要等浏览器自己过期。

由此带来一处**和播放器正好相反**的约束：运行期注入的 `waline.css` 必然落在
`main.css` **之后**，同特异性时它反倒赢。所以评论皮肤整段用 `#waline` 起头
（id 特异性高过 `html[data-theme="dark"]`），不赌加载顺序。详见 `main.css`
的「评论（Waline）」段。

Plyr 的图标 sprite 同样是运行期取的（`new Plyr(el, { iconUrl })`），在
**`static/vendor/plyr.svg`**。Plyr 默认的 `iconUrl` 指向 `cdn.plyr.io`，
不指过来的话自托管后图标全空。

## 已做的改动（升级后必须重做）

1. **删掉末行的 `sourceMappingURL` 注释。** 每个文件都要做，`.css` 也不例外
   （`waline-meta.css` 就带一条）。两个原因，第一个是必然 404，第二个是会出事的那个：

   - `.map` 文件没一起 vendor，留着就是一条必然 404 的请求；
   - `APlayer.min.js` 和 `waline.umd.js` **都不以换行结尾**，末行又正好是
     `//` 行注释。参与 `resources.Concat` 的话，紧跟在它后面的文件第一行会被
     这行注释整行吞掉，而且是静默的——构建不报错，运行时才炸。Waline 目前不
     参与拼接，但按同一套手法处理，省得哪天改了加载方式再来查。

   ```bash
   sed -i '/^\/\/# sourceMappingURL=/d' <file>.js
   sed -i 's|/\*# sourceMappingURL=.*\*/||' <file>.css
   ```

2. **几个 min 版都把 MIT 版权头剥掉了**，所以这份 README 兼作许可声明。
   上游仓库：https://github.com/sampotts/plyr 、https://github.com/DIYgod/APlayer 、
   https://github.com/walinejs/waline

3. **Waline 用的是 `waline.umd.js` 而不是文档里默认的 `waline.js`。**
   两者体积一样（约 275KB），但 UMD 在浏览器里挂成全局 `Waline`，可以用一个普通
   `<script src>` 取来；ESM 那份只能走 `import()`。文档默认给的是 ESM，重下时
   别拿错。同理不需要 `comment.umd.js` / `pageview.umd.js`：`init` 的 `comment:`
   选项（传 CSS 选择器）就带评论数统计，含在主包里。

## 为什么这几个库

播放器选型的着眼点是媒体真正的难点：**seek 节流、缓冲状态机、移动端自动播放策略**。
这三样在真实浏览器环境里的打磨，正是这两个库的价值所在。分工是**视频走 Plyr、
音频走 APlayer**（APlayer 只做音频，视频得另配一套）。

Waline 是评论里少数**服务端自己部署、客户端只是一个挂件**的方案，自托管得干净：
服务端在 Vercel，客户端两个文件进仓库，数据在自己手里，没有被第三方平台锁住。
代价是它默认会去 unpkg 拉表情包——主题把 `emoji` 默认关掉了，那是诗笺之外
凭空的第二条外部请求。

# vendor · 第三方播放器

这两个库由 `head.html` 在**含媒体短代码的页面**上，与 `token.css` / `chroma.css` /
`main.css` 或 `site.js` 用 `resources.Concat` 拼成单份产物。没有 npm 构建链，
dist 文件是手工放进来的，升级时按下面的地址重下、重跑一次「已做的改动」。

## 目录

| 文件 | 来源 | 版本 | 许可 |
|---|---|---|---|
| `plyr/plyr.min.js`、`plyr/plyr.css` | https://cdn.jsdelivr.net/npm/plyr@3.8.3/dist/ | 3.8.3 | MIT © Sam Potts |
| `aplayer/APlayer.min.js`、`aplayer/APlayer.min.css` | https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/ | 1.10.1 | MIT © DIYgod |

Plyr 的图标 sprite 不在 `assets/` 而在 **`static/vendor/plyr.svg`**——它是浏览器
**运行时**去取的（`new Plyr(el, { iconUrl })`），不走构建管线，放 `assets/` 取不到。
Plyr 默认的 `iconUrl` 指向 `cdn.plyr.io`，不指过来的话自托管后图标全空。

## 已做的改动（升级后必须重做）

1. **删掉末行的 `//# sourceMappingURL=…`。** 两个原因，第二个是会出事的那个：
   - `.map` 文件没一起 vendor，留着就是一条必然 404 的请求；
   - `APlayer.min.js` **不以换行结尾**，末行又正好是 `//` 行注释。直接参与
     `resources.Concat` 的话，紧跟在它后面的 `site.js` 第一行会被这行注释整行吞掉，
     而且是静默的——构建不报错，运行时才炸。

   重做方式：`sed -i '/^\/\/# sourceMappingURL=/d' <file>`

2. **两个 min 版都把 MIT 版权头剥掉了**，所以这份 README 兼作许可声明。
   上游仓库：https://github.com/sampotts/plyr 、https://github.com/DIYgod/APlayer

## 为什么这两个库

选型的着眼点是媒体播放器真正的难点：**seek 节流、缓冲状态机、移动端自动播放策略**。
这三样在真实浏览器环境里的打磨，正是这两个库的价值所在。

分工是 **视频走 Plyr、音频走 APlayer**（APlayer 只做音频，视频得另配一套）。

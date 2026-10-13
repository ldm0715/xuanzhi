---
title: "关于"
layout: "about"

# 框架宽度：内容页默认走文章页的宽档（1150px，头栏与页脚一起展开），
# 但正文的 .container 仍是 800px，于是头栏页脚会比正文宽出一截。
# 这里不是长文，写 narrow 收回窄档，头栏页脚与正文对齐。
frame: "narrow"

# 以下是演示内容：nameplate / social / project 里填的都是主题作者本人的信息。
# 抄这一篇当模板时，整段替换成你自己的。
# 主题**不带**默认人像，所以这里显式写了 image=——那张图是演示站自己的，放在
# exampleSite/static/images/me.jpg（用户站点照做：放自己的图，再指过来）。
# project 短代码另有两种形态（没 url 的渲染成纯文字、archived="true" 换白文印），
# 见文档「六、短代码参考」。
---

{{< nameplate name="宫城楠木" role="广州大学在读" image="/images/me.jpg" >}}

- 🎓 广州大学在读，平时喜欢把「用着顺手」的小东西真的做出来
- 🧰 桌面端偏多：Tauri v2、WinUI 3、Flutter、PySide6 / Qt 都在折腾
- 🌏 常用语言：`Go` · `C#` · `Python` · `TypeScript` · `Dart` · `JavaScript`
- ✍️ 写博客，也写主题 —— 自己的 Hugo 主题 [xuanzhi](https://github.com/ldm0715/xuanzhi)

{{< social github="https://github.com/ldm0715" email="gcnanmu3125@gmail.com" >}}
{{< /nameplate >}}

## 在做的事

{{< project name="波纹音乐" code="bowen_music" year="二〇二六" status="维护中" tags="C#, WinUI 3" url="https://github.com/ldm0715/bowen_music" >}}
非官方的波点音乐第三方桌面客户端，用 WinUI 3 构建。
{{< /project >}}

{{< project name="表情盒子" code="emobox" year="二〇二六" status="维护中" tags="TypeScript, Tauri" url="https://github.com/ldm0715/emobox" >}}
Windows 优先的本地表情包管理器：导入整理、秒速搜索、一键复制到任何聊天窗口。
{{< /project >}}

{{< project name="B站表情包下载器" code="BiliEmojiDD" year="二〇二六" status="维护中" tags="Python, PySide6" url="https://github.com/ldm0715/BiliEmojiDD" >}}
按 ID 或全量列表查表情包、搜索收藏集并预览，GIF 与视频内嵌播放，会话级队列批量下载。
{{< /project >}}

{{< project name="研讨厅有效提问次数查询器" code="fangclass_check_web" year="二〇二六" status="维护中" tags="Python" url="https://github.com/ldm0715/fangclass_check_web" >}}
查询方班研讨厅提问的小工具。
{{< /project >}}

## 关于本站

{{< colophon >}}
- **本站** 引擎 [Hugo](https://gohugo.io) · 主题 [宣纸 · xuanzhi](https://github.com/ldm0715/xuanzhi)
- **评论** [Waline](https://waline.js.org)，客户端自托管、随文章懒加载，服务端自建
- **纸墨** 思源宋 / [LXGW 文楷](https://github.com/lxgw/LxgwWenKai) / JetBrains Mono，SIL OFL 1.1，本地自托管
- **插件** 播放器 [Plyr](https://github.com/sampotts/plyr) / [APlayer](https://github.com/DIYgod/APlayer)、搜索 [Pagefind](https://pagefind.app)、公式 [KaTeX](https://katex.org)，均 MIT
- **图标** [Material Design](https://github.com/google/material-design-icons)（Apache-2.0）· [Simple Icons](https://simpleicons.org/)（CC0）
- **许可** [MIT](https://opensource.org/license/mit) · 旧文与代码见 GitHub
{{< /colophon >}}

---
title: "媒体嵌入测试：视频、音频与响应式 iframe"
date: 2026-09-03T10:00:00+08:00
tags:
  - 测试
categories:
  - 建站
---

主题对所有嵌入媒体做了统一的响应式接管：iframe 一律全宽、16:9、圆角；video/audio 全宽。本页的嵌入源有的是真实可达的，有的是占位路径，占位资源 404 属于预期。

## bilibili（iframe，国内可达）

<iframe src="//player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1&autoplay=0&danmaku=0" scrolling="no" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

## HTML5 video（占位路径）

<video controls preload="none">
  <source src="/media/demo.mp4" type="video/mp4">
  你的浏览器不支持 video 标签。
</video>

## HTML5 audio（占位路径）

<audio controls preload="none" src="/media/demo.mp3"></audio>

## YouTube（内置 youtube shortcode）

{{< youtube dQw4w9WgXcQ >}}

`youtube` shortcode 在 0.165 仍然内置存在，内部只是生成一个隐私模式的 YouTube iframe，构建期零网络依赖。国内网络下播放器不可达为预期，但布局仍应是 16:9——说明 iframe 被主题样式正确接管。

## YouTube（裸 iframe 对照）

<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="YouTube video" allowfullscreen></iframe>

一条测试结论：Hugo 历史上反复废弃、移除与更名视频类 shortcode（`tweet`→`x`、`gist` 已除名），依赖它们会让主题与特定 Hugo 版本绑死。本主题的立场是外部嵌入一律可用裸 iframe + 主题 CSS 接管，对版本变化免疫。国内网络下此播放器不可达即为预期，布局仍应保持 16:9。

## 自托管媒体：`video` / `audio` 短代码

上面那条立场针对的是**外部平台**——bilibili 和 YouTube 没有可直链的媒体文件，只能裸 iframe，这一点没变。

但**站内自托管**的视频和音频是另一回事：文件在自己手里，就该有一副跟主题一致的控制条。

分工：**外部平台用 iframe，自托管媒体用短代码。**

自托管媒体交给两个成熟库渲染——**视频走 Plyr、音频走 APlayer**。媒体播放器难的不是控件外观，是 seek 节流、缓冲状态机、移动端自动播放策略这些边界，成熟库在真实浏览器上的打磨是手写几百行换不来的。两个库都自托管在主题 `assets/vendor/`，**只有嵌了媒体的页面才会加载**（约 212KB，不放媒体的页面一个字节都不多背）。

> **演示站这里用的全是可自由分发的素材**（MDN 共享素材，CC0）。你自己的站点当然可以放自己的音频视频；
> 但**别把有版权的商业录音随主题仓库分发**——主题是公开仓库，那等于二次分发。歌词那例用的是一份
> 自写的占位 `.lrc`，不是任何真实歌曲的歌词。

### video（Plyr）

{{< video src="https://mdn.github.io/shared-assets/videos/flower.mp4" caption="Plyr 接管：播放、可拖进度、时间、音量、全屏，控件文案走主题 i18n。封面、起播秒数、循环都走参数。" >}}

实际写法（起播秒数 `start` 在元数据就绪后定位，`loop` 走原生属性）：

```go-html-template
{{</* video src="/media/demo.mp4" poster="/media/cover.jpg" caption="片头三十秒" start="12" loop="true" */>}}
```

### audio · 单曲

{{< audio src="https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3" title="T-Rex Roar" artist="MDN shared-assets（CC0）" lrc="/media/demo.lrc" >}}

封面和歌词都是**单独的字段**，不会自动从音频文件里取——Hugo 读不了 FLAC / MP3 的内嵌元数据。要给封面就自己抽一张（`ffmpeg -i x.flac -an -c:v copy -frames:v 1 cover.jpg`），不给则 APlayer 显示它自带的占位图——上面这一例就没给。

歌词面在播放器下方，随播放高亮当前行并自动滚动；点歌词行可以跳到对应位置。（歌词文本与音频内容无关，只为演示歌词面本身。）

```go-html-template
{{</* audio src="/media/x.mp3" title="曲名" artist="作者" cover="/media/x.jpg" lrc="/media/x.lrc" */>}}
```

### audio · 播放列表 + 歌词（APlayer）

曲目多了就用短代码内容写 YAML——**不用管道分隔的一行一曲**，因为标题里出现分隔符就崩。播放列表默认折叠，点一下展开。

歌词是 APlayer 自己去拉 `.lrc`。这里有个会静默坑人的默认值：**APlayer 的 `lrcType` 默认是 0，也就是不显示歌词**，传了 `lrc` 也不会有任何提示。主题已按「这一组曲目里有没有 lrc」自动设成 3，用的人不用管。

两首都是 MDN 的 CC0 素材。APlayer 在只有一首时不渲染列表，所以要两条。

{{< playlist >}}
- title: T-Rex Roar
  artist: MDN shared-assets（CC0）
  src: https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3
  lrc: /media/demo.lrc
- title: Countdown
  artist: MDN shared-assets（CC0）
  src: https://mdn.github.io/shared-assets/audio/countdown.mp3
{{< /playlist >}}

```go-html-template
{{</* playlist */>}}
- title: 曲名
  artist: 作者
  src: /media/a.mp3
  cover: /media/a.jpg
  lrc: /media/a.lrc
- title: 另一首
  artist: 作者
  src: /media/b.mp3
{{</* /playlist */>}}
```

单曲与多曲是两个短代码，不是同一颗加参数——短代码用 `audio`，播放列表用 `playlist`。这也解释了为什么 `audio` 能写成 `{{</* audio … */>}}` 而 `playlist` 必须成对闭合：Hugo 是按模板里有没有引用 `.Inner` 来判的。

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

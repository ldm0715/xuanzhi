---
title: "十二、评论"
date: 2026-09-10T10:00:00+08:00
weight: 120
description: "怎么开启评论区、Waline 那个坑，以及该用哪个服务端"
tags:
  - 评论
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- [二、安装与升级](installation.md)
- [三、站点配置](configuration.md)
- [四、内容组织](structure.md)
- [五、写作](writing/index.md)
- [六、短代码参考](shortcodes.md)
- [七、自定义](customization.md)
- [八、部署](deployment.md)
- [九、常见问题](troubleshooting.md)
- [十、设计理念](design.md)
- [十一、许可](licenses.md)
- **十二、评论**（当前篇）
{{< /details >}}

## 开启只要一行

在站点的 `hugo.toml` 里填上你自己部署的 Waline 服务端地址：

```toml
[params.comments]
  serverURL = 'https://你的-waline.vercel.app'
```

全站文章页立刻都有评论区。**不填就没有**——不只是一块空白，客户端那三个文件（合计约 290KB）也不会下载，页面向你的服务器一个请求都不发。

单页想关掉，在那一页的 front matter 写：

```yaml
comments: false
```

> 演示站的 `exampleSite/hugo.toml` 里有一段注释掉的样例，可以对着抄。
>
> **`serverURL` 指向的服务端要自己部署**，主题不带服务端，客户端也不上第三方 CDN——`waline.umd.js` 与两份 CSS 已经自托管在 `static/vendor/waline/` 里。服务端怎么部署见官方文档：<https://waline.js.org/guide/deploy/>（Vercel 最省事，全程点按钮）。部署完拿到的地址就是上面那个值，管理端在同地址的 `/ui`。

配置项、界面文案、配色的改法在[三、站点配置](configuration.md)与[七、自定义](customization.md)两章。

## 一个坑：上游的服务端会让「点赞」对读者全部失效

**症状**：读者点爱心，界面没反应，刷新一下数字才对；爱心永远不变实心。控制台里是 500：

```
TypeError: Update comment failed with 500: Input data should be a String
```

**原因**在 `@waline/vercel` 1.43.4：纯点赞的请求体只有 `{like:true}`，服务端构造待写数据时却写死了 `comment: input.data.comment` —— 这个字段不存在，值是 `undefined`；数据库适配器回传时用 `{...item, ...updateData}` 合并，把评论已有的正文覆盖成 `undefined`，随后 markdown 渲染拿到非字符串就抛错。

结果是**点赞其实已经写进库了**，只是响应 500，客户端以为失败，于是不更新界面。而除了博主自己（走另一条分支，写库数据里不带 `comment` 键），**任何读者点赞都必然失败**。

**另有一处**：站点套着 Cloudflare 橙云（代理开着）时，服务端记下的是 Cloudflare 边缘节点的 IP，不是读者的。于是「地址」显示成机房所在地；更要紧的是**评论频率限制也按这个 IP 算**——两个互不相识的读者 60 秒内先后留言，第二个会被判「Comment too fast!」。把该域名的 DNS 记录改成 **DNS only（灰云）** 即可，服务端就能拿到真实 IP，定位与限流一起恢复。

## 该用哪个服务端

两条路，选一条：

**一、用上游原版，自己打一行补丁。** 把

```js
comment: input.data.comment,
```

改成

```js
...(input.data.comment === undefined ? {} : { comment: input.data.comment }),
```

这一行在 `node_modules/@waline/core/dist/index.cjs` 与 `index.js` 里**各出现一次**，替换是安全的。挂到 `package.json` 的 `postinstall` 上，每次构建自动打即可。

> **两处都要覆盖**：npm 会把 `@waline/core` 提升到根 `node_modules`，而 `@waline/vercel` 包里本身还带一份嵌套的，两个路径都得看。

**二、直接用作者打好补丁的仓库**：`ldm0715/waline-server`。它就是上游模板加了这个 `postinstall` 补丁，`vercel.json` 里另外去掉了已废弃的 `name` 字段（保留也无妨，只是构建日志里会多一条警告）。省事，代价是信任一个第三方仓库——不过补丁脚本只有几十行、全文可读，翻一眼再决定就好。

> **先确认上游修没修**：如果哪天在 `@waline/core` 里已经找不到 `comment: input.data.comment,` 这一行，说明作者修了，上面两条路都不再需要。（那份补丁脚本匹配不上时只打一行警告，不会挡构建，可以放着不管。）

## 评论区长什么样

- **随文章加载**：滚到评论区跟前 400px 才注入客户端，不给整篇文章的读者预取
- **投稿面板**照首页「诗笺」的形制做：素纸、噪点做旧、双道朱丝框、托起来的柔影
- 按钮文案是「署名 / 投笺」，列表头上是「看看大家都说了什么」——都在 `i18n/zh-cn.yaml` 里，想改就改
- 读者在「邮箱」里填 `自己的QQ号@qq.com`，头像自动取 QQ 头像（Waline 服务端本来就认这条规则）
- 「地址 / 浏览器 / 系统」那排小签的图标来自**第二份样式表** `waline-meta.css`，主题已一并自托管；少引一份，那排就只剩字

颜色全走主题 token，跟着明暗与点缀色自动换；要单独调见[七、自定义](customization.md)的「改评论区配色」。

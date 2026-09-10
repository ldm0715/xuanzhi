# 站点的其他自定义

下面几项**不写在 `hugo.toml` 里**，改的是站点仓库中的文件。

## 头栏导航

加**文字链接**只改配置，模板会自动出现在桌面头栏和手机 ☰ 面板两处：

```toml
[[menus.main]]
  name = '归档'
  pageRef = '/posts'
  weight = 10
```

`pageRef` 指向站内页面，`url` 可以放外链（GitHub 之类）。不配任何菜单时，主题会退回「主内容段 + 分类法页」的自动导航。

## 改界面文案

界面上的字（外观面板、归档的「岁在」「N 篇」、上下篇、复制按钮…）全在主题的 `i18n/zh-cn.yaml`。**站点想改哪个词，就在自己的 `i18n/zh-cn.yaml` 里写同名 key 覆盖**——Hugo 会合并主题与站点的 i18n 目录，站点优先：

```yaml
# 站点 i18n/zh-cn.yaml
recentPosts: 最新文章
scrollHint: 往下翻
unitPosts: 则
```

> key 一律**扁平**：主题的 i18n 全是 `recentPosts` 这种单层 key，别写成嵌套 map 再用点号取（`i18n "posts.other"` 会静默返回空串）。

## 头栏图标按钮（header-extra 插槽）

想放**图标按钮**（GitHub、RSS、邮件、友链…）时，在**站点仓库**新建 `layouts/partials/header-extra.html`，写自己的 markup。Hugo 的模板查找顺序是「站点先于主题」，同名 partial 会顶掉主题里那份空的（主题那份只有一段注释，不用改它）。

#### 例一：一个链接

```html
{{/* 站点 layouts/partials/header-extra.html */}}
<a class="header-extra" href="mailto:you@example.com" aria-label="邮件联系">
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
  <span class="header-extra-label">邮件</span>
</a>
```

跳站外（GitHub 之类）建议加 `target="_blank" rel="noopener"`。

#### 例二：href 用模板表达式

站内地址别写死路径，用 Hugo 变量取。比如 RSS 订阅（有 RSS 输出时才会指向真实地址）：

```html
<a class="header-extra"
   href="{{ with site.Home.OutputFormats.Get "rss" }}{{ .RelPermalink }}{{ end }}"
   aria-label="RSS 订阅">
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <circle cx="6.18" cy="17.82" r="2.18"/>
    <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
  </svg>
  <span class="header-extra-label">RSS 订阅</span>
</a>
```

#### 例三：放多个

插槽就是一段 markup，写几个放几个，顺序即显示顺序。

#### 渲染成什么样

**同一份 markup 会渲染到两处**，主题按上下文分别样式化：

| 渲染位置 | 长什么样 |
|---|---|
| 桌面头栏 `.site-nav` | 30×30 圆形图标按钮，和搜索 / 外观 / 明暗那组同排；`.header-extra-label` 自动隐藏 |
| 手机 ☰ 面板 | 整宽一行，图标 + `.header-extra-label` 文字 |

两条约定：

- 根元素挂 **`class="header-extra"`**，文字包在 **`<span class="header-extra-label">`** 里——主题靠这两个 class 做两套样式。只想显示图标就省略那个 span
- ≤640px 时 `.site-nav` 里除明暗按钮外一律隐藏，所以插槽内容**不会挤进手机头栏**，只出现在 ☰ 面板里——不用额外处理

> **图标从哪来**：通用图标（邮件 / 链接 / RSS…）取 `@material-design-icons/svg` 官方包；**品牌图标（GitHub / Bilibili / 微博）那套里没有**，取 Simple Icons（CC0）之类的包。主题自己的 [`social` 短代码](writing.md)就是这么做的，许可记录见 [`licenses.md`](licenses.md)。**别凭记忆手写 path**——主题所有图标都是这么来的。
>
> 新建 / 删除 partial 文件后如果页面没变化，**重启 `hugo server`**：Hugo 的 watcher 对文件增删的响应不可靠，改已有文件才一定热重建。

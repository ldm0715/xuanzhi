# exampleSite —— 宣纸主题的演示站

这个目录是主题的演示站（发布在 <https://ldm0715.github.io/xuanzhi/>，构建见 `.github/workflows/demo.yml`），也是主题改代码之后的**回归测试面**。

---

## 正文在哪：手册不在这下面

**打开这个目录找文档会扑空。** 站点上的文章来自两个地方：

| 你在站上看到的 | 源文件在哪 |
|---|---|
| 「一、快速开始」…「十一、许可」十一篇手册 | 仓库根 **`../docs/`** |
| `about.md` 与四篇示例文章 | 本目录 `content/` |

`../docs/` 是用户手册，**同时也是演示站的正文**——只有这一份源文件，改 `docs/` 就等于改演示站，没有第二份要同步。

想读文档：从 [`../docs/quick-start.md`](../docs/quick-start.md) 起。

四篇示例文章的标题都带「案例——」前缀，是**演示数据不是教程**：它们把日期铺到 2024 / 2025 / 2026 三个年份，让归档页的跨年分组、分类书架、标签印谱有东西可展示，其中一篇是故意写长来撑开目录的。

---

## 它是怎么接起来的

`hugo.toml` 末尾有一段 `[module]`，把主题各个目录连同 `docs/` 一起挂进来：

```toml
[[module.mounts]]
  source = 'content'        # 演示站自己的 content/
  target = 'content'
[[module.mounts]]
  source = '../docs'        # 手册：挂成 content/posts
  target = 'content/posts'
[[module.mounts]]
  source = '../layouts'     # 主题本体
  target = 'layouts'
```

两条 Hugo 的规则撑起了这段配置，`hugo.toml` 的注释里也各写了一遍：

1. **给某个 target 加了 mount，该 target 的默认 mount 就被顶掉。** 所以 `content` 和 `static` 都必须再显式挂一次自己——少了它们，演示站自己的 `posts` / `about.md` / `static/` 会被 `../docs` 那条遮蔽掉
2. **TOML 里 `[module]` 一旦开始，后面的键就全归它了**，所以这段只能放文件最后

用 mount 而不写 `themesDir = '../..'` + `theme = 'xuanzhi'`，是因为后一种写法要求仓库目录名必须叫 `xuanzhi`——本地克隆换个名字就报 `module not found`。挂载走相对路径，不挑目录名。

---

## ⚠️ 别把这份 `hugo.toml` 抄进你自己的站

这份配置里**没有 `theme = 'xuanzhi'`**——整个主题是靠上面那些 `../layouts`、`../assets`、`../static`、`../i18n` 挂进来的，这些相对路径只在主题仓库里成立。

实测过后果：在一个新站里 `cp -r exampleSite/. .` 再 `hugo`，会直接硬失败：

```
ERROR error building site: assemble: failed to create page from pageMetaSource /about:
failed to extract shortcode: template for shortcode "nameplate" not found
```

Hugo 对不存在的 mount 源**不报错**，直接当空的——于是布局和 shortcode 全找不到，第一篇带 shortcode 的文章就撑不住了。

**你自己的站走常规写法**：把主题放进 `themes/xuanzhi`，`hugo.toml` 里写 `theme = 'xuanzhi'`。

- 三种引入方式（submodule / 下载包 / Hugo Modules）与升级回退： [`../docs/installation.md`](../docs/installation.md)
- 一份可以直接复制的 `hugo.toml`： [`../docs/quick-start.md`](../docs/quick-start.md)

演示站配置里值得抄的只有站点侧的部分：`[params]`、`[markup]` 各段、`[[menus.main]]`——这些在 `quick-start.md` 里都有一份干净的版本。

---

## 本地跑

```bash
cd <主题仓库根>
hugo server --source exampleSite      # http://localhost:1313/
```

`hugo.toml` 里的 `baseURL = 'http://localhost:1314/'` 只在 `hugo` 直接构建时用到；`hugo server` 会用自己的地址覆盖它，CI 用 `--baseURL` 覆盖成 GitHub Pages 的地址。

**站内搜索在这里不工作**，这是预期：Pagefind 索引不在 Hugo 构建里生成，要在构建之后多跑一步。本地 `hugo server` 下搜索提示「索引未生成」是正常的，不是配置错了。见 [`../docs/deployment.md`](../docs/deployment.md#站内搜索)。

打包发版前的预检用的也是这个目录：`hugo --source exampleSite --minify`（见 `.github/workflows/release.yml`）。

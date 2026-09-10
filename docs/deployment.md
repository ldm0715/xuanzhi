---
title: "七、部署"
date: 2026-09-10T10:00:00+08:00
weight: 70
description: "构建、子路径的坑、站内搜索索引，以及 GitHub Pages / Netlify / Vercel 的完整配置"
tags:
  - 部署
  - 站内搜索
  - GitHub Pages
categories:
  - 文档
---

{{< details summary="手册目录" >}}
- [一、快速开始](quick-start.md)
- [二、安装与升级](installation.md)
- [三、站点配置](configuration.md)
- [四、写作](writing/index.md)
- [五、短代码参考](shortcodes.md)
- [六、自定义](customization.md)
- **七、部署**（当前篇）
- [八、常见问题](troubleshooting.md)
- [九、设计理念](design.md)
- [十、许可](licenses.md)
{{< /details >}}

这一篇讲怎么把站点发到线上。Hugo 的产物是纯静态文件，任何静态托管都能放。

## 构建

```bash
hugo --minify
```

产物在 `public/`。发布的就是这个目录。

> **`baseURL` 末尾必须带 `/`。** 少了它，生成的绝对地址会拼错，表现是 CSS 和字体全 404、页面变成没样式的裸 HTML。

## 站内搜索要多跑一步

头栏那枚放大镜的搜索由 **Pagefind** 驱动，**中文分词原生支持**（搜「排版设计」也能命中「排版与设计」）。

索引**不是 Hugo 生成的**，要在 `hugo` 之后单独跑一步：

```bash
hugo --minify
npx pagefind@latest --site public      # 在 public/ 里生成 pagefind/ 索引
```

这一步必须由**你的构建 / 部署流程**执行，主题不会替你自动跑。

两点要知道的：

- **本地 `hugo server` 下搜索不可用**，面板会提示「索引未生成——发布前请运行 pagefind」。这是正常的，不是配置错了。想在本机看效果，按上面的命令先构建 + 索引，再用 `npx serve public` 之类的静态服务器打开
- **子路径部署无需额外处理**：`pagefind/` 随 `public/` 一起发布即可，主题读索引时会带上站点前缀

不想用站内搜索的话，**跳过这一步就行**——头栏那个搜索按钮还在，但点开只会提示索引未生成。想去掉按钮需要改主题模板，不建议。

## GitHub Pages

### 完整 workflow

在站点仓库建 `.github/workflows/deploy.yml`：

```yaml
name: deploy

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

# 同一时间只跑一个部署，新的 push 顶掉排队中的旧任务
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          # 主题是 git submodule 的话，这一行必须加，否则 themes/xuanzhi 是空目录
          submodules: recursive

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.165.0'
          extended: true          # 必须是 extended

      - name: Build
        run: hugo --minify --baseURL "https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/"

      - name: Index with Pagefind
        run: npx --yes pagefind@latest --site public

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 还要在 GitHub 上设两处

1. **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。不选的话上面的 workflow 跑完也不会发布
2. 仓库默认分支不是 `main` 的话，把 `on.push.branches` 改成你的分支名

### 关于 `--baseURL`

上面那行 `--baseURL` 拼的是**项目型 Pages** 的地址：`https://<用户名>.github.io/<仓库名>/`。项目型 Pages 把站点放在子路径下，**不带这个前缀的话 CSS、字体、图片会全 404**。

如果仓库名就是 `<用户名>.github.io`（用户型 Pages），站点在根路径下，那行就可以简化成 `hugo --minify`，`hugo.toml` 里的 `baseURL = 'https://<用户名>.github.io/'` 直接就对了。

> **推送的是 `master` 分支的话还有一处**：GitHub 新建仓库时会往 `github-pages` 环境里预置一条**只允许 `main`** 的部署分支策略，于是报「`master` 分支不允许部署到 github-pages 上」——注意 build 步骤是绿的，只有 deploy 挂。去 **Settings → Environments → `github-pages` → Deployment branches and tags** 加一条 `master`（或选 No restriction），再重跑一次 workflow。

## Netlify / Vercel

两处都只要配三样：

| 配置项 | 值 |
|---|---|
| 构建命令 | `hugo --minify && npx pagefind@latest --site public` |
| 发布目录 | `public` |
| Hugo 版本 | `0.165.0`，并且**要用 extended 版** |

两家平台默认装的 Hugo 未必是 extended，构建时会因为图片管线失败——**显式指定版本号**，并按平台的文档打开 extended（Netlify 用 `HUGO_VERSION` 环境变量，Vercel 在项目设置里指定）。

## 上线前检查清单

发版前对着走一遍，能挡掉绝大多数「本地好好的，上线就坏」：

- [ ] `hugo.toml` 的 `baseURL` 是正式域名，**末尾带 `/`**
- [ ] 构建流程里有 `npx pagefind --site public`（想用站内搜索的话）
- [ ] workflow 里 `submodules: recursive` 加了（主题是 submodule 的话）
- [ ] Hugo 是 **extended**，版本 ≥ 0.146
- [ ] 没有忘了改的 `draft: true`
- [ ] **没有把文章的 `date` 写成未来时间**——Hugo 默认不渲染未来日期的内容，文章会「消失」
- [ ] 部署到子路径的话，`--baseURL` 或 `hugo.toml` 里的 `baseURL` 带上了那个前缀

## 备份

主题和站点是**两个独立的 Git 仓库**，各自独立成仓。建议各配双远端（GitHub 主远端 + Codeberg 或自建 bare 仓库镜像），定期 `git push` 双推。

远端构成备份，不构成依赖——任一平台消失，本地仓库加 Hugo 二进制即可完整重建。

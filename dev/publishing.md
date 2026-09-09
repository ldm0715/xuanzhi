# Xuanzhi 主题 · 发布与维护运行手册

本文件是主题仓库的**作者向**手册：发布到 GitHub、托管演示站、备份。使用者不需要读。

## 把主题推到 GitHub（首次发布）

主题是独立 Git 仓库，当前远端为 `https://github.com/ldm0715/xuanzhi.git`（`git remote -v` 查看）。若尚未推过，首次发布按四步走：

### 1. 在 GitHub 建一个空仓库

- 仓库名建议就叫 **`xuanzhi`**——README 和 `theme.toml` 的例子都用这个名字
- **不要**勾 "Add a README / .gitignore / license"：本地已经是完整仓库，勾了会多出一个无关的初始提交，推的时候冲突

### 2. 关联远端并推送

```powershell
cd F:\hugo_theme
git remote add origin https://github.com/<你的用户名>/xuanzhi.git   # 若远端已配置可跳过
git push -u origin master        # 本仓库当前分支是 master
```

> 想让默认分支叫 `main` 的话，先 `git branch -M main` 再推。演示站的 workflow 两个分支都监听了。

### 3. 开启 GitHub Pages（演示站）

仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

不选的话 `.github/workflows/demo.yml` 跑完也不会发布。设好之后每次 push 自动更新：

```
https://<你的用户名>.github.io/xuanzhi/
```

> **推的是 `master` 分支的话，还要再改一处**（否则 deploy 步骤必失败）：
>
> GitHub 新建仓库时会往 `github-pages` 环境里预置一条**只允许 `main`** 的部署分支策略，而本仓库分支叫 `master`，于是报
> 「`master` 分支不允许部署到 github-pages 上。部署被拒绝或不符合其他保护规则」——注意 build 步骤是绿的，只有 deploy 挂。
>
> 去 **Settings → Environments → `github-pages` → Deployment branches and tags**，加一条 `master`（或直接选 No restriction），然后手动重跑一次 workflow。

### 4. 回填 `theme.toml` 的 homepage

确认已填上仓库地址（Hugo 主题站提交表单会读这一项）：

```toml
homepage = 'https://github.com/ldm0715/xuanzhi'
```

```powershell
git add theme.toml
git commit -m 'docs: fill theme homepage'
git push
```

### 之后每次改动

```powershell
cd F:\hugo_theme
git add -A
git commit -m 'type(scope): subject'
git push
```

## 演示站（exampleSite + GitHub Pages）

仓库里的 `exampleSite/` 是主题演示站——内容用主题的测试稿（代码高亮、数学公式、图片管线、短代码、长文排版…），用来展示主题在各种内容形态下的样子。它同时是**回归测试面**（见 `planning/uncovered-paths.md` 的哲学）。

本地预览：

```bash
hugo server --source exampleSite      # http://localhost:1313/
```

`exampleSite/hugo.toml` 用 **module mount** 把仓库根目录的主题挂进来（**不是** `themesDir = '../..'` + `theme = 'xuanzhi'`），所以**不挑仓库目录名**——克隆下来的目录叫 `hugo_theme` 还是 `xuanzhi` 都行。那套常规写法要求目录名必须等于主题名，换个名字就报 `module not found`。站点接入主题本身仍走 `theme = 'xuanzhi'`。

部署：`.github/workflows/demo.yml` 在 push 时构建 `exampleSite` 并发布到 GitHub Pages：

```
https://<owner>.github.io/<repo>/
```

> 项目型 Pages 站点在 `/<repo>/` 子路径下，所以 workflow 里用 `--baseURL` 带上这个前缀——不带的话 CSS、字体、图片会全 404。

把主题推上 GitHub 后，若想把开发站点从 junction 改成正式 submodule，迁移步骤见站点文档 [`../docs/installation.md`](../docs/installation.md)。

## 备份建议

主题仓库与博客内容仓库各自独立成仓，建议各配双远端（GitHub 主远端 + Codeberg 或自建 bare 仓库镜像），定期 `git push` 双推。远端构成备份，不构成依赖——任一平台消失，本地仓库 + Hugo 二进制即可完整重建。

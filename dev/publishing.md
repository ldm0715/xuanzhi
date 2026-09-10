# Xuanzhi 主题 · 发布与维护运行手册

本文件是主题仓库的**作者向**手册：发新版本、首次发布（已完成，存档）、托管演示站、备份。使用者不需要读。

## 发新版本

**版本号的唯一出处是仓库根的 `CHANGELOG.md`。** 不要在别处另记一份版本号——发版 workflow 会拿 tag 和它核对，对不上直接失败，所以两者不可能各说各话。

### 1. 在 `CHANGELOG.md` 加一段

位置在 `## [Unreleased]` 之后、上一个版本段之前：

```markdown
## [1.0.1] - 2026-09-20

### 修复
- ……
```

格式**必须是** `## [x.y.z] - YYYY-MM-DD`（方括号 + 一个空格 + 日期）。写成 `[v1.0.1]`、`[1.0.1]`（少了空格）、或者用 `###` 当标题，都会让 workflow 判定「CHANGELOG 里没有这个版本」而拒绝发布。

### 2. 提交并推送

```bash
cd F:/hugo_theme
git add -A
git commit -m 'docs: release v1.0.1'
git push
```

### 3. 打 tag 推送

```bash
git tag v1.0.1
git push --tags
```

tag 必须带 `v` 前缀，版本号部分与 CHANGELOG 里那个完全一致。

### 4. 看 Actions

`.github/workflows/release.yml` 依次做四件事，任一步失败都不发：

1. **校验** `CHANGELOG.md` 里有 `1.0.1` 这一段——这是 tag 与 CHANGELOG 不漂移的唯一保证
2. **预检构建**：用 Hugo 0.165.0 extended 跑一次 `hugo --source exampleSite`——打出去的 tag 必须是一个**能构建的提交**
3. **打包**：`git archive` 出 `xuanzhi-v1.0.1.zip`，顶层目录名是 `xuanzhi/`
4. **建 Release**：release notes 直接取 CHANGELOG 里那一段（不用 GitHub 自动生成的那份）

### 5. 确认

去 Releases 页看一眼 zip 在不在、notes 是不是 CHANGELOG 里那段。

### 包里放什么

由仓库根 **`.gitattributes` 的 `export-ignore`** 决定，**不是** workflow 里写死的：

- 排除（作者向）：`dev/`、`exampleSite/`、`.github/`、`CLAUDE.md`、`AGENTS.md`、`.gitignore`、`.gitattributes`
- 进包（使用者要的）：`layouts/`、`assets/`、`static/`、`i18n/`、`docs/`、`theme.toml`、`LICENSE`、`README.md`、`CHANGELOG.md`

要改包内容就去改 `.gitattributes`。

### 发版前的本地演练

不打 tag 也能先把打包跑一遍，看看包里到底有什么：

```bash
git archive --format=zip --prefix=xuanzhi/ -o /tmp/xuanzhi-test.zip HEAD
unzip -l /tmp/xuanzhi-test.zip
```

想验证这个包能不能直接用：解压到任意站点的 `themes/` 下，`hugo server` 应该直接跑得起来——顶层目录名就是 `xuanzhi`，与 `theme = 'xuanzhi'` 对得上。

> **tag 推送不会触发演示站部署**：`demo.yml` 监听的是分支，两边不打架。

## 把主题推到 GitHub（首次发布——已完成，存档备查）

主题是独立 Git 仓库，远端为 `https://github.com/ldm0715/xuanzhi.git`（`git remote -v` 查看）。

**下面四步已于 2026-09-10 全部完成**，留在这里仅供换仓库名 / 重建时参考。日常发版走上面那节「发新版本」。

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

已填好（Hugo 主题站提交表单会读这一项）：

```toml
homepage = 'https://github.com/ldm0715/xuanzhi'
```

### 之后每次改动

改完代码照常提交推送即可。**发版是另一回事**，走上面那节「发新版本」——加了 CHANGELOG 版本段并提交之后，才打 tag。

```powershell
cd F:\hugo_theme
git add -A
git commit -m 'type(scope): subject'
git push
```

## 演示站（exampleSite + GitHub Pages）

仓库里的 `exampleSite/` 是主题演示站——**正文就是用户手册 `docs/`**（`exampleSite/hugo.toml` 用 module mount 把它挂成 `content/posts`），外加几篇文章撑起归档、分类书架与标签印谱。手册里的每种内容形态都是真实渲染着的，所以它同时是**回归测试面**（见 `planning/uncovered-paths.md` 的哲学）。

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

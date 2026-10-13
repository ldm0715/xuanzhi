# Xuanzhi 主题 · 开发文档（dev/）

本目录是主题仓库的开发文档，**只面向作者与编码 agent**；使用者请去仓库根 `README.md`（简介）与 `docs/`（手册）。改主题代码前先读根 [`../CLAUDE.md`](../CLAUDE.md)。

## 本文档导航

| 文档 | 内容 |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | **核心约定**：目录关系、常用命令、架构约定（改代码前必读） |
| [`internals.md`](internals.md) | **坑与关键决策**：代码里看不出来的陷阱、"为什么是这样"的理由、升级 / 部署易漏项 |
| [`todo.md`](todo.md) | **待办**：还没做的事 + 理由 + 落点 |

## 目录关系

- 本仓库 = 主题，独立 Git 仓库（远端 `github.com/ldm0715/xuanzhi`）。
- 配套博客站点 `F:\hugo_gcnanmu`（另一个独立仓库）以 **git submodule** 引主题：`themes/xuanzhi` → 本仓库的 GitHub 远端（站点 `deploy.yml` 用 `submodules: recursive` 拉取）。**改动要 push 后、在站点侧 `git submodule update --remote themes/xuanzhi` 才生效**——站点里那份是独立检出，直接改 `F:\hugo_theme` 不会自动进去。
- **用户手册 `docs/` 就是演示站正文**：`exampleSite/hugo.toml` 用 module mount 把它挂成 `content/posts`。手册**只有这一份源文件**，改 `docs/` 就等于改演示站正文。

## 常用命令

```bash
# 预览（1313 端口常被占，用 1314）
hugo server --source F:/hugo_gcnanmu --bind 127.0.0.1 --port 1314
# 构建
hugo --source F:/hugo_gcnanmu --gc
# 主题演示站（用仓库内模板）
hugo server --source exampleSite

# 发新版本（先在 CHANGELOG.md 顶部加一段 ## [x.y.z] - YYYY-MM-DD 并提交）
git tag vx.y.z && git push --tags
# 本地演练打包，验证 .gitattributes 的 export-ignore 生效（不该出现 dev/ exampleSite/ .github/）
git archive --format=zip --prefix=xuanzhi/ -o /tmp/xuanzhi-test.zip HEAD && unzip -l /tmp/xuanzhi-test.zip
```

## 发版硬约束

- **版本号唯一出处 = 根 `CHANGELOG.md`**。格式必须 `## [x.y.z] - YYYY-MM-DD`（方括号 + 空格 + 日期），否则 `release.yml` 校验失败、直接拒发。
- 打 tag `vx.y.z` 推送触发 `release.yml`（校验 CHANGELOG → 预检构建 → `git archive` 打包 → 建 Release）。
- **包里放什么由根 `.gitattributes` 的 `export-ignore` 决定**，不是 workflow——改包内容去改那里。

工作流约定：实现新功能 → 把"怎么做的"沉淀进 `../CLAUDE.md`；还没做但值得做的 → 记进 `todo.md`。

> 备注：git stash 里有一份失败的书桌场景实验（`desk scene experiment`），仅作参考、未验收。

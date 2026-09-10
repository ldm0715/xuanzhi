# Xuanzhi 主题 · 开发文档（dev/）

本目录是主题仓库的开发（vibecoding / 维护）文档，**只面向作者与编码 agent**；使用者请去仓库根 `README.md`（简介）与 `docs/`（手册）。

编码约定与已知坑在**主题仓库根** [`../CLAUDE.md`](../CLAUDE.md)（与根 `AGENTS.md` 逐字相同）。改主题代码前先读它。

## 目录关系

- 本仓库 = 主题，独立 Git 仓库（远端当前为 `github.com/ldm0715/xuanzhi`，详见 [`publishing.md`](publishing.md)）
- 配套博客站点：`F:\hugo_gcnanmu`（另一个独立仓库）。开发期主题以 **junction** 挂载：
  `F:\hugo_gcnanmu\themes\xuanzhi → F:\hugo_theme`（两个路径是同一目录）。站点 `.gitignore` 已排除该 junction，勿删。
- 主题改动即时生效于站点，无需同步文件。
- **用户手册 `docs/` 就是演示站正文**：`exampleSite/hugo.toml` 用 module mount 把它挂成 `content/posts`，手册各篇和示例文章一起进归档、上首页卡片。手册**只有这一份源文件**——改 `docs/` 就等于改演示站正文，没有第二份要同步。挂载的硬约束（必须同时补 `content → content`；各篇要有 `title`/`date`/`weight`/`description`）见 [`../CLAUDE.md`](../CLAUDE.md)「结构与规则」。

## 常用命令

```bash
# 预览（1313 端口常被占，用 1314）
hugo server --source F:/hugo_gcnanmu --bind 127.0.0.1 --port 1314
# 构建
hugo --source F:/hugo_gcnanmu --gc
# 主题演示站（不依赖 junction）
hugo server --source exampleSite

# 发新版本（先在 CHANGELOG.md 顶部加一段 ## [x.y.z] - YYYY-MM-DD 并提交）
git tag v1.0.0 && git push --tags
# 本地演练打包，验证 .gitattributes 的 export-ignore 生效（不该出现 dev/ exampleSite/ .github/）
git archive --format=zip --prefix=xuanzhi/ -o /tmp/xuanzhi-test.zip HEAD && unzip -l /tmp/xuanzhi-test.zip
```

## 文档导航

| 文档 | 内容 | 什么时候读 |
|---|---|---|
| [`../CLAUDE.md`](../CLAUDE.md)（根，与 `AGENTS.md` 逐字相同） | **实现约定**（结构、规则、token 体系、分发的设计约束）+ **已知坑**（都踩过） | 每次改主题代码前 |
| [`../CHANGELOG.md`](../CHANGELOG.md) | **版本号的唯一出处**。每次发版在里面加一段 | 发版前、回答「这版改了什么」 |
| [`publishing.md`](publishing.md) | **发新版本**、首次发布（已完成，存档）、演示站 Pages workflow、分支部署策略、备份建议 | 发版、改 CI |
| [`maintenance.md`](maintenance.md) | 内部目录结构、改颜色(token)、外观面板取舍、字体更新、KaTeX 版本对齐 | 需要维护资产 / 精简面板 / 排查公式时 |
| [`planning/`](planning/README.md) | **待办**：台账 `README.md` + [`optimizations.md`](planning/optimizations.md) + `uncovered-paths.md` + `structure.md`（文末备查） | 排期、动未实现功能前 |
| [`archive/`](archive/README.md) | **已完成**的实现记录与历史修复（P1 三篇 + 公式修复 + 暗角/飞白/朱印 + 媒体播放器 + 关于页） | 回顾当初为什么这么做 |

发布产物由 `.github/workflows/release.yml` 生成（tag 触发），**包里放什么由仓库根 `.gitattributes` 的 `export-ignore` 决定**——改包内容去改那里，不是改 workflow。

工作流约定：实现新功能 → 把「怎么做的」沉淀进根 `CLAUDE.md`；还没做但值得做的 → 记进 `planning/`（见其封面「怎么用这份文档」）。

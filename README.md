<p align="center">
  <img src="static/images/logo.svg" width="96" height="96" alt="Xuanzhi">
</p>

<h1 align="center">Xuanzhi 宣纸</h1>

<p align="center">
  A Hugo blog theme made for Chinese writing<br>
  warm paper · ruled grid · LXGW WenKai · ink-toned typography
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="license: MIT"></a>
  <a href="https://gohugo.io/"><img src="https://img.shields.io/badge/Hugo-%E2%89%A50.146%20extended-ff4088" alt="Hugo ≥ 0.146 extended"></a>
  <img src="https://img.shields.io/badge/lang-zh--CN-blue" alt="lang: zh-CN">
  <a href="https://github.com/ldm0715/xuanzhi/releases"><img src="https://img.shields.io/github/v/release/ldm0715/xuanzhi" alt="release"></a>
</p>

<p align="center">
  <a href="https://blog.gcnanmu3125.cyou/xuanzhi/"><b>Live demo</b></a> · <a href="docs/">Docs</a>
</p>

<p align="center">
  <a href="README.zh-CN.md">中文版</a>
</p>

## Quick start

```bash
git submodule add https://github.com/ldm0715/xuanzhi.git themes/xuanzhi
# Declare it in hugo.toml (both lines are required):
#   theme = 'xuanzhi'
#   defaultContentLanguage = 'zh-cn'
hugo server
```

Requires **Hugo extended ≥ 0.146** (the image pipeline needs extended). These three steps are only a skeleton — math, light/dark-aware code highlighting, robots.txt and other switches stay off until configured; follow [Quick start](docs/quick-start.md) to fill them in. Do not omit **`defaultContentLanguage`**: without it, every piece of interface text renders empty.

## Features

- **Write and see it**: images are converted to WebP at several sizes and open in a lightbox; math is typeset at build time, so readers without JS, crawlers and RSS readers can all see it.
- **Chinese typography**: LXGW WenKai for body text, emphasis marks instead of fake italics, and dedicated layouts for footnotes, tables and blockquotes.
- **Content organization**: archives, a category shelf and a tag seal catalog each have their own form; article pages carry a table of contents, reading progress and a draggable vermilion seal.
- **Site search**: powered by Pagefind, with native Chinese word segmentation.
- **Media and comments**: self-hosted video / audio / playlists; comments are optional and disappear entirely when unconfigured.
- **Self-hosted**: fonts, icons, player and search index all ship with the theme.

## Customization

The theme bundles a few assets you can **replace directly in your site**, without touching any template — drop a file with the same name at the same path under your site's `static/`:

| To replace | Put your own |
|---|---|
| Site icon (the small seal in the browser tab) | `static/images/logo.svg` |
| Social share card image | `static/images/og-default.png` |

The portrait on the about page is not in this table — **the theme ships no default portrait**; the image belongs to the site. Put your own in `static/images/` and pass `image="/images/xxx.jpg"` to the `nameplate` shortcode.

For colors, fonts, interface text and menus see [Customization](docs/customization.md).

## Documentation

The full manual lives in [`docs/`](docs/) — **it is also the body of the demo site**. The docs are currently written in Chinese.

| I want to | Read |
|---|---|
| Get it running in five minutes | [Quick start](docs/quick-start.md) |
| Installation, upgrades and rollback | [Installation & upgrade](docs/installation.md) |
| Every `hugo.toml` option | [Site configuration](docs/configuration.md) |
| Writing: front matter / images / math | [Writing](docs/writing/index.md) |
| Shortcode parameter reference | [Shortcodes](docs/shortcodes.md) |
| Customize: menus, interface text, colors | [Customization](docs/customization.md) |
| Deployment and the search index | [Deployment](docs/deployment.md) |
| Something looks wrong | [Troubleshooting](docs/troubleshooting.md) |
| Design rationale | [Design](docs/design.md) |

## License

| Component | License |
|---|---|
| The theme itself (templates / CSS / JS) | MIT (see [LICENSE](LICENSE)) |
| LXGW WenKai GB, Source Han Serif 700, JetBrains Mono | SIL OFL 1.1 |
| KaTeX stylesheets | MIT |
| Material Design icons | Apache-2.0 |
| Simple Icons brand icons | CC0 1.0 |
| Plyr (video), APlayer (audio) | MIT |
| Waline comment client | MIT |

Third-party assets do not become MIT because they are bundled; see [Licenses](docs/licenses.md) for the attribution and source each one requires.

Release notes live in [CHANGELOG.md](CHANGELOG.md), and published builds are under [Releases](https://github.com/ldm0715/xuanzhi/releases). For maintenance and development see [CLAUDE.md](CLAUDE.md) and [`dev/`](dev/README.md).

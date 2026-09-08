---
title: "Shortcode 测试：highlight、details、relref 与 gist"
date: 2026-09-04T10:00:00+08:00
tags:
  - 测试
categories:
  - 建站
---

Hugo 的内置 shortcode 是 Markdown 之外的扩展通道。本页逐个验证与静态站原则相容的那几个。

## highlight：行号 + 指定行高亮 + 起始行号

{{< highlight go "linenos=table,hl_lines=3-4,linenostart=100" >}}
package main

// Grind 研墨：水越多墨越淡
func Grind(ink string, water float64) string {
    return ink
}
{{< /highlight >}}

预期：左侧出现行号列且从 100 起算，第三、四行有高亮背景。

## details：折叠块

{{< details summary="点开查看：墨的五阶" >}}
焦、浓、重、淡、清。黄宾虹说「画用焦墨与宿墨，是求其苍老」——博客排版用不上焦墨，但折叠块里可以放很多字而页面依然干净。
{{< /details >}}

## relref：站内引用（带构建期链接检查）

去看[数学公式测试]({{< relref "math-formulas.md" >}})。relref 生成站内绝对链接，且引用不存在的页面会直接让构建失败——它同时是链接检查器。

## qr：构建期生成二维码

{{< qr text="https://example.com" level="high" />}}

`qr` 是较新的内置 shortcode，在**构建时**本地生成二维码，零网络依赖——静态站原则的优等生。扫描应指向 example.com。

## 已移除的：gist

`gist` shortcode 已在 v0.156.0 被移除（v0.143 起废弃）。需要嵌入 GitHub gist 时，直接写 script 标签即可，效果等价：

```html
<script src="https://gist.github.com/user/gistid.js"></script>
```

加载发生在浏览器端，本地构建不受网络影响；若 GitHub 不可达则该区域空白——这是预期行为，不是 bug。

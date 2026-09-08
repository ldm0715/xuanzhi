---
title: "代码高亮测试：明暗两套配色与复制按钮"
date: 2026-09-06T10:00:00+08:00
tags:
  - 测试
categories:
  - 建站
---

代码块使用 Hugo 内置的 Chroma 高亮（class 模式），配色走 CSS 变量，明暗模式自动跟随。悬停在代码块右上角会出现复制按钮。

## Go

```go
package main

import "fmt"

// Serve 监听在宣纸上
func Serve(addr string) error {
    fmt.Println("listening on", addr)
    return http.ListenAndServe(addr, nil)
}
```

## JavaScript

```javascript
const paper = {
  name: '宣纸',
  ink: ['#26241F', '#3A3833', '#8C877B'],
  get feel() {
    return this.ink.length >= 3 ? '舒服' : '太花哨';
  },
};

console.log(paper.feel);
```

## Python

```python
def grind(ink: str, water: float = 0.5) -> str:
    """研墨。水多了淡，水少了浓。"""
    density = len(ink) / (1 + water)
    return f"墨阶 {density:.2f}"

print(grind("松烟墨", water=0.3))
```

## Bash

```bash
# 构建纯静态产物
hugo --minify
# 双远端备份
git push origin main && git push mirror main
```

## Diff

```diff
+ 加一行新的：墨色梯度
- 删一行旧的：花哨的渐变
  保留一行：留白
```

## 语言标签的来源测试

标签文字完全来自 ` ``` ` 后面写的标记，原样显示、不做美化映射。

别名 `py`（显示 py，而不是 Python）：

```py
print("alias works")
```

不存在的语言 `notalang`（Chroma 不认识，无高亮，但标签照常显示——任何写了的标记都会成为标签）：

```notalang
whatever content here
```

无语言（` ``` ` 后面什么都不写，不应出现标签）：

```
plain block without language tag
```

## 长行溢出测试

```text
这一行故意写得很长很长很长，用来测试横向滚动是否正常工作而不撑破容器，这一行故意写得很长很长很长，用来测试横向滚动是否正常工作而不撑破容器，这一行故意写得很长很长很长。
```

全部高亮正常、复制按钮工作、长行可横向滚动，这篇就合格了。

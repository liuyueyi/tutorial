---
order: 3
title: 3. git diff ^M不同操作系统下换行区别
tag:
  - git 
category:
  - Shell
  - Git 
date: 2021-02-08 14:49:12
keywords: git shell 换行
---

不同操作系统下的换行不一致，当一个项目的开发者分别再linux/mac/win下做了代码提交改动之后，使用`git diff`命令时，可能会发现，即便啥也没改，当时有很多变动，显示`^M`的差别

主要原因就是换行的问题

解决这个问题的一个办法就是统一换行

```bash
git config --global core.autocrlf true
```

<!-- more -->

因为Linux和Mac都是使用LF ，Windows 则是CRLF，所以在我们按下回车换行时，虽然肉眼的展示效果一致，当时实际上却是不一样的

- windows: CRLF = `\r\n`
- mac/linux: lf = `\n`

GitHub建议你应该只用`\n`来做为新行的开始，当然建议只是建议；一个原则就是我们希望可以统一，一分代码，不管在什么操作系统下，表现一致（包括换行、编码等）

使用`core.autocrlf`参数，设置为ture时，Git可以在你提交时自动地把行结束符CRLF转换成LF，而在签出代码时把LF转换成CRLF

Linux或Mac系统使用LF作为行结束符，因此你不想Git在签出文件时进行自动的转换；当一个以CRLF为行结束符的文件不小心被引入时你肯定想进行修正， 把core.autocrlf设置成input来告诉Git在提交时把CRLF转换成LF，签出时不转换

```bash
git config --global core.autocrlf input
```

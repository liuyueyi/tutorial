---
order: 4
title: 4. git ammend知识点
tag:
  - git
category:
  - Shell
  - Git
date: 2021-10-09 14:49:20
keywords: git shell
---

在实际使用git的过程中，难免会存在手误的场景，比如 git commit之后，发现提交的描述信息不太合适，想调整一下；或者发现本地有多个零碎未提交的commit，想合并成一个提交... 

当我们出现这些需求场景的时候，可以考虑使用`git commit --amend`来实现

<!-- more -->

### 1. 修改提交文案

![](/hexblog/imgs/211009/00.jpg)

比如上面截图中，如果我希望修改上一次的提交内容，可以如下操作

```bash
git commit --amend
```

![](/hexblog/imgs/211009/01.jpg)

注意上面这个只能修改最后一次提交，如果我现在想修改的不是最后一次，则可以如下操作

```bash
git rebase -i origin/master
git commit --amend
git rebase --continue
```
![](/hexblog/imgs/211009/02.jpg)

![](/hexblog/imgs/211009/03.jpg)

![](/hexblog/imgs/211009/04.jpg)

![](/hexblog/imgs/211009/05.jpg)

### 2. 修改提交Name/Email

通常使用`git commit --amend`来修改提交文案的场景更多，但是某些场景下可能需要修改Author信息，比如不小心在自己的github项目中使用了公司的邮箱，这个时候如果我们需要修改，同样可以使用上面这个命令来做

```bash
git commit --amend --author='一灰灰 <yihuihuiyi@gmail.com'
```

![](/hexblog/imgs/211009/06.jpg)

同样当我们需要修改非最近一次提交的用户信息时，操作姿势和上面差不多

```bash
git rebase -i origin/master
git commit --amend --author='一灰灰 <yihuihuiyi@gmail.com'
git commit --continue
```

### 3. 多个commit合并

这个的思路主要是先回退到最开始的提交，然后借助`git commit --amend`来合并为一个提交

```bash
git reset --soft 5c02534b24d393f9f7a4114758e4363a128b532b
git commit --amend
git log
```

![](/hexblog/imgs/211009/07.jpg)

---
order: 10
title: 10. Centos hostname修改
tag:
  - hostname
category:
  - Shell
  - CMD
date: 2020-07-28 23:14:27
keywords: linux shell hostname cmd
---

**centos 6 修改方式**

```bash
# 修改hostname，立即生效
hostname new-hostname
# 查看hostanme
hostname
```

**centos 7 修改方式**

```bash
# 修改hostname，立即生效
hostnamectl set-hostname new-hostname
# 查看hostname
hostname
```

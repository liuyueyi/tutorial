---
order: 8
title: 8. Centos hosts修改及生效
tag:
  - Shell
category:
  - Shell
date: 2020-04-13 12:37:42
keywords: hosts 域名修改 network
---

centos域名绑定与生效

```bash
# 修改域名
vim /etc/hosts

# 生效
/etc/init.d/network restart
```

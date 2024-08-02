---
order: 3
title: 3. Centos虚拟ip添加删除查看
tag:
  - Shell
category:
  - Shell
  - CMD
date: 2018-12-21 14:23:14
keywords: 虚拟ip,ip addr
---

本文主要包括虚拟ip的查询，删除与新增的使用姿势

<!-- more -->

### 1. 查看

列出网卡以及对应的虚拟ip

```sh
ip addr
```

显示结果如下:

![查看ip](/hexblog/imgs/181221/00.jpg)

上图中，显示有三个网卡，lo, eth0以及docker0，inet对应的ip表示这个网卡对应的虚拟ip地址


### 2. 添加ip

现在我们在docker0上新加一个虚拟ip，执行命令如下

```sh
ip addr add 192.168.0.110/32 dev docker0
```

执行完毕之后，再次查看所有的网卡，如下

![添加ip](/hexblog/imgs/181221/01.jpg)

虚拟网卡添加之后，可以通过ping测试是否ok


### 3. 删除ip

删除我们刚添加的虚拟ip，执行如下

```sh
ip addr del 192.168.0.110/32 dev docker0
```

![删除ip](/hexblog/imgs/181221/02.jpg)

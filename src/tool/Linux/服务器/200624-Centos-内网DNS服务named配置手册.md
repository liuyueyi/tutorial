---
order: 9
title: 9. Centos 内网DNS服务named配置手册
tag:
  - named
  - dns
category:
  - Shell
  - 环境搭建
date: 2020-06-24 18:15:54
keywords: Centos named bind dns 内网域名
---

本文记录基于bind服务搭建的内网dns解析过程

> 参考: [Centos7Bind正反区域配置](https://blog.csdn.net/qq_40478570/article/details/79778997?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase)

<!-- more -->

### 1. 安装

centos7 直接使用`yum`进行安装

```bash
yum -y install bind
```

### 2. 配置

named相关配置文件，在 `/etc/named*`下面

首先进入配置文件`named.conf`

```bash
options {
 		  // 改成any，侦听所有网卡
        listen-on port 53 { any; };
        // 不监听ipv6
        // listen-on-v6 port 53 { ::1; };
        ...
        // 注意，将这个里面的内容改成any, 允许所有人查询
        allow-query     { any; };
        ...
}
```

进入内网域名配置, `named.rfc1912.zone`，添加local内网域名

```bash
zone "local" IN {
        type master;
        file "local.zone";
        allow-update { none; };
};
```

接下来需要编写 `local.zone` 文件

```bash
vim /var/named/local.zone


$TTL    1D
@       IN      SOA     @       local. (
                                        0       ; serial
                                        1D      ; refresh
                                        1H      ; retry
                                        1W      ; expire
                                        3H )    ; minimum
                IN NS           @
                IN A            192.168.0.188
test            IN A            192.168.0.188
wiki            IN A            192.168.0.188
```

第一列为主机名 + 第二列为记录类型 + 第三列为映射地址

### 3. 启动

使用 `systemctl` 启动服务

```bash
# 启动
systemctl start named
# 关闭
systemctl stop named
# 重启
systemctl restart named
```

**测试**

```bash
nslookup wiki.local

Server:		192.168.0.188
Address:	192.168.0.188#53

Name:	wiki.local
Address: 192.168.0.188
```


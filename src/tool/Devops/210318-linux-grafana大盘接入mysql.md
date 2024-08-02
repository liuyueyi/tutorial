---
order: 1
title: 1. linux grafana大盘接入mysql
tag:
  - Grafana 
category:
  - 开源
  - 运维 
date: 2021-03-18 19:53:17
keywords: grafana 监控 大盘
---

grafana 安装接入mysql数据源

<!-- more -->

### 1. 安装

官网下载地址: [https://grafana.com/grafana/download?pg=get&plcmt=selfmanaged-box1-cta1](https://grafana.com/grafana/download?pg=get&plcmt=selfmanaged-box1-cta1)

linux安装

```bash
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_7.4.3_amd64.deb
sudo dpkg -i grafana_7.4.3_amd64.deb
```

centos

```bash
wget https://dl.grafana.com/oss/release/grafana-7.4.3-1.x86_64.rpm
sudo yum install grafana-7.4.3-1.x86_64.rpm
```

### 2. 启动

启动命令

```bash
sudo /etc/init.d/grafana-server start
```

测试: http://localhost:3000

登录密码: admin/admin

### 3. MySql数据源配置

添加数据源: http://localhost:3000/datasources/new

选择 mysql

输入数据库信息

- Host: 主机 + 端口号
- Database: 数据库名
- User/Password

连接信息

- Max open: 4
- Max idle: 2

测试并保存，然后配置面板即可

至于grafana面板配置说明，下篇博文介绍

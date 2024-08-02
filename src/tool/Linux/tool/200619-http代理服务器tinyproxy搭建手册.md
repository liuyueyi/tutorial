---
order: 3
title: 3. http代理服务器tinyproxy搭建手册
tag:
  - Shell
  - 代理
category:
  - Shell
  - 环境搭建
date: 2020-06-19 11:10:44
keywords: Shell tinyporxy 代理 http
---

简单记录一下http代理服务器tinyproxy的搭建与简单配置过程

```bash
# 安装
sudo yum install tinyproxy -y
```

<!-- more -->

安装完毕之后，做一些基本的配置，比如端口，允许的ip等

```bash
vim /etc/tinyproxy/tinyproxy.conf

# 端口
Port 18888

# 允许的ip，如果不配置allow，那么默认所有的ip都可以进来
Allow 127.0.0.1
```

服务启动关闭等命令

```bash
# 启动
systemctl start tinyproxy.service
# 重启
systemctl restart tinyproxy.service
# 关闭
systemctl stop tinyproxy.service
```

查看代理日志

```bash
tail -f /var/log/tinyproxy/tinyproxy.log
```

测试：

```bash
# 请注意，
curl -x "127.0.0.1:18888" -v 'http://www.baidu.com'
```

参考文档: [linux搭建http代理服务器](https://blog.csdn.net/weixin_45926849/article/details/103455406)


---
order: 3
title: 3. docker非root用户可使用配置
tag:
  - Docker
category:
  - Shell
  - Docker
date: 2019-07-03 19:24:27
keywords: Docker
---

docker要求使用root权限进行启动，但是启动之后，普通的账号会发现没有访问docker的权限，然而每次都使用root进行访问过于麻烦，那么有办法让普通账号也能正常访问么?

<!-- more -->

docker安装完毕之后，启动

```bash
sudo systemctl restart docker
```

然后使用普通账号进行访问，提示如下

```
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.39/containers/json?all=1: dial unix /var/run/docker.sock: connect: permission denied
```

因为权限被拒绝，下面是解决办法

**1. 创建docker组**

```bash
sudo groupadd docker
```

**2. 将用户加入docker组**

```bash
# 将yihui这个用户，添加到docker组
sudo groupadd -a yihui docker
# 或者使用下面的将当前用户添加到docker组
sudo gpasswd -a ${USER} docker
```

**3. 重启docker**

```bash
sudo systemctl restart docker
```

**4. 测试**

可能在某些情况下，需要断开连接重新登录才有权限继续访问

```bash
docker ps -a
```

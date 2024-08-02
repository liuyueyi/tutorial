---
order: 1
title: 1. Centos安装docker与使用说明
tag:
  - Docker
category:
  - Shell
  - Docker
date: 2019-12-06 15:53:50
keywords: Docker 安装 使用教程
---

本文主要介绍Centos下如何安装docker，并给出一些基本的使用case

<!-- more -->

### 1. 安装说明

通过脚本进行docker安装，比较简单

```sh
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

执行完毕之后，启动docker

```sh
sudo systemctl start docker
```

然后开始验证是否可以使用

```sh
sudo docker run hello-world
# 查看所有的容器
docker ps -a 
```

如果安装正确，如下

![](/hexblog/imgs/191206/00.jpg)

### 2. 使用相关

#### 1. 安装centos镜像

在docker中安装一个centos的镜像，然后在docker中的centos里面搞事情

安装命令: `docker pull 镜像名:版本`

```sh
# 安装镜像
docker pull centos
```

在安装之前，如果我们不确定有哪些镜像，可以怎么办？可以简单的搜索一下

```sh
# docker hub上查找centos的镜像
docker search centos
```

然后从上面的搜索结果中，挑选合适的镜像进行下载，然后可以查看本地镜像列表

```sh
# 查看本地镜像
# docker images -a  # 查看本地所有镜像
docker images centos

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
centos              7.4.1708            295a0b2bd8ea        8 weeks ago         197MB
```

#### 2. 容器使用

这一小节，主要目的就是如何加载一个镜像，启动，关闭，删除容器等操作

**加载镜像**

主要就是run方式运行容器, 下面启动一个可交互的centos容器

```sh
docker run -it centos
```

上面执行完毕之后，会进入容器内的centos，通过 `exit`退出

**查看容器**

查看docker当前加载的容器列表

```sh
docker ps -a
```

执行之后，可以看到刚才的centos对应的容器，状态为突出

```sh
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
9e0c9c3a6545        centos              "/bin/bash"         8 seconds ago       Exited (0) 5 seconds ago                       nifty_elgamal
```

那么我们能再次进入这个容器么？

**启动容器**

想进入上面这个容器，首先得让它跑起来,通过start命令

```sh
# 注意后面的那串文本，为CONTAINER ID
docker start 9e0c9c3a6545
```

**进入容器**

通过 `docker exec` 方式进入容器，之前看到一个博文，说是有四种进入方式，这里选择exec方式进入

- 原文：[Docker容器进入的4种方式](http://www.cnblogs.com/xhyan/p/6593075.html)

```sh
docker exec -it 9e0c9c3a6545 /bin/bash
```

上面执行完毕之后，会发现又一次进入了容器内的centos系统

![](/hexblog/imgs/191206/01.jpg)

到这里就会有个疑问

- 我在这个容器里面的修改是否会保留下来，我下次进来的时候，是不是这些东西还有没有
- 每次退出之后，容器都会停止运行么？

针对上面的两个疑问，实际的操作一下，结果如下图

- 容器内的修改会保留
- exit退出之后，容器并不会停止，依然是运行的状态

![](/hexblog/imgs/191206/02.jpg)

**停止容器**

如果想要关闭容器，也比较简单

```sh
docker stop 9e0c9c3a6545
```

**删除容器**

```sh
docker rm 9e0c9c3a6545
```

#### 3. 定制镜像

以交互式运行centos镜像

```sh
docker run -it centos
```

然后就进入了docker中的centos操作系统了，然后可以在里面部署基本的环境，先做一个简单的演示，在home文件夹下初始化几个目录

```
cd /home/
mkdir yihui data soft

# 退出容器
exit
```

执行过程如下

![](/hexblog/imgs/191206/03.jpg)

退出容器之后，将上面我们的修改保存

```sh
docker commit 47476c86c510 yihui/centos
# 查看本地的所有镜像，会多一个 yihui/centos
docker images -a
```

![](/hexblog/imgs/191206/04.jpg)


我们改的docker实际上是在原始docker的基础上改进而来，可以通过下面的命令查看演进过程

```sh
docker history 240840e65297
```

![](/hexblog/imgs/191206/05.jpg)


接下来就是如何使用我们修改后的镜像了，首先是加载自定义的容器, 然后一番操作如下

```sh
# 加载镜像
docker run -d -it yihui/centos
# 进入容器
docker ps -a
docker exec -it 0e118346222c /bin/bash
```
![](/hexblog/imgs/191206/06.jpg)

保存后的镜像，还可以修改tag，命令如下

```sh
docker tag xxx yihui/centos:v2
```


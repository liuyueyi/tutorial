---
order: 3
title: 3. Maven私服配置Downloading from maven-default-http-blocker问题解决方法
tag:
  - Maven
category:
  - Shell
  - Maven
date: 2022-11-22 11:28:38
keywords:
  - Maven
  - 问题记录
---

最近配置maven的私服地址，发现私服里的包无法下载，一直报`Downloading from maven-default-http-blocker: http://0.0.0.0/com`的异常

从异常描述看，主要问题就是这个域名解析为了`http://0.0.0.0`

主要的原因在于在maven的 3.8.1 版本开始，maven禁止从http协议的仓库地址下载依赖

官方描述可以参考: [https://maven.apache.org/docs/3.8.1/release-notes.html#cve-2021-26291](https://maven.apache.org/docs/3.8.1/release-notes.html#cve-2021-26291)

官方给出的解决方案

```bash
How to fix when I get a HTTP repository blocked?
If the repository is defined in your pom.xml, please fix it in your source code.

If the repository is defined in one of your dependencies POM, you'll get a message like:

[ERROR] Failed to execute goal on project test: Could not resolve dependencies for project xxx: Failed to collect dependencies at my.test:dependency:version -> my.test.transitive:transitive:version: Failed to read artifact descriptor for my.test.transitive:transitive:jar:version: Could not transfer artifact my.test.transitive:transitive:pom:version from/to maven-default-http-blocker (http://0.0.0.0/): Blocked mirror for repositories: [blocked-repository-id (http://blocked.repository.org, default, releases+snapshots)]
Options to fix are:

upgrade the dependency version to a newer version that replaced the obsolete HTTP repository URL with a HTTPS one,

keep the dependency version but define a mirror in your settings.
```

我们下面给出的解决方案自然就有俩个

- 配置https的私服地址
- 降级maven版本，找一个3.8.1之前的版本

<!-- more -->

这里我们选择第二个方案，版本降级，到官网下载对应的包

官网地址： [maven官网](https://maven.apache.org/download.cgi)

因为我们需要历史版本，需要拉到页面最下面，从下图指定的位置进行获取

![](/hexblog/imgs/221122/00.jpg)

这里也直接给出对应的地址： [maven 历史包下载地址](https://archive.apache.org/dist/maven/maven-3/)

选在3.6.3版本作为自己本地的maven，重新配置一下之后就可以了

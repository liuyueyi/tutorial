---
title: 190514-查看java进程jvm参数
tags:
  - JVM
categories:
  - Java
  - JVM
date: 2019-05-14 22:01:39
keywords: Java,JVM,jps,堆栈信息
---

java应用启动之后，有办法查看jvm参数么？

可以通过`jps -v`来实现

```bash
jsp -lv
```

如阿里的java进程输出如下

```
28996 com.aliyun.tianji.cloudmonitor.Application -Djava.compiler=none -XX:-UseGCOverheadLimit -XX:NewRatio=1 -XX:SurvivorRatio=8 -XX:+UseSerialGC -Djava.io.tmpdir=../../tmp -Xms16m -Xmx32m -Djava.library.path=../lib:../../lib -Dwrapper.key=drcJnFxDcXCZH8of -Dwrapper.port=32000 -Dwrapper.jvm.port.min=31000 -Dwrapper.jvm.port.max=31999 -Dwrapper.disable_console_input=TRUE -Dwrapper.pid=28989 -Dwrapper.version=3.5.27 -Dwrapper.native_library=wrapper -Dwrapper.arch=x86 -Dwrapper.service=TRUE -Dwrapper.cpu.timeout=10 -Dwrapper.jvmid=1
2358 sun.tools.jps.Jps -Denv.class.path=.:/usr/java/jdk1.8.0_131/lib/dt.jar:/usr/java/jdk1.8.0_131/lib/tools.jar:/usr/java/jdk1.8.0_131/jre/lib -Dapplication.home=/usr/java/jdk1.8.0_131 -Xms8m
```


<!-- more -->


## II. 其他

### 1. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 2. 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 3. 扫描关注

**一灰灰blog**

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

**知识星球**

![goals](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/goals.png)


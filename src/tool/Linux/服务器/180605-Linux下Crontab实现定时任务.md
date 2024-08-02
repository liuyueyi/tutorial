---
order: 12
title: 12. Linux下Crontab实现定时任务
tag:
  - Linux
category:
  - Shell
  - CMD
date: 2018-06-05 19:50:27
---

# Linux下Crontab实现定时任务

基于Hexo搭建的个人博客，是一种静态博客页面，每次新增博文或者修改，都需要重新的编译并发布到Github，这样操作就有点蛋疼了，一个想法就自然而然的来了，能不能每天2点，自动的build一下，然后上传

linux的Crontab正好可以支持，下面简单的记录下相关知识点

<!-- more -->

进入Crontab编辑

```sh
crontabl -e
```

然后开始类vim方式的编辑，一个写法如下

```sh
30 02 * * * /bin/bash /home/yihui/hexblog/build.sh
```

上面的含义表示每天2:30分，执行一下脚本 `/home/yihui/hexblog/build.sh`


### 1. 语法分析

针对上面的case进行语法简单说明

```sh
minute   hour   day   month   week   command
```

- minute： 表示分钟，可以是从0到59之间的任何整数。
- hour：表示小时，可以是从0到23之间的任何整数。
- day：表示日期，可以是从1到31之间的任何整数。
- month：表示月份，可以是从1到12之间的任何整数。
- week：表示星期几，可以是从0到7之间的任何整数，这里的0或7代表星期日。
- command：要执行的命令，可以是系统命令，也可以是自己编写的脚本文件。

### 2. 取值分析

上面的时间，可以用具体的数字，也可以用一些符号表示，对应的含义如下

- 星号（*）：代表所有可能的值，例如month字段如果是星号，则表示在满足其它字段的制约条件后每月都执行该命令操作。
- 逗号（,）：可以用逗号隔开的值指定一个列表范围，例如，“1,2,5,7,8,9”
- 中杠（-）：可以用整数之间的中杠表示一个整数范围，例如“2-6”表示“2,3,4,5,6”
- 正斜线（/）：可以用正斜线指定时间的间隔频率，例如“0-23/2”表示每两小时执行一次，同时正斜线可以和星号一起使用，例如*/10，如果用在minute字段，表示每十分钟执行一次。

### 3. 服务操作

```sh
/sbin/service crond start //启动服务
/sbin/service crond stop //关闭服务
/sbin/service crond restart //重启服务
/sbin/service crond reload //重新载入配置
```

### 4. 常用命令

**编辑Crontab**

`crontab -e`

**查看Crontab**

`crontab -l`

**删除Crontab**

`crontab -r`

添加Crontab之后，可能并没有预期那样生效，有可能是Crontab服务没有启动

### 5. 实例case

每个月第一天执行一次

```
* * 1 * * /bin/bash xxx.sh
```

每分钟执行一次

```
* * * * * /bin/bash xxx.sh
```

每小时的第15,30,45分钟执行

```
15,30,45 * * * * /bin/bash xxx.sh
```

每周五19:30执行发周报

```
30 19 * * 5 command
```

每小时清一下日志

```
* */1 * * * command
```



## II. 其他

### [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 扫描关注

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

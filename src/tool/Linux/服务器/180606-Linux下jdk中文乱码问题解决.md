---
order: 13
title: 13. Linux下jdk中文乱码问题解决
tag:
  - Bugfix
category:
  - Java
  - JDK
date: 2018-06-06 21:39:58
---

# linux下jdk中文乱码问题解决

之前遇到过一次中文乱码问题，是通过在jdk的jre目录下的lib/fonts文件中添加simsun.ttf字体文件解决，但是这次遇到一个奇怪的问题，同样的字体拷贝过去后，中文不乱但是英文乱码了


记录一下解决过程：

- 主要思路就是给系统安装中文字体，让系统本身就支持中文即可

<!-- more -->

## 字体安装过程

1. `cp simsun.ttc /usr/share/fonts/chinese`下
2. 修改权限 `chmod 777 simsun.ttc`
3. 安装字体:
    ```sh
    cd /usr/share/fonts/chinese
    fc-cache -fv
    ```
4. 查看系统安装的字体: `fc-list`
5. 重启Tomcat


## jdk安装字体

将文件拷贝到对应的目录下即可

```sh
cp simsun.ttc /usr/java/jdk1.8.0_131/jre/lib/fonts/

## 重启Tomcat
/user/local/tomcat/bin/shutdown.sh
/user/local/tomcat/bin/catalina.sh start
```

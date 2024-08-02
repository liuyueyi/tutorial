---
order: 1
title: 1. 动态脚本支持框架整体介绍篇
tag:
  - 技术方案
category:
  - Quick系列
  - QuickTask
date: 2018-07-02 19:19:48
keywords: Java,QuickTask
---

![logo](https://upload-images.jianshu.io/upload_images/1405936-b9a62b4b97a7e477.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# Quick-Task 动态脚本支持框架整体介绍篇

一个简单的动态脚本调度框架，支持运行时，实时增加,删除和修改动态脚本，可用于后端的进行接口验证、数据订正，执行定时任务或校验脚本

本项目主要涉及到的技术栈:

- groovyEngine （groovy脚本加载执行）
- commons-io （文件变动监听）

<!-- more -->

## I. 使用姿势

### 1. pom配置

添加仓库地址

```xml
<repositories>
    <repository>
        <id>yihui-maven-repo</id>
        <url>https://raw.githubusercontent.com/liuyueyi/maven-repository/master/repository</url>
    </repository>
</repositories>
```

添加项目依赖

```xml
<dependency>
    <groupId>com.git.hui</groupId>
    <artifactId>task-core</artifactId>
    <version>0.0.1</version>
</dependency>
```

### 2. 使用demo

#### a. 源码方式

源码下载之后的使用case，可以参考 `com.git.hui.task.AppLaunch`，运行main方法，监听`./task-core/src/test/java/com/git/hui/task`目录下脚本的变动即可

#### b. jar包引用

首先准备一个Groovy脚本，放在指定的目录下，如 `/tmp/script/DemoScript.groovy`

```groovy
package com.git.hui.task

import com.git.hui.task.api.ITask

class DemoScript implements ITask {
    @Override
    void run() {
        println name() + " | now > : >>" + System.currentTimeMillis()
    }

    @Override
    void interrupt() {
        println "over"
    }
}
```

对应的启动类可以如下

```java
public class AppRunner {

    // main 方式
    public static void main(String[] args) throws Exception {
        new ScriptExecuteEngine().run("/tmp/script/");
        Thread.sleep(24 *60 * 60 * 1000);
    }
    
    // junit 方式启动
    @Test
    public void testTaskRun() {
        new ScriptExecuteEngine().run("/tmp/script/");
        Thread.sleep(24 *60 * 60 * 1000);
    }
}
```

#### c. 测试

应用启动完毕之后

- 可以修改 `/tmp/script/DemoScript.groovy` 脚本的内容，保存后查看是否关闭旧的脚本并执行更新后的脚本
- 测试在 `/tmp/script` 目录下新增脚本
- 测试删除 `/tmp/script` 目录下的脚本
- 测试异常的case (如非法的groovy文件，内部运行异常等...)

**注意** 不要在groovy脚本中执行 `System.exit(1)`, 会导致整个项目都停止运行


## II. 设计原理

基本结构如下图

![脚本框架.png](https://raw.githubusercontent.com/liuyueyi/Source/master/img/blog/daywork/180628/tech.png)

从图中基本上也可以看出，这个项目的结构属于非常轻量级的，核心角色，有下面几个

- Task ： 具体的任务脚本
- TaskContainer： 持有执行任务的容器
- TaskChangeWatcher： 任务观察器，用于查看是否有新增、删除or修改任务，从而卸载旧的任务，并加载新的任务


另外一块属于扩展方面的插件体系，目前并没有给与实现，若将本框架继承在Spring生态体系中运行时，这些插件的支持就特别简单了

- RedisTemplate
- RestTemplate
- AmqpTemplate
- xxxTemplate

## III. 其他

### 0. 相关

**博文：**

- [180628-动态任务执行框架想法篇](https://liuyueyi.github.io/hexblog/2018/06/28/180628-%E5%8A%A8%E6%80%81%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E6%A1%86%E6%9E%B6%E6%83%B3%E6%B3%95%E7%AF%87/)

**项目：**

- [https://github.com/liuyueyi/quick-task](https://github.com/liuyueyi/quick-task)

### 1. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 2. 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 3. 扫描关注

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

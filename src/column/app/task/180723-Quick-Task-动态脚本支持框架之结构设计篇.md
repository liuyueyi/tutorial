---
order: 3
title: 3. 动态脚本支持框架之结构设计篇
tag:
  - 技术方案
category:
  - Quick系列
  - QuickTask
date: 2018-07-23 21:17:37
keywords: Java,QuickTask,开源项目,Groovy
---

![logo](https://upload-images.jianshu.io/upload_images/1405936-0a35465808df1ab6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

文章链接：[https://liuyueyi.github.io/hexblog/2018/07/23/180723-Quick-Task-动态脚本支持框架之结构设计篇/](https://liuyueyi.github.io/hexblog/2018/07/23/180723-Quick-Task-%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E4%B9%8B%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1%E7%AF%87/)

# Quick-Task 动态脚本支持框架之结构设计篇

相关博文:

- [180702-QuickTask动态脚本支持框架整体介绍篇](https://liuyueyi.github.io/hexblog/2018/07/02/180702-QuickTask%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D%E7%AF%87/)
- [180719-Quick-Task 动态脚本支持框架之使用介绍篇](https://liuyueyi.github.io/hexblog/2018/07/19/180719-Quick-Task-%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E4%B9%8B%E4%BD%BF%E7%94%A8%E4%BB%8B%E7%BB%8D%E7%AF%87/)

前面两篇博文，主要是整体介绍和如何使用；接下来开始进入正题，逐步剖析，这个项目是怎么一步一步搭建起来的；本篇博文则主要介绍基本骨架的设计，围绕项目的核心点，实现一个基础的原型系统

<!-- more -->

## I. 结构分析

整体设计图如下：

![结构图](https://raw.githubusercontent.com/liuyueyi/Source/master/img/blog/daywork/180628/tech.png)

对于上面的图，得有一个基本的认知，最好是能在脑海中构想出整个框架运行的方式，在正式开始之前，先简单的过一下这张结构图

抓要点

### 1. 任务执行单元

即图中的每个task就表示一个基本的任务，有下面几个要求

- 统一的继承关系（面向对象的设计理念，执行同一个角色的类由某个抽象的接口继承而来）
- 任务的执行之间是没有关系的（即任务在独立的线程中调度执行）

### 2. 任务队列

在图中表现很明显了，在内存中会保存一个当前所有执行的任务队列（或者其他的容器）

这个的目的是什么？

- 任务脚本更新时，需要卸载旧的任务（因此可以从队列中找到旧的任务，并停掉）
- 任务脚本删除时，需要卸载旧的任务

### 3. 任务管理者

虽然图中并没有明确的说有这么个东西，但也好理解，我们的系统设计目标就是支持多任务的执行和热加载，那么肯定有个任务管理的角色，来处理这些事情

其要做的事情就一个任务热加载

- 包括动态脚本更新，删除，新增的事件监听
- 实现卸载内存中旧的任务并加载执行新的任务

### 4. 插件系统

这个与核心功能关系不大，可以先不care，简单说一下就是为task提供更好的使用的公共类

这里不详细展开，后面再说


## II. 设计实现

有了上面的简单认知之后，开始进入正题，编码环节，省略掉创建工程等步骤，第一步就是设计Task的API

### 1. ITask设计

抽象公共的任务接口，从任务的标识区分，和业务调度执行，很容易写出下面的实现

```java
public interface ITask {
    /**
     * 默认将task的类名作为唯一标识
     *
     * @return
     */
    default String name() {
        return this.getClass().getName();
    }

    /**
     * 开始执行任务
     */
    void run();

    /**
     * 任务中断
     */
    default void interrupt() {}
}
```

前面两个好理解，中断这个接口的目的何在？主要是出于任务结束时的收尾操作，特别是在使用到流等操作时，有这么个回调就比较好了

### 2. TaskDecorate

任务装饰类，为什么有这么个东西？出于什么考虑的？

从上面可以知道，所有的任务最终都是在独立的线程中调度执行，那么我们自己实现的Task肯定都是会封装到线程中的，在Java中可以怎么起一个线程执行呢？

一个顺其自然的想法就是包装一下ITask接口，让它集成自Thread，然后就可以简单的直接将任务丢到线程池中即可

```java
@Slf4j
public class ScriptTaskDecorate extends Thread {
    private ITask task;

    public ScriptTaskDecorate(ITask task) {
        this.task = task;
        setName(task.name());
    }

    @Override
    public void run() {
        try {
            task.run();
        } catch (Exception e) {
            log.error("script task run error! task: {}", task.name());
        }
    }

    @Override
    public void interrupt() {
        task.interrupt();
    }
}
```

**说明：**

上面这个并不是必须的，你也完全可以自己在线程池调度Task任务时，进行硬编码风格的封装调用，完全没有问题（只是代码将不太好看而已）

### 3. TaskContainer

上面两个是具体的任务相关定义接口，接下来就是维护这些任务的容器了，最简单的就是用一个Map来保存，uuid到task的映射关系，然后再需要卸载/更新任务时，停掉旧的，添加新的任务，对应的实现也比较简单

```java
public class TaskContainer {
    /**
     * key: com.git.hui.task.api.ITask#name()
     */
    private static Map<String, ScriptTaskDecorate> taskCache = new ConcurrentHashMap<>();

    /**
     * key: absolute script path
     *
     * for task to delete
     */
    private static Map<String, ScriptTaskDecorate> pathCache = new ConcurrentHashMap<>();

    public static void registerTask(String path, ScriptTaskDecorate task) {
        ScriptTaskDecorate origin = taskCache.get(task.getName());
        if (origin != null) {
            origin.interrupt();
        }
        taskCache.put(task.getName(), task);
        pathCache.put(path, task);
        AsynTaskManager.addTask(task);
    }

    public static void removeTask(String path) {
        ScriptTaskDecorate task = pathCache.get(path);
        if (task != null) {
            task.interrupt();
            taskCache.remove(task.getName());
            pathCache.remove(path);
        }
    }
}
```

**说明**

为什么有两个map，一个唯一标识name为key，一个是task的全路径为key？

- 删除任务时，是直接删除文件，所以需要维护一个`pathCache`
- 维护name的映射，主要是基于任务的唯一标识出发的，后续可能借此做一些扩展（比如任务和任务之间的关联等）

### 4. 任务注册

前面介绍了任务的定义和装载任务的容器，接下来可以想到的就是如何发现任务并注册了，这一块这里不要详细展开，后面另起一篇详解；主要说一下思路

在设计之初，就决定任务采用Groovy脚本来实现热加载，所以有两个很容易想到的功能点

- 监听Groovy脚本的变动（新增，更新，删除），对应的类为 `TaskChangeWatcher`
- 加载Groovy脚本到内存，并执行，对应的类为 `GroovyCompile`

### 5. 执行流程

有了上面四个是否可以搭建一个原型框架呢？

答案是可以的，整个框架的运行过程

- 程序启动，注册Groovy脚本变动监听器
- 加载groovy脚本，注册到TaskContainer
- 将groovy脚本丢到线程池中调度执行
- 执行完毕后，清除和回收现场

### 6. 其他

当然其他一些辅助的工具类可有可无了，当然从使用的角度出发，有很多东西还是很有必要的，如

- 通用的日志输出组件（特别是日志输出，收集，检索，经典的ELK场景）
- 报警相关组件
- 监控相关
- redis缓存工具类
- dao工具类
- mq消费工具类
- http工具类
- 其他



## III. 其他

### 0. 相关

**博文：**

- [180628-动态任务执行框架想法篇](https://liuyueyi.github.io/hexblog/2018/06/28/180628-%E5%8A%A8%E6%80%81%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E6%A1%86%E6%9E%B6%E6%83%B3%E6%B3%95%E7%AF%87/)
- [180702-QuickTask动态脚本支持框架整体介绍篇](https://blog.hhui.top/hexblog/2018/07/02/180702-QuickTask%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D%E7%AF%87/)

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

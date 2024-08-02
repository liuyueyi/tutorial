---
order: 5
title: 5. 动态脚本支持框架之Groovy脚本加载执行
tag:
  - 技术方案
category:
  - Quick系列
  - QuickTask
date: 2018-08-07 22:09:05
keywords: Java,QuickTask,开源项目,Groovy
---

# Quick-Task 动态脚本支持框架之Groovy脚本加载执行

上一篇简答说了如何判断有任务动态添加、删除或更新，归于一点就是监听文件的变化，判断目录下的Groovy文件是否有新增删除和改变，从而判定是否有任务的变更；

接下来的问题就比较明显了，当任务变更之后，就需要重新加载任务了，即如何动态的编译并执行Groovy文件呢？

相关系列博文：

- [180628-Quick-Task 动态任务执行框架想法篇](https://liuyueyi.github.io/hexblog/2018/06/28/180628-%E5%8A%A8%E6%80%81%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E6%A1%86%E6%9E%B6%E6%83%B3%E6%B3%95%E7%AF%87/)
- [180702-Quick-Task 动态脚本支持框架整体介绍篇](https://blog.hhui.top/hexblog/2018/07/02/180702-QuickTask%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D%E7%AF%87/)
- [180723-Quick-Task 动态脚本支持框架之结构设计篇](https://liuyueyi.github.io/hexblog/2018/07/23/180723-Quick-Task-%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E4%B9%8B%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1%E7%AF%87/)
- [180729-Quick-Task 动态脚本支持框架之任务动态加载](https://liuyueyi.github.io/hexblog/2018/07/29/180729-Quick-Task-%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E4%B9%8B%E4%BB%BB%E5%8A%A1%E5%8A%A8%E6%80%81%E5%8A%A0%E8%BD%BD/)

<!--more-->

## I. Groovy文件动态加载

要想动态加载类，可以怎么办？如果对JVM有一定了解的朋友可能知道，自定义一个ClassLoader，可以实现从文件/网络/DB/Jar包中读取class文件，而Groovy，动态语言，简单来说就是.groovy文件可以直接运行，那么我们编码中要怎么玩？

### 1. 依赖

让我自己来实现Groovy文件的编译执行，目前基本上是看不到啥希望的，所以果断的借助第三方工具类加载Groovy文件

pom文件添加依赖

```xml
<dependency>
    <groupId>org.codehaus.groovy</groupId>
    <artifactId>groovy-all</artifactId>
    <version>2.4.3</version>
</dependency>
```

### 2. 加载Groovy

直接利用上面jar包中提供的GroovyCalssLoader来加载Groovy文件即可，使用也比较简单

```java
@Slf4j
public class GroovyCompile {

    @SuppressWarnings("unchecked")
    public static <T> T compile(File codeSource, Class<T> interfaceType, ClassLoader classLoader)
            throws CompileTaskScriptException {
        try {
            GroovyClassLoader loader = new GroovyClassLoader(classLoader);
            Class clz = loader.parseClass(codeSource);

            // 接口校验
            if (!interfaceType.isAssignableFrom(clz)) {
                throw new CompileTaskScriptException("illegal script type!");
            }

            return (T) clz.newInstance();
        } catch (IOException e) {
            log.error("load code from {} error! e: {}", codeSource, e);
            throw new CompileTaskScriptException("load code from " + codeSource + " error!");
        } catch (CompileTaskScriptException e) {
            throw e;
        } catch (Exception e) {
            log.error("initial script error! codePath: {}, e: {}", codeSource, e);
            throw new CompileTaskScriptException(
                    "initial script error! clz: " + codeSource + " msg: " + e.getMessage());
        }
    }
}
```

上面看着挺多，关键地方就三行，编译为class对象之后，借助反射来创建对象

```java
GroovyClassLoader loader = new GroovyClassLoader(classLoader);
Class clz = loader.parseClass(codeSource);
return (T) clz.newInstance();
```


另外还有一行，也可以顺带凑一眼，判断一个class是否为另一个class的子类，用的是

```java
interfaceType.isAssignableFrom(clz)
```

而判断某个对象是否为某类的子类用的则是 `instance of`


### 3. 调用包装

上面既然提供了一个工具类，那么接上篇的获取变动文件之后，获取File对象，借此拿到任务对象，就比较清晰了

```java
@Slf4j
public class ScriptLoadUtil {

    public static ITask loadScript(File file) {
        try {
            return GroovyCompile.compile(file, ITask.class, ScriptLoadUtil.class.getClassLoader());
        } catch (CompileTaskScriptException e) {
            log.error("un-expect error! e: {}", e);
            return null;
        }
    }
}
```

### 4. 小结

本篇内容比较简单，知识点也没多少，一个是利用`GroovyClassLoader`来编译Groovy文件并获取实例；另一个就是如何判断一个class是否为另一个class的子类

还有一个隐藏的点上面没有说，那就是上面的GroovyCompile文件中，每次加载Groovy文件时，都是新创建了一个GroovyClassLoader，并由它来加载并实例Groovy任务，那么问题来了

- 能否用一个GoorvyClassLoader来管理所有的Groovy任务呢？
- 上面的代码实现中，不同的Groovy任务之间，可以相互通信么？

针对上面的问题，暂不给出答案，后面再说


## II. 其他


### 0. 相关

**博文：**

- [180628-Quick-Task 动态任务执行框架想法篇](https://liuyueyi.github.io/hexblog/2018/06/28/180628-%E5%8A%A8%E6%80%81%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E6%A1%86%E6%9E%B6%E6%83%B3%E6%B3%95%E7%AF%87/)
- [180702-Quick-Task 动态脚本支持框架整体介绍篇](https://blog.hhui.top/hexblog/2018/07/02/180702-QuickTask%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D%E7%AF%87/)
- [180723-Quick-Task 动态脚本支持框架之结构设计篇](https://liuyueyi.github.io/hexblog/2018/07/23/180723-Quick-Task-%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E4%B9%8B%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1%E7%AF%87/)
- [180729-Quick-Task 动态脚本支持框架之任务动态加载](https://liuyueyi.github.io/hexblog/2018/07/29/180729-Quick-Task-%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E4%B9%8B%E4%BB%BB%E5%8A%A1%E5%8A%A8%E6%80%81%E5%8A%A0%E8%BD%BD/)


**项目：**

- [https://github.com/liuyueyi/quick-task](https://github.com/liuyueyi/quick-task)


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


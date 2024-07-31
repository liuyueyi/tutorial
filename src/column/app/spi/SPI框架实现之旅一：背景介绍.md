---
order: 1
title: 1. SPI框架实现之旅一：背景介绍
date: 2017-05-26 10:46:42
tag:
  - Java
  - 技术方案
category:
  - Quick系列
  - QuickSpi
---

# 背景介绍

> SPI的全名为Service Provider Interface，简单的总结下java spi机制的思想。我们系统里抽象的各个模块，往往有很多不同的实现方案，比如日志模块的方案，xml解析模块、jdbc模块的方案等。面向的对象的设计里，我们一般推荐模块之间基于接口编程，模块之间不对实现类进行硬编码。一旦代码里涉及具体的实现类，就违反了可拔插的原则，如果需要替换一种实现，就需要修改代码。为了实现在模块装配的时候能不在程序里动态指明，这就需要一种服务发现机制。 java spi就是提供这样的一个机制：为某个接口寻找服务实现的机制

<!--more-->

## 1. 背景

上面摘抄了一下spi的概念，接着以个人的理解，简单的谈一下为什么会用到SPI， 什么场景下可以用到这个， 以及使用了SPI机制后有什么优越性

### 什么是SPI

虽然最开始就引用了spi的解释，这里浅谈一下个人理解。`Service Provider Interface` 以接口方式提供服务， 和API不同，spi的机制是定义一套标准规范的接口，实现交给其他人来做。

所以一个接口，可以有很多的实现，你完全可以根据自己的需要去选择具体的实现方式，因为是面向接口的开发，所以你的业务代码基本上就不用修改，就可以切到另一个实现了

### 什么场景可以用

> 分别从框架层面和业务层面，给出一个我认为比较合适的场景

#### 1. 日志输出 `SLF4j`

SLF4j：大名鼎鼎的日志输出接口，这个jar包里面提供的都只是接口方式，具体的实现需要自己去实现，当然比较常用的 `logback` 就是一个具体的实现包了， 在项目中使用 `slf4j` 的api进行日志的输出， 通过简单的配置，引入logback， 就可以使用logback来实现具体的日志输出； 也可以换一个日志实现 `commons-logging`，业务上不需要任何的改动，就可以用不同的实现来输出日志


#### 2. 业务场景
假设你现在有个用户注册成功后的欢迎用户的业务，不同渠道（微信，qq，微博等）注册的，显示的欢迎不同，对此有两种不同的实现方式

- 如果每个不同的渠道进来的，都有一个独立的应用来响应  （因为绝大多数的业务都一样，可能就欢迎词不同，如果做到代码最大程度的复用）
- 只有一个应用，来处理所有的这些场景


### 可以怎么用
> 结合上面的业务场景，来描述下可以怎么用

#### 1. 代码复用

为了实现代码最大程度的复用，那么可以将不同的地方，抽象成一个SPI接口，在业务层通过接口来代替具体的实现类实现业务逻辑；

每个渠道，都有个独立的应用，那么在微信渠道，创建一个 WeixinSpiImpl来实现接口

在qq渠道，实现 QQSpiImpl；那么在具体的接口调用处，实际上就是执行的spi实现类方法

#### 2. 业务场景的选择区分

这个与上面不同，同一个服务接口，根据不同的业务场景，选择不同的实现来执行；当然你是完全可以使用 if， else来实现这种场景，唯一的问题就是扩展比较麻烦；

这种场景下，我们希望的就是这个接口，能自动的根据业务场景，来选择最合适的实现类来执行

**简单来讲，就是spi接口执行之前，其实需要有一个自动选择匹配的实现类的前置过程；**

通常这种业务场景下，具体的spi实现会有多个，但是需要有一个选择的策略

---

## 2. 小目标

> 在具体的实现之前，先定义一个小目标，我们想要实现一个什么样子的东西出来

通过上面的背景描述，我们的小目标也就很明确了，我们的实现至少需要满足两个场景

1. 静态选择SPI实现， 即在选择完成之后，所有对这个spi接口的引用都是确定由这个实现来承包
2. 动态选择SPI实现， 不到运行之时，你都不知道会是哪个spi实现来干这件事

---

## 3. 技术储备

> java本身就提供了一套spi的支持方式: `ServiceLoader`，我们后续的开发，也会在这个基础之上进行

利用java的 `ServiceLoader` 找到服务接口的实现类，有一些约定，下面给出要求说明和一个测试case

**一般实现流程**

- 定义spi接口 ： `IXxx`
- 具体的实现类:  `AXxx`,  `BXxx`
- 在jar包的`META-INF/services/`目录下新建一个文件，命名为 spi接口的完整类名，内容为spi接口实现的完整类名，一个实现类占一行


**测试case如下**

spi接口  `com.hust.hui.quicksilver.commons.spi.HelloInterface`

```java
package com.hust.hui.quicksilver.commons.spi;

/**
 * Created by yihui on 2017/3/17.
 */
public interface HelloInterface {

    void sayHello();

}
```

spi接口的两个实现类

`com.hust.hui.quicksilver.commons.spi.impl.ImageHello.java`

```java
package com.hust.hui.quicksilver.commons.spi.impl;

import com.hust.hui.quicksilver.commons.spi.HelloInterface;

/**
 * Created by yihui on 2017/3/17.
 */
public class ImageHello implements HelloInterface {
    @Override
    public void sayHello() {
        System.out.println("image hello!");
    }
}
```

`com.hust.hui.quicksilver.commons.spi.impl.TextHello.java`

```java
package com.hust.hui.quicksilver.commons.spi.impl;

import com.hust.hui.quicksilver.commons.spi.HelloInterface;

/**
 * Created by yihui on 2017/3/17.
 */
public class TextHello implements HelloInterface {
    @Override
    public void sayHello() {
        System.out.println("text hello");
    }
}
```

配置文件  `com.hust.hui.quicksilver.commons.spi.HelloInterface`

```
com.hust.hui.quicksilver.commons.spi.impl.ImageHello
com.hust.hui.quicksilver.commons.spi.impl.TextHello
```

测试类

```java
public class HelloSpiTest {

    @Test
    public void testSPI() {
        ServiceLoader<HelloInterface> serviceLoader = ServiceLoader.load(HelloInterface.class);

        for (HelloInterface hello: serviceLoader) {
            hello.sayHello();
        }
    }
}
```

输出如下:

```
image hello!
text hello
```

测试类演示如下图: 

![演示图](https://static.oschina.net/uploads/img/201705/26171232_e3Hb.gif)

    

---

## 4. 设计思路

画了一下结构图，方便理解, 下面的核心是  `SpiLoader` 类， 负责加载spi接口的所有实现类， 初始化所有定义的选择器， 返回一个spi接口的实现类初始化用户自定义的spi对象，然后用户持有此对象调用spi接口中提供的方法即可


![https://static.oschina.net/uploads/img/201705/26185143_ULnL.png](https://static.oschina.net/uploads/img/201705/26185143_ULnL.png)


## 5. 其他

### 博客系列链接：

- [SPI框架实现之旅四：使用测试](/hexblog/2018/05/30/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E5%9B%9B%EF%BC%9A%E4%BD%BF%E7%94%A8%E6%B5%8B%E8%AF%95/)
- [SPI框架实现之旅三：实现说明](/hexblog/2018/05/30/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E4%B8%89%EF%BC%9A%E5%AE%9E%E7%8E%B0%E8%AF%B4%E6%98%8E/)
- [SPI框架实现之旅二：整体设计](/hexblog/2018/05/30/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E4%BA%8C%EF%BC%9A%E6%95%B4%E4%BD%93%E8%AE%BE%E8%AE%A1/)
- [SPI框架实现之旅一：背景介绍](/hexblog/2017/05/29/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E4%B8%80%EF%BC%9A%E8%83%8C%E6%99%AF%E4%BB%8B%E7%BB%8D/)

### 项目: QuickAlarm

- 项目地址： [Quick-SPI](https://github.com/liuyueyi/quick-spi)
- 博客地址： [小灰灰Blog](https://liuyueyi.github.io/hexblog/)

### 个人博客： [Z+|blog](https://liuyueyi.github.io/hexblog)

基于hexo + github pages搭建的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 声明

尽信书则不如，已上内容，纯属一家之言，因本人能力一般，见识有限，如发现bug或者有更好的建议，随时欢迎批评指正，我的微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)

### 扫描关注

![QrCode](https://s17.mogucdn.com/mlcdn/c45406/180209_74fic633aebgh5dgfhid2fiiggc99_1220x480.png)
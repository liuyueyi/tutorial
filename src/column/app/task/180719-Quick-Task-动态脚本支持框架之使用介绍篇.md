---
order: 2
title: 2. 动态脚本支持框架之使用介绍篇
tag:
  - 技术方案
category:
  - Quick系列
  - QuickTask
date: 2018-07-19 20:05:52
keywords: Java,Groovy,开源项目,动态脚本,使用手册
---

![logo](https://upload-images.jianshu.io/upload_images/1405936-c68228ccac8f0b49.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# Quick-Task 动态脚本支持框架之使用介绍篇

相关博文： 

- [180702-QuickTask动态脚本支持框架整体介绍篇](https://blog.hhui.top/hexblog/2018/07/02/180702-QuickTask%E5%8A%A8%E6%80%81%E8%84%9A%E6%9C%AC%E6%94%AF%E6%8C%81%E6%A1%86%E6%9E%B6%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D%E7%AF%87/)

QuickTask这个项目主要就是为了解决数据订正和接口验证不方便的场景，设计的一个及其简单的动态脚本调度框架，前面一篇整体介绍篇博文，主要介绍了这是个什么东西，整体的运行原理，以及一些简单的使用demo

本篇博文将主要放在应用场景的探讨上，在实际的项目环境中，可以怎么用

<!-- more -->

## I. 框架使用姿势

支目前来说，有两种简单的使用方式，一是以独立的jar包来运行，二是集成在已有的项目中运行；下面分别给出介绍

### 1. 独立jar包运行

独立jar包下载，首先下载原始工程，然后打出一个可执行的jar包即可

```sh
git clone https://github.com/liuyueyi/quick-task
cd quick-task/task-core
mvn clean package -Dmaven.test.skip
cd target
java -jar task-core-0.0.1.jar --task /tmp/script
```

注意上面的jar包执行中，传入的--task参数，这个就是制定监听动态脚本的目录，如上面的脚本，表示框架会自动加载 `/tmp/script` 目录下的Groovy脚本，并执行

当脚本发生变动时，同样会重新加载更新后的groovy并执行，且会停掉原来的脚本


### 2. 项目依赖使用

作为一个依赖来使用也是可以的，首先是添加pom依赖

```xml
<repositories>
    <repository>
        <id>yihui-maven-repo</id>
        <url>https://raw.githubusercontent.com/liuyueyi/maven-repository/master/repository</url>
    </repository>
</repositories>

<dependency>
    <groupId>com.git.hui</groupId>
    <artifactId>task-core</artifactId>
    <version>0.0.1</version>
</dependency>
```

然后在自己的代码中，显示的调用下面一行代码即可，其中run方法的参数为动态脚本的目录

```java
new ScriptExecuteEngine().run("/tmp/script");
```

对于SpringBoot项目而言，可以在入口`Application`类的run方法中调用，一个demo如下

```java
@SpringBootApplication
public class Application implements CommandLineRunner {
    public static void main(String[] args) throws Exception {
        SpringApplication app = new SpringApplication(Application.class);
        app.run(args);
    }

    @Override
    public void run(String... strings) throws Exception {
        new ScriptExecuteEngine().run("/tmp/script");
    }
}
```

对于传统的Spring项目而言，可以新建一个Listener, 监听所有的bean初始化完成之后，开始注册任务引擎，一个可参考的使用case如下

```java
import org.springframework.context.ApplicationEvent;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.SmartApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class RegisterTaskEngineListener implements SmartApplicationListener {
    @Override
    public boolean supportsEventType(Class<? extends ApplicationEvent> aClass) {
        return aClass == ContextRefreshedEvent.class;
    }

    @Override
    public boolean supportsSourceType(Class<?> aClass) {
        return true;
    }

    @Override
    public void onApplicationEvent(ApplicationEvent applicationEvent) {
        new ScriptExecuteEngine().run("/tmp/script");
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

### 3. 对比小结

两种使用方式，从个人角度出发，并没有什么优劣之别，主要还是看具体的业务场景，当希望部署一个独立的任务脚本支持时，可能独立的部署更加的方便，可以在内部进行资源隔离，减少对线上生产环境的影响；

若是单纯的把这个作为一个检测项目运行的辅助工具时，如回调线上的服务接口，判断输出，获取运行项目中的内部参数等，集成在已有的项目中也是比较简单的

## II. 实际场景演示

使用了这个框架，到底有什么用处呢？或者说是否有一些适用的经典case呢？

### 1. 数据查看

这种场景比较常见，但一般配套设施齐全的公司，也不会出现这个问题，我们最常见的查看数据有以下几类

- DB数据查看
- 缓存数据查看
- 内存数据查看

对于DB查看，一般没啥问题，要么可以直连查询要么就是有查询工具；而缓存数据的查询，主要是我们通过序列化后存入的数据，直接从缓存中获取可能并不太友好；对于运行时内存中的数据，就不太好获取了，特别是我们使用Guava缓存的数据，如何在项目运行中判断缓存中的数据是否有问题呢？

一个查看内存的伪代码

```java
class DemoScript implements ITask {
    @Override
    void run() {
        // 获取目标对象
        xxxBean = ApplicationContextHolder.getBean(xxx.class);
        xxxBean.getXXX();
    }
}
```

上面的脚本中，关键就是在于获取目标对象，拿到目标对象之后，再获取内部的局部变量或者内存数据就比较简单了（不能直接访问的局部变量可以通过反射获取）

所以关键就是获取目标对象，有下面几种思路可供参考：

- 目标对象时单例或者静态类，则可以直接访问
- 如果项目运行在Spring容器中，且目标对象为Bean，则可以通过 `ApplicationContext#getBean` 方式获取


### 2. 接口调用

在问题复现的场景下，比较常用了，传入相同的参数，判断接口的返回结果是否ok，用于定位数据异常


```java
class DemoScript implements ITask {
    @Override
    void run() {
        // 获取目标对象
        xxxService = ApplicationContextHolder.getBean(xxx.class);
        
        req = buildRequest();
        result = xxxService.execute(req);
        log.info("result: {}", result);
    }
}
```

其实实际使用起来和前面没什么区别，无非是线获取到对应的Service，然后执行接口，当然在Spring的生态体系中，一个可展望的点就是支持自动注入依赖的bean


### 3. 定时任务

首先明确一点，在我们的框架中，所有的任务都是隔离的，独立的线程中调度的，当我们希望一个新的任务每隔多久执行一次，可以怎么做？


一个简单的伪代码如下

```java
class DemoScript implements ITask {
    private volatile boolean run = false;
    @Override
    void run() {
        run = true;
        while(true) {
          doXXX();
          
          try {
            Thread.sleep(1000);
          } catch(Exception e) {
          }
          
          if(!run) break;
        }
    }
    
    @Override
    void interrupt() {
        run = false;
    }
}
```

注意下上面的实现，在run方法中，有一个死循环，一直在重复的调用 `doxxx()` 方法，在内部通过 `Thread.sleep()` 来控制频率

在脚本改变或删除之后，框架会回调 `interrupt` 方法，因此会将上面的run变量设置为false，从而结束死循环

**注意：**

- 对于定时任务而言，后续会扩展一个对应`ScheduleTask`抽象类出来，将循环和中断的逻辑封装一下，对于使用方而言，只需要写业务逻辑即可，不需要关心这些重复的逻辑

### 4. mq消息消费

这种更多的是把这个框架作为一个调度来用，我们接收mq的消息，然后在动态脚本中进行处理，再传给第三方(如果集成在自己的项目中时，一个demo就是可以直接调用项目中的Dao保存数据）

一个RabbitMq的消费任务，对应的伪代码如下

```java
class DemoScript implements ITask {
    @Override
    void run() {
      ConnectionFactory fac = new CachingConnectionFactory();
      fac.setHost("127.0.0.1");
      fac.setPort(5672);
      fac.setUsername("admin")
      fac.setPassword("admin")
      fac.setVirtualHost("/")
      
      //创建连接
      Connection connection = factory.newConnection();

      //创建消息信道
      final Channel channel = connection.createChannel();

      //消息队列
      channel.queueDeclare(queue, true, false, false, null);
      //绑定队列到交换机
      channel.queueBind(queue, exchange, routingKey);
     
      Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties,
                    byte[] body) throws IOException {
                String message = new String(body, "UTF-8");

                try {
                    System.out.println(" [" + queue + "] Received '" + message);
                } finally {
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            }
        };

        // 取消自动ack
        channel.basicConsume(queue, false, consumer);   
    }
}
```

**注意：**

- 对于RabbitMQ的任务，后续计划封装一个抽象的任务脚本，使业务方只需要关注自己的消息处理即可，上面只是一个业务场景的使用演示


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

---
order: 5
title: 5.RabbitListener消费基本使用姿势
tag: 
  - RabbitMq
category: 
  - SpringBoot
  - MQ系列
  - RabbitMq
date: 2020-03-18 19:58:38
keywords: RabbitMq SpringBoot RabbitListener Consumer Publisher
---


之前介绍了rabbitmq的消息发送姿势，既然有发送，当然就得有消费者，在SpringBoot环境下，消费可以说比较简单了，借助`@RabbitListener`注解，基本上可以满足你90%以上的业务开发需求

下面我们来看一下`@RabbitListener`的最最常用使用姿势

<!-- more -->

## I. 配置

首先创建一个SpringBoot项目，用于后续的演示

- springboot版本为`2.2.1.RELEASE`
- rabbitmq 版本为 `3.7.5` （安装教程可参考: [【MQ系列】springboot + rabbitmq初体验](http://spring.hhui.top/spring-blog/2020/02/10/200210-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E5%88%9D%E4%BD%93%E9%AA%8C/))

依赖配置文件pom.xml

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.1.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <!-- 注意，下面这个不是必要的哦-->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
<repositories>
    <repository>
        <id>spring-snapshots</id>
        <name>Spring Snapshots</name>
        <url>https://repo.spring.io/libs-snapshot-local</url>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/libs-milestone-local</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>spring-releases</id>
        <name>Spring Releases</name>
        <url>https://repo.spring.io/libs-release-local</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

在`application.yml`配置文件中，添加rabbitmq的相关属性

```yml
spring:
  rabbitmq:
    virtual-host: /
    username: admin
    password: admin
    port: 5672
    host: 127.0.0.1
```

## II. 消费姿势

本文将目标放在实用性上，将结合具体的场景来演示`@RabbitListener`的使用姿势，因此当你发现看完本文之后这个注解里面有些属性还是不懂，请不要着急，下一篇会一一道来

### 0. mock数据

消费消费，没有数据，怎么消费呢？所以我们第一步，先创建一个消息生产者，可以往exchange写数据，供后续的消费者测试使用

本篇的消费主要以topic模式来进行说明（其他的几个模式使用差别不大，如果有需求的话，后续补齐）

```java
@RestController
public class PublishRest {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @GetMapping(path = "publish")
    public boolean publish(String exchange, String routing, String data) {
        rabbitTemplate.convertAndSend(exchange, routing, data);
        return true;
    }
}
```

提供一个简单rest接口，可以指定往哪个exchange推送数据，并制定路由键

### 1. case1: exchange, queue已存在

对于消费者而言其实是不需要管理exchange的创建/销毁的，它是由发送者定义的；一般来讲，消费者更关注的是自己的queue，包括定义queue并与exchange绑定，而这一套过程是可以直接通过rabbitmq的控制台操作的哦

![](/imgs/200318/00.jpg)

所以实际开发过程中，exchange和queue以及对应的绑定关系已经存在的可能性是很高的，并不需要再代码中额外处理；

在这种场景下，消费数据，可以说非常非常简单了，如下：

```java
/**
 * 当队列已经存在时，直接指定队列名的方式消费
 *
 * @param data
 */
@RabbitListener(queues = "topic.a")
public void consumerExistsQueue(String data) {
    System.out.println("consumerExistsQueue: " + data);
}
```

直接指定注解中的`queues`参数即可，参数值为对列名(queueName)

### 2. case2: queue不存在

当queue的autoDelete属性为false时，上面的使用场景还是比较合适了；但是，当这个属性为true时，没有消费者队列就会自动删除了，这个时候再用上面的姿势，可能会得到下面的异常

![队列不存在](/imgs/200318/01.jpg)

通常这种场景下，是需要我们来主动创建Queue，并建立与Exchange的绑定关系，下面给出`@RabbitListener`的推荐使用姿势

```java
/**
 * 队列不存在时，需要创建一个队列，并且与exchange绑定
 */
@RabbitListener(bindings = @QueueBinding(
        value = @Queue(value = "topic.n1", durable = "false", autoDelete = "true"),
        exchange = @Exchange(value = "topic.e", type = ExchangeTypes.TOPIC), 
        key = "r"))
public void consumerNoQueue(String data) {
    System.out.println("consumerNoQueue: " + data);
}
```

一个注解，内部声明了队列，并建立绑定关系，就是这么神奇！！！

注意`@QueueBinding`注解的三个属性：

- value: @Queue注解，用于声明队列，value为queueName, durable表示队列是否持久化, autoDelete表示没有消费者之后队列是否自动删除
- exchange: @Exchange注解，用于声明exchange， type指定消息投递策略，我们这里用的topic方式
- key: 在topic方式下，这个就是我们熟知的 routingKey

以上，就是在队列不存在时的使用姿势，看起来也不复杂

### 3. case3: ack

在前面rabbitmq的核心知识点学习过程中，会知道为了保证数据的一致性，有一个消息确认机制；

我们这里的ack主要是针对消费端而言，当我们希望更改默认ack方式(noack, auto, manual)，可以如下处理

```java
/**
 * 需要手动ack，但是不ack时
 *
 * @param data
 */
@RabbitListener(bindings = @QueueBinding(value = @Queue(value = "topic.n2", durable = "false", autoDelete = "true"),
        exchange = @Exchange(value = "topic.e", type = ExchangeTypes.TOPIC), key = "r"), ackMode = "MANUAL")
public void consumerNoAck(String data) {
    // 要求手动ack，这里不ack，会怎样?
    System.out.println("consumerNoAck: " + data);
}
```

上面的实现也比较简单，设置`ackMode=MANUAL`，手动ack

但是，请注意我们的实现中，没有任何一个地方体现了手动ack，这就相当于一致都没有ack，在后面的测试中，可以看出这种不ack时，会发现数据一直在`unacked`这一栏，当Unacked数量超过限制的时候，就不会再消费新的数据了


### 4. case4: manual ack

上面虽然选择ack方式，但是还缺一步ack的逻辑，接下来我们看一下如何补齐

```java
/**
 * 手动ack
 *
 * @param data
 * @param deliveryTag
 * @param channel
 * @throws IOException
 */
@RabbitListener(bindings = @QueueBinding(value = @Queue(value = "topic.n3", durable = "false", autoDelete = "true"),
        exchange = @Exchange(value = "topic.e", type = ExchangeTypes.TOPIC), key = "r"), ackMode = "MANUAL")
public void consumerDoAck(String data, @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag, Channel channel)
        throws IOException {
    System.out.println("consumerDoAck: " + data);

    if (data.contains("success")) {
        // RabbitMQ的ack机制中，第二个参数返回true，表示需要将这条消息投递给其他的消费者重新消费
        channel.basicAck(deliveryTag, false);
    } else {
        // 第三个参数true，表示这个消息会重新进入队列
        channel.basicNack(deliveryTag, false, true);
    }
}
```

请注意，方法多了两个参数

- `deliveryTag`: 相当于消息的唯一标识，用于mq辨别是哪个消息被ack/nak了
- `channel`: mq和consumer之间的管道，通过它来ack/nak

当我们正确消费时，通过调用 `basicAck` 方法即可

```java
// RabbitMQ的ack机制中，第二个参数返回true，表示需要将这条消息投递给其他的消费者重新消费
channel.basicAck(deliveryTag, false);
```

当我们消费失败，需要将消息重新塞入队列，等待重新消费时，可以使用 `basicNack`

```java
// 第三个参数true，表示这个消息会重新进入队列
channel.basicNack(deliveryTag, false, true);
```

### 5. case5: 并发消费

当消息很多，一个消费者吭哧吭哧的消费太慢，但是我的机器性能又杠杠的，这个时候我就希望并行消费，相当于同时有多个消费者来处理数据

要支持并行消费，如下设置即可

```java
@RabbitListener(bindings = @QueueBinding(value = @Queue(value = "topic.n4", durable = "false", autoDelete = "true"),
        exchange = @Exchange(value = "topic.e", type = ExchangeTypes.TOPIC), key = "r"), concurrency = "4")
public void multiConsumer(String data) {
    System.out.println("multiConsumer: " + data);
}
```

![](/imgs/200318/02.jpg)

请注意注解中的`concurrency = "4"`属性，表示固定4个消费者；

除了上面这种赋值方式之外，还有一种 `m-n` 的格式，表示m个并行消费者，最多可以有n个

（额外说明：这个参数的解释实在`SimpleMessageListenerContainer`的场景下的，下一篇文章会介绍它与`DirectMessageListenerContainer`的区别）

### 6. 测试

通过前面预留的消息发送接口，我们在浏览器中请求: `http://localhost:8080/publish?exchange=topic.e&routing=r&data=wahaha`

![消费](/imgs/200318/03.jpg)

然后看一下输出，五个消费者都接收到了，特别是主动nak的那个消费者，一直在接收到消息；

（因为一直打印日志，所以重启一下应用，开始下一个测试）

然后再发送一条成功的消息，验证下手动真确ack，是否还会出现上面的情况，请求命令: `http://localhost:8080/publish?exchange=topic.e&routing=r&data=successMsg`


![](/imgs/200318/04.jpg)


然后再关注一下，没有ack的那个队列，一直有一个unack的消息

![](/imgs/200318/05.jpg)

## II. 其他


**系列博文**

- [【MQ系列】springboot + rabbitmq初体验](http://spring.hhui.top/spring-blog/2020/02/10/200210-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E5%88%9D%E4%BD%93%E9%AA%8C/)
- [【MQ系列】RabbitMq核心知识点小结](http://spring.hhui.top/spring-blog/2020/02/12/200212-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E6%A0%B8%E5%BF%83%E7%9F%A5%E8%AF%86%E7%82%B9%E5%B0%8F%E7%BB%93/)
- [【MQ系列】SprigBoot + RabbitMq发送消息基本使用姿势](http://spring.hhui.top/spring-blog/2020/02/18/200218-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)
- [【MQ系列】RabbitMq消息确认/事务机制的使用姿势](http://spring.hhui.top/spring-blog/2020/02/19/200219-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E6%B6%88%E6%81%AF%E7%A1%AE%E8%AE%A4%E6%9C%BA%E5%88%B6-%E4%BA%8B%E5%8A%A1%E7%9A%84%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**项目源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/302-rabbitmq-consumer](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/302-rabbitmq-consumer)

### 1. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 2. 声明

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 3. 扫描关注

**一灰灰blog**

![QrCode](https://spring.hhui.top/spring-blog/imgs/info/info.png)

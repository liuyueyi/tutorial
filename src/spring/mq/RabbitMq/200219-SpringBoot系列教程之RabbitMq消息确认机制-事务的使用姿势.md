---
order: 4
title: 4.消息确认机制/事务的使用姿势
tag: 
  - RabbitMq
category: 
  - SpringBoot
  - MQ系列
  - RabbitMq
date: 2020-02-19 11:30:53
keywords: RabbitTemplate MessageConverter SpringBoot RabbitMq 消息确认机制 事务机制 Transactional
---

上一篇介绍了RabbitMq借助RabbitTemplate来发送消息的基本使用姿势，我们知道RabbitMq提供了两种机制，来确保发送端的消息被brocke正确接收，本文将主要介绍，在消息确认和事物两种机制的场景下，发送消息的使用姿势

<!-- more -->

## I. 配置

首先创建一个SpringBoot项目，用于后续的演示

- springboot版本为`2.2.1.RELEASE`
- rabbitmq 版本为 `3.7.5` （安装教程可参考: [【MQ系列】springboot + rabbitmq初体验](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484522&idx=1&sn=411fad078902200314d594b932fbdf35)）

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

## II. 消息确认机制

本节来看一下消息确认机制的使用姿势，首先有必要了解一下什么是消息确认机制

### 1. 定义

> 简单来讲就是消息发送之后，需要接收到RabbitMq的正确反馈，然后才能判断消息是否正确发送成功；

一般来说，RabbitMq的业务逻辑包括以下几点

- 生产者将信道设置成Confirm模式，一旦信道进入Confirm模式，所有在该信道上面发布的消息都会被指派一个唯一的ID(以confirm.select为基础从1开始计数)
- 一旦消息被投递到所有匹配的队列之后，Broker就会发送一个确认给生产者（包含消息的唯一ID）,这就使得生产者知道消息已经正确到达目的队列了
- 如果消息和队列是可持久化的，那么确认消息会将消息写入磁盘之后发出
- Broker回传给生产者的确认消息中deliver-tag域包含了确认消息的序列号（此外Broker也可以设置basic.ack的multiple域，表示到这个序列号之前的所有消息都已经得到了处理）

### 2. 基本使用case

从上面的解释，可以知道发送消息端，需要先将信道设置为Confirm模式，`RabbitProperties`配置类中，有个属性，正好是用来设置的这个参数的，所以我们可以直接在配置文件`application.yml`中，添加下面的配置

```yml
spring:
  rabbitmq:
    # 在2.2.1.release版本中，下面这个配置属于删除状态，推荐使用后一种配置方式
    # publisher-confirms: true
    publisher-confirm-type: correlated
    # 下面这个配置，表示接收mq返回的确认消息
    publisher-returns: true
```

上面配置完毕之后，直接使用RabbitTemplate发送消息，表示已经支持Confirm模式了，但实际的使用，会有一点点区别，我们需要接收mq返回的消息，发送失败的回调（以实现重试逻辑等），所以一个典型的发送端代码可以如下

```java
@Service
public class AckPublisher implements RabbitTemplate.ConfirmCallback, RabbitTemplate.ReturnCallback {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void init() {
        rabbitTemplate.setReturnCallback(this);
        rabbitTemplate.setConfirmCallback(this);
    }

    /**
     * 接收发送后确认信息
     *
     * @param correlationData
     * @param ack
     * @param cause
     */
    @Override
    public void confirm(CorrelationData correlationData, boolean ack, String cause) {
        if (ack) {
            System.out.println("ack send succeed: " + correlationData);
        } else {
            System.out.println("ack send failed: " + correlationData + "|" + cause);
        }
    }

    /**
     * 发送失败的回调
     *
     * @param message
     * @param replyCode
     * @param replyText
     * @param exchange
     * @param routingKey
     */
    @Override
    public void returnedMessage(Message message, int replyCode, String replyText, String exchange, String routingKey) {
        System.out.println("ack " + message + " 发送失败");
    }


    /**
     * 一般的用法，推送消息
     *
     * @param ans
     * @return
     */
    public String publish(String ans) {
        String msg = "ack msg = " + ans;
        System.out.println("publish: " + msg);

        CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
        rabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg, correlationData);
        return msg;
    }
}
```

请注意上面的实现，首先需要给RabbitTemplate设置回调，这两个不可或缺

```java
rabbitTemplate.setReturnCallback(this);
rabbitTemplate.setConfirmCallback(this);
```

### 3. 手动配置方式

上面利用的是标准的SpringBoot配置，一般来说是适用于绝大多数的场景的；当不能覆盖的时候，还可以通过手动的方式来定义一个特定的RabbitTemplate（比如一个项目中，只有某一个场景的消息发送需要确认机制，其他的默认即可，所以需要区分RabbitTemplate）

在自动配置类中，可以手动的注册一个RabbitTemplate的bean，来专职消息确认模式的发送

```java
@Value("${spring.rabbitmq.host}")
private String host;
@Value("${spring.rabbitmq.port}")
private Integer port;
@Value("${spring.rabbitmq.username}")
private String username;
@Value("${spring.rabbitmq.password}")
private String password;
@Value("${spring.rabbitmq.virtual-host}")
private String virtualHost;

@Bean
public RabbitTemplate ackRabbitTemplate() {
    CachingConnectionFactory connectionFactory = new CachingConnectionFactory();
    connectionFactory.setHost(host);
    connectionFactory.setPort(port);
    connectionFactory.setUsername(username);
    connectionFactory.setPassword(password);
    connectionFactory.setVirtualHost(virtualHost);
    // 设置ack为true
    connectionFactory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
    connectionFactory.setPublisherReturns(true);
    return new RabbitTemplate(connectionFactory);
}
```

至于使用姿势，和前面完全一致，只是将`rabbitTemplate`换成`ackRabbitTemplate`

## III. 事务机制

消息确认机制属于异步模式，也就是说一个消息发送完毕之后，不待返回，就可以发送另外一条消息；这里就会有一个问题，publisher先后发送msg1, msg2，但是对RabbitMq而言，接收的顺序可能是msg2, msg1；所以消息的顺序可能会不一致

所以有了更加严格的事务机制，它属于同步模式，发送消息之后，等到接收到确认返回之后，才能发送下一条消息

### 1. 事务使用方式

首先我们定义一个事务管理器

```java
/**
 * 配置rabbitmq事务
 *
 * @param connectionFactory
 * @return
 */
@Bean("rabbitTransactionManager")
public RabbitTransactionManager rabbitTransactionManager(ConnectionFactory connectionFactory) {
    return new RabbitTransactionManager(connectionFactory);
}

@Bean
public RabbitTemplate transactionRabbitTemplate(ConnectionFactory connectionFactory) {
    return new RabbitTemplate(connectionFactory);
}
```

事务机制的使用姿势，看起来和上面的消息确认差不多，无非是需要添加一个`@Transactional`注解罢了

```java
@Service
public class TransactionPublisher implements RabbitTemplate.ReturnCallback {
    @Autowired
    private RabbitTemplate transactionRabbitTemplate;

    @PostConstruct
    public void init() {
        // 将信道设置为事务模式
        transactionRabbitTemplate.setChannelTransacted(true);
        transactionRabbitTemplate.setReturnCallback(this);
    }

    @Override
    public void returnedMessage(Message message, int replyCode, String replyText, String exchange, String routingKey) {
        System.out.println("事务 " + message + " 发送失败");
    }

    /**
     * 一般的用法，推送消息
     *
     * @param ans
     * @return
     */
    @Transactional(rollbackFor = Exception.class, transactionManager = "rabbitTransactionManager")
    public String publish(String ans) {
        String msg = "transaction msg = " + ans;
        System.out.println("publish: " + msg);

        CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
        transactionRabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg, correlationData);
        return msg;
    }
}
```

请注意，核心代码设置信道为事务模式必不可少

```java
// 将信道设置为事务模式
transactionRabbitTemplate.setChannelTransacted(true);
```


## IV. 测试

我们这里主要测试一下事务和消息确认机制的性能对比吧，从定义上来看消息确认机制效率更高，我们简单的对比一下

```java
@RestController
public class PubRest {
    @Autowired
    private AckPublisher ackPublisher;
    @Autowired
    private TransactionPublisher transactionPublisher;

    private AtomicInteger atomicInteger = new AtomicInteger(1);

    @GetMapping(path = "judge")
    public boolean judge(String name) {
        for (int i = 0; i < 10; i++) {
            long start = System.currentTimeMillis();
            ackPublisher.publish(name + atomicInteger.getAndIncrement());
            ackPublisher.publish(name + atomicInteger.getAndIncrement());
            ackPublisher.publish(name + atomicInteger.getAndIncrement());
            long mid = System.currentTimeMillis();
            System.out.println("ack cost: " + (mid - start));

            transactionPublisher.publish(name + atomicInteger.getAndIncrement());
            transactionPublisher.publish(name + atomicInteger.getAndIncrement());
            transactionPublisher.publish(name + atomicInteger.getAndIncrement());
            System.out.println("transaction cost: " + (System.currentTimeMillis() - mid));
        }
        return true;
    }
}
```

去掉无关的输出，仅保留耗时，对比如下（差距还是很明显的）

```
ack cost: 5
transaction cost: 111

ack cost: 3
transaction cost: 108

ack cost: 2
transaction cost: 101

ack cost: 3
transaction cost: 107

ack cost: 14
transaction cost: 106

ack cost: 2
transaction cost: 140

ack cost: 4
transaction cost: 124

ack cost: 4
transaction cost: 131

ack cost: 4
transaction cost: 129

ack cost: 2
transaction cost: 99
```

## V. 其他

**系列博文**

- [【MQ系列】springboot + rabbitmq初体验](http://spring.hhui.top/spring-blog/2020/02/10/200210-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E5%88%9D%E4%BD%93%E9%AA%8C/)
- [【MQ系列】RabbitMq核心知识点小结](http://spring.hhui.top/spring-blog/2020/02/12/200212-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E6%A0%B8%E5%BF%83%E7%9F%A5%E8%AF%86%E7%82%B9%E5%B0%8F%E7%BB%93/)
- [【MQ系列】SprigBoot + RabbitMq发送消息基本使用姿势](http://spring.hhui.top/spring-blog/2020/02/18/200218-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E7%9A%84%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**项目源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/301-rabbitmq-publish](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/301-rabbitmq-publish)


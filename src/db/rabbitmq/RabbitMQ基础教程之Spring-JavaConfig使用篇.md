---
order: 6
title: RabbitMQ基础教程之Spring&JavaConfig使用篇
tag:
  - RabbitMQ
category:
  - 开源
  - RabbitMQ
date: 2018-05-31 22:03:08
---

# RabbitMQ基础教程之Spring使用篇

相关博文，推荐查看:

1. [RabbitMq基础教程之安装与测试](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/)
2. [RabbitMq基础教程之基本概念](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)
3. [RabbitMQ基础教程之基本使用篇](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E7%AF%87/)
4. [RabbitMQ基础教程之使用进阶篇](https://liuyueyi.github.io/hexblog/2018/05/29/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E4%BD%BF%E7%94%A8%E8%BF%9B%E9%98%B6%E7%AF%87/)

在实际的应用场景中，将RabbitMQ和Spring结合起来使用的时候可能更加频繁，网上关于Spring结合的博文中，大多都是xml的方式，这篇博文，则主要介绍下利用JavaConfig的结合，又会是怎样的

<!--more-->

## I. Spring中RabbitMQ的基本使用姿势

### 1. 准备

开始之前，首先添加上必要的依赖，主要利用 spring-rabbit 来实现，这个依赖中，内部又依赖的Spring相关的模块，下面统一改成5.0.4版本

```xml
<dependencies>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.16.20</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.amqp</groupId>
        <artifactId>spring-rabbit</artifactId>
        <version>1.7.3.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>5.0.4.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-test</artifactId>
        <version>5.0.4.RELEASE</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>5.0.4.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

**流程分析**

实现主要分为两块，一个是投递服务，一个是消费服务，结合前面RabbitMQ的基本使用姿势中的流程，即便是使用Spring，我们也避免不了下面几步

- 建立连接
- 声明Exchange ，声明Queue
- 建立Queue和Exchange之间的绑定关系
- 发送消息
- 消费消息（ack/nak)

### 2. 基本case

首先借助Spring，来实现一个最基本的最简单的实现方式


```java
/**
 * Created by yihui in 19:53 18/5/30.
 */
public class SimpleProducer {
    public static void main(String[] args) throws InterruptedException {
        CachingConnectionFactory factory = new CachingConnectionFactory("127.0.0.1", 5672);
        factory.setUsername("admin");
        factory.setPassword("admin");
        factory.setVirtualHost("/");

        RabbitAdmin admin = new RabbitAdmin(factory);

        // 创建队列
        Queue queue = new Queue("hello", true, false, false, null);
        admin.declareQueue(queue);

        //创建topic类型的交换机
        TopicExchange exchange = new TopicExchange("topic.exchange");
        admin.declareExchange(exchange);

        //交换机和队列绑定，路由规则为匹配"foo."开头的路由键
        admin.declareBinding(BindingBuilder.bind(queue).to(exchange).with("foo.*"));


        //设置监听
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer(factory);
        Object listener = new Object() {
            public void handleMessage(String foo) {
                System.out.println(" [x] Received '" + foo + "'");
            }
        };
        MessageListenerAdapter adapter = new MessageListenerAdapter(listener);
        container.setMessageListener(adapter);
        container.setQueues(queue);
        container.start();

        //发送消息
        RabbitTemplate template = new RabbitTemplate(factory);
        template.convertAndSend("topic.exchange", "foo.bar", "Hello, world!");
        Thread.sleep(1000);

        // 关闭
        container.stop();
    }
}
```

### 3. 逻辑分析

上面这一段代码中，包含了消息投递和消费两块，从实现而言，基本上逻辑和前面的基础使用没有什么太大的区别，步骤如下:

1. 建立连接： `new CachingConnectionFactory("127.0.0.1", 5672)`
2. 声明Queue: `new Queue("hello", true, false, false, null)`
3. 声明Exchange: `new TopicExchange("topic.exchange")`
4. 绑定Queue和Exchange: `admin.declareBinding(BindingBuilder.bind(queue).to(exchange).with("foo.*"));`
5. 投递消息： `template.convertAndSend("topic.exchange", "foo.bar", "Hello, world!");`
6. 消费消息： 设置`MessageListenerAdapter`

这里面有几个类需要额外注意：

- RabbitTemplate: Spring实现的发送消息的模板，可以直接发送消息
- SimpleMessageListenerContainer: 注册接收消息的容器


## II. Spring结合JavaConfig使用RabbitMQ使用姿势

### 1. 公共配置

主要是将公共的ConnectionFactory 和 RabbitAdmin 抽取出来

```java
@Configuration
@ComponentScan("com.git.hui.rabbit.spring")
public class SpringConfig {

    private Environment environment;

    @Autowired
    public void setEnvironment(Environment environment) {
        this.environment = environment;
        System.out.println("then env: " + environment);
    }

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost("127.0.0.1");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin");
        factory.setVirtualHost("/");
        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }
}
```


### 2. 消息投递

发送消息的组件就比较简单了，直接利用 AmqpTemplate 即可

```java
@Component
public class AmqpProducer {

    private AmqpTemplate amqpTemplate;

    @Autowired
    public void amqpTemplate(ConnectionFactory connectionFactory) {
        amqpTemplate = new RabbitTemplate(connectionFactory);
    }

    /**
     * 将消息发送到指定的交换器上
     *
     * @param exchange
     * @param msg
     */
    public void publishMsg(String exchange, String routingKey, Object msg) {
        amqpTemplate.convertAndSend(exchange, routingKey, msg);
    }
}
```

### 3. DirectExchange消息消费

根据不同的Exchange类型，分别实现如下

**DirectExchange方式**

```java
@Configuration
public class DirectConsumerConfig {
    @Autowired
    private ConnectionFactory connectionFactory;

    @Autowired
    private RabbitAdmin rabbitAdmin;

    @Bean
    public DirectExchange directExchange() {
        DirectExchange directExchange = new DirectExchange("direct.exchange");
        directExchange.setAdminsThatShouldDeclare(rabbitAdmin);
        return directExchange;
    }

    @Bean
    public Queue directQueue() {
        Queue queue = new Queue("aaa");
        queue.setAdminsThatShouldDeclare(rabbitAdmin);
        return queue;
    }

    @Bean
    public Binding directQueueBinding() {
        Binding binding = BindingBuilder.bind(directQueue()).to(directExchange()).with("test1");
        binding.setAdminsThatShouldDeclare(rabbitAdmin);
        return binding;
    }

    @Bean
    public ChannelAwareMessageListener directConsumer() {
        return new BasicConsumer("direct");
    }

    @Bean(name = "directMessageListenerContainer")
    public MessageListenerContainer messageListenerContainer() {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setRabbitAdmin(rabbitAdmin);
        container.setQueues(directQueue());
        container.setPrefetchCount(20);
        container.setAcknowledgeMode(AcknowledgeMode.AUTO);
        container.setMessageListener(directConsumer());
        return container;
    }
}
```

从上面的实现，基本上都是重新定义了一个Queue, Exchange, Binding, MessageListenerContainer（用来监听消息），并将消息的消费抽出了一个公共类

```java
@Slf4j
public class BasicConsumer implements ChannelAwareMessageListener {
    private String name;

    public BasicConsumer(String name) {
        this.name = name;
    }

    @Override
    public void onMessage(Message message, Channel channel) throws Exception {
        try {
            byte[] bytes = message.getBody();
            String data = new String(bytes, "utf-8");
            System.out.println(name + " data: " + data + " tagId: " + message.getMessageProperties().getDeliveryTag());
        } catch (Exception e) {
            log.error("local cache rabbit mq localQueue error! e: {}", e);
        }
    }
}
```


### 4. 测试

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringConfig.class)
public class SprintUnit {
    @Autowired
    private AmqpProducer amqpProducer;

    @Test
    public void testDirectConsumer() throws InterruptedException {
        String[] routingKey = new String[]{"hello.world", "world", "test1"};
        for (int i = 0; i < 10; i++) {
            amqpProducer
                    .publishMsg("direct.exchange", routingKey[i % 3], ">>> hello " + routingKey[i % 3] + ">>> " + i);
        }
        System.out.println("-------over---------");

        Thread.sleep(1000 * 60 * 10);
    }
}
```

这个测试类中，虽然主要是往MQ中投递消息，但在Spring容器启动之后，接收MQ消息并消费的实际任务，是通过前面的`MessageListenerContainer`托付给Spring容器了，上面测试执行之后，输出为

```sh
direct data: >>> hello test1>>> 2 tagId: 1
direct data: >>> hello test1>>> 5 tagId: 2
direct data: >>> hello test1>>> 8 tagId: 3
```


### 5. Topic & Fanout策略

上面的一个写出来之后，再看这两个就比较相似了

```java
@Configuration
public class TopicConsumerConfig {
    @Autowired
    private ConnectionFactory connectionFactory;

    @Autowired
    private RabbitAdmin rabbitAdmin;

    @Bean
    public TopicExchange topicExchange() {
        TopicExchange topicExchange = new TopicExchange("topic.exchange");
        topicExchange.setAdminsThatShouldDeclare(rabbitAdmin);
        return topicExchange;
    }

    @Bean
    public Queue topicQueue() {
        Queue queue = new Queue("bbb");
        queue.setAdminsThatShouldDeclare(rabbitAdmin);
        return queue;
    }

    @Bean
    public Binding topicQueueBinding() {
        Binding binding = BindingBuilder.bind(topicQueue()).to(topicExchange()).with("*.queue");
        binding.setAdminsThatShouldDeclare(rabbitAdmin);
        return binding;
    }

    @Bean
    public ChannelAwareMessageListener topicConsumer() {
        return new BasicConsumer("topic");
    }

    @Bean(name = "topicMessageListenerContainer")
    public MessageListenerContainer messageListenerContainer() {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setRabbitAdmin(rabbitAdmin);
        container.setQueues(topicQueue());
        container.setPrefetchCount(20);
        container.setAcknowledgeMode(AcknowledgeMode.AUTO);
        container.setMessageListener(topicConsumer());
        return container;
    }
}
```

对应的测试case

```java
@Test
public void testTopicConsumer() throws InterruptedException {
    String[] routingKey = new String[]{"d.queue", "a.queue", "cqueue"};
    for (int i = 0; i < 20; i++) {
        amqpProducer.publishMsg("topic.exchange", routingKey[i % 3], ">>> hello " + routingKey[i % 3] + ">>> " + i);
    }
    System.out.println("-------over---------");

    Thread.sleep(1000 * 60 * 10);
}
```


广播方式

```java
@Configuration
public class FanoutConsumerConfig {

    @Autowired
    private ConnectionFactory connectionFactory;

    @Autowired
    private RabbitAdmin rabbitAdmin;

    @Bean
    public FanoutExchange fanoutExchange() {
        FanoutExchange fanoutExchange = new FanoutExchange("fanout.exchange");
        fanoutExchange.setAdminsThatShouldDeclare(rabbitAdmin);
        return fanoutExchange;
    }

    @Bean
    public Queue fanoutQueue() {
        Queue queue = new Queue("ccc");
        queue.setAdminsThatShouldDeclare(rabbitAdmin);
        return queue;
    }

    @Bean
    public Binding fanoutQueueBinding() {
        Binding binding = BindingBuilder.bind(fanoutQueue()).to(fanoutExchange());
        binding.setAdminsThatShouldDeclare(rabbitAdmin);
        return binding;
    }

    @Bean
    public ChannelAwareMessageListener fanoutConsumer() {
        return new BasicConsumer("fanout");
    }

    @Bean(name = "FanoutMessageListenerContainer")
    public MessageListenerContainer messageListenerContainer() {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setRabbitAdmin(rabbitAdmin);
        container.setQueues(fanoutQueue());
        container.setPrefetchCount(20);
        container.setAcknowledgeMode(AcknowledgeMode.AUTO);
        container.setMessageListener(fanoutConsumer());
        return container;
    }
}
```

对应的测试case

```java
@Test
public void testFanoutConsumer() throws InterruptedException {
    String[] routingKey = new String[]{"d.queue", "a.queue", "cqueue", "hello.world", "world", "test1"};
    for (int i = 0; i < 20; i++) {
        amqpProducer
                .publishMsg("fanout.exchange", routingKey[i % 6], ">>> hello " + routingKey[i % 6] + ">>> " + i);
    }
    System.out.println("-------over---------");

    Thread.sleep(1000 * 60 * 10);
}
```


## II. 其他

### 项目地址

- [六月/study-demo](https://gitee.com/liuyueyi/study-demo/tree/master/spring-rabbit)

### [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 扫描关注

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

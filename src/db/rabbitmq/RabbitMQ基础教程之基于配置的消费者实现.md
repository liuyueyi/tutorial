---
order: 4
title: 4. 基于配置的消费者实现
tag:
  - RabbitMQ
  - Spring
category:
  - 开源
  - RabbitMQ
date: 2018-06-05 19:52:51
---


# RabbitMQ基础教程之基于配置的消费者实现

相关博文，推荐查看:

1. [RabbitMq基础教程之安装与测试](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/)
2. [RabbitMq基础教程之基本概念](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)
3. [RabbitMQ基础教程之基本使用篇](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E7%AF%87/)
4. [RabbitMQ基础教程之使用进阶篇](https://liuyueyi.github.io/hexblog/2018/05/29/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E4%BD%BF%E7%94%A8%E8%BF%9B%E9%98%B6%E7%AF%87/)
5. [RabbitMQ基础教程之Spring&JavaConfig使用篇](https://blog.hhui.top/hexblog/2018/05/31/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8BSpring-JavaConfig%E4%BD%BF%E7%94%A8%E7%AF%87/)
6. [RabbitMQ基础教程之Spring-JavaConfig-FactoryBean使用姿势](https%3A%2F%2Fblog.hhui.top%2Fhexblog%2F2018%2F05%2F31%2FRabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8BSpring-JavaConfig-FactoryBean%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF%2F)

前面一篇介绍了使用工厂方式创建消费者，其中一个不太友好的地方就在配置都是硬编码的方式，不太灵活，那么是否可以结合前一篇的FactoryBean来实现从配置中来灵活的创建消费者呢？

<!--more-->

## I. 动态配置实现消费者程序

### 1. 配置文件加载

首先就是需要从配置文件中获取相应的配置信息，借助JavaConfig，加一个注解即可

```java
@Configuration
@PropertySource("classpath:dynamicConfig.properties")
public class DynSpringConfig {

    @Autowired
    private Environment environment;

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost(environment.getProperty("dyn.mq.host"));
        factory.setPort(Integer.parseInt(environment.getProperty("dyn.mq.port")));
        factory.setUsername(environment.getProperty("dyn.mq.uname"));
        factory.setPassword(environment.getProperty("dyn.mq.pwd"));
        factory.setVirtualHost(environment.getProperty("dyn.mq.vhost"));
        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }
}
```

主要就是 `@PropertySource("classpath:dynamicConfig.properties")` ， 表示从dynamicConfig.properties文件中读取相应的配置，而这些配置，会存放在 `Environment` 容器内；

获取配置的方式，就是通过`org.springframework.core.env.PropertyResolver#getProperty(java.lang.String)`获取

### 2. 消费者通用实现

实现一个简单的通用的消费端，主要根据前一篇博文中定义的`MQContainerFactory`，来生成`SimpleMessageListenerContainer`，然后注入消费服务，并启动容器

```java
public class DynamicConsumer {
    public DynamicConsumer(MQContainerFactory fac) throws Exception {
        SimpleMessageListenerContainer container = fac.getObject();
        container.setMessageListener(new AbsMQConsumer() {
            @Override
            public boolean process(Message message, Channel channel) {
                System.out.println("DynamicConsumer: " + fac.getQueue() + " | " + new String(message.getBody()));
                return true;
            }
        });

        container.start();
    }
}
```

上面是一个非常简单的实现，针对常见的的RabbitMQ消息消费而言，也可以写一个泛型类，然后借助Spring的事件机制，实现一个通用的消费端，一种case如下:

```java
public class JsonMsgConsumer {
    public JsonMsgConsumer(ApplicationContext apc, MQContainerFactory fac, Class<?> msgType) throws Exception {
        SimpleMessageListenerContainer container = fac.getObject();
        container.setMessageListener(new AbsMQConsumer() {
            @Override
            public boolean process(Message message, Channel channel) {
                System.out.println("DynamicConsumer: " + fac.getQueue() + " | " + new String(message.getBody()));

                Object type = JSONObject.parseObject(message.getBody(), msgType);
                apc.publishEvent(type);
                return true;
            }
        });

        container.start();
    }
}
```

如果message中的数据，是通过Json序列化方式存入，则使用方，只需要监听对应的Event消费数据即可，完全不用再关系消费端的情况了


### 3. MQContainerFactory 初始化

根据配置文件中的信息，初始化factory，这个可谓是最关键的地方了，实现也和之前大致类似，只不过是将硬编码改成配置信息读取而已，完整的配置文件如下

```java
@Configuration
@PropertySource("classpath:dynamicConfig.properties")
public class DynSpringConfig {

    @Autowired
    private Environment environment;

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost(environment.getProperty("dyn.mq.host"));
        factory.setPort(Integer.parseInt(environment.getProperty("dyn.mq.port")));
        factory.setUsername(environment.getProperty("dyn.mq.uname"));
        factory.setPassword(environment.getProperty("dyn.mq.pwd"));
        factory.setVirtualHost(environment.getProperty("dyn.mq.vhost"));
        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public AmqpProducer amqpProducer() {
        return new AmqpProducer();
    }


    @Bean
    public DynamicConsumer dynamicConsumer(ConnectionFactory connectionFactory, RabbitAdmin rabbitAdmin)
            throws Exception {
        MQContainerFactory fac = MQContainerFactory.builder().directExchange(environment.getProperty("dyn.mq.exchange"))
                .queue(environment.getProperty("dyn.mq.queue"))
                .autoDeleted(Boolean.parseBoolean(environment.getProperty("dyn.mq.autoDeleted")))
                .autoAck(Boolean.parseBoolean(environment.getProperty("dyn.mq.autoAck")))
                .durable(Boolean.parseBoolean(environment.getProperty("dyn.mq.durable")))
                .routingKey(environment.getProperty("dyn.mq.routingKey")).rabbitAdmin(rabbitAdmin)
                .connectionFactory(connectionFactory).build();

        return new DynamicConsumer(fac);
    }
}
```

### 4. 测试

配置文件内容：

```
dyn.mq.host=127.0.0.1
dyn.mq.port=5672
dyn.mq.uname=admin
dyn.mq.pwd=admin
dyn.mq.vhost=/
dyn.mq.exchange=fac.direct.exchange
dyn.mq.queue=dyn.queue
dyn.mq.durable=true
dyn.mq.autoDeleted=false
dyn.mq.autoAck=false
dyn.mq.routingKey=fac-routing
```

测试方法

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DynSpringConfig.class)
public class DynamicConsumerUnit {
    @Autowired
    private AmqpProducer amqpProducer;

    @Test
    public void testDirectConsumer() throws InterruptedException {
        String[] routingKey = new String[]{"hello.world", "fac-routing", "test1"};
        for (int i = 0; i < 100; i++) {
            amqpProducer.publishMsg("fac.direct.exchange", routingKey[i % 3],
                    ">>> hello " + routingKey[i % 3] + ">>> " + i);
        }
        System.out.println("-------over---------");

        Thread.sleep(1000 * 60 * 10);
    }
}
```

执行之后，就可以看到正常的消费了


### 5. 扩充与小结

看完之后，可能有一个问题，为什么要这样做，好处是什么？


大部分的时候，从MQ获取消息的逻辑都一样，唯一的区别在于获取到数据之后做的业务而言，如果把这一块完全的抽象出来，通过配置的方式，那么额外的新增mq的消费，就不需要再改消费端的代码了，然后就会有一个疑问，上面的配置文件中，生成dynamicConsumer的bean不也是需要额外写么？

如果将配置信息，以某种数组的方式定义，遍历读取这些配置，然后创建多个DynamicConsuer实例，是否就能支持动态扩展呢？

将配置改成下面的进行尝试

```java
@Configuration
@PropertySource("classpath:dynamicConfig.properties")
public class DynSpringConfig {

    @Autowired
    private Environment environment;

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost(environment.getProperty("dyn.mq.host"));
        factory.setPort(Integer.parseInt(environment.getProperty("dyn.mq.port")));
        factory.setUsername(environment.getProperty("dyn.mq.uname"));
        factory.setPassword(environment.getProperty("dyn.mq.pwd"));
        factory.setVirtualHost(environment.getProperty("dyn.mq.vhost"));
        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public AmqpProducer amqpProducer() {
        return new AmqpProducer();
    }


    @Autowired
    private ConnectionFactory connectionFactory;

    @PostConstruct
    public void dynamicConsumer()
            throws Exception {
        RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
        MQContainerFactory fac = MQContainerFactory.builder().directExchange(environment.getProperty("dyn.mq.exchange"))
                .queue(environment.getProperty("dyn.mq.queue"))
                .autoDeleted(Boolean.parseBoolean(environment.getProperty("dyn.mq.autoDeleted")))
                .autoAck(Boolean.parseBoolean(environment.getProperty("dyn.mq.autoAck")))
                .durable(Boolean.parseBoolean(environment.getProperty("dyn.mq.durable")))
                .routingKey(environment.getProperty("dyn.mq.routingKey")).rabbitAdmin(rabbitAdmin)
                .connectionFactory(connectionFactory).build();

        new DynamicConsumer(fac);
    }
}
```

注意之前 `dynamicConsumer` 是bean的创建，改成了初始化一个实例，如果配置文件是数组，内部用一个遍历就可以全部加载，现在就需要验证上面的配置改动之后，是否依然可以消费数据


实测ok，部分输出如下

```sh
-------over---------
DynamicConsumer: dyn.queue | >>> hello fac-routing>>> 1
DynamicConsumer: dyn.queue | >>> hello fac-routing>>> 4
DynamicConsumer: dyn.queue | >>> hello fac-routing>>> 7
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
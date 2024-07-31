---
order: 7
title: RabbitMQ基础教程之Spring&JavaConfig&FactoryBean使用姿势
tag:
  - RabbitMQ
  - Spring
category:
  - 开源
  - RabbitMQ
date: 2018-06-04 21:10:33
---

# RabbitMQ基础教程之Spring使用篇

相关博文，推荐查看:

1. [RabbitMq基础教程之安装与测试](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/)
2. [RabbitMq基础教程之基本概念](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)
3. [RabbitMQ基础教程之基本使用篇](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E7%AF%87/)
4. [RabbitMQ基础教程之使用进阶篇](https://liuyueyi.github.io/hexblog/2018/05/29/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E4%BD%BF%E7%94%A8%E8%BF%9B%E9%98%B6%E7%AF%87/)
5. [RabbitMQ基础教程之Spring&JavaConfig使用篇](https://blog.hhui.top/hexblog/2018/05/31/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8BSpring-JavaConfig%E4%BD%BF%E7%94%A8%E7%AF%87/)

在前面的一篇演示了如何使用Spring来进行RabbitMQ的消息投递和消费，虽然可以实现基本的需求场景，但是使用起来却并不是特别顺手，首先是不同的消费者，得添加好多不同的配置项，加上有较多的配置（QueueName, ExchangeName, RoutingKey, autoAck...)

那么有没有可能借助工厂方式，来简化消费者这边的大多数配置呢？

<!--more-->

## I. 工厂类定义消费者信息

目标比较清晰了，我们希望有一个工厂类，可以承载所有的关心的配置信息，然后在实际使用的地方，通过这个工厂类生成一个Consumer即可

### 1. 消费接口定义

首先需要定义一个公共的消费者接口，主要用来接收并处理消息

```java
public interface IMqConsumer extends ChannelAwareMessageListener {

    void setContainer(SimpleMessageListenerContainer container);

    default void shutdown() {}

}
```

对于`ChannelAwareMessageListener`前面就以及用到，当有消息后，触发的监听器，这里我们增加了两个方法，其实主要就是干一件事情，优雅的关闭消费

当应用需要停止或者重启时，我们希望先优雅的关闭消息消费，那么就会用到 `org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer#stop()` 

因此针对这个功能，可以实现一个公共的抽象类

```java
public abstract class AbsMQConsumer implements IMqConsumer {
    private volatile boolean end = false;
    private SimpleMessageListenerContainer container;
    private boolean autoAck;

    public void setContainer(SimpleMessageListenerContainer container) {
        this.container = container;
        autoAck = container.getAcknowledgeMode().isAutoAck();
    }

    public void shutdown() {
        end = true;
    }

    protected void autoAck(Message message, Channel channel, boolean success) throws IOException {
        if (autoAck) {
            return;
        }

        if (success) {
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } else {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }

    public void onMessage(Message message, Channel channel) throws Exception {
        try {
            autoAck(message, channel, process(message, channel));
        } catch (Exception e) {
            autoAck(message, channel, false);
            throw e;
        } finally {
            if (end) {
                container.stop();
            }
        }
    }

    public abstract boolean process(Message message, Channel channel);
}
```

上面的实现中，前面两个方法比较清晰，没有什么二意，需要关注的是`onMessage`方法的实现，我们默认封装了ack的逻辑，设计思路如下：

- 当开启了手动ack之后，要求实际消费方实现 `process` 方法，并返回boolean，表示是否消费成功
  - 消费成功，则ack
  - 消费失败，则将消息重新丢回到队列
- 若开启自动ack，则不需要关注
- 每次消费一条消息之后，需要关注下是否关闭这个状态，从而实现mq的停止消费


所以每个实际消费者，实现这个抽象类的 `process` 方法即可，在内部实现自己的消息消费逻辑

### 2. 工厂类

前面主要定义了消费的实体可以怎么玩，接下来就是重头戏了，如何声明队列，如何绑定交换器等，如何注册消息监听器（即上面的Consumer)？

根据前面的实现，我们需要关注的几个参数依然是下面几个:

```java
private String exchange;

private String queue;
private String routingKey;


private Boolean autoDeleted;
private Boolean durable;
private Boolean autoAck;

private ConnectionFactory connectionFactory;
private RabbitAdmin rabbitAdmin;
```

我们最终的目标就是给每个Consumer创建一个`SimpleMessageListenerContainer`的Bean交给Spring来托管，所以可以利用Spring的FactoryBean来实现

```java
@Data
@Builder
public class MQContainerFactory implements FactoryBean<SimpleMessageListenerContainer> {
    private ExchangeType exchangeType;

    private String directExchange;
    private String topicExchange;
    private String fanoutExchange;

    private String queue;
    private String routingKey;


    private Boolean autoDeleted;
    private Boolean durable;
    private Boolean autoAck;

    // 并发数
    private Integer concurrentNum;

    private ConnectionFactory connectionFactory;
    private RabbitAdmin rabbitAdmin;


    // 消费方
    private IMqConsumer consumer;


    private Exchange buildExchange() {
        if (directExchange != null) {
            exchangeType = ExchangeType.DIRECT;
            return new DirectExchange(directExchange);
        } else if (topicExchange != null) {
            exchangeType = ExchangeType.TOPIC;
            return new TopicExchange(topicExchange);
        } else if (fanoutExchange != null) {
            exchangeType = ExchangeType.FANOUT;
            return new FanoutExchange(fanoutExchange);
        } else {
            if (StringUtils.isEmpty(routingKey)) {
                throw new IllegalArgumentException("defaultExchange's routingKey should not be null!");
            }
            exchangeType = ExchangeType.DEFAULT;
            return new DirectExchange("");
        }
    }


    private Queue buildQueue() {
        if (StringUtils.isEmpty(queue)) {
            throw new IllegalArgumentException("queue name should not be null!");
        }

        return new Queue(queue, durable == null ? false : durable, false, autoDeleted == null ? true : autoDeleted);
    }


    private Binding bind(Queue queue, Exchange exchange) {
        return exchangeType.binding(queue, exchange, routingKey);
    }


    private void check() {
        if (rabbitAdmin == null || connectionFactory == null) {
            throw new IllegalArgumentException("rabbitAdmin and connectionFactory should not be null!");
        }

        if (consumer == null) {
            throw new IllegalArgumentException("rabbit msg consumer should not be null!");
        }
    }


    @Override
    public SimpleMessageListenerContainer getObject() throws Exception {
        check();

        Queue queue = buildQueue();
        Exchange exchange = buildExchange();
        Binding binding = bind(queue, exchange);

        rabbitAdmin.declareQueue(queue);
        rabbitAdmin.declareExchange(exchange);
        rabbitAdmin.declareBinding(binding);


        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setRabbitAdmin(rabbitAdmin);
        container.setConnectionFactory(connectionFactory);
        container.setQueues(queue);
        container.setPrefetchCount(20);
        // 这里表示支持Consumer并发消费
        container.setConcurrentConsumers(concurrentNum == null ? 1 : concurrentNum);
        container.setAcknowledgeMode(autoAck ? AcknowledgeMode.AUTO : AcknowledgeMode.MANUAL);
        container.setMessageListener(consumer);


        consumer.setContainer(container);
        return container;
    }

    @Override
    public Class<?> getObjectType() {
        return SimpleMessageListenerContainer.class;
    }
}
```

具体的实现代码如上，接下来进行分块分析，首先是Exchange, 我们直到常用的有三种 Exchange：

- DirectExchange
- TopicExchange
- FanoutExchange

因此，我们自定义了一个枚举，来实现不同的Exchange的绑定姿势，注意下面的实现姿势，利用了抽象类的思路

```java
public enum ExchangeType {
    DIRECT {
        @Override
        public Binding binding(Queue queue, Exchange exchange, String routingKey) {
            return BindingBuilder.bind(queue).to((DirectExchange) exchange).with(routingKey);
        }
    }, TOPIC {
        @Override
        public Binding binding(Queue queue, Exchange exchange, String routingKey) {
            return BindingBuilder.bind(queue).to((TopicExchange) exchange).with(routingKey);
        }
    }, FANOUT {
        @Override
        public Binding binding(Queue queue, Exchange exchange, String routingKey) {
            return BindingBuilder.bind(queue).to((FanoutExchange) exchange);
        }
    }, DEFAULT {
        @Override
        public Binding binding(Queue queue, Exchange exchange, String routingKey) {
            // 对于Default而言，只能讲消息路由到名完全一直的queue上
            return BindingBuilder.bind(queue).to((DirectExchange) exchange).with(queue.getName());
        }
    };

    public abstract Binding binding(Queue queue, Exchange exchange, String routingKey);
}
```

剩下的就是 `com.git.hui.rabbit.spring.component.MQContainerFactory#getObject` 的逻辑了，基本上和前面的思路一样

- 定义queue
- 定义exchange
- 创建绑定
- 创建`SimpleMessageListenerContainer`，设置各种参数


### 3. 配置类

不可避免的需要一些配置，如何RabbitMQ的连接工厂，RabbitAmdin，这些是可以作为多个Consumer的公共Bean来使用的，因此就放在了配置类中

```java
@Configuration
public class FacSpringConfig {

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

## II. 测试验证

从代码实现角度来看，就几个类，还是比较简单的，接下来就看实际使用的姿势，是不是变简单了

新建一个消费类

```java
public class FacMQConsumer extends AbsMQConsumer {
    @Override
    public boolean process(Message message, Channel channel) {
        String data = new String(message.getBody());
        System.out.println(" fac mq consumer: " + data);
        return true;
    }
}
```

然后定义这个消费类的配置信息，主要是两个Bean的定义，一个是定义上面的FactoryBean，内部通过Builder模式设置了各种参数（借助lombok实现)；另外一个就是获取`SimpleMessageListenerContainer`容器了

```java
@Bean
public MQContainerFactory mqContainerFactory(ConnectionFactory connectionFactory, RabbitAdmin rabbitAdmin) {
    return MQContainerFactory.builder().queue("fac.direct").directExchange("fac.direct.exchange").durable(true)
            .autoDeleted(false).autoAck(false).connectionFactory(connectionFactory).rabbitAdmin(rabbitAdmin)
            .routingKey("fac-routing").consumer(new FacMQConsumer()).build();
}

@Bean
public SimpleMessageListenerContainer facContainer(ConnectionFactory connectionFactory, RabbitAdmin rabbitAdmin)
        throws Exception {
    MQContainerFactory fac = mqContainerFactory(connectionFactory, rabbitAdmin);
    return fac.getObject();
}
```

对应的测试类可以如下实现

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = FacSpringConfig.class)
public class FactoryComponentUnit {

    @Autowired
    private AmqpProducer amqpProducer;

    @Test
    public void testDirectConsumer() throws InterruptedException {
        String[] routingKey = new String[]{"hello.world", "fac-routing", "test1"};
        for (int i = 0; i < 10; i++) {
            amqpProducer.publishMsg("fac.direct.exchange", routingKey[i % 3],
                    ">>> hello " + routingKey[i % 3] + ">>> " + i);
        }
        System.out.println("-------over---------");

        Thread.sleep(1000 * 60 * 10);
    }
}
```

然后就可以愉快的玩耍了

## III. 其他

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
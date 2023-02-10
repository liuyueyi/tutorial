---
order: 3
title: 3.发送消息基本使用姿势
tag: 
  - RabbitMq
category: 
  - SpringBoot
  - MQ系列
  - RabbitMq
date: 2020-02-18 11:11:57
keywords: RabbitTemplate MessageConverter SpringBoot RabbitMq
---

前面两篇博文，分别介绍了RabbitMq的核心知识点，以及整合SpringBoot的demo应用；接下来也该进入正题，看一下SpringBoot的环境下，如何玩转rabbitmq

本篇内容主要为消息发送，包括以下几点

- `RabbitTemplate` 发送消息的基本使用姿势
- 自定义消息基本属性
- 自定义消息转换器`AbstractMessageConverter`
- 发送Object类型消息失败的case

<!-- more -->

## I. 基本使用姿势

### 1. 配置

我们借助`SpringBoot 2.2.1.RELEASE` + `rabbitmq 3.7.5`来完整项目搭建与测试

项目pom.xml如下

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

配置文件`application.yml`内容如下

```yml
spring:
  rabbitmq:
    virtual-host: /
    username: admin
    password: admin
    port: 5672
    host: 127.0.0.1
```

### 2. 配置类

通过前面rabbitmq的知识点学习，我们可以知道发送端的主要逻辑 “将消息发送给exchange，然后根据不同的策略分发给对应的queue”

本篇博文主要讨论的是消息发送，为了后续的实例演示，我们定义一个topic模式的exchange，并绑定一个的queue；（因为对发送端而言，不同的exchange类型，对发送端的使用姿势影响并不大，有影响的是消费者）

```java
public class MqConstants {

    public static final String exchange = "topic.e";

    public static final String routing = "r";

    public final static String queue = "topic.a";

}

@Configuration
public class MqConfig {
    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(MqConstants.exchange);
    }

    @Bean
    public Queue queue() {
        // 创建一个持久化的队列
        return new Queue(MqConstants.queue, true);
    }

    @Bean
    public Binding binding(TopicExchange topicExchange, Queue queue) {
        return BindingBuilder.bind(queue).to(topicExchange).with(MqConstants.routing);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        return new RabbitTemplate(connectionFactory);
    }
}
```

### 3. 消息发送

消息发送，主要借助的是`RabbitTemplate#convertAndSend`方法来实现，通常情况下，我们直接使用即可

```java
@Service
public class BasicPublisher {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    /**
     * 一般的用法，推送消息
     *
     * @param ans
     * @return
     */
    private String publish2mq1(String ans) {
        String msg = "Durable msg = " + ans;
        System.out.println("publish: " + msg);
        rabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg);
        return msg;
    }
}
```

上面的核心点就一行`rabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg);`

- 表示将msg发送给指定的exchange，并设置消息的路由键

**请注意**

通过上面的方式，发送的消息默认是持久化的，当持久化的消息，分发到持久化的队列时，会有消息的落盘操作；

在某些场景下，我们对消息的完整性要求并没有那么严格，反而更在意mq的性能，丢失一些数据也可以接受；这个时候我们可能需要定制一下发送的消息属性（比如将消息设置为非持久化的）

下面提供两种姿势，推荐第二种

```java
/**
 * 推送一个非持久化的消息，这个消息推送到持久化的队列时，mq重启，这个消息会丢失；上面的持久化消息不会丢失
 *
 * @param ans
 * @return
 */
private String publish2mq2(String ans) {
    MessageProperties properties = new MessageProperties();
    properties.setDeliveryMode(MessageDeliveryMode.NON_PERSISTENT);
    Message message = rabbitTemplate.getMessageConverter().toMessage("NonDurable = " + ans, properties);

    rabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, message);

    System.out.println("publish: " + message);
    return message.toString();
}


private String publish2mq3(String ans) {
    String msg = "Define msg = " + ans;
    rabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg, new MessagePostProcessor() {
        @Override
        public Message postProcessMessage(Message message) throws AmqpException {
            message.getMessageProperties().setHeader("ta", "测试");
            message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.NON_PERSISTENT);
            return message;
        }
    });

    return msg;
}
```

![](/imgs/200218/00.jpg)

**注意**

- 在实际的项目开发中，推荐使用`MessagePostProcessor`来定制消息属性
- 其次不推荐在每次发送消息时都创建一个`MessagePostProcessor`对象，请定义一个通用的对象，能复用就复用

### 4. 非序列化对象发送异常case

通过查看`rabbitTemplate#convertAndSend`的接口定义，我们知道发送的消息可以是Object类型，那么是不是意味着任何对象，都可以推送给mq呢？

下面是一个测试case

```java
private String publish2mq4(String ans) {
    NonSerDO nonSerDO = new NonSerDO(18, ans);
    System.out.println("publish: " + nonSerDO);
    rabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, nonSerDO);
    return nonSerDO.toString();
}


@Data
public static class NonSerDO {
    private Integer age;
    private String name;

    public NonSerDO(int age, String name) {
        this.age = age;
        this.name = name;
    }
}
```

当我们调用上面的`publish2mq4`方法时，并不会是想象中的直接成功，相反抛出一个参数类型异常

![](/imgs/200218/01.jpg)

为什么会出现这个问题呢？从堆栈分析，我们知道RabbitTemplate默认是利用`SimpleMessageConverter`来实现封装Message逻辑的，核心代码为

```java
// 下面代码来自 org.springframework.amqp.support.converter.SimpleMessageConverter#createMessage
@Override
protected Message createMessage(Object object, MessageProperties messageProperties) throws MessageConversionException {
	byte[] bytes = null;
	if (object instanceof byte[]) {
		bytes = (byte[]) object;
		messageProperties.setContentType(MessageProperties.CONTENT_TYPE_BYTES);
	}
	else if (object instanceof String) {
		try {
			bytes = ((String) object).getBytes(this.defaultCharset);
		}
		catch (UnsupportedEncodingException e) {
			throw new MessageConversionException(
					"failed to convert to Message content", e);
		}
		messageProperties.setContentType(MessageProperties.CONTENT_TYPE_TEXT_PLAIN);
		messageProperties.setContentEncoding(this.defaultCharset);
	}
	else if (object instanceof Serializable) {
		try {
			bytes = SerializationUtils.serialize(object);
		}
		catch (IllegalArgumentException e) {
			throw new MessageConversionException(
					"failed to convert to serialized Message content", e);
		}
		messageProperties.setContentType(MessageProperties.CONTENT_TYPE_SERIALIZED_OBJECT);
	}
	if (bytes != null) {
		messageProperties.setContentLength(bytes.length);
		return new Message(bytes, messageProperties);
	}
	throw new IllegalArgumentException(getClass().getSimpleName()
			+ " only supports String, byte[] and Serializable payloads, received: " + object.getClass().getName());
}
```

上面逻辑很明确的指出了，**只接受byte数组，string字符串，可序列化对象（这里使用的是jdk的序列化方式来实现对象和byte数组之间的互转）**

- 所以我们传递一个非序列化的对象会参数非法的异常

自然而然的，我们会想有没有其他的`MessageConverter`来友好的支持任何类型的对象

### 5. 自定义MessageConverter

接下来我们希望通过自定义一个json序列化方式的MessageConverter来解决上面的问题

一个比较简单的实现（利用FastJson来实现序列化/反序列化）

```java
public static class SelfConverter extends AbstractMessageConverter {
    @Override
    protected Message createMessage(Object object, MessageProperties messageProperties) {
        messageProperties.setContentType("application/json");
        return new Message(JSON.toJSONBytes(object), messageProperties);
    }

    @Override
    public Object fromMessage(Message message) throws MessageConversionException {
        return JSON.parse(message.getBody());
    }
}
```

重新定义一个`rabbitTemplate`，并设置它的消息转换器为自定义的`SelfConverter`

```java
@Bean
public RabbitTemplate jsonRabbitTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(new SelfConverter());
    return rabbitTemplate;
}
```

然后再次测试一下

```java
@Service
public class JsonPublisher {
    @Autowired
    private RabbitTemplate jsonRabbitTemplate;
      
    private String publish1(String ans) {
        Map<String, Object> msg = new HashMap<>(8);
        msg.put("msg", ans);
        msg.put("type", "json");
        msg.put("version", 123);
        System.out.println("publish: " + msg);
        jsonRabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg);
        return msg.toString();
    }

    private String publish2(String ans) {
        BasicPublisher.NonSerDO nonSerDO = new BasicPublisher.NonSerDO(18, "SELF_JSON" + ans);
        System.out.println("publish: " + nonSerDO);
        jsonRabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, nonSerDO);
        return nonSerDO.toString();
    }
}
```

mq内接收到的推送消息如下

![](/imgs/200218/02.jpg)

### 6. Jackson2JsonMessageConverter

上面虽然实现了Json格式的消息转换，但是比较简陋；而且这么基础通用的功能，按照Spring全家桶的一贯作风，肯定是有现成可用的，没错，这就是`Jackson2JsonMessageConverter`

所以我们的使用姿势也可以如下

```java
//定义RabbitTemplate
@Bean
public RabbitTemplate jacksonRabbitTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(new Jackson2JsonMessageConverter());
    return rabbitTemplate;
}


// 测试代码
@Autowired
private RabbitTemplate jacksonRabbitTemplate;
private String publish3(String ans) {
    Map<String, Object> msg = new HashMap<>(8);
    msg.put("msg", ans);
    msg.put("type", "jackson");
    msg.put("version", 456);
    System.out.println("publish: " + msg);
    jacksonRabbitTemplate.convertAndSend(MqConstants.exchange, MqConstants.routing, msg);
    return msg.toString();
}
```

下面是通过Jackson序列化消息后的内容，与我们自定义的有一些不同，多了`headers`和`content_encoding`

![](/imgs/200218/03.jpg)

### 7. 小结

本篇博文主要的知识点如下

- 通过`RabbitTemplate#convertAndSend`来实现消息分发
- 通过`MessagePostProcessor`来自定义消息的属性（请注意默认投递的消息时持久化的）
- 默认的消息封装类为`SimpleMessageConverter`，只支持分发byte数组，字符串和可序列化的对象；不满足上面三个条件的方法调用会抛异常
- 我们可以通过实现`MessageConverter`接口，来定义自己的消息封装类，解决上面的问题

在RabbitMq的知识点博文中，明确提到了，为了确保消息被brocker正确接收，提供了消息确认机制和事务机制两种case，那么如果需要使用这两种方式，消息生产者需要怎么做呢？

限于篇幅，下一篇博文将带来在消息确认机制/事务机制下的发送消息使用姿势

## II. 其他

### 0. 系列博文&项目源码

**系列博文**

- [【MQ系列】springboot + rabbitmq初体验](http://spring.hhui.top/spring-blog/2020/02/10/200210-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E5%88%9D%E4%BD%93%E9%AA%8C/)
- [【MQ系列】RabbitMq核心知识点小结](http://spring.hhui.top/spring-blog/2020/02/12/200212-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BRabbitMq%E6%A0%B8%E5%BF%83%E7%9F%A5%E8%AF%86%E7%82%B9%E5%B0%8F%E7%BB%93/)

**项目源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/301-rabbitmq-publish](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/301-rabbitmq-publish)


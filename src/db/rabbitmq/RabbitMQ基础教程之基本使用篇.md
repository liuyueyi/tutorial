---
order: 3
title: RabbitMQ基础教程之基本使用篇
tag:
  - RabbitMQ
category:
  - 开源
  - RabbitMQ
date: 2018-05-27 22:16:11
---

# RabbitMQ基础教程之基本使用篇

最近因为工作原因使用到RabbitMQ，之前也接触过其他的mq消息中间件，从实际使用感觉来看，却不太一样，正好趁着周末，可以好好看一下RabbitMQ的相关知识点；希望可以通过一些学习，可以搞清楚以下几点

- 基础环境搭建
- 可以怎么使用
- 实现原理是怎样的
- 实际工程中的使用（比如结合SpringBoot可以怎么玩）

<!-- more -->

相关博文，欢迎查看：

- [《RabbitMq基础教程之安装与测试》](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/)
- [《RabbitMq基础教程之基本概念》](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)


## I. 前提准备

在开始之前，先得搭建基本的环境，因为个人主要是mac进行的开发，所有写了一篇mac上如何安装rabbitmq的教程，可以通过 [《mac下安装和测试rabbitmq》](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/) 查看


### 1. Centos安装过程

下面简单说一下Linux系统下，可以如何安装

Centos 系统：

```sh
# 安装erlang
rpm -Uvh http://download.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-8.noarch.rpm
yum install erlang

# 安装RabbitMQ
wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.6.6/rabbitmq-server-3.6.6-1.el7.noarch.rpm
yum install rabbitmq-server-3.6.6-1.el7.noarch.rpm
```

启动和查看的命令

```sh
# 完成后启动服务：
service rabbitmq-server start
# 可以查看服务状态：
service rabbitmq-server status
```


### 2. 注意

- 安装完毕之后，可以开启控制台，主要就是 `rabbitmq-plugins enable rabbitmq_management`, 默认的端口号为15672
- 默认分配的用户/密码为: guest/guest， 只允许本地访问；如果跨应用读写数据时，请添加账号和设置对应的权限（推荐参考上面mac安装的博文，里面有介绍）


## II. 基本使用篇

直接使用amqp-client客户端做基本的数据读写，先不考虑Spring容器的场景，我们可以怎样进行塞数据，然后又怎样可以从里面获取数据；

在实际使用之前，有必要了解一下RabbitMQ的几个基本概念，即什么是Queue,Exchange,Binding，关于这些基本概念，可以参考博文：

- [《RabbitMq基础教程之基本概念》](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)

### 1. 基本使用姿势

首先是建立连接，一般需要设置服务器的IP，端口号，用户名密码之类的，公共代码如下

```java
public class RabbitUtil {

    public static ConnectionFactory getConnectionFactory() {
        //创建连接工程，下面给出的是默认的case
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("127.0.0.1");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin");
        factory.setVirtualHost("/");
        return factory;
    }
}
```

#### a. 生产者

要使用，基本的就需要一个消息投递和一个消息消费两方，线看消息生产者的一般写法

```java
public class MsgProducer {
    public static void publishMsg(String exchange, BuiltinExchangeType exchangeType, String toutingKey, String message)
            throws IOException, TimeoutException {
        ConnectionFactory factory = RabbitUtil.getConnectionFactory();

        //创建连接
        Connection connection = factory.newConnection();

        //创建消息通道
        Channel channel = connection.createChannel();

        // 声明exchange中的消息为可持久化，不自动删除
        channel.exchangeDeclare(exchange, exchangeType, true, false, null);

        // 发布消息
        channel.basicPublish(exchange, toutingKey, null, message.getBytes());

        channel.close();
        connection.close();
    }
}
```

针对上面的代码，结合RabbitMQ的基本概念进行分析

![基本结构](https://s3.mogucdn.com/mlcdn/c45406/180527_7bdj5djf0ae798la210a9ila83874_927x265.jpg)

- 不管是干啥，第一步都是获取连接，也就是上面的Connection
- 从[《RabbitMq基础教程之基本概念》](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)直到，生产者消费者都是借助Channel与Exchange或者Queue打交道，接下来就是通过Connection创建数据流通信道Channel
- Channel准备完毕之后，生产者就可以向其中投递数据
- 投递完毕之后，回收现场资源

**疑问：**

- 在声明Exchange时，是否就需要选择消息绑定策略？
- 不声明时，默认是什么策略？

#### b. 消费者

结合上面的代码和分析，大胆的预测下消费者的流程

- 获取连接Connection
- 创建Channel
- 将Channel与Queue进行绑定
- 创建一个Consumer，从Queue中获取数据
- 消息消费之后，ack

下面给出一个mq推数据的消费过程

```java
public class MsgConsumer {

    public static void consumerMsg(String exchange, String queue, String routingKey)
            throws IOException, TimeoutException {
        ConnectionFactory factory = RabbitUtil.getConnectionFactory();
        //创建连接
        Connection connection = factory.newConnection();

        //创建消息信道
        final Channel channel = connection.createChannel();

        //消息队列
        channel.queueDeclare(queue, true, false, false, null);
        //绑定队列到交换机
        channel.queueBind(queue, exchange, routingKey);
        System.out.println("[*] Waiting for message. To exist press CTRL+C");

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties,
                    byte[] body) throws IOException {
                String message = new String(body, "UTF-8");

                try {
                    System.out.println(" [x] Received '" + message);
                } finally {
                    System.out.println(" [x] Done");
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            }
        };

        // 取消自动ack
        channel.basicConsume(queue, false, consumer);
    }
}
```

### 2. Direct方式

#### a. Producer

直接在前面的基础上进行测试，我们定义一个新的exchange名为`direct.exchange`，并且制定ExchangeType为直接路由方式 （先不管这种写法的合理性）

```java
public class DirectProducer {
    private static final String EXCHANGE_NAME = "direct.exchange";

    public void publishMsg(String routingKey, String msg) {
        try {
            MsgProducer.publishMsg(EXCHANGE_NAME, BuiltinExchangeType.DIRECT, routingKey, msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    public static void main(String[] args) {
        DirectProducer directProducer = new DirectProducer();
        String[] routingKey = new String[]{"aaa", "bbb"};
        String msg = "hello >>> ";


        for (int i = 0; i < 30; i++) {
            directProducer.publishMsg(routingKey[i % 2], msg + i);
        }
        System.out.println("----over-------");
    }
}
```

上面的代码执行一遍之后，看控制台会发现新增了一个Exchange

![exchange](https://s3.mogucdn.com/mlcdn/c45406/180527_63jeb3gde7blekh0h339hh15j6g3c_776x553.jpg)


#### b. consumer

同样的我们写一下对应的消费者，一个用来消费aaa,一个消费bbb

```java
public class DirectConsumer {

    private static final String exchangeName = "direct.exchange";

    public void msgConsumer(String queueName, String routingKey) {
        try {
            MsgConsumer.consumerMsg(exchangeName, queueName, routingKey);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (TimeoutException e) {
            e.printStackTrace();
        }
    }


    public static void main(String[] args) throws InterruptedException {
        DirectConsumer consumer = new DirectConsumer();
        String[] routingKey = new String[]{"aaa", "bbb"};
        String[] queueNames = new String[]{"qa", "qb"};


        for (int i = 0; i < 2; i++) {
            consumer.msgConsumer(queueNames[i], routingKey[i]);
        }

        Thread.sleep(1000 * 60 * 10);
    }
}
```

执行上面的代码之后，就会多两个Queue，且增加了Exchange到Queue的绑定

![binding](https://s3.mogucdn.com/mlcdn/c45406/180527_380i3biee3hb952000b5likjg2dcg_822x546.jpg)

![queue](https://s3.mogucdn.com/mlcdn/c45406/180527_21e9cgd5cb89hc5el0k7139ke884e_857x132.jpg)

当上面两个代码配合起来使用时，就可以看到对于消费者而言，qa一直消费的是偶数，qb一直消费的是奇数，一次输出如下:

```sh
[qa] Waiting for message. To exist press CTRL+C
[qb] Waiting for message. To exist press CTRL+C
 [qa] Received 'hello >>> 0
 [qb] Received 'hello >>> 1
 [qa] Received 'hello >>> 2
 [qb] Received 'hello >>> 3
 [qa] Received 'hello >>> 4
...
```

### 3. Fanout方式

有了上面的case之后，这个的实现和测试就比较简单了

#### a. Producer

```java
public class FanoutProducer {
    private static final String EXCHANGE_NAME = "fanout.exchange";

    public void publishMsg(String routingKey, String msg) {
        try {
            MsgProducer.publishMsg(EXCHANGE_NAME, BuiltinExchangeType.FANOUT, routingKey, msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        FanoutProducer directProducer = new FanoutProducer();
        String[] routingKey = new String[]{"aaa", "bbb"};
        String msg = "hello >>> ";


        for (int i = 0; i < 30; i++) {
            directProducer.publishMsg(routingKey[i % 2], msg + i);
        }
        System.out.println("----over-------");
    }
}
```

#### b. consumer 

```java
public class FanoutProducer {
    private static final String EXCHANGE_NAME = "fanout.exchange";

    public void publishMsg(String routingKey, String msg) {
        try {
            MsgProducer.publishMsg(EXCHANGE_NAME, BuiltinExchangeType.FANOUT, routingKey, msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        FanoutProducer directProducer = new FanoutProducer();
        String[] routingKey = new String[]{"aaa", "bbb"};
        String msg = "hello >>> ";


        for (int i = 0; i < 30; i++) {
            directProducer.publishMsg(routingKey[i % 2], msg + i);
        }
        System.out.println("----over-------");
    }
}
```

这个的输出就比较有意思了，fa,fb两个队列都可以接收到发布的消息，而且单独的执行一次上面的投递数据之后，发现fa/fb两个队列的数据都是30条

![30](https://s11.mogucdn.com/mlcdn/c45406/180527_4jilj697dgfhf7fdca91a688a4gck_859x197.jpg)

然后消费的结果如下

```sh
[qa] Waiting for message. To exist press CTRL+C
[qb] Waiting for message. To exist press CTRL+C
 [qa] Received 'hello >>> 0
 [qb] Received 'hello >>> 0
 [qa] Received 'hello >>> 1
 [qb] Received 'hello >>> 1
 [qb] Received 'hello >>> 2
 [qa] Received 'hello >>> 2
 [qa] Received 'hello >>> 3
 [qb] Received 'hello >>> 3
 [qb] Received 'hello >>> 4
 [qa] Received 'hello >>> 4
 ...
```

### 4. Topic方式

代码和上面差不多，就不重复拷贝了，接下来卡另外几个问题


## III. 基础进阶

在上面的基础使用中，会有几个疑问如下：

- Exchange声明的问题（是否必须声明，如果不声明会怎样）
- Exchange声明的几个参数（durable, autoDelete)有啥区别
- 当没有队列和Exchange绑定时，直接往队列中塞数据，好像不会有数据增加（即先塞数据，然后创建queue，建立绑定，从控制台上看这个queue里面也不会有数据）
- 消息消费的两种姿势（一个主动去拿数据，一个是rabbit推数据）对比
- ack/nack怎么用，nack之后消息可以怎么处理

以上内容，留待下一篇进行讲解



## IV. 其他

### 1. 相关博文

- [《RabbitMq基础教程之安装与测试》](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/)
- [《RabbitMq基础教程之基本概念》](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)



### 2. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 3. 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 4. 扫描关注

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

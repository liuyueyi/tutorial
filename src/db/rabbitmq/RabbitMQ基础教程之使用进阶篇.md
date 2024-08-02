---
order: 5
title: 5. 使用进阶篇
tag:
  - RabbitMQ
category:
  - 开源
  - RabbitMQ
date: 2018-05-29 22:12:42
---

# RabbitMQ基础教程之使用进阶篇

相关博文，推荐查看:

1. [RabbitMq基础教程之安装与测试](https://liuyueyi.github.io/hexblog/2018/05/24/RabbitMq%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%AE%89%E8%A3%85%E4%B8%8E%E6%B5%8B%E8%AF%95/)
2. [RabbitMq基础教程之基本概念](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)
3. [RabbitMQ基础教程之基本使用篇](https://liuyueyi.github.io/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E7%AF%87/)

## I. 背景

前一篇基本使用篇的博文中，介绍了rabbitmq的三种使用姿势，可以知道如何向RabbitMQ发送消息以及如何消费，但遗留下几个疑问，本篇则主要希望弄清楚这几点

- Exchange声明的问题（是否必须声明，如果不声明会怎样）
- Exchange声明的几个参数（durable, autoDelete)有啥区别
- 当没有队列和Exchange绑定时，直接往队列中塞数据，好像不会有数据增加（即先塞数据，然后创建queue，建立绑定，从控制台上看这个queue里面也不会有数据）
- 消息消费的两种姿势（一个主动去拿数据，一个是rabbit推数据）对比

<!--more-->

## II. 基本进阶篇

### 1. Exchange默认场景

将前面的消息发送代码捞出来，干掉Exchange的声明，如下

```java
public class DefaultProducer {
    public static void publishMsg(String queue, String message) throws IOException, TimeoutException {
        ConnectionFactory factory = RabbitUtil.getConnectionFactory();

        //创建连接
        Connection connection = factory.newConnection();

        //创建消息通道
        Channel channel = connection.createChannel();
        channel.queueDeclare(queue, true, false, true, null);

        // 发布消息
        channel.basicPublish("", queue, null, message.getBytes());

        channel.close();
        connection.close();
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        for (int i = 0; i < 20; i++) {
            publishMsg("hello", "msg" + i);
        }
    }
}
```

在发布消息时，传入的Exchange名为“”，再到控制台查看，发现数据被投递到了(AMQP default)这个交换器，对应的截图如下

![image](https://s3.mogucdn.com/mlcdn/c45406/180529_7ldfg754d4hkll48hieif795215c0_1258x554.jpg)

看一下上面的绑定描述内容，重点如下

- 默认交换器选择Direct策略
- 将rountingKey绑定到同名的queue上
- 不支持显示的绑定和解绑


上面的代码为了演示数据的流向，在发布消息的同时也定义了一个同名的Queue，因此可以在控制台上看到同名的 "hello" queue，且内部有20条数据

当我们去掉queue的声明时，会发现另一个问题，投入的数据好像并没有存下来（因为没有queue来接收这些数据，而之后再声明queue时，之前的数据也不会分配过来）

### 2. 绑定之后才有数据

首先是将控制台中的hello这个queue删掉，然后再次执行下面的代码(相对于前面的就是注释了queue的声明）

```java
public class DefaultProducer {
    public static void publishMsg(String queue, String message) throws IOException, TimeoutException {
        ConnectionFactory factory = RabbitUtil.getConnectionFactory();

        //创建连接
        Connection connection = factory.newConnection();

        //创建消息通道
        Channel channel = connection.createChannel();
        //        channel.queueDeclare(queue, true, false, true, null);

        // 发布消息
        channel.basicPublish("", queue, null, message.getBytes());

        channel.close();
        connection.close();
    }

    public static void main(String[] args) throws IOException, TimeoutException {
        for (int i = 0; i < 20; i++) {
            publishMsg("hello", "msg" + i);
        }
    }
}
```

然后从控制台上看，可以看到有数据写入Exchange，但是没有queue来接收这些数据

![IMAGE](https://s3.mogucdn.com/mlcdn/c45406/180529_1g44hafbfeg8gf3g7a15ggggljgcc_718x326.jpg)

然后开启消费进程，然后再次执行上面的塞入数据，新后面重新塞入的数据可以被消费；但是之前塞入的数据则没有，消费消息的代码如下:

```java
public class MyDefaultConsumer {
    public void consumerMsg(String queue) throws IOException, TimeoutException {
        ConnectionFactory factory = RabbitUtil.getConnectionFactory();

        //创建连接
        Connection connection = factory.newConnection();

        //创建消息通道
        Channel channel = connection.createChannel();
        channel.queueDeclare(queue, true, false, true, null);
        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties,
                    byte[] body) throws IOException {
                String message = new String(body, "UTF-8");
                try {
                    System.out.println(" [ " + queue + " ] Received '" + message);
                } finally {
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            }
        };

        // 取消自动ack
        channel.basicConsume(queue, false, consumer);
    }

    public static void main(String[] args) throws IOException, TimeoutException, InterruptedException {
        MyDefaultConsumer consumer = new MyDefaultConsumer();
        consumer.consumerMsg("hello");

        Thread.sleep(1000 * 60 * 10);
    }
}
```

**小结：**

- 通过上面的演示得知一点
- 当没有Queue绑定到Exchange时，往Exchange中写入的消息也不会重新分发到之后绑定的queue上

### 3. Durable, autoDeleted参数

在定义Queue时，可以指定这两个参数，这两个参数的区别是什么呢？

#### a. durable

持久化，保证RabbitMQ在退出或者crash等异常情况下数据没有丢失，需要将queue，exchange和Message都持久化。

若是将queue的持久化标识durable设置为true,则代表是一个持久的队列，那么在服务重启之后，也会存在，因为服务会把持久化的queue存放在硬盘上，当服务重启的时候，会重新什么之前被持久化的queue。队列是可以被持久化，但是里面的消息是否为持久化那还要看消息的持久化设置。也就是说，重启之前那个queue里面还没有发出去的消息的话，重启之后那队列里面是不是还存在原来的消息，这个就要取决于发生着在发送消息时对消息的设置


### b. autoDeleted

自动删除，如果该队列没有任何订阅的消费者的话，该队列会被自动删除。这种队列适用于临时队列

这个比较容易演示了，当一个Queue被设置为自动删除时，当消费者断掉之后，queue会被删除，这个主要针对的是一些不是特别重要的数据，不希望出现消息积累的情况

```java
// 倒数第二个参数，true表示开启自动删除
// 正数第二个参数，true表示持久化
channel.queueDeclare(queue, true, false, true, null);
```

#### c. 小结

- 当一个Queue已经声明好了之后，不能更新durable或者autoDelted值；当需要修改时，需要先删除再重新声明
- 消费的Queue声明应该和投递的Queue声明的 durable,autoDelted属性一致，否则会报错
- 对于重要的数据，一般设置 `durable=true, autoDeleted=false`
- 对于设置 `autoDeleted=true` 的队列，当没有消费者之后，队列会自动被删除

### 4. ACK

执行一个任务可能需要花费几秒钟，你可能会担心如果一个消费者在执行任务过程中挂掉了。一旦RabbitMQ将消息分发给了消费者，就会从内存中删除。在这种情况下，如果正在执行任务的消费者宕机，会丢失正在处理的消息和分发给这个消费者但尚未处理的消息。
但是，我们不想丢失任何任务，如果有一个消费者挂掉了，那么我们应该将分发给它的任务交付给另一个消费者去处理。

为了确保消息不会丢失，RabbitMQ支持消息应答。消费者发送一个消息应答，告诉RabbitMQ这个消息已经接收并且处理完毕了。RabbitMQ就可以删除它了。

因此手动ACK的常见手段

```java
// 接收消息之后，主动ack/nak
Consumer consumer = new DefaultConsumer(channel) {
    @Override
    public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties,
            byte[] body) throws IOException {
        String message = new String(body, "UTF-8");
        try {
            System.out.println(" [ " + queue + " ] Received '" + message);
            channel.basicAck(envelope.getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(envelope.getDeliveryTag(), false, true);
        }
    }
};

// 取消自动ack
channel.basicConsume(queue, false, consumer);
```

手动ack时，有个`multiple`，其含义表示:

可以理解为每个Channel维护一个unconfirm的消息序号集合，每publish一条数据，集合中元素加1，每回调一次handleAck方法，unconfirm集合删掉相应的一条(multiple=false)或多条(multiple=true)记录


## III. 其他

### 1. 参考

[Java Client API Guide](http://www.rabbitmq.com/api-guide.html)


### 2. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 3. 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 4. 扫描关注

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

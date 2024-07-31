---
order: 1
title: RabbitMQ基础教程之安装与测试
tag:
  - RabbitMQ
  - 指南
category:
  - 开源
  - RabbitMQ
date: 2018-05-24 21:25:16
---

# RabbitMq基础教程之安装与测试

> [Installing on Mac](http://www.rabbitmq.com/install-standalone-mac.html)

## I. 安装

```sh
brew install rabbitmq

## 进入安装目录
cd /usr/local/Cellar/rabbitmq/3.7.5

# 启动
brew services start rabbitmq
# 当前窗口启动
rabbitmq-server
```

<!-- more -->

启动控制台之前需要先开启插件

```sh
./rabbitmq-plugins enable rabbitmq_management
```

进入控制台: http://localhost:15672/


用户名和密码：`guest,guest`


## II. 配置与测试

### 1. 添加账号

首先是得启动mq

```sh
## 添加账号
./rabbitmqctl add_user admin admin
## 添加访问权限
./rabbitmqctl set_permissions -p "/" admin ".*" ".*" ".*"
## 设置超级权限
./rabbitmqctl set_user_tags admin administrator
```

### 2. 编码实测

pom引入依赖

```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
</dependency>
```


开始写代码

```java
public class RabbitMqTest {

    //消息队列名称
    private final static String QUEUE_NAME = "hello";

    @Test
    public void send() throws java.io.IOException, TimeoutException {

        //创建连接工程
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("127.0.0.1");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin");
        //创建连接
        Connection connection = factory.newConnection();

        //创建消息通道
        Channel channel = connection.createChannel();

        //生成一个消息队列
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);


        for (int i = 0; i < 10; i++) {
            String message = "Hello World RabbitMQ count: " + i;

            //发布消息，第一个参数表示路由（Exchange名称），未""则表示使用默认消息路由
            channel.basicPublish("", QUEUE_NAME, null, message.getBytes());

            System.out.println(" [x] Sent '" + message + "'");
        }


        //关闭消息通道和连接
        channel.close();
        connection.close();

    }


    @Test
    public void consumer() throws java.io.IOException, java.lang.InterruptedException, TimeoutException {

        //创建连接工厂
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("127.0.0.1");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin");

        //创建连接
        Connection connection = factory.newConnection();

        //创建消息信道
        Channel channel = connection.createChannel();

        //消息队列
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);
        System.out.println("[*] Waiting for message. To exist press CTRL+C");

        AtomicInteger count = new AtomicInteger(0);

        //消费者用于获取消息信道绑定的消息队列中的信息
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
        channel.basicConsume(QUEUE_NAME, false, consumer);

        Thread.sleep(1000 * 60);
    }
}
```

需要注意的一点是：

- 生产消息: `channel.queueDeclare(QUEUE_NAME, true, false, false, null);`
- 消费消息: `channel.queueDeclare(QUEUE_NAME, true, false, false, null);`
- 生产和消费都声明channel，要求两者的配置参数一致，否则无法消费数据


### 3. 输出说明

首先执行塞入数据，执行完毕之后，可以到控制台进行查看:

![out](https://s3.mogucdn.com/mlcdn/c45406/180524_4khh6fe70jb46jc1dci56kj703ga0_731x471.png)


可以看到多出了一个Queue，对列名为hello，总共有10条数据

---

接下来就是消费数据了，执行consumer方法，输出日志

```sh
[*] Waiting for message. To exist press CTRL+C
 [x] Received 'Hello World RabbitMQ count: 0
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 1
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 2
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 3
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 4
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 5
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 6
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 7
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 8
 [x] Done
 [x] Received 'Hello World RabbitMQ count: 9
 [x] Done
```

回头去查看queue，发现总得数据量为0了


### 4. ACK问题

对于ack的问题，如果在消费数据的时候，出现异常，而我不希望数据丢失，这个时候就需要考虑手动ack的机制来保证了


首先需要设置手动ack

```java
// 设置autoAck为false
channel.basicConsume(QUEUE_NAME, false, consumer);
```

其次在消费数据完毕之后，主动ack/nack

```java
if (success) {
    channel.basicAck(envelope.getDeliveryTag(), false);
} else {
    channel.basicNack(envelope.getDeliveryTag(), false, false);
}
```


## III. 其他

### [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 声明

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，如发现bug或者有更好的建议，随时欢迎批评指正

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 扫描关注

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

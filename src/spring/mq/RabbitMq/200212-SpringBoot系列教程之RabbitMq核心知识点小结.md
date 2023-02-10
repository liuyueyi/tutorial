---
order: 2
title: 2.RabbitMq核心知识点小结
tag: 
  - RabbitMq
category: 
  - SpringBoot
  - MQ系列
  - RabbitMq
date: 2020-02-12 16:58:31
keywords: RabbitMq 事务 消息机制 事务机制 集群架构 数据一致性 消息一致性
---

RabbitMQ是一个基于AMQP协议实现的企业级消息系统，想要顺畅的玩耍的前提是得先了解它，本文将主要介绍rabbitmq的一些基本知识点

- 特点
- 基本概念
- 消息投递消费的几种姿势
- 事务
- 集群

<!-- more -->

## I. 基本知识点

它是采用Erlang语言实现的AMQP(Advanced Message Queued Protocol)的消息中间件，最初起源于金融系统，用在分布式系统存储转发消息，目前广泛应用于各类系统用于解耦、削峰

### 1.特点

首先得了解一下rabbitmq的特点，看看是否满足我们的系统需求（毕竟学习一个框架也是要不少时间的）

> 以下内容来自: [MQ和RabbitMQ作用特点](https://blog.csdn.net/weixin_40792878/article/details/82555791)

主要特点，大致可以归纳为以下几个

- 可靠性：通过支持消息持久化，支持事务，支持消费和传输的ack等来确保可靠性
- 路由机制：支持主流的订阅消费模式，如广播，订阅，headers匹配等
- 扩展性：多个RabbitMQ节点可以组成一个集群，也可以根据实际业务情况动态地扩展集群中节点。
- 高可用性：队列可以在集群中的机器上设置镜像，使得在部分节点出现问题的情况下队仍然可用。
- 多种协议：RabbitMQ除了原生支持AMQP协议，还支持STOMP，MQTT等多种消息中间件协议。
- 多语言客户端：RabbitMQ几乎支持所有常用语言，比如Jav a、Python、Ruby、PHP、C#、JavaScript等。
- 管理界面：RabbitMQ提供了一个易用的用户界面，使得用户可以监控和管理消息、集群中的节点等。
- 插件机制：RabbitMQ提供了许多插件，以实现从多方面进行扩展，当然也可以编写自己的插件。

### 2. 基本概念

下图为rabbitmq的内部结构图

![](/imgs/200212/00.jpg)

从上图也可以发现几个基本概念（Message, Publisher, Exchange, Binding, Queue, Channel, Consuer, Virtual host）

下面逐一进行说明

#### a. Message

具体的消息，包含消息头（即附属的配置信息）和消息体（即消息的实体内容）

由发布者，将消息推送到Exchange，由消费者从Queue中获取

#### b. Publisher

消息生产者，负责将消息发布到交换器(Exchange)

#### c. Exchange

交换器，用来接收生产者发送的消息并将这些消息路由给服务器中的队列

#### d. Binding

绑定，用于给Exchange和Queue建立关系，从而决定将这个交换器中的哪些消息，发送到对应的Queue

#### e. Queue

消息队列，用来保存消息直到发送给消费者

它是消息的容器，也是消息的终点

一个消息可投入一个或多个队列

消息一直在队列里面，等待消费者连接到这个队列将其取走

#### f. Connection

连接，内部持有一些channel，用于和queue打交道

#### g. Channel

信道（通道），MQ与外部打交道都是通过Channel来的，发布消息、订阅队列还是接收消息，这些动作都是通过Channel完成；

简单来说就是消息通过Channel塞进队列或者流出队列

#### h. Consumer

消费者，从消息队列中获取消息的主体

#### i. Virtual Host

虚拟主机，表示一批交换器、消息队列和相关对象。

虚拟主机是共享相同的身份认证和加密环境的独立服务器域。

每个 vhost 本质上就是一个 mini 版的 RabbitMQ 服务器，拥有自己的队列、交换器、绑定和权限机制。

vhost 是 AMQP 概念的基础，必须在连接时指定，RabbitMQ 默认的 vhost 是 /

**可以理解为db中的数据库的概念，用于逻辑拆分**

#### j. Broker

消息队列服务器实体

### 3. 消息投递消费

从前面的内部结构图可以知晓，消息由生产者发布到Exchange，然后通过路由规则，分发到绑定queue上，供消费者获取消息

接下来我们看一下Exchange支持的四种策略

#### a. Direct策略

![](/imgs/200212/01.jpg)


消息中的路由键（routing key）如果和 Binding 中的 binding key 一致， 交换器就将消息发到对应的队列中

简单来讲，就是`rounting key`与`binding key`完全匹配

- 如果一个队列绑定到交换机要求路由键为`dog`
- 只转发`routing key` 标记为`dog`的消息，
- 不会转发`dog.puppy`，也不会转发“dog.guard”等等
- 它是完全匹配、单播的模式

举例说明

![](/imgs/200212/02.jpg)


Exchange和两个队列绑定在一起：

- Q1的bindingkey是orange
- Q2的binding key是black和green.
- 当Producer 发布一个消息，其`routing key`是`orange`时, exchange会把它放到Q1上, 如果是`black`或`green`就会到Q2上, 其余的Message被丢弃

**注意**

- 当有多个队列绑定到同一个Exchange，且binding key相同时，这时消息会分发给所有满足条件的队列

#### b. Topic策略

![](/imgs/200212/03.jpg)

这个策略可以看成是Direct策略的升级版，通过`routing key`与 `bingding key`的模式匹配方式来分发消息

简单来讲，直接策略是完全精确匹配，而topic则支持正则匹配，满足某类指定规则的（如以xxx开头的路由键），可以将消息分发过去

- `#` 匹配0个或多个单词
- `*` 匹配不多不少一个单词

**一个更直观的实例如下**

![](/imgs/200212/04.jpg)

Producer发送消息时需要设置routing_key,

- Q1 的binding key 是`*.orange.*`
- Q2 是 `*.*.rabbit` 和 `lazy.#`：
- 发布一个`routing key`为`test.orange.mm` 消息，则会路由到Q1；
  - **注意：** 如果是`routng key`是 `test.orange`则无法路由到Q1，
  - 因为Q1的规则是三个单词，中间一个为orange，不满足这个规则的都无效
- 发布一个`routing key`为`test.qq.rabbit`或者`lazy.qq`的消息 都可以分发到Q2；即路由key为三个单词，最后一个为rabbit或者不限制单词个数，主要第一个是lazy的消息，都可以分发过来
- 如果发布的是一个`test.orange.rabbit`消息，则Q1和Q2都可以满足
  - **注意：** 这时两个队列都会接受到这个消息


#### c. Fanout策略

![](/imgs/200212/05.jpg)

广播策略，忽略`routing key` 和 `binding key`，将消息分发给所有绑定在这个exchange上的queue

#### d. Headers策略

这个实际上用得不多，它是根据Message的一些头部信息来分发过滤Message，忽略routing key的属性，如果Header信息和message消息的头信息相匹配

## II. 消息一致性问题

在进入rabbitmq如何保证一致性之前，我们先得理解，什么是消息一致性？

### 1. 一致性问题

> [数据的一致性是什么](https://www.php.cn/faq/415782.html)

**按照我个人的粗浅理解，我认为的消息一致性，应该包含下面几个**

- 生产者，确保消息发布成功
  - 消息不会丢
  - 顺序不会乱
  - 消息不会重复（如重传，导致发布一次，却出现多个消息）
- 消费者，确保消息消费成功
  - 有序消费
  - 不重复消费

**发送端**

为了确保发布者推送的消息不会丢失，我们需要消息持久化

- broker持久化消息

为了确定消息正确接收

- publisher 需要知道消息投递并成功持久化


### 2. 持久化

这里的持久化，主要是指将内存中的消息保存到磁盘，避免mq宕机导致的内存中消息丢失；然而单纯的持久化，只是保证一致性的其中一个要素，比如publisher将消息发送到exchange，在broker持久化的工程中，宕机了导致持久化失败，而publisher并不知道持久化失败，这个时候就会出现数据丢失，为了解决这个问题，rabbitmq提供了事务机制

### 3. 事务机制

事务机制能够解决生产者与broker之间消息确认的问题，只有消息成功被broker接受，事务才能提交成功，否则就进行事务回滚操作并进行消息重发。但是使用事务机制会降低RabbitMQ的消息吞吐量，不适用于需要发布大量消息的业务场景。

**注意，事务是同步的**

### 4. 消息确认机制

> [RabbitMQ学习(六)——消息确认机制(Confirm模式)](https://blog.csdn.net/anumbrella/article/details/81321701)

消息确认机制，可以区分为生产端和消费端

**生产端**

- 生产者将信道设置成Confirm模式，一旦信道进入Confirm模式，所有在该信道上面发布的消息都会被指派一个唯一的ID(以confirm.select为基础从1开始计数)，
- 一旦消息被投递到所有匹配的队列之后，Broker就会发送一个确认给生产者（包含消息的唯一ID）,这就使得生产者知道消息已经正确到达目的队列了，
- 如果消息和队列是可持久化的，那么确认消息会将消息写入磁盘之后发出，
- Broker回传给生产者的确认消息中deliver-tag域包含了确认消息的序列号（此外Broker也可以设置basic.ack的multiple域，表示到这个序列号之前的所有消息都已经得到了处理）

Confirm模式属性异步，publisher发布一条消息之后，在等信道返回确认的同时，依然可以继续发送下一条消息，所以小概率会出现投递的消息顺序和broker中持久化消息顺序不一致的问题

一般从编程角度出发，Confirm模式有三种姿势

- 普通Confirm模式：发送一条消息之后，等到服务器confirm，然后再发布下一条消息（串行发布）
- 批量Confirm模式：发送一批消息之后，等到服务器confirm，然后再发布下一批消息（如果失败，这一批消息全部重复，所以会有重复问题）
- 异步Confirm模式：提供一个回调方法，服务器confirm之后，触发回调方法，因此不会阻塞下一条消息的发送

**消费端**

ACK机制是消费者从RabbitMQ收到消息并处理完成后，反馈给RabbitMQ，RabbitMQ收到反馈后才将此消息从队列中删除。

- 如果一个消费者在处理消息出现了网络不稳定、服务器异常等现象，那么就不会有ACK反馈，RabbitMQ会认为这个消息没有正常消费，会将消息重新放入队列中
- 如果在集群的情况下，RabbitMQ会立即将这个消息推送给这个在线的其他消费者。这种机制保证了在消费者服务端故障的时候，不丢失任何消息和任务
- 消息永远不会从RabbitMQ中删除，只有当消费者正确发送ACK反馈，RabbitMQ确认收到后，消息才会从RabbitMQ服务器的数据中删除


## III. 集群

按照目前的发展趋势，一个不支持集群的中间件基本上是不会有市场的；rabbitmq也是支持集群的，下面简单的介绍一下常见的4种集群架构模式

> 以下内容来自网上博文，详情请点击右边：[RabbitMQ 的4种集群架构](https://www.jianshu.com/p/b7cc32b94d2a)

### 1. 主备模式

这个属于常见的集群模式了，但又不太一样

主节点提供读写，备用节点不提供读写。如果主节点挂了，就切换到备用节点，原来的备用节点升级为主节点提供读写服务，当原来的主节点恢复运行后，原来的主节点就变成备用节点

### 2. 远程模式

远程模式可以实现双活的一种模式，简称 shovel 模式，所谓的 shovel 就是把消息进行不同数据中心的复制工作，可以跨地域的让两个 MQ 集群互联，远距离通信和复制。

- Shovel 就是我们可以把消息进行数据中心的复制工作，我们可以跨地域的让两个 MQ 集群互联。

![](/imgs/200212/06.jpg)

如上图，有两个异地的 MQ 集群（可以是更多的集群），当用户在地区 1 这里下单了，系统发消息到 1 区的 MQ 服务器，发现 MQ 服务已超过设定的阈值，负载过高，这条消息就会被转到 地区 2 的 MQ 服务器上，由 2 区的去执行后面的业务逻辑，相当于分摊我们的服务压力。

### 3. 镜像模式

非常经典的 mirror 镜像模式，保证 100% 数据不丢失。在实际工作中也是用得最多的，并且实现非常的简单，一般互联网大厂都会构建这种镜像集群模式。

![](/imgs/200212/07.jpg)


如上图，用 KeepAlived 做了 HA-Proxy 的高可用，然后有 3 个节点的 MQ 服务，消息发送到主节点上，主节点通过 mirror 队列把数据同步到其他的 MQ 节点，这样来实现其高可靠

### 4. 多活模式

也是实现异地数据复制的主流模式，因为 shovel 模式配置比较复杂，所以一般来说，实现异地集群的都是采用这种双活 或者 多活模型来实现的。这种模式需要依赖 rabbitMQ 的 federation 插件，可以实现持续的，可靠的 AMQP 数据通信，多活模式在实际配置与应用非常的简单

rabbitMQ 部署架构采用双中心模式(多中心)，那么在两套(或多套)数据中心各部署一套 rabbitMQ 集群，各中心的rabbitMQ 服务除了需要为业务提供正常的消息服务外，中心之间还需要实现部分队列消息共享。

![](/imgs/200212/08.jpg)

federation 插件是一个不需要构建 cluster ，而在 brokers 之间传输消息的高性能插件，federation 插件可以在 brokers 或者 cluster 之间传输消息，连接的双方可以使用不同的 users 和 virtual hosts，双方也可以使用不同版本的 rabbitMQ 和 erlang。federation 插件使用 AMQP 协议通信，可以接受不连续的传输。federation 不是建立在集群上的，而是建立在单个节点上的，如图上黄色的 rabbit node 3 可以与绿色的 node1、node2、node3 中的任意一个利用 federation 插件进行数据同步。


## IV. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)

### 1. 相关博文

- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [MQ和RabbitMQ作用特点](https://blog.csdn.net/weixin_40792878/article/details/82555791)
- [RabbitMq基础教程之基本概念](https://blog.hhui.top/hexblog/2018/05/27/RabbitMQ%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B%E4%B9%8B%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/)
- [RabbitMQ学习(六)——消息确认机制(Confirm模式)](https://blog.csdn.net/anumbrella/article/details/81321701)
- [RabbitMQ 的4种集群架构](https://www.jianshu.com/p/b7cc32b94d2a)
- [Rabbitmq是如何来保证事务的](http://www.voidcn.com/article/p-fdbmgrcd-brm.html)
- [rabbitmq消息一致性问题](http://www.liaoqiqi.com/post/215)
- 

### 2. 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


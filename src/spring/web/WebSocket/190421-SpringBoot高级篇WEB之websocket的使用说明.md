---
order: 1
title: 1.springboot + websocket初体验
tag: 
  - WebSocket
category: 
  - SpringBoot
  - WEB系列
  - WebSocket
date: 2019-04-21 22:37:03
keywords: SpringBoot,WebSocket,SpringMVC,Web
---

常见的web应用大多是提供基础的REST服务，简单来讲就是用户发起一个请求，然后给出反应，可以理解为由客户主动发起的单边操作；那么有没有一种技术是服务端主动发起，与客户端进行交互的？

非常常见的几个需求场景，如聊天室的实现，股票的委托、成交实时刷新，信息推送机制，应用日志实时刷新等用我们传统的web交互方式，就不太容易做到了，本篇博文将介绍下HTML5中引入的WebSocket，可以如何实现客户端和服务端之间的双端通信

<!-- more -->

## I. 前期准备

大环境依然是选择SpringBoot来快速构建应用

### 1. 配置如下

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.0.4.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.45</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
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
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

从依赖中看，最关键的就是 `spring-boot-starter-websocket` 的引入

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### 2. 辅助文档

因为之前没怎么用过webscoket，所以也不知道怎么来实现一个webscoket的服务，所以就拿官方的教程进行熟悉

- [Spring WebSockets 使用说明](https://docs.spring.io/spring-framework/docs/5.2.0.M1/spring-framework-reference/web.html#websocket)


本文将搭建一个WebSocket的服务，那么就需要有一个对应的客户端了，目前正好在学习python，所以决定采用python来作为消费方，下文是python作为消费的教程

- [Python之Webscoket模拟客户端简单使用](https://blog.hhui.top/hexblog/2019/04/16/190416-Python%E4%B9%8BWebscoket%E6%A8%A1%E6%8B%9F%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%AE%80%E5%8D%95%E4%BD%BF%E7%94%A8/)


## II. WebSocket HelloWorld版构建

接下来进入正题，开始搭建一个简单的websocket服务端

### 1. configuration 配置

首先是添加配置文件，和我们普通的一个类上添加`@Configuration`注解不一样的是，这个配置文件要求实现接口`WebSocketConfigurer`

```java
@Configuration
@EnableWebSocket
public class AutoConfiguration implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(myHandler(), "wsdemo");
    }

    public WebSocketHandler myHandler() {
        return new MyWebSocketHandler();
    }
}
```

注意上面的配置文件，两点

- 添加注解 `@EnableWebSocket` 表示开启了webocket服务
- `registerWebSocketHandlers` 这个方法用来注册websocket服务，上面表示将路径 wsdemo 的请求转发到 `WebSocketHandler`


### 2. WebSocketHandler 处理类

上面提到了WebSocketHandler，基本上也就可以确认，这个对象将是核心处理类，主要的业务逻辑就在里面，下面是我们自定义实现的一个简单的`TextWebSocketHandler`

```java
public class MyWebSocketHandler extends TextWebSocketHandler {
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 获取接收到的数据
        String payload = message.getPayload();

        // 向客户端发送数据
        session.sendMessage(new TextMessage("response: " + payload));
    }
}
```

这个实现就简单了，重写了方法`handleTextMessage`，当接受到用户发送的数据时，凭借一个 `response: ` 的头之后返回；返回数据则是借助`WebSocketSession`即与客户端之间的会话，来发送数据的


到这里一个基本的websocket服务端搭建完成，然后我们开始实验一下


### 3. 测试

先完成启动类，启动应用程序

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

对应的python消费核心代码如下

```python
from websocket import create_connection

ws = create_connection("ws://127.0.0.1:8080/wsdemo")
# 发送数据
ws.send("hello world")
# 接收数据
result = ws.recv()
print(result)
```

过程演示示意图

![测试示意图](/imgs/190421/00.gif)

从图中的演示过程，基本上一个消费者发送数据之后，就可以获取到对应的返回数据；且消费者A不能获取消费者B返回的数据；上面的演示中，当客户端不发送数据，直接调用获取数据时，因为服务端一直没有返回数据，所以一直在等待，这样一来这个服务看起来和我们传统的rest服务没啥太大区别，都要发送请求/返回结果，并没有体现到websocket的主动推送的功能

## III. WebSocket 实现简单的聊天

上面的例子，只是演示了最最基本的WebSocket的使用方式，然而并不能给我们带来WebScoket的优越性的既视感，下面准备基于WebSocket搭建一个简单的聊天室，当有新的连接进来时，推送所有人欢迎xxx；当有人发送消息时，同步给其他所有在线的小伙伴；当有小伙伴离开时，告诉所有小伙伴xx离开了

### 1. `RealTalkWebSocketHandler`

通过前面知道WebSocketHandler是处理websocket核心业务逻辑的类，因此我们新的实现中，需要记录每个连接的回话，创建连接时，发送给所有在线的同学一条欢迎消息；离线也一样；

```java
public class RealTalkWebSocketHandler extends TextWebSocketHandler {

    private static Set<WebSocketSession> tmpCache = new HashSet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
        tmpCache.add(session);
        sendMsg("欢迎" + session.getId() + "进入聊天室");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
        tmpCache.remove(session);
        sendMsg(session.getId() + " 离开聊天室");
    }


    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 获取接收到的数据
        String payload = message.getPayload();
        sendMsg(session.getId() + " ： " + payload);
    }


    private void sendMsg(String msg) throws IOException {
        for (WebSocketSession session : tmpCache) {
            session.sendMessage(new TextMessage(msg + " | " + LocalDateTime.now()));
        }
    }
}
```

注意上面的实现

- `afterConnectionEstablished` 这个方法时在了解创立之后调用的，正好用来发送欢迎词语
- `afterConnectionClosed` 这个是断开连接时调用，用来发送离开词
- `handleTextMessage` 这个则是接收用户发送消息的方法，和前面不一样，我们接收到消息之后，把这个消息广播给所有在线的小伙伴

### 2. 注册handler

在前面的配置类中，注册下我们新加的Handler

```java
@Override
public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(myHandler(), "wsdemo");
    registry.addHandler(realTalkWebSocketHandler(), "talk");
}

public WebSocketHandler realTalkWebSocketHandler() {
    return new RealTalkWebSocketHandler();
}
```

### 3. 测试

接下来进行测试环节，看下是否满足我们的需求

![测试示意图](/imgs/190421/01.gif)

上图中，开了三个客户端，当有新的小伙伴进入时，所有人都可以收到欢迎的话语，当其中一个人说话之后，所有人也可以获取到说的内容；基本上可以实现我们前面提到的场景

### 4. 小结

使用websocket搭建服务端，一般步骤比较简单，两步

- 配置文件
  - 实现接口 `WebSocketConfigurer`
  - 添加注解 `@EnableWebSocket`
  - 注册`WebSocketHandler`
- 实现自定义`WebSocketHandler`
  - 继承 `AbstractWebSocketHandler`， 实现具体的连接/断连/接收消息的处理逻辑
  
**双端通讯**

服务端和客户端的通讯，主要借助的是`WebSocketSession`来实现，因此在我们自己实现的简易版聊天室中，需要自己来保存所有客户端的会话

那么问题来了，有没有更简单的方式来实现聊天室的这种场景呢，session的管理应该属于普适性的需求了，如果都需要开发者自己来处理的话，上手成本也大了点吧

官方教程中websocket这一节提到了STOMP，后续博文将介绍如何使用STOMP，结合websocket实现更复杂的双端通信场景


## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/203-websocket](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/203-websocket)


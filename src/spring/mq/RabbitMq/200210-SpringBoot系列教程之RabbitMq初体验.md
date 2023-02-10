---
order: 1
title: 1.springboot + rabbitmq初体验
tag: 
  - RabbitMq
category: 
  - SpringBoot
  - MQ系列
  - RabbitMq
date: 2020-02-10 16:04:48
keywords: Spring MQ SpringBoot RabbitMq RabbitListener AmqpTemplate
---

mq在异步解耦削峰的优势非常突出，现在很多的项目都会用到，掌握mq的知识点，了解如何顺畅的使用mq，可以说是一个必备的职业技能点了

接下来我们进入rabbitmq的学习过程

<!-- more -->

## I. 环境准备

在测试之前，需要安装rabbitmq，下面分别给出mac + centos的安装教程

### 1. mac 安装

安装命令

```bash
brew install rabbitmq

## 进入安装目录
cd /usr/local/Cellar/rabbitmq/3.7.5

# 当前窗口启动
sbin/rabbitmq-server

# 后台启动
brew services start rabbitmq
```

启动控制台之前需要先开启插件

```bash
sbin/rabbitmq-plugins enable rabbitmq_management
```

进入控制台: `http://localhost:15672/`

用户名和密码：`guest,guest`

### 2. centos 安装

安装命令

```sh
yum install erlang
wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.6.15/rabbitmq-server-3.6.15-1.el6.noarch.rpm
yum install rabbitmq-server-3.6.15-1.el6.noarch.rpm
```

插件开启

```sh
rabbitmq-plugins enable rabbitmq_management
# 启动
rabbitmq-server -detached
```

### 3. 配置

添加账号，设置权限

```bash
## 添加账号
./rabbitmqctl add_user admin admin
## 添加访问权限
./rabbitmqctl set_permissions -p "/" admin ".*" ".*" ".*"
## 设置超级权限
./rabbitmqctl set_user_tags admin administrator
```

### 4. 项目环境

接下我们创建一个SpringBoot项目，用于简单的体验一下rabbitmq的发布和消费消息

- springboot版本为`2.2.1.RELEASE`
- rabbitmq 版本为 `3.7.5`

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
```

## II. 实例演示

接下来我们看一个`hello world`版本的rabbitmq的使用姿势，一个简单发布消息、消费消息

### 1. 发布消息

消息发布，我们主要借助`AmqpTemplate`来实现

```java
@Component
public class PublishDemo {
    @Autowired
    private AmqpTemplate amqpTemplate;

    public String publish2mq(String ans) {
        String msg = "hello world = " + ans;
        System.out.println("publish: " + msg);
        amqpTemplate.convertAndSend(Pkg.exchange, Pkg.routing, msg);
        return msg;
    }
}
```

上面的case中，主要方法在于`amqpTemplate#convertAndSend`，第一个参数为exchangeName, 第二个为routingKey

常量配置如下

```java
class Pkg {
    final static String exchange = "topic.e";
    final static String routing = "r";
    final static String queue = "topic.a";
}
```

### 2. 消费消息

消费消息，需要指定Queue，通过routingKey绑定exchange，如下

```java
@Service
public class ConsumerDemo {

    @RabbitListener(bindings = @QueueBinding(value = @Queue(value = Pkg.queue, durable = "false", autoDelete = "true"),
            exchange = @Exchange(value = Pkg.exchange, ignoreDeclarationExceptions = "true",
                    type = ExchangeTypes.TOPIC), key = Pkg.routing))
    public void consumer(String msg) {
        System.out.println("consumer msg: " + msg);
    }
}
```

### 3. 测试demo

写一个简单的rest接口，用于接收参数，发布消息到mq，并被`ConsumerDemo`消费

```java
@RestController
public class PubRest {
    @Autowired
    private PublishDemo publishDemo;

    @GetMapping(path = {"", "/", "/publish"})
    public String publish(String name) {
        return publishDemo.publish2mq(name);
    }
}
```

![](/imgs/200210/00.gif)

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/300-rabbitmq](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/300-rabbitmq)


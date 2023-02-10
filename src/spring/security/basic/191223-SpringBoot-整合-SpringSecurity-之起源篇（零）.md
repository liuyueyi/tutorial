---
order: 1
title: 0.起源篇（零）
tag: 
  - SpringSecurity
category: 
  - SpringSecurity
date: 2019-12-23 18:55:02
keywords: SpringBoot SpringSecurity 教程
---

本篇为SpringSecurity的第一篇，主要来介绍下什么是SpringSecurity，以及在springboot中如何使用它

<!-- more -->

## I. 基本知识点

> 官方文档: [https://docs.spring.io/spring-security/site/docs/5.2.2.BUILD-SNAPSHOT/reference/htmlsingle/#community-help](https://docs.spring.io/spring-security/site/docs/5.2.2.BUILD-SNAPSHOT/reference/htmlsingle/#community-help)

下面是官方介绍

> Spring Security is a powerful and highly customizable authentication and access-control framework. It is the de-facto standard for securing Spring-based applications.

> Spring Security is a framework that focuses on providing both authentication and authorization to Java applications. Like all Spring projects, the real power of Spring Security is found in how easily it can be extended to meet custom requirements

用国语，简单抽象的说一下它的定义

- 很🐂的认证和访问权限校验框架

那么具体能干嘛？

- 用户登录认证：用户名+密码登录，确定用户身份
- 用户访问鉴权（常见的ACL访问控制列表，RBAC角色访问控制）：判定是否有权限访问某个资源
- 安全保护（CSRF跨站点攻击,Session Fixation会话固定攻击...）

## II. 初体验

接下来我们看一下再springboot中如何使用springsecurity

### 1. 配置

首先得是spring boot项目，然后添加上security的依赖即可，相对完整的pom配置如下（注意我们使用的springboot版本为2.2.1.RELEASE）

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
        <artifactId>spring-boot-starter-security</artifactId>
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

### 2. 实例demo

上面配置完之后，啥都不需要干，项目已经接入了spring security；项目中的服务都需要登录之后才能访问

```java
// 程序启动类
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// rest 服务
@RestController
public class IndexRest {

    @GetMapping(path = {"/", "/index"})
    public String index() {
        return "hello this is index!";
    }

    @GetMapping(path = "hello")
    public String hello(String name) {
        return "welcome " + name;
    }
}
```

当我们需要访问首页时，会发现直接302重定向到登录页面了，如下图

![](/imgs/191223/00.gif)

spring security默认给我们生成了一个用户名为user，密码为控制台中输出的一行日志如`Using generated security password: aa410186-5c04-4282-b217-507ffb1f61eb`

登录之后会重定向回我们之前访问的url，通过抓包可以看到，登录成功之后，会设置请求方的cookie，后续的请求携带cookie来表明用户身份

![](/imgs/191223/01.jpg)

### 3. 基本配置

上面虽然演示了一个hello world的初体验项目，但是这个默认的用户名/密码有点鬼畜，默认的配置主要来自于`org.springframework.boot.autoconfigure.security.SecurityProperties.User`，下面是截图（所以前面的用户名为user）

![](/imgs/191223/02.jpg)


接下来我们需要配置为对人类友好的方式，在项目的配置文件`application.yml`中，指定登录的用户名/密码

```yml
spring:
  security:
    user:
      name: yihuihui
      password: 123456
```

重启测试项目，使用新的用户名/密码（yihuihui/123456)就可以登录成功了; 

### 4. 用户身份获取

上面虽然是一个简单的case，但还有一点不得不提一下，在我的接口中，虽然知道你登录了，但怎么知道你是谁呢？

我们可以直接通过`HttpServletRequest#getRemoteUser()`的方法来获取登录用户； 或者通过`SecurityContextHolder.getContext().getAuthentication().getPrincipal()`来获取授权信息

我们来写一个通用方法

```java
public String getUser() {
    return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getRemoteUser();
}

// or
public Object getUser() {
    SecurityContextHolder.getContext().getAuthentication().getPrincipal();
}
```

然后稍微改一下我们的服务接口

```java
@GetMapping(path = {"/", "/index"})
public String index() {
    return "hello this is index! welcome " + getUser();
}
```

再次访问之后，结果如下

![](/imgs/191223/03.jpg)

### 5. 小结

本文主要是spring security系列的起源篇，第一节介绍了下什么是SpringSecurity，有什么特点

- spring security是一个很🐂🍺的认证（可以简单理解为登录验证）和鉴权（可简单理解为访问控制）框架
- 三大特点：登录 + 鉴权 + 安全防护

第二节介绍了一个简单入门的HelloWorld实例

- springboot项目，添加依赖 `spring-boot-starter-security`； 所有的http接口访问都需要登录，默认提供一个用户名为user，密码为控制台输出的UUID字符串
- 通过`spring.security.user.name`和`spring.security.user.password`来指定用户名密码
- 通过`HttpServletRequest#getRemoteUser()`获取登录用户

那么问题来了，什么系统可能只有一个用户呢？要多用户怎么办？不同的用户不同的权限怎么办？某些接口所有人都可以访问又怎么办？

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 代码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-security/000-basic-demo](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-security/000-basic-demo)


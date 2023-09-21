---
order: 8
title: 8. Session与Cookie
tag:
  - WEB
category:
  - SpringBoot
  - WEB系列
date: 2023-03-23 22:03:01
keywords:
  - SpringBoot
  - spring
  - cookie
  - session
---

虽然我们现在基本上已经进入了分布式session的时代了，但是在切实去看最新的oauth, sso, jwt等各种登录方案之前，我们有必要学习一下最早的cookie/session方案，看一下它们是怎么协同工作的，又有什么局限性


<!-- more -->

## 项目配置

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发


```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### 2. 启动入口

我们使用默认的配置进行测试，因此启动入口也可以使用最基础的

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

## Session/Cookie使用姿势

接下来我们再看一下如何在SpringBoot项目中是session/cookie

### 1. 登录入口，保存session

首先我们设计一个登录的接口，用来模拟真实场景下的登录，注意下面的实现

```java
@RestController
public class SessionController {

    @RequestMapping(path = "/login")
    public String login(String uname, HttpSession httpSession) {
        httpSession.setAttribute("name", uname);
        return "欢迎登录：" + uname;
    }
}
```

在上面的实现中，方法中定义了一个`HttpSession`的参数类型，具体的实现中，就是表示写入sesion的操作

当session写入完毕之后，在这个会话结束之前，后续的所有请求都可以直接获取到对应的session

### 2. session读取测试

下面给出两种常见的session获取方式

- 直接从HttpSession中获取
- 通过HttpServletRequest来获取

```java
    @RequestMapping("time")
    public String showTime(HttpSession session) {
        return session.getAttribute("name") + " ，当前时间为：" + LocalDateTime.now();
    }

    @RequestMapping("name")
    public String showName(HttpServletRequest request) {
        return "当前登录用户：" + request.getSession().getAttribute("name");
    }
```


接下来我们来模拟验证一下


![](/imgs/230323/00.gif)


从上面的演示图中，也可以看出，在登录之后，访问上面的接口，可以直接拿到session中存储的用户名；

且不同用户登录（不同的浏览器），他们的session不会出现串掉的情况

### 3. 退出登录

有登陆当然就有登出，如下

```java
    @RequestMapping(path = "logout")
    public String logout(HttpSession httpSession) {
        // 注销当前的session
        httpSession.invalidate();
        return "登出成功";
    }
```



### 4. session实现原理

SpringBoot提供了一套非常简单的session机制，那么它又是怎么工作的呢？ 特别是它是怎么识别用户身份的呢？ session又是存在什么地方的呢？


session：再浏览器窗口打开期间，这个会话一直有效，即先访问login，然后再访问time，可以直接拿到name， 若再此过程中，再次访问了login更新了name，那么访问time获取到的也是新的name


当浏览器关闭之后，重新再访问 time 接口，则此时将拿不到 name

核心工作原理：

- 借助cookie中的 JESSIONID 来作为用户身份标识，这个数据相同的，认为是同一个用户；然后会将session再内存中存一份，有过期时间的限制，通常每次访问一次，过期时间重新刷新
- 当浏览器不支持cookie时，借助url重写，将 sessionId 写道url的地址中，参数名 = jsessionid


![](/imgs/230323/01.jpg)


从上面的描述中，就可以看出几个关键点：

- session主要是存在内存中，根据用户请求的cookie来识别用户身份，且有一个过期时间 （那么问题来了，内存有大小限制么？会出现oom么？）
- 对于用户而言，每次关闭浏览器再重新打开，会重新生成 JESSIONID 的cookies值，由于这个值的更改，导致后端无法记录之前访问的是谁


## 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/224-web-session](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/224-web-session)

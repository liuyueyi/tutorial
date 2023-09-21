---
order: 9
title: 9. 实战之基于WebListener实现实时在线人数统计
tag:
  - Listener
category:
  - SpringBoot
  - WEB系列
  - 应用篇
date: 2023-03-25 20:33:47
keywords:
  - HttpSession
  - Cookie
---

很多pc网站都有一个实时在线人数的统计功能，那么一般这种是采用什么方式来实现的呢？ 这里我们介绍一个最基础的是实现方式，基于Session结合WebListener来实现在线人数统计

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

### 3. web配置


我们主要根据用户的session来创建与销毁来判断是否有新的用户访问站点、以及长时间没有访问之后认为已经离线，为了简化这个注销的模拟过程，我们将session的生命周期设置短一点

```yml
server:
  port: 8081
  servlet:
    session:
      timeout: 1m # 设置1分钟的有效时间
```


## 在线人数统计实现

接下来我们看一下具体的实现思路：

- 借助Servelt的Listener机制，主要监听Session的创建与销毁
- 当session创建时，认为新来一个用户，计数+1
- 当session销毁时，认为用户已经离开，或者长时间没有访问，计数-1


### 1. 计数服务

一个简单基础的计数服务，借助 `AtomicInteger` 来实现计数统计（为啥不直接是int ?)

```java
@Service
public class CountService {

    private AtomicInteger cnt = new AtomicInteger(0);

    public void incr(int cnt) {
        this.cnt.addAndGet(cnt);
    }

    public int getOnlineCnt() {
        return cnt.get();
    }

}
```


### 2. Session监听器


自定义一个Session的监听器，监听HttpSession的相关操作

```java
@WebListener
public class LoginUserCountListener implements HttpSessionListener {
    @Autowired
    private CountService countService;

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("--------- 新增一个用户 ------- session = " + se.getSession().getId());
        HttpSessionListener.super.sessionCreated(se);
        countService.incr(1);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("--------- 销毁一个用户 -----------" + se.getSession().getId() + " = " + se.getSession().getAttribute("name"));
        HttpSessionListener.super.sessionDestroyed(se);
        countService.incr(-1);
    }
}
```

### 3. 登录登出接口

最后再设计一个登录、登出、查询实时在线人数的统计接口

```java
@RestController
public class LoginController {
    @Autowired
    private CountService countService;

    @RequestMapping(path = "/login")
    public String login(String uname, HttpSession httpSession) {
        httpSession.setAttribute("name", uname);
        System.out.println("登录成功:" + uname);
        return "欢迎登录：" + uname + "， 当前在线人数: " + countService.getOnlineCnt();
    }


    /**
     * 查询当前在线人数
     *
     * @param session
     * @return
     */
    @RequestMapping("online")
    public String showOnlineUser(HttpSession session) {
        return session.getAttribute("name") + " ，当前时间为：" + LocalDateTime.now() + " 在线人数：" + countService.getOnlineCnt();
    }

    @RequestMapping(path = "logout")
    public String logout(HttpSession httpSession) {
        // 注销当前的session
        httpSession.invalidate();
        return "登出成功， 当前在线人数: " + countService.getOnlineCnt();
    }
}
```


接下来验证一下，实时在线人数统计情况

![](/imgs/230325/00.gif)


### 4. 小结

上面虽然是实现了实时在线人数统计，但是存在一个非常明显的短板问题，那就是只适用于单机的场景，如果后台有多个服务部署，那应该怎么处理呢？


基于此，自然而然想到的就是分布式session 结合 redis 计数来实现，但是这个思路可行么？ 分布式session失效会抛出一个事件么？或许通过监听redis的key失效能处理，但是整体来看，还是有些麻烦，有没有更简单实用的场景呢

且待下文详解


## 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/206-web-loginuser-count](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/206-web-loginuser-count)

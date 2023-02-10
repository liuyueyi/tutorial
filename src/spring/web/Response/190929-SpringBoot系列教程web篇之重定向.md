---
order: 5
title: 5.请求重定向
tag: 
  - response
  - 重定向
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2019-09-29 19:35:48
keywords: SpringBoot SpringMVC 重定向 302 HttpServletResponse
---

前面介绍了spring web篇数据返回的几种常用姿势，当我们在相应一个http请求时，除了直接返回数据之外，还有另一种常见的case -> 重定向；

比如我们在逛淘宝，没有登录就点击购买时，会跳转到登录界面，这其实就是一个重定向。本文主要介绍对于后端而言，可以怎样支持302重定向

<!-- more -->

## I. 环境搭建

首先得搭建一个web应用才有可能继续后续的测试，借助SpringBoot搭建一个web应用属于比较简单的活;

创建一个maven项目，pom文件如下

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.7</version>
    <relativePath/> <!-- lookup parent from update -->
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.45</version>
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

依然是一般的流程，pom依赖搞定之后，写一个程序入口

```java
/**
 * Created by @author yihui in 15:26 19/9/13.
 */
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

## II. 302重定向

### 1. 返回redirect

这种case通常适用于返回视图的接口，在返回的字符串前面添加`redirect:`方式来告诉Spring框架，需要做302重定向处理

```java
@Controller
@RequestMapping(path = "redirect")
public class RedirectRest {

    @ResponseBody
    @GetMapping(path = "index")
    public String index(HttpServletRequest request) {
        return "重定向访问! " + JSON.toJSONString(request.getParameterMap());
    }

    @GetMapping(path = "r1")
    public String r1() {
        return "redirect:/redirect/index?base=r1";
    }
}
```

上面给出了一个简单的demo，当我们访问`/redirect/r1`时，会重定向到请求`/redirect/index?base=r1`，实际测试结果如下

![](/imgs/190929/00.jpg)

注意上面的截图，我们实际访问的连接是 `http://127.0.0.1:8080/redirect/index?base=r1`，在浏览器中的表现则是请求url变成了`http://127.0.0.1:8080/redirect/index?base=r1`；通过控制台查看到的返回头状态码是302

**说明**

- 使用这种方式的前提是不能在接口上添加`@ResponseBody`注解，否则返回的字符串被当成普通字符串处理直接返回，并不会实现重定向

### 2. HttpServletResponse重定向

前面一篇说到SpringMVC返回数据的时候，介绍到可以直接通过`HttpServletResponse`往输出流中写数据的方式，来返回结果；我们这里也是利用它，来实现重定向

```java
@ResponseBody
@GetMapping(path = "r2")
public void r2(HttpServletResponse response) throws IOException {
    response.sendRedirect("/redirect/index?base=r2");
}
```

从上面的demo中，也可以看出这个的使用方式很简单了，直接调用`javax.servlet.http.HttpServletResponse#sendRedirect`，并传入需要重定向的url即可

![](/imgs/190929/01.jpg)


### 3. 小结

这里主要介绍了两种常见的后端重定向方式，都比较简单，这两种方式也有自己的适用场景（当然并不绝对）

- 在返回视图的前面加上`redirect`的方式，更加适用于视图的跳转，从一个网页跳转到另一个网页
- `HttpServletResponse#sendRedirec`的方式更加灵活，可以在后端接收一次http请求生命周期中的任何一个阶段来使用，比如有以下几种常见的场景
  - 某个接口要求登录时，在拦截器层针对所有未登录的请求，重定向到登录页面
  - 全局异常处理中，如果出现服务器异常，重定向到定制的500页面
  - 不支持的请求，重定向到404页面



## II. 其他

### 0. 项目

#### a. 系列博文

- [190913-SpringBoot系列教程web篇之返回文本、网页、图片的操作姿势](http://spring.hhui.top/spring-blog/2019/09/13/190913-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E8%BF%94%E5%9B%9E%E6%96%87%E6%9C%AC%E3%80%81%E7%BD%91%E9%A1%B5%E3%80%81%E5%9B%BE%E7%89%87%E7%9A%84%E6%93%8D%E4%BD%9C%E5%A7%BF%E5%8A%BF/)
- [190905-SpringBoot系列教程web篇之中文乱码问题解决](http://spring.hhui.top/spring-blog/2019/09/05/190905-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3/)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](http://spring.hhui.top/spring-blog/2019/08/31/190831-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E5%A6%82%E4%BD%95%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%99%A8/)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/28/190828-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BPost%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/24/190824-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BGet%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](http://spring.hhui.top/spring-blog/2019/08/22/190822-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BBeetl%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://spring.hhui.top/spring-blog/2019/08/20/190820-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BThymeleaf%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://spring.hhui.top/spring-blog/2019/08/16/190816-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BFreemaker%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)

#### b. 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response)


---
order: 4
title: 4.header参数解析
tag: 
  - WebFlux
category: 
  - SpringBoot
  - WEB系列
  - WebFlux
date: 2020-09-07 08:53:04
keywords: 请求头 header weblfux spring springboot reactor cookies
---

上一篇weblfux主要介绍了path参数的解析与映射关系，在我们进入url参数/post表单之前，先看一下另外的一种参数--请求头中的参数如何处理

<!-- more -->

## I. 项目环境 

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

### 1. 依赖

使用WebFlux，最主要的引入依赖如下（省略掉了SpringBoot的相关依赖，如对于如何创建SpringBoot项目不太清楚的小伙伴，可以关注一下我之前的博文）

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>
```

## II. 请求头参数解析

在实际的业务开发中，有几个请求头出现的频率特别高，如常用于反爬的`User-Agent`，鉴定强求来源的`referer`，跨域相关的`Access-Control-Allow-`，cookie、session自定义的请求头等

### 1. 请求头限制

在`RequestMapping`或`GetMapping`中指定请求头参数时，表示只有请求中包含这个请求头才会匹配过去

```java
/**
 * 只有请求头包含 myheader 且值为 myvalue的才可以访问到
 *
 * - 正常访问: curl 'http://127.0.0.1:8080/header/filter/yihhui' -H 'myheader: myvalue'
 * - 异常访问: curl 'http://127.0.0.1:8080/header/filter/yihhui' -H 'myheader: myvalue2'  因为请求头不匹配，404
 *
 * @param name
 * @return
 */
@GetMapping(path = "/filter/{name}", headers = "myheader=myvalue")
public Mono<String> headerFilter(@PathVariable(name = "name") String name) {
    return Mono.just("request filter: " + name);
}
```

实例如下:

```bash
➜  ~ curl 'http://127.0.0.1:8080/header/filter/yihhui' -H 'myheader: myvalue'
request filter: yihhui%

➜  ~ curl 'http://127.0.0.1:8080/header/filter/yihhui' -H 'myheader: myvalue2'
{"timestamp":"2020-09-07T00:40:34.493+0000","path":"/header/filter/yihhui","status":404,"error":"Not Found","message":null,"requestId":"aa47f5a5"}%   
```

### 2. 请求头参数解析

WebFlux依然是可以通过注解`@RequestHeader`来获取对应的请求头

从使用姿势上来看，webflux与webmvc并没有什么区别

```java
/**
 * 获取请求头
 *
 * curl 'http://127.0.0.1:8080/header/get' -H 'myheader: myvalue' -H 'user-agent: xxxxxxx'
 *
 * @param header  注意，这个是自定义的请求头
 * @param userAgent
 * @return
 */
@GetMapping(path = "get")
public Mono<String> getHeader(@RequestHeader("myheader") String header,
        @RequestHeader("user-agent") String userAgent) {
    return Mono.just("request headers: myheader=" + header + " userAgent=" + userAgent);
}
```

测试case如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/header/get' -H 'myheader: myvalue' -H 'user-agent: xxxxxxx'
request headers: myheader=myvalue userAgent=xxxxxxx%  
```


### 3. cookie获取

利用cookie来标识用户身份可以说是非常普遍的场景了，我们通过专用的`CookieValue`来获取指定的cookies值

```java
/**
 * 获取cookie
 *
 * curl 'http://127.0.0.1:8080/header/cookie' --cookie 'tid=12343123;tt=abc123def'
 *
 * @param tid
 * @return
 */
@GetMapping(path = "cookie")
public Mono<String> getCookie(@CookieValue("tid") String tid) {
    return Mono.just("request cookies tid=" + tid);
}
```

上面的case中，标识只需要获取tid这个cookies值，其他的不care

```bash
➜  ~ curl 'http://127.0.0.1:8080/header/cookie' --cookie 'tid=12343123;tt=abc123def'
request cookies tid=12343123% 
```


## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/223-webflux-params](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/223-webflux-params)

**系列博文**

- [【WBE系列】WebFlux之Path参数解析与url映射](http://spring.hhui.top/spring-blog/2020/08/27/200827-SpringBoot%E7%B3%BB%E5%88%97WebFlux%E4%B9%8BPath%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E4%B8%8Eurl%E6%98%A0%E5%B0%84/)


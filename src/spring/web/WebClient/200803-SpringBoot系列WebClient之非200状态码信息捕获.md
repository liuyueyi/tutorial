---
order: 7
title: 7.非200状态码信息捕获
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-08-03 08:34:21
keywords: Spring SpringBoot WebClient 异步请求
---

前面介绍的WebClient的使用姿势都是基于正常的200状态码返回，当然在实际的使用中，我们并不是总能获取到200的状态码的，在RestTemplate的学习中，我们知道如果不特殊处理，那么是无法正确获取非200状态码的ResponseBody的，会直接抛出异常，那么在WebClient中又应该怎样应对非200状态码返回的场景呢？

<!-- more  -->

## I. 项目环境

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

### 1. 依赖

使用WebClient，最主要的引入依赖如下（省略掉了SpringBoot的相关依赖，如对于如何创建SpringBoot项目不太清楚的小伙伴，可以关注一下我之前的博文）

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 2. REST

一个简单的403返回

```java
@GetMapping(path = "403")
public Mono<String> _403(ServerHttpRequest request, ServerHttpResponse response) throws IOException {
    response.setStatusCode(HttpStatus.FORBIDDEN);
    return Mono.just("403 response body!");
}

```

## II. 实例说明

### 1. retrieve方式

上一篇介绍retrieve与exchange区别的博文中，我们知道retrieve更适用于只希望获取ResponseBody的场景；使用retrieve时，如需要捕获其他状态码的返回，可以如下操作

```java
Mono<String> ans = webClient.get().uri("403").retrieve().onStatus(HttpStatus::is4xxClientError, response -> {
    System.out.println("inner retrieve 403 res: " + response.headers().asHttpHeaders() + "|" + response.statusCode());
    response.bodyToMono(String.class).subscribe(s -> System.out.println("inner res body: " + s));
    return Mono.just(new RuntimeException("403 not found!"));
}).bodyToMono(String.class);
ans.subscribe(s -> System.out.println("retrieve 403 ans: " + s));
```

请注意上面的 `onStatus`， 上面演示的是4xx的捕获，返回如下


```
inner retrieve 403 res: [Content-Type:"text/plain;charset=UTF-8", Content-Length:"18"]|403 FORBIDDEN
```

### 2. exchange方式

exchange本身就可以获取完整的返回信息，所以异常的case需要我们自己在内部进行处理

```java
webClient.get().uri("403").exchange().subscribe(s -> {
    HttpStatus statusCode = s.statusCode();
    ClientResponse.Headers headers = s.headers();
    MultiValueMap<String, ResponseCookie> cookies = s.cookies();
    s.bodyToMono(String.class).subscribe(body -> {
        System.out.println(
                "error response detail: \nheader: " + headers.asHttpHeaders() + "\ncode: " + statusCode +
                        "\ncookies: " + cookies + "\nbody:" + body);
    });
});
```

返回结果如下

```
exchange error response detail: 
header: [Content-Type:"text/plain;charset=UTF-8", Content-Length:"18"]
code: 403 FORBIDDEN
cookies: {}
body:403 response body!
```

## II. 其他

### 0. 项目

**系列博文**

- [【WEB系列】WebClient之retrieve与exchange的使用区别介绍](http://spring.hhui.top/spring-blog/2020/07/28/200728-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8Bretrieve%E4%B8%8Eexchange%E7%9A%84%E4%BD%BF%E7%94%A8%E5%8C%BA%E5%88%AB%E4%BB%8B%E7%BB%8D/)
- [【WEB系列】WebClient之超时设置](http://spring.hhui.top/spring-blog/2020/07/17/200717-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/16/200716-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】WebClient之请求头设置](http://spring.hhui.top/spring-blog/2020/07/14/200714-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%AF%B7%E6%B1%82%E5%A4%B4%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)
- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)


---
order: 4
title: 4.Basic Auth授权
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-07-16 08:10:23
keywords: WebClient SpringBoot Spring Basic Auth Filter headers
---

关于BasicAuth是什么，以及如何实现鉴权的知识点可以在之前的博文 [【WEB系列】RestTemplate之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/04/200704-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/) 中已经介绍过了，因此本篇将直接进入正文，介绍一下如何在WebClient中进行Basic Auth授权

<!-- more -->

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

### 2. REST接口

基于WebFlux提供一个http接口，根据请求头解析Basic Auth是否合法，一个最原始的简单实现方式如下

```java
@GetMapping(path = "auth")
public Mono<String> auth(ServerHttpRequest request, ServerHttpResponse response) throws IOException {
    List<String> authList = request.getHeaders().get("Authorization");
    if (CollectionUtils.isEmpty(authList)) {
        response.setStatusCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION);
        return Mono.just("no auth info!");
    }

    String auth = authList.get(0);
    String[] userAndPass = new String(new BASE64Decoder().decodeBuffer(auth.split(" ")[1])).split(":");
    if (userAndPass.length < 2) {
        response.setStatusCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION);
        return Mono.just("illegal auth info!");
    }

    if (!("user".equalsIgnoreCase(userAndPass[0]) && "pwd".equalsIgnoreCase(userAndPass[1]))) {
        response.setStatusCode(HttpStatus.NON_AUTHORITATIVE_INFORMATION);
        return Mono.just("error auth info!");
    }


    return Mono.just("auth success: " + JSONObject.toJSONString(request.getQueryParams()));
}
```

当鉴权成功之后，正常返回；当鉴权失败之后，返回403状态码，并返回对应的提示信息


## II. Basic Auth鉴权

理解Basic Auth实现原理的小伙伴，可以很简单的实现，比如直接设置请求头

### 1. 设置请求头

直接在WebClient创建的时候，指定默认的请求头即可

```java
// 最原始的请求头设置方式
WebClient webClient = WebClient.builder()
        .defaultHeader("Authorization", "Basic " + Base64Utils.encodeToString("user:pwd".getBytes()))
        .baseUrl("http://127.0.0.1:8080").build();
Mono<ResponseEntity<String>> response =
        webClient.get().uri("/auth?name=一灰灰&age=18").exchange().flatMap(s -> s.toEntity(String.class));
```

### 2. filter方式

在上一篇介绍WebClient请求头的使用姿势中，除了默认请求头设置之外，还有一个filter的方式，而WebClient正好提供了一个专门用于Basic Auth的Filter

```java
// filter方式
webClient = WebClient.builder().filter(ExchangeFilterFunctions.basicAuthentication("user", "pwd"))
        .baseUrl("http://127.0.0.1:8080").build();
response = webClient.get().uri("/auth?name=一灰灰&age=18").exchange().flatMap(s -> s.toEntity(String.class));

response.subscribe(s -> System.out.println("auth return: " + s));
```

### 3. 测试与小结

以上代码可以在后文的工程源码中获取，测试输出如下

```
header auth return: <200 OK OK,auth success: {"name":["一灰灰"],"age":["18"]},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"49"]>
filter auth return: <200 OK OK,auth success: {"name":["一灰灰"],"age":["18"]},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"49"]>
```

本文主要介绍了两种WebClient的Basic Auth使用姿势，其原理都是基于设置请求头的方式来实现的

- 基于`WebClient.builder().defaultHeader`来手动设置默认请求头
- 基于`WebClient.builder().filter`与`ExchangeFilterFunctions.basicAuthentication`，通过filter来处理请求头


## II. 其他

### 0. 项目

**系列博文**

- [【WEB系列】WebClient之请求头设置](http://spring.hhui.top/spring-blog/2020/07/14/200714-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%AF%B7%E6%B1%82%E5%A4%B4%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)
- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)


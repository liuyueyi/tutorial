---
order: 5
title: 5.超时设置
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-07-17 08:28:12
keywords: Spring SpringBoot WebClient React WebFlux 超时 timeout
---

为所有的第三方接口调用设置超时时间是一个比较推荐的做法，避免自己的任务被所依赖的服务给拖死；在WebClient发起的异步网络请求调用中，应该如何设置超时时间呢?

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

基于WebFlux提供一个http接口，内部sleep 5s，来响应后续的超时case

```java
@GetMapping(path = "timeout")
public Mono<String> timeout(String name, Integer age) throws InterruptedException {
    Thread.sleep(5_000);
    return Mono.just("timeout req: " + name + " age: " + age);
}
```

## II. 超时

> 本篇实例主要来自于官方文档: [webflux-client-builder-reactor-timeout](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-client-builder-reactor-timeout)

### 1. 实例演示

在WebClient的创建中，实际上并没有找到有设置超时的入口，基于之前RestTemplate的超时设置中的经验，我们可能需要将目标放在更底层实现网络请求的HttpClient上

```java
// 设置连接超时时间为3s
HttpClient httpClient = HttpClient.create().tcpConfiguration(client -> client.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3_000)
        .doOnConnected(
              conn -> conn.addHandlerLast(new ReadTimeoutHandler(3))
                      .addHandlerLast(new WriteTimeoutHandler(3))));
```

上面虽然获取了一个带超时设置的HttpCilent，但是我们需要用它来设置WebClient，这里就需要借助`WebClient.builder().clientConnector`来实现了

```java
// 设置httpclient
WebClient webClient = WebClient.builder().baseUrl("http://127.0.0.1:8080")
        .clientConnector(new ReactorClientHttpConnector(httpClient)).build();

Mono<ResponseEntity<String>> ans =
        webClient.get().uri("/timeout").exchange().flatMap(s -> s.toEntity(String.class));
ans.subscribe(s -> System.out.println("timeout res code: " + s.getStatusCode()));
```

### 2. 测试与小结

本文所有源码可以在后面的项目地址中获取，测试输出结果如下

![](/imgs/200717/00.jpg)

虽然上面的输出提示了超时，但是奇怪的是居然不像RestTemplate的超时抛异常，上面这个流程可以正常走通，那么如何捕获这个超时异常呢，WebClient访问出现非200状态码返回的又可以如何处理呢，下篇博文将给与介绍

**小结**

- 通过`HttpClient`来设置超时时间
- 借助`WebClient.builder().clientConnector(new ReactorClientHttpConnector(httpClient))`来绑定HttpClient




## II. 其他

### 0. 项目

**系列博文**

- [【WEB系列】WebClient之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/16/200716-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】WebClient之请求头设置](http://spring.hhui.top/spring-blog/2020/07/14/200714-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%AF%B7%E6%B1%82%E5%A4%B4%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)
- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)



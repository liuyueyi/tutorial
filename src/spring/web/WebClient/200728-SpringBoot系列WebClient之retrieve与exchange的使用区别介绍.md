---
order: 6
title: 6.retrieve与exchange的使用区别介绍
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-07-28 08:52:48
keywords: webflux react webclient 异步请求 SpringBoot Spring
---

前面介绍了几篇WebCilent的使用姿势博文，其中大部分的演示case，都是使用`retrieve`来获取返回ResponseBody，我国我们希望获取更多的返回信息，比如获取返回头，这个时候exchange则是更好的选择；

本文将主要介绍一下，在WebClient中retrieve和exchange的各自使用场景

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

添加一个简单的Rest接口，用于后续的测试

```java
@GetMapping(path = "get")
public Mono<String> get(String name, Integer age) {
    return Mono.just("req: " + name + " age: " + age);
}
```

## II. 实例演示

通过前面的几篇学习，我们知道WebClient发起请求的一般使用姿势如下

```java
Mono<ClientResponse> res = webCient.get().uri(xxx).exchange()
WebClient.ResponseSpec responseSpec = webClient.get().uri(xxx).retrieve()
```

这两个方法都是用来获取返回结果的，最大的区别在于通过exchange接收完整的ResponseEntity；而retrieve接收的则是ResponseBody

### 1. exchange使用实例

> The exchange() method provides more control than the retrieve method, provides access to the ClientResponse

下面给出一个简单的，获取返回的状态码，cookies等请求头信息的case

```java
WebClient webClient = WebClient.create("http://127.0.0.1:8080");

  // 返回结果
  Mono<ClientResponse> res = webClient.get().uri("/get?name={1}&age={2}", "一灰灰", 18).exchange();
  res.subscribe(s -> {
      HttpStatus statusCode = s.statusCode();
      ClientResponse.Headers headers = s.headers();
      MultiValueMap<String, ResponseCookie> ans = s.cookies();
      s.bodyToMono(String.class).subscribe(body -> {
          System.out.println(
                  "response detail: \nheader: " + headers.asHttpHeaders() + "\ncode: " + statusCode + "\ncookies: " + ans +
                          "\nbody:" + body);
      });
  });
```

上面这段代码中，主要的核心点就是`ClientResponse`的解析，可以直接通过它获取返回头，响应状态码，其次提供了一些对ResponseBody的封装调用

返回结果

```
response detail: 
header: [Content-Type:"text/plain;charset=UTF-8", Content-Length:"22"]
code: 200 OK
cookies: {}
body:req: 一灰灰 age: 18
```

如果我们只关注ResponseBody，用exchange也是可以直接写的，如下，相比retrieve稍微饶了一道

```java
Mono<String> result = client.get()
        .uri("/get?name={1}&age={2}", "一灰灰", 18).accept(MediaType.APPLICATION_JSON)
        .exchange()
        .flatMap(response -> response.bodyToMono(String.class));
```

另外一个更加推荐的写法是直接返回`Mono<ResponseEntity<?>>`，更友好的操作姿势，返回结果如下

```
response detail2: 
code: 200 OK
headers: [Content-Type:"text/plain;charset=UTF-8", Content-Length:"22"]
body: req: 一灰灰 age: 18
```

### 2. retrieve使用实例

> The retrieve() method is the easiest way to get a response body and decode it.

前面已经多次演示retrieve的使用姿势，基本上是在后面带上`bodyToMono`或`bodyToFlux`来实现返回实体的类型转换

```java
WebClient webClient = WebClient.create("http://127.0.0.1:8080");

Mono<String> ans = webClient.get().uri("/get?name={1}", "一灰灰").retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("basic get with one argument res: " + s));
```

### 3. 小结

对于retrieve与exchange来说，最简单也是最根本的区别在于，是否需要除了ResponseBody之外的其他信息

- 如果只关注`ResponseBody`: 推荐使用`retrieve`
- 如果还需要获取其他返回信息: 请选择`exchange`


## II. 其他

### 0. 项目
**系列博文**

- [【WEB系列】WebClient之超时设置](http://spring.hhui.top/spring-blog/2020/07/17/200717-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/16/200716-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】WebClient之请求头设置](http://spring.hhui.top/spring-blog/2020/07/14/200714-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%AF%B7%E6%B1%82%E5%A4%B4%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)
- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)



---
order: 9
title: 9.同步与异步
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-08-20 15:10:42
keywords: SpringBoot SpringBlog WebClient RestTemplate
---

回顾一下最开始介绍WebClient的使用姿势之前，我们介绍了AsyncRestTemplate来实现异步的网络请求；但是在Spring5之后，官方推荐使用WebClient来替换AsyncRestTemplate实现异步请求；所以一般来讲，WebClient适用于异步的网络访问，但是，假设我需要同步获取返回结果，可行么？

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

### 2. 测试接口

```java
@GetMapping(path = "get")
public Mono<String> get(String name, Integer age) {
    return Mono.just("req: " + name + " age: " + age);
}

@GetMapping(path = "mget")
public Flux<String> mget(String name, Integer age) {
    return Flux.fromArray(new String[]{"req name: " + name, "req age: " + age});
}
```

## II. 同步返回

需要同步返回结果还是比较简单的，获取对应的Mono/Flux之后调用一下`block()`方法即可，但是需要注意，这里也有一个潜在的坑

### 1. 实现方式

```java
public void sync() {
    // 同步调用的姿势

    // 需要特别注意，这种是使用姿势，不能在响应一个http请求的线程中执行；
    // 比如这个项目中，可以通过  http://127.0.0.1:8080/test 来调用本类的测试方法；但本方法如果被这种姿势调用，则会抛异常；
    // 如果需要正常测试，可以看一下test下的调用case

    WebClient webClient = WebClient.create("http://127.0.0.1:8080");

    String ans = webClient.get().uri("/get?name=一灰灰").retrieve().bodyToMono(String.class).block();
    System.out.println("block get Mono res: " + ans);


    Map<String, Object> uriVariables = new HashMap<>(4);
    uriVariables.put("p1", "一灰灰");
    uriVariables.put("p2", 19);

    List<String> fans =
            webClient.get().uri("/mget?name={p1}&age={p2}", uriVariables).retrieve().bodyToFlux(String.class)
                    .collectList().block();
    System.out.println("block get Flux res: " + fans);
}
```

项目启动之后，我们写一个测试类来调用这个方法

```java
@Test
public void sync() {
    WebClientTutorial web = new WebClientTutorial();
    web.sync();
}
```

如果我们换成下面这种写法，就会报错了

```java
@GetMapping(path = "test")
public String test() {
    WebClientTutorial web = new WebClientTutorial();
    web.sync();
    return "over";
}
```

![](/imgs/200820/00.jpg)


## III. 其他

### 0. 项目

**系列博文**

- [【WEB系列】WebClient之策略设置](http://spring.hhui.top/spring-blog/2020/08/11/200811-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E7%AD%96%E7%95%A5%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之非200状态码信息捕获](http://spring.hhui.top/spring-blog/2020/08/03/200803-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E9%9D%9E200%E7%8A%B6%E6%80%81%E7%A0%81%E4%BF%A1%E6%81%AF%E6%8D%95%E8%8E%B7/)
- [【WEB系列】WebClient之retrieve与exchange的使用区别介绍](http://spring.hhui.top/spring-blog/2020/07/28/200728-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8Bretrieve%E4%B8%8Eexchange%E7%9A%84%E4%BD%BF%E7%94%A8%E5%8C%BA%E5%88%AB%E4%BB%8B%E7%BB%8D/)
- [【WEB系列】WebClient之超时设置](http://spring.hhui.top/spring-blog/2020/07/17/200717-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/16/200716-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】WebClient之请求头设置](http://spring.hhui.top/spring-blog/2020/07/14/200714-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E8%AF%B7%E6%B1%82%E5%A4%B4%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)
- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)



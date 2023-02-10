---
order: 8
title: 8.策略设置
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-08-11 09:01:27
keywords: WebClient SpringBoot Spring 异步请求
---

在前面介绍WebClient的常见参数中，有一个`exchangeStrategies`参数设置，通过它我们可以设置传输数据的内存占用大小限制，避免内存问题；也可以通过它设置数据的编解码

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
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Body implements Serializable {
    private static final long serialVersionUID = 1210673970258821332L;
    String name;
    Integer age;
}

@GetMapping(path = "get")
public Mono<String> get(String name, Integer age) {
    return Mono.just("req: " + name + " age: " + age);
}

@PostMapping(path = "body2")
public Mono<Body> postBody2(@RequestBody  Body body) {
    return Mono.just(body);
}
```

## II. 使用说明

### 1. MaxInMemorySize设置

默认情况下，内存中接收数据的buffering data size为256KB，可以根据实际的需要进行改大or调小


```java
// 默认允许的内存空间大小为256KB，可以通过下面的方式进行修改
webClient = WebClient.builder().exchangeStrategies(
        ExchangeStrategies.builder().codecs(codec -> codec.defaultCodecs().maxInMemorySize(10)).build())
        .baseUrl("http://127.0.0.1:8080").build();

String argument = "这也是一个很长很长的文本，用于测试超出上限!";
Mono<String> ans = webClient.get().uri("/get?name={1}", argument).retrieve().bodyToMono(String.class)
        // 异常处理
        .doOnError(WebClientResponseException.class, err -> {
            System.out.println(err.getRawStatusCode() + "," + err.getResponseBodyAsString());
            throw new RuntimeException(err.getMessage());
        }).onErrorReturn("fallback");
ans.subscribe(s -> System.out.println("exchange strategy: " + ans));
```

### 2. 编解码设置

比如最常见的json编解码

```java
WebClient webClient = WebClient.builder().exchangeStrategies(ExchangeStrategies.builder().codecs(codec -> {
    codec.customCodecs().decoder(new Jackson2JsonDecoder());
    codec.customCodecs().encoder(new Jackson2JsonEncoder());
}).build()).baseUrl("http://127.0.0.1:8080").build();
Body body = new Body("一灰灰😝", 18);
Mono<Body> ans =
        webClient.post().uri("/body2").contentType(MediaType.APPLICATION_JSON).bodyValue(body).retrieve()
                .bodyToMono(Body.class);
ans.subscribe(s -> System.out.println("retreive res: " + s));
```


上面两个测试之后，返回结果如下

![IMAGE](/imgs/200811/00.jpg)


## II. 其他

### 0. 项目

**系列博文**

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




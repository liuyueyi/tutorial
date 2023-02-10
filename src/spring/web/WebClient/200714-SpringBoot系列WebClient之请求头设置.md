---
order: 3
title: 3.请求头设置
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-07-14 08:30:20
keywords: SpringBoot WebFlux WebClient 请求头
---

在网络请求中，根据请求头的参数来做校验属于比较常见的一种case了，很多场景下我们发起的请求都需要额外的去设置请求头，本文将介绍WebClient设置请求头的两种姿势

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

基于WebFlux提供一个http接口，返回请求参数与请求头(关于webflux的用法在后续的WebFlux系列篇中给与介绍)

```java
/**
 * 返回请求头
 *
 * @return
 */
@GetMapping(path = "withHeader")
public Mono<String> withHeader(ServerHttpRequest request) {
    HttpHeaders headers = request.getHeaders();
    MultiValueMap<String, String> params = request.getQueryParams();
    return Mono.just("-->headers: " + JSONObject.toJSONString(headers) + ";\t-->params:" +
            JSONObject.toJSONString(params));
}
```

## II. 设置请求头

### 1. 默认请求头

在第一篇介绍WebClient创建的几种姿势中，`WebClient.builder()`方式创建时，可以指定默认的请求头，因此我们可以在创建时指定

```java
// 1. 在创建时，指定默认的请求头
WebClient webClient = WebClient.builder().defaultHeader("User-Agent", "SelfDefine Header")
        .defaultHeader("referer", "localhost").baseUrl("http://127.0.0.1:8080").build();

Mono<String> ans =
        webClient.get().uri("/withHeader?name={1}&age={2}", "一灰灰", 19).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("basic get with default header return: " + s));
```

通过上面这种方式创建的webclient，所有的请求都会携带`User-Agent: SelfDefine Header`这个请求头哦

### 2. filter方式

除了上面这种姿势之外，WebClient还支持了Filter，对于Filter你可以将它理解为Servlet中的Filter，主要用于在发起请求时，做一些过滤操作，因此我们完全可以写一个塞入自定义请求头的Filter

```java
// 2. 使用filter
webClient = WebClient.builder().filter((request, next) -> {
    ClientRequest filtered = ClientRequest.from(request).header("filter-header", "self defined header").build();
    // 下面这一行可不能忘记，不然会出大事情
    return next.exchange(filtered);
}).baseUrl("http://127.0.0.1:8080").build();
ans = webClient.get().uri("/withHeader?name={1}&age={2}", "一灰灰", 19).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("basic get with filter header return: " + s));
```


请注意上面添加`header`的用法

### 3. 测试&小结

关于详细的测试代码可以在下面的工程源码中获取，下面给出上面两种姿势的返回结果

```
basic get with default header return: -->headers: {"accept-encoding":["gzip"],"host":["127.0.0.1:8080"],"accept":["*/*"],"User-Agent":["SelfDefine Header"],"referer":["localhost"]};	-->params:{"name":["一灰灰"],"age":["19"]}
basic get with filter header return: -->headers: {"accept-encoding":["gzip"],"user-agent":["ReactorNetty/0.9.1.RELEASE"],"host":["127.0.0.1:8080"],"accept":["*/*"],"filter-header":["self defined header"]};	-->params:{"name":["一灰灰"],"age":["19"]}
```

**小结：**

本文介绍两种请求头的设置方式

- 通过`WebClient.builder`在创建时，通过`defaultHeader`指定默认的请求头
- 借助Filter，主动在`Request`中塞入请求头

## III. 其他

### 0. 项目

**系列博文**

- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)
- [【WEB系列】WebClient之文件上传](http://spring.hhui.top/spring-blog/2020/07/13/200713-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)



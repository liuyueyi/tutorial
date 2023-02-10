---
order: 10
title: 10.连接池配置
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-23 08:39:19
keywords: RestTemplate ConnectionPool 连接池 网络请求 HTTP
---

我又回来更新RestTemplate了，前面更完之后忽然发现还漏了两个常用的场景，连接池的配置以及错误重试，这就迅速的把这个补上；本篇主要介绍RestTemplate如何设置连接池

<!-- more -->


## I. 项目搭建

本项目基于SpringBoot `2.2.1.RELEASE` + `maven 3.5.3` + `idea`进行开发

### 1. pom依赖

核心pom依赖如下

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
</dependency>
```

请注意，我们这里引入的依赖，多了一个`httpclient`，在下面的连接池配置中，主要借助它的连接池管理来创建HttpClient对象

## II. 使用姿势

### 1. 连接池配置

一般来讲，借助`httpcomponents`这个包进行连接池配置时，可以分为三步

**初始化连接池管理类**

```java
// 连接池管理
PoolingHttpClientConnectionManager poolingConnectionManager = new PoolingHttpClientConnectionManager();
// 连接池最大连接数
poolingConnectionManager.setMaxTotal(1000);
// 每个主机的并发
poolingConnectionManager.setDefaultMaxPerRoute(100);
// 可用空闲连接过期时间
poolingConnectionManager.setValidateAfterInactivity(10_000);
```

**HttpClient构造器**

```java
HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();
httpClientBuilder.setConnectionManager(poolingConnectionManager);
```

**RestTemplate RequestFactory创建**

```java
HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
requestFactory.setHttpClient(httpClientBuilder.build());
// 连接超时时间/毫秒
requestFactory.setConnectTimeout(3000); 
// 读写超时时间/毫秒
requestFactory.setReadTimeout(3000);
// 请求超时时间/毫秒
requestFactory.setConnectionRequestTimeout(5000);
```

到这里基本上就是前面的初始化RestTemplate的环节了

```java
// 创建restemplate对象，并制定 RequestFactory
RestTemplate restTemplate = new RestTemplate();
restTemplate.setRequestFactory(requestFactory);
```

### 2. OkHttp方式

对于RestTemplate的HttpClient执行库，除了上面的`httpcomponents`之外，还有一个OkHttp目前也是大受欢迎，如果我们使用OkHttp，那么可以怎么设置呢?

首先依然是引入依赖

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
</dependency>
```

其次和上面三步骤差不多的设置

**初始化连接池**

```java
// 设置连接池参数，最大空闲连接数200，空闲连接存活时间10s
ConnectionPool connectionPool = new ConnectionPool(200, 10, TimeUnit.SECONDS);
```

**创建OkHttpClient**

注意这里和上面是有区别的，前面是构建HttpClient构造器，而这里直接生成了一个OkHttpClient，内置连接池

```java
OkHttpClient okHttpClient =
      new OkHttpClient.Builder().retryOnConnectionFailure(false).connectionPool(connectionPool)
              .connectTimeout(3, TimeUnit.SECONDS).readTimeout(3, TimeUnit.SECONDS)
              .writeTimeout(3, TimeUnit.SECONDS).build();
```

**RestTemplate RequestFactory创建**

```java
ClientHttpRequestFactory factory = new OkHttp3ClientHttpRequestFactory(okHttpClient);
```

最后就是创建`RestTemplate`了

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.setRequestFactory(factory);
```


## II. 其他

### 0. 项目&系列博文

**博文**

- [【WEB系列】RestTemplate之文件上传](http://spring.hhui.top/spring-blog/2020/07/10/200710-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)
- [【WEB系列】AsyncRestTemplate之异步非阻塞网络请求介绍篇](http://spring.hhui.top/spring-blog/2020/07/07/200707-SpringBoot%E7%B3%BB%E5%88%97AsyncRestTemplate%E4%B9%8B%E5%BC%82%E6%AD%A5%E9%9D%9E%E9%98%BB%E5%A1%9E%E7%BD%91%E7%BB%9C%E8%AF%B7%E6%B1%82%E4%BB%8B%E7%BB%8D%E7%AF%87/)
- [【WEB系列】RestTemplate之非200状态码信息捕获](http://spring.hhui.top/spring-blog/2020/07/05/200705-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E9%9D%9E200%E7%8A%B6%E6%80%81%E7%A0%81%E4%BF%A1%E6%81%AF%E6%8D%95%E8%8E%B7/)
- [【WEB系列】RestTemplate之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/04/200704-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】RestTemplate之代理访问](http://spring.hhui.top/spring-blog/2020/07/03/200703-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%BB%A3%E7%90%86%E8%AE%BF%E9%97%AE/)
- [【WEB系列】RestTemplate之超时设置](http://spring.hhui.top/spring-blog/2020/07/02/200702-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】RestTemplate之中文乱码问题fix](http://spring.hhui.top/spring-blog/2020/07/01/200701-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98fix/)
- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


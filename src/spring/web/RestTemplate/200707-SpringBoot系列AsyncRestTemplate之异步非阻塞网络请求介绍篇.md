---
order: 8
title: 8.异步非阻塞网络请求介绍篇
tag: 
  - AsyncRestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-07 08:02:35
keywords: Spring SpringBoot RestTemplate AsyncRestTemplate 异步请求
---

AsyncRestTemplate发起异步网络请求，由Spring4.0引入，但是在5.0就被表上了删除注解，官方推荐使用基于React的WebClient来代替。

虽然官方已经不推荐使用`AsyncRestTemplate`，但是如果你的web项目，并不想引入react相关的包，使用`AsyncRestTemplate`来实现异步网络请求也不失为一个选择，本文将主要介绍它的基本使用姿势

<!-- more -->

## I. 项目环境

本文创建的实例工程采用`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `idea`进行开发

### 1. pom依赖

具体的SpringBoot项目工程创建就不赘述了，对于pom文件中，需要重点关注下面两个依赖类

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**请注意我们并没有引入react相关的包，所以是没法直接使用webclient的**

简单的配置一下logback的日志输出（非必要条件）, `application.yml`文件内容如下

```yaml
logging:
  pattern:
    console: (%msg%n%n){blue}
```

### 2. 测试接口

编写几个简单的用于测试的REST接口

```java
@GetMapping(path = "atimeout")
public String aTimeOut(HttpServletRequest request) throws InterruptedException {
    Thread.sleep(3_000L);
    return "time out!" + JSON.toJSONString(request.getParameterMap());
}

@GetMapping(path = "4xx")
public String _4xx(HttpServletRequest request, HttpServletResponse response) {
    response.setStatus(401);
    return "return 401 : " + JSON.toJSONString(request.getParameterMap());
}
```


## II. 使用说明

从接口声明上来看，AsyncRestTemplate与RestTemplate的使用姿势没有什么区别，如典型的GET/POST接口声明如下

```java
// GET
@Override
public <T> ListenableFuture<ResponseEntity<T>> getForEntity(String url, Class<T> responseType, Object... uriVariables) throws RestClientException 

@Override
public <T> ListenableFuture<ResponseEntity<T>> getForEntity(String url, Class<T> responseType,
		Map<String, ?> uriVariables) throws RestClientException

@Override
public <T> ListenableFuture<ResponseEntity<T>> getForEntity(URI url, Class<T> responseType)
		throws RestClientException 

//POST
@Override
public <T> ListenableFuture<ResponseEntity<T>> postForEntity(String url, @Nullable HttpEntity<?> request,
		Class<T> responseType, Object... uriVariables) throws RestClientException 

@Override
public <T> ListenableFuture<ResponseEntity<T>> postForEntity(String url, @Nullable HttpEntity<?> request,
		Class<T> responseType, Map<String, ?> uriVariables) throws RestClientException 

@Override
public <T> ListenableFuture<ResponseEntity<T>> postForEntity(URI url,
		@Nullable HttpEntity<?> request, Class<T> responseType) throws RestClientException 
```

### 1. 使用姿势

GET/POST的访问姿势就不再赘述，有兴趣的小伙伴可以查看RestTemplate的使用博文：[【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/17/200617-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%E5%B0%8F%E7%BB%93/)

注意到不同的点在于返回的对象，`RestTemplate`是直接返回实体；而`AsyncRestTemplate`返回的则是`ListenerableFuture`包装的结果，这个类属于Spring自定义对象，继承自Future体系，而Future是我们并发编程中用于获取异步结果的一个接口

`ListenerableFuture`的最大特点在于它可以绑定执行完成的监听器，就不需要通过get来阻塞获取结果了，一个简单的使用姿势如下, 分别演示正常返回，异常返回的回调case（两者都不会阻塞主线程的执行哦）

```java
AsyncRestTemplate asyncRestTemplate = new AsyncRestTemplate();

long start = System.currentTimeMillis();
ListenableFuture<ResponseEntity<String>> response =
        asyncRestTemplate.getForEntity("http://127.0.0.1:8080/atimeout?name=一灰灰&age=20", String.class);

response.addCallback(new ListenableFutureCallback<ResponseEntity<String>>() {
    @Override
    public void onFailure(Throwable throwable) {
        log.info("1. Async get error! cost: {}, e: {}", System.currentTimeMillis() - start, throwable);
    }

    @Override
    public void onSuccess(ResponseEntity<String> stringResponseEntity) {
        String ans = stringResponseEntity.getBody();
        log.info("1. success get: {}, cost: {}", ans, System.currentTimeMillis() - start);
    }
});

response = asyncRestTemplate.getForEntity("http://127.0.0.1:8080/4xx?name=一灰灰&age=20", String.class);
response.addCallback(new ListenableFutureCallback<ResponseEntity<String>>() {
    @Override
    public void onFailure(Throwable ex) {
        log.info("2. Async get error! cost: {}, e: {}", System.currentTimeMillis() - start, ex);
    }

    @Override
    public void onSuccess(ResponseEntity<String> result) {
        log.info("2. success get: {}, cost: {}", result, System.currentTimeMillis() - start);
    }
});
log.info("do something else!!!");
```

请注意下面的动图，主线程的`do something else!!!`文案会优先输出，并不会被阻塞；然后就是返回结果之后的回调，因为第一个case访问的rest服务有个sleep，所以输出也会有一个明显的滞后

![](/imgs/200707/00.gif)

### 2. Guava方式的异步请求

除了上面说到的AsyncRestTemplate来实现异步访问，我们也可以借助Gauva配合`RestTemplate`来实现类似的效果，下面作为扩展知识点，给出一个等效的使用说明

```java
public void guava() {
    ExecutorService executorService = Executors.newFixedThreadPool(1);
    // 基于jdk线程池，创建支持异步回调的线程池
    ListeningExecutorService listeningExecutorService = MoreExecutors.listeningDecorator(executorService);

    long start = System.currentTimeMillis();
    // 具体的异步访问任务
    com.google.common.util.concurrent.ListenableFuture<HttpEntity<String>> ans =
            listeningExecutorService.submit(new Callable<HttpEntity<String>>() {
                @Override
                public HttpEntity<String> call() throws Exception {
                    RestTemplate restTemplate = new RestTemplate();
                    return restTemplate
                            .getForEntity("http://127.0.0.1:8080/atimeout?name=一灰灰&age=19", String.class);
                }
            });

    // 完成之后，在指定的线程池（第三个参数）中回调
    Futures.addCallback(ans, new com.google.common.util.concurrent.FutureCallback<HttpEntity<String>>() {
        @Override
        public void onSuccess(@Nullable HttpEntity<String> stringHttpEntity) {
            log.info("guava call back res: {}, cost: {}", stringHttpEntity.getBody(),
                    System.currentTimeMillis() - start);
        }

        @Override
        public void onFailure(Throwable throwable) {
            log.info("guava call back failed cost:{}, e: {}", System.currentTimeMillis() - start, throwable);
        }
    }, Executors.newFixedThreadPool(1));

    log.info("do something other in guava!");
    listeningExecutorService.shutdown();
}
```

看到这里自然而然会有一个疑问，异步任务完成的回调，是怎么实现呢？

欢迎各位小伙伴评论给出看法





## II. 其他

### 0. 项目&系列博文

**博文**

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


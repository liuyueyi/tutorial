---
order: 4
title: 4.超时设置
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-02 08:03:21
keywords: Spring RestTemplate 中文乱码 超时
---

一般来讲我们访问外部资源时，需要做一个保护，比如最常见的添加一个超时设置，避免一直被阻塞，RestTemplate可以通过`SimpleClientHttpRequestFactory`来处理超时设置

<!-- more -->

## I. RestTemplate超时设置

> 博文测试项目完全基于[【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/17/200617-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%E5%B0%8F%E7%BB%93/)的项目环境，建议配合查看

基本环境：`IDEA` + `maven` + `SpringBoot 2.2.1.RELEASE`

### 1. 超时端点

添加一个超时模拟的端点如下

```java
private String getHeaders(HttpServletRequest request) {
    Enumeration<String> headerNames = request.getHeaderNames();
    String name;

    JSONObject headers = new JSONObject();
    while (headerNames.hasMoreElements()) {
        name = headerNames.nextElement();
        headers.put(name, request.getHeader(name));
    }
    return headers.toJSONString();
}

private String getParams(HttpServletRequest request) {
    return JSONObject.toJSONString(request.getParameterMap());
}

private String getCookies(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null || cookies.length == 0) {
        return "";
    }

    JSONObject ck = new JSONObject();
    for (Cookie cookie : cookies) {
        ck.put(cookie.getName(), cookie.getValue());
    }
    return ck.toJSONString();
}

private String buildResult(HttpServletRequest request) {
    return buildResult(request, null);
}

private String buildResult(HttpServletRequest request, Object obj) {
    String params = getParams(request);
    String headers = getHeaders(request);
    String cookies = getCookies(request);

    if (obj != null) {
        params += " | " + obj;
    }

    return "params: " + params + "\nheaders: " + headers + "\ncookies: " + cookies;
}

@GetMapping(path = "timeout")
public String timeOut(HttpServletRequest request) throws InterruptedException {
    Thread.sleep(60_000L);
    return buildResult(request);
}
```

### 2. 超时设置

主要是通过设置`SimpleClientHttpRequestFactory`来设置超时

```java
/**
 * 设置超时时间
 */
public void timeOut() {
    RestTemplate restTemplate = new RestTemplate();

    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(1000);
    requestFactory.setReadTimeout(1000);
    restTemplate.setRequestFactory(requestFactory);
    long start = System.currentTimeMillis();
    try {
        log.info("timeOut start: {}", start);
        HttpEntity<String> response =
                restTemplate.getForEntity("http://127.0.0.1:8080/timeout?name=一灰灰&age=20", String.class);
        log.info("timeOut cost:{} response: {}", System.currentTimeMillis() - start, response);
    } catch (Exception e) {
        log.info("timeOut cost:{} exception: {}", System.currentTimeMillis() - start, e.getMessage());
    }
}
```

输出如下:

```
(timeOut start: 1593420406204

(timeOut cost:1014 exception: I/O error on GET request for "http://127.0.0.1:8080/timeout": Read timed out; nested exception is java.net.SocketTimeoutException: Read timed out
```


## II. 其他

### 1. 源码&系列博文

**博文**

- [【WEB系列】RestTemplate之中文乱码问题fix](http://spring.hhui.top/spring-blog/2020/07/01/200701-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98fix/)
- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)



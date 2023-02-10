---
order: 6
title: 6.Basic Auth授权
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-04 09:53:31
keywords: Spring RestTemplate basic auth 鉴权 登录验证
---

前面介绍的RestTemplate的所有使用姿势都是不需要鉴权的，然而实际情况可不一定都这么友好；Http Basic Auth属于非常基础的一种鉴权方式了，将用户名和密码以Base64编码之后，携带在请求头，从而实现身份校验；

本文将主要介绍RestTemplate实现Basic Auth鉴权的几种姿势

<!-- more -->

## I. 项目环境

> 博文测试项目完全基于[【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/17/200617-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%E5%B0%8F%E7%BB%93/)的项目环境，建议配合查看

基本环境：`IDEA` + `maven` + `SpringBoot 2.2.1.RELEASE`

### 1. 鉴权端点

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

/**
 * 标准的http auth验证
 *
 * @param request
 * @param response
 * @return
 * @throws IOException
 */
@GetMapping(path = "auth")
public String auth(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String auth = request.getHeader("Authorization");
    if (StringUtils.isEmpty(auth)) {
        response.setStatus(401);
        response.setHeader("WWW-Authenticate", "Basic realm=\"input username and password\"");
        return buildResult(request) + "\n>>>no auth header";
    }

    String[] userAndPass = new String(new BASE64Decoder().decodeBuffer(auth.split(" ")[1])).split(":");
    if (userAndPass.length < 2) {
        response.setStatus(401);
        response.setHeader("WWW-Authenticate", "Basic realm=\"input username and password\"");
        return buildResult(request) + "\n>>>illegal auth: " + auth;
    }

    if ("user".equalsIgnoreCase(userAndPass[0]) && "pwd".equalsIgnoreCase(userAndPass[1])) {
        return buildResult(request) + "\n>>>auth: success!";
    }

    response.setStatus(401);
    response.setHeader("WWW-Authenticate", "Basic realm=\"input username and password\"");
    return buildResult(request) + "\n>>>illegal user or pwd!";
}
```

一个简单的鉴权逻辑如上，从请求头中拿到`Authorization`对应的value，并解析用户名密码，如果满足则正确返回；如果不存在or不满足，则返回http状态码为401，并携带对应的提示信息

## II. Basic Auth鉴权姿势

### 1. 请求头方式

最基础的一种是实现方式，完全根据Basic Auth的规则来，既然是校验请求头，那么我直接在请求头中加上即可

```java
RestTemplate restTemplate = new RestTemplate();

// 1. 最原始的办法，直接在请求头中处理
HttpHeaders headers = new HttpHeaders();
headers.set("Authorization", "Basic " + Base64Utils.encodeToString("user:pwd".getBytes()));

HttpEntity<String> ans = restTemplate
        .exchange("http://127.0.0.1:8080/auth?name=一灰灰&age=20", HttpMethod.GET, new HttpEntity<>(null, headers),
                String.class);
log.info("auth by direct headers: {}", ans);
```

输出

```
(auth by direct headers: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"authorization":"Basic dXNlcjpwd2Q=","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
>>>auth: success!,[Content-Type:"text/plain;charset=UTF-8", Content-Length:"264", Date:"Mon, 29 Jun 2020 09:46:06 GMT"]>
```

### 2. 拦截器方式

上面的方式不太通用，借助前面的请求头设置姿势，如果有通用的需求，借助拦截器是一个好的选择

```java
// 2. 借助拦截器的方式来实现塞统一的请求头
ClientHttpRequestInterceptor interceptor = (httpRequest, bytes, execution) -> {
    httpRequest.getHeaders().set("Authorization", "Basic " + Base64Utils.encodeToString("user:pwd".getBytes()));
    return execution.execute(httpRequest, bytes);
};
restTemplate.getInterceptors().add(interceptor);
ans = restTemplate.getForEntity("http://127.0.0.1:8080/auth?name=一灰灰&age=20", String.class);
log.info("auth by interceptor: {}", ans);
```

输出

```
(auth by interceptor: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"authorization":"Basic dXNlcjpwd2Q=","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
>>>auth: success!,[Content-Type:"text/plain;charset=UTF-8", Content-Length:"264", Date:"Mon, 29 Jun 2020 09:46:06 GMT"]>
```


### 3. 标准验证拦截器

上面的拦截器主要还是我们自己来设置请求头，实际上Spring已经提供了标准的`BasicAuthenticationInterceptor`来实现我们的需求

```java
// 3. 实际上RestTemplate提供了标准的验证拦截器
restTemplate = new RestTemplate();
restTemplate.getInterceptors().add(new BasicAuthenticationInterceptor("user", "pwd"));
ans = restTemplate.getForEntity("http://127.0.0.1:8080/auth?name=一灰灰&age=20", String.class);
log.info("auth by interceptor: {}", ans);
```

输出

```
(auth by interceptor: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"authorization":"Basic dXNlcjpwd2Q=","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
>>>auth: success!,[Content-Type:"text/plain;charset=UTF-8", Content-Length:"264", Date:"Mon, 29 Jun 2020 09:46:06 GMT"]>
```

### 4. RestTemplateBuilder方式创建RestTemplate

RestTemplate除了使用new来构造之外，还可以借助`RestTemplateBuilder`来创建，有时候可能更加方便简洁

```java
// 4. 创建 RestTemplate时指定
restTemplate = new RestTemplateBuilder().basicAuthentication("user", "pwd").build();
ans = restTemplate.getForEntity("http://127.0.0.1:8080/auth?name=一灰灰&age=20", String.class);
log.info("auth by RestTemplateBuilder: {}", ans);
```


输出

```
(auth by RestTemplateBuilder: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"authorization":"Basic dXNlcjpwd2Q=","content-length":"0","host":"127.0.0.1:8080","connection":"Keep-Alive","accept-encoding":"gzip","accept":"text/plain, application/json, application/*+json, */*","user-agent":"okhttp/3.14.4"}
cookies: 
>>>auth: success!,[Content-Length:"309", Content-Type:"text/plain;charset=UTF-8", Date:"Mon, 29 Jun 2020 09:46:06 GMT"]>
```

### 5. 反面case

上面介绍的几种都是正常可以工作的，接下来给出一个不能工作的case

对于Basic Auth，有一种常见的方式是将用户名和密码，放在url里面，如

![](/imgs/200704/00.jpg)

那么我们直接用RestTemplate这么操作呢？

```java
try {
    // 直接在url中，添加用户名+密码，但是没有额外处理时，并不会生效
    restTemplate = new RestTemplate();
    ans = restTemplate.getForEntity("http://user:pwd@127.0.0.1:8080/auth?name=一灰灰&age=20", String.class);
    log.info("auth by url mode: {}", ans);
} catch (Exception e) {
    log.info("auth exception: {}", e.getMessage());
}
```

输出

```
(auth exception: 401 Unauthorized
```

**注意直接在url里面添加用户名密码的方式是不行的，需要额外处理**



## II. 其他

### 0. 项目&系列博文

**博文**

- [【WEB系列】RestTemplate之代理访问](http://spring.hhui.top/spring-blog/2020/07/03/200703-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%BB%A3%E7%90%86%E8%AE%BF%E9%97%AE/)
- [【WEB系列】RestTemplate之超时设置](http://spring.hhui.top/spring-blog/2020/07/02/200702-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】RestTemplate之中文乱码问题fix](http://spring.hhui.top/spring-blog/2020/07/01/200701-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98fix/)
- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


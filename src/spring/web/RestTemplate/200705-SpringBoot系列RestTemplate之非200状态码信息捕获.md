---
order: 7
title: 7.非200状态码信息捕获
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-05 07:21:01
keywords: Spring RestTemplate 异常捕获
---

前面介绍的RestTemplate的使用，都是接口正常返回200的状态码case，当返回非200状态码时，会直接抛异常，如果我希望能捕获异常，并针对正常获取返回的message，可以如何处理呢？

<!-- more -->

## I. 项目环境

> 博文测试项目完全基于[【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/17/200617-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%E5%B0%8F%E7%BB%93/)的项目环境，建议配合查看

基本环境：`IDEA` + `maven` + `SpringBoot 2.2.1.RELEASE`

测试的REST服务借助前一篇的鉴权，如果鉴权失败，则返回401状态码，具体实现如下

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

## II. 异常捕获

### 1. 未捕获场景

当我们直接像之前一样使用RestTemplate时，看一下效果如何

```java
try {
    // 如果返回状态码不是200，则直接抛异常，无法拿到responseBody
    RestTemplate restTemplate = new RestTemplate();
    HttpEntity<String> ans =
            restTemplate.getForEntity("http://127.0.0.1:8080/auth?name=一灰灰&age=20", String.class);
    log.info("exception with no auth res: {}", ans);
} catch (Exception e) {
    log.info("exception with no auth error: {}", e);
}
```

输出如下，走入了catch逻辑，从异常堆栈中，也只能看到`401 Unauthorized`，拿不到返回的Response body

```
(exception with no auth error: {}

org.springframework.web.client.HttpClientErrorException$Unauthorized: 401 Unauthorized
	at org.springframework.web.client.HttpClientErrorException.create(HttpClientErrorException.java:81)
	at org.springframework.web.client.DefaultResponseErrorHandler.handleError(DefaultResponseErrorHandler.java:123)
	at org.springframework.web.client.DefaultResponseErrorHandler.handleError(DefaultResponseErrorHandler.java:102)
	at org.springframework.web.client.ResponseErrorHandler.handleError(ResponseErrorHandler.java:63)
	at org.springframework.web.client.RestTemplate.handleResponse(RestTemplate.java:785)
	at org.springframework.web.client.RestTemplate.doExecute(RestTemplate.java:743)
	at org.springframework.web.client.RestTemplate.execute(RestTemplate.java:677)
	at org.springframework.web.client.RestTemplate.getForEntity(RestTemplate.java:345)
	at com.git.hui.boot.resttemplate.rest.RestTemplateDemo.exception(RestTemplateDemo.java:354)
	...
```


### 2. 异常捕获

> 更详细原理定位请参考：[【WEB系列】RestTemplate 4xx/5xx 异常信息捕获](http://spring.hhui.top/spring-blog/2020/01/04/200104-SpringWeb%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8BRestTemplate-4xx-5xx-%E5%BC%82%E5%B8%B8%E4%BF%A1%E6%81%AF%E6%8D%95%E8%8E%B7/)

为了处理上面的问题，我们可以设置自定义的`ResponseErrorHandler`来处理

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.setErrorHandler(new ResponseErrorHandler() {
    @Override
    public boolean hasError(ClientHttpResponse clientHttpResponse) throws IOException {
        return false;
    }

    @Override
    public void handleError(ClientHttpResponse clientHttpResponse) throws IOException {
        log.info("some error!");
    }
});
HttpEntity<String> ans = restTemplate.getForEntity("http://127.0.0.1:8080/auth?name=一灰灰&age=20", String.class);
log.info("exception with no auth after errorHandler res: {}", ans);
```

输出如下, 401为返回的状态码，其中也包含了ResponseBody，然后再业务中根据状态码和返回结果进行处理即可

```
(exception with no auth after errorHandler res: <401,params: {"name":["一灰灰"],"age":["20"]}
headers: {"host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
>>>no auth header,[WWW-Authenticate:"Basic realm="input username and password"", Content-Type:"text/plain;charset=UTF-8", Content-Length:"227", Date:"Mon, 29 Jun 2020 09:57:06 GMT"]>
```



## II. 其他

### 0. 项目&系列博文

**博文**

- [【WEB系列】RestTemplate之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/04/200704-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】RestTemplate之代理访问](http://spring.hhui.top/spring-blog/2020/07/03/200703-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%BB%A3%E7%90%86%E8%AE%BF%E9%97%AE/)
- [【WEB系列】RestTemplate之超时设置](http://spring.hhui.top/spring-blog/2020/07/02/200702-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】RestTemplate之中文乱码问题fix](http://spring.hhui.top/spring-blog/2020/07/01/200701-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98fix/)
- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


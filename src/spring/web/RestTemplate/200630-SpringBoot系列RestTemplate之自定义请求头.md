---
order: 2
title: 2.之自定义请求头
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-06-30 08:20:39
keywords: SpringBoot Spring RestTemplate GET POST RequestBody 请求头 HttpHeaders
---

上一篇介绍了RestTemplate的基本使用姿势，在文末提出了一些扩展的高级使用姿势，本篇将主要集中在如何携带自定义的请求头，如设置User-Agent，携带Cookie

- Get携带请求头
- Post携带请求头
- 拦截器方式设置统一请求头

<!-- more -->

## I. 项目搭建

### 1. 配置

借助SpringBoot搭建一个SpringWEB项目，提供一些用于测试的REST服务

- SpringBoot版本: `2.2.1.RELEASE`
- 核心依赖: `spring-boot-stater-web`

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

为了后续输出的日志更直观，这里设置了一下日志输出格式，在配置文件`application.yml`中，添加

```yml
logging:
  pattern:
    console: (%msg%n%n){blue}
```

### 2. Rest服务

添加三个接口，分别提供GET请求，POST表单，POST json对象，然后返回请求头、请求参数、cookie，具体实现逻辑相对简单，也不属于本篇重点，因此不赘述说明

```java
@RestController
public class DemoRest {

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

    @GetMapping(path = "get")
    public String get(HttpServletRequest request) {
        return buildResult(request);
    }


    @PostMapping(path = "post")
    public String post(HttpServletRequest request) {
        return buildResult(request);
    }

    @Data
    @NoArgsConstructor
    public static class ReqBody implements Serializable {
        private static final long serialVersionUID = -4536744669004135021L;
        private String name;
        private Integer age;
    }

    @PostMapping(path = "body")
    public String postBody(@RequestBody ReqBody body) {
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        return buildResult(request, body);
    }
}
```

## II. 使用姿势

最常见的携带请求头的需求，无非是referer校验，user-agent的防爬以及携带cookie，使用RestTemplate可以借助`HttpHeaders`来处理请求头

### 1. Get携带请求头

前一篇博文介绍了GET请求的三种方式，但是`getForObject`/`getForEntity`都不满足我们的场景，这里需要引入`exchange`方法

```java
public void header() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("user-agent",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36");
        headers.set("cookie", "my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;");

        // 注意几个请求参数
        HttpEntity<String> res = restTemplate
                .exchange("http://127.0.0.1:8080/get?name=一灰灰&age=20", HttpMethod.GET, new HttpEntity<>(null, headers),
                        String.class);
        log.info("get with selfDefine header: {}", res);
}
```

exchange的使用姿势和我们前面介绍的`postForEntity`差不多，只是多了一个指定HttpMethod的参数而已

**重点在于将请求头塞入HttpEntity**

输出结果

```
(get with selfDefine header: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"cookie":"my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"welcome_yhh"},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"447", Date:"Mon, 29 Jun 2020 07:48:49 GMT"]>
```

### 2. Post携带请求头

post携带请求头，也可以利用上面的方式实现；当然我们一般直接借助`postForObject/postForEntity`就可以满足需求了

```java
// httpHeaders 和上面的一致，这里省略相关代码
// post 带请求头
MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
params.add("name", "一灰灰Blog");
params.add("age", 20);

String response = restTemplate
        .postForObject("http://127.0.0.1:8080/post", new HttpEntity<>(params, headers), String.class);
log.info("post with selfDefine header: {}", response);
```

输出结果

```
(post with selfDefine header: params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"content-length":"338","cookie":"my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;","host":"127.0.0.1:8080","content-type":"multipart/form-data;charset=UTF-8;boundary=2VJHo9r6lYgR_WoSBy1FQC40jvBvGtLk7QUaymGg","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"welcome_yhh"}
```

### 3. 拦截器方式

如果我们可以确定每次发起请求时，都要设置一个自定义的 `User-Agent`，每次都使用上面的两种姿势就有点繁琐了，因此我们是可以通过拦截器的方式来添加通用的请求头，这样使用这个RestTemplate时，都会携带上请求头

```java
// 借助拦截器的方式来实现塞统一的请求头
ClientHttpRequestInterceptor interceptor = (httpRequest, bytes, execution) -> {
    httpRequest.getHeaders().set("user-agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36");
    httpRequest.getHeaders().set("cookie", "my_user_id=haha123; UN=1231923;gr_user_id=interceptor;");
    return execution.execute(httpRequest, bytes);
};

restTemplate.getInterceptors().add(interceptor);
response = restTemplate.getForObject("http://127.0.0.1:8080/get?name=一灰灰&age=20", String.class);
log.info("get with selfDefine header by Interceptor: {}", response);
```

上面这个使用姿势比较适用于通用的场景，测试输出

```
(get with selfDefine header by Interceptor: params: {"name":["一灰灰"],"age":["20"]}
headers: {"cookie":"my_user_id=haha123; UN=1231923;gr_user_id=interceptor;","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"interceptor"}
```


### 4. 请求头错误使用姿势

在我们使用自定义请求头时，有一个需要特殊重视的地方，HttpHeaders使用不当，可能导致请求头爆炸

```java
/**
 * 错误的请求头使用姿势
 */
public void errorHeader() {
    RestTemplate restTemplate = new RestTemplate();

    int i = 0;
    // 为了复用headers，避免每次都创建这个对象，但是在循环中又是通过 add 方式添加请求头，那么请求头会越来越膨胀，最终导致请求超限
    // 这种case，要么将add改为set；要么不要在循环中这么干
    HttpHeaders headers = new HttpHeaders();
    while (++i < 5) {
        headers.add("user-agent",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36");
        headers.add("cookie", "my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;");

        HttpEntity<String> res = restTemplate.exchange("http://127.0.0.1:8080/get?name=一灰灰&age=20", HttpMethod.GET,
                new HttpEntity<>(null, headers), String.class);
        log.info("get with selfDefine header: {}", res);
    }
}
```

上面演示的关键点为

- 希望复用 HttpHeaders 
- `headers.add` 方式添加请求头；而不是前面的 `set`方式

输出如下，请注意每一次请求过后，请求头膨胀了一次

```
(get with selfDefine header: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"cookie":"my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"welcome_yhh"},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"447", Date:"Mon, 29 Jun 2020 07:48:49 GMT"]>

(get with selfDefine header: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"cookie":"my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;; my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"welcome_yhh"},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"503", Date:"Mon, 29 Jun 2020 07:48:49 GMT"]>

(get with selfDefine header: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"cookie":"my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;; my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;; my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"welcome_yhh"},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"559", Date:"Mon, 29 Jun 2020 07:48:49 GMT"]>

(get with selfDefine header: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"cookie":"my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;; my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;; my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;; my_user_id=haha123; UN=1231923;gr_user_id=welcome_yhh;","host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"}
cookies: {"my_user_id":"haha123","UN":"1231923","gr_user_id":"welcome_yhh"},[Content-Type:"text/plain;charset=UTF-8", Content-Length:"615", Date:"Mon, 29 Jun 2020 07:48:49 GMT"]>
```


## II. 其他

### 0. 项目&系列博文

**系列博文**

-  [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/17/200617-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%E5%B0%8F%E7%BB%93/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


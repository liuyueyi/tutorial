---
order: 1
title: 1.基础用法小结
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-06-17 09:26:20
keywords: SpringBoot Spring RestTemplate GET POST RequestBody
---

在Spring项目中，通常会借助`RestTemplate`来实现网络请求，RestTemplate封装得很完善了，基本上可以非常简单的完成各种HTTP请求，本文主要介绍一下基本操作，最常见的GET/POST请求的使用姿势

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

## II. RestTemplate示例

### 1. Get请求

使用RestTemplate发起GET请求，通常有两种常见的方式

- getForEntity: 返回的正文对象包装在`HttpEntity`实体中，适用于获取除了返回的正文之外，对返回头、状态码有需求的场景
- getForObject: 返回正文，适用于只对正文感兴趣的场景

上面这两种方法除了返回结果不同之外，其他的使用姿势基本一样，有三种

```java
@Nullable
public <T> T getForObject(String url, Class<T> responseType, Object... uriVariables) throws RestClientException;

@Nullable
public <T> T getForObject(String url, Class<T> responseType, Map<String, ?> uriVariables) throws RestClientException;

@Nullable
public <T> T getForObject(URI url, Class<T> responseType) throws RestClientException;
```

上面三个重载方法，区别仅在于GET参数如何处理，下面给出一个实例进行说明

```java
/**
 * 基本的get请求
 */
public void basicGet() {
    RestTemplate restTemplate = new RestTemplate();

    HttpEntity<String> res =
            restTemplate.getForEntity("http://127.0.0.1:8080/get?name=一灰灰Blog&age=20", String.class);
    res.get
    log.info("Simple getForEntity res: {}", res);

    // 直接在url中拼参数，调用的是前面对应的方法1; 当然这里也可以将url转成URI格式，这样调用的是方法3
    String response = restTemplate.getForObject("http://127.0.0.1:8080/get?name=一灰灰Blog&age=20", String.class);
    log.info("Simple getForObject res: {}", response);

    // 通过可变参数，填充url参数中的{?}, 注意顺序是对应的
    response = restTemplate.getForObject("http://127.0.0.1:8080/get?name={?}&age={?}", String.class, "一灰灰Blog", 20);
    log.info("Simple getForObject by uri params: {}", response);

    // 参数放在map中，通过map的key与url中的{}进行匹配，实现参数替换
    response = restTemplate.getForObject("http://127.0.0.1:8080/get?name={name}&age={age}", String.class,
            new HashMap<String, Object>() {
                {
                    put("name", "一灰灰Blog");
                    put("age", 20);
                }
            });
    log.info("Simple getForObject by uri map params: {}", response);
}
```

输出结果如下:

```bash
(Simple getForEntity res: <200,params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: ,[Content-Type:"text/plain;charset=UTF-8", Content-Length:"213", Date:"Wed, 17 Jun 2020 01:14:16 GMT"]>

(Simple getForObject res: params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 

(Simple getForObject by uri params: params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 

(Simple getForObject by uri map params: params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"host":"127.0.0.1:8080","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
```

### 2. POST表单

POST表单属于非常基础的请求方式了，根据返回结果，RestTemplate同样提供了两种姿势

- postForEntity: 返回的正文封装在HttpEntity
- postForObject: 直接返回正文对象

它的使用姿势一样有三种

```java
@Nullable
public <T> T postForObject(String url, @Nullable Object request, Class<T> responseType, Object... uriVariables);

@Nullable
public <T> T postForObject(String url, @Nullable Object request, Class<T> responseType, Map<String, ?> uriVariables);

@Nullable
public <T> T postForObject(URI url, @Nullable Object request, Class<T> responseType);
```

请注意上面三个方法的前两个，后面的`uriVariables`是url参数，不是POST表单参数哦，它们之间是有区别的（虽然我们一般post提交表单时，不怎么会在url中添加参数）

下面还是根据实际的用例来查看

```java
/**
 * post基本请求
 */
public void basicPost() {
    RestTemplate restTemplate = new RestTemplate();

    HttpEntity<String> res = restTemplate
            .postForEntity("http://127.0.0.1:8080/post?name=一灰灰Blog&age=20", new LinkedMultiValueMap<>(),
                    String.class);
    log.info("Simple postForEntity res: {}", res);

    // 提交的表单参数
    MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
    params.add("name", "一灰灰Blog");
    params.add("age", 20);

    String response = restTemplate.postForObject("http://127.0.0.1:8080/post", params, String.class);
    log.info("Simple postForObject res: {}", response);

    // 这个url参数是放在url上面的哦
    response = restTemplate.postForObject("http://127.0.0.1:8080/post?urlName={?}", params, String.class, "url参数");
    log.info("Simple postForObject with urlParams res: {}", response);

    response = restTemplate.postForObject("http://127.0.0.1:8080/post?urlName={urlName}", params, String.class,
            new HashMap<String, Object>() {{
                put("urlName", "url参数");
            }});
    log.info("Simple postForObject with map urlParams res: {}", response);
}
```

测试输出如下

```bash
(Simple postForEntity res: <200,params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"content-length":"0","host":"127.0.0.1:8080","content-type":"application/x-www-form-urlencoded;charset=UTF-8","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: ,[Content-Type:"text/plain;charset=UTF-8", Content-Length:"299", Date:"Wed, 17 Jun 2020 01:14:16 GMT"]>

(Simple postForObject res: params: {"name":["一灰灰Blog"],"age":["20"]}
headers: {"content-length":"338","host":"127.0.0.1:8080","content-type":"multipart/form-data;charset=UTF-8;boundary=URAN0wQz_s1vauFbDLFRZ40bb3NtRRwgLuII-wCk","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 

(Simple postForObject with urlParams res: params: {"name":["一灰灰Blog"],"age":["20"],"urlName":["url参数"]}
headers: {"content-length":"314","host":"127.0.0.1:8080","content-type":"multipart/form-data;charset=UTF-8;boundary=2h15swz9SJPfjCxv2cNOwDn_TR2nK4gF","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 

(Simple postForObject with map urlParams res: params: {"name":["一灰灰Blog"],"age":["20"],"urlName":["url参数"]}
headers: {"content-length":"329","host":"127.0.0.1:8080","content-type":"multipart/form-data;charset=UTF-8;boundary=QOhroKp7BE4cNF5Oi3CJLdq_ixzk0t5ZZw9ch","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
```

### 3. post body

post一个json串，也属于比较常见的一种case了，对于RestTemplate而言，要支持这种方式，需要额外处理一下请求头，设置`Content-Type`为`application/json`

使用姿势和上面相差不大，只是需要注意一下请求参数的构建

```java
/**
 * json表单
 */
public void jsonPost() {
    RestTemplate restTemplate = new RestTemplate();

    // 设置请求头
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    // 提交的json串
    JSONObject params = new JSONObject();
    params.put("name", "一灰灰Blog");
    params.put("age", 20);

    // 构建请求参数
    HttpEntity<String> request = new HttpEntity<>(params.toJSONString(), headers);

    String response = restTemplate.postForObject("http://127.0.0.1:8080/body", request, String.class);
    log.info("json post res: {}", response);
}
```

输出如下

```bash
(json post res: params: {} | DemoRest.ReqBody(name=???Blog, age=20)
headers: {"content-length":"27","host":"127.0.0.1:8080","content-type":"application/json","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
```

**请注意，提交的json串中文乱码了**

### 4. 小结

上面主要介绍的是RestTemplate的常规用法，基础的GET/POST请求姿势，如果业务简单，不需要考虑各种复杂的异常情况，也是没有太多的问题了；那么如果需要考虑，又有哪些需要注意的呢？

- 上面的中文乱码问题如何解决？
- 自定义的请求头如何塞入（如果是爬虫，上面的User-Agent太容易被屏蔽了）
- cookie设置
- REST支持Basic Auth的验证方式如何发起请求
- 超时设置
- 自定义连接池替换
- REST返回非200状态码的情况，能否不抛异常，自定义处理？
- ssl校验
- ...

如果你对上面的这些点感兴趣，不妨关注一波，相关的文章快正热火朝天的进行中...

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


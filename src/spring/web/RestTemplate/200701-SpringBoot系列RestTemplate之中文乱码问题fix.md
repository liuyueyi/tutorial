---
order: 3
title: 3.中文乱码问题fix
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-01 09:14:59
keywords: Spring RestTemplate 中文乱码
---

在RestTemplate基础用法博文中，post json表单时，会发现存在中文乱码问题，本文主要介绍对应的解决方案

<!-- more -->

## I. 中文乱码Fix

### 1. "罪魁祸首"

**场景复现**

```java
/**
 * json表单
 */
public void jsonPost() {
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    JSONObject params = new JSONObject();
    params.put("name", "一灰灰Blog");
    params.put("age", 20);

    HttpEntity<String> request = new HttpEntity<>(params.toJSONString(), headers);

    String response = restTemplate.postForObject("http://127.0.0.1:8080/body", request, String.class);
    log.info("json post res: {}", response);
}
```

输出结果如下:

```
(json post res: params: {} | DemoRest.ReqBody(name=???Blog, age=20)
headers: {"content-length":"27","host":"127.0.0.1:8080","content-type":"application/json","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
```

**原因定位**

RestTemplate中存在一个`HttpMessageConverter`列表的属性成员，而`HttpMessageConverter`主要的职责就是消息转码

导致我们中文乱码的一个关键点在于`StringHttpMessageConverter`采用的默认编码格式为`StandardCharsets.ISO_8859_1`

### 2. 指定StringHttpMessageConverter编码

既然是因为`StringHttpMessageConverter`的默认编码不是UTF-8，那么将它手动改成utf-8不就over了么

```java
/**
 * 中文乱码问题fix
 */
public void chinese() {
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    JSONObject params = new JSONObject();
    params.put("name", "一灰灰Blog");
    params.put("age", 20);

    HttpEntity<String> request = new HttpEntity<>(params.toJSONString(), headers);

    // 中文乱码，主要是 StringHttpMessageConverter的默认编码为ISO导致的
    List<HttpMessageConverter<?>> list = restTemplate.getMessageConverters();
    for (HttpMessageConverter converter : list) {
        if (converter instanceof StringHttpMessageConverter) {
            ((StringHttpMessageConverter) converter).setDefaultCharset(Charset.forName("UTF-8"));
            break;
        }
    }

    String response = restTemplate.postForObject("http://127.0.0.1:8080/body", request, String.class);
    log.info("json post res: {}", response);
}
```

测试输出如:

```
(json post res: params: {} | DemoRest.ReqBody(name=一灰灰Blog, age=20)
headers: {"content-length":"33","host":"127.0.0.1:8080","content-type":"application/json","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
```

### 3. 传参POJO

在看`RestTemplate`的`HttpMessageConvert`时，会看到默认提供了一个`MappingJackson2HttpMessageConverter`，那么我们直接传参POJO，走Jackson序列化，是不是也可以解决中文乱码呢?

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public static class InnerParam implements Serializable {
    private static final long serialVersionUID = -3693060057697231136L;
    private String name;
    private Integer age;
}


// 直接传一个POJO
public void chinese() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    RestTemplate restTemplate = new RestTemplate();
    InnerParam innerParam = new InnerParam("一灰灰Blog", 20);
    String HttpEntity<InnerParam> entity = new HttpEntity<>(innerParam, headers);
    response = restTemplate.postForObject("http://127.0.0.1:8080/body", entity, String.class);
    log.info("json post DO res: {}", response);
}
```

输出结果如下

```java
(json post DO res: params: {} | DemoRest.ReqBody(name=一灰灰Blog, age=20)
headers: {"content-length":"33","host":"127.0.0.1:8080","content-type":"application/json","connection":"keep-alive","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies:
```

**说明：上面的InnerParam对象改成HashMap，也是ok的**



## II. 其他

### 0. 项目&系列博文

**博文**

- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


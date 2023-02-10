---
order: 5
title: 5.代理访问
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-03 08:09:12
keywords: Spring RestTemplate 代理 proxy
---

通过代理访问，对于java后端可能用得不多的，但有过爬虫开发经验的小伙伴可能一点也不会陌生，有时候不太方便直接去访问目标资源，借助代理是要给选择，对于RestTemplate而言，使用代理的姿势同样如设置超时一般，借助`SimpleClientHttpRequestFactory`来实现，本文演示一下具体的使用case

<!-- more -->

## I. 环境准备

### 1. 项目环境

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

### 2. 测试端点

我们的测试端点，主要需要返回客户端主机信息，我们这里直接借助`HttpServletRequest#getRemoteHost` + `HttpServlet#getRemotePort`来实现（当然实际的业务开发中不建议直接使用它）

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

    @GetMapping(path = "proxy")
    private String proxy(HttpServletRequest request) {
        String remote = request.getRemoteHost() + ":" + request.getRemotePort();
        return buildResult(request) + "\n>>>remote ipInfo: " + remote;
    }
}
```

### 3. 代理服务器搭建

我们这里借助tinyproxy来搭建代理服务器，详细步骤可以参考博文: [http代理服务器tinyproxy搭建手册](https://blog.hhui.top/hexblog/2020/06/19/200619-http%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8tinyproxy%E6%90%AD%E5%BB%BA%E6%89%8B%E5%86%8C/)


本文的演示中，是在`192.168.0.241`状态centos机器上安装的，步骤如下

```bash
1. sudo yum install tinyproxy -y


# 设置配置
2. vim /etc/tinyproxy/tinyproxy.conf

# 下面这个ip是我测试用例的机器ip
Allow 192.168.0.174


3. 启动服务
systemctl start tinyproxy.service
```


## II. 代理访问

接下来进入正文演示，核心代码也比较简单

```java
/**
 * 代理访问
 */
public void proxy() {
    RestTemplate restTemplate = new RestTemplate();

    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    // 请注意，我这里是在241机器上，借助tinyproxy搭建了一个http的代理，并设置端口为18888，所以可以正常演示代理访问
    // 拉源码运行的小伙，需要注意使用自己的代理来替换
    requestFactory.setProxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("192.168.0.241", 18888)));

    restTemplate.setRequestFactory(requestFactory);

    // 因为使用代理访问，所以这个ip就不能是127.0.0.1，不然访问的就是代理服务器上了
    HttpEntity<String> ans =
            restTemplate.getForEntity("http://192.168.0.174:8080/proxy?name=一灰灰&age=20", String.class);
    log.info("proxy request ans: {}", ans.getBody());
}
```

请注意，上面的使用姿势中

- Proxy的方式除了HTTP之外还有SOCKS，这个是与代理服务器的支持方式相关的
- `postForEntity`中url的ip是我本机的ip，而不是`127.0.0.1`

测试输出如下:

```
(proxy request ans: <200,params: {"name":["一灰灰"],"age":["20"]}
headers: {"host":"192.168.0.174:8080","connection":"close","via":"1.1 tinyproxy (tinyproxy/1.8.3)","accept":"text/plain, application/json, application/*+json, */*","user-agent":"Java/1.8.0_171"}
cookies: 
>>>remote ipInfo: 192.168.0.241:56122,[Via:"1.1 tinyproxy (tinyproxy/1.8.3)", Content-Type:"text/plain;charset=UTF-8", Date:"Mon, 29 Jun 2020 08:46:47 GMT", Content-Length:"286"]>
```


## II. 其他

### 0. 项目&系列博文

**博文**

- [【WEB系列】RestTemplate之超时设置](http://spring.hhui.top/spring-blog/2020/07/02/200702-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】RestTemplate之中文乱码问题fix](http://spring.hhui.top/spring-blog/2020/07/01/200701-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98fix/)
- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)


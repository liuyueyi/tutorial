---
order: 11
title: 11.自定义返回Http Code的n种姿势
tag: 
  - Web
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2020-01-05 10:02:49
keywords: SpringBoot SpringMVC http code ResponsStatus HttpServletResponse ResponseEntity
---

虽然http的提供了一整套完整、定义明确的状态码，但实际的业务支持中，后端并不总会遵守这套规则，更多的是在返回结果中，加一个code字段来自定义业务状态，即便是后端5xx了，返回给前端的http code依然是200

那么如果我想遵守http的规范，不同的case返回不同的http code在Spring中可以做呢?

本文将介绍四种设置返回的HTTP CODE的方式

- `@ResponseStatus` 注解方式
- `HttpServletResponse#sendError`
- `HttpServletResponse#setStatus`
- `ResponseEntity`

<!-- more -->

## I. 返回Http Code的n中姿势

### 0. 环境

进入正文之前，先创建一个SpringBoot项目，本文示例所有版本为 `spring-boot.2.1.2.RELEASE`

(需要测试的小伙伴，本机创建一个maven项目，在`pom.xml`文件中，拷贝下面的配置即可)

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.1.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
<repositories>
    <repository>
        <id>spring-snapshots</id>
        <name>Spring Snapshots</name>
        <url>https://repo.spring.io/libs-snapshot-local</url>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/libs-milestone-local</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>spring-releases</id>
        <name>Spring Releases</name>
        <url>https://repo.spring.io/libs-release-local</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

下面所有的方法都放在ErrorCodeRest这个类中

```java
@RestController
@RequestMapping(path = "code")
public class ErrorCodeRest {
}
```

### 1. ResponseStatus使用姿势

通过注解`@ResponseStatus`，来指定返回的http code, 一般来说，使用它有两种姿势，一个是直接加在方法上，一个是加在异常类上

#### a. 装饰方法

直接在方法上添加注解，并制定对应的code

```java
/**
 * 注解方式，只支持标准http状态码
 *
 * @return
 */
@GetMapping("ano")
@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "请求参数异常!")
public String ano() {
    return "{\"code\": 400, \"msg\": \"bad request!\"}";
}
```

实测一下，返回结果如下

```
➜  ~ curl 'http://127.0.0.1:8080/code/ano' -i
HTTP/1.1 400
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Sun, 05 Jan 2020 01:29:04 GMT
Connection: close

{"timestamp":"2020-01-05T01:29:04.673+0000","status":400,"error":"Bad Request","message":"请求参数异常!","path":"/code/ano"}%
```


当我们发起请求时，返回的状态码为400，返回的数据为springboot默认的错误信息格式

虽然上面这种使用姿势可以设置http code，但是这种使用姿势有什么意义呢？

如果看过web系列教程中的：[SpringBoot系列教程web篇之全局异常处理](http://spring.hhui.top/spring-blog/2019/10/10/191010-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E5%85%A8%E5%B1%80%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86/) 可能就会有一些映象，配合`@ExceptionHandler`来根据异常返回对应的状态码

一个推荐的使用姿势，下面表示当你的业务逻辑中出现数组越界时，返回500的状态码以及完整的堆栈信息

```java
@ResponseBody
@ExceptionHandler(value = ArrayIndexOutOfBoundsException.class)
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public String handleArrayIndexOutBounds(HttpServletRequest request, HttpServletResponse response,
        ArrayIndexOutOfBoundsException e) throws IOException {
    log.info("array index out conf!");
    return "aryIndexOutOfBounds: " + getThrowableStackInfo(e);
}
```

#### b. 装饰异常类

另外一种使用姿势就是直接装饰在异常类上，然后当你的业务代码中，抛出特定的异常类，返回的httpcode就会设置为注解中的值

```java
/**
 * 异常类 + 注解方式，只支持标准http状态码
 *
 * @return
 */
@GetMapping("exception/500")
public String serverException() {
    throw new ServerException("内部异常哦");
}

@GetMapping("exception/400")
public String clientException() {
    throw new ClientException("客户端异常哦");
}

@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR, reason = "服务器失联了，请到月球上呼叫试试~~")
public static class ServerException extends RuntimeException {
    public ServerException(String message) {
        super(message);
    }
}

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "老哥，你的请求有问题~~")
public static class ClientException extends RuntimeException {
    public ClientException(String message) {
        super(message);
    }
}
```

测试结果如下，在异常类上添加注解的方式，优点在于不需要配合`@ExceptionHandler`写额外的逻辑了；缺点则在于需要定义很多的自定义异常类型

```
➜  ~ curl 'http://127.0.0.1:8080/code/exception/400' -i
HTTP/1.1 400
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Sun, 05 Jan 2020 01:37:07 GMT
Connection: close

{"timestamp":"2020-01-05T01:37:07.662+0000","status":400,"error":"Bad Request","message":"老哥，你的请求有问题~~","path":"/code/exception/400"}%

➜  ~ curl 'http://127.0.0.1:8080/code/exception/500' -i
HTTP/1.1 500
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Sun, 05 Jan 2020 01:37:09 GMT
Connection: close

{"timestamp":"2020-01-05T01:37:09.389+0000","status":500,"error":"Internal Server Error","message":"服务器失联了，请到月球上呼叫试试~~","path":"/code/exception/500"}%
```


**注意**

- ResponseStatus注解的使用姿势，只支持标准的Http Code（必须是枚举类`org.springframework.http.HttpStatus`）

### 2. ResponseEntity

这种使用姿势就比较简单了，方法的返回结果必须是`ResponseEntity`，下面给出两个实际的case

```java
@GetMapping("401")
public ResponseEntity<String> _401() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"code\": 401, \"msg\": \"未授权!\"}");
}

@GetMapping("451")
public ResponseEntity<String> _451() {
    return ResponseEntity.status(451).body("{\"code\": 451, \"msg\": \"自定义异常!\"}");
}
```

实测结果

```
➜  ~ curl 'http://127.0.0.1:8080/code/401' -i
HTTP/1.1 401
Content-Type: text/plain;charset=UTF-8
Content-Length: 34
Date: Sun, 05 Jan 2020 01:40:10 GMT

{"code": 401, "msg": "未授权!"}

➜  ~ curl 'http://127.0.0.1:8080/code/451' -i
HTTP/1.1 451
Content-Type: text/plain;charset=UTF-8
Content-Length: 40
Date: Sun, 05 Jan 2020 01:40:19 GMT

{"code": 451, "msg": "自定义异常!"}
```


从上面的使用实例上看，可以知道这种使用方式，不仅仅支持标准的http code，也支持自定义的code（如返回code 451)


### 3. HttpServletResponse

这种使用姿势则是直接操作`HttpServletResponse`对象，手动录入返回的结果

#### a. setStatus

```java
/**
 * response.setStatus 支持自定义http code，并可以返回结果
 *
 * @param response
 * @return
 */
@GetMapping("525")
public String _525(HttpServletResponse response) {
    response.setStatus(525);
    return "{\"code\": 525, \"msg\": \"自定义错误码 525!\"}";
}
```

输出结果

```
➜  ~ curl 'http://127.0.0.1:8080/code/525' -i
HTTP/1.1 525
Content-Type: text/plain;charset=UTF-8
Content-Length: 47
Date: Sun, 05 Jan 2020 01:45:38 GMT

{"code": 525, "msg": "自定义错误码 525!"}%
```

使用方式比较简单，直接设置status即可，支持自定义的Http Code返回

#### b. sendError

使用这种姿势的时候需要注意一下，只支持标准的http code，而且response body中不会有你的业务返回数据，如

```java
/**
 * send error 方式，只支持标准http状态码; 且不会带上返回的结果
 *
 * @param response
 * @return
 * @throws IOException
 */
@GetMapping("410")
public String _410(HttpServletResponse response) throws IOException {
    response.sendError(410, "send 410");
    return "{\"code\": 410, \"msg\": \"Gone 410!\"}";
}

@GetMapping("460")
public String _460(HttpServletResponse response) throws IOException {
    response.sendError(460, "send 460");
    return "{\"code\": 460, \"msg\": \"Gone 460!\"}";
}
```

输出结果

```
➜  ~ curl 'http://127.0.0.1:8080/code/410' -i
HTTP/1.1 410
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Sun, 05 Jan 2020 01:47:52 GMT

{"timestamp":"2020-01-05T01:47:52.300+0000","status":410,"error":"Gone","message":"send 410","path":"/code/410"}% 

➜  ~ curl 'http://127.0.0.1:8080/code/460' -i
HTTP/1.1 500
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Sun, 05 Jan 2020 01:47:54 GMT
Connection: close

{"timestamp":"2020-01-05T01:47:54.719+0000","status":460,"error":"Http Status 460","message":"send 460","path":"/code/460"}%
```

从上面的case也可以看出，当我们使用send error时，如果是标准的http code，会设置对响应头；如果是自定义的不被识别的code，那么返回的http code是500


### 4, 小结

上面介绍了几种常见的设置响应http code的姿势，下面小结一下使用时的注意事项

**ResponseStatus**

- 只支持标准的http code
- 装饰自定义异常类，使用时抛出对应的异常类，从而达到设置响应code的效果
  - 缺点对非可控的异常类不可用
- 结合`@ExceptionHandler`，用来装饰方法

**ResponseEntity**

形如：

```java
return ResponseEntity.status(451).body("{\"code\": 451, \"msg\": \"自定义异常!\"}");
```

- 我个人感觉是最强大的使用姿势，就是写起来没有那么简洁
- 支持自定义code，支持设置 response body

**HttpServletResponse**

- setStatus: 设置响应code，支持自定义code，支持返回response body
- sendError: 只支持标准的http code，如果传入自定义的code，返回的http code会是500


## II. 其他

#### web系列博文

- [191222-SpringBoot系列教程web篇之自定义请求匹配条件RequestCondition](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484419&idx=1&sn=d04d591f6f3af7b594b2940febf3b5a1)
- [191206-SpringBoot系列教程web篇Listener四种注册姿势](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484393&idx=1&sn=84babe4c83fa49fe54605e156f81a18f&chksm=fce71845cb9091533190e99f2928585aea56562312d087f2b2b0e5ae4f082e3393023349e903&token=713643402&lang=zh_CN#rd)
- [191122-SpringBoot系列教程web篇Servlet 注册的四种姿势](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484377&idx=1&sn=a20ce7e5e04ede4dff5fa84a7c5c8448&chksm=fce71875cb9091639124afa69d0ec7bbf8f50438fd7acaf582fb029b7a4adf2f36fa50d4f0fa&token=1748723444&lang=zh_CN#rd)
- [191120-SpringBoot系列教程Web篇之开启GZIP数据压缩](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484377&idx=2&sn=b341d12c8179ba803d5c82882d9799ee&chksm=fce71875cb90916376c76a901187b396595082c8ab3bd9df699227132430b9a40d2b07b30638&token=713643402&lang=zh_CN#rd)
- [191018-SpringBoot系列教程web篇之过滤器Filter使用指南扩展篇](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484356&idx=1&sn=7c80f55f875f8d9ed37ef618cd7852ff&chksm=fce71868cb90917ec76ed23990a287b25dfecd6e60300a215ff9b85d9d9db32b3ba1c7b549c7&token=713643402&lang=zh_CN#rd)
- [191016-SpringBoot系列教程web篇之过滤器Filter使用指南](https://mp.weixin.qq.com/s/f01KWO3d2zhoN0Qa9-Qb6w)
- [191012-SpringBoot系列教程web篇之自定义异常处理HandlerExceptionResolver](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484348&idx=1&sn=e9b36572c721418b097396b50319d140&chksm=fce71810cb9091063e810327e44f7ed07256188aecd352fa43f37e63e63dc64292b1a48b00cf&token=823367253&lang=zh_CN#rd)
- [191010-SpringBoot系列教程web篇之全局异常处理](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484344&idx=1&sn=d4b1422a709d9540583e33443aab6fff&chksm=fce71814cb9091025a960312c878ff9fc4f44fd0035aa597f55f37c90dcbac25a3e96ee2c528&token=118864495&lang=zh_CN#rd)
- [190930-SpringBoot系列教程web篇之404、500异常页面配置](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484336&idx=1&sn=d70f15e77bbd219af8015f9037a167fb&chksm=fce7181ccb90910aee427a3f3ed7660e8303c7460859c82622a651ce1cc3d7a97f62f80ed4e0&token=2447275&lang=zh_CN#rd)
- [190929-SpringBoot系列教程web篇之重定向](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484322&idx=1&sn=b18090f35b59097f78858b6609506b74&chksm=fce7180ecb909118d939f3ddf741a11c0977b1213d7afa12c970590590d40441c3a085c43c52&token=2447275&lang=zh_CN#rd)
- [190913-SpringBoot系列教程web篇之返回文本、网页、图片的操作姿势](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484310&idx=1&sn=f6259cf1b79db095ff2e9534993d27cf&chksm=fce7183acb90912cd150f086e90ecab3eceb3464e9352853e2e722288d412dbb3eb20c6e6ae7&scene=21#wechat_redirect)
- [190905-SpringBoot系列教程web篇之中文乱码问题解决](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484309&idx=1&sn=33d782f7529268eef6607a1ab8d41018&chksm=fce71839cb90912f6020aa9463bc0136cb57969ebe27eba865d97e212c28211435791aa874ea&scene=21#wechat_redirect)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484291&idx=1&sn=3f7e8c92ca4d7270cc5c40cafea39683&chksm=fce7182fcb90913922654a4f2f04e7029b8944d71c31741334a3235aecbe1e60babcb0c0be74&scene=21#wechat_redirect)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484287&idx=1&sn=44461f564d6b04cbf1a5902dcb4f23c6&chksm=fce718d3cb9091c5d730e63ae954c0831d53f3dd5af5d19d9c78b6009102838efaf56f7838ff&scene=21#wechat_redirect)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484282&idx=1&sn=a8d236d935ae24cfbe6977e24a479caa&chksm=fce718d6cb9091c0dd8a6b113236f9ae9388fb026c9403c97bdf7505f773bd7330a43e3b269c&scene=21#wechat_redirect)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=3&sn=9e8a6121dce291c65bd2b3d4fab24178&chksm=fce718c0cb9091d6674fb809d68ca3dc3b1695162368481abf8dc094000412116d2f9971c54b&scene=21#wechat_redirect)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=2&sn=f800c001061eabe74e2cad915af1921a&chksm=fce718c0cb9091d682b600673a0584955783f0d339248e34323efbea9b698560c432018717ef&scene=21#wechat_redirect)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=1&sn=acd691729488d81a94c938151d5737ce&chksm=fce718c0cb9091d63ef5f12893bb835c256a18318e791a0d193d00ef767ecfd019491d02e83d&scene=21#wechat_redirect)
- [190421-SpringBoot高级篇WEB之websocket的使用说明](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484217&idx=1&sn=9fdf45d2261cdcf2ccaccaebfb5ef598&chksm=fce71895cb90918361f1afd55a2b5fc9d65508913c1d793710afa79cae38bd9d57e32ad2c187&token=2447275&lang=zh_CN#rd)
- [190327-Spring-RestTemplate之urlencode参数解析异常全程分析](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484197&idx=1&sn=0184953527f58058ee8c2bbcfc2689ec&chksm=fce71889cb90919f9be003bf2487343f7952d6b33ab5ee5fb7251ae37a631d4c32e6d8a57528&token=2447275&lang=zh_CN#rd)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484193&idx=1&sn=d8a284fe0a2b8e1fefe07d892558f563&chksm=fce7188dcb90919b1f8a2408bf955e37e88b043e2dbd59b5290ac1501e3d2d303512bac6af2c&token=2447275&lang=zh_CN#rd)
- [190316-Spring MVC之基于xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484186&idx=1&sn=18db571b670815965ae9185830c4e88f&chksm=fce718b6cb9091a054e0ac4be051341d8ce38ff8e40c5911302e3d6981206c14b80770590044&token=2447275&lang=zh_CN#rd)
- [190213-SpringBoot文件上传异常之提示The temporary upload location xxx is not valid](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484139&idx=1&sn=b4a5f3ca6215641c6bcf5123f2bfb501&chksm=fce71947cb9090511042ae97a12cc975d2b199521e17980e685cccb5e0be91a8e932cef4eb76&token=2447275&lang=zh_CN#rd)

**项目源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目：[https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response)


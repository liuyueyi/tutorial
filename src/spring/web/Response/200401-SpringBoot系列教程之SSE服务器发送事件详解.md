---
order: 13
title: 13.SSE服务器发送事件详解
tag: 
  - SSE
  - WebAsyncTask
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2020-04-01 19:01:42
keywords: 异步请求 SSE Server Sent Event Spring SpringBoot SpringMVC WebSocket 长连接
---

SSE全称`Server Sent Event`，直译一下就是服务器发送事件，一般的项目开发中，用到的机会不多，可能很多小伙伴不太清楚这个东西，到底是干啥的，有啥用

本文主要知识点如下：

- SSE扫盲，应用场景分析
- 借助异步请求实现sse功能，加深概念理解
- 使用`SseEmitter`实现一个简单的推送示例

<!-- more -->

## I. SSE扫盲

> 对于sse基础概念比较清楚的可以跳过本节

### 1. 概念介绍

sse(`Server Sent Event`)，直译为服务器发送事件，顾名思义，也就是客户端可以获取到服务器发送的事件

我们常见的http交互方式是客户端发起请求，服务端响应，然后一次请求完毕；但是在sse的场景下，客户端发起请求，连接一直保持，服务端有数据就可以返回数据给客户端，这个返回可以是多次间隔的方式

### 2. 特点分析

SSE最大的特点，可以简单规划为两个

- 长连接
- 服务端可以向客户端推送信息

了解websocket的小伙伴，可能也知道它也是长连接，可以推送信息，但是它们有一个明显的区别

**sse是单通道，只能服务端向客户端发消息；而webscoket是双通道**

那么为什么有了webscoket还要搞出一个sse呢？既然存在，必然有着它的优越之处

| sse | websocket |
| --- | --- |
| http协议 | 独立的websocket协议|
| 轻量，使用简单| 相对复杂| 
| 默认支持断线重连 | 需要自己实现断线重连|
| 文本传输 | 二进制传输|
| 支持自定义发送的消息类型 | -|


### 3. 应用场景

从sse的特点出发，我们可以大致的判断出它的应用场景，需要轮询获取服务端最新数据的case下，多半是可以用它的

比如显示当前网站在线的实时人数，法币汇率显示当前实时汇率，电商大促的实时成交额等等...


## II. 手动实现sse功能

sse本身是有自己的一套玩法的，后面会进行说明，这一小节，则主要针对sse的两个特点`长连接 + 后端推送数据`，如果让我们自己来实现这样的一个接口，可以怎么做？

### 1. 项目创建

借助SpringBoot `2.2.1.RELEASE`来创建一个用于演示的工程项目，核心的xml依赖如下

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

### 2. 功能实现

在Http1.1支持了长连接，请求头添加一个`Connection: keep-alive`即可

在这里我们借助异步请求来实现sse功能，至于什么是异步请求，推荐查看博文: [【WEB系列】异步请求知识点与使用姿势小结](http://spring.hhui.top/spring-blog/2020/03/29/200329-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8B%E5%BC%82%E6%AD%A5%E8%AF%B7%E6%B1%82%E6%9C%80%E5%85%A8%E7%9F%A5%E8%AF%86%E7%82%B9%E4%B8%8E%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

因为后端可以不定时返回数据，所以我们需要注意的就是需要保持连接，不要返回一次数据之后就断开了；其次就是需要设置请求头`Content-Type: text/event-stream;charset=UTF-8` （如果不是流的话会怎样？）

```java
// 新建一个容器，保存连接，用于输出返回
private Map<String, PrintWriter> responseMap = new ConcurrentHashMap<>();

// 发送数据给客户端
private void writeData(String id, String msg, boolean over) throws IOException {
    PrintWriter writer = responseMap.get(id);
    if (writer == null) {
        return;
    }

    writer.println(msg);
    writer.flush();
    if (over) {
        responseMap.remove(id);
    }
}

// 推送
@ResponseBody
@GetMapping(path = "subscribe")
public WebAsyncTask<Void> subscribe(String id, HttpServletResponse response) {

    Callable<Void> callable = () -> {
        response.setHeader("Content-Type", "text/event-stream;charset=UTF-8");
        responseMap.put(id, response.getWriter());
        writeData(id, "订阅成功", false);
        while (true) {
            Thread.sleep(1000);
            if (!responseMap.containsKey(id)) {
                break;
            }
        }
        return null;
    };

    // 采用WebAsyncTask 返回 这样可以处理超时和错误 同时也可以指定使用的Excutor名称
    WebAsyncTask<Void> webAsyncTask = new WebAsyncTask<>(30000, callable);
    // 注意：onCompletion表示完成，不管你是否超时、是否抛出异常，这个函数都会执行的
    webAsyncTask.onCompletion(() -> System.out.println("程序[正常执行]完成的回调"));

    // 这两个返回的内容，最终都会放进response里面去===========
    webAsyncTask.onTimeout(() -> {
        responseMap.remove(id);
        System.out.println("超时了!!!");
        return null;
    });
    // 备注：这个是Spring5新增的
    webAsyncTask.onError(() -> {
        System.out.println("出现异常!!!");
        return null;
    });


    return webAsyncTask;
}
```

看一下上面的实现，基本上还是异步请求的那一套逻辑，请仔细看一下`callable`中的逻辑，有一个while循环，来保证长连接不中断

接下来我们新增两个接口，用来模拟后端给客户端发送消息，关闭连接的场景

```java
@ResponseBody
@GetMapping(path = "push")
public String pushData(String id, String content) throws IOException {
    writeData(id, content, false);
    return "over!";
}

@ResponseBody
@GetMapping(path = "over")
public String over(String id) throws IOException {
    writeData(id, "over", true);
    return "over!";
}
```


我们简单的来演示下操作过程

![](/imgs/200401/00.gif)


## III. SseEmitter

上面只是简单实现了sse的长连接 + 后端推送消息，但是与标准的SSE还是有区别的，sse有自己的规范，而我们上面的实现，实际上并没有管这个，导致的问题是前端按照sse的玩法来请求数据，可能并不能正常工作

### 1. sse规范

在html5的定义中，服务端sse，一般需要遵循以下要求

**请求头**

开启长连接 + 流方式传递

```
Content-Type: text/event-stream;charset=UTF-8
Cache-Control: no-cache
Connection: keep-alive
```

**数据格式**

服务端发送的消息，由message组成，其格式如下:

```
field:value\n\n
```

其中field有五种可能

- 空: 即以`:`开头，表示注释，可以理解为服务端向客户端发送的心跳，确保连接不中断
- data：数据
- event: 事件，默认值
- id: 数据标识符用id字段表示，相当于每一条数据的编号
- retry: 重连时间


### 2. 实现

SpringBoot利用SseEmitter来支持sse，可以说非常简单了，直接返回`SseEmitter`对象即可；重写一下上面的逻辑

```java
@RestController
@RequestMapping(path = "sse")
public class SseRest {
    private static Map<String, SseEmitter> sseCache = new ConcurrentHashMap<>();
    @GetMapping(path = "subscribe")
    public SseEmitter push(String id) {
        // 超时时间设置为1小时
        SseEmitter sseEmitter = new SseEmitter(3600_000L);
        sseCache.put(id, sseEmitter);
        sseEmitter.onTimeout(() -> sseCache.remove(id));
        sseEmitter.onCompletion(() -> System.out.println("完成！！！"));
        return sseEmitter;
    }

    @GetMapping(path = "push")
    public String push(String id, String content) throws IOException {
        SseEmitter sseEmitter = sseCache.get(id);
        if (sseEmitter != null) {
            sseEmitter.send(content);
        }
        return "over";
    }

    @GetMapping(path = "over")
    public String over(String id) {
        SseEmitter sseEmitter = sseCache.get(id);
        if (sseEmitter != null) {
            sseEmitter.complete();
            sseCache.remove(id);
        }
        return "over";
    }
}
```

上面的实现，用到了SseEmitter的几个方法，解释如下

- `send()`: 发送数据，如果传入的是一个非`SseEventBuilder`对象，那么传递参数会被封装到data中
- `complete()`: 表示执行完毕，会断开连接
- `onTimeout()`: 超时回调触发
- `onCompletion()`: 结束之后的回调触发

同样演示一下访问请求

![](/imgs/200401/01.gif)


上图总的效果和前面的效果差不多，而且输出还待上了前缀，接下来我们写一个简单的html消费端，用来演示一下完整的sse的更多特性

```html
<!doctype html>
<html lang="en">
<head>
    <title>Sse测试文档</title>
</head>
<body>
<div>sse测试</div>
<div id="result"></div>
</body>
</html>
<script>
    var source = new EventSource('http://localhost:8080/sse/subscribe?id=yihuihui');
    source.onmessage = function (event) {
        text = document.getElementById('result').innerText;
        text += '\n' + event.data;
        document.getElementById('result').innerText = text;
    };
    <!-- 添加一个开启回调 -->
    source.onopen = function (event) {
        text = document.getElementById('result').innerText;
        text += '\n 开启: ';
        console.log(event);
        document.getElementById('result').innerText = text;
    };
</script>
```

将上面的html文件放在项目的`resources/static`目录下；然后修改一下前面的`SseRest`

```java
@Controller
@RequestMapping(path = "sse")
public class SseRest {
    @GetMapping(path = "")
    public String index() {
        return "index.html";
    }
    
    @ResponseBody
    @GetMapping(path = "subscribe", produces = {MediaType.TEXT_EVENT_STREAM_VALUE})
    public SseEmitter push(String id) {
        // 超时时间设置为3s，用于演示客户端自动重连
        SseEmitter sseEmitter = new SseEmitter(1_000L);
        // 设置前端的重试时间为1s
        sseEmitter.send(SseEmitter.event().reconnectTime(1000).data("连接成功"));
        sseCache.put(id, sseEmitter);
        System.out.println("add " + id);
        sseEmitter.onTimeout(() -> {
            System.out.println(id + "超时");
            sseCache.remove(id);
        });
        sseEmitter.onCompletion(() -> System.out.println("完成！！！"));
        return sseEmitter;
    }
}
```

我们上面超时时间设置的比较短，用来测试下客户端的自动重连，如下，开启的日志不断增加

![](/imgs/200401/02.gif)

其次将SseEmitter的超时时间设长一点，再试一下数据推送功能

![](/imgs/200401/03.gif)

请注意上面的演示，当后端结束了长连接之后，客户端会自动重新再次连接，不用写外的重试逻辑了，就这么神奇

### 3. 小结

本篇文章介绍了SSE的相关知识点，并对比websocket给出了sse的优点（至于啥优点请往上翻）

请注意，本文虽然介绍了两种sse的方式，第一种借助异步请求来实现，如果需要完成sse的规范要求，需要自己做一些适配，如果需要了解sse底层实现原理的话，可以参考一下；在实际的业务开发中，推荐使用`SseEmitter`


## IV. 其他

### 0. 项目

**系列博文**

- [200329-SpringBoot系列教程web篇之异步请求知识点与使用姿势小结](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484567&idx=1&sn=de01a82e80c748aa6bb9fde8a51cae5b)
- [200105-SpringBoot系列教程web篇之自定义返回Http-Code的n种姿势](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484453&idx=1&sn=6d273ec9e6756d17e1b18dd88d322759)
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

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目源码: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/220-web-sse](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/220-web-sse)


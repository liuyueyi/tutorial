---
order: 12
title: 12.异步请求知识点与使用姿势小结
tag: 
  - WebAsyncTask
  - DeferredResult
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2020-03-29 16:47:54
keywords: 异步请求 DeferredResult Callable WebAsyncTask Spring SpringBoot SpringMVC Servlet
---

在Servlet3.0就引入了异步请求的支持，但是在实际的业务开发中，可能用过这个特性的童鞋并不多？

本篇博文作为异步请求的扫盲和使用教程，将包含以下知识点

- 什么是异步请求，有什么特点，适用场景
- 四种使用姿势：
  - AsyncContext方式 
  - Callable 
  - WebAsyncTask
  - DeferredResult

<!-- more -->

## I. 异步请求

异步对于我们而言，应该属于经常可以听到的词汇了，在实际的开发中多多少少都会用到，那么什么是异步请求呢

### 1. 异步请求描述

**先介绍一下同步与异步：**

一个正常调用，吭哧吭哧执行完毕之后直接返回，这个叫同步；

接收到调用，自己不干，新开一个线程来做，主线程自己则去干其他的事情，等后台线程吭哧吭哧的跑完之后，主线程再返回结果，这个就叫异步

**异步请求：**

我们这里讲到的异步请求，主要是针对web请求而言，后端响应请求的一种手段，同步/异步对于前端而言是无感知、无区别的

同步请求，后端接收到请求之后，直接在处理请求线程中，执行业务逻辑，并返回

![来源于网络](/imgs/200329/00.jpg)

异步请求，后端接收到请求之后，新开一个线程，来执行业务逻辑，释放请求线程，避免请求线程被大量耗时的请求沾满，导致服务不可用

![来源于网络](/imgs/200329/01.jpg)

### 2. 特点

通过上面两张图，可以知道异步请求的最主要特点

- 业务线程，处理请求逻辑
- 请求处理线程立即释放，通过回调处理线程返回结果


### 3. 场景分析

从特点出发，也可以很容易看出异步请求，更适用于耗时的请求，快速的释放请求处理线程，避免web容器的请求线程被打满，导致服务不可用

举一个稍微极端一点的例子，比如我以前做过的一个多媒体服务，提供图片、音视频的编辑，这些服务接口有同步返回结果的也有异步返回结果的；同步返回结果的接口有快有慢，大部分耗时可能`<10ms`，而有部分接口耗时则在几十甚至上百

这种场景下，耗时的接口就可以考虑用异步请求的方式来支持了，避免占用过多的请求处理线程，影响其他的服务


## II. 使用姿势

接下来介绍四种异步请求的使用姿势，原理一致，只是使用的场景稍有不同

### 1. AsyncContext

在Servlet3.0+之后就支持了异步请求，第一种方式比较原始，相当于直接借助Servlet的规范来实现，当然下面的case并不是直接创建一个servlet，而是借助`AsyncContext`来实现

```java
@RestController
@RequestMapping(path = "servlet")
public class ServletRest {

    @GetMapping(path = "get")
    public void get(HttpServletRequest request) {
        AsyncContext asyncContext = request.startAsync();
        asyncContext.addListener(new AsyncListener() {
            @Override
            public void onComplete(AsyncEvent asyncEvent) throws IOException {
                System.out.println("操作完成:" + Thread.currentThread().getName());
            }

            @Override
            public void onTimeout(AsyncEvent asyncEvent) throws IOException {
                System.out.println("超时返回!!!");
                asyncContext.getResponse().setCharacterEncoding("utf-8");
                asyncContext.getResponse().setContentType("text/html;charset=UTF-8");
                asyncContext.getResponse().getWriter().println("超时了！！！!");
            }

            @Override
            public void onError(AsyncEvent asyncEvent) throws IOException {
                System.out.println("出现了m某些异常");
                asyncEvent.getThrowable().printStackTrace();

                asyncContext.getResponse().setCharacterEncoding("utf-8");
                asyncContext.getResponse().setContentType("text/html;charset=UTF-8");
                asyncContext.getResponse().getWriter().println("出现了某些异常哦！！！!");
            }

            @Override
            public void onStartAsync(AsyncEvent asyncEvent) throws IOException {
                System.out.println("开始执行");
            }
        });

        asyncContext.setTimeout(3000L);
        asyncContext.start(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(Long.parseLong(request.getParameter("sleep")));
                    System.out.println("内部线程：" + Thread.currentThread().getName());
                    asyncContext.getResponse().setCharacterEncoding("utf-8");
                    asyncContext.getResponse().setContentType("text/html;charset=UTF-8");
                    asyncContext.getResponse().getWriter().println("异步返回!");
                    asyncContext.getResponse().getWriter().flush();
                    // 异步完成，释放
                    asyncContext.complete();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        System.out.println("主线程over!!! " + Thread.currentThread().getName());
    }
}
```

完整的实现如上，简单的来看一下一般步骤

- `javax.servlet.ServletRequest#startAsync()`获取`AsyncContext`
- 添加监听器 `asyncContext.addListener(AsyncListener)`（这个是可选的）
  - 用户请求开始、超时、异常、完成时回调
- 设置超时时间 `asyncContext.setTimeout(3000L)` （可选）
- 异步任务`asyncContext.start(Runnable)`


### 2. Callable

相比较于上面的复杂的示例，SpringMVC可以非常easy的实现，直接返回一个`Callable`即可

```java
@RestController
@RequestMapping(path = "call")
public class CallableRest {

    @GetMapping(path = "get")
    public Callable<String> get() {
        Callable<String> callable = new Callable<String>() {
            @Override
            public String call() throws Exception {
                System.out.println("do some thing");
                Thread.sleep(1000);
                System.out.println("执行完毕，返回!!!");
                return "over!";
            }
        };

        return callable;
    }


    @GetMapping(path = "exception")
    public Callable<String> exception() {
        Callable<String> callable = new Callable<String>() {
            @Override
            public String call() throws Exception {
                System.out.println("do some thing");
                Thread.sleep(1000);
                System.out.println("出现异常，返回!!!");
                throw new RuntimeException("some error!");
            }
        };

        return callable;
    }
}
```

请注意上面的两种case，一个正常返回，一个业务执行过程中，抛出来异常

分别请求，输出如下

```text
# http://localhost:8080/call/get
do some thing
执行完毕，返回!!!
```

异常请求: `http://localhost:8080/call/exception`

![](/imgs/200329/02.jpg)

```text
do some thing
出现异常，返回!!!
2020-03-29 16:12:06.014 ERROR 24084 --- [nio-8080-exec-5] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] threw exception

java.lang.RuntimeException: some error!
	at com.git.hui.boot.async.rest.CallableRest$2.call(CallableRest.java:40) ~[classes/:na]
	at com.git.hui.boot.async.rest.CallableRest$2.call(CallableRest.java:34) ~[classes/:na]
	at org.springframework.web.context.request.async.WebAsyncManager.lambda$startCallableProcessing$4(WebAsyncManager.java:328) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511) ~[na:1.8.0_171]
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266) ~[na:1.8.0_171]
	at java.util.concurrent.FutureTask.run(FutureTask.java) ~[na:1.8.0_171]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) ~[na:1.8.0_171]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) ~[na:1.8.0_171]
	at java.lang.Thread.run(Thread.java:748) [na:1.8.0_171]
```


### 3. WebAsyncTask

callable的方式，非常直观简单，但是我们经常关注的超时+异常的处理却不太好，这个时候我们可以用`WebAsyncTask`，实现姿势也很简单，包装一下`callable`，然后设置各种回调事件即可

```java
@RestController
@RequestMapping(path = "task")
public class WebAysncTaskRest {

    @GetMapping(path = "get")
    public WebAsyncTask<String> get(long sleep, boolean error) {
        Callable<String> callable = () -> {
            System.out.println("do some thing");
            Thread.sleep(sleep);

            if (error) {
                System.out.println("出现异常，返回!!!");
                throw new RuntimeException("异常了!!!");
            }

            return "hello world";
        };

        // 指定3s的超时
        WebAsyncTask<String> webTask = new WebAsyncTask<>(3000, callable);
        webTask.onCompletion(() -> System.out.println("over!!!"));

        webTask.onTimeout(() -> {
            System.out.println("超时了");
            return "超时返回!!!";
        });

        webTask.onError(() -> {
            System.out.println("出现异常了!!!");
            return "异常返回";
        });

        return webTask;
    }
}
```

### 4. DeferredResult

`DeferredResult`与`WebAsyncTask`最大的区别就是前者不确定什么时候会返回结果，

> `DeferredResult`的这个特点，可以用来做实现很多有意思的东西，如后面将介绍的`SseEmitter`就用到了它

下面给出一个实例

```java
@RestController
@RequestMapping(path = "defer")
public class DeferredResultRest {

    private Map<String, DeferredResult> cache = new ConcurrentHashMap<>();

    @GetMapping(path = "get")
    public DeferredResult<String> get(String id) {
        DeferredResult<String> res = new DeferredResult<>();
        cache.put(id, res);

        res.onCompletion(new Runnable() {
            @Override
            public void run() {
                System.out.println("over!");
            }
        });
        return res;
    }

    @GetMapping(path = "pub")
    public String publish(String id, String content) {
        DeferredResult<String> res = cache.get(id);
        if (res == null) {
            return "no consumer!";
        }

        res.setResult(content);
        return "over!";
    }
}
```

在上面的实例中，用户如果先访问`http://localhost:8080/defer/get?id=yihuihui`，不会立马有结果，直到用户再次访问`http://localhost:8080/defer/pub?id=yihuihui&content=哈哈`时，前面的请求才会有结果返回

![](/imgs/200329/03.gif)

那么这个可以设置超时么，如果一直把前端挂住，貌似也不太合适吧

- 在构造方法中指定超时时间: `new DeferredResult<>(3000L)`
- 设置全局的默认超时时间

```java
@Configuration
@EnableWebMvc
public class WebConf implements WebMvcConfigurer {

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        // 超时时间设置为60s
        configurer.setDefaultTimeout(TimeUnit.SECONDS.toMillis(10));
    }
}
```



## II. 其他

### 0. 项目

**相关博文**

- [007-优化web请求三-异步调用【WebAsyncTask】](https://www.cnblogs.com/bjlhx/p/10444814.html)
- [高性能关键技术之---体验Spring MVC的异步模式（Callable、WebAsyncTask、DeferredResult） 基础使用篇](https://blog.csdn.net/f641385712/article/details/88692534)

**系列博文**

- [200105-SpringBoot系列web篇之自定义返回Http-Code的n种姿势](http://spring.hhui.top/spring-blog/2020/01/05/200105-SpringBoot%E7%B3%BB%E5%88%97web%E7%AF%87%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%BF%94%E5%9B%9EHttp-Code%E7%9A%84n%E7%A7%8D%E5%A7%BF%E5%8A%BF/)
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
- 项目源码: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/219-web-asyn](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/219-web-asyn)



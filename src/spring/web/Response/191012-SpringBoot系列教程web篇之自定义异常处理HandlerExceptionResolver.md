---
order: 8
title: 8.自定义异常处理HandlerExceptionResolver
tag: 
  - Web
  - 异常处理
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2019-10-12 19:53:50
keywords: 异常处理 SpringBoot Spring ControllerAdvice ExceptionHandler ResponseStatus NoHandlerFoundException HandlerExceptionResolver
---

关于Web应用的全局异常处理，上一篇介绍了`ControllerAdvice`结合`@ExceptionHandler`的方式来实现web应用的全局异常管理；

本篇博文则带来另外一种并不常见的使用方式，通过实现自定义的`HandlerExceptionResolver`，来处理异常状态

> 上篇博文链接: [SpringBoot系列教程web篇之全局异常处理](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484344&idx=1&sn=d4b1422a709d9540583e33443aab6fff&chksm=fce71814cb9091025a960312c878ff9fc4f44fd0035aa597f55f37c90dcbac25a3e96ee2c528&token=118864495&lang=zh_CN#rd)

<!-- more -->

## I. 环境搭建

首先得搭建一个web应用才有可能继续后续的测试，借助SpringBoot搭建一个web应用属于比较简单的活;

创建一个maven项目，pom文件如下

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.7</version>
    <relativePath/> <!-- lookup parent from update -->
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.45</version>
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
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

## II. HandlerExceptionResolver

### 1. 自定义异常处理

`HandlerExceptionResolver`顾名思义，就是处理异常的类，接口就一个方法，出现异常之后的回调，四个参数中还携带了异常堆栈信息

```java
@Nullable
ModelAndView resolveException(
		HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex);
```

我们自定义异常处理类就比较简单了，实现上面的接口，然后将完整的堆栈返回给调用方

```java
public class SelfExceptionHandler implements HandlerExceptionResolver {
    @Override
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) {
        String msg = GlobalExceptionHandler.getThrowableStackInfo(ex);

        try {
            response.addHeader("Content-Type", "text/html; charset=UTF-8");
            response.getWriter().append("自定义异常处理!!! \n").append(msg).flush();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}

// 堆栈信息打印方法如下
public static String getThrowableStackInfo(Throwable e) {
    ByteArrayOutputStream buf = new ByteArrayOutputStream();
    e.printStackTrace(new java.io.PrintWriter(buf, true));
    String msg = buf.toString();
    try {
        buf.close();
    } catch (Exception t) {
        return e.getMessage();
    }
    return msg;
}
```

仔细观察上面的代码实现，有下面几个点需要注意

- 为了确保中文不会乱码，我们设置了返回头 `response.addHeader("Content-Type", "text/html; charset=UTF-8");` 如果没有这一行，会出现中文乱码的情况
- 我们纯后端应用，不想返回视图，直接想Response的输出流中写入数据返回 `response.getWriter().append("自定义异常处理!!! \n").append(msg).flush();`； 如果项目中有自定义的错误页面，可以通过返回`ModelAndView`来确定最终返回的错误页面
- 上面一个代码并不会直接生效，需要注册，可以在`WebMvcConfigurer`的子类中实现注册，实例如下

```java
@SpringBootApplication
public class Application implements WebMvcConfigurer {
    @Override
    public void configureHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
        resolvers.add(0, new SelfExceptionHandler());
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```


### 2. 测试case

我们依然使用上篇博文的用例来测试

```java
@Controller
@RequestMapping(path = "page")
public class ErrorPageRest {

    @ResponseBody
    @GetMapping(path = "divide")
    public int divide(int sub) {
        return 1000 / sub;
    }
}
```

下面分别是404异常和500异常的实测情况

![](/imgs/191012/00.jpg)

500异常会进入我们的自定义异常处理类, 而404依然走的是默认的错误页面，所以如果我们需要捕获404异常，依然需要在配置文件中添加

```properties
# 出现错误时, 直接抛出异常
spring.mvc.throw-exception-if-no-handler-found=true
# 设置静态资源映射访问路径
spring.mvc.static-path-pattern=/statics/**
# spring.resources.add-mappings=false
```

**为什么404需要额外处理？**

下面尽量以通俗易懂的方式说明下这个问题

- java web应用，除了返回json类数据之外还可能返回网页，js，css
- 我们通过 `@ResponseBody`来表明一个url返回的是json数据（通常情况下是这样的，不考虑自定义实现）
- 我们的`@Controller`中通过`@RequestMapping`定义的REST服务，返回的是静态资源
- 那么js,css,图片这些文件呢，在我们的web应用中并不会定义一个REST服务
- 所以当接收一个http请求，找不到url关联映射时，默认场景下不认为这是一个`NoHandlerFoundException`，不抛异常，而是到静态资源中去找了(静态资源中也没有，为啥不抛NoHandlerFoundException呢？这个异常表示这个url请求没有对应的处理器，但是我们这里呢，给它分配到了静态资源处理器了`ResourceHttpRequestHandler`)

针对上面这点，如果有兴趣深挖的同学，这里给出关键代码位置

```java
// 进入方法： `org.springframework.web.servlet.DispatcherServlet#doDispatch`

// debug 节点
Determine handler for the current request.
mappedHandler = getHandler(processedRequest);
if (mappedHandler == null) {
	noHandlerFound(processedRequest, response);
	return;
}

// 核心逻辑
// org.springframework.web.servlet.DispatcherServlet#getHandler
@Nullable
protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
	if (this.handlerMappings != null) {
		for (HandlerMapping hm : this.handlerMappings) {
			if (logger.isTraceEnabled()) {
				logger.trace(
						"Testing handler map [" + hm + "] in DispatcherServlet with name '" + getServletName() + "'");
			}
			HandlerExecutionChain handler = hm.getHandler(request);
			if (handler != null) {
				return handler;
			}
		}
	}
	return null;
}
```

### 3. 小结

本篇博文虽然也介绍了一种新的全局异常处理方式，实现效果和`ControllerAdvice`也差不多，但是并不推荐用这种方法, 原因如下

- `HandlerExceptionResolver`的方式没有`ControllerAdvice`方式简介优雅
- 官方提供的`DefaultHandlerExceptionResolver`已经非常强大了，基本上覆盖了http的各种状态码，我们自己再去定制的必要性不大



## II. 其他


#### web系列博文

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

#### 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/209-web-error](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/209-web-error)



---
order: 7
title: 7.全局异常处理
tag: 
  - Web
  - 异常处理
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2019-10-10 18:15:16
keywords: 异常处理 SpringBoot Spring ControllerAdvice ExceptionHandler ResponseStatus NoHandlerFoundException
---

当我们的后端应用出现异常时，通常会将异常状况包装之后再返回给调用方或者前端，在实际的项目中，不可能对每一个地方都做好异常处理，再优雅的代码也可能抛出异常，那么在Spring项目中，可以怎样优雅的处理这些异常呢?

本文将介绍一种全局异常处理方式，主要包括以下知识点

- @ControllerAdvice Controller增强
- @ExceptionHandler 异常捕获
- @ResponseStatus 返回状态码
- NoHandlerFoundException处理（404异常捕获）

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

依然是一般的流程，pom依赖搞定之后，写一个程序入口

```java
/**
 * Created by @author yihui in 15:26 19/9/13.
 */
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

## II. 异常处理

### 1. @ControllerAdvice

我们通常利用`@ControllerAdvice`配合注解`@ExceptionHandler`来实现全局异常捕获处理

- `@ControllerAdvice`为所有的Controller织入增强方法
- `@ExceptionHandler`标记在方法上，表示当出现对应的异常抛出到上层时（即没有被业务捕获），这个方法会被触发

下面我们通过实例进行功能演示

#### a. 异常捕获

我们定义两个异常捕获的case，一个是除0，一个是数组越界异常

```java
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

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

    @ResponseBody
    @ExceptionHandler(value = ArithmeticException.class)
    public String handleArithmetic(HttpServletRequest request, HttpServletResponse response, ArithmeticException e)
            throws IOException {
        log.info("divide error!");
        return "divide 0: " + getThrowableStackInfo(e);
    }

    @ResponseBody
    @ExceptionHandler(value = ArrayIndexOutOfBoundsException.class)
    public String handleArrayIndexOutBounds(HttpServletRequest request, HttpServletResponse response,
            ArrayIndexOutOfBoundsException e) throws IOException {
        log.info("array index out error!");
        return "aryIndexOutOfBounds: " + getThrowableStackInfo(e);
    }
}
```

在上面的测试中，我们将异常堆栈返回调用方

#### b. 示例服务

增加几个测试方法

```java
@Controller
@RequestMapping(path = "page")
public class ErrorPageRest {

    @ResponseBody
    @GetMapping(path = "divide")
    public int divide(int sub) {
        return 1000 / sub;
    }

    private int[] ans = new int[]{1, 2, 3, 4};

    @ResponseBody
    @GetMapping(path = "ary")
    public int ary(int index) {
        return ans[index];
    }
}
```

#### c. 测试说明

实例测试如下，上面我们声明捕获的两种异常被拦截并输出对应的堆栈信息；

但是需要注意

- **404和未捕获的500异常**则显示的SpringBoot默认的错误页面；
- 此外我们捕获返回的http状态码是200

![](/imgs/191010/00.jpg)

### 2. @ResponseStatus

上面的case中捕获的异常返回的状态码是200，但是在某些case中，可能更希望返回更合适的http状态码，此时可以使用`ResponseStatus`来指定

使用方式比较简单，加一个注解即可

```java
@ResponseBody
@ExceptionHandler(value = ArithmeticException.class)
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public String handleArithmetic(HttpServletRequest request, HttpServletResponse response, ArithmeticException e)
        throws IOException {
    log.info("divide error!");
    return "divide 0: " + getThrowableStackInfo(e);
}
```


![](/imgs/191010/01.jpg)

### 3. 404处理

通过`@ControllerAdvice`配合`@ExceptionHandler`可以拦截500异常，如果我希望404异常也可以拦截，可以如何处理？


首先修改配置文件`application.properties`，将`NoHandlerFoundException`抛出来

```properties
# 出现错误时, 直接抛出异常
spring.mvc.throw-exception-if-no-handler-found=true
# 设置静态资源映射访问路径，下面两个二选一，
spring.mvc.static-path-pattern=/statics/**
# spring.resources.add-mappings=false
```

其次是定义异常捕获

```java
@ResponseBody
@ExceptionHandler(value = NoHandlerFoundException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public String handleNoHandlerError(NoHandlerFoundException e, HttpServletResponse response) {
    return "noHandlerFound: " + getThrowableStackInfo(e);
}
```

再次测试如下，404被我们捕获并返回堆栈信息

![](/imgs/191010/02.jpg)


## II. 其他

### 0. 项目

#### web系列博文

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


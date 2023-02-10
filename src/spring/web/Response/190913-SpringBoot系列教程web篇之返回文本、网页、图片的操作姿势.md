---
order: 4
title: 4.返回文本、网页、图片的操作姿势
tag: 
  - response
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2019-09-13 17:44:42
keywords: Spring SpringBoot SpringMVC HttpServletResponse Image 数据返回 静态网页
---

前面几篇博文介绍了如何获取get/post传参，既然是http请求，一般也都是有来有往，有请求参数传递，就会有数据返回。那么我们通过springboot搭建的web应用，可以怎样返回数据呢？

本篇将主要介绍以下几种数据格式的返回实例

- 返回文本
- 返回数组
- 返回json串
- 返回静态网页
- 返回图片

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

## II. 数据返回姿势实例

以下返回实例都放在同一个Controller中，具体定义如下

```java
@Controller
@RequestMapping(path = "data")
public class DataRespRest {
}
```

### 1. 文本返回

这个属于基础功能了，发起请求，返回一串文本，在SpringMVC的体系中，要实现这种通常的写法通常是直接定义方法的返回为String；当然还有另外一种非常基础的写法，直接将返回的数据通过`HttpServletResponse`写入到输出流中

下面给出这两种写法的实例

```java
@ResponseBody
@GetMapping(path = "str")
public String strRsp() {
    return "hello " + UUID.randomUUID().toString();
}

@ResponseBody
@GetMapping(path = "str2")
public void strRsp2(HttpServletResponse response) throws IOException {
    Map<String, String> ans = new HashMap<>(2);
    ans.put("a", "b");
    ans.put("b", "c");
    response.getOutputStream().write(JSON.toJSONString(ans).getBytes());
    response.getOutputStream().flush();
}
```

注意上面的实现中，方法上面多了一个注解`@ResponseBody`，这个表示返回数据，而不是视图（后面会详细说明）

`strRsp2`的输出借助了FastJson来实现将map序列化为json串，然后写入输出流

实例访问如下

![](/imgs/190913/00.jpg)


从上面的输出也可以看出，第一种返回方式，`ResponseHeaders`的`Content-Type: text/html;charset=UTF-8`；而第二种方式则没有这个响应头，需要我们自己主动设置（这里注意一下即可，在后面的返回图片中有实例）

### 2，返回数组

前面请求参数的博文中，我们看到请求参数允许传入数组，那么我们返回可以直接返回数组么？讲道理的话，应该没啥问题

```java
/**
 * 返回数组
 *
 * @return
 */
@ResponseBody
@GetMapping(path = "ary")
public String[] aryRsp() {
    return new String[]{UUID.randomUUID().toString(), LocalDateTime.now().toString()};
}
```

然后请求输出为

![](/imgs/190913/00.jpg)

注意下响应头，为`application/json`, 也就是说SpringMVC将数组当成json串进行返回了

### 3. Bean返回

在我们实际的业务开发中，这种应该属于非常常见的使用姿势了，直接返回一个POJO，调用者接收的是一个json串，可以很容易的反序列化为需要的对象

```java
/**
 * 返回POJO
 *
 * @return
 */
@ResponseBody
@GetMapping(path = "bean")
public DemoRsp beanRsp() {
    return new DemoRsp(200, "success", UUID.randomUUID().toString() + "--->data");
}
```

![](/imgs/190913/02.jpg)

### 4. 网页返回

前面都是直接返回数据，但是我们平常在使用浏览器，更多的是发起一个请求，然后返回一个网页啊，难道说springmvc不能直接返回网页么？

当然返回网页怎么可能会不支持，（题外话：个人感觉在前后端分离逐渐流行之后，直接由后端返回网页的case不太多了，前端和后端作为独立的项目部署，两者之间通过json串进行交流；这里扯远了），我们下面看一下SpringMVC中如何返回网页

我们可以从上面直接返回字符串的case中，得到一个思路，如果我直接返回一个html文本，会怎样？既然返回`content-type`是`text/html`，那浏览器应该可以解析为网页的，下面实测一下

```java
@ResponseBody
@GetMapping(path = "html")
public String strHtmlRsp() {
    return "<html>\n" + "<head>\n" + "    <title>返回数据测试</title>\n" + "</head>\n" + "<body>\n" +
            "<h1>欢迎欢迎，热烈欢迎</h1>\n" + "</body>\n" + "</html>";
}
```

测试如下

![](/imgs/190913/03.jpg)

浏览器发起请求之后，将我们返回的html文本当做网页正常渲染了，所以我们如果想返回网页，就这么干，没毛病！

上面这种方式虽然说可以返回网页，然而在实际业务中，如果真要我们这么干，想想也是可怕，还干什么后端，分分钟全栈得了！！！

下面看一下更常规的写法，首先我们需要配置下返回视图的前缀、后缀, 在`application.yml`配置文件中添加如下配置

```yml
spring:
  mvc:
    view:
      prefix: /
      suffix: .html
```

然后我们的静态网页，放在资源文件的static目录下，下面是我们实际的项目截图，index.html为我们需要返回的静态网页

![](/imgs/190913/04.jpg)

接下来就是我们的服务接口

```java
/**
 * 返回视图
 *
 * @return
 */
@GetMapping(path = "view")
public String viewRsp() {
    return "index";
}
```

注意下上面的接口，没有`@ResponseBody`注解，表示这个接口返回的是一个视图，会从static目录下寻找名为`index.html`（前缀路径和后缀是上面的application.yml中定义）的网页返回

实测case如下

![](/imgs/190913/05.jpg)

### 5. 图片返回

图片返回与前面的又不太一样了，上面介绍的几种case中，要么是返回文本，要么返回视图，而返回图片呢，更多的是返回图片的字符数组，然后告诉浏览器这是个图片，老哥你按照图片渲染

直接返回二进制流，上面在介绍文本返回的两种方式中，有个直接通过`HttpServletResponse`向输出流中写数据的方式，我们这里是不是可以直接这么用呢？

下面给出一个从网络下载图片并返回二进制流的实际case

```java
/**
 * 返回图片
 */
@GetMapping(path = "img")
public void imgRsp(HttpServletResponse response) throws IOException {
    response.setContentType("image/png");
    ServletOutputStream outStream = response.getOutputStream();

    String path = "https://spring.hhui.top/spring-blog/imgs/info/info.png";
    URL uri = new URL(path);
    BufferedImage img = ImageIO.read(uri);
    ImageIO.write(img, "png", response.getOutputStream());
    System.out.println("--------");
}
```

注意下上面的实例case，首先设置了返回的`ContentType`，然后借助`ImateIO`来下载图片（个人不太建议这种写法，很容易出现403；这里演示主要是为了简单...），并将图片写入到输出流

实例演示如下

![](/imgs/190913/06.jpg)

## III 小结

### 1. 返回数据小结

本篇博文主要介绍了几种常见数据格式的返回使用姿势，本文更多的是一种使用方式的实例case演示，并没有涉及到底层的支持原理，也没有过多的提及如何设置响应头，web交互中常见的cookies/session也没有说到，这些将作为下篇的内容引入，恳请关注

下面做一个简单的小结

**返回纯数据**

- 添加`@ResponseBody`注解，则表示我们返回的是数据，而不需要进行视图解析渲染；
  - 如果一个controller中全部都是返回数据，不会返回视图时，我们可以在添加`@RestController`注解，然后这个类中的接口都不需要添加`@ResponseBody`注解了
- 返回视图时，我们会根据接口返回的字符串，结合定义的前缀，后缀，到资源路径的static目录下寻找对应的静态文件返回
- 可以直接通过向`HttpServletResponse`的输出流中写数据的方式来返回数据，如返回图片常用这种case

### 2. 更多web系列博文

- [190905-SpringBoot系列教程web篇之中文乱码问题解决](http://spring.hhui.top/spring-blog/2019/09/05/190905-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3/)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](http://spring.hhui.top/spring-blog/2019/08/31/190831-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E5%A6%82%E4%BD%95%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%99%A8/)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/28/190828-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BPost%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/24/190824-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BGet%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](http://spring.hhui.top/spring-blog/2019/08/22/190822-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BBeetl%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://spring.hhui.top/spring-blog/2019/08/20/190820-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BThymeleaf%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://spring.hhui.top/spring-blog/2019/08/16/190816-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BFreemaker%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)


## IV. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response)


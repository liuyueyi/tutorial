---
order: 6
title: 6.404、500异常页面配置
tag: 
  - response
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2019-09-30 18:17:11
keywords: Spring SpringBoot SpringMVC 404 500 异常页面 默认配置 BaseErrorController
---

接着前面几篇web处理请求的博文，本文将说明，当出现异常的场景下，如404请求url不存在，，403无权，500服务器异常时，我们可以如何处理

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

## II. 异常页面配置

在SpringBoot项目中，本身提供了一个默认的异常处理页面，当我们希望使用自定义的404,500等页面时，可以如何处理呢？

### 1. 默认异常页面配置

在默认的情况下，要配置异常页面非常简单，在资源路径下面，新建 `error` 目录，在下面添加`400.html`, `500html`页面即可

![](/imgs/190930/00.jpg)

项目结构如上，注意这里的实例demo是没有使用模板引擎的，所以我们的异常页面放在static目录下；如果使用了如FreeMaker模板引擎时，可以将错误模板页面放在template目录下

接下来实际测试下是否生效, 我们先定义一个可能出现服务器500的服务

```java
@Controller
@RequestMapping(path = "page")
public class ErrorPageRest {

    @ResponseBody
    @GetMapping(path = "divide")
    public int divide(int sub) {
        System.out.println("divide1");
        return 1000 / sub;
    }
}
```

请求一个不存在的url，返回我们定义的`400.html`页面

```html
<html>
<head>
    <title>404页面</title>
</head>
<body>
<h3>页面不存在</h3>
</body>
</html>
```

![](/imgs/190930/01.jpg)


请求一个服务器500异常，返回我们定义的`500.html`页面

```html
<html>
<head>
    <title>500页面</title>
</head>
<body>
<h2 style="color: red;">服务器出现异常!!!</h2>
</body>
</html>
```

![](/imgs/190930/02.jpg)


### 2. BasicErrorController

看上面的使用比较简单，自然会有个疑问，这个异常页面是怎么返回的呢？

从项目启动的日志中，注意一下`RequestMappingHandlerMapping`

![](/imgs/190930/03.jpg)

可以发现里面有个`/error`的路径不是我们自己定义的，从命名上来看，这个多半就是专门用来处理异常的Controller -> `BasicErrorController`， 部分代码如下

```java
@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class BasicErrorController extends AbstractErrorController {

	@Override
	public String getErrorPath() {
		return this.errorProperties.getPath();
	}

	@RequestMapping(produces = "text/html")
	public ModelAndView errorHtml(HttpServletRequest request,
			HttpServletResponse response) {
		HttpStatus status = getStatus(request);
		Map<String, Object> model = Collections.unmodifiableMap(getErrorAttributes(
				request, isIncludeStackTrace(request, MediaType.TEXT_HTML)));
		response.setStatus(status.value());
		ModelAndView modelAndView = resolveErrorView(request, response, status, model);
		return (modelAndView != null) ? modelAndView : new ModelAndView("error", model);
	}

	@RequestMapping
	@ResponseBody
	public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
		Map<String, Object> body = getErrorAttributes(request,
				isIncludeStackTrace(request, MediaType.ALL));
		HttpStatus status = getStatus(request);
		return new ResponseEntity<>(body, status);
	}
}
```

这个Controller中，一个返回网页的接口，一个返回Json串的接口；我们前面使用的应该是第一个，那我们什么场景下会使用到第二个呢？

- 通过制定请求头的`Accept`，来限定我们只希望获取json的返回即可

![](/imgs/190930/04.jpg)

### 3. 小结

本篇内容比较简单，归纳为两句话如下

- 将自定义的异常页面根据http状态码命名，放在`/error`目录下
- 在异常状况下，根据返回的http状态码找到对应的异常页面返回



## II. 其他

### 0. 项目

#### a. 系列博文

- [190929-SpringBoot系列教程web篇之重定向](http://spring.hhui.top/spring-blog/2019/09/29/190929-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E9%87%8D%E5%AE%9A%E5%90%91/)
- [190913-SpringBoot系列教程web篇之返回文本、网页、图片的操作姿势](http://spring.hhui.top/spring-blog/2019/09/13/190913-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E8%BF%94%E5%9B%9E%E6%96%87%E6%9C%AC%E3%80%81%E7%BD%91%E9%A1%B5%E3%80%81%E5%9B%BE%E7%89%87%E7%9A%84%E6%93%8D%E4%BD%9C%E5%A7%BF%E5%8A%BF/)
- [190905-SpringBoot系列教程web篇之中文乱码问题解决](http://spring.hhui.top/spring-blog/2019/09/05/190905-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3/)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](http://spring.hhui.top/spring-blog/2019/08/31/190831-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E5%A6%82%E4%BD%95%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%99%A8/)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/28/190828-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BPost%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/24/190824-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BGet%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](http://spring.hhui.top/spring-blog/2019/08/22/190822-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BBeetl%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://spring.hhui.top/spring-blog/2019/08/20/190820-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BThymeleaf%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://spring.hhui.top/spring-blog/2019/08/16/190816-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BFreemaker%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA/)

#### b. 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/207-web-response)



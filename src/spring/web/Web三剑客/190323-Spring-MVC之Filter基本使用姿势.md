---
order: 1
title: 1.Filter基本使用姿势
tag: 
  - Web
  - Filter
category: 
  - SpringBoot
  - WEB系列
  - web三剑客
date: 2019-03-23 15:20:19
keywords: Spring,SpringMVC,Fitler
---

Java Web三大基本组件，我们知道SpringMVC主要就是构建在Servlet的基础上的，接下来我们看一下Filter的使用姿势

<!-- more -->

## I. Filter说明

在介绍filter的使用之前，有必要知道下什么是fitler。

![filter结构](/imgs/190323/00.jpg)

Filter称为过滤器，主要用来拦截http请求，做一些其他的事情

### 1. 流程说明

一个http请求过来之后

- 首先进入filter，执行相关业务逻辑
- 若判定通行，则进入Servlet逻辑，Servlet执行完毕之后，又返回Filter，最后在返回给请求方
- 判定失败，直接返回，不需要将请求发给Servlet

### 2. 场景

通过上面的流程，可以推算使用场景：

- 在filter层，来获取用户的身份
- 可以考虑在filter层做一些常规的校验（如参数校验，referer校验等）
- 可以在filter层做稳定性相关的工作（如全链路打点，可以在filter层分配一个traceId；也可以在这一层做限流等）


## II. 使用姿势

### 1. 基本配置

在前面Java Config搭建了一个简单的web应用，我们的filter测试也放在这个demo工程上继续

pom配置如下

```java
<properties>
    <spring.version>5.1.5.RELEASE</spring.version>
</properties>

<dependencies>
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>3.1.0</version>
    </dependency>

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aop</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>${spring.version}</version>
    </dependency>

    <dependency>
        <groupId>org.eclipse.jetty.aggregate</groupId>
        <artifactId>jetty-all</artifactId>
        <version>9.2.19.v20160908</version>
    </dependency>
</dependencies>

<build>
    <finalName>web-mvc</finalName>
    <plugins>
        <plugin>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-maven-plugin</artifactId>
            <version>9.4.12.RC2</version>
            <configuration>
                <httpConnector>
                    <port>8080</port>
                </httpConnector>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 2. filter声明

创建一个filter，得首先告诉spring说，我这有个filter，你得把它用起来；使用java config的方式创建应用，干掉xml文件，我们知道Servlet容器会扫描`AbstractDispatcherServletInitializer`的实现类

所以我们的filter声明也放在这里

```java
public class MyWebApplicationInitializer extends AbstractDispatcherServletInitializer {
    @Override
    protected WebApplicationContext createRootApplicationContext() {
        return null;
    }

    @Override
    protected WebApplicationContext createServletApplicationContext() {
        AnnotationConfigWebApplicationContext applicationContext = new AnnotationConfigWebApplicationContext();
        //        applicationContext.setConfigLocation("com.git.hui.spring");
        applicationContext.register(RootConfig.class);
        applicationContext.register(WebConfig.class);

        System.out.println("-------------------");

        return applicationContext;
    }

    @Override
    protected String[] getServletMappings() {
        return new String[]{"/*"};
    }


    @Override
    protected Filter[] getServletFilters() {
        return new Filter[]{new CharacterEncodingFilter("UTF-8", true), new MyCorsFilter()};
    }
}
```

看上面最后一个方法，返回当前支持的fitler数组，其中 `MyCorsFilter` 就是我们自定义的fitler

### 3. Filter实现

自定义一个filter，需要实现Filter接口，其中有三个方法，主要的是第二个

```java
/**
 * Created by @author yihui in 16:13 19/3/18.
 *
 * 测试:
 *
 * - 返回头不会包含CORS相关： curl -i 'http://127.0.0.1:8080/welcome?name=一灰灰' -e 'http://hhui.top'
 * - 返回头支持CORS： curl -i 'http://127.0.0.1:8080/hello?name=一灰灰' -e 'http://hhui.top'
 */
@Slf4j
public class MyCorsFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        try {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;

            if ("/hello".equals(request.getRequestURI())) {
                response.setHeader("Access-Control-Allow-Origin", request.getHeader("origin"));
                response.setHeader("Access-Control-Allow-Methods", "*");
                response.setHeader("Access-Control-Allow-Credentials", "true");
            }
        } finally {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    @Override
    public void destroy() {
    }
}
```

上面的`doFilter`方法就是我们重点观察目标，三个参数，注意第三个

- 执行 `filterChain.doFilter(servletRequest, servletResponse)` 表示会继续将请求执行下去；若不执行这一句，表示这一次的http请求到此为止了，后面的走不下去了


### 4. 测试

创建一个rest接口，用来测试下我们的filter是否生效

```java
@RestController
public class HelloRest {
    @Autowired
    private PrintServer printServer;

    @GetMapping(path = {"hello", "welcome"}, produces = "text/html;charset=UTF-8")
    public String sayHello(HttpServletRequest request) {
        printServer.print();
        return "hello, " + request.getParameter("name");
    }


    @GetMapping({"/", ""})
    public String index() {
        return UUID.randomUUID().toString();
    }
}
```

启动web之后，观察下访问 `hello` 与 `welcome` 的返回头


![test case](/imgs/190323/01.jpg)

### 5. 其他

相关博文

- [JavaWeb三大组件之Filter学习详解](https://blog.hhui.top/hexblog/2018/01/26/JavaWeb%E4%B8%89%E5%A4%A7%E7%BB%84%E4%BB%B6%E4%B9%8BFilter%E5%AD%A6%E4%B9%A0%E8%AF%A6%E8%A7%A3/)
- [190316-Spring MVC之基于xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/16/190316-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Exml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/17/190317-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Ejava-config%E6%97%A0xml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)


## II. 其他

### - 系列博文

web系列: 

- [Spring Web系列博文汇总](http://spring.hhui.top/spring-blog/categories/SpringBoot/%E9%AB%98%E7%BA%A7%E7%AF%87/Web/)

mvc应用搭建篇:

- [190316-Spring MVC之基于xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/16/190316-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Exml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/17/190317-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Ejava-config%E6%97%A0xml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)
- [190319-SpringBoot高级篇WEB之demo应用构建](http://spring.hhui.top/spring-blog/2019/03/19/190319-SpringBoot%E9%AB%98%E7%BA%A7%E7%AF%87WEB%E4%B9%8Bdemo%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)

### 0. 项目

- 工程：[spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring/200-mvc-annotation](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring/200-mvc-annotation)



---
order: 2
title: 2.基于java config无xml配置的web应用构建
tag: 
  - SpringMVC
  - Web
category: 
  - SpringBoot
  - WEB系列
  - 示例
date: 2019-03-17 12:59:37
keywords: Spring,JavaConfig,SpringMVC,Jetty,DispatchServlet
---

前一篇博文讲了SpringMVC+web.xml的方式创建web应用，用过SpringBoot的童鞋都知道，早就没有xml什么事情了，其实Spring 3+, Servlet 3+的版本，就已经支持java config，不用再写xml；本篇将介绍下，如何利用java config取代xml配置

本篇博文，建议和上一篇对比看，贴出上一篇地址

- [190316-Spring MVC之基于xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/16/190316-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Exml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)

<!-- more -->

## I. Web构建

### 1. 项目依赖

对于依赖这一块，和前面一样，不同的在于java config 取代 xml

```xml
<artifactId>200-mvc-annotation</artifactId>
<packaging>war</packaging>

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

细心的童鞋会看到，依赖中多了一个jetty-all，后面测试篇幅会说到用法

### 2. 项目结构

第二节依然放上项目结构，在这里把xml的结构也截进来了，对于我们的示例demo而言，最大的区别就是没有了webapp，更没有webapp下面的几个xml配置文件

![项目结构](/imgs/190317/00.jpg)

### 3. 配置设定

现在没有了配置文件，我们的配置还是得有，不然web容器（如tomcat）怎么找到DispatchServlet呢

#### a. DispatchServlet 声明

同样我们需要干的第一件事情及时声明DispatchServlet，并设置它的应用上下文；可以怎么用呢？从官方找到教程

> @SpringWebMvc教程 https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-servlet

The DispatcherServlet, as any Servlet, needs to be declared and mapped according to the Servlet specification by using Java configuration or in web.xml. In turn, the DispatcherServlet uses Spring configuration to discover the delegate components it needs for request mapping, view resolution, exception handling


上面的解释，就是说下面的代码和web.xml的效果是一样一样的

```java
public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletCxt) {
        // Load Spring web application configuration
        AnnotationConfigWebApplicationContext ac = new AnnotationConfigWebApplicationContext();
        ac.register(AppConfig.class);
        ac.refresh();

        // Create and register the DispatcherServlet
        DispatcherServlet servlet = new DispatcherServlet(ac);
        ServletRegistration.Dynamic registration = servletCxt.addServlet("mvc-dispatcher", servlet);
        registration.setLoadOnStartup(1);
        registration.addMapping("/*");
    }
}
```

当然直接实现接口的方式有点粗暴，但是好理解，上面的代码和我们前面的web.xml效果一样，创建了一个DispatchServlet, 并且绑定了url命中规则；设置了应用上下文`AnnotationConfigWebApplicationContext`

这个上下文，和我们前面的配置文件`mvc-dispatcher-servlet`有点像了；如果有兴趣看到项目源码的同学，会发现用的不是上面这个方式，而是及基础接口`AbstractDispatcherServletInitializer`

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
        return applicationContext;
    }

    @Override
    protected String[] getServletMappings() {
        return new String[]{"/*"};
    }
    
    @Override
    protected Filter[] getServletFilters() {
        return new Filter[]{new HiddenHttpMethodFilter(), new CharacterEncodingFilter()};
    }
}
```

看到上面这段代码，这个感觉就和xml的方式更像了，比如Servlet应用上下文和根应用上下文

**说明**

上面代码中增加的Filter先无视，后续会有专文讲什么是Filter以及Filter可以怎么用

#### b. java config

前面定义了DispatchServlet，接下来对比web.xml就是需要配置扫描并注册bean了，本文基于JavaConfig的方式，则主要是借助 `@Configuration` 注解来声明配置类（这个可以等同于一个xml文件）

前面的代码也可以看到，上下文中注册了两个Config类

RootConfig定义如下，注意下注解`@ComponentScan`，这个等同于`<context:component-sca/>`，指定了扫描并注册激活的bean的包路径

```java
@Configuration
@ComponentScan(value = "com.git.hui.spring")
public class RootConfig {
}
```

另外一个WebConfig的作用则主要在于开启WebMVC

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
}
```

### 4. 实例代码

实例和上一篇一样，一个普通的Server Bean和一个Controller

```java
@Component
public class PrintServer {
    public void print() {
        System.out.println(System.currentTimeMillis());
    }
}
```

一个提供rest服务的HelloRest

```java
@RestController
public class HelloRest {
    @Autowired
    private PrintServer printServer;

    @GetMapping(path = "hello", produces="text/html;charset=UTF-8")
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

### 5. 测试

测试依然可以和前面一样，使用jetty来启动，此外，介绍另外一种测试方式，也是jetty，但是不同的是我们直接写main方法来启动服务

```java
public class SpringApplication {

    public static void main(String[] args) throws Exception {
        Server server = new Server(8080);
        ServletContextHandler handler = new ServletContextHandler();

        // 服务器根目录，类似于tomcat部署的项目。 完整的访问路径为ip:port/contextPath/realRequestMapping
        //ip:port/项目路径/api请求路径
        handler.setContextPath("/");

        AnnotationConfigWebApplicationContext applicationContext = new AnnotationConfigWebApplicationContext();
        applicationContext.register(WebConfig.class);
        applicationContext.register(RootConfig.class);

        //相当于web.xml中配置的ContextLoaderListener
        handler.addEventListener(new ContextLoaderListener(applicationContext));

        //springmvc拦截规则 相当于web.xml中配置的DispatcherServlet
        handler.addServlet(new ServletHolder(new DispatcherServlet(applicationContext)), "/*");

        server.setHandler(handler);
        server.start();
        server.join();
    }
}
```

测试示意图如下

![测试示意图](/imgs/190317/01.gif)

### 6. 小结

简单对比下xml的方式，会发现java config方式会清爽很多，不需要多个xml配置文件，维持几个配置类，加几个注解即可；当然再后面的SpringBoot就更简单了，几个注解了事，连上面的两个Config文件, ServletConfig都可以省略掉

另外一个需要注意的点就是java config的运行方式，在servlet3之后才支持的，也就是说如果用比较老的jetty是起不来的（或者无法正常访问web服务）


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



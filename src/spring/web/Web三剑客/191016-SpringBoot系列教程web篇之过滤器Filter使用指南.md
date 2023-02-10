---
order: 2
title: 2.过滤器Filter使用指南
tag: 
  - Filter
category: 
  - SpringBoot
  - WEB系列
  - web三剑客
date: 2019-10-16 10:56:35
keywords: Filter Spring SpringBoot WebFilter FilterRegistrationBean Order 优先级
---

web三大组件之一Filter，可以说是很多小伙伴学习java web时最早接触的知识点了，然而学得早不代表就用得多。基本上，如果不是让你从0到1写一个web应用（或者说即便从0到1写一个web应用），在你的日常业务开发中不太可能碰到需要手写Filter的场景

本文将简单介绍写什么是Filter，以及在SpringBoot中使用Filter的一般姿势与常见问题

<!-- more -->

## I. 背景

在正式开始之前，有必要先简单看一下什么是Filter（过滤器），以及这个有什么用

### 1. Filter说明

Filter，过滤器，属于Servlet规范，并不是Spring独有的。其作用从命名上也可以看出一二，拦截一个请求，做一些业务逻辑操作，然后可以决定请求是否可以继续往下分发，落到其他的Filter或者对应的Servlet

简单描述下一个http请求过来之后，一个Filter的工作流程：

- 首先进入filter，执行相关业务逻辑
- 若判定通行，则进入Servlet逻辑，Servlet执行完毕之后，又返回Filter，最后在返回给请求方
- 判定失败，直接返回，不需要将请求发给Servlet

> 插播一句：上面这个过程，和AOP中的`@Around`环绕切面的作用差不多

### 2. 项目搭建

接下来我们搭建一个web应用方便后续的演示，借助SpringBoot搭建一个web应用属于比较简单的活;

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

## II. Filter教程

### 1. 使用说明

在SpringBoot项目中，如果需要自定义一个Filter，并没有什么特殊的地方，直接实现接口即可，比如下面一个输出请求日志的拦截器

```java
@Slf4j
@WebFilter
public class ReqFilter implements Filter {
    public ReqFilter() {
        System.out.println("init reqFilter");
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        log.info("url={}, params={}", req.getRequestURI(), JSON.toJSONString(req.getParameterMap()));
        chain.doFilter(req, response);
    }

    @Override
    public void destroy() {
    }
}
```

实现一个自定义的Filter容易，一般有两个步骤

- 实现 Filter 接口
- 在`doFilter`方法中添加业务逻辑，如果允许访问继续，则执行`chain.doFilter(req, response);`； 不执行上面这一句，则访问到此为止


接下来的一个问题就是如何让我们自定义的Filter生效，在SpringBoot项目中，有两种常见的使用方式

- @WebFilter
- 包装Bean: `FilterRegistrationBean`

#### a. WebFilter

这个注解属于Servlet3+，与Spring也没有什么关系，所以问题来了，当我在Filter上添加了这个注解之后，Spring怎么让它生效呢?

- 配置文件中显示使用注解 `@ServletComponentScan`

```java
@ServletComponentScan
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

WebFilter常用属性如下，其中`urlPatterns`最为常用，表示这个filter适用于哪些url请求（默认场景下全部请求都被拦截）

| 属性名 | 类型 | 描述 | 
| --- | ---- | ---- |
| filterName|String|指定过滤器的 name 属性，等价于 `<filter-name>` |
| value|String[]|该属性等价于 urlPatterns 属性。但是两者不应该同时使用。|
| urlPatterns|String[]|指定一组过滤器的 URL 匹配模式。等价于 `<url-pattern>` 标签。|
| servletNames|String[]|指定过滤器将应用于哪些 Servlet。取值是 @WebServlet 中的 name 属性的取值，或者是 web.xml 中`<servlet-name>` 的取值。|
| dispatcherTypes|DispatcherType|指定过滤器的转发模式。具体取值包括：ASYNC、ERROR、FORWARD、INCLUDE、REQUEST。|
| initParams|WebInitParam[]|指定一组过滤器初始化参数，等价于 `<init-param>` 标签。|
| asyncSupported|boolean|声明过滤器是否支持异步操作模式，等价于 `<async-supported>` 标签。|
| description|String|该过滤器的描述信息，等价于 `<description>` 标签。|
| displayName|String|该过滤器的显示名，通常配合工具使用，等价于 `<display-name>` 标签。|



#### b. FilterRegistrationBean

上面一种方式比较简单，后面会说到有个小问题，指定Filter的优先级比较麻烦，

下面是使用包装bean注册方式

```java
@Bean
public FilterRegistrationBean<OrderFilter> orderFilter() {
    FilterRegistrationBean<OrderFilter> filter = new FilterRegistrationBean<>();
    filter.setName("reqFilter");
    filter.setFilter(new ReqFilter());
    // 指定优先级
    filter.setOrder(-1);
    return filter;
}
```

### 2. 常见问题

上面整完，就可以开始测试使用过滤器了，在进入实测环节之前，先来看两个常见的问题

- Filter作为Servelt的组件，怎么与SpringBoot中的Bean交互
- 多个Filter之间的优先级怎么确定

#### a. Filter依赖Bean注入问题

如果有小伙伴使用SpringMVC + web.xml方式来定义Filter，就会发现自定义的Filter中无法通过`@Autowired`方式来注入Spring的bean

> 我之前使用的是spring4 Servlet2+ ，存在上面的问题，如果有不同观点请留言告诉我，感谢

SpringBoot中可以直接注入依赖的Bean，从上面的第二种注册方式可以看到，Spring将Filter封装成了一个Bean对象，因此可以直接注入依赖的Bean

下面定义一个`AuthFilter`，依赖了自定义的`DemoBean`

```java
@Data
@Component
public class DemoBean {
    private long time;

    public DemoBean() {
        time = System.currentTimeMillis();
    }

    public void show() {
        System.out.println("demo bean!!! " + time);
    }
}


@Slf4j
@WebFilter
public class AuthFilter implements Filter {
    @Autowired
    private DemoBean demoBean;

    public AuthFilter() {
        System.out.println("init autFilter");
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        log.info("in auth filter! {}", demoBean);
        // 测试，用header中的 tx-demo 来判断是否为认证的请求
        HttpServletRequest req = (HttpServletRequest) request;
        String auth = req.getHeader("tx-demo");
        if ("yihuihui".equals(auth)) {
            // 只有认证的请求才允许访问，请求头中没有这个时，不执行下面的的方法，则表示请求被过滤了
            // 在测试优先级时打开下面的注释
            // chain.doFilter(request, response);
        } else {
            chain.doFilter(request, response);
        }
    }

    @Override
    public void destroy() {

    }
}
```

#### b. 优先级指定

Filter的优先级指定，通过我的实际测试，`@Order`注解没有用，继承 `Ordered`接口也没有用，再不考虑web.xml的场景下，只能通过在注册Bean的时候指定优先级

实例如下，三个Filter，两个通过`@WebFilter`注解方式注册，一个通过`FilterRegistrationBean`方式注册

```java
@Slf4j
@Order(2)
@WebFilter
public class AuthFilter implements Filter, Ordered {
  ...
}

@Slf4j
@Order(1)
@WebFilter
public class ReqFilter implements Filter, Ordered {
  ...
}

@Slf4j
public class OrderFilter implements Filter {
}

@ServletComponentScan
@SpringBootApplication
public class Application {
    @Bean
    public FilterRegistrationBean<OrderFilter> orderFilter() {
        FilterRegistrationBean<OrderFilter> filter = new FilterRegistrationBean<>();
        filter.setName("orderFilter");
        filter.setFilter(new OrderFilter());
        filter.setOrder(-1);
        return filter;
    }


    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

}
```

### 3. 测试

上面定义了三个Filter，我们主要验证下优先级，如果`@Order`注解生效，那么执行的先后顺序应该是

`OrderFilter -> ReqFilter -> AuthFilter`

如果不是上面的顺序，那么说明`@Order`注解没有用

```java
@RestController
public class IndexRest {
    @GetMapping(path = {"/", "index"})
    public String hello(String name) {
        return "hello " + name;
    }
}
```

![](/imgs/191016/00.jpg)

（上文截图源码来自: `org.apache.catalina.core.ApplicationFilterFactory#createFilterChain`）

上面是测试时关键链路的断点截图，从数组中可以看出 `AuthFilter`的优先级大于`ReqFilter`， 下面实际的输出也说明了`@Order`注解不能指定Filter的优先级（不知道为什么网络上有大量使用Order来指定Filer优先级的文章!!!）


![](/imgs/191016/01.jpg)

接下来我们的问题就是`WebFilter`注解来注册的Filter的优先级是怎样的呢，我们依然通过debug来看，关键代码路径为: `org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext#selfInitialize`


![](/imgs/191016/02.jpg)

- OrderFiler是我们手动注册并设置优先级为-1
- ReqFilter, AuthFilter通过 WebFillter方式注册，默认优先级为`2147483647`，相同优先级的情况下，根据名字先后顺序来决定

## III. 小结

本文主要介绍了过滤器Filter的使用方式，以及常见的两个问题解答，文中内容穿插了一点源码的分析截图，并未深入，如有兴趣的同学可以根据文中提的几个关键位置探索一番

下面简单小结下文中内容

### 1. Filter使用

**自定义Filter的实现**

- 实现Filter接口
- doFilter方法中，显示调用`chain.doFilter(request, response);`表示请求继续；否则表示请求被过滤

**注册生效**

- `@ServletComponentScan`自动扫描带有`@WebFilter`注解的Filter
- 创建Bean: `FilterRegistrationBean` 来包装自定义的Filter

### 2. IoC/DI

在SpringBoot中Filter可以和一般的Bean一样使用，直接通过`Autowired`注入其依赖的Spring Bean对象

### 3. 优先级

通过创建`FilterRegistrationBean`的时候指定优先级，如下

```java
@Bean
public FilterRegistrationBean<OrderFilter> orderFilter() {
    FilterRegistrationBean<OrderFilter> filter = new FilterRegistrationBean<>();
    filter.setName("orderFilter");
    filter.setFilter(new OrderFilter());
    filter.setOrder(-1);
    return filter;
}
```

此外格外注意, `@WebFilter`声明的Filter，优先级为`2147483647`(最低优先级)

- **@Order注解不能指定Filter优先级**
- **@Order注解不能指定Filter优先级**
- **@Order注解不能指定Filter优先级**


## IV. 其他

#### web系列博文

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

#### 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/210-web-filter](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/210-web-filter)


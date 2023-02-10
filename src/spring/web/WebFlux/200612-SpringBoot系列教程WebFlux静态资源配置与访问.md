---
order: 2
title: 2.静态资源配置与访问
tag: 
  - WebFlux
  - 静态资源
category: 
  - SpringBoot
  - WEB系列
  - WebFlux
date: 2020-06-12 15:51:14
keywords: WebFlux Spring 静态资源
---

上一篇博文介绍SpringMVC的静态资源访问，那么在WebFlux中，静态资源的访问姿势是否一致呢

<!-- more -->

## I. 默认配置

与SpringBoot的默认配置一样，WebFlux同样是`classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/`

即，将静态文件放在这四个目录下，可以直接访问

### 1. 项目演示

创建一个SpringBoot项目，添加依赖(本文使用的版本为: `2.2.1-RELEASE`)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

在资源路径下添加目录 `static`，目录下添加两个html文件，如下图

![](/imgs/200612/00.jpg)

实现启动类，不添加额外逻辑，既可以直接通过完整url方式访问静态资源

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

![](/imgs/200612/01.jpg)


主要观察上面三个请求，放在`index.html`是无法直接访问到的，因为它所在的目录并不在默认的四个静态资源路径中

### 2. Url映射

上面是直接通过静态资源文件名的方式进行访问，那么WebFlux是否可以实现SpringMVC那种，根据视图名返回View的方式呢？

```java
@Controller
public class ViewAction {
    @GetMapping(path = "a")
    public String a() {
        return "a.html";
    }
}
```

直接访问，结果发现500，找不到名为`a.html`的视图

![](/imgs/200612/02.jpg)


这种方式不行的话，改用WebFlux的路由写法

```java
@Bean
public RouterFunction<ServerResponse> indexRouter() {
    return RouterFunctions.route(RequestPredicates.GET("/b"),
                    request -> ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue("b.html");
}
```

![](/imgs/200612/03.jpg)

## II. 自定义配置路径

如果我们希望指定一个自定义的路径，是否可以如SpringMvc那样，修改配置or代码设置映射完成呢?

在资源目录下，新加两个文件夹，分别是 o1, o2

![](/imgs/200612/04.jpg)

### 1. 配置修改

如SpringMVC，修改静态资源配置

```yml
spring:
  resources:
    static-locations: classpath:/o1/,classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/
```

然后访问 `/o1.html`，发现404，这种直接修改配置方式不行!!!

![](/imgs/200612/05.jpg)


### 2. WebFluxConfigurer添加映射

> 参考自官方文档: [web-reactive.html#webflux-config-static-resources](https://docs.spring.io/spring-framework/docs/5.2.x/spring-framework-reference/web-reactive.html#webflux-config-static-resources)

直接修改启动类，实现`WebFluxConfigurer`接口，手动添加资源映射

```java
@SpringBootApplication
public class Application implements WebFluxConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**").addResourceLocations("classpath:/o2/");
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

接着访问 `/o2.html`

![](/imgs/200612/06.jpg)

### 3. @Value方式

除了上述手动映射的方式之外，还有一种非主流的是方式，如

```java
@Bean
public RouterFunction<ServerResponse> indexRouter(@Value("classpath:/index.html") final Resource indexHtml,
        @Value("classpath:/self/s.html") final Resource sHtml) {
    return RouterFunctions.route(RequestPredicates.GET("/index"),
            request -> ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue(indexHtml))
            .andRoute(RequestPredicates.GET("/s"),
                    request -> ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue(sHtml));
}
```

请注意上面的两个文件， `s.html`, `index.html`都不在默认的静态资源目录下

![](/imgs/200612/07.jpg)

## III. 小结

文中给出了WebFlux的静态资源访问姿势，与SpringMVC有一些区别

- url映射时，直接返回视图名，会提示`Could not resolve view with name xxx`
- 通过修改配置`spring.resources.static-locations` 指定新的静态资源目录无效

在WebFlux中，推荐使用实现`WebFluxConfigure`接口的方式，重写`addResourceHandlers`方法来自定义资源路径映射

也可以针对单独的静态资源，借助`@Value`来手动路由


## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/200-webflux](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/200-webflux)


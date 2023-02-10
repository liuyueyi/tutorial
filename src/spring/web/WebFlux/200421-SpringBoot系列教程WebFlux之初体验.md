---
order: 1
title: 1.初体验
tag: 
  - WebFlux
  - Web
category: 
  - SpringBoot
  - WEB系列
  - WebFlux
date: 2020-04-21 11:42:58
keywords: Spring SpringBoot WebFlux 函数式编程 Reactor
---

Spring5就引入了Webflux，基于响应式编程的web框架，号称相比较于传统的SpringMVC性能更加（当然我也没测过，官方以及很多用过的小伙伴都持有这个观点），近年来响应式编程越来越主流了，作为一个紧跟时代潮流的小伙，有必要深入学习一下了

本篇作为Webflux系列教程的开篇，一个hello world的体验版

<!-- more -->

## I. 环境

选择`SpringBoot 2.2.1.RELEASE`来搭建项目环境

pom依赖

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
        <artifactId>spring-boot-starter-webflux</artifactId>
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

webflux默认开启的端口号也是8080, 如果需要修改，和SpringMVC的配置一样，如修改配置文件`application.yml`

```yml
server:
  port: 8080
```

## II. WebFlux体验

使用WebFlux来提供http服务，如果是熟悉SpringMVC这一套玩法的话，基本上只要一点点改动即可

### 1. SpringMVC写法

借助`@Controller`, `@RequestMapping`注解来实现rest接口

```java
@RestController
@RequestMapping(path = "base")
public class BasicAction {

    @GetMapping(path = "hello")
    public Mono<String> sayHello(@RequestParam("name") String name) {
        return Mono.just("hello " + name);
    }


    @GetMapping(path = "loop")
    public Flux<ServerSentEvent<String>> everySayHello(@RequestParam("name") String name) {
        return Flux.interval(Duration.ofSeconds(1)).map(seed -> seed + seed)
                .map(s -> ServerSentEvent.<String>builder().event("rand").data(name + "|" + s).build());
    }

}
```

上面提供了两个接口，请注意返回值

- `Mono<String>`:  Mono 表示返回0到1个数据
- `Flux<ServerSentEvent<String>>`: Flux 表示返回0到n个数据

其次对于第二个接口`everySayHello`，它实现了SSE的功能，每1s往客户端推送一个字符串

> 关于sse，推荐查看[【WEB系列】异步请求知识点与使用姿势小结](http://spring.hhui.top/spring-blog/2020/03/29/200329-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8B%E5%BC%82%E6%AD%A5%E8%AF%B7%E6%B1%82%E6%9C%80%E5%85%A8%E7%9F%A5%E8%AF%86%E7%82%B9%E4%B8%8E%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/) 了解基本知识点；查看 [【WEB系列】SSE服务器发送事件详解](http://spring.hhui.top/spring-blog/2020/04/01/200401-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B9%8BSSE%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%8F%91%E9%80%81%E4%BA%8B%E4%BB%B6%E8%AF%A6%E8%A7%A3/) 查看SpringMVC的用法，两相对比获取更好的体验


接下来演示一下测试结果

![演示](/imgs/200421/00.gif)

### 2. 函数开发模式

除了上面的写法之外，Webflux还可以通过配置Router来指定url与function之间的匹配关系，在这种写法中，我们常用的Controller被称为Handler；使用`RouterFunction`配置路由

重写一下上面的两个功能

```java
@Component
public class ShowAction {

    public Mono<ServerResponse> hello(ServerRequest serverRequest) {
        return ServerResponse.ok().contentType(MediaType.TEXT_PLAIN)
                .body(Mono.just("hello " + serverRequest.queryParam("name").orElse("NoBody")), String.class);
    }
 
    /**
     * sse 服务端推送模式, 每隔一秒向客户端推送一次数据
     *
     * @param serverRequest
     * @return
     */
    public Mono<ServerResponse> sendTimePerSec(ServerRequest serverRequest) {
        return ok().contentType(MediaType.TEXT_EVENT_STREAM).body(Flux.interval(Duration.ofSeconds(1))
                .map(l -> new SimpleDateFormat("HH:mm:ss").format(new Date())), String.class);
    }
}
```

请注意，上面的写法并没有表明什么url匹配这个方法，所以我们需要额外的配置

```java
@Configuration
public class RouterConfig {
    @Autowired
    private ShowAction showAction;

    @Bean
    public RouterFunction<ServerResponse> timerRouter() {
        return RouterFunctions
                .route(RequestPredicates.GET("/hello"), showAction::hello)
                .andRoute(RequestPredicates.GET("/times"), showAction::sendTimePerSec);
    }
}
```

再次测试

![演示](/imgs/200421/01.gif)

### 3. 小结

本文主要属于`webflux`的`hello world`篇，主要目的就是先对这个有一点熟悉和了解，函数式编程模式和我们一把的开发方式还是有一些区别的，这些会在后续的系列教程中逐步展开

下一篇将主要介绍WebFlux中的两个重要的类`Mono`,`Flux`是什么，怎么用(恳请持续关注😊😊😊)


## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/200-webflux](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/200-webflux)


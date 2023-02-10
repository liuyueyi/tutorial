---
order: 6
title: 6.拦截器Interceptor使用姿势介绍
tag: 
  - Interceptor
category: 
  - SpringBoot
  - WEB系列
  - Interceptor
date: 2021-08-04 21:50:46
keywords: Spring SringBoot SpringMVC Intercepotr 拦截器
---

在SpringMVC中，拦截器与Filter两者的应用场景好像差不多，最大的区别可能是前者属于Spring的特产，而后者则是Servlert三剑客中的一个，它们本质的区别在于两者发生的时机不一致

- Filter: 在执行Servlet#service方法之前，会执行过滤器；执行完毕之后也会经过过滤器
- Interceptor: 对会话进行拦截，可以在调用Handler方法之前，视图渲染之前，方法返回之前三个时机触发回调

基于上面的触发时间的不同，两者可以做的事情也不尽相同

- Filter: 操作Request/Response
- Interceptor: 操作Request/Response/handler/modelAndView/exception

接下来本文将来看一下，在SpringMVC中拦截器的使用姿势

<!-- more -->

## I. 项目搭建

### 1. 项目依赖

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

开一个web服务用于测试

```xml
<dependencies>
    <!-- 邮件发送的核心依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

## II. 拦截器

### 1. 自定义拦截器

要实现一个自定义拦截器，一般来讲，实现接口`HandlerInterceptor`即可

```java
@Slf4j
public class SecurityInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 一个简单的安全校验，要求请求头中必须包含 req-name : yihuihui
        String header = request.getHeader("req-name");
        if ("yihuihui".equals(header)) {
            return true;
        }

        log.info("请求头错误: {}", header);
        return false;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        log.info("执行完毕!");
        response.setHeader("res", "postHandler");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        log.info("回收");
    }
}
```

这个接口定义了三个方法，分别在不同的时机触发回调

#### 1.1 preHandle

在handler方法执行之前（简单理解为Controller提供的服务调用之前）会被触发，如果返回ture，表示拦截通过，可以执行；若果返回false，表示不允许往后走

因此在这里，通常可以用来做安全校验，用户身份处理等操作

特别需要注意的是，无论是拦截器/还是Filter，在使用 Request 中的请求流的时候，要警惕，通常请求参数流的读取是一次性的，如果在这里实现了一个请求参数日志输出，把请求流的数据读出来了，但是又没有写回去，就会导致请求参数丢失了


#### 1.2 postHandler

这个是在handler方法执行之后，视图渲染之前被回调，简单来说，我们在这个时候，是可以操作ModelAndView，往里面添加一下信息，并能被视图解析渲染的

当然鉴于现在前后端分离的趋势，这个实际上用得也不多了


#### 1.3 afterCompletion

顾名思义，该方法将在整个请求结束之后，也就是在 DispatcherServlet 渲染了对应的视图之后执行。此方法主要用来进行资源清理


### 2. 注册与测试

接下来让我们自定义的拦截器生效

实现`WebMvcConfigurer`接口，重写`addInterceptors`方法，实现拦截器注册

```java
@RestController
@SpringBootApplication
public class Application implements WebMvcConfigurer {
  
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SecurityInterceptor()).addPathPatterns("/**");
    }
    
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
    
    @GetMapping(path = "show")
    public String show() {
        return UUID.randomUUID().toString();
    }
}
```

### 3. 小结

本文补齐了之前遗漏的SpringMVC拦截器的知识点，从使用来看，比较简单，需要注意的知识点，无非就是拦截器的三个时机

- preHander: controller方法执行前触发，返回ture/false, ture表示通过
- postHandler: controller执行后，视图渲染前
- afterCompletion: 执行完毕之后触发

其次，相较于filter而言， 拦截器除了操作requset/response之外，还可以操作handler/modelAndView/exception


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/213-web-interceptor](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/213-web-interceptor)


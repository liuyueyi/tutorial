---
order: 7
title: 7.拦截器注入Bean的几种姿势
tag: 
  - Interceptor
category: 
  - SpringBoot
  - WEB系列
  - Interceptor
date: 2021-11-15 18:31:26
keywords: 
  - SpringMVC
  - SpringBoot
  - Interceptor
  - 拦截器
---

之前介绍过一篇拦截器的基本使用姿势: [【WEB系列】SpringBoot之拦截器Interceptor使用姿势介绍](https://spring.hhui.top/spring-blog/2021/08/04/210804-SpringBoot%E7%B3%BB%E5%88%97Web%E7%AF%87%E4%B9%8B%E6%8B%A6%E6%88%AA%E5%99%A8Interceptor%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF%E4%BB%8B%E7%BB%8D/)

在SpringBoot中，通过实现`WebMvcConfigurer`的`addInterceptors`方法来注册拦截器，那么当我们的拦截器中希望使用Bean时，可以怎么整？

<!-- more -->

## I. 项目搭建

本项目借助`SpringBoot 2.2.1.RELEASE` +  `maven 3.5.3` + `IDEA`进行开发

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

## II.拦截器

实现拦截器比较简单，实现`HandlerInterceptor`接口就可以了，比如我们实现一个基础的权限校验的拦截器，通过从请求头中获取参数，当满足条件时表示通过

### 0.安全校验拦截器

```java
@Slf4j
public class SecurityInterceptor implements HandlerInterceptor {
    /**
     * 在执行具体的Controller方法之前调用
     *
     * @param request
     * @param response
     * @param handler
     * @return
     * @throws Exception
     */
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

    /**
     * controller执行完毕之后被调用，在 DispatcherServlet 进行视图返回渲染之前被调用，
     * 所以我们可以在这个方法中对 Controller 处理之后的 ModelAndView 对象进行操作。
     * <p>
     * preHandler 返回false，这个也不会执行
     *
     * @param request
     * @param response
     * @param handler
     * @param modelAndView
     * @throws Exception
     */
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        log.info("执行完毕!");
        response.setHeader("res", "postHandler");
    }


    /**
     * 方法需要在当前对应的 Interceptor 类的 preHandle 方法返回值为 true 时才会执行。
     * 顾名思义，该方法将在整个请求结束之后，也就是在 DispatcherServlet 渲染了对应的视图之后执行。此方法主要用来进行资源清理。
     *
     * @param request
     * @param response
     * @param handler
     * @param ex
     * @throws Exception
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        log.info("回收");
    }
}
```

接下来是这个拦截器的注册

```java
@RestController
@SpringBootApplication
public class Application implements WebMvcConfigurer {

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SecurityInterceptor()).addPathPatterns("/**");
    }

    @GetMapping(path = "show")
    public String show() {
        return UUID.randomUUID().toString();
    }
}

```

接下来问题来了，我们希望这个用于校验的值放在配置文件中，不是在代码中写死，可以怎么整？

### 1. 指定配置

在项目资源文件中，添加一个配置用于表示校验的请求头

`application.yml`

```yaml
security:
  check: yihuihui

```

配置的读取，可以使用 `Envrioment.getProperty()`，也可以使用 `@Value`注解

但是注意上面的拦截器注册，直接构造的一个方法，添加到`InterceptorRegistry`，在拦截器中，即使添加`@Value`， `@Autowired`注解也不会生效（归根结底就是这个拦截器并没有受Spring上下文管理）

### 2. 拦截器注入Bean

那么在拦截器中如果想使用Spring容器中的bean对象，可以怎么整？

#### 2.1 新增静态的ApplicationContext容器类

一个可行的方法就是在项目中维护一个工具类，其内部持有`ApplicationContext`的引用，通过这个工具类来访问bean对象

```java
@Component
public class SpringUtil implements ApplicationContextAware, EnvironmentAware {
    private static ApplicationContext applicationContext;
    private static Environment environment;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SpringUtil.applicationContext = applicationContext;
    }

    @Override
    public void setEnvironment(Environment environment) {
        SpringUtil.environment = environment;
    }

    public static <T> T getBean(Class<T> clz) {
        return applicationContext.getBean(clz);
    }

    public static String getProperty(String key) {
        return environment.getProperty(key);
    }
}
```

基于此，在拦截器中，如果想要获取配置，直接改成下面这样既可

```java
@Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 一个简单的安全校验，要求请求头中必须包含 req-name : yihuihui
        String header = request.getHeader("req-name");
        if (Objects.equals(SpringUtil.getProperty("security.check"), header)) {
            return true;
        }

        log.info("请求头错误: {}", header);
        return false;
    }
```

这种方式来访问bean，优点就是**通用性更强，适用范围广**

#### 2.2 拦截器注册为bean

上面的方法虽然可行，但是看起来总归不那么优雅，那么有办法直接将拦截器声明为bean对象，然后直接使用`@Autowired`注解来注入依赖的bean么

当然是可行的，注意bean注册的几种姿势，我们这里采用下面这种方式来注册拦截器

```java
@Bean
public SecurityInterceptor securityInterceptor() {
    return new SecurityInterceptor();
}

@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(securityInterceptor()).addPathPatterns("/**");
}
```

上面通过配置类的方式来声明bean，然后在注册拦截器的地方，不直接使用构造方法来创建实例；上面的用法表示是使用spring的bean容器来注册，基于这种方式来实现拦截器的bean声明

因此在拦截器中就可以注入其他依赖了

测试就比较简单了，如下

```bash
yihui@M-162D9NNES031U:SpringBlog git:(master) $ curl 'http://127.0.0.1:8080/show' -H 'req-name:yihuihui' -i
HTTP/1.1 200
Content-Type: text/plain;charset=UTF-8
Content-Length: 36
Date: Mon, 15 Nov 2021 10:56:30 GMT

6610e593-7c60-4dab-97b7-cc671c27762d%
```

### 3. 小结

本文虽说介绍的是如何在拦截器中注入bean，实际上的知识点依然是创建bean对象的几种姿势；上面提供了两种常见的方式，一个SpringUtil持有SpringContext，然后借助这个工具类来访问bean对象，巧用它可以省很多事；

另外一个就是将拦截器声明为bean，这种方式主要需要注意的点是拦截器的注册时，不能直接`new` 拦截器；当然bean的创建，除了上面这个方式之外，还有其他的case，有兴趣的小伙伴可以尝试一下

## III. 不能错过的源码和相关知识点

### 0. 项目

相关博文：

- [SpringBoot之拦截器Interceptor使用姿势介绍](https://spring.hhui.top/spring-blog/2021/08/04/210804-SpringBoot%E7%B3%BB%E5%88%97Web%E7%AF%87%E4%B9%8B%E6%8B%A6%E6%88%AA%E5%99%A8Interceptor%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF%E4%BB%8B%E7%BB%8D/)

项目源码：

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/213-web-interceptor](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/213-web-interceptor)

### 1. 微信公众号: 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


---
order: 3
title: 3.如何自定义参数解析器
tag: 
  - 请求参数
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2019-08-31 16:45:48
keywords: Spring SpringBoot 参数解析 HandlerMethodArgumentResolver
---


SpringMVC提供了各种姿势的http参数解析支持，从前面的GET/POST参数解析篇也可以看到，加一个`@RequsetParam`注解就可以将方法参数与http参数绑定，看到这时自然就会好奇这是怎么做到的,我们能不能自己定义一种参数解析规则呢？

本文将介绍如何实现自定义的参数解析，并让其生效

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


## II. 自定义参数解析器

对于如何自定义参数解析器，一个较推荐的方法是，先搞清楚springmvc接收到一个请求之后完整的处理链路，然后再来看在什么地方，什么时机，来插入自定义参数解析器，无论是从理解还是实现都会简单很多。遗憾的是，本篇主要目标放在的是使用角度，所以这里只会简单的提一下参数解析的链路，具体的深入留待后续的源码解析

### 1. 参数解析链路

http请求流程图，来自 [SpringBoot是如何解析HTTP参数的](https://www.jianshu.com/p/bf3537334e76)

![](/imgs/190831/00.jpg)

既然是参数解析，所以肯定是在方法调用之前就会被触发，在Spring中，负责将http参数与目标方法参数进行关联的，主要是借助`org.springframework.web.method.support.HandlerMethodArgumentResolver`类来实现

```java
/**
 * Iterate over registered {@link HandlerMethodArgumentResolver}s and invoke the one that supports it.
 * @throws IllegalStateException if no suitable {@link HandlerMethodArgumentResolver} is found.
 */
@Override
@Nullable
public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
		NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {

	HandlerMethodArgumentResolver resolver = getArgumentResolver(parameter);
	if (resolver == null) {
		throw new IllegalArgumentException("Unknown parameter type [" + parameter.getParameterType().getName() + "]");
	}
	return resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory);
}
```

上面这段核心代码来自`org.springframework.web.method.support.HandlerMethodArgumentResolverComposite#resolveArgument`，主要作用就是获取一个合适的`HandlerMethodArgumentResolver`，实现将http参数(`webRequest`)映射到目标方法的参数上(`parameter`)

所以说，实现自定义参数解析器的核心就是实现一个自己的`HandlerMethodArgumentResolver`

### 2. HandlerMethodArgumentResolver

实现一个自定义的参数解析器，首先得有个目标，我们在get参数解析篇里面，当时遇到了一个问题，当传参为数组时，定义的方法参数需要为数组，而不能是List，否则无法正常解析；现在我们则希望能实现这样一个参数解析，以支持上面的场景

为了实现上面这个小目标，我们可以如下操作

#### a. 自定义注解ListParam

定义这个注解，主要就是用于表明，带有这个注解的参数，希望可以使用我们自定义的参数解析器来解析；

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ListParam {
    /**
     * Alias for {@link #name}.
     */
    @AliasFor("name") String value() default "";

    /**
     * The name of the request parameter to bind to.
     *
     * @since 4.2
     */
    @AliasFor("value") String name() default "";
}
```

#### b. 参数解析器ListHandlerMethodArgumentResolver

接下来就是自定义的参数解析器了，需要实现接口`HandlerMethodArgumentResolver`

```java
public class ListHandlerMethodArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(ListParam.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        ListParam param = parameter.getParameterAnnotation(ListParam.class);
        if (param == null) {
            throw new IllegalArgumentException(
                    "Unknown parameter type [" + parameter.getParameterType().getName() + "]");
        }

        String name = "".equalsIgnoreCase(param.name()) ? param.value() : param.name();
        if ("".equalsIgnoreCase(name)) {
            name = parameter.getParameter().getName();
        }
        String ans = webRequest.getParameter(name);
        if (ans == null) {
            return null;
        }

        String[] cells = StringUtils.split(ans, ",");
        return Arrays.asList(cells);
    }
}
```

上面有两个方法：

- `supportsParameter`就是用来表明这个参数解析器适不适用
  - 实现也比较简单，就是看参数上有没有前面定义的`ListParam`注解
- `resolveArgument` 这个方法就是实现将http参数粗转换为目标方法参数的具体逻辑
	- 上面主要是为了演示自定义参数解析器的过程，实现比较简单，默认只支持`List<String>`


### 3. 注册

上面虽然实现了自定义的参数解析器，但是我们需要把它注册到`HandlerMethodArgumentResolver`才能生效，一个简单的方法如下

```java
@SpringBootApplication
public class Application extends WebMvcConfigurationSupport {

    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new ListHandlerMethodArgumentResolver());
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```


### 4. 测试

为了验证我们的自定义参数解析器ok，我们开两个对比的rest服务

```java
@RestController
@RequestMapping(path = "get")
public class ParamGetRest {
    /**
     * 自定义参数解析器
     *
     * @param names
     * @param age
     * @return
     */
    @GetMapping(path = "self")
    public String selfParam(@ListParam(name = "names") List<String> names, Integer age) {
        return names + " | age=" + age;
    }

    @GetMapping(path = "self2")
    public String selfParam2(List<String> names, Integer age) {
        return names + " | age=" + age;
    }
}
```


演示demo如下，添加了`ListParam`注解的可以正常解析，没有添加注解的会抛异常

![](/imgs/190831/01.gif)


## II. 其他

### 0. 项目&相关博文

- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/24/190824-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BGet%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/28/190828-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BPost%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/202-web-params](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/202-web-params)



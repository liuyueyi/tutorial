---
order: 6
title: 6.静态资源配置与读取
tag: 
  - 静态资源
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2020-06-11 08:47:54
keywords: SpringBoot Request 静态资源 WebMvcConfigurer
---

SpringWeb项目除了我们常见的返回json串之外，还可以直接返回静态资源（当然在现如今前后端分离比较普遍的情况下，不太常见了），一些简单的web项目中，前后端可能就一个人包圆了，前端页面，js/css文件也都直接放在Spring项目中，那么你知道这些静态资源文件放哪里么

<!-- more -->

## I. 默认配置

### 1. 配置

静态资源路径，SpringBoot默认从属性`spring.resources.static-locations`中获取

默认值可以从`org.springframework.boot.autoconfigure.web.ResourceProperties#CLASSPATH_RESOURCE_LOCATIONS`获取

```
private static final String[] CLASSPATH_RESOURCE_LOCATIONS = { "classpath:/META-INF/resources/",
			"classpath:/resources/", "classpath:/static/", "classpath:/public/" };

/**
 * Locations of static resources. Defaults to classpath:[/META-INF/resources/,
 * /resources/, /static/, /public/].
 */
private String[] staticLocations = CLASSPATH_RESOURCE_LOCATIONS;
```

注意上面的默认值，默认有四个，优先级从高到低

- `/META-INF/resources/`
- `/resources/`
- `/static/`
- `/public/`

### 2. 实例演示

> 默认静态资源路径有四个，所以我们设计case需要依次访问这四个路径中的静态资源，看是否正常访问到；其次就是需要判定优先级的问题，是否和上面说的一致

首先创建一个SpringBoot web项目，工程创建流程不额外多说，pom中主要确保有下面依赖即可（本文使用版本为: `2.2.1.RELEASE`)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

在资源文件夹`resources`下，新建四个目录，并添加html文件，用于测试是否可以访问到对应的资源文件（主要关注下图中标红的几个文件）

![](/imgs/200611/00.jpg)

#### a. META-INF/resources

静态文件 m.html

```html
<html>
<title>META-INF/resource/m.html</title>
<body>
jar包内，META-INF/resources目录下 m.html
</body>
</html>
```

完成对应的Rest接口

```java
@GetMapping(path = "m")
public String m() {
    return "m.html";
}
```

![](/imgs/200611/01.jpg)

#### b. resources

静态文件 r.html

```html
<html>
<title>resources/r.html</title>
<body>
jar包内，resouces目录下 r.html
</body>
</html>
```

对应的Rest接口

```java
@GetMapping(path = "r")
public String r() {
    return "r.html";
}
```

![](/imgs/200611/02.jpg)


#### c. static

静态文件 s.html

```html
<html>
<title>static/s.html</title>
<body>
jar包内，static目录下 s.html
</body>
</html>
```

对应的Rest接口

```java
@GetMapping(path = "s")
public String s() {
    return "s.html";
}
```
![](/imgs/200611/03.jpg)

#### d. public

静态文件 p.html

```html
<html>
<title>public/p.html</title>
<body>
jar包内，public目录下 p.html
</body>
</html>
```

对应的Rest接口

```java
@GetMapping(path = "p")
public String p() {
    return "p.html";
}
```

![](/imgs/200611/04.jpg)

#### e. 优先级测试

关于优先级的测试用例，主要思路就是在上面四个不同的文件夹下面放相同文件名的静态资源，然后根据访问时具体的返回来确定相应的优先级。相关代码可以在文末的源码中获取，这里就不赘述了

## II. 自定义资源路径

一般来讲，我们的静态资源放在上面的四个默认文件夹下面已经足够，但总会有特殊情况，如果资源文件放在其他的目录下，应该怎么办？

### 1. 修改配置文件

第一种方式比较简单和实用，修改上面的`spring.resources.static-locations`配置，添加上自定义的资源目录，如在 `application.yml` 中，指定配置

```yml
spring:
  resources:
    static-locations: classpath:/out/,classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/
```

上面指定了可以扫描`/out`目录下的静态资源文件，且它的优先级是最高的（上面的配置顺序中，优先级的高低从左到右）


**实例演示**

在资源目录下，新建文件`/out/index.html`

![](/imgs/200611/05.jpg)

请注意在其他的四个资源目录下，也都存在 `index.html`这个文件（根据上面优先级的描述，返回的应该是`/out/index.html`）

```java
@GetMapping(path = "index")
public String index() {
    return "index.html";
}
```

![](/imgs/200611/06.jpg)


### 2. WebMvcConfigurer 添加资源映射

除了上述的配置指定之外，还有一种常见的使用姿势就是利用配置类`WebMvcConfigurer`来手动添加资源映射关系，为了简单起见，我们直接让启动类实现`WebMvcConfigure`接口

```java
@SpringBootApplication
public class Application implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 请注意下面这个映射，将资源路径 /ts 下的资源，映射到根目录为 /ts的访问路径下
        // 如 ts下的ts.html, 对应的访问路径 /ts/ts
        registry.addResourceHandler("/ts/**").addResourceLocations("classpath:/ts/");
    }


    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

根据上面的配置表示将/ts目录下的资源ts.html，映射到/ts/ts，而直接访问/ts会报404（这个逻辑可能有点绕，需要仔细想一想）

```java
@GetMapping(path = "ts")
public String ts() {
    return "ts.html";
}

@GetMapping(path = "ts/ts")
public String ts2() {
    return "ts.html";
}
```

![](/imgs/200611/07.jpg)


## III. Jar包资源访问

前面描述的静态资源访问主要都是当前包内的资源访问，如果我们的静态资源是由第三方的jar包提供（比如大名鼎鼎的Swagger UI)，这种时候使用姿势是否有不一样的呢？

### 1. classpath 与 classpath*

在之前使用`SpringMVC3+/4`的时候，`classpath:/META-INF/resources/`表示只扫描当前包内的`/META-INF/resources/`路径，而`classpath*:/META-INF/resources/`则会扫描当前+第三方jar包中的`/META-INF/resources/`路径

那么在`SpringBoot2.2.1-RELEASE`版本中是否也需要这样做呢？（答案是不需要，且看后面的实例）

### 2. 实例

新建一个工程，只提供基本的html静态资源，项目基本结构如下（具体的html内容就不粘贴了，墙裂建议有兴趣的小伙伴直接看源码，阅读效果更优雅）

![](/imgs/200611/08.jpg)


接着在我们上面常见的工程中，添加依赖

```xml
<dependency>
    <groupId>com.git.hui.boot</groupId>
    <artifactId>204-web-static-resources-ui</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

添加对应资源的访问端点

```java
@GetMapping(path = "ui")
public String ui() {
    return "ui.html";
}

@GetMapping(path = "out")
public String out() {
    return "out.html";
}

// 第三方jar包的 META-INF/resources 优先级也高于当前包的 /static

@GetMapping(path = "s2")
public String s2() {
    return "s2.html";
}
```

请注意，这个时候我们是没有修改前面的`spring.resources.static-locations`配置的

![](/imgs/200611/09.jpg)

上面的访问结果，除了说明访问第三方jar包中的静态资源与当前包的静态资源配置没有什么区别之外，还可以得出一点

- 相同资源路径下，当前包的资源优先级高于jar包中的静态资源
- 默认配置下，第三方jar包中`META-INF/resources`下的静态资源，优先级高于当前包的`/resources`, `/static`, `/public`


## IV. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/spring-boot/204-web-static-resources](https://github.com/liuyueyi/spring-boot-demo/spring-boot/204-web-static-resources)
- [https://github.com/liuyueyi/spring-boot-demo/spring-boot/204-web-static-resources-ui](https://github.com/liuyueyi/spring-boot-demo/spring-boot/204-web-static-resources-ui)


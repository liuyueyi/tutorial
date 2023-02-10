---
order: 3
title: 3.中文乱码问题解决（填坑篇）
tag: 
  - 中文乱码
category: 
  - SpringBoot
  - WEB系列
  - 采坑记录
date: 2019-09-05 08:58:46
keywords: Spring SpringBoot 中文乱码 HttpMessageConverter
---

前面几篇介绍了如何获取http请求参数，在实际测试的时候发现了一个问题，如果传入的参数为中文的时候，接收没什么问题；但是返回有中文的时候，会出现乱码；接下来我们看一下这个问题如何解决

<!-- more -->

## I. 基本环境

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

## II. 中文乱码

### 1. 问题复现

一个简单的rest接口

```java
@RestController
@RequestMapping(path = "get")
public class ParamGetRest {
    @GetMapping(path = "arg")
    public String argParam(String name, Integer age) {
        String ans = "name: " + name + " age: " + age;
        System.out.println(ans);
        return ans;
    }
}
```

我们实际测试一下，发现接收的name参数里的中文可以正常显示，输出控制台也没有问题；但是返回的正文却出现了乱码

![showcase](/imgs/190905/00.gif)

### 2. 乱码问题修复

为什么返回的中文会出现乱码呢？要确定这个问题有必要先了解一下返回数据的处理逻辑，前面介绍了几篇web结合页面渲染引擎(thymeleaf, freemaker,beetl)的博文，里面返回的是视图，在参数解析篇里面，返回的是数据；那么web返回又有哪些不同的操作姿势呢，本篇将集中在解决返回中文乱码的问题上，至于上面提出的问题，则将作为后续的研究目标

#### a. HttpMessageConverter

对于返回数据的处理，有一个非常重要的类就是`HttpMessageConverter`，从命名上也可以看出，他的主要做那个用就是实现http信息的转换

至于导致我们出现中文乱码的，主要是`StringHttpMessageConverter`

```java
public class StringHttpMessageConverter extends AbstractHttpMessageConverter<String> {
  public static final Charset DEFAULT_CHARSET = StandardCharsets.ISO_8859_1;

	/**
	 * A default constructor that uses {@code "ISO-8859-1"} as the default charset.
	 * @see #StringHttpMessageConverter(Charset)
	 */
	public StringHttpMessageConverter() {
		this(DEFAULT_CHARSET);
	}
	
	/**
	 * A constructor accepting a default charset to use if the requested content
	 * type does not specify one.
	 */
	public StringHttpMessageConverter(Charset defaultCharset) {
		super(defaultCharset, MediaType.TEXT_PLAIN, MediaType.ALL);
	}
}
```

上面是字符串转换类的默认构造方式，指定的字符集为`"ISO-8859-1"`，而这个字符集是没法处理中文的，所以为了处理中文，我们希望指定编码为`UTF-8`

#### b. 注册HttpMessageConverter

所以为了解决中文乱码的问题，我们的一个思路就是通过`new StringHttpMessageConverter(Charset.forName("UTF-8"));`创建一个支持utf8编码的字符串转换类，然后将它注册给Spring容器，具体的操作借助配置类`WebMvcConfigurationSupport`

```java
@SpringBootApplication
public class Application extends WebMvcConfigurationSupport {
    @Bean
    public HttpMessageConverter<String> responseBodyConverter() {
        StringHttpMessageConverter converter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
        return converter;
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        super.configureMessageConverters(converters);
        converters.add(responseBodyConverter());
    }
    
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

#### c. 测试验证

然后再次测试验证下我们的处理是否生效

![showcase](/imgs/190905/01.gif)



## II. 其他

### 0. 项目&博文


- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/24/190824-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BGet%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](http://spring.hhui.top/spring-blog/2019/08/28/190828-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8BPost%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%A7%BF%E5%8A%BF%E6%B1%87%E6%80%BB/)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](http://spring.hhui.top/spring-blog/2019/08/31/190831-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E5%A6%82%E4%BD%95%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8F%82%E6%95%B0%E8%A7%A3%E6%9E%90%E5%99%A8/)

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/202-web-params](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/202-web-params)


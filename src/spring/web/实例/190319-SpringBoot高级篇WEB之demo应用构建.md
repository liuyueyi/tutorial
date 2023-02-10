---
order: 3
title: 3.一个web demo应用构建全过程
tag: 
  - Web
category: 
  - SpringBoot
  - WEB系列
  - 示例
date: 2019-03-19 19:37:30
keywords: SpringBoot,SpringMVC,Web
---

前面分别通过Spring结合web.xml和java config的方式构建web应用，最终实现效果差不多，但从结构上来看java config的方式明显更优雅一点；而本篇将介绍的SpringBoot方式，则更能让我们感受到便捷

本篇博文，建议与前面两篇对比阅读，效果更佳

- [190316-Spring MVC之基于xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/16/190316-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Exml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/17/190317-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Ejava-config%E6%97%A0xml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)

<!-- more -->

II. web构建

### 1. 项目依赖

与前面一样，搭建SpringBoot web工程，需要引入对应的依赖

```java
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.0.M1</version>
    <relativePath/> <!-- lookup parent from repository -->
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

开始接触SpringBoot，不熟悉应该引入什么依赖的提前下，一个简单方法就是通过官网来创建项目

- 进入官网[https://start.spring.io/](https://start.spring.io/)
- 选择版本，输入group, artifact，确定即可


对于SpringBoot web应用而言，我们需要引入的包就是

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. 配置

SpringBoot抛弃了xml的配置方式，也是基于java config这一套玩耍的，但是它更加的简单

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

在我们的启动类入口上，添加上注解 `@SpringBootApplication`即可，这样一个SpringBoot应用就完成了


不需要其他的任何配置，默认开启的http端口是8080，如需修改，可以通过 `application.properties` 或者 `application.yml` 文件来重新指定


### 3. 实例代码

然后就可以写我们的Controller代码了

```java
@RestController
public class HelloRest {
    @Autowired
    private PrintServer printServer;

    @GetMapping(path = "hello")
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

一个普通的bean

```java
@Service
public class PrintServer {
    public void print() {
        System.out.println(System.currentTimeMillis());
    }
}
```


### 4. 测试

测试也比较简单，直接运行前面的main方法即可，如下图

![show.gif](/imgs/190319/00.gif)

### 5. 小结

使用SpringBoot搭建一个基础的web应用，由于过于简单，也没有什么特别多值得说到地方，这里对比前面两篇，会发现优势特别特别的明显，极大的减少了入门门槛，整个项目更加轻量简洁，个人感觉，今后基于SpringBoot搭建后端应用的趋势，会取代原来的存Spring的方式


## II. 其他

### - 系列博文

web系列: 

- [Spring Web系列博文汇总](http://spring.hhui.top/spring-blog/categories/SpringBoot/%E9%AB%98%E7%BA%A7%E7%AF%87/Web/)

mvc应用搭建篇:

- [190316-Spring MVC之基于xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/16/190316-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Exml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](http://spring.hhui.top/spring-blog/2019/03/17/190317-Spring-MVC%E4%B9%8B%E5%9F%BA%E4%BA%8Ejava-config%E6%97%A0xml%E9%85%8D%E7%BD%AE%E7%9A%84web%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)
- [190319-SpringBoot高级篇WEB之demo应用构建](http://spring.hhui.top/spring-blog/2019/03/19/190319-SpringBoot%E9%AB%98%E7%BA%A7%E7%AF%87WEB%E4%B9%8Bdemo%E5%BA%94%E7%94%A8%E6%9E%84%E5%BB%BA/)

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/201-web](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/201-web)


---
order: 4
title: 4.整合resin容器
tag: 
  - Resin
category: 
  - SpringBoot
  - WEB系列
  - 容器
date: 2021-01-26 21:55:21
keywords: SpringBoot web resin容器
---

SpringBoot项目搭建web项目很快，内嵌了tomcat容器，一般来讲直接jar包跑就行了，当然也可以打成war包放到其他的容器中执行。

本文将介绍一下SpringBoot整合resin容器的全过程，包括resin配置，jar包冲突，class not found，中文乱码等各种配置问题解疑

> 内心os: tomcat不香嘛，为啥要搞个resin出来，对此我也不知道怎么回答，前人就这么玩的，我还能怎么办，只能选择接受... （这东西真是的有点蛋疼）

<!-- more -->

## I. 环境准备

### 1. resin安装

### 1.1 下载安装

首先需要下载resin包，进入官网: [http://www.caucho.com/download/](http://www.caucho.com/download/)

选择一个zip包下载到本地，移动到目的地，解压即可，注意这个地址，后续会用到

比如我本机存放地址为 `/Users/user/Project/Tool/resin-4.0.61`

### 1.2 IDEA配置

idea首先安装插件

![](/imgs/210126/00.jpg)


其次进行编译环境配置，选择`Edit Configuration`

![](/imgs/210126/01.jpg)

接下来在配置页，依次操作

- 点击 `+`
- 输入 `resin`
- 选择 `Local`

![](/imgs/210126/02.jpg)


然后按照下图配置

**注意：URL这里与你的实际项目有关，后面会说明**

![](/imgs/210126/03.jpg)


还没完，接下来指定发布方式

- 点击 `Deployment`
- 点击 `+`
- 选择 `Arifact...`
- 选中你的项目

![](/imgs/210126/04.jpg)

最后确定保存之后，本地项目部署到resin运行基本完成

### 1.3 SpringBoot项目配置

本文实例中springboot版本为 `2.2.1.RELEASE`

因为我们使用resin容器进行部署，所以会很容易想到将tomcat依赖排除掉（当然不仅于此，后文会深入说明）

```xml
<!-- 指定项目打成war包 -->
<packaging>war</packaging>


<dependencies>
  <!-- 核心的web依赖 -->
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <exclusions>
          <exclusion>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-tomcat</artifactId>
          </exclusion>
      </exclusions>
  </dependency>
</dependencies>

<build>
    <!-- 指定war包名，注意前面配置resin的url中的一级路径，就是它（和tomcat的方式差不多） -->
    <finalName>230-web-resin</finalName>
</build>
```


## II. 项目整合

### 1. 启动类

启动类，继承自`SpringBootServletInitialzer`，因为我们的项目以war包形式在web容器中运行（这一点需要注意，和之前的Spring系列中的启动类有一点区别)

```java
@SpringBootApplication
public class Application extends SpringBootServletInitializer {
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(Application.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 2. rest接口

写两个简单的rest接口，一个返回html文件，一个返回String

```java
@Controller
public class IndexController {

    @GetMapping(path = {"", "/", "/index"})
    public String index() {
        return "index.html";
    }

    @GetMapping(path = "hello")
    @ResponseBody
    public String hello(String name) {
        return "hello " + name;
    }
}
```

在资源路径 `resources/static/` 下添加html文件`index.html`

```html
<html>
<head>
    <meta charset="utf-8">
</head>

<h1> 欢迎欢迎 </h1>

<bold>hello world</bold>

</html>
```

### 3. 启动测试

请注意，这时的启动，不是在main方法上邮件运行，而是借助前面配置的resin，来运行

#### 3.1 ServletException

启动的第一个异常，`Error:(13, 8) java: 无法访问javax.servlet.ServletException 找不到javax.servlet.ServletException的类文件`

![](/imgs/210126/05.jpg)

将tomcat排除掉之后，没有Servlet依赖，在编译打包层就会失败，所以需要添加依赖，这里指定了作用域`<scope>provided</scope>`

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>
```

#### 3.2  java.lang.NoSuchMethodError: javax.validation.Configuration.getDefaultParameterNameProvider

jar包冲突，如下图，提示有两个`validation-api`, 在项目中我们自己依赖的是`jakarta.validation-api-2.0.1`，但是实际采用的是resin的`validation-api-1.0.0.GA.jar`

![](/imgs/210126/06.jpg)


出现这个问题，主要就是因为resin自己也提供了一个`validation-api`包，但是又不满足我们的需求，所以最好的方法就是用我们需要的版本覆盖掉它的

**替换`validation-api`**

- 将项目依赖的api jar包，拷贝到resin目录下的lib下
- 本项目中，将resin中`validation-api-1.0.0.GA.jar`干掉，复制进去`validation-api-2.0.1.Final.jar`

**替换webapp-jars**

除了api之外，还有两个也需要配套修改，在`resin/webapp-jars`中，有两个jar包，一个是`hibernate-validator`, 一个是`jboss-logging`

- 本项目中，覆盖之后两个版本分别是
- hibernate-validator-6.0.18.Final.jar
- jboss-logging-3.4.1.Final.jar

**说明**

上面说要将我们用到的jar替换resin的，那么如何找到我们希望的jar包呢？

进入 `resin/webapps/{项目名}/WEB-INF/lib`，里面有你的项目所有依赖的jar包，就可以找到你所需要的jar包了

其次如果只替换`validation-api`而不替换`webapp-jars`下的jar包，可能导致明明版本也是对的，但是就是起不来的情况，这种原因多半是api与实现`hibernate-validator`没有对上导致的，所以要替换就替换完整

**pom修改**

上面改外之后，还需要记得修改一下pom配置文件

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.hibernate</groupId>
            <artifactId>hibernate-validator</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

#### 3.3 java.lang.NoClassDefFoundError: javax/el/ELManager

再次运行，又提示了一个`NoClassDefFoundError`，手动加上

```xml
<dependency>
    <groupId>org.glassfish</groupId>
    <artifactId>jakarta.el</artifactId>
</dependency>
```

#### 3.4 中文乱码及小结

启动过程中，可能会遇到各种jar包冲突，缺失，一个简单的原则就是什么冲突干掉什么，缺什么加什么，一直到启动成功为止

正常启动之后，会自动弹出一个网页

![](/imgs/210126/07.jpg)

出现上面的中文乱码时，可以在配置文件中，强制指定utf-8, 如 `application.yml`

```yml
spring:
  http:
    encoding:
      force: true
      charset: utf-8
      enabled: true
```

本文中对应的项目实例可以在下面获取

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/230-web-resin](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/230-web-resin)


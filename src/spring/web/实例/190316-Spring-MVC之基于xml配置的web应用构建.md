---
order: 1
title: 1.基于xml配置的web应用构建
tag: 
  - SpringMVC
  - Web
category: 
  - SpringBoot
  - WEB系列
  - 示例
date: 2019-03-16 15:36:57
keywords: Spring,SpringMVC,Jetty,web.xml,war,搭建
---

直接用SpringBoot构建web应用可以说非常非常简单了，在使用SpringBoot构建后端服务之前，一直用的是Spring + SpringMVC基于xml的配置方式来玩的，所以在正式进入SpringBoot Web篇之前，有必要看一下不用SpringBoot应该怎么玩的，也因此方便凸显SpringBoot的优越性

<!-- more -->

## I. Web 构建

### 1. 项目依赖

我们选择使用传统的SpringMVC + Tomcat/Jetty 运行war包方式来运行任务，创建一个maven项目之后，先添加上基本的依赖

```xml
<artifactId>201-mvc-xml</artifactId>
<!-- 注意这一行，我们指定war包 -->
<packaging>war</packaging>

<properties>
    <spring.version>5.1.5.RELEASE</spring.version>
</properties>

<dependencies>
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>3.1.0</version>
    </dependency>

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aop</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

### 2. 项目结构

对于web项目，和我们传统的不一样的地方在于，会多一个 `webapp` 目录，在这个目录的 `WEB-INF` 文件夹下，会存有几个必要的配置文件

![项目结构](/imgs/190316/00.jpg)

图中的三个目录，都属于比较重要的

- java : 存放源码
- resources: 项目资源文件存放地
- webapp: web的配置文件，资源文件默认存放地

### 3. 配置文件说明

java和resources这两个目录没啥好说的，主要来看一下webapp下面的三个xml配置文件

#### a. web.xml

在我们使用xml配置的生态体系中，这个配置文件至关重要；本节说到SpringMVC构建的应用，是在Servlet的生态上玩耍的；而web.xml这个配置文件，比如我们常见的Servlet定义，filter定义等等，都在这xml文件中

实例如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
http://java.sun.com/xml/ns/j2ee/web-app_3_1.xsd" version="3.1">

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/applicationContext.xml</param-value>
    </context-param>

    <!-- 解决乱码的问题 -->
    <filter>
        <filter-name>encodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <async-supported>true</async-supported>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
        <init-param>
            <param-name>forceEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>encodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <servlet>
        <servlet-name>mvc-dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
        <async-supported>true</async-supported>
    </servlet>

    <servlet-mapping>
        <servlet-name>mvc-dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
</web-app>
```

上面的配置中，定义了 `DispatcherServlet`的名字为 `mvc-dispatcher`，根据规范，会有一个叫做 `mvc-dispatcher-servlet.xml`的配置文件，其中的配置将应用于`DispatcherServlet`的上下文

#### b. mvc-dispatcher-servlet.xml

这个文件主要可以用来定义Servlet相关的配置信息，比如视图解析，资源路径指定等；一个最简单的配置如下

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:beans="http://www.springframework.org/schema/mvc"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd  http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">


    <!--指定扫描的包路径，自动注册包含指定注解的对象到Spring容器，并包含了 context:annotation-config 的作用-->
    <context:component-scan base-package="com.git.hui.spring"/>
</beans>
```

在`mvc-dispatcher-servlet.xml`中，`context:component-scan`非常非常重要，用来指定自动扫描并注册bean到容器的包路径，上面这一行配置，简单来讲可以认为做了下面几件事情

- 扫描包 `com.git.hui.spring` 下所有的类，如果类上有 `@Component`, `@Service`, `@Repository`, `@Contorller`, `@RestContorller`, `@Configuration`等注解，会实例化为bean对象，并注册到Spring容器中
- 其次就是实现DI的功能，实现bean的依赖注入

接下来看一下，如果不加上面这一行，也想实现对应的效果改怎样配置呢?

```xml
<!-- 这个使用来激活注册的Bean，简单来讲就是使Ioc工作起来 -->
<context:annotation-config/>

<bean name="printServer" class="com.git.hui.spring.PrintServer"/>
<bean name="helloRest" class="com.git.hui.spring.HelloRest"/>
```

源码后面会给出，首先是主动定义两个bean，其中 `helloRest` 为Controller， `printServer` 为一个Service，并被注入到helloRest中

如果只定义了两个bean，而不加上`<context:annotation-config/>`，则HelloRest中的printService会是null，演示如下图


![异常示意图](/imgs/190316/01.jpg)


此外，如果用了旧的Spring版本，直接用前面的配置，可能依然无法访问web服务，这个时候有必要加一下下面的注解; 对于使用aop，希望使用cglib代理的，需要如下配置

```xml
<!-- 支持mvc注解-->
<mvc:annotation-driven/>

<!-- 使用cglib实现切面代理 -->
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

**额外说明：现在基本上不怎么用xml配置了，有更简单的注解方式，上面的配置内容了解即可**

#### c. applicationContext.xml

前面的截图中，还有个配置文件，这个是干嘛的呢？

DispatchServlet加载包含在web组件中的bean（如mapper，Controller，ViewResolver)；我们应用中，还有些其他的Spring Bean（比如其他rpc访问的服务bean代理，db驱动组件等）则更多的是放在这个配置文件中定义

当然这个里面最简单的配置内容就是啥都没有，比如我们的demo工程

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">
</beans>
```

### 4. 实例代码

配置完了之后，我们简单的定义一个reset服务用来测试，比如一个简单dean对象和一个简单的Controller

简单的bean对象

```java
@Component
public class PrintServer {

    public void print() {
        System.out.println(System.currentTimeMillis());
    }

}
```

Controller如下

```java
@RestController
public class HelloRest {

    @Autowired
    private PrintServer printServer;

    @ResponseBody
    @GetMapping("hello")
    public String sayHello(HttpServletRequest request) {
        printServer.print();
        return "hello, " + request.getParameter("name");
    }
}
```

### 5. 测试

上面我们的web应用就搭建完毕了，然后就是把它部署起来，看下能不能愉快的玩耍了；我们有两个方法

**方法一:tomcat方式**

- 打包 `mvn clean package -DskipTests=true` ，然后target目录下会生成一个war包
- 将war包放在tomcat的webapps目录下，然后启动tomcat进行访问即可

**方法二:jetty方式**

前面一种方式，有很多公司的服务是这么玩的，将服务达成war包丢到tomcat中，然后服务上线；然而在本地开发测试时，这样有点麻烦（当然可以通过idea配置tomcat调试法，个人感觉，依然麻烦）

我们使用jetty来玩耍就很简单了，首先在pom中添加配置，引入jetty插件

```xml
<build>
    <finalName>web-mvc</finalName>
    <plugins>
        <plugin>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-maven-plugin</artifactId>
            <version>9.4.12.RC2</version>
            <configuration>
                <httpConnector>
                    <port>8080</port>
                </httpConnector>
            </configuration>
        </plugin>
    </plugins>
</build>
```

然后启动方式可以使用命令: `mvn jetty:run`， 也可以使用idea，如下，直接双击运行或者右键选择debug模式启动

![启动说明](/imgs/190316/02.jpg)

然后我们愉快的启动测试过程如下

![web测试](/imgs/190316/03.gif)

到此，一个基于 Spring + SpringMVC + Jetty + xml配置的web应用就搭建起来了；下一篇我们将讲一下，纯java注解方式，抛弃xml配置又可以怎样搭建一个web应用


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
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring/201-mvc-xml](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring/201-mvc-xml)


---
order: 5
title: 5.Listener四种注册姿势
tag: 
  - Listener
category: 
  - SpringBoot
  - WEB系列
  - web三剑客
date: 2019-12-06 14:03:28
keywords: Spring SpringMVC Servlet SpringBoot Listener @WebListener ServletContext 注册 绑定
---

javaw web三要素Filter, Servlet前面分别进行了介绍，接下来我们看一下Listener的相关知识点，本篇博文主要内容为SpringBoot环境下，如何自定义Listener并注册到spring容器

<!-- more -->

## I. 环境配置

### 1. 项目搭建

首先我们需要搭建一个web工程，以方便后续的servelt注册的实例演示，可以通过spring boot官网创建工程，也可以建立一个maven工程，在pom.xml中如下配置

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

## II. Listener注册

我们这里说到的Listener专指java web相关的监听器，与Spring本身的Listener并不一样。在java web中Listener的知识点为servlet规范的那一套，这里不详细展开。下面主要介绍在SpringBoot中使用Servlet Listener的四种方式

### 1. WebListener注解

`@WebListener`注解为Servlet3+提供的注解，可以标识一个类为Listener，使用姿势和前面的Listener、Filter并没有太大的区别

```java
@WebListener
public class AnoContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("@WebListener context 初始化");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("@WebListener context 销毁");
    }
}
```

因为WebListener注解不是spring的规范，所以为了识别它，需要在启动类上添加注解`@ServletComponentScan`

```java
@ServletComponentScan
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

### 2. 普通bean

第二种使用方式是将Listener当成一个普通的spring bean，spring boot会自动将其包装为`ServletListenerRegistrationBean`对象

```java
@Component
public class BeanContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("bean context 初始化");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("bean context 销毁");
    }
}
```

### 3. ServletListenerRegistrationBean

通过java config来主动将一个普通的Listener对象，塞入`ServletListenerRegistrationBean`对象，创建为spring的bean对象

```java
public class ConfigContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("config context 初始化");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("java context 销毁");
    }
}
```

上面只是一个普通的类定义，下面的bean创建才是关键点

```java
@Bean
public ServletListenerRegistrationBean configContextListener() {
    ServletListenerRegistrationBean bean = new ServletListenerRegistrationBean();
    bean.setListener(new ConfigContextListener());
    return bean;
}
```

### 4. ServletContextInitializer

这里主要是借助在ServletContext上下文创建的实际，主动的向其中添加Filter，Servlet， Listener，从而实现一种主动注册的效果

```java
public class SelfContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("ServletContextInitializer context 初始化");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("ServletContextInitializer context 销毁");
    }
}

@Component
public class ExtendServletConfigInitializer implements ServletContextInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        servletContext.addListener(SelfContextListener.class);
    }
}
```

注意ExtendServletConfigInitializer的主动注册时机，在启动时添加了这个Listenrer，所以它的优先级会是最高

### 5. 测试

上面介绍了四种注册方式，都可以生效，在我们的实际开发中，按需选择一种即可，不太建议多种方式混合使用；

项目启动和关闭之后，输出日志如下

![](/imgs/191206/00.jpg)


## II. 其他


#### web系列博文

- [191122-SpringBoot系列教程web篇Servlet 注册的四种姿势](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484377&idx=1&sn=a20ce7e5e04ede4dff5fa84a7c5c8448&chksm=fce71875cb9091639124afa69d0ec7bbf8f50438fd7acaf582fb029b7a4adf2f36fa50d4f0fa&token=1748723444&lang=zh_CN#rd)
- [191120-SpringBoot系列教程Web篇之开启GZIP数据压缩](http://spring.hhui.top/spring-blog/2019/11/20/191120-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8BWeb%E7%AF%87%E4%B9%8B%E5%BC%80%E5%90%AFGZIP%E6%95%B0%E6%8D%AE%E5%8E%8B%E7%BC%A9/)
- [191018-SpringBoot系列教程web篇之过滤器Filter使用指南扩展篇](http://spring.hhui.top/spring-blog/2019/10/18/191018-SpringBoot%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8Bweb%E7%AF%87%E4%B9%8B%E8%BF%87%E6%BB%A4%E5%99%A8Filter%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97%E6%89%A9%E5%B1%95%E7%AF%87/)
- [191016-SpringBoot系列教程web篇之过滤器Filter使用指南](https://mp.weixin.qq.com/s/f01KWO3d2zhoN0Qa9-Qb6w)
- [191012-SpringBoot系列教程web篇之自定义异常处理HandlerExceptionResolver](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484348&idx=1&sn=e9b36572c721418b097396b50319d140&chksm=fce71810cb9091063e810327e44f7ed07256188aecd352fa43f37e63e63dc64292b1a48b00cf&token=823367253&lang=zh_CN#rd)
- [191010-SpringBoot系列教程web篇之全局异常处理](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484344&idx=1&sn=d4b1422a709d9540583e33443aab6fff&chksm=fce71814cb9091025a960312c878ff9fc4f44fd0035aa597f55f37c90dcbac25a3e96ee2c528&token=118864495&lang=zh_CN#rd)
- [190930-SpringBoot系列教程web篇之404、500异常页面配置](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484336&idx=1&sn=d70f15e77bbd219af8015f9037a167fb&chksm=fce7181ccb90910aee427a3f3ed7660e8303c7460859c82622a651ce1cc3d7a97f62f80ed4e0&token=2447275&lang=zh_CN#rd)
- [190929-SpringBoot系列教程web篇之重定向](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484322&idx=1&sn=b18090f35b59097f78858b6609506b74&chksm=fce7180ecb909118d939f3ddf741a11c0977b1213d7afa12c970590590d40441c3a085c43c52&token=2447275&lang=zh_CN#rd)
- [190913-SpringBoot系列教程web篇之返回文本、网页、图片的操作姿势](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484310&idx=1&sn=f6259cf1b79db095ff2e9534993d27cf&chksm=fce7183acb90912cd150f086e90ecab3eceb3464e9352853e2e722288d412dbb3eb20c6e6ae7&scene=21#wechat_redirect)
- [190905-SpringBoot系列教程web篇之中文乱码问题解决](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484309&idx=1&sn=33d782f7529268eef6607a1ab8d41018&chksm=fce71839cb90912f6020aa9463bc0136cb57969ebe27eba865d97e212c28211435791aa874ea&scene=21#wechat_redirect)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484291&idx=1&sn=3f7e8c92ca4d7270cc5c40cafea39683&chksm=fce7182fcb90913922654a4f2f04e7029b8944d71c31741334a3235aecbe1e60babcb0c0be74&scene=21#wechat_redirect)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484287&idx=1&sn=44461f564d6b04cbf1a5902dcb4f23c6&chksm=fce718d3cb9091c5d730e63ae954c0831d53f3dd5af5d19d9c78b6009102838efaf56f7838ff&scene=21#wechat_redirect)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484282&idx=1&sn=a8d236d935ae24cfbe6977e24a479caa&chksm=fce718d6cb9091c0dd8a6b113236f9ae9388fb026c9403c97bdf7505f773bd7330a43e3b269c&scene=21#wechat_redirect)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=3&sn=9e8a6121dce291c65bd2b3d4fab24178&chksm=fce718c0cb9091d6674fb809d68ca3dc3b1695162368481abf8dc094000412116d2f9971c54b&scene=21#wechat_redirect)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=2&sn=f800c001061eabe74e2cad915af1921a&chksm=fce718c0cb9091d682b600673a0584955783f0d339248e34323efbea9b698560c432018717ef&scene=21#wechat_redirect)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=1&sn=acd691729488d81a94c938151d5737ce&chksm=fce718c0cb9091d63ef5f12893bb835c256a18318e791a0d193d00ef767ecfd019491d02e83d&scene=21#wechat_redirect)
- [190421-SpringBoot高级篇WEB之websocket的使用说明](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484217&idx=1&sn=9fdf45d2261cdcf2ccaccaebfb5ef598&chksm=fce71895cb90918361f1afd55a2b5fc9d65508913c1d793710afa79cae38bd9d57e32ad2c187&token=2447275&lang=zh_CN#rd)
- [190327-Spring-RestTemplate之urlencode参数解析异常全程分析](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484197&idx=1&sn=0184953527f58058ee8c2bbcfc2689ec&chksm=fce71889cb90919f9be003bf2487343f7952d6b33ab5ee5fb7251ae37a631d4c32e6d8a57528&token=2447275&lang=zh_CN#rd)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484193&idx=1&sn=d8a284fe0a2b8e1fefe07d892558f563&chksm=fce7188dcb90919b1f8a2408bf955e37e88b043e2dbd59b5290ac1501e3d2d303512bac6af2c&token=2447275&lang=zh_CN#rd)
- [190316-Spring MVC之基于xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484186&idx=1&sn=18db571b670815965ae9185830c4e88f&chksm=fce718b6cb9091a054e0ac4be051341d8ce38ff8e40c5911302e3d6981206c14b80770590044&token=2447275&lang=zh_CN#rd)
- [190213-SpringBoot文件上传异常之提示The temporary upload location xxx is not valid](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484139&idx=1&sn=b4a5f3ca6215641c6bcf5123f2bfb501&chksm=fce71947cb9090511042ae97a12cc975d2b199521e17980e685cccb5e0be91a8e932cef4eb76&token=2447275&lang=zh_CN#rd)

#### 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/212-web-listener](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/212-web-listener)


---
order: 4
title: 4.Servlet 注册的四种姿势
tag: 
  - Servlet
category: 
  - SpringBoot
  - WEB系列
  - web三剑客
date: 2019-11-22 09:07:58
keywords: Spring SpringMVC SpringBoot Servlet WebServlet ServletRegistrationBean 注册 ServletContext
---

前面介绍了java web三要素中filter的使用指南与常见的易错事项，接下来我们来看一下Servlet的使用姿势，本篇主要带来在SpringBoot环境下，注册自定义的Servelt的四种姿势

- `@WebServlet` 注解
- `ServletRegistrationBean` bean定义
- `ServletContext` 动态添加
- 普通的spring bean模式

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

**特别说明：**

为了紧跟SpringBoot的最新版本，从本篇文章开始，博文对应的示例工程中SpringBoot版本升级到`2.2.1.RELEASE`

## II. Servlet注册

自定义一个Servlet比较简单，一般常见的操作是继承`HttpServlet`，然后覆盖`doGet`, `doPost`等方法即可；然而重点是我们自定义的这些Servlet如何才能被SpringBoot识别并使用才是关键，下面介绍四种注册方式

### 1. @WebServlet

在自定义的servlet上添加Servlet3+的注解`@WebServlet`，来声明这个类是一个Servlet

和Fitler的注册方式一样，使用这个注解，需要配合Spring Boot的`@ServletComponentScan`，否则单纯的添加上面的注解并不会生效

```java
/**
 * 使用注解的方式来定义并注册一个自定义Servlet
 * Created by @author yihui in 19:08 19/11/21.
 */
@WebServlet(urlPatterns = "/annotation")
public class AnnotationServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        PrintWriter writer = resp.getWriter();
        writer.write("[AnnotationServlet] welcome " + name);
        writer.flush();
        writer.close();
    }
}
```

上面是一个简单的测试Servlet，接收请求参数`name`, 并返回 `welcome xxx`；为了让上面的的注解生效，需要设置下启动类

```java
@ServletComponentScan
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

然后启动测试，输出结果如:

```bash
➜  ~ curl http://localhost:8080/annotation\?name\=yihuihui
# 输出结果
[AnnotationServlet] welcome yihuihui%
```

### 2. ServletRegistrationBean

在Filter的注册中，我们知道有一种方式是定义一个Spring的Bean `FilterRegistrationBean`来包装我们的自定义Filter，从而让Spring容器来管理我们的过滤器；同样的在Servlet中，也有类似的包装bean: `ServletRegistrationBean`

自定义的bean如下，注意类上没有任何注解

```java
/**
 * Created by @author yihui in 19:17 19/11/21.
 */
public class RegisterBeanServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        PrintWriter writer = resp.getWriter();
        writer.write("[RegisterBeanServlet] welcome " + name);
        writer.flush();
        writer.close();
    }
}
```

接下来我们需要定义一个`ServletRegistrationBean`，让它持有`RegisterBeanServlet`的实例

```java
@Bean
public ServletRegistrationBean servletBean() {
    ServletRegistrationBean registrationBean = new ServletRegistrationBean();
    registrationBean.addUrlMappings("/register");
    registrationBean.setServlet(new RegisterBeanServlet());
    return registrationBean;
}
```

测试请求输出如下:

```bash
➜  ~ curl 'http://localhost:8080/register?name=yihuihui'
# 输出结果
[RegisterBeanServlet] welcome yihuihui%
```

### 3. ServletContext

这种姿势，在实际的Servlet注册中，其实用得并不太多，主要思路是在ServletContext初始化后，借助`javax.servlet.ServletContext#addServlet(java.lang.String, java.lang.Class<? extends javax.servlet.Servlet>)`方法来主动添加一个Servlet

所以我们需要找一个合适的时机，获取`ServletContext`实例，并注册Servlet，在SpringBoot生态下，可以借助`ServletContextInitializer`

> ServletContextInitializer主要被RegistrationBean实现用于往ServletContext容器中注册Servlet,Filter或者EventListener。这些ServletContextInitializer的设计目的主要是用于这些实例被Spring IoC容器管理

```java
/**
 * Created by @author yihui in 19:49 19/11/21.
 */
public class ContextServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        PrintWriter writer = resp.getWriter();
        writer.write("[ContextServlet] welcome " + name);
        writer.flush();
        writer.close();
    }
}


/**
 * Created by @author yihui in 19:50 19/11/21.
 */
@Component
public class SelfServletConfig implements ServletContextInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        ServletRegistration initServlet = servletContext.addServlet("contextServlet", ContextServlet.class);
        initServlet.addMapping("/context");
    }
}
```

测试结果如下

```bash
➜  ~ curl 'http://localhost:8080/context?name=yihuihui'
# 输出结果
[ContextServlet] welcome yihuihui%
```

### 4. bean

接下来的这种注册方式，并不优雅，但是也可以实现Servlet的注册目的，但是有坑，请各位大佬谨慎使用

看过我的前一篇博文[191016-SpringBoot系列教程web篇之过滤器Filter使用指南](https://mp.weixin.qq.com/s/f01KWO3d2zhoN0Qa9-Qb6w)的同学，可能会有一点映象，可以在Filter上直接添加`@Component`注解，Spring容器扫描bean时，会查找所有实现Filter的子类，并主动将它包装到`FilterRegistrationBean`，实现注册的目的

我们的Servlet是否也可以这样呢？接下来我们实测一下

```java
@Component
public class BeanServlet1 extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        PrintWriter writer = resp.getWriter();
        writer.write("[BeanServlet1] welcome " + name);
        writer.flush();
        writer.close();
    }
}
```

现在问题来了，上面这个Servlet没有定义urlMapping规则，怎么请求呢？

为了确定上面的Servlet被注册了，借着前面Filter的源码分析的关键链路，我们找到了实际注册的地方`ServletContextInitializerBeans#addAsRegistrationBean`

```java
// org.springframework.boot.web.servlet.ServletContextInitializerBeans#addAsRegistrationBean(org.springframework.beans.factory.ListableBeanFactory, java.lang.Class<T>, java.lang.Class<B>, org.springframework.boot.web.servlet.ServletContextInitializerBeans.RegistrationBeanAdapter<T>)

@Override
public RegistrationBean createRegistrationBean(String name, Servlet source, int totalNumberOfSourceBeans) {
	String url = (totalNumberOfSourceBeans != 1) ? "/" + name + "/" : "/";
	if (name.equals(DISPATCHER_SERVLET_NAME)) {
		url = "/"; // always map the main dispatcherServlet to "/"
	}
	ServletRegistrationBean<Servlet> bean = new ServletRegistrationBean<>(source, url);
	bean.setName(name);
	bean.setMultipartConfig(this.multipartConfig);
	return bean;
}
```

从上面的源码上可以看到，这个Servlet的url要么是`/`, 要么是`/beanName/`

接下来进行实测，全是404

```bash
➜  ~ curl 'http://localhost:8080/?name=yihuihui'
{"timestamp":"2019-11-22T00:52:00.448+0000","status":404,"error":"Not Found","message":"No message available","path":"/"}%

➜  ~ curl 'http://localhost:8080/beanServlet1?name=yihuihui'
{"timestamp":"2019-11-22T00:52:07.962+0000","status":404,"error":"Not Found","message":"No message available","path":"/beanServlet1"}%                                          

➜  ~ curl 'http://localhost:8080/beanServlet1/?name=yihuihui'
{"timestamp":"2019-11-22T00:52:11.202+0000","status":404,"error":"Not Found","message":"No message available","path":"/beanServlet1/"}%
```

然后再定义一个Servlet时

```java
@Component
public class BeanServlet2 extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = req.getParameter("name");
        PrintWriter writer = resp.getWriter();
        writer.write("[BeanServlet2] welcome " + name);
        writer.flush();
        writer.close();
    }
}
```

再次测试

```bash
➜  ~ curl 'http://localhost:8080/beanServlet1?name=yihuihui'
{"timestamp":"2019-11-22T00:54:12.692+0000","status":404,"error":"Not Found","message":"No message available","path":"/beanServlet1"}%                                          

➜  ~ curl 'http://localhost:8080/beanServlet1/?name=yihuihui'
[BeanServlet1] welcome yihuihui%                                                                                                                                                

➜  ~ curl 'http://localhost:8080/beanServlet2/?name=yihuihui'
[BeanServlet2] welcome yihuihui%
```

从实际的测试结果可以看出，使用这种定义方式时，这个servlet相应的url为`beanName + '/'`

**注意事项**

然后问题来了，只定义一个Servlet的时候，根据前面的源码分析，这个Servlet应该会相应`http://localhost:8080/`的请求，然而测试的时候为啥是404？

这个问题也好解答，主要就是Servlet的优先级问题，上面这种方式的Servlet的相应优先级低于Spring Web的Servelt优先级，相同的url请求先分配给Spring的Servlet了，为了验证这个也简单，两步

- 先注释`BeanServlet2`类上的注解`@Component`
- 在`BeanServlet1`的类上，添加注解`@Order(-10000)`


然后再次启动测试,输出如下

```bash
➜  ~ curl 'http://localhost:8080/?name=yihuihui'
[BeanServlet1] welcome yihuihui%

➜  ~ curl 'http://localhost:8080?name=yihuihui'
[BeanServlet1] welcome yihuihui%
```

### 5. 小结

本文主要介绍了四种Servlet的注册方式，至于Servlet的使用指南则静待下篇

常见的两种注册case:

- `@WebServlet`注解放在Servlet类上，然后启动类上添加`@ServletComponentScan`，确保Serlvet3+的注解可以被Spring识别
- 将自定义Servlet实例委托给bean `ServletRegistrationBean`

不常见的两种注册case:

- 实现接口`ServletContextInitializer`，通过`ServletContext.addServlet`来注册自定义Servlet
- 直接将Serlvet当做普通的bean注册给Spring
  - 当项目中只有一个此种case的servlet时，它响应url: '/', 但是需要注意不指定优先级时，默认场景下Spring的Servlet优先级更高，所以它接收不到请求
  - 当项目有多个此种case的servlet时，响应的url为`beanName + '/'`， 注意后面的'/'必须有


## II. 其他

### 0. 项目

#### web系列博文

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
- 项目：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/211-web-servlet](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/211-web-servlet)



---
order: 5
title: 5.内嵌Tomcat配置Accesslog日志文件生成位置源码探索
tag: 
  - WEB
category: 
  - SpringBoot
  - WEB系列
  - 踩坑记录
date: 2022-04-24 19:27:54
keywords: 
  - SpringBoot
  - Tomcat
  - Accesslog
---

现在SpringBoot应用大多是内嵌tomcat，以jar包方式启动对外提供服务，最近遇到一个有意思的问题，当我希望输出tomcat的 `access.log` 时，添加上对应的配置之后，发现windowns系统下找不到这个日志文件，而linux/mac则没有什么问题；

所以花了些时间定位一下，本文将记录定位这个日志文件生成的全过程，当发现最后的结论时，更让我吃惊的事情来了，就这么个问题，在三年前我也遇到过，只不过当时的问题是上传文件之后，提示临时目录不存在，而这个临时目录和本文定位的目录居然是一回事，可谓是来了一次梦幻的联动，前面踩的坑不探究到底，后面迟早会继续掉坑😂

<!-- more --> 

## I. 项目搭建与日志配置

### 1. 项目依赖

本项目借助SpringBoot 2.2.1.RELEASE + maven 3.5.3 + IDEA进行开发

启动一个标准的SpringBoot项目，注意添加下面的依赖如下 （本文对应的源码可以在文末查看）

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. tomcat日志配置

tomcat的日志配置信息，下面放在默认的配置文件 `application.yml` 中，主要有下面几个关键参数

```yml
server:
  port: 8080
  tomcat:
    accesslog:
      enabled: true
      directory: /tmp/logs/boot
      file-date-format: .yyyyMMdd
      pattern: '%h %l %u %t "%r" %s %b %Dms "%{Referer}i" "%{User-Agent}i" "%{X-Request-ID}i" "%{X-Forwarded-For}i"'
```

### 3. 一个简单的rest接口

添加一个基础的rest接口，用于接收请求

```java
@RestController
@SpringBootApplication
public class Application {
    private DalConfig dalConfig;

    public Application(DalConfig dalConfig, Environment environment) {
        this.dalConfig = dalConfig;
        System.out.println(dalConfig);
    }

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(Application.class);
        application.run(args);
    }

    @GetMapping(path = {"", "/", "/index"})
    public ModelAndView index() {
        return "hello";
    }
}
```

接下来请求一下接口，看下日志是否正常

```bash
curl 'http://127.0.0.1:8080/'
```

如果是mac/linux系统的同学，就可以到 `/tmp/logs/boot` 目录下查看有没有对应的日志文件了，那么win的同学，到哪里看？


## II. 日志文件目录定位

由于win和mac/linux对绝对路径的定义不同，就会导致我们用到这个问题，一般来说，实际的项目最终都是跑在linux系统上，所以文件路径以上面的case居多，很少会说加一个 `c:`，`d:`开头的

那么问题就来了，同样一份代码，win开发的同学到哪里去找日志

### 1. 源码定位

我们这里讨论的是内嵌Tomcat，要想定位日志文件在哪里，就需要先找一下这个日志哪里输出的，

直接google搜索一下关键字，就可以得到有用的信息

![](/imgs/220422/00.jpg)

上面的第一项，给出了一个核心的类 `AccessLogValve`，一下子就找到关键点了，核心地方打个端点，启动一下看看是怎样的

![](/imgs/220422/01.jpg)


上面这个地址就是我们找的目标路径，那么这个是怎么来的呢？这个前缀有什么套路么？

核心来源点 `File dir = this.getDirectoryFile();`，对应的实现

```java
    private File getDirectoryFile() {
        // 这个directory就是我们对应的配置参数 server.tomcat.access_log.directory
        File dir = new File(this.directory);
        if (!dir.isAbsolute()) {
            dir = new File(this.getContainer().getCatalinaBase(), this.directory);
        }

        return dir;
    }
```

所以重点需要关注 `this.getContainer().getCatalinaBase()`， 上面这个它对应的实例为`org.apache.catalina.core.StandardEngine#getCatalinaBase`

接着向上朔源，可以找到设置这个路径的地方，在`org.apache.catalina.startup.Tomcat#initBaseDir`

![](/imgs/220422/02.jpg)


最后就是定位baseDir的初始化了，再网上找一下，可以看到关键信息

![](/imgs/220422/03.jpg)

再直达一步，原来这个目录创建是基于 `jdk`的`File.createTempFile()`来实现的，又学到一个没什么鸟用的知识点了

![](/imgs/220422/04.jpg)

### 2. 小结

本文可能对大部分小伙伴来说没什么鸟用，基本上也不太会有用到需要取查找tomcat的访问日志`access.log`的时候（这里指SpringBoot应用），在定位这个具体路径的时候，想起了很久之前也踩过的一个坑，上传文件时，提示临时目录不存在，而这个目录和我们上面查找定位的可以说是一个地方了，仔细看来，现在算是填了一个时隔三年的坑了😁

> * [【WEB系列】SpringBoot文件上传异常之提示The temporary upload location xxx is not valid（填坑篇） | 一灰灰Blog](https://spring.hhui.top/spring-blog/2019/02/13/190213-SpringBoot%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0%E5%BC%82%E5%B8%B8%E4%B9%8B%E6%8F%90%E7%A4%BAThe-temporary-upload-location-xxx-is-not-valid/)

最后小结下本文对应的知识点

**tip1 accesslog日志配置**

核心配置信息如下

```yaml
server:
  port: 8080
  tomcat:
    accesslog:
      enabled: true # 设置为true，表示输出 accesslog 日志
      directory: /logs/boot  # 日志文件所在的目录，注意不同操作系统，对绝对路径的定位不同
      file-date-format: .yyyyMMdd # 按日期进行归档
      pattern: '%h %l %u %t "%r" %s %b %Dms "%{Referer}i" "%{User-Agent}i" "%{X-Request-ID}i" "%{X-Forwarded-For}i"' # 日志输出格式，类似Logback配置
#    basedir: /logs  # 全局基本目录，如果配置，则日志文件对应的目录为 basedir + directory
```

**tip2 绝对路径的判断**

在Tomcat中，对于绝对路径的判断非常有参考价值，当然也可能是因为我对于jdk基本的api不够熟悉的原因 ，之前我的判断方式是

```java
/**
 * 是否windows系统
 */
public static boolean isWinOS() {
    boolean isWinOS = false;
    try {
        String osName = System.getProperty("os.name").toLowerCase();
        String sharpOsName = osName.replaceAll("windows", "{windows}").replaceAll("^win([^a-z])", "{windows}$1")
                .replaceAll("([^a-z])win([^a-z])", "$1{windows}$2");
        isWinOS = sharpOsName.contains("{windows}");
    } catch (Exception e) {
        e.printStackTrace();
    }
    return isWinOS;
}

public static boolean isAbsFile(String fileName) {
    if (isWinOS()) {
        // windows 操作系统时，绝对地址形如  c:\descktop
        return fileName.contains(":") || fileName.startsWith("\\");
    } else {
        // mac or linux
        return fileName.startsWith("/");
    }
}
```

现在则有更简单的方式了

```java
private boolean isAbs(String path) {
    return new File(path).isAbsolute();
}
```

**tip3 临时目录创建**

同样是直接借助File来实现， `File.createTempFile` 即可，下面是Tomcat的创建方式，还非常贴心的加上了虚拟机终止时，自动删除相关的文件

```java
/**
 * Return the absolute temp dir for given web server.
 * @param prefix server name
 * @return the temp dir for given server.
 */
protected final File createTempDir(String prefix) {
    try {
        File tempDir = File.createTempFile(prefix + ".", "." + getPort());
        tempDir.delete();
        tempDir.mkdir();
        tempDir.deleteOnExit();
        return tempDir;
    }
    catch (IOException ex) {
        throw new WebServerException(
                "Unable to create tempDir. java.io.tmpdir is set to " + System.getProperty("java.io.tmpdir"), ex);
    }
}
```


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/001-properties-env-mvn](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/001-properties-env-mvn)

### 1. 微信公众号: 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


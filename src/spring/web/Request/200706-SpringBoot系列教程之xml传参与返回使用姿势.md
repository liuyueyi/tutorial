---
order: 7
title: 7.xml传参与返回使用姿势
tag: 
  - xml
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2020-07-06 07:43:45
keywords: Spring SpringBoot Request xml response servlet
---

使用XML作为传参和返回结果，在实际的编码中可能不太常见，特别是当前json大行其道的时候；那么为什么突然来这么一出呢？源于对接微信公众号的消息接收，自动回复的开发时，惊奇的发现微信使用xml格式进行交互，所以也就不得不支持了

下面介绍一下SpringBoot中如何支持xml传参解析与返回xml文档

<!-- more -->

## I. 项目环境

本文创建的实例工程采用`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `idea`进行开发

### 1. pom依赖

具体的SpringBoot项目工程创建就不赘述了，对于pom文件中，需要重点关注下面两个依赖类

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.dataformat</groupId>
        <artifactId>jackson-dataformat-xml</artifactId>
        <version>2.10.0</version>
    </dependency>
</dependencies>
```


**请注意jackson-dataformat-xml版本，不要选择太老的**

## II. 实例演示

### 1. 传参Bean

定义一个接受参数的bean对象，如下

```java
@JacksonXmlRootElement(localName = "req")
@Data
public static class XmlBean {
    private String name;
    
    @JacksonXmlProperty(localName = "age")
    private Integer age;
}
```

请注意，我们使用`@JacksonXmlRootElement`注解来修饰这个bean，localName中的value，相当于xml的根标签；如果类中的属性成员名，和xml标签名不一样，可以使用注解`@JacksonXmlProperty(localName = "xxx")`来修饰

其次，请保留bean的默认无参构造函数，get/set方法 （我上面为了简洁，使用了lombok（最近看到了不少抨击lombok的文章...），不希望使用lombok的小伙伴，可以利用IDEA的自动生成，来实现相关的代码）

### 2. Response Bean

定义返回的也是一个xml bean

```java
@Data
@JacksonXmlRootElement(localName = "res")
public static class XmlRes {
    private String msg;

    private Integer code;

    private String data;
}
```

### 3. rest服务

然后像平常一样，实现一个"普通"的rest服务即可

```java
@RestController
@RequestMapping(path = "xml")
public class XmlParamsRest {
    @PostMapping(path = "show", consumes = {MediaType.APPLICATION_XML_VALUE},
            produces = MediaType.APPLICATION_XML_VALUE)
    public XmlRes show(@RequestBody XmlBean bean) {
        System.out.println(bean);
        XmlRes res = new XmlRes();
        res.setCode(0);
        res.setMsg("success");
        res.setData(bean.toString());
        return res;
    }
}
```

注意三点

- `@RestController`：返回的不是视图
- `@PostMapping`注解中的 `consumes` 和 `produces`参数，指定了"application/xml"，表示我们接收和返回的都是xml文档
- `@RequestBody`：不加这个注解时，无法获取传参哦（可以想一想why?)

**接口测试**

我个人倾向于万能的curl进行测试，打开终端即可使用，如下

```bash
# 测试命令
curl -X POST 'http://127.0.0.1:8080/xml/show' -H 'content-type:application/xml' -d '<req><name>一灰灰</name><age>18</age></req>' -i
```

![](/imgs/200706/00.jpg)

考虑到有些小伙伴更青睐于Postman进行url测试，下面是具体的请求姿势

![](/imgs/200706/01.jpg)

### 4. 解析异常问题

> 如果需要重新这个问题，可以参考项目: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params) 

某些场景下，直接使用上面的姿势貌似不能正常工作，会抛出一个`Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/xml;charset=UTF-8' not supported]`的异常信息

针对出现`HttpMediaTypeNotSupportedException`的场景，解决办法也很明确，增加一个xml的`HttpMesssageConverter`即可，依然是借助`MappingJackson2XmlHttpMessageConverter`，如

```java
@Configuration
public class MvcConfig extends WebMvcConfigurationSupport {
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        super.configureMessageConverters(converters);
        converters.add(new MappingJackson2XmlHttpMessageConverter());
    }
}
```

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params)


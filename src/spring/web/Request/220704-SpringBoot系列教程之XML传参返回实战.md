---
order: 8
title: 8.xml传参与返回实战演练
tag: 
  - xml
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2022-07-04 21:43:45
keywords: 
  - Spring 
  - SpringBoot 
  - Request
  - xml
  - response
  - servlet
---

最近在准备使用微信公众号来做个人站点的登录，发现微信的回调协议居然是xml格式的，之前使用json传输的较多，结果发现换成xml之后，好像并没有想象中的那么顺利，比如回传的数据始终拿不到，返回的数据对方不认等

接下来我们来实际看一下，一个传参和返回都是xml的SpringBoot应用，究竟是怎样的

<!-- more -->

## I. 项目搭建


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
    </dependency>
</dependencies>
```

### 2. 接口调研

我们直接使用微信公众号的回调传参、返回来搭建项目服务，微信开发平台文档如: [基础消息能力](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html)


其定义的推送参数如下

```xml
<xml>
  <ToUserName><![CDATA[toUser]]></ToUserName>
  <FromUserName><![CDATA[fromUser]]></FromUserName>
  <CreateTime>1348831860</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[this is a test]]></Content>
  <MsgId>1234567890123456</MsgId>
  <MsgDataId>xxxx</MsgDataId>
  <Idx>xxxx</Idx>
</xml>
```

要求返回的结果如下

```xml
<xml>
  <ToUserName><![CDATA[toUser]]></ToUserName>
  <FromUserName><![CDATA[fromUser]]></FromUserName>
  <CreateTime>12345678</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[你好]]></Content>
</xml>
```

上面的结构看起来还好，但是需要注意的是外层标签为`xml`，内层标签都是大写开头的；而微信识别返回是大小写敏感的

## II. 实战

项目工程搭建完毕之后，首先定义一个接口，用于接收xml传参，并返回xml对象；

那么核心的问题就是如何定义传参为xml，返回也是xml呢？

> 没错：就是请求头 + 返回头

### 1.REST接口

```java
@RestController
public class XmlRest {

    /**
     * curl -X POST 'http://localhost:8080/xml/callback' -H 'content-type:application/xml' -d '<xml><URL><![CDATA[https://hhui.top]]></URL><ToUserName><![CDATA[一灰灰blog]]></ToUserName><FromUserName><![CDATA[123]]></FromUserName><CreateTime>1655700579</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[测试]]></Content><MsgId>11111111</MsgId></xml>' -i
     *
     * @param msg
     * @param request
     * @return
     */
    @PostMapping(path = "xml/callback",
            consumes = {"application/xml", "text/xml"},
            produces = "application/xml;charset=utf-8")
    public WxTxtMsgResVo callBack(@RequestBody WxTxtMsgReqVo msg, HttpServletRequest request) {
        WxTxtMsgResVo res = new WxTxtMsgResVo();
        res.setFromUserName(msg.getToUserName());
        res.setToUserName(msg.getFromUserName());
        res.setCreateTime(System.currentTimeMillis() / 1000);
        res.setMsgType("text");
        res.setContent("hello: " + LocalDateTime.now());
        return res;
    }
}
```

注意上面的接口定义，POST传参，请求头和返回头都是 `application/xml`

### 2.请求参数与返回结果对象定义

上面的接口中定义了`WxTxtMsgReqVo`来接收传参，定义`WxTxtMsgResVo`来返回结果，由于我们采用的是xml协议传输数据，这里需要借助`JacksonXmlRootElement`和`JacksonXmlProperty`注解；它们的实际作用与json传输时，使用`JsonProperty`来指定json key的作用相仿


下面是具体的实体定义

```java
@Data
@JacksonXmlRootElement(localName = "xml")
public class WxTxtMsgReqVo {
    @JacksonXmlProperty(localName = "ToUserName")
    private String toUserName;
    @JacksonXmlProperty(localName = "FromUserName")
    private String fromUserName;
    @JacksonXmlProperty(localName = "CreateTime")
    private Long createTime;
    @JacksonXmlProperty(localName = "MsgType")
    private String msgType;
    @JacksonXmlProperty(localName = "Content")
    private String content;
    @JacksonXmlProperty(localName = "MsgId")
    private String msgId;
    @JacksonXmlProperty(localName = "MsgDataId")
    private String msgDataId;
    @JacksonXmlProperty(localName = "Idx")
    private String idx;
}

@Data
@JacksonXmlRootElement(localName = "xml")
public class WxTxtMsgResVo {

    @JacksonXmlProperty(localName = "ToUserName")
    private String toUserName;
    @JacksonXmlProperty(localName = "FromUserName")
    private String fromUserName;
    @JacksonXmlProperty(localName = "CreateTime")
    private Long createTime;
    @JacksonXmlProperty(localName = "MsgType")
    private String msgType;
    @JacksonXmlProperty(localName = "Content")
    private String content;
}
```

重点说明：

- JacksonXmlRootElement 注解，定义返回的xml文档中最外层的标签名
- JacksonXmlProperty 注解，定义每个属性值对应的标签名
- 无需额外添加`<![CDATA[...]]>`，这个会自动添加，防转义

### 3.测试

然后访问测试一下，直接通过curl来发送xml请求

```bash
curl -X POST 'http://localhost:8080/xml/callback' -H 'content-type:application/xml' -d '<xml><URL><![CDATA[https://hhui.top]]></URL><ToUserName><![CDATA[一灰灰blog]]></ToUserName><FromUserName><![CDATA[123]]></FromUserName><CreateTime>1655700579</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[测试]]></Content><MsgId>11111111</MsgId></xml>' -i
```

实际响应如下

```bash
HTTP/1.1 200
Content-Type: application/xml;charset=utf-8
Transfer-Encoding: chunked
Date: Tue, 05 Jul 2022 01:20:32 GMT

<xml><ToUserName>123</ToUserName><FromUserName>一灰灰blog</FromUserName><CreateTime>1656984032</CreateTime><MsgType>text</MsgType><Content>hello: 2022-07-05T09:20:32.155</Content></xml>%   
```


### 4.问题记录

#### 4.1 HttpMediaTypeNotSupportedException异常

通过前面的方式搭建项目之后，在实际测试时，可能会遇到下面的异常情况`Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/xml;charset=UTF-8' not supported]`


当出现这个问题时，表明是没有对应的Convert来处理`application/xml`格式的请求头

对应的解决方案则是主动注册上

```java
@Configuration
public class XmlWebConfig implements WebMvcConfigurer {
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(new MappingJackson2XmlHttpMessageConverter());
    }
}
```

#### 4.2 其他json接口也返回xml数据

另外一个场景则是配置了前面的xml之后，导致项目中其他正常的json传参、返回的接口也开始返回xml格式的数据了，此时解决方案如下

```java
@Configuration
public class XmlWebConfig implements WebMvcConfigurer {
    /**
     * 配置这个，默认返回的是json格式数据；若指定了xml返回头，则返回xml格式数据
     *
     * @param configurer
     */
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(MediaType.APPLICATION_JSON, MediaType.TEXT_XML, MediaType.APPLICATION_XML);
    }
}
```

#### 4.3 微信实际回调参数一直拿不到

这个问题是在实际测试回调的时候遇到的，接口定义之后始终拿不到结果，主要原因就在于最开始没有在定义的实体类上添加 `@JacksonXmlProperty`

当我们没有指定这个注解时，接收的xml标签名与实体对象的fieldName完全相同，既区分大小写

所以为了解决这个问题，就是老老实实如上面的写法，在每个成员上添加注解，如下

```java
@JacksonXmlProperty(localName = "ToUserName")
private String toUserName;
@JacksonXmlProperty(localName = "FromUserName")
private String fromUserName;
```

### 5.小结

本文主要介绍的是SpringBoot如何支持xml格式的传参与返回，大体上使用姿势与json格式并没有什么区别，但是在实际使用的时候需要注意上面提出的几个问题，避免采坑

关键知识点提炼如下：

- Post接口上，指定请求头和返回头：
  - `consumes = {"application/xml", "text/xml"},`
  - `produces = "application/xml;charset=utf-8"`
- 实体对象，通过`JacksonXmlRootElement`和`JacksonXmlProperty`来重命名返回的标签名
- 注册`MappingJackson2XmlHttpMessageConverter`解决HttpMediaTypeNotSupportedException异常
- 指定`ContentNegotiationConfigurer.defaultContentType` 避免出现所有接口返回xml文档


## III. 其他

### 0. 项目与源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/204-web-xml](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/204-web-xml)



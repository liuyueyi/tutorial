---
order: 1
title: 1.邮件发送姿势介绍
tag: 
  - Email
category: 
  - SpringBoot
  - 中间件
  - Email
date: 2021-08-02 21:41:28
keywords: email springboot spring 邮件 EmailSender
---

邮件发送，在实际的项目开发中，可能用的不是特别多，如果没有特定的需求，相信也没有多少小伙伴会特意的去关注，那么如果现在我们希望针对项目做一个异常的报警系统，当出现异常的时候，可以向指定的小伙伴发送邮件提醒，那么让我们来实现这个功能，可以怎么办呢？

这里介绍一下如何使用SpringBoot封装好的MailSender来实现邮件发送

<!-- more -->

## I. 项目环境

### 1. 项目依赖

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

开一个web服务用于测试

```xml
<dependencies>
    <!-- 邮件发送的核心依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    <!-- 适用于html模板形式的邮件发送，借助freemarker来实现html模板渲染 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-freemarker</artifactId>
    </dependency>
</dependencies>
```

### 2. 配置

在开始之前，我们需要先准备一个用于发送邮件的账号，比如我这里使用163的邮箱来发送邮件，需要先到邮箱提供商哪里获取授权码，具体如何获取这个东西，不同的邮箱姿势有些不同，各位小伙伴根据自己的实际情况，搜索一下，相信很快就能get到

这里简单介绍下网易邮箱的获取方式

![](/imgs/210802/00.jpg)


接下来设置发送邮件相关的配置信息，配置文件`application.yml`

```yaml
spring:
  #邮箱配置
  mail:
    host: smtp.163.com
    from: xhhuiblog@163.com
    # 使用自己的发送方用户名 + 授权码填充
    username:
    password:
    default-encoding: UTF-8
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

## II. 邮件发送

接下来进入正题，我们将从简单基础的文本邮件发送开始，逐渐介绍如何添加附件，使用漂亮的html模板等

### 1. 简单文本邮件发送

我们这里直接使用`JavaMailSender`来发送一个基础的文本邮件

```java
@Service
public class MailDemo {
    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.from:xhhuiblog@163.com}")
    private String from;

    private void basicSend() {
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
        //邮件发送人
        simpleMailMessage.setFrom(from);
        //邮件接收人，可以是多个，参数为可变参数
        simpleMailMessage.setTo("bangzewu@126.com");
        //邮件主题，也就是标题
        simpleMailMessage.setSubject("SpringBoot测试邮件发送");
        //邮件内容
        simpleMailMessage.setText("简单的邮件正文");

        javaMailSender.send(simpleMailMessage);
    }
}
```

- JavaMailSender: 直接作为一个Spring 的bean对象使用
- SimpleMailMessage：简单的邮件对象，里面有一些邮件发送时，关联的基础信息
  - from: 发送方
  - replyTo: 邮件回复的收件人
  - to: 收件人
  - cc: 抄送
  - bcc: 密送
  - subject: 主题，也就是邮件标题
  - text: 邮件正文，文本格式
  - date: 邮件发送时间

### 2. html发送

对于简单的文本邮件发送，用上面的基本就够了，如果我们希望邮件的内容更美观一点的话，可以借助HTML来实现排版

区别于上面的SimpleMailMessage, 这里使用的是MimeMessage，来实现html内容发送

使用姿势与上面相比差不多，无非就是正文变成了html文本罢了

```java
/**
 * 发送html
 */
public void sendHtml() throws MessagingException {
    MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
    MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMailMessage, true);
    mimeMessageHelper.setFrom(from);
    mimeMessageHelper.setTo("bangzewu@126.com");
    mimeMessageHelper.setSubject("SpringBoot测试邮件发送");

    //邮件内容
    mimeMessageHelper.setText("<h1>Hello World</h1> <br/> " +
            "<div> 欢迎点击 <a href=\"https://blog.hhui.top\">一灰灰博文地址</a><br/>" +
            " <img width=\"200px\" height=\"200px\" src=\"https://blog.hhui.top/hexblog/imgs/info/wx.jpg\"/>" +
            "</div>", true);

    javaMailSender.send(mimeMailMessage);
}
```

**重点注意**

- 注意上面的`setText`方法的第二个参数，必须有，且为true，否则会当成文本内容发送

### 3. 添加附件

邮件中添加附件，我们自己写邮件的时候可以直接选择附件上传，那么代码的实现方式又有什么区别呢？

```java
/**
 * 发送附件
 */
public void sendWithFile() throws MessagingException, IOException {
    MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
    MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMailMessage, true);
    mimeMessageHelper.setFrom(from);
    mimeMessageHelper.setTo("bangzewu@126.com");
    mimeMessageHelper.setSubject("SpringBoot测试邮件发送");

    mimeMessageHelper.setText("<h1>Hello World</h1> <br/> " +
            "<div> 欢迎点击 <a href=\"https://blog.hhui.top\">一灰灰博文地址</a><br/>" +
            " <img width=\"200px\" height=\"200px\" src=\"https://blog.hhui.top/hexblog/imgs/info/wx.jpg\"/>" +
            "</div>");

    String url = "https://blog.hhui.top/hexblog/imgs/info/wx.jpg";
    URL imgUrl = new URL(url);
    mimeMessageHelper.addAttachment("img.jpg", imgUrl::openStream);

    javaMailSender.send(mimeMailMessage);
}
```

注意上面的实现，与前面差别不大，关键点在于`attachment`附件，上面的实现是在附件中添加一个图片，为了简单起见，图片是直接从网络下载的，然后将Stream作为传参

### 4. Freemaker模板

上面的html发送，会发现需要我们自己来组装html正文，这个操作可能就不是很美好了，借助页面渲染引擎来实现邮件模板支持，可以说是一个比较常见的方案了，这里简单介绍下Freemaker的实现姿势，至于themlaf, beef或者jsp啥的，都没有太大的区别

首先写一个邮件模板 `resources/template/mail.ftl`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="SpringBoot thymeleaf"/>
    <meta name="author" content="YiHui"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>邮件模板</title>
</head>
<style>
    .title {
        color: #c00;
        font-weight: normal;
        font-size: 2em;
    }

    .content {
        color: darkblue;
        font-size: 1.2em;
    }

    .sign {
        color: lightgray;
        font-size: 0.8em;
        font-style: italic;
    }
</style>
<body>

<div>
    <div class="title">${title}</div>
    <div class="content">${content}</div>
</div>
</body>
</html>
```

上面的模板中，定义了两个变量，一个`title`，一个`content`，这个就是我们需要替换的值

接下来是邮件发送实例

```java
import freemarker.template.Configuration;

@Autowired
private Configuration configuration;

/**
 * freemarker 模板
 */
public void freeMakerTemplate() throws MessagingException, IOException, TemplateException {
    MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
    MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMailMessage, true);
    mimeMessageHelper.setFrom(from);
    mimeMessageHelper.setTo("bangzewu@126.com");
    mimeMessageHelper.setSubject("SpringBoot测试邮件发送");

    Map<String, Object> map = new HashMap<>();
    map.put("title", "邮件标题");
    map.put("content", "邮件正文");
    String text = FreeMarkerTemplateUtils.processTemplateIntoString(configuration.getTemplate("mail.ftl"), map);
    mimeMessageHelper.setText(text, true);

    String url = "https://blog.hhui.top/hexblog/imgs/info/wx.jpg";
    URL imgUrl = new URL(url);
    mimeMessageHelper.addAttachment("img.jpg", imgUrl::openStream);

    javaMailSender.send(mimeMailMessage);
}
```

注意上面的实现，关键点就利用`FreeMarkerTemplateUtils`来实现模板的渲染，输出html正文，因此如果想使用其他的模板渲染引擎，就是改这里即可


### 5. 测试与小结

最后简单的调用一下上面的实现，看下邮件是否可以发送成功


![](/imgs/210802/01.jpg)


![](/imgs/210802/02.jpg)

本篇博文介绍了一下如何发送邮件，并针对简单的文本邮件，html正文，附件等不同的给出了实例；整体看下来使用姿势不难，不过邮件的几个术语可以了解一下

- to: 接收人，就是邮件发送的目标群众
- cc: 抄送，一般来讲抄送的名单，只是让他感知到有这封邮件，属于周知对象
- bcc: 密送，与上面两个不一样，接收人和抄送人不知道密送给谁了，这就是最大的区别，说实话这个玩意我从没用过

接下来一篇博文，将介绍一下如何将log日志与邮件发送关联起来，当出现异常的时候，邮件发送给开发者



## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/)


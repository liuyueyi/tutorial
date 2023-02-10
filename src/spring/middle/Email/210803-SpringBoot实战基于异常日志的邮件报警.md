---
order: 2
title: 2.实战：基于异常日志的邮件报警
tag: 
  - Email
category: 
  - SpringBoot
  - 中间件
  - Email
date: 2021-08-03 21:09:39
keywords: email springboot spring 预警 logback log4j
---

相信所有奋斗在一线的小伙伴，会很关心自己的系统的运行情况，一般来说，基础设施齐全一点的公司都会有完善的报警方案，那么如果我们是一个小公司呢，不能因为基础设施没有，就失去对象的感知能力吧；如果我们的系统大量异常却不能实时的触达给我们，那么也就只会有一个结果--杀个程序猿祭天

本文简单的介绍一种实现思路，基于error日志来实现邮件的报警方案

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
</dependencies>
```

### 2. 配置

邮件相关配置如下，注意使用自己的用户名 + 授权码填充下面缺失的配置

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

## II. 异常日志的邮件预警

### 1. 设计思路

接下来这个方案的主要出发点在于，当程序出现大量的异常，表明应用多半出现了问题，需要立马发送给项目owner

要实现这个方案，关键点就在于异常出现的感知与上报

- 异常的捕获，并输出日志（这个感觉属于标配了吧，别告诉我现在还有应用不输出日志文件的...）
  - 对于这个感知，借助logback的扩展机制，可以实现，后面介绍
- 异常上报：邮件发送

关于email的使用姿势，推荐参考博文 [SpringBoot 系列之邮件发送姿势介绍](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247486591&idx=1&sn=04f18e2f313abd371947f9818e238067&chksm=fce717d3cb909ec575b8e521843eff04edfcf844e59ca976515bc29d8a23782c4d5d30580d0e&token=908878619&lang=zh_CN#rd)

### 2. 自定义appender

定义一个用于错误发送的Appender，如下

```java
public class MailUtil extends AppenderBase<ILoggingEvent> {

    public static void sendMail(String title, String context) {
        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
        //邮件发送人
        simpleMailMessage.setFrom(ContextUtil.getEnvironment().getProperty("spring.mail.from", "bangzewu@126.com"));
        //邮件接收人，可以是多个
        simpleMailMessage.setTo("bangzewu@126.com");
        //邮件主题
        simpleMailMessage.setSubject(title);
        //邮件内容
        simpleMailMessage.setText(context);

        JavaMailSender javaMailSender = ContextUtil.getApplicationContext().getBean(JavaMailSender.class);
        javaMailSender.send(simpleMailMessage);
    }

    private static final long INTERVAL = 10 * 1000 * 60;
    private long lastAlarmTime = 0;

    @Override
    protected void append(ILoggingEvent iLoggingEvent) {
        if (canAlarm()) {
            sendMail(iLoggingEvent.getLoggerName(), iLoggingEvent.getFormattedMessage());
        }
    }

    private boolean canAlarm() {
        // 做一个简单的频率过滤
        long now = System.currentTimeMillis();
        if (now - lastAlarmTime >= INTERVAL) {
            lastAlarmTime = now;
            return true;
        } else {
            return false;
        }
    }
}
```

### 3. Spring容器

上面的邮件发送中，需要使用`JavaMailSender`，写一个简单的SpringContext工具类，用于获取Bean/Propertiy

```java
@Component
public class ContextUtil implements ApplicationContextAware, EnvironmentAware {

    private static ApplicationContext applicationContext;

    private static Environment environment;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        ContextUtil.applicationContext = applicationContext;
    }

    @Override
    public void setEnvironment(Environment environment) {
        ContextUtil.environment = environment;
    }

    public static ApplicationContext getApplicationContext() {
        return applicationContext;
    }

    public static Environment getEnvironment() {
        return environment;
    }
}
```

### 4. logback配置

接下来就是在日志配置中，使用我们上面定义的Appender

`logback-spring.xml`文件内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d [%t] %-5level %logger{36}.%M\(%file:%line\) - %msg%n</pattern>
            <!-- 控制台也要使用UTF-8，不要使用GBK，否则会中文乱码 -->
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <appender name="errorAlarm" class="com.git.hui.demo.mail.util.MailUtil">
        <!--如果只是想要 Error 级别的日志，那么需要过滤一下，默认是 info 级别的，ThresholdFilter-->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
    </appender>


    <!-- 指定项目中某个包，当有日志操作行为时的日志记录级别 -->
    <!-- 级别依次为【从高到低】：FATAL > ERROR > WARN > INFO > DEBUG > TRACE  -->
    <!-- additivity=false 表示匹配之后，不再继续传递给其他的logger-->
    <logger name="com.git.hui" level="DEBUG" additivity="false">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="errorAlarm"/>
    </logger>

    <!-- 控制台输出日志级别 -->
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

### 5. 测试demo

接下来演示一下，是否可以达到我们的预期

```java
@Slf4j
@RestController
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

    @GetMapping("div")
    public String div(int a, int b) {
        try {
            return String.valueOf(a / b);
        } catch (Exception e) {
            log.error("div error! {}/{}", a, b, e);
            return "some error!";
        }
    }
}
```

![](/imgs/210803/00.gif)

### 5.小结

本篇博文主要提供了一个思路，借助logback的扩展机制，来实现错误日志与预警邮件绑定，实现一个简单的应用异常监控

上面这个实现只算是一个雏形，算是抛砖引玉，有更多可以丰富的细节，比如

- 飞书/钉钉通知（借助飞书钉钉的机器来报警，相比较于邮件感知性更高）
- 根据异常类型，做预警的区分
- 更高级的频率限制等

在这里推荐一个我之前开源的预警系统，可以实现灵活预警方案配置，频率限制，重要性升级等

- 一个可扩展的报警系统 [https://github.com/liuyueyi/quick-alarm](https://github.com/liuyueyi/quick-alarm)


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/430-mail-alarm](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/430-mail-alarm)

推荐关联博文

- [SpringBoot 系列之邮件发送姿势介绍](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247486591&idx=1&sn=04f18e2f313abd371947f9818e238067&chksm=fce717d3cb909ec575b8e521843eff04edfcf844e59ca976515bc29d8a23782c4d5d30580d0e&token=908878619&lang=zh_CN#rd)


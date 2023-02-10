---
order: 14
title: 14.thymeleaf foreach踩坑记录
tag: 
  - Thymeleaf
category: 
  - SpringBoot
  - WEB系列
  - 采坑记录
date: 2021-11-13 18:56:17
keywords: springboot thymeleaf
---

话说自从前后端分离之后，前后端放在一起的场景就很少了，最近写个简单的后台，突然踩坑了，使用themeleaf模板渲染时，发现`th:each`来遍历生成表单数据，一直抛异常，提示`Property or field 'xxx' cannot be found on null`

接下来看一下这个问题到底是个什么情况

<!-- more -->

## I. 项目搭建

### 1. 项目依赖

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

开一个web服务用于测试

```xml
<dependencies>
    <!-- 邮件发送的核心依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
</dependencies>
```


配置文件application.yml

```yaml
server:
  port: 8080

spring:
  thymeleaf:
    mode: HTML
    encoding: UTF-8
    servlet:
      content-type: text/html
    cache: false
```

## II. 问题复现与处理

### 1. 场景复现

一个最基础的demo，来演示一下问题

```java
@Controller
public class IndexController {
  public Map<String, Object> newMap(String key, Object val, Object... kv) {
      Map<String, Object> map = new HashMap<>();
      map.put(key, val);
      for (int i = 0; i < kv.length; i += 2) {
          map.put(String.valueOf(kv[i]), kv[i + 1]);
      }
      return map;
  }

  @GetMapping(path = "list")
  public String list(Model model) {
      List<Map> list = new ArrayList<>();
      list.add(newMap("user", "yh", "name", "一灰"));
      list.add(newMap("user", "2h", "name", "2灰"));
      list.add(newMap("user", "3h", "name", "3灰"));
      model.addAttribute("list", list);
      return "list";
  }
}
```

对应的html文件如下(注意，放在资源目录 `templates` 下)

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
</head>
<body>

<div>
    <div th:each="item: ${list}">
        <span th:text="${item.user}"></span>
        &nbsp;&nbsp;
        <span th:text="${item.name}"></span>
    </div>

    <hr/>

    <p th:each="item: ${list}">
        <p th:text="${item.user}"></p>
        &nbsp;&nbsp;
        <p th:text="${item.name}"></p>
    </p>
</div>
</body>
</html>
```

注意上面的模板，有两个each遍历，出现问题的是第二个

![](/imgs/211113/00.jpg)

### 2. 原因说明

上面提示user没有，那么是否是语法问题呢？将html改成下面这个时

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
</head>
<body>

<div>
    <div th:each="item: ${list}">
        <span th:text="${item.user}"></span>
        &nbsp;&nbsp;
        <span th:text="${item.name}"></span>
    </div>
</div>
</body>
</html>
```

![](/imgs/211113/01.jpg)

相同的写法，上面这个就可以，经过多方尝试，发现出现问题的原因居然是`<p>`这个标签

简单来讲，就是`<p>`标签不能使用`th:each`，测试一下其他的标签之后发现`<img>`，`<input>`标签也不能用

那么问题来了，为啥这几个标签不能使用each呢？

这个原因可能就需要去瞅一下实现逻辑了，有知道的小伙伴可以科普一下

## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/)

### 1. 微信公众号: 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


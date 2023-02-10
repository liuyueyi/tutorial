---
order: 16
title: 16.定义接口返回类型的几种方式
tag:
  - xml
category:
  - SpringBoot
  - WEB系列
  - Response
date: 2022-08-16 18:42:37
keywords:
  - SpringBoot
  - WEB
  - XML
  - JSON
---

实现一个web接口返回json数据，基本上是每一个javaer非常熟悉的事情了；那么问题来了，如果我有一个接口，除了希望返回json格式的数据之外，若也希望可以返回xml格式数据可行么？

答案当然是可行的，接下来我们将介绍一下，一个接口的返回数据类型，可以怎么处理

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

注意 `jackson-datafromat-xml`这个依赖，加上这个主要时为了支持返回xml格式的数据

## II. 返回类型设置的多种方式

正常来讲，一个RestController的接口，默认返回的是Json格式数据，当我们引入了上面的xml包之后，会怎样呢？返回的还是json么？

### 1.通过produce设置返回类型

如果一个接口希望返回json或者xml格式的数据，最容易想到的方式就是直接设置`RequestMapping`注解中的produce属性

这个值主要就是用来设置这个接口响应头中的`content-type`； 如我们现在有两个接口，一个指定返回json格式数据，一个指定返回xml格式数据，可以如下写

```java
@RestController
public class IndexRest {

    @Data
    public static class ResVo<T> {
        private int code;
        private String msg;
        private T data;

        public ResVo(int code, String msg, T data) {
            this.code = code;
            this.msg = msg;
            this.data = data;
        }
    }
    @GetMapping(path = "/xml", produces = {MediaType.APPLICATION_XML_VALUE})
    public ResVo<String> xml() {
        return new ResVo<>(0, "ok", "返回xml");
    }

    @GetMapping(path = "/json", produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResVo<String> json() {
        return new ResVo<>(0, "ok", "返回json");
    }
}
```

上面的实现中
- xml接口，指定`produces = application/xml`
- json接口，指定`produces = applicatin/json`

接下来我们访问一下看看返回的是否和预期一致

![](/imgs/220817/00.jpg)

从上面截图也可以看出，xml接口返回的是xml格式数据；json接口返回的是json格式数据

### 2. 通过请求头accept设置返回类型

上面的方式，非常直观，自然我们就会有一个疑问，当接口上不指定produces属性时，直接访问会怎么表现呢？

```java
@GetMapping(path = "/")
public ResVo<String> index() {
    return new ResVo<>(0, "ok", "简单的测试");
}
```

![](/imgs/220817/01.jpg)

请注意上面的截图，两种访问方式返回的数据类型不一致

- curl请求：返回json格式数据
- 浏览器请求：返回 `application/xhtml+xml`响应头的数据（实际上还是xml格式）


那么问题来了，为什么两者的表现形式不一致呢？


对着上面的图再看三秒，会发现主要的差别点就在于请求头`Accept`不同；我们可以通过这个请求头参数，来要求服务端返回我希望的数据类型


如指定返回json格式数据

```bash
curl 'http://127.0.0.1:8080' -H 'Accept:application/xml' -iv

curl 'http://127.0.0.1:8080' -H 'Accept:application/json' -iv
```

![](/imgs/220817/02.jpg)


从上面的执行结果也可以看出，返回的类型与预期的一致；

**说明**

请求头可以设置多种MediaType，用英文逗号分割，后端接口会根据自己定义的produce与请求头希望的mediaType取交集，至于最终选择的顺序则以accept中出现的顺序为准


看一下实际的表现来验证下上面的说法

![](/imgs/220817/03.jpg)


通过请求头来控制返回数据类型的方式可以说是非常经典的策略了，（遵循html协议还有什么好说的呢！）


### 3. 请求参数来控制返回类型

除了上面介绍的两种方式之外，还可以考虑为所有的接口，增加一个根据特定的请求参数来控制返回的类型的方式

比如我们现在定义，所有的接口可以选传一个参数 `mediaType`，如果值为xml，则返回xml格式数据；如果值为json，则返回json格式数据

当不传时，默认返回json格式数据


基于此，我们主要借助mvc配置中的内容协商`ContentNegotiationConfigurer`来实现


```java
@SpringBootApplication
public class Application implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.favorParameter(true)
                // 禁用accept协商方式，即不关心前端传的accept值
//                .ignoreAcceptHeader(true)
                // 哪个放在前面，哪个的优先级就高； 当上面这个accept未禁用时，若请求传的accept不能覆盖下面两种，则会出现406错误
                .defaultContentType(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)
                // 根据传参mediaType来决定返回样式
                .parameterName("mediaType")
                // 当acceptHeader未禁用时，accept的值与mediaType传参的值不一致时，以mediaType的传值为准
                // mediaType值可以不传，为空也行，但是不能是json/xml之外的其他值
                .mediaType("json", MediaType.APPLICATION_JSON)
                .mediaType("xml", MediaType.APPLICATION_XML);
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

上面的实现中，添加了很多注释，先别急；我来逐一进行说明

```java
.parameterName("mediaType")
// 当acceptHeader未禁用时，accept的值与mediaType传参的值不一致时，以mediaType的传值为准
// mediaType值可以不传，为空也行，但是不能是json/xml之外的其他值
.mediaType("json", MediaType.APPLICATION_JSON)
.mediaType("xml", MediaType.APPLICATION_XML);
```

上面这三行代码，主要就是说，现在可以根据传参 mediaType 来控制返回的类型，我们新增一个接口来验证一下

```java
@GetMapping(path = "param")
public ResVo<String> params(@RequestParam(name = "mediaType", required = false) String mediaType) {
    return new ResVo<>(0, "ok", String.format("基于传参来决定返回类型：%s", mediaType));
}
```

我们来看下几个不同的传参表现

```bash
# 返回json格式数据
curl 'http://127.0.0.1:8080/param?mediaType=json' -iv
# 返回xml格式数据
curl 'http://127.0.0.1:8080/param?mediaType=xml' -iv
# 406错误
curl 'http://127.0.0.1:8080/param?mediaType=text' -iv
# 走默认的返回类型，json在前，所以返回json格式数据（如果将xml调整到前面，则返回xml格式数据，主要取决于 `.defaultContentType(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)`）
curl 'http://127.0.0.1:8080/param' -iv
```

![](/imgs/220817/04.jpg)


**疑问：若请求头中传递了Accept或者接口上定义了produce，会怎样?**

当指定了accept时，并且传参中指定了mediaType，则以传参为准

- 如`accept: application/json,application.xml`， 此时`mediaType=json`, 返回json格式
- 如`accept: application/json`, 此时 `mediaTyep=xml`， 返回xml格式
- 如`accept: text/html`，此时`mediaType=xml` ，此时返回的也是xml格式
- 如`accept: text/html`，此时`mediaType`不传时 ，因为无法处理`text/html`类型，所以会出现406
- 如`accept: application/xml`， 但是`mediaType`不传，虽然默认优先是json，此时返回的也是xml格式，与请求头希望的保持一致


但是若传参与produce冲突了，那么就直接406异常，不会选择mediaType设置的类型

- 如`produce = applicatin/json`， 但是 `mediaType=xml`，此时就会喜提406


细心的小伙伴可能发现了上面的配置中，注释了一行 `.ignoreAcceptHeader(true)`，当我们把它打开之后，前面说的Accept请求头可以随意传，我们完全不care，当做没有传这个参数进行处理即可开


### 4.小结

本文介绍了三种方式，控制接口返回数据类型

**方式一**

接口上定义produce, 如 `@GetMapping(path = "p2", produces = {"application/xml", "application/json"})`

注意produces属性值是有序的，即先定义的优先级更高；当一个请求可以同时接受xml/json格式数据时，上面这个定义会确保这个接口现有返回xml格式数据


**方式二**

借助标准的请求头accept，控制希望返回的数据类型；但是需要注意的时，使用这种方式时，要求后端不能设置`ContentNegotiationConfigurer.ignoreAcceptHeader(true)`


在实际使用这种方式的时候，客户端需要额外注意，Accept请求头中定义的MediaType的顺序，是优于后端定义的produces顺序的，因此用户需要将自己实际希望接受的数据类型放在前面，或者干脆就只设置一个


**方式三**

借助`ContentNegotiationConfigurer`实现通过请求参数来决定返回类型，常见的配置方式形如

```java
configurer.favorParameter(true)
        // 禁用accept协商方式，即不关心前端传的accept值
      //                .ignoreAcceptHeader(true)
        // 哪个放在前面，哪个的优先级就高； 当上面这个accept未禁用时，若请求传的accept不能覆盖下面两种，则会出现406错误
        .defaultContentType(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)
        // 根据传参mediaType来决定返回样式
        .parameterName("mediaType")
        // 当acceptHeader未禁用时，accept的值与mediaType传参的值不一致时，以mediaType的传值为准
        // mediaType值可以不传，为空也行，但是不能是json/xml之外的其他值
        .mediaType("json", MediaType.APPLICATION_JSON)
        .mediaType("xml", MediaType.APPLICATION_XML);
```



即添加这个设置之后，最终的表现为：

1. 请求参数指定的返回类型，优先级最高，返回指定参数对应的类型
2. 没有指定参数时，选择defaultContentType定义的默认返回类型与接口 `produce`中支持的求交集，优先级则按照defaultContentType中定义的顺序来选择
3. 没有指定参数时，若此时还有accept请求头，则请求头中定义顺序的优先级高于 defaultContentType， 高于 produce

注意注意：当配置中忽略了AcceptHeader时，`.ignoreAcceptHeader(true)`，上面第三条作废


最后的最后，本文所有的源码可以再下面的git中获取；本文的知识点已经汇总在[《一灰灰的Spring专栏》](https://hhui.top/spring-web/02.response/) 两百多篇的原创系列博文，你值得拥有；我是一灰灰，咱们下次再见


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/204-web-xml-json](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/204-web-xml-json)

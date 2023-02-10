---
order: 15
title: 15.如何支持下划线驼峰互转的传参与返回
tag: 
  - 请求参数
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2022-01-17 19:09:53
keywords: 
  - SpringBoot
  - RequestParam
  - 驼峰
  - 下划线
  - HandlerMethodArgumentResolver
  - SpringBoot系列之Web如何支持下划线驼峰互转的传参与返回
---

> SpringBoot系列之Web如何支持下划线驼峰互转的传参与返回

接下来介绍一个非常现实的应用场景，有些时候后端接口对外定义的传参/返回都是下划线命名风格，但是Java本身是推荐驼峰命名方式的，那么必然就存在一个传参下换线，转换成驼峰的场景；以及在返回时，将驼峰命名的转换成下划线

那么如何支持上面这种应用场景呢?

本文介绍几种常见的手段

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
</dependencies>
```


配置文件application.yml

```yaml
server:
  port: 8080
```

### 2. 需求拆分

接下来为了更方便的理解我们要做的事情，对上面的应用场景进行一些拆分，方便理解

#### 2.1 请求参数解析

对于请求参数，外部传递是下划线命名格式的方式，需要与项目中驼峰命名的对象进行映射，所以这里的问题点就是无法走默认的绑定规则，需要我们进行兼容处理

比如传参是 `user_name = 一灰灰`，但是我们接收的参数是 `userName`


#### 2.2 返回结果处理

返回结果的处理，这里单指返回json对象的场景，一个普通的POJO对象，正常序列化为json字符串时，key实际上与对象的成员名是一致的，而现在则希望将key统一成下划线风格的方式

如，返回一个简单的实体对象

```java
public class ViewDo {
  private Integer userId;
  private string userName;
}
```

对应期待返回的json串为

```json
{
  "user_name" : "一灰灰",
  "user_id" : 110
}
```
## II. 支持方式

为了简化后续的流程，我们这里的传参都确定两个userName + userId，对应项目中的实体类如

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public static class ViewDo {

    private Integer userId;

    private String userName;
}
```

### 1. 请求参数解析

#### 1.1 @RequestParam注解方式

最简单也是最容易想到的方式自然是直接使用`RequestParam`注解，将所有的请求参数都通过它来重命名

```java
@GetMapping(path = "getV3")
public ViewDo getV3(@RequestParam("user_id") Integer userId, @RequestParam("user_name") String userName) {
    String str = "userId: " + userId + " userName: " + userName;
    System.out.println(str);
    return new ViewDo(userId, userName);
}
```

使用上面直接来写参数映射关系的方式属于比较常见的方法了，但是存在一个问题

- 通用性差（每个接口的每个参数都要这么整，如果工资是按照代码来付费的话，那还是可以接收的；否则这个写法，就真的有点难受了）
- 若接口参数定义的是Map、Java bean实体（POJO），这个映射关联就不太好处理了

除了上面这个问题之外，有个不是问题的问题（为什么这么说，且看下面的说法）

- 如果我的接口传参，希望同时接收驼峰和下划线命名的传参（现实中还真有这种神经病似的场景，别问我怎么知道的），上面这个是不行的

#### 1.2 Json传参指定命名策略

上面的case，适用于常见的get请求，post表单传参，然后在接口处一一定义参数；对于post json传参时，我们可以考虑通过定义json序列化的命名策略，来支持下划线与驼峰的互转

比如SpringMVC默认使用的jackson来实现json序列化，那么我们可以直接通过指定jackson的PropertyNamingStrategy来完成

配置文件中 application.yml，添加下面这行

```yaml
spring:
  jackson:
    # 使用jackson进行json序列化时，可以将下划线的传参设置给驼峰的非简单对象成员上；并返回下划线格式的json串
    # 特别注意。使用这种方式的时候，要求不能有自定义的WebMvcConfigurationSupport，因为会覆盖默认的处理方式
    # 解决办法就是 拿到ObjectMapper的bean对象，手动塞入进去
    property-naming-strategy: SNAKE_CASE
```

对应的接口定义如下

```java
/**
 * post json串
 *  curl 'http://127.0.0.1:8080/postV2' -X POST -H 'content-type:application/json' -d '{"user_id": 123, "user_name": "一灰灰"}'
 * @param viewDo
 * @return
 */
@PostMapping(path = "postV2")
public ViewDo postV2(@RequestBody ViewDo viewDo) {
    System.out.println(viewDo);
    return viewDo;
}
```

实际请求之后，看一下效果

![](/imgs/220117/00.jpg)

**注意**

- 使用上面这种配置的方式，需要特比注意的，如果在项目中自己定义了`WebMvcConfigurationSupport`，那么上面的配置将不会生效（至于具体的原因，后面有机会单独说明）

当我们实际的项目中，无法直接使用上面这种配置时，可以考虑使用下面的方式

```java
@SpringBootApplication
public class Application  extends WebMvcConfigurationSupport {
    /**
     * 下面这个设置，可以实现json参数解析/返回时，传入的下划线转驼峰；输出的驼峰转下划线
     * @param converters
     */
    @Override
    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        ObjectMapper objectMapper = converter.getObjectMapper();

        // 设置驼峰标志转下划线
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);

        // 设置格式化内容
        converter.setObjectMapper(objectMapper);
        converters.add(0, converter);
        super.extendMessageConverters(converters);
    }
}
```

使用jackson的命名策略来支持驼峰下划线的转换虽好，但是存在一个非常明显的缺陷

- 它只适用于json传参


#### 1.3 自定义DataBinder

对于非json的传承，比如普通的get请求，post表单传参，然后在接口处通过定义一个POJO参数类来接收，此时又应该怎么处理呢?

比如接口定义如下

```java
/**
 * POJO 对应Spring中的参数转换是 ServletModelAttributeMethodProcessor | RequestParamMethodArgumentResolver
 * @param viewDo
 * @return
 */
@GetMapping(path = "getV5")
public ViewDo getV5(ViewDo viewDo) {
    System.out.println("v5: " + viewDo);
    return viewDo;
}


/**
 *  curl 'http://127.0.0.1:8080/postV1' -X POST -d 'user_id=123&user_name=一灰灰'
 *  注意：非json传参，jackson的配置将不会生效，即上面这个请求是不会实现下划线转驼峰的； 但是返回结果会是下划线的
 * @param viewDo
 * @return
 */
@PostMapping(path = "postV1")
public ViewDo post(ViewDo viewDo) {
    System.out.println(viewDo);
    return viewDo;
}
```

对于上面这种场景，一个想法就是是否可以在ViewDo的成员上，添加一个注解，指定参数名，一如`RequestParam`，不过Spring貌似并没有提供这种支持能力

因此我们可以考虑自己来实现数据绑定，下面提供一个基础的实现, 来演示这种方式改怎么玩（相对完整的基于注解的映射方式，下篇博文介绍）

```java
public class SimpleDataBinder extends ExtendedServletRequestDataBinder {

    public SimpleDataBinder(Object target, String objectName) {
        super(target, objectName);
    }

    @Override
    protected void addBindValues(MutablePropertyValues mpvs, ServletRequest request) {
        super.addBindValues(mpvs, request);
        if (!mpvs.contains("userName")) {
            mpvs.add("userName", getVal(mpvs, "user_name"));
        }
        if (!mpvs.contains("userId")) {
            mpvs.add("userId", getVal(mpvs, "user_id"));
        }
    }

    private Object getVal(MutablePropertyValues mpvs, String key) {
        PropertyValue pv = mpvs.getPropertyValue(key);
        return pv != null ? pv.getValue() : null;
    }
}
```


然后在参数解析中，使用这个DataBinder

```java
public class SimpleArgumentProcessor extends ServletModelAttributeMethodProcessor {
    public SimpleArgumentProcessor(boolean annotationNotRequired) {
        super(annotationNotRequired);
    }

    @Override
    protected void bindRequestParameters(WebDataBinder binder, NativeWebRequest nativeWebRequest) {
        Object target = binder.getTarget();
        SimpleDataBinder dataBinder = new SimpleDataBinder(target, binder.getObjectName());
        super.bindRequestParameters(dataBinder, nativeWebRequest);
    }
}
```

接着就是注册这个参数解析

```java
@SpringBootApplication
public class Application  extends WebMvcConfigurationSupport {
    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new SimpleArgumentProcessor(true));
    }
}
```

再次请求时，可以发现下划线的传参也可以映射到ViewDo对象上(无论是get请求还是post请求，都可以正确映射)

![](/imgs/220117/01.jpg)

### 2.返回结果

对于返回结果，希望返回下划线格式的json串，除了上面介绍到的设置json序列化的命名策略之外，还有下面几种配置方式

#### 2.1 属性注解 @JsonProperty

直接在POJO对象的成员上，指定希望输出的name

```java
public static class ViewDo {
    @JsonProperty("user_id")
    private Integer userId;
    @JsonProperty("user_name")
    private String userName;
}
```

#### 2.2 实体类注解 @JsonNaming

直接在类上添加注解，指定驼峰策略

```java
@JsonNaming(value = PropertyNamingStrategy.SnakeCaseStrategy.class)
public static class ViewDo {
    private Integer userId;
    private String userName;
}
```

#### 2.3 全局配置

上面两种缺点比较明显，不太通用；更通用的选择和前面传参的json序列化配置方式一样，两种姿势

配置文件指定

```yaml
spring:
  jackson:
    # 使用jackson进行json序列化时，可以将下划线的传参设置给驼峰的非简单对象成员上；并返回下划线格式的json串
    # 特别注意。使用这种方式的时候，要求不能有自定义的WebMvcConfigurationSupport，因为会覆盖默认的处理方式
    # 解决办法就是 拿到ObjectMapper的bean对象，手动塞入进去
    property-naming-strategy: SNAKE_CASE
```

前面也说到，上面这种配置可能会失效（比如你设置了自己的WebMvcConfig)，推荐使用下面的方式

```java
public class Application  extends WebMvcConfigurationSupport {
    /**
     * 下面这个设置，可以实现json参数解析/返回时，传入的下划线转驼峰；输出的驼峰转下划线
     * @param converters
     */
    @Override
    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        ObjectMapper objectMapper = converter.getObjectMapper();

        // 设置驼峰标志转下划线
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);

        // 设置格式化内容
        converter.setObjectMapper(objectMapper);
        converters.add(0, converter);
        super.extendMessageConverters(converters);
    }
}
```

### 3. 小结

本文主要介绍了几种实例case，用于实现传参/返回的驼峰与下划线的互转，核心策略，有下面几种

- 传参：`@RequestParam` 指定真正的传参name
- Json传参、返回：通过定义json序列化框架的PropertyNamingStrategy，来实现
- 普通表单传参/get传参，映射POJO时：通过自定义的DataBinder，来实现映射

虽然上面几种姿势，可以满足我们的基本诉求，但是如果我希望实现一个通用的下划线/驼峰互转策略，即不管传参是下划线还是驼峰，都可以正确无误的绑定到接口的参数变量上，可以怎么实现呢？

最后再抛出一个问题，如果接收参数是Map，上面的几种实现姿势会生效么？又可以如何怎么处理map这种场景呢？

## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params-camel](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params-camel)

### 1. 微信公众号: 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


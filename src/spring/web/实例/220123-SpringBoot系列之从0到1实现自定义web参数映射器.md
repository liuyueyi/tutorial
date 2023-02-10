---
order: 8
title: 8.从0到1实现自定义web参数映射器
tag: 
  - 请求参数
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2022-01-23 19:54:25
keywords: 
  - SpringBoot
  - RequestParam
  - 驼峰
  - 下划线
  - HandlerMethodArgumentResolver
  - SpringBoot系列之从0到1实现自定义web参数映射器
---

> SpringBoot系列之从0到1实现自定义web参数映射器

在使用SpringMVC进行开发时，接收请求参数属于基本功，当我们希望将传参与项目中的对象关联起来时，最常见的做法是默认的case（即传参name与我们定义的name保持一致），当存在不一致，需要手动指定时，通常是借助注解`@RequestParam`来实现，但是不知道各位小伙伴是否有发现，它的使用是有缺陷的

- `@RequestParam`不支持配置在类的属性上

如果我们定义一个VO对象来接收传承，这个注解用不了,如当我们定义一个Java bean(pojo)来接收参数时，若是get请求，post表单请求时，这个时候要求传参name与pojo的属性名完全匹配，如果我们有别名的需求场景，怎么整？

最简单的如传参为: `user_id=110&user_name=一灰灰`

而接收参数的POJO为

```java
public class ViewDo {
  private String uesrId;
  private String userName;
}
```

<!-- more -->

接下来本文通过从0到1，手撸一个自定义的web传参映射，带你了解SpringMVC中的参数绑定知识点

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

## II. 别名映射

接下来我们的目的就是希望实现一个自定义的别名注解，来支持传参的别名绑定，核心知识点就是自定义的参数解析器 `HandlerMethodArgumentResolver`

### 0. 知识点概要说明

在下面的实现之前，先简单介绍一下我们要用到的知识点

参数处理类：`HandlerMethodArgumentResolver`，两个核心的接口方法

```java
// 用于判断当前这个是否可以用来处理当前的传参
boolean supportsParameter(MethodParameter parameter);


// 实现具体的参数映射功能，从请求参数中获取对应的传参，然后设置给目标对象
@Nullable
Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception;
```

所以我们的核心逻辑就是实现上面这个接口，然后实现上面的两个方法即可；当然直接实现原始的接口，额外需要处理的内容就稍稍有点多了，我们这里会用到SpringMVC本身提供的两个实现类，进行能力的扩展

- ServletModelAttributeMethodProcessor：用于后续处理POJO类的属性注解
- RequestParamMethodArgumentResolver：用于后续处理方法参数注解

### 1. 自定义注解

自定义的注解，支持挂在类成员上，也支持放在方法参数上

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ParamName {
    /**
     * new name
     */
    String value();
}
```

### 2. 自定义参数处理器

接下来我们就是需要定义上面注解的解析器，鉴于方法参数注解与类的成员注解的处理逻辑的差异性（后面说为啥要区分开）

首先来看一下当方法参数上，有上面注解时，对应的解析类

```java
public class ParamArgumentProcessor extends RequestParamMethodArgumentResolver {
    public ParamArgumentProcessor() {
        super(true);
    }

    // 当参数上拥有 ParanName 注解，且参数类型为基础类型时，匹配
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(ParamName.class) && BeanUtils.isSimpleProperty(parameter.getParameterType());
    }


    // 根据自定义的映射name，从传参中获取对应的value
    @Override
    protected Object resolveName(String name, MethodParameter parameter, NativeWebRequest request) throws Exception {
        ParamName paramName = parameter.getParameterAnnotation(ParamName.class);
        String ans = request.getParameter(paramName.value());
        if (ans == null) {
            return request.getParameter(name);
        }
        return ans;
    }
}
```

上面的实现比较简单，判断是否可以使用当前Resolver的方法实现

- `parameter.hasParameterAnnotation(ParamName.class) && BeanUtils.isSimpleProperty(parameter.getParameterType());`
- 注意上面的实现，两个要求，一是参数注解，二是要求为简单对象（非简单对象则交给下面的Resolver来处理）

其次，另外一个实现方法`resolveName`就很直观了，根据绑定的name获取具体的传参

- 注意：内部还做了一个兼容，当绑定的传参name找不到时，使用变量名来取传参
- 举例说明：
  - 参数定义如 `@ParamName("user_name") String userName`
  - 那么上面这个传参值，会从传参列表中，取`user_name`对应的值，当`user_name`不存在时，则取`userName`对应的值


接下来则是针对参数为POJO的场景，此时我们的自定义参数解析器实现类`ServletModelAttributeMethodProcessor`，具体的实现逻辑如下

```java
public class ParamAttrProcessor extends ServletModelAttributeMethodProcessor {
    private final Map<Class<?>, Map<String, String>> replaceMap = new ConcurrentHashMap<>();

    public ParamAttrProcessor() {
        super(true);
    }

    // 要求参数为非基本类型，且参数的成员上存在@ParamName注解
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        if (!BeanUtils.isSimpleProperty(parameter.getParameterType())) {
            for (Field field : parameter.getParameterType().getDeclaredFields()) {
                if (field.getDeclaredAnnotation(ParamName.class) != null) {
                    return true;
                }
            }
        }
        return false;
    }

    // 主要是使用自定义的DataBinder，给传参增加一些别名映射
    @Override
    protected void bindRequestParameters(WebDataBinder binder, NativeWebRequest nativeWebRequest) {
        Object target = binder.getTarget();
        Class<?> targetClass = target.getClass();
        if (!replaceMap.containsKey(targetClass)) {
            Map<String, String> mapping = analyzeClass(targetClass);
            replaceMap.put(targetClass, mapping);
        }
        Map<String, String> mapping = replaceMap.get(targetClass);
        ParamDataBinder paramNameDataBinder = new ParamDataBinder(target, binder.getObjectName(), mapping);
        super.bindRequestParameters(paramNameDataBinder, nativeWebRequest);
    }


    // 避免每次都去解析targetClass对应的别名定义，在实现中添加一个缓存
    private static Map<String, String> analyzeClass(Class<?> targetClass) {
        Field[] fields = targetClass.getDeclaredFields();
        Map<String, String> renameMap = new HashMap<>();
        for (Field field : fields) {
            ParamName paramNameAnnotation = field.getAnnotation(ParamName.class);
            if (paramNameAnnotation != null && !paramNameAnnotation.value().isEmpty()) {
                renameMap.put(paramNameAnnotation.value(), field.getName());
            }
        }
        if (renameMap.isEmpty()) return Collections.emptyMap();
        return renameMap;
    }
}
```

虽然上面的实现相比较于第一个，代码量要长很多，但是逻辑其实也并不复杂

**supportsParameter** 判断是否可用

- 参数为非基本类型
- 参数至少有一个成员上有注解`@ParamName`

**bindRequestParameters** 请求参数绑定

- 这个方法的核心诉求就是给传参中的key=value，添加一个别名
- 举例说明:
  - 如原始的传参为 `user_name = 一灰灰`
  - 类属性定义如 `@ParamName("user_name") String userName;`
  - 这样，别名映射中，会有一个 `user_name = userName` 的kv存在
  - 然后在DataBinder中，给别名（userName）也添加进去
  
下面就是DataBinder的实现逻辑

```java
public class ParamDataBinder extends ExtendedServletRequestDataBinder {
    private final Map<String, String> renameMapping;
    public ParamDataBinder(Object target, String objectName, Map<String, String> renameMapping) {
        super(target, objectName);
        this.renameMapping = renameMapping;
    }

    @Override
    protected void addBindValues(MutablePropertyValues mpvs, ServletRequest request) {
        super.addBindValues(mpvs, request);
        for (Map.Entry<String, String> entry : renameMapping.entrySet()) {
            String from = entry.getKey();
            String to = entry.getValue();
            if (mpvs.contains(from)) {
                mpvs.add(to, mpvs.getPropertyValue(from).getValue());
            }
        }
    }
}
```

### 3. 注册与测试

最终也是非常重要的一点就是需要注册我们的自定义参数解析器，实现`WebMvcConfigurationSupport`，重载`addArgumentResolvers`方法即可

```java
@SpringBootApplication
public class Application  extends WebMvcConfigurationSupport {
    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new ParamAttrProcessor());
        argumentResolvers.add(new ParamArgumentProcessor());
    }
}
```

最后给一个基本的测试

```java
@RestController
public class RestDemo {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViewDo {
        @ParamName("user_id")
        private Integer userId;
        @ParamName("user_name")
        private String userName;
    }
    
    /**
     * POJO 对应Spring中的参数转换是 ServletModelAttributeMethodProcessor | RequestParamMethodArgumentResolver
     *
     * @param viewDo
     * @return
     */
    @GetMapping(path = "getV5")
    public ViewDo getV5(ViewDo viewDo) {
        System.out.println("v5: " + viewDo);
        return viewDo;
    }

    /**
     * curl 'http://127.0.0.1:8080/postV1' -X POST -d 'user_id=123&user_name=一灰灰'
     * 注意：非json传参，jackson的配置将不会生效，即上面这个请求是不会实现下划线转驼峰的； 但是返回结果会是下划线的
     *
     * @param viewDo
     * @return
     */
    @PostMapping(path = "postV1")
    public ViewDo post(ViewDo viewDo) {
        System.out.println(viewDo);
        return viewDo;
    }
    
    @GetMapping(path = "ano")
    public ViewDo ano(@ParamName("user_name") String userName, @ParamName("user_id") Integer userId) {
        ViewDo viewDo = new ViewDo(userId, userName);
        System.out.println(viewDo);
        return viewDo;
    }
}
```

上面提供了三个接口

- ano：参数为基本类型，通过`@ParamName`定义别名
- getV5: 参数为非简单类型ViewDo，类成员上通过`@ParamName`指定别名映射
- post: 同上，唯一区别在于它是post请求

实测结果如下

![](/imgs/220123/00.jpg)


### 4. 小结

本文主要通过实现自定义的参数映射解析器，来支持自定义的参数别名绑定，虽然内容不多，但其基本实现，则主要利用的是SpringMVC的参数解析这一块知识点，当然本文作为应用篇，主要只是介绍了如何实现自定义的`HandlerMethodArgumentResolver`，当现有的参数解析满足不了我们的诉求时，完全可以仿造上面的实现来实现自己的应用场景（相信也不会太难）

最后抽取一下本文中使用到的知识点

- 如何判断一个类是否为基本对象：`org.springframework.beans.BeanUtils#isSimpleProperty`
- 自定义参数解析器：实现接口 HandlerMethodArgumentResolver
  - 方法1：supportsParameter，判断当前这个解析器是否适用
  - 方法2：resolveArgument，具体的参数解析实现逻辑
- RequestParamMethodArgumentResolver：默认的方法参数解析器，主要用于简单参数类型的映射，内部封装了类型适配相关逻辑
- ServletModelAttributeMethodProcessor：用于默认的POJO/ModelAttribute参数解析


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params-camel](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/202-web-params-camel)


系列博文：

[【WEB系列】如何支持下划线驼峰互转的传参与返回](https://spring.hhui.top/spring-blog/2022/01/17/220117-SpringBoot%E7%B3%BB%E5%88%97%E4%B9%8BWeb%E5%A6%82%E4%BD%95%E6%94%AF%E6%8C%81%E4%B8%8B%E5%88%92%E7%BA%BF%E9%A9%BC%E5%B3%B0%E4%BA%92%E8%BD%AC%E7%9A%84%E4%BC%A0%E5%8F%82%E4%B8%8E%E8%BF%94%E5%9B%9E/)


### 1. 微信公众号: 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


---
order: 4
title: 4.实现后端的接口版本支持（应用篇）
tag: 
  - RequestCondition
  - 应用
category: 
  - SpringBoot
  - WEB系列
  - 应用篇
date: 2019-12-25 10:36:25
keywords: Spring SpringBoot SpringMVC RequestCondition HandlerMapping ApiVersion
---

作为一个主职的后端开发者，在平时的工作中，最讨厌的做的事情可以说是参数校验和接口的版本支持了。对于客户端的同学来说，业务的历史包袱会小很多，当出现不兼容的业务变动时，直接开发新的就好；然而后端就没有这么简单了，历史的接口得支持，新的业务也得支持，吭哧吭哧的新加一个服务接口，url又不能和之前的相同，怎么办？只能在某个地方加一个类似`v1`, `v2`...

那么有没有一种不改变url，通过其他的方式来支持版本管理的方式呢？

> 本文将介绍一种，利用请求头来传递客户端版本，在相同的url中寻找最适合的这个版本请求的接口的实例case

主要用到的知识点为:

- RequestCondition
- RequestMappingHandlerMapping

<!-- more -->

## I. 应用场景

我们希望同一个业务始终用相同的url，即便不同的版本之间业务完全不兼容，通过请求参数中的版本选择最合适的后端接口来响应这个请求

### 1. 约定

需要实现上面的case，首先有两个约定

- 每个请求中必须携带版本参数
- 每个接口都定义有一个支持的版本

### 2. 规则

明确上面两点前提之后，就是基本规则了

**版本定义**

根据常见的三段式版本设计，版本格式定义如下

```
x.x.x
```

- 其中第一个x：对应的是大版本，一般来说只有较大的改动升级，才会改变
- 其中第二个x：表示正常的业务迭代版本号，每发布一个常规的app升级，这个数值+1
- 最后一个x：主要针对bugfix，比如发布了一个app，结果发生了异常，需要一个紧急修复，需要再发布一个版本，这个时候可以将这个数值+1

**接口选择**

通常的web请求都是通过url匹配规则来选择对应响应接口，但是在我们这里，一个url，可能会有多个不同的接口，该怎么选择呢？

- 首先从请求中，获取版本参数 version
- 从所有相同的url接口中，根据接口上定义的版本，找到所有小于等于version的接口
- 在上面满足条件的接口中，选择版本最大的接口来响应请求

## II. 应用实现

明确上面的应用场景之后，开始设计与实现

### 1. 接口定义

首先我们需要一个版本定义的注解，用于标记web服务接口的版本，默认版本好为1.0.0

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Api {

    /**
     * 版本
     *
     * @return
     */
    String value() default "1.0.0";
}
```

其次需要一个版本对应的实体类，注意下面的实现中，默认版本为`1.0.0`，并实现了`Comparable`接口，支持版本之间的比较

```java
@Data
public class ApiItem implements Comparable<ApiItem> {

    private int high = 1;

    private int mid = 0;

    private int low = 0;

    public ApiItem() {
    }

    @Override
    public int compareTo(ApiItem right) {
        if (this.getHigh() > right.getHigh()) {
            return 1;
        } else if (this.getHigh() < right.getHigh()) {
            return -1;
        }

        if (this.getMid() > right.getMid()) {
            return 1;
        } else if (this.getMid() < right.getMid()) {
            return -1;
        }

        if (this.getLow() > right.getLow()) {
            return 1;
        } else if (this.getLow() < right.getLow()) {
            return -1;
        }
        return 0;
    }
}
```


需要一个将string格式的版本转换为ApiItem的转换类，并且支持了默认版本为`1.0.0`的设定

```java
public class ApiConverter {
    public static ApiItem convert(String api) {
        ApiItem apiItem = new ApiItem();
        if (StringUtils.isBlank(api)) {
            return apiItem;
        }

        String[] cells = StringUtils.split(api, ".");
        apiItem.setHigh(Integer.parseInt(cells[0]));
        if (cells.length > 1) {
            apiItem.setMid(Integer.parseInt(cells[1]));
        }

        if (cells.length > 2) {
            apiItem.setLow(Integer.parseInt(cells[2]));
        }
        return apiItem;
    }
}
```

### 2. HandlerMapping接口选择

需要一个url，支持多个请求接口，可以考虑通过`RequestCondition`来实现，下面是具体的实现类

```java
public class ApiCondition implements RequestCondition<ApiCondition> {

    private ApiItem version;

    public ApiCondition(ApiItem version) {
        this.version = version;
    }

    @Override
    public ApiCondition combine(ApiCondition other) {
        // 选择版本最大的接口
        return version.compareTo(other.version) >= 0 ? new ApiCondition(version) : new ApiCondition(other.version);
    }

    @Override
    public ApiCondition getMatchingCondition(HttpServletRequest request) {
        String version = request.getHeader("x-api");
        ApiItem item = ApiConverter.convert(version);
        // 获取所有小于等于版本的接口
        if (item.compareTo(this.version) >= 0) {
            return this;
        }

        return null;
    }

    @Override
    public int compareTo(ApiCondition other, HttpServletRequest request) {
        // 获取最大版本对应的接口
        return other.version.compareTo(this.version);
    }
}
```

虽然上面的实现比较简单，但是有必要注意一下两个逻辑

- `getMatchingCondition`方法中，控制了只有版本小于等于请求参数中的版本的ApiCondition才满足规则
- `compareTo` 指定了当有多个`ApiCoondition`满足这个请求时，选择最大的版本

自定义`RequestMappingHandlerMapping`实现类`ApiHandlerMapping`

```java
public class ApiHandlerMapping extends RequestMappingHandlerMapping {
    @Override
    protected RequestCondition<?> getCustomTypeCondition(Class<?> handlerType) {
        return buildFrom(AnnotationUtils.findAnnotation(handlerType, Api.class));
    }

    @Override
    protected RequestCondition<?> getCustomMethodCondition(Method method) {
        return buildFrom(AnnotationUtils.findAnnotation(method, Api.class));
    }

    private ApiCondition buildFrom(Api platform) {
        return platform == null ? new ApiCondition(new ApiItem()) :
                new ApiCondition(ApiConverter.convert(platform.value()));
    }
}
```

注册

```java
@Configuration
public class ApiAutoConfiguration implements WebMvcRegistrations {

    @Override
    public RequestMappingHandlerMapping getRequestMappingHandlerMapping() {
        return new ApiHandlerMapping();
    }
}
```

基于此，一个实现接口版本管理的微框架已经完成；接下来进入测试环节

## III. 测试

### case1. 方法上添加版本

设计三个接口，一个不加上注解，两外两个添加不同版本的注解

```java
@RestController
@RequestMapping(path = "v1")
public class V1Rest {

    @GetMapping(path = "show")
    public String show1() {
        return "v1/show 1.0.0";
    }

    @Api("1.1.2")
    @GetMapping(path = "show")
    public String show2() {
        return "v1/show 1.1.2";
    }

    @Api("1.1.0")
    @GetMapping(path = "show")
    public String show3() {
        return "v1/show 1.1.0";
    }
}
```

在发起请求时，分别不带上版本，带指定版本，来测试对应的响应


![](/imgs/191225/00.jpg)

- 从上面的截图可以看出，请求头中没有版本时，默认给一个`1.0.0`的版本
- 响应的是小于请求版本的接口中，版本最大的哪一个


### case2. 类版本+方法版本

每个方法上添加版本有点蛋疼，在上面的注解定义中，就支持了类上注解，从实现上也可以看出，当方法和类上都有注解时，选择最大的版本

```java
@Api("2.0.0")
@RestController
@RequestMapping(path = "v2")
public class V2Rest {

    @Api("1.1.0")
    @GetMapping(path = "show")
    public String show0() {
        return "v2/show0 1.1.0";
    }

    @GetMapping(path = "show")
    public String show1() {
        return "v2/show1 2.0.0";
    }

    @Api("2.1.1")
    @GetMapping(path = "show")
    public String show2() {
        return "v2/show2 2.1.1";
    }

    @Api("2.2.0")
    @GetMapping(path = "show")
    public String show3() {
        return "v2/show3 2.2.0";
    }
}
```

根据我们的实现规则，show0和show1都会相应 `<2.1.1` 的版本请求，这个时候会出现冲突；

![](/imgs/191225/01.jpg)

- 从上面的截图中，可以看出来版本小于2.0.0的请求，报的是404错误
- 请求版本小于2.1.1的请求，报的是冲突异常


## IV. 其他

### 0. 项目&相关博文

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-case/201-web-api-version](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-case/201-web-api-version)

**相关博文**

- [SpringBoot 系列教程 web 篇之自定义请求匹配条件 RequestCondition](https://mp.weixin.qq.com/s/8kEODHv5SpxUKbjX2c_ZPg)


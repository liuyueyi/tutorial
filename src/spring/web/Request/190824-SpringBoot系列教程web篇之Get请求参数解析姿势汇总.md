---
order: 1
title: 1.Get请求参数解析姿势汇总
tag: 
  - 请求参数
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2019-08-24 22:07:56
keywords: Spring SpringBoot RequestParam PathVariable 参数解析
---

一般在开发web应用的时候，如果提供http接口，最常见的http请求方式为GET/POST，我们知道这两种请求方式的一个显著区别是GET请求的参数在url中，而post请求可以不在url中；那么一个SpringBoot搭建的web应用可以如何解析发起的http请求参数呢？

下面我们将结合实例汇总一下GET请求参数的几种常见的解析姿势

<!-- more -->

## I. 环境搭建

首先得搭建一个web应用才有可能继续后续的测试，借助SpringBoot搭建一个web应用属于比较简单的活;

创建一个maven项目，pom文件如下

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.7</version>
    <relativePath/> <!-- lookup parent from update -->
</parent>

<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
<repositories>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

添加项目启动类`Application.cass`

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

在演示请求参数的解析实例中，我们使用终端的curl命令来发起http请求（主要原因是截图上传太麻烦，还是终端的文本输出比较方便；缺点是不太直观）

## II. GET请求参数解析

接下来我们正式进入参数解析的妖娆姿势篇，会介绍一下常见的一些case（并不能说包含了所有的使用case）

下面所有的方法都放在 `ParamGetRest` 这个Controller中

```java
@RestController
@RequestMapping(path = "get")
public class ParamGetRest {
}
```

### 1. HttpServletRequest

直接使用`HttpServletRequest`来获取请求参数，属于比较原始，但是灵活性最高的使用方法了。

常规使用姿势是方法的请求参数中有一个`HttpServletRequest`，我们通过`ServletRequest#getParameter(参数名)`来获取具体的请求参数，下面演示返回所有请求参数的case

```java
@GetMapping(path = "req")
public String requestParam(HttpServletRequest httpRequest) {
    Map<String, String[]> ans = httpRequest.getParameterMap();
    return JSON.toJSONString(ans);
}
```

测试case，注意下使用curl请求参数中有中文时，进行了url编码（后续会针对这个问题进行说明）

```bash
➜  ~ curl 'http://127.0.0.1:8080/get/req?name=yihuihiu&age=19'
{"name":["yihuihiu"],"age":["19"]}

➜  ~ curl 'http://127.0.0.1:8080/get/req?name=%E4%B8%80%E7%81%B0%E7%81%B0&age=19'
{"name":["一灰灰"],"age":["19"]}%
```

使用HttpServletRequest获取请求参数，还有另外一种使用case，不通过参数传递的方式获取Request实例，而是借助`RequestContextHolder`；这样的一个好处就是，假设我们想写一个AOP，拦截GET请求并输出请求参数时，可以通过下面这种方式来处理

```java
@GetMapping(path = "req2")
public String requestParam2() {
    HttpServletRequest request =
            ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    String name = request.getParameter("name");
    return "param Name=" + name;
}
```

测试case

```bash
➜  ~ curl 'http://127.0.0.1:8080/get/req2?name=%E4%B8%80%E7%81%B0%E7%81%B0&age=19'
param Name=一灰灰%
```

---

### 2. 方法参数

这种解析方式比较厉害了，将GET参数与方法的参数根据参数名进行映射，从感官上来看，就像是直接调用这个一样

```java
@GetMapping(path = "arg")
public String argParam(String name, Integer age) {
    return "name: " + name + " age: " + age;
}
```

针对上面提供的方式，我们的测试自然会区分为下面几种，看下会怎样

- 正好两个参数，与定义一直
- 缺少一个请求参数
- 多一个请求参数
- 参数类型不一致

```bash
# 参数解析正常
➜  ~ curl 'http://127.0.0.1:8080/get/arg?name=%E4%B8%80%E7%81%B0%E7%81%B0&age=19'
name: 一灰灰 age: 19%

# 缺少一个参数时，为null
➜  ~ curl 'http://127.0.0.1:8080/get/arg?name=%E4%B8%80%E7%81%B0%E7%81%B0'
name: 一灰灰 age: null% 

# 多了一个参数，无法被解析
➜  ~ curl 'http://127.0.0.1:8080/get/arg?name=%E4%B8%80%E7%81%B0%E7%81%B0&age=19&id=10'
name: 一灰灰 age: 19%                                                              

# 类型不一致，500 
➜  ~ curl 'http://127.0.0.1:8080/get/arg?name=%E4%B8%80%E7%81%B0%E7%81%B0&age=haha' -i
HTTP/1.1 500
Content-Length: 0
Date: Sat, 24 Aug 2019 01:45:14 GMT
Connection: close
```

从上面实际的case可以看出，利用方法参数解析GET传参时，实际效果是：

- 方法参数与GET传参，通过参数签名进行绑定
- 方法参数类型，需要与接收的GET传参类型一致
- 方法参数非基本类型时，若传参没有，则为null；（也就是说如果为基本类型，无法转null，抛异常）
- 实际的GET传参可以多于方法定义的参数


接下来给一个数组传参解析的实例

```java
@GetMapping(path = "arg2")
public String argParam2(String[] names, int size) {
    return "name: " + (names != null ? Arrays.asList(names) : "null") + " size: " + size;
}
```

测试case如下，传数组时参数值用逗号分隔；基本类型，必须传参，否则解析异常

```bash
➜  ~ curl 'http://127.0.0.1:8080/get/arg2?name=yihui,erhui&size=2'
name: null size: 2%

➜  ~ curl 'http://127.0.0.1:8080/get/arg2?name=yihui,erhui' -i
HTTP/1.1 500
Content-Length: 0
Date: Sat, 24 Aug 2019 01:53:30 GMT
Connection: close
```

---

### 3. RequestParam 注解

这种方式看起来和前面有些相似，但更加灵活，我们先看一下注解

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequestParam {
  // 指定请求参数名
	String value() default "";
	// 指定请求参数名
	String name() default "";
	// true表示发起请求时这个参数必须存在
	boolean required() default true;
	String defaultValue() default ValueConstants.DEFAULT_NONE;
}
```

有两个参数需要注意，一个是name表示这个参数与GET传参的哪个关联；required表示这个参数是否可选

下面是一个简单的使用方式

```java
@GetMapping(path = "ano")
public String anoParam(@RequestParam(name = "name") String uname,
        @RequestParam(name = "age", required = false) Integer age,
        @RequestParam(name = "uids", required = false) Integer[] uids) {
    return "name: " + uname + " age: " + age + " uids: " + (uids != null ? Arrays.asList(uids) : "null");
}
```

测试如下:

```bash
# 三个参数全在
➜  ~ curl 'http://localhost:8080/get/ano?name=%E4%B8%80%E7%81%B0%E7%81%B0blog&age=18&uids=1,3,4'
name: 一灰灰blog age: 18 uids: [1, 3, 4]%

# age不传
➜  ~ curl 'http://localhost:8080/get/ano?name=%E4%B8%80%E7%81%B0%E7%81%B0blog&uids=1,3,4'
name: 一灰灰blog age: null uids: [1, 3, 4]% 

# 必选参数name不传时
➜  ~ curl 'http://localhost:8080/get/ano?uids=1,3,4' -i
HTTP/1.1 500
Content-Length: 0
Date: Sat, 24 Aug 2019 13:09:07 GMT
Connection: close
```


使用`RequestParam`注解时，如果指定了`name/value`，这个参数就与指定的GETGET传参关联；如果不指定时，则根据参数签名来关联

下面给出两个更有意思的使用方式，一个是枚举参数解析，一个是Map容纳参数，一个是数组参数解析

```java
public enum TYPE {
    A, B, C;
}

@GetMapping(path = "enum")
public String enumParam(TYPE type) {
    return type.name();
}

@GetMapping(path = "enum2")
public String enumParam2(@RequestParam TYPE type) {
    return type.name();
}

@GetMapping(path = "mapper")
public String mapperParam(@RequestParam Map<String, Object> params) {
    return params.toString();
}

// 注意下面这个写法，无法正常获取请求参数，这里用来对比列出
@GetMapping(path = "mapper2")
public String mapperParam2(Map<String, Object> params) {
    return params.toString();
}


@GetMapping(path = "ano1")
public String anoParam1(@RequestParam(name = "names") List<String> names) {
    return "name: " + names;
}

// 注意下面这个写法无法正常解析数组
@GetMapping(path = "arg3")
public String anoParam2(List<String> names) {
    return "names: " + names;
}
```

测试case如下

```bash
➜  ~ curl 'http://localhost:8080/get/enum?type=A'
A%

➜  ~ curl 'http://localhost:8080/get/enum2?type=A'
A%

➜  ~ curl 'http://localhost:8080/get/mapper?type=A&age=3'
{type=A, age=3}%

➜  ~ curl 'http://localhost:8080/get/mapper2?type=A&age=3'
{}%

➜  ~ curl 'http://localhost:8080/get/ano1?names=yi,hui,ha'
name: [yi, hui, ha]%

➜  ~ curl 'http://localhost:8080/get/arg3?names=yi,hui,ha' -i
HTTP/1.1 500
Content-Length: 0
Date: Sat, 24 Aug 2019 13:50:55 GMT
Connection: close
```

从测试结果可以知道：

- GET传参映射到枚举时，根据`enum.valueOf()`来实例的
- 如果希望使用Map来容纳所有的传参，需要加上注解`@RequestParam`
- 如果参数为List类型，必须添加注解`@RequestParam`；否则用数组来接收

---

### 4. PathVariable

从请求的url路径中解析参数，使用方法和前面的差别不大

```java
@GetMapping(path = "url/{name}/{index}")
public String urlParam(@PathVariable(name = "name") String name,
        @PathVariable(name = "index", required = false) Integer index) {
    return "name: " + name + " index: " + index;
}
```

上面是一个常见的使用方式，对此我们带着几个疑问设计case

- 只有name没有index，会怎样？
- 有name，有index，后面还有路径，会怎样？

```bash
➜  ~ curl http://127.0.0.1:8080/get/url/yihhuihui/1
name: yihhuihui index: 1%

➜  ~ curl 'http://127.0.0.1:8080/get/url/yihhuihui' -i
HTTP/1.1 500
Content-Length: 0
Date: Sat, 24 Aug 2019 13:27:08 GMT
Connection: close

➜  ~ curl 'http://127.0.0.1:8080/get/url/yihhuihui/1/test' -i
HTTP/1.1 500
Content-Length: 0
Date: Sat, 24 Aug 2019 13:27:12 GMT
Connection: close
```

从path中获取参数时，对url有相对严格的要求，注意使用

---

### 5. POJO

这种case，我个人用得比较多，特别是基于SpringCloud的生态下，借助Feign来调用第三方微服务，可以说是很舒爽了；下面看一下这种方式的使用姿势

首先定义一个POJO

```java
@Data
public class BaseReqDO implements Serializable {
    private static final long serialVersionUID = 8706843673978981262L;

    private String name;

    private Integer age;

    private List<Integer> uIds;
}
```

提供一个服务

```java
@GetMapping(path = "bean")
public String beanParam(BaseReqDO req) {
    return req.toString();
}
```

POJO中定义了三个参数，我们再测试的时候，看一下这些参数是否必选

```bash
# GET传参与POJO中成员名进行关联
➜  ~ curl 'http://127.0.0.1:8080/get/bean?name=yihuihui&age=18&uIds=1,3,4'
BaseReqDO(name=yihuihui, age=18, uIds=[1, 3, 4])%

# 没有传参的属性为null；因此如果POJO中成员为基本类型，则参数必传
➜  ~ curl 'http://127.0.0.1:8080/get/bean?name=yihuihui&age=18'
BaseReqDO(name=yihuihui, age=18, uIds=null)%
```


## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/202-web-params](https://github.com/liuyueyi/spring-boot-demo/blob/master/spring-boot/202-web-params)


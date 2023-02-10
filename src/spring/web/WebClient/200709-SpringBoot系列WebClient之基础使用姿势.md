---
order: 1
title: 1.基础使用姿势
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-07-09 09:22:09
keywords: SpringBoot WebFlux WebClient 异步请求
---

前面在介绍使用`AsyncRestTemplate`来实现网络异步请求时，当时提到在Spring5+之后，建议通过WebClient来取代AsyncRestTemplate来实现异步网络请求；

那么WebClient又是一个什么东西呢，它是怎样替代`AsyncRestTemplate`来实现异步请求的呢，接下来我们将进入Spring Web工具篇中，比较重要的WebClient系列知识点，本文为第一篇，基本使用姿势一览

<!-- more -->

## I. 项目环境

我们依然采用SpringBoot来搭建项目，版本为 `2.2.1.RELEASE`, `maven3.2`作为构建工具，`idea`作为开发环境

### 1. pom依赖

SpringBoot相关的依赖就不贴出来了，有兴趣的可以查看源码，下面是关键依赖

```xml
<dependencies>
    <!-- 请注意这个引入，是最为重要的 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>
```

请注意一下上面的两个依赖包，对于使用`WebClient`，主要需要引入`spring-boot-starter-webflux`包

### 2. 测试REST接口

接下来我们直接在这个项目中写几个用于测试的REST接口，因为项目引入的webflux的依赖包，所以我们这里也采用webflux的注解方式，新增用于测试的GET/POST接口

> 对于WebFlux用法不太清楚的小伙伴也没有关系，WebClient的发起的请求，后端是基于传统的Servlet也是没有问题的；关于WebFlux的知识点，将放在WebClient系列博文之后进行介绍

```java
@Data
public class Body {
    String name;
    Integer age;
}

@RestController
public class ReactRest {

    @GetMapping(path = "header")
    public Mono<String> header(@RequestHeader(name = "User-Agent") String userAgent,
            @RequestHeader(name = "ck", required = false) String cookie) {
        return Mono.just("userAgent is: [" + userAgent + "] ck: [" + cookie + "]");
    }

    @GetMapping(path = "get")
    public Mono<String> get(String name, Integer age) {
        return Mono.just("req: " + name + " age: " + age);
    }

    @GetMapping(path = "mget")
    public Flux<String> mget(String name, Integer age) {
        return Flux.fromArray(new String[]{"req name: " + name, "req age: " + age});
    }


    /**
     * form表单传参，映射到实体上
     *
     * @param body
     * @return
     */
    @PostMapping(path = "post")
    public Mono<String> post(Body body) {
        return Mono.just("post req: " + body.getName() + " age: " + body.getAge());
    }
    
    // 请注意，这种方式和上面的post方法两者不一样，主要区别在Content-Type
    @PostMapping(path = "body")
    public Mono<String> postBody(@RequestBody Body body) {
        return Mono.just("body req: " + body);
    }
}
```


针对上面的两个POST方法，虽然参数都是Body，但是一个有`@RequestBody`，一个没有，这里需要额外注意


从下图也可以看出，两者的区别之处

![](/imgs/200709/00.jpg)

## II. WebClient使用说明

接下来我们将进入WebClient的使用说明，主要针对最常见的GET/POST请求姿势进行实例展示，目标是看完下面的内容之后，可以愉快的进行**最基本**（手动加强语气）的GET/POST请求发送

以下所有内容，参考or启发与官方文档: [https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-client](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-client)

### 1. WebClient创建姿势

一般有三种获得WebClient的方式，基于`WebClient#create`创建默认的WebClient，基于`WebClient#builder`创建有自定义需求的WebClient，基于已有的`webclient#mutate`创建

#### a. create方式

这种属于最常见，也是最基础的创建方式，通常有两种case

- `WebClient.create()`
- `WebClient.create(String baseUrl)`：与上面一个最主要的区别在于指定了baseUrl，后面再发起的请求，就不需要重复这个baseUrl了；
  - 举例说明：baseUrl指定为`http://127.0.0.1:8080`；那么后面的请求url，直接填写`/get`, `/header`, `/post`这种path路径即可

下面给出一个实例说明

```java
// 创建WebClient实例
WebClient webClient= WebClient.create();
// 发起get请求，并将返回的数据格式转换为String；因为是异步请求，所以返回的是Mono包装的对象
Mono<String> ans = webClient.get().uri("http://127.0.0.1:8080/get?name=一灰灰&age=18").retrieve().bodyToMono(String
        .class);
ans.subscribe(s -> System.out.println("create return: " + s));
```

#### b. builder方式

builder方式最大的区别在于它可以为`WebClient` "赋能", 比如我们希望所有的请求都有通用的请求头、cookie等，就可以通过`builder`的方式，在创建`WebClient`的时候就进行指定

官方支持的可选配置如下：

- `uriBuilderFactory`: Customized UriBuilderFactory to use as a base URL.
- `defaultHeader`: Headers for every request.
- `defaultCookie`: Cookies for every request.
- `defaultRequest`: Consumer to customize every request.
- `filter`: Client filter for every request.
- `exchangeStrategies`: HTTP message reader/writer customizations.
- `clientConnector`: HTTP client library settings.

> 关于上面这些东西有啥用，怎么用，会在后续的系列博文中逐一进行介绍，这里就不详细展开；有兴趣的小伙伴可以关注收藏一波

给出一个设置默认Header的实例

```java
webClient = WebClient.builder().defaultHeader("User-Agent", "WebClient Agent").build();
ans = webClient.get().uri("http://127.0.0.1:8080/header").retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("builderCreate with header return: " + s));
```

#### c. mutate方式

这种方式主要是在一个已经存在的`WebClient`基础上，再创建一个满足自定义需求的`WebClient`

为什么要这样呢？

- 因为WebClient一旦创建，就是不可修改的

下面给出一个在builder创建基础上，再添加cookie的实例

```java
// 请注意WebClient创建完毕之后，不可修改，如果需要设置默认值，可以借助 mutate 继承当前webclient的属性，再进行扩展
webClient = webClient.mutate().defaultCookie("ck", "--web--client--ck--").build();
ans = webClient.get().uri("http://127.0.0.1:8080/header").retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("webClient#mutate with cookie return: " + s));
```

#### d. 测试输出

查看项目源码的小伙伴，会看到上面三个代码片段是在同一个方法内部，测试输出如下

![](/imgs/200709/01.jpg)

你会看到一个有意思的地方，第一种基础的创建方式输出在第二种之后，这个是没有问题的哈（有疑问的小伙伴可以看一下文章开头，我们介绍WebClient的起因是啥）

### 2. GET请求

上面其实已经给出了GET的请求姿势，一般使用姿势也比较简单，我们需要重点关注一下这个传参问题

常见的使用姿势

```java
webClient.get().uri(xxx).retrieve().bodyToMono/bodyToFlux
```

get的传参，除了在uri中直接写死之外，还有几种常见的写法

#### a. uri参数

**可变参数**

查看源码的小伙伴，可以看到uri方法的接口声明为一个可变参数，所以就有一种uri用占位`{}`表示参数位置，后面的参数对应参数值的时候用方式

```java
WebClient webClient = WebClient.create("http://127.0.0.1:8080");

Mono<String> ans = webClient.get().uri("/get?name={1}", "一灰灰").retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("basic get with one argument res: " + s));

// p1对应后面第一个参数 "一灰灰"  p2 对应后面第二个参数 18
ans = webClient.get().uri("/get?name={p1}&age={p2}", "一灰灰", 18).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("basic get with two arguments res: " + s));
```

请注意，上面两个参数的case中，p1对应的是`一灰灰`，p2对应的是`18`；这里的p1和p2可以替换为任意的其他字符，它们是按照顺序进行填充的，即第一个参数值填在第一个`{}`坑位


**map参数映射**

另外一种方式就是通过map来绑定参数名与参数值之间的映射关系

```java
// 使用map的方式，来映射参数
Map<String, Object> uriVariables = new HashMap<>(4);
uriVariables.put("p1", "一灰灰");
uriVariables.put("p2", 19);

Flux<String> fAns =
        webClient.get().uri("/mget?name={p1}&age={p2}", uriVariables).retrieve().bodyToFlux(String.class);
fAns.subscribe(s -> System.out.println("basic mget return: " + s));
```

#### b. 获取ResponseEntity

请仔细观察上面的使用姿势，调用了`retrieve()`方法，这个主要就是用来从返回结果中“摘出”`responseBody`，那么如果我们希望后去返回的请求头，返回的状态码，则需要将这个方法替换为`exchange()`

下面给出一个获取返回的请求头实例

```java
// 获取请求头等相关信息
Mono<ResponseEntity<String>> response = webClient.get().uri("/get?name={p1}&age={p2}", "一灰灰", 18).exchange()
        .flatMap(r -> r.toEntity(String.class));
response.subscribe(
        entity -> System.out.println("res headers: " + entity.getHeaders() + " body: " + entity.getBody()));
```

和前面的时候姿势大同小异，至于flatMap这些知识点会放在后续的WebFlux中进行介绍，这里知道它是用来ResponseBody格式转换关键点即可

#### c. 测试返回

测试输出结果如下（当然实际输出顺序和上面定义的先后也没有什么关系）

![](/imgs/200709/02.jpg)

### 3. POST请求

对于post请求，我们一般最长关注的就是基本的表单传参和json body方式传递，下面分别给与介绍

#### a. 表单参数

借助`MultiValueMap`来保存表单参数用于提交

```java
WebClient webClient = WebClient.create("http://127.0.0.1:8080");

// 通过 MultiValueMap 方式投递form表单
MultiValueMap<String, String> formData = new LinkedMultiValueMap<>(4);
formData.add("name", "一灰灰Blog");
formData.add("age", "18");

// 请注意，官方文档上提示，默认的ContentType就是"application/x-www-form-urlencoded"，所以下面这个contentType是可以不显示设置的
Mono<String> ans = webClient.post().uri("/post")
        // .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .bodyValue(formData).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("post formData ans: " + s));
```

上面注释了一行`contentType(MediaType.APPLICATION_FORM_URLENCODED)`，因为默认的ContentType就是这个了，所以不需要额外指定（当然手动指定也没有任何毛病）

除了上面这种使用姿势之外，在官方教程上，还有一种写法，特别注意下面这种写法的传参是用的`body`，而上面是`bodyValue`，千万别用错，不然...

```java
// 请注意这种方式与上面最大的区别是 body 而不是 bodyValue
ans = webClient.post().uri("/post").body(BodyInserters.fromFormData(formData)).retrieve()
        .bodyToMono(String.class);
ans.subscribe(s -> System.out.println("post2 formData ans: " + s));
```

#### b. json body传参

post一个json串，可以说是比较常见的case了，在WebClient中，使用这种方式特别特别简单，感觉比前面那个还方便

- 指定ContentType
- 传入Object对象

```java
// post body
Body body = new Body();
body.setName("一灰灰");
body.setAge(18);
ans = webClient.post().uri("/body").contentType(MediaType.APPLICATION_JSON).bodyValue(body).retrieve()
        .bodyToMono(String.class);
ans.subscribe(s -> System.out.println("post body res: " + s));
```

#### c. 测试输出

![](/imgs/200709/03.jpg)

### 4. 小结

本文为WebClient系列第一篇，介绍WebClient的基本使用姿势，当然看完之后，发起GET/POST请求还是没有什么问题的；但是仅限于此嘛？

- builder创建方式中，那些可选的条件都是啥，有什么用，什么场景下会用呢？
- 请求超时时间可设置么？
- 可以同步阻塞方式获取返回结果嘛？
- 代理怎么加
- `event-stream`返回方式的数据怎么处理
- 如何上传文件
- Basic Auth身份鉴权
- 异步线程池可指定么，可替换为自定义的么
- 返回非200状态码时，表现如何，又该如何处理
- ....

后续的系列博文将针对上面提出or尚未提出的问题，一一进行介绍，看到的各位大佬按按鼠标点赞收藏评论关注加个好友呗

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)


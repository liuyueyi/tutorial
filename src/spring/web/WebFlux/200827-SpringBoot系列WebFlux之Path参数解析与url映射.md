---
order: 3
title: 3.Path参数解析与url映射
tag: 
  - WebFlux
category: 
  - SpringBoot
  - WEB系列
  - WebFlux
date: 2020-08-27 08:26:56
keywords: WebFlux PathVariable 参数解析 path路径 url映射 url匹配
---

异步、反应式、函数式编程，近来可以说是逐渐主流了；Spring5通过Reactor增加了对反应式编程的支持，而Spring WebFlux不同于以往的web框架，作为一个非阻塞异步web框架，可以充分的利用多核CPU硬件资源，提供更强的并发支持；Spring官方对WebFlux的支持非常友好，基本上对于惯于Spring WEB的java开发者，可以很简单的迁移过来

接下来我们将进入WebFlux系列教程，努力使用最简明的语言，来介绍一下WebFlux的基本玩法，让各位小伙伴可以顺畅的切换和使用WebFlux来体验反应式编程的魅力

本文将主要介绍WebFlux提供web接口时的url匹配，以及对应的path参数解析

<!-- more -->

## I. 项目环境 

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

### 1. 依赖

使用WebFlux，最主要的引入依赖如下（省略掉了SpringBoot的相关依赖，如对于如何创建SpringBoot项目不太清楚的小伙伴，可以关注一下我之前的博文）

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>
```

## II. Path匹配与参数解析

> 下面所有内容基于官方文档完成: [https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-ann-requestmapping-uri-templates](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-ann-requestmapping-uri-templates)

下面的示例主要是基于注解的方式，基本知识点和SpringWeb没有太大的区别（至于函数式的用法，后面会专门介绍）

### 1. 基本path参数获取

path参数，举例如: `http://127.0.0.1:8080/name/test`中`name`和`test`就算是path参数，我们主要是借助`@PathVariable`来获取

一个具体实例

```java
@RestController
@RequestMapping(path = "path")
public class PathAction {

    /**
     * 最基本的path获取方式
     *
     * @param index
     * @return
     */
    @GetMapping(path = "/basic/{index}")
    public Mono<String> basic(@PathVariable(name = "index") int index) {
        return Mono.just("path index: " + index);
    }
}
```

针对上面的case，我们简单的设计了三个访问case，具体结果如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/basic/1'
path index: 1%

➜  ~ curl 'http://127.0.0.1:8080/path/basic/1/2'
{"timestamp":"2020-08-26T13:35:26.221+0000","path":"/path/basic/1/2","status":404,"error":"Not Found","message":null,"requestId":"8256bf73"}%

➜  ~ curl 'http://127.0.0.1:8080/path/basic/'
{"timestamp":"2020-08-26T13:35:32.196+0000","path":"/path/basic/","status":404,"error":"Not Found","message":null,"requestId":"eeda1111"}%
```

请注意上面的输出，`/basic/{index}` 只能匹配单级的path路径参数，而且上面的写法中，这级path路径必须存在

查看`PathVariable`注解可以看到里面有一个`required`属性，如果设置为false，会怎样呢

```java
@GetMapping(path = "/basic2/{index}")
public Mono<String> basic2(@PathVariable(name = "index", required = false) Integer index) {
    return Mono.just("basic2 index: " + index);
}
```

测试case如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/basic2/'
{"timestamp":"2020-08-26T13:41:40.100+0000","path":"/path/basic2/","status":404,"error":"Not Found","message":null,"requestId":"b2729e2c"}%

➜  ~ curl 'http://127.0.0.1:8080/path/basic2/22'
basic2 index: 22%


➜  ~ curl 'http://127.0.0.1:8080/path/basic2/22/3'
{"timestamp":"2020-08-26T13:41:44.400+0000","path":"/path/basic2/22/3","status":404,"error":"Not Found","message":null,"requestId":"0b3f173c"}%
```

从上面的实际case，也可以看出来，级别这个属性设置为false，但是url路径依然需要正确匹配,多一级和少一级都不行

### 2. 多path参数

上面只有一个path参数，如果有多个参数，也比较简单

```java
/**
 * 多个参数的场景
 *
 * @param index
 * @param order
 * @return
 */
@GetMapping(path = "/mbasic/{index}/{order}")
public Mono<String> mbasic(@PathVariable(name = "index") int index, @PathVariable(name = "order") String order) {
    return Mono.just("mpath arguments: " + index + " | " + order);
}
```

测试case如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/mbasic/1/asc'
mpath arguments: 1 | asc%
```

### 3. 部分path参数匹配

上面的两个case，都是完整的匹配某一级路径，下面介绍部分匹配的case

```java
/**
 * 路径中的部分内容匹配
 *
 * - /part/test.txt -> name = test
 * - /part/a/test.txt -> 不匹配
 *
 * @param name
 * @return
 */
@GetMapping(path = "/part/{name}.txt")
public Mono<String> part(@PathVariable(name = "name") String name) {
    return Mono.just("part path argument: " + name);
}
```

请注意上面的path路径，后缀是`.txt`，如下面的实例中`part/hello.txt`中那么对应的就是`hello`

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/part/hello.txt'
part path argument: hello%

➜  ~ curl 'http://127.0.0.1:8080/path/part/hello.tx'
{"timestamp":"2020-08-26T13:47:49.121+0000","path":"/path/part/hello.tx","status":404,"error":"Not Found","message":null,"requestId":"1075d683"}%
```

### 4. 正则匹配

接下来更高端的path参数匹配来了，支持一些简单的正则，如我们希望对`spring-web-3.0.5.jar`这段path路径进行解析，希望将`spring-web`作为`name`, `3.0.5`作为`version`，`.jar`作为`ext`

因此我们的rest接口写法可以如下

```java
/**
 * 正则匹配
 *
 * /path/path/pattern/spring-web-3.0.5.jar  -> name = spring-web,  version=3.0.5,  ext=.jar
 *
 * @return
 */
@GetMapping(path = "/pattern/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
public Mono<String> urlPattern(@PathVariable(name = "name") String name,
        @PathVariable(name = "version") String version, @PathVariable(name = "ext") String ext) {
    return Mono.just("pattern arguments name=" + name + " version=" + version + " ext=" + ext);
}
```

### 5. 多级path参数匹配

注意上面的所有写法，都有一个特点，那就是只能针对单级的path路径进行全/部分匹配（本文中将path路径中`//`之间作为一级），那么如果我希望我的path参数可以匹配多级，可以怎么办

- 如 `/path/name/hello` 请求路径中，我希望将 `/name/hello` 作为一个path参数

针对上面的场景，我们主要是借助`{*name}`方式来处理，注意这个参数名前面的*号

```java
/**
 * 匹配:
 *
 * - /path/pattern2  -> name == ""
 * - /path/pattern2/hello  -> name == /hello
 * - /path/pattern2/test/hello -> name = /test/hello
 *
 * @param name
 * @return
 */
@GetMapping(path = "/pattern2/{*name}")
public Mono<String> pattern2(@PathVariable(name = "name") String name) {
    return Mono.just("pattern2 argument: " + name);
}
```

测试case如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/pattern2'
pattern2 argument: %

➜  ~ curl 'http://127.0.0.1:8080/path/pattern2/hello'
pattern2 argument: /hello%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern2/hello/world'
pattern2 argument: /hello/world%
```


### 6. 路径匹配

前面介绍的是path参数解析，接下来我们简单的看一下最常见的三种路径匹配方式

#### a. *

一个星号，表示匹配0个or1个单级path路径

```java
/**
 * 单个*号，只能匹配一级目录，注意这种方式与上面的 pattern2 之间的区别
 *
 * 可以匹配:
 *
 * - /path/pattern3/hello
 * - /path/pattern3
 *
 * 不能匹配
 *
 * - /path/pattern3/hello/1
 *
 * @return
 */
@GetMapping(path = "/pattern3/*")
public Mono<String> pattern3() {
    return Mono.just("pattern3 succeed!");
}
```

实测case如下

```bash
# 请注意，这里是没有/结尾的
➜  ~ curl 'http://127.0.0.1:8080/path/pattern3'
{"timestamp":"2020-08-27T00:01:20.703+0000","path":"/path/pattern3","status":404,"error":"Not Found","message":null,"requestId":"c88f5066"}%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern3/'
pattern3 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern3/a'
pattern3 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern3/a/b'
{"timestamp":"2020-08-27T00:01:18.144+0000","path":"/path/pattern3/a/b","status":404,"error":"Not Found","message":null,"requestId":"203dc7d4"}%
```

请注意上面的实例，`/path/pattern3` 访问404, 而`/path/pattern3/`是可以的，唯一的区别就是多了一个后缀`/`

- why? 
- 是因为path路径的星号前面有一个`/`导致的么？

接下来我们再设计一个case，将`*`前面的`/`干掉，再测试一下

```java
@GetMapping(path = "/pattern33**")
public Mono<String> pattern33() {
    return Mono.just("pattern33 succeed!");
}
```

再次测试，结果如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/pattern3311'
pattern33 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern33/11'
{"timestamp":"2020-08-27T00:05:51.236+0000","path":"/path/pattern33/11","status":404,"error":"Not Found","message":null,"requestId":"d8cbd546"}%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern33'
pattern33 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern331/'
pattern33 succeed!%
```

借助前面两个case，我们基本上可以看出`*`的作用

- `*`前面的完全匹配
  - 比如`/pattern3/*`，那么访问的path路径前缀必须是`/pattern3/`
- `*`最多表示单级路径，简单来讲就是`*`所代表的的位置中不能出现`/x`
  - 比如`/pattern33**`，那么`/pattern331/`可以匹配，但是`/pattern331/1`不能

#### b. **

有别与上面的单个`*`匹配0-1级path路径，两个`**`则表示可以一直匹配到最后一层

```java
/**
 * 对于 pattern4开头的都可以匹配
 *
 * @return
 */
@GetMapping(path = "/pattern4/**")
public Mono<String> pattern4() {
    return Mono.just("pattern4 succeed!");
}
```

测试case如下

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/pattern4'
pattern4 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern4/12'
pattern4 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern4/12/3'
pattern4 succeed!%
```

**请注意**

- 直接访问`/pattern4`也是可以命中的，这个和上面是有区别的

#### c. ?

单个字符的通配，比较简单如下

```java
/**
 * 匹配  pattern5/test   pattern5/tast ...
 * 不匹配 pattern5/tst pattern5/tesst
 *
 * @return
 */
@GetMapping(path = "/pattern5/t?st")
public Mono<String> pattern5() {
    return Mono.just("pattern5 succeed!");
}
```

访问case

```bash
➜  ~ curl 'http://127.0.0.1:8080/path/pattern5/test'
pattern5 succeed!%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern5/t/st'
{"timestamp":"2020-08-27T00:13:42.557+0000","path":"/path/pattern5/t/st","status":404,"error":"Not Found","message":null,"requestId":"add34639"}%

➜  ~ curl 'http://127.0.0.1:8080/path/pattern5/tst'
{"timestamp":"2020-08-27T00:14:01.078+0000","path":"/path/pattern5/tst","status":404,"error":"Not Found","message":null,"requestId":"b2691121"}%
```

从上面的测试输出也可以看出

- `?` 对应的地方不能是`/`以及其他不被支持的字符（如`?`,`'`,`"`, `%`等)
- `?` 对应的地方必须存在

### 7. 小结

虽然本文的主题是webflux中path参数解析与url映射匹配，但是看下来我们会神奇的发现，这些知识点和SpringMVC中，貌似也没有什么区别，事实上也确实如此；对于注解的使用场景时，绝大多数，都是之前怎么玩，现在依然可以怎么玩

下面用一个表格针对上面的知识点进行汇总

| pattern | 描述 | 举例 | 
| --- | --- | ---|
| `?` | 匹配一个字符 | 	`pages/t?st.html` 匹配 `/pages/test.html` and `/pages/t3st.html` |
| `*` | 匹配单级path路径中0-多个字符 | `"/resources/*.png"` matches `"/resources/file.png"` <br/> `"/projects/*/versions"` matches `"/projects/spring/versions"` but does not match `"/projects/spring/boot/versions"` |
| `**` | 匹配0-多个path路径 | `"/resources/**"` matches `"/resources/file.png"` and `"/resources/images/file.png"` <br/>  而`"/resources/**/file.png" `这种写法是非法的 |
| `{name}` | 匹配单级path路径参数 | `"/projects/{project}/versions"` matches `"/projects/spring/versions"` and captures `project=spring` |
| `{name:[a-z]+}` | 正则 |`"/projects/{project:[a-z]+}/versions"` matches `"/projects/spring/versions"` but not `"/projects/spring1/versions"`|
| `{*path}` | 匹配path路径中，0-最后一级path路径参数 | `"/resources/{*file}"` matches `"/resources/images/file.png"` and captures `file=images/file.png` |

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/223-webflux-params](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/223-webflux-params)


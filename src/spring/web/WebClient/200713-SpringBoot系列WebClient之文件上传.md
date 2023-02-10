---
order: 2
title: 2.文件上传
tag: 
  - WebClient
category: 
  - SpringBoot
  - WEB系列
  - WebClient
date: 2020-07-13 08:25:38
keywords: SpringBoot WebFlux WebClient 文件上传
---

在上一篇[WebClient基本使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)中，介绍了如何借助WebClient来实现异步的GET/POST访问，接下来这篇文章则主要介绍文件上传的使用姿势

<!-- more -->

## I. 项目环境

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

### 1. 依赖

使用WebClient，最主要的引入依赖如下（省略掉了SpringBoot的相关依赖，如对于如何创建SpringBoot项目不太清楚的小伙伴，可以关注一下我之前的博文）

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 2. 文件上传接口

借助WebFlux，写一个简单的文件上传的REST接口（关于WebFlux的使用姿势不属于本文重点，下面的代码如有不懂的地方，可以直接忽略掉或者关注一下接下来的WebFlux系列博文）

```java
/**
 * 文件上传
 *
 * @param filePart
 * @return
 */
@PostMapping(path = "upload", produces = MediaType.MULTIPART_MIXED_VALUE)
public Mono<String> upload(@RequestPart(name = "data") FilePart filePart, ServerWebExchange exchange)
        throws IOException {
    Mono<MultiValueMap<String, Part>> ans = exchange.getMultipartData();

    StringBuffer result = new StringBuffer("【basic uploads: ");
    ans.subscribe(s -> {
        for (Map.Entry<String, List<Part>> entry : s.entrySet()) {
            for (Part part : entry.getValue()) {
                result.append(entry.getKey()).append(":");
                dataBuffer2str(part.content(), result);
            }
        }
    });

    result.append("】");
    return Mono.just(result.toString());
}

private void dataBuffer2str(Flux<DataBuffer> data, StringBuffer buffer) {
    data.subscribe(s -> {
        byte[] bytes = new byte[s.readableByteCount()];
        s.read(bytes);
        buffer.append(new String(bytes)).append(";");
    });
}
```

### 3. 待上传文件

在项目的资源目录`resources`下，新建一个文本文件，用于测试上传时使用

`test.txt`

```txt
hello 一灰灰😝ddd
```

## II. 文件上传

> 在前面介绍RestTemplate的系列博文中，同样有一篇关于[RestTemplate文件上传](http://spring.hhui.top/spring-blog/2020/07/10/200710-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0/)的博文，建议两篇对照阅读，可以获取双倍的收获哦

### 1. 单个文件上传

请注意，文件上传依然是POST请求，一般来讲，请求头的`Content-Type`为`multipart/form-data`

前面介绍WebClient的POST传参时，参数是封装在`MultiValueMap`中的，在文件上传中，依然如此，不同的是这个参数的构建方式

```java
MultipartBodyBuilder builder = new MultipartBodyBuilder();
builder.part("data",
        new FileSystemResource(this.getClass().getClassLoader().getResource("test.txt").getFile()));

// 表单参数
builder.part("name", "一灰灰");

MultiValueMap<String, HttpEntity<?>> parts = builder.build();

WebClient webClient = WebClient.create("http://127.0.0.1:8080");
Mono<String> ans = webClient.post().uri("/upload").bodyValue(parts).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("upload file return : " + s));
```

**重点关注一下借助`MultipartBodyBuilder`创建请求参数的过程**

剩下的发起请求的姿势，与之前介绍的POST方式，没有什么区别

### 2. 流上传

当然需要上传时，多半也不会是上传文件，比如一个常见的case可能是下载远程资源，并上传给内部服务；所以我们会使用`InputStreamResource`来替换`FileSystemResource`

```java
// 以流的方式上传资源
builder = new MultipartBodyBuilder();
final InputStream stream = this.getClass().getClassLoader().getResourceAsStream("test.txt");
builder.part("data", new InputStreamResource(stream) {
    @Override
    public long contentLength() throws IOException {
        // 这个方法需要重写，否则无法正确上传文件；原因在于父类是通过读取流数据来计算大小
        return stream.available();
    }

    @Override
    public String getFilename() {
        return "test.txt";
    }
});
parts = builder.build();
ans = webClient.post().uri("/upload").bodyValue(parts).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("upload stream return: " + s));
```

**请注意：当不重写`InpustStreamResource`的`contentLength`与`getFilename`方法时，没法实现我们上传的目的哦**

### 3. 字节数组上传

有流的方式，当然就不会缺少字节数组的方式，基本姿势与上面并无二样

```java
// 以字节数组的方式上传资源
builder = new MultipartBodyBuilder();
builder.part("data", new ByteArrayResource("hello 一灰灰😝!!!".getBytes()) {
    @Override
    public String getFilename() {
        return "test.txt";
    }
});
parts = builder.build();
ans = webClient.post().uri("/upload").bodyValue(parts).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("upload bytes return: " + s));
```

### 4. 多文件上传

除了一个一个文件上传之外，某些case下也可能出现一次上传多个文件的情况，对于WebClient而言，无非就是构建上传参数的时候，多一个add而言

```java
// 多文件上传，key都是data，存value的是一个列表哦，所以没调用一次，表示新塞入一个资源
builder.part("data", new ByteArrayResource("hello 一灰灰😝!!!".getBytes()) {
    @Override
    public String getFilename() {
        return "test.txt";
    }
});
builder.part("data", new ByteArrayResource("welcome 二灰灰😭!!!".getBytes()) {
    @Override
    public String getFilename() {
        return "test2.txt";
    }
});
parts = builder.build();
ans = webClient.post().uri("/upload").bodyValue(parts).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("batch upload bytes return: " + s));
```

### 5. BodyInserters方式

除了上面的`MultipartBodyBuilder`创建传参之外，还可以借助`BodyInserters`来处理，前面在接收Post传参的两种姿势中也介绍过；

不过不同于之前的`BodyInserters#fromFormData`，我们这里使用的是`BodyInserters#fromMultipartData` （从调用的方法签名上，也知道两者的各自应用场景）

```java
ans = webClient.post().uri("/upload").body(BodyInserters.fromMultipartData("data",
        new FileSystemResource(this.getClass().getClassLoader().getResource("test.txt").getFile()))
        .with("name", "form参数")).retrieve().bodyToMono(String.class);
ans.subscribe(s -> System.out.println("upload file build by BodyInserters return: " + s));
```

请注意，我们传参是通过`body`方法，而不是前面的`bodyValue`方法；如果使用错了，将无法达到预期的目的，而且极有可能调试半天也不知道啥原因...


### 6. 测试输出

所有上面的代码可以在文末的工程源码连接中获取，下面是执行的输出结果

![](/imgs/200713/00.jpg)

## II. 其他

### 0. 项目

**系列博文**

- [【WEB系列】WebClient之基础使用姿势](http://spring.hhui.top/spring-blog/2020/07/09/200709-SpringBoot%E7%B3%BB%E5%88%97WebClient%E4%B9%8B%E5%9F%BA%E7%A1%80%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/222-web-client)



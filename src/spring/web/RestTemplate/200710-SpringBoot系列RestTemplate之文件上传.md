---
order: 9
title: 9.文件上传
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - RestTemplate
date: 2020-07-10 11:53:21
keywords: Spring SpringMVC RestTemplate 文件上传 MultiPart
---

虽然在实际的项目中，借助RestTemplate来实现文件上传的机会不多（比如我已经开webclient的新坑了，才发现忘了这货...），但是这个知识点也还是有必要了解一下的，本文将简单介绍一下单个文件上传，多个文件上传的使用姿势

<!-- more -->

## I. 项目搭建

本项目基于SpringBoot `2.2.1.RELEASE` + `maven 3.5.3` + `idea`进行开发

### 1. pom依赖

核心pom依赖如下

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. Rest服务

提供两个简单的上传文件的接口，下面给出两种不一样的写法，效果差不多

```java
/**
 * 文件上传
 *
 * @param file
 * @return
 */
@PostMapping(path = "upload")
public String upload(@RequestPart(name = "data") MultipartFile file, String name) throws IOException {
    String ans = new String(file.getBytes(), "utf-8") + "|" + name;
    return ans;
}

@PostMapping(path = "upload2")
public String upload(MultipartHttpServletRequest request) throws IOException {
    List<MultipartFile> files = request.getFiles("data");

    List<String> ans = new ArrayList<>();
    for (MultipartFile file : files) {
        ans.add(new String(file.getBytes(), "utf-8"));
    }
    return JSON.toJSONString(ans);
}
```

### 3. 上传文件

在Resource资源目录下，新建两个用于测试上传的文本文件，内容分别如下

文件1 `test.txt`:

```txt
hello 一灰灰
天气不错哦😝
```

文件2 `test2.txt`:

```txt
hello 二灰灰
天气还可以哦😝
```

简单设置一下日志格式，在`application.yml`文件中

```yml
logging:
  pattern:
    console: (%msg%n%n){blue}
```

## II. 项目实现

文件上传，依然是走的POST请求，所以基本操作知识和前面的POST差不多，唯一的区别在于传参

### 1. 文件上传

文件上传两个核心步骤

- 设置请求头
- 传参为Resource

最基础的单文件上传姿势实例如下，主要是借助`FileSystemResource`来获取文件并上传

```java
RestTemplate restTemplate = new RestTemplate();

//设置请求头
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.MULTIPART_FORM_DATA);

//设置请求体，注意是LinkedMultiValueMap
FileSystemResource fileSystemResource =
        new FileSystemResource(this.getClass().getClassLoader().getResource("test.txt").getFile());
MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
// post的文件
form.add("data", fileSystemResource);
// post的表单参数
form.add("name", "哒哒哒");

//用HttpEntity封装整个请求报文
HttpEntity<MultiValueMap<String, Object>> files = new HttpEntity<>(form, headers);
String ans = restTemplate.postForObject("http://127.0.0.1:8080/upload", files, String.class);
log.info("upload fileResource return: {}", ans);
```

当需要后端发起上传文件时，一般来讲是更多的情况下是上传二进制（or流），不太会是文件上传，所以更常见的是`InputStreamResource`的使用姿势

```java
InputStream stream = this.getClass().getClassLoader().getResourceAsStream("test.txt");
InputStreamResource inputStreamResource = new InputStreamResource(stream) {
    @Override
    public long contentLength() throws IOException {
        // 这个方法需要重写，否则无法正确上传文件；原因在于父类是通过读取流数据来计算大小
        return stream.available();
    }

    @Override
    public String getFilename() {
        return "test.txt";
    }
};
form.clear();
form.add("data", inputStreamResource);
files = new HttpEntity<>(form, headers);
ans = restTemplate.postForObject("http://127.0.0.1:8080/upload", files, String.class);
log.info("upload streamResource return: {}", ans);
```

**重点注意**

- `InputStreamResource` 重写了`contentLength()`, `getFilename()`方法，去掉这个就没法正常的上传文件了


当然除了`InputStreamResource`之外，`ByteArrayResource`也是一个比较好的选择

```java
ByteArrayResource byteArrayResource = new ByteArrayResource("hello 一灰灰😝".getBytes()) {
    @Override
    public String getFilename() {
        return "test.txt";
    }
};
form.clear();
form.add("data", byteArrayResource);
files = new HttpEntity<>(form, headers);
ans = restTemplate.postForObject("http://127.0.0.1:8080/upload", files, String.class);
log.info("upload bytesResource return: {}", ans);
```

**重点注意**

- `ByteArrayResource`重写了`getFilename()`方法，感兴趣的小伙伴可以测试一下没有它的情况

### 2. 多文件上传

上面介绍的是单文件上传，当然我们也会出现一次上传多个文件的情况，使用姿势和前面基本上一样，无非是传参的时候多传两个而已

```java
// 多个文件上传
FileSystemResource f1 =
        new FileSystemResource(this.getClass().getClassLoader().getResource("test.txt").getFile());
FileSystemResource f2 =
        new FileSystemResource(this.getClass().getClassLoader().getResource("test2.txt").getFile());
form.clear();
form.add("data", f1);
form.add("data", f2);
form.add("name", "多传");

files = new HttpEntity<>(form, headers);
ans = restTemplate.postForObject("http://127.0.0.1:8080/upload2", files, String.class);
log.info("multi upload return: {}", ans);
```


### 3. 输出结果

![](/imgs/200710/00.jpg)


## II. 其他

### 0. 项目&系列博文

**博文**

- [【WEB系列】AsyncRestTemplate之异步非阻塞网络请求介绍篇](http://spring.hhui.top/spring-blog/2020/07/07/200707-SpringBoot%E7%B3%BB%E5%88%97AsyncRestTemplate%E4%B9%8B%E5%BC%82%E6%AD%A5%E9%9D%9E%E9%98%BB%E5%A1%9E%E7%BD%91%E7%BB%9C%E8%AF%B7%E6%B1%82%E4%BB%8B%E7%BB%8D%E7%AF%87/)
- [【WEB系列】RestTemplate之非200状态码信息捕获](http://spring.hhui.top/spring-blog/2020/07/05/200705-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E9%9D%9E200%E7%8A%B6%E6%80%81%E7%A0%81%E4%BF%A1%E6%81%AF%E6%8D%95%E8%8E%B7/)
- [【WEB系列】RestTemplate之Basic Auth授权](http://spring.hhui.top/spring-blog/2020/07/04/200704-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8BBasic-Auth%E6%8E%88%E6%9D%83/)
- [【WEB系列】RestTemplate之代理访问](http://spring.hhui.top/spring-blog/2020/07/03/200703-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%BB%A3%E7%90%86%E8%AE%BF%E9%97%AE/)
- [【WEB系列】RestTemplate之超时设置](http://spring.hhui.top/spring-blog/2020/07/02/200702-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%B6%85%E6%97%B6%E8%AE%BE%E7%BD%AE/)
- [【WEB系列】RestTemplate之中文乱码问题fix](http://spring.hhui.top/spring-blog/2020/07/01/200701-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E4%B8%AD%E6%96%87%E4%B9%B1%E7%A0%81%E9%97%AE%E9%A2%98fix/)
- [【WEB系列】RestTemplate之自定义请求头](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)
- [【WEB系列】RestTemplate基础用法小结](http://spring.hhui.top/spring-blog/2020/06/30/200630-SpringBoot%E7%B3%BB%E5%88%97RestTemplate%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E8%AF%B7%E6%B1%82%E5%A4%B4/)

**源码**

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/221-web-resttemplate)



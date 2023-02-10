---
order: 9
title: 9.开启GZIP数据压缩
tag: 
  - gzip
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2019-11-20 22:11:39
keywords: Spring SpringBoot gzip 压缩
---

本篇可以归纳在性能调优篇，虽然内容非常简单，但效果可能出乎预料的好；

分享一个真实案例，我们的服务部署在海外，国内访问时访问服务时，响应有点夸张；某些返回数据比较大的接口，耗时在600ms+上，然而我们的服务rt却是在20ms以下，绝大部分的开销都花在了网络传输上

针对这样的场景，除了买云服务商的网络通道之外，另外一个直观的想法就是减少数据包的大小，直接在nginx层配置gzip压缩是一个方案，本文主要介绍下，SpringBoot如何开启gzip压缩

<!-- more -->

## I. gizp压缩配置

### 1. 配置

SpringBoot默认是不开启gzip压缩的，需要我们手动开启，在配置文件中添加两行

```yaml
server:
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/plain,text/css,application/x-javascript
```

注意下上面配置中的`mime-types`，在spring2.0+的版本中，默认值如下，所以一般我们不需要特意添加这个配置

```java
// org.springframework.boot.web.server.Compression#mimeTypes
/**
 * Comma-separated list of MIME types that should be compressed.
 */
private String[] mimeTypes = new String[] { "text/html", "text/xml", "text/plain",
		"text/css", "text/javascript", "application/javascript", "application/json",
		"application/xml" };
```

### 2. 测试

写一个测试的demo

```java
@RestController
public class HelloRest {
    @GetMapping("bigReq")
    public String bigReqList() {
        List<String> result = new ArrayList<>(2048);
        for (int i = 0; i < 2048; i++) {
            result.add(UUID.randomUUID().toString());
        }
        return JSON.toJSONString(result);
    }
}
```

![](/imgs/191120/00.jpg)

下面是开启压缩前后的数据报对比

![](/imgs/191120/01.jpg)

### 3. 说明

虽然加上了上面的配置，开启了gzip压缩，但是需要注意并不是说所有的接口都会使用gzip压缩，默认情况下，仅会压缩2048字节以上的内容

如果我们需要修改这个值，通过修改配置即可

```yaml
server:
  compression:
    min-response-size: 1024
```


## II. 其他

### 0. 项目

#### web系列博文

- [191018-SpringBoot系列教程web篇之过滤器Filter使用指南扩展篇](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484356&idx=1&sn=7c80f55f875f8d9ed37ef618cd7852ff&chksm=fce71868cb90917ec76ed23990a287b25dfecd6e60300a215ff9b85d9d9db32b3ba1c7b549c7&token=1964747263&lang=zh_CN#rd)
- [191016-SpringBoot系列教程web篇之过滤器Filter使用指南](https://mp.weixin.qq.com/s/f01KWO3d2zhoN0Qa9-Qb6w)
- [191012-SpringBoot系列教程web篇之自定义异常处理HandlerExceptionResolver](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484348&idx=1&sn=e9b36572c721418b097396b50319d140&chksm=fce71810cb9091063e810327e44f7ed07256188aecd352fa43f37e63e63dc64292b1a48b00cf&token=823367253&lang=zh_CN#rd)
- [191010-SpringBoot系列教程web篇之全局异常处理](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484344&idx=1&sn=d4b1422a709d9540583e33443aab6fff&chksm=fce71814cb9091025a960312c878ff9fc4f44fd0035aa597f55f37c90dcbac25a3e96ee2c528&token=118864495&lang=zh_CN#rd)
- [190930-SpringBoot系列教程web篇之404、500异常页面配置](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484336&idx=1&sn=d70f15e77bbd219af8015f9037a167fb&chksm=fce7181ccb90910aee427a3f3ed7660e8303c7460859c82622a651ce1cc3d7a97f62f80ed4e0&token=2447275&lang=zh_CN#rd)
- [190929-SpringBoot系列教程web篇之重定向](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484322&idx=1&sn=b18090f35b59097f78858b6609506b74&chksm=fce7180ecb909118d939f3ddf741a11c0977b1213d7afa12c970590590d40441c3a085c43c52&token=2447275&lang=zh_CN#rd)
- [190913-SpringBoot系列教程web篇之返回文本、网页、图片的操作姿势](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484310&idx=1&sn=f6259cf1b79db095ff2e9534993d27cf&chksm=fce7183acb90912cd150f086e90ecab3eceb3464e9352853e2e722288d412dbb3eb20c6e6ae7&scene=21#wechat_redirect)
- [190905-SpringBoot系列教程web篇之中文乱码问题解决](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484309&idx=1&sn=33d782f7529268eef6607a1ab8d41018&chksm=fce71839cb90912f6020aa9463bc0136cb57969ebe27eba865d97e212c28211435791aa874ea&scene=21#wechat_redirect)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484291&idx=1&sn=3f7e8c92ca4d7270cc5c40cafea39683&chksm=fce7182fcb90913922654a4f2f04e7029b8944d71c31741334a3235aecbe1e60babcb0c0be74&scene=21#wechat_redirect)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484287&idx=1&sn=44461f564d6b04cbf1a5902dcb4f23c6&chksm=fce718d3cb9091c5d730e63ae954c0831d53f3dd5af5d19d9c78b6009102838efaf56f7838ff&scene=21#wechat_redirect)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484282&idx=1&sn=a8d236d935ae24cfbe6977e24a479caa&chksm=fce718d6cb9091c0dd8a6b113236f9ae9388fb026c9403c97bdf7505f773bd7330a43e3b269c&scene=21#wechat_redirect)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=3&sn=9e8a6121dce291c65bd2b3d4fab24178&chksm=fce718c0cb9091d6674fb809d68ca3dc3b1695162368481abf8dc094000412116d2f9971c54b&scene=21#wechat_redirect)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=2&sn=f800c001061eabe74e2cad915af1921a&chksm=fce718c0cb9091d682b600673a0584955783f0d339248e34323efbea9b698560c432018717ef&scene=21#wechat_redirect)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=1&sn=acd691729488d81a94c938151d5737ce&chksm=fce718c0cb9091d63ef5f12893bb835c256a18318e791a0d193d00ef767ecfd019491d02e83d&scene=21#wechat_redirect)
- [190421-SpringBoot高级篇WEB之websocket的使用说明](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484217&idx=1&sn=9fdf45d2261cdcf2ccaccaebfb5ef598&chksm=fce71895cb90918361f1afd55a2b5fc9d65508913c1d793710afa79cae38bd9d57e32ad2c187&token=2447275&lang=zh_CN#rd)
- [190327-Spring-RestTemplate之urlencode参数解析异常全程分析](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484197&idx=1&sn=0184953527f58058ee8c2bbcfc2689ec&chksm=fce71889cb90919f9be003bf2487343f7952d6b33ab5ee5fb7251ae37a631d4c32e6d8a57528&token=2447275&lang=zh_CN#rd)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484193&idx=1&sn=d8a284fe0a2b8e1fefe07d892558f563&chksm=fce7188dcb90919b1f8a2408bf955e37e88b043e2dbd59b5290ac1501e3d2d303512bac6af2c&token=2447275&lang=zh_CN#rd)
- [190316-Spring MVC之基于xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484186&idx=1&sn=18db571b670815965ae9185830c4e88f&chksm=fce718b6cb9091a054e0ac4be051341d8ce38ff8e40c5911302e3d6981206c14b80770590044&token=2447275&lang=zh_CN#rd)
- [190213-SpringBoot文件上传异常之提示The temporary upload location xxx is not valid](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484139&idx=1&sn=b4a5f3ca6215641c6bcf5123f2bfb501&chksm=fce71947cb9090511042ae97a12cc975d2b199521e17980e685cccb5e0be91a8e932cef4eb76&token=2447275&lang=zh_CN#rd)

#### 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/210-web-filter](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/210-web-filter)


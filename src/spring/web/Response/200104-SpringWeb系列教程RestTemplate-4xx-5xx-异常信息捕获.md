---
order: 10
title: 10.RestTemplate 4xx/5xx 异常信息捕获
tag: 
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - Response
date: 2020-01-04 16:25:14
keywords: SpringBoot SpringMVC RestTemplate 4xx 5xx Error DefaultResponseErrorHandler
---

近期使用RestTemplate访问外部资源时，发现一个有意思的问题。因为权限校验失败，对方返回的401的http code，此外返回数据中也会包含一些异常提示信息；然而在使用RestTemplate访问时，却是直接抛了如下提示401的异常，并不能拿到提示信息

![](/imgs/200104/00.jpg)


那么RestTemplate如果希望可以获取到非200状态码返回数据时，可以怎么操作呢？

<!-- more -->

## I. 异常捕获

### 1. 问题分析

RestTemplate的异常处理，是借助`org.springframework.web.client.ResponseErrorHandler`来做的，先看一下两个核心方法

- 下面代码来自 spring-web.5.0.7.RELEASE版本

```java
public interface ResponseErrorHandler {
  // 判断是否有异常
	boolean hasError(ClientHttpResponse response) throws IOException;
  // 如果有问题，进入这个方法，处理问题
	void handleError(ClientHttpResponse response) throws IOException;
}
```

简单来讲，当RestTemplate发出请求，获取到对方相应之后，会交给`ResponseErrorHandler`来判断一下，返回结果是否ok

因此接下来将目标瞄准到RestTemplate默认的异常处理器: `org.springframework.web.client.DefaultResponseErrorHandler`

#### a. 判定返回结果是否ok

从源码上看，主要是根据返回的http code来判断是否ok

```java
// 根据返回的http code判断有没有问题
@Override
public boolean hasError(ClientHttpResponse response) throws IOException {
	HttpStatus statusCode = HttpStatus.resolve(response.getRawStatusCode());
	return (statusCode != null && hasError(statusCode));
}

// 具体的判定逻辑，简单来讲，就是返回的http code是标准的4xx, 5xx，那么就认为有问题了
protected boolean hasError(HttpStatus statusCode) {
	return (statusCode.series() == HttpStatus.Series.CLIENT_ERROR ||
			statusCode.series() == HttpStatus.Series.SERVER_ERROR);
}
```

请注意上面的实现，自定义的某些http code是不会被认为是异常的，因为无法转换为对应的`HttpStatus` （后面实例进行说明）

#### b. 异常处理

当上面的 `hasError` 返回ture的时候，就会进入异常处理逻辑

```java
@Override
public void handleError(ClientHttpResponse response) throws IOException {
	HttpStatus statusCode = HttpStatus.resolve(response.getRawStatusCode());
	if (statusCode == null) {
		throw new UnknownHttpStatusCodeException(response.getRawStatusCode(), response.getStatusText(),
				response.getHeaders(), getResponseBody(response), getCharset(response));
	}
	handleError(response, statusCode);
}

protected void handleError(ClientHttpResponse response, HttpStatus statusCode) throws IOException {
	switch (statusCode.series()) {
		case CLIENT_ERROR:
			throw new HttpClientErrorException(statusCode, response.getStatusText(),
					response.getHeaders(), getResponseBody(response), getCharset(response));
		case SERVER_ERROR:
			throw new HttpServerErrorException(statusCode, response.getStatusText(),
					response.getHeaders(), getResponseBody(response), getCharset(response));
		default:
			throw new UnknownHttpStatusCodeException(statusCode.value(), response.getStatusText(),
					response.getHeaders(), getResponseBody(response), getCharset(response));
	}
}
```

从上面也可以看到，异常处理逻辑很简单，直接抛异常

### 2. 异常捕获

定位到上面的问题之后，再想解决问题就相对简单了，自定义一个异常处理类，不管状态码返回是啥，全都认为正常即可

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.setErrorHandler(new DefaultResponseErrorHandler(){
    @Override
    protected boolean hasError(HttpStatus statusCode) {
        return super.hasError(statusCode);
    }

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
    }
});
```

### 3. 实测

首先写两个结果，返回的http状态码非200；针对返回非200状态码的case，有多种写法，下面演示两种常见的

```java
@RestController
public class HelloRest {
  @GetMapping("401")
  public ResponseEntity<String> _401(HttpServletResponse response) {
      ResponseEntity<String> ans =
              new ResponseEntity<>("{\"code\": 401, \"msg\": \"some error!\"}", HttpStatus.UNAUTHORIZED);
      return ans;
  }
  
  @GetMapping("525")
  public String _525(HttpServletResponse response) {
      response.setStatus(525);
      return "{\"code\": 525, \"msg\": \"自定义错误码!\"}";
  }
}
```

首先来看一下自定义的525和标准的401 http code，直接通过`RestTemplate`访问的case

```java
@Test
public void testCode() {
    RestTemplate restTemplate = new RestTemplate();
    HttpEntity<String> ans = restTemplate.getForEntity("http://127.0.0.1:8080/525", String.class);
    System.out.println(ans);

    ans = restTemplate.getForEntity("http://127.0.0.1:8080/401", String.class);
    System.out.println(ans);
}
```

![](/imgs/200104/01.jpg)

从上面的输出结果也可以看出来，非标准http code不会抛异常（原因上面有分析），接下来看一下即便是标准的http code也不希望抛异常的case

```java
@Test
public void testSend() {
    String url = "http://127.0.0.1:8080/401";
    RestTemplate restTemplate = new RestTemplate();
    restTemplate.setErrorHandler(new DefaultResponseErrorHandler(){
        @Override
        protected boolean hasError(HttpStatus statusCode) {
            return super.hasError(statusCode);
        }

        @Override
        public void handleError(ClientHttpResponse response) throws IOException {
        }
    });
    HttpEntity<String> ans = restTemplate.getForEntity(url, String.class);
    System.out.println(ans);
}
```

![](/imgs/200104/02.jpg)

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)


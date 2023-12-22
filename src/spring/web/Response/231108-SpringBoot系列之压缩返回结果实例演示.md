---
order: 17
title: 17.压缩返回结果实例演示，让你的性能更高效！
tag:
  - 压缩
category:
  - SpringBoot
  - WEB系列
  - Response
date: 2023-11-08 10:38:11
keywords:
  - 压缩
  - SpringMVC
---

本文将介绍一个SpringBoot进阶技巧：压缩返回结果实例演示，旨在提升您的网站访问性能。

当返回的数据较大时，网络开销通常不可忽视。为了解决这个问题，我们可以考虑压缩返回的结果，以减少传输的数据量，从而降低网络开销并提高性能。对于依赖Spring生态的Java开发者来说，幸运的是SpringBoot提供了非常便捷的使用方式。

接下来，我们将介绍几种不同情况下的压缩返回的使用方式：

- 直接返回文本：使用text/plain作为响应类型。
- 返回JSON数据：使用application/json作为响应类型。
- 返回静态资源文件：对于静态资源文件，可以使用压缩算法进行压缩后再返回。


<!-- more -->


## I. 项目配置

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

核心依赖 `spring-boot-starter-web`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. 启动入口

我们使用默认的配置进行测试，因此启动入口也可以使用最基础的

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

## II. 返回结果压缩

### 1. 开启gzip压缩

在Spring Boot中开启压缩，只需要在配置文件中添加以下配置即可自动开启：

```yaml
server:
  compression:
    enabled: true # 开启支持gzip压缩
    min-response-size: 128 # 当响应长度超过128时，才执行压缩
```

注意上面的两个配置，其中 `server.compression.enabled` 用于控制是否开启压缩；而`server.compression.min-response-size`则根据实际返回的大小，来决定是否需要开启压缩，上面的配置表示，只有返回的长度超过128时，才开启压缩。

写一个简单的demo进行验证

```java
/**
 * 返回结果
 *
 * @author YiHui
 * @date 2023/11/6
 */
@Controller
public class RspController {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static final class UserInfo {
        private String name;
        private Integer code;
    }

    private List<UserInfo> allUsers(int size) {
        List<UserInfo> list = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            list.add(new UserInfo(UUID.randomUUID() + "_用户", i));
        }
        return list;
    }

    /**
     * 字符串方式返回, 会根据设置的最小长度，来确定是否会对返回结果进行gzip压缩
     *
     * @return
     */
    @ResponseBody
    @GetMapping(path = "strList")
    public String strList(@RequestParam(name = "size", defaultValue = "128", required = false) Integer size) {
        List<UserInfo> list = allUsers(size);
        return JSON.toJSONString(list);
    }
}
```

下图为实际访问对比，从两次请求的返回头来看，左边的示例表示没有开启压缩处理，而右边的示例则开启了gzip压缩。


![](/imgs/231108/00.jpg)


### 2. 返回json对象时最小返回阈值不生效问题

接下来我们再看一个特殊的场景，当我们返回的是jsonObject对象时，即便返回的内容小于前面配置的128，也会开启压缩

```java
/**
 * 对象方式返回, 用于模拟不管返回的内容多小，都会进行gzip压缩
 *
 * @return
 */
@ResponseBody
@GetMapping(path = "list")
public List<UserInfo> list(@RequestParam(name = "size", defaultValue = "128", required = false) Integer size) {
    List<UserInfo> list = allUsers(size);
    return list.subList(0, size);
}
```

![](/imgs/231108/01.jpg)


根据上述实际表现，我们注意到一个令人费解的现象：同样返回一条数据时，如前面返回String时，不需要进行压缩；然而，当数据类型为JsonObject时，即使返回的内容小于128字节，也会启用gzip压缩。

这一现象的主要原因则是：

在Spring Boot框架中，默认情况下会对所有的json对象进行压缩处理。即使返回的数据量较小，即使未达到最小返回阈值，系统也会自动对其进行压缩操作。这样做的目的是为了减少传输的数据量并提高性能。

> 即当返回的是对象，即`Content-Type: application/json`时，不会设置Content-Length，服务端无法判断长度，并且是通过`Transfer-Encoding: chunked`的方式发送给客户端，因此一定会做压缩。

若我们希望严格按照预期来执行，那么可以通过对返回结果进行包装，补齐`Content-Length`来实现

自定义一个过滤器，借助`ContentCachingResponseWrapper`来包装返回结果

```java
/**
 * 所有的返回结果，包装一个 content-length 返回
 *
 * @return
 */
@Bean
public FilterRegistrationBean filterRegistrationBean() {
    FilterRegistrationBean filterBean = new FilterRegistrationBean();
    filterBean.setFilter(new AddContentLengthFilter());
    filterBean.setUrlPatterns(Arrays.asList("*"));
    return filterBean;
}

/**
 * 现象：当返回的是json对象时， server.compression.min-response-size不起作用，不管这个对象的大小，默认全部做gzip压缩。
 * 原因：
 * - 当返回的是字符串，即Content-Type: text/plain 时，会设置Content-Length，则会根据实际返回的大小来判断是否需要进行gzip压缩
 * - 而当返回的是对象，即Content-Type: application/json时，不会设置Content-Length，服务端无法判断长度，并且是通过Transfer-Encoding: chunked的方式发送给客户端，因此一定会做压缩。
 * 解决方案:
 * - 加上全局的 content-length
 */
class AddContentLengthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // ContentCachingResponseWrapper会缓存所有写给OutputStream的数据，并且因为缓存了内容，所以可以获取Content-Length并帮忙设置
        ContentCachingResponseWrapper cacheResponseWrapper;
        if (response instanceof ContentCachingResponseWrapper) {
            cacheResponseWrapper = (ContentCachingResponseWrapper) response;
        } else {
            cacheResponseWrapper = new ContentCachingResponseWrapper(response);
        }

        filterChain.doFilter(request, cacheResponseWrapper);
        cacheResponseWrapper.copyBodyToResponse();
    }
}
```

再次访问验证一下，结果和我们预期的保持一致了

![](/imgs/231108/02.jpg)


### 3. 返回静态资源压缩


对于前后端未分离的项目，后端可能还需要返回静态资源文件，如JavaScript、CSS和图像等。在Spring Boot中，这些静态资源文件也可以被压缩并返回。为了实现这一功能，主要借助了`EncodedResourceResolver`类。

`EncodedResourceResolver`是Spring框架中的一个类，用于解析和处理静态资源文件的编码和解码。通过使用`EncodedResourceResolver`，我们可以对静态资源文件进行压缩，并将其作为响应返回给前端。

一个简单的使用实例如下

```java
@SpringBootApplication
public class Application implements WebMvcConfigurer {

    /**
     * 配置返回的静态资源的压缩与缓存方式
     *
     * @param registry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePrivate())
                .resourceChain(true)
                .addResolver(new EncodedResourceResolver())
                .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
    }
}
```


上面的配置中，表示将static资源目录下的文件，作为静态资源返回，会设置缓存时间，并开启压缩支持

我们可以再项目的 `resources/static/` 目录下新增一个 `txt.txt` 文件，并再其中随意补充一些内容

```json
[{"name":"1ff56203-47b2-404b-b102-77e5bc5e6a0f_用户","code":0},{"name":"8ba610db-6c30-4a6c-86b6-b4b7e8ff2a66_用户","code":1},{"name":"887e3b3d-1101-40a4-978f-7ad30c2b119e_用户","code":2},{"name":"134a9046-6109-41d8-9608-f5537a13e447_用户","code":3},{"name":"ae2a6d0a-e1f5-474f-bbf1-ea49f1f50277_用户","code":4},{"name":"bbc40c4b-a87b-43a0-b742-f47dab4d955d_用户","code":5},{"name":"602fcaa1-cf43-49cb-ae37-93d5055d0103_用户","code":6},{"name":"110f2b1f-5d0c-4ac7-8c75-1dac60bf85ae_用户","code":7},{"name":"e0225ce4-9ec5-4346-9333-e4ca9aa654d5_用户","code":8},{"name":"50beae64-1e09-42aa-9944-1a68ec061ddc_用户","code":9},{"name":"415640d8-7f33-4b92-a78f-fc0ac952e2c3_用户","code":10},{"name":"e7c5f4d7-5891-4424-8849-cf71b9107a25_用户","code":11},{"name":"2727b14f-70b6-4a2c-bd44-625b3c26dcc3_用户","code":12},{"name":"59037e13-fd39-4703-8227-dd5958ceaa05_用户","code":13},{"name":"c81b748a-d41d-4b3f-9a2b-2ab9ea74d10b_用户","code":14},{"name":"aaaafc2f-00cb-4a06-8c5a-be0473d80111_用户","code":15},{"name":"2a6de89e-3dee-41c1-993a-1dbfdd1951a8_用户","code":16},{"name":"ebd72458-b889-4207-b097-a9e84bc083ca_用户","code":17},{"name":"a9e3b70f-df3f-4173-a33c-75281c8cc3cc_用户","code":18},{"name":"e6bd6f87-62cc-446c-be30-d5d4ef2dc4da_用户","code":19}]
```

然后直接访问验证一下

![](/imgs/231108/03.jpg)

从上面的访问示例可以看出，首次访问时，压缩返回；再次访问时，因为资源未发生变更，所以直接使用本地的缓存。这是因为浏览器在第一次请求静态资源时会将其缓存起来，以便下次访问时能够更快地加载。如果资源发生了更改，浏览器将不会使用缓存的版本，而是重新发起请求以获取最新的资源。


### 4. 小结

最后对文中介绍的内容做一个整体的总结，在Spring Boot中开启gzip压缩可以通过以下方式实现：

1. 在配置文件中添加如下配置：

```yaml
server:
  compression:
    enabled: true # 开启支持gzip压缩
    min-response-size: 128 # 当响应长度超过128时，才执行压缩
```

2. 返回json对象时最小返回阈值不生效问题：

当返回的是对象时，即使返回的内容小于前面配置的128字节，也会启用gzip压缩。这是因为在Spring Boot框架中，默认会对所有的json对象进行压缩处理。如果不想压缩，可以将返回结果进行包装，实现按需压缩。

3. 返回静态资源压缩：

对于前后端未分离的项目，后端可能还需要返回静态资源文件，如JavaScript、CSS和图像等。在Spring Boot中，这些静态资源文件也可以被压缩并返回。为了实现这一功能，主要借助了`EncodedResourceResolver`类，通过设置静态资源的压缩方式，并再`WebMvcConfigurer`实现中进行注册，从而实现静态资源的压缩与缓存

## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/207-web-res-gzip](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/207-web-res-gzip)


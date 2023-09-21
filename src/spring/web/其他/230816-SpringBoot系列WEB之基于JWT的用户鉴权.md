---
order: 6
title: 6.基于JWT的用户鉴权实战
tag:
  - JWT
category:
  - SpringBoot
  - WEB系列
  - JWT
date: 2023-08-16 14:36:37
keywords:
  - jwt
  - SpringBoot
---

再传统的基于session的用户身份认证方式之中，用户相关信息存储与后端，通常基于cookie来携带用户的会话id，然后后端在基于会话id查到对应的用户身份信息；区别于session的身份认证方式，jwt作为一个基于RFC 7519的开发标准，提供了一种通过JSON形式的web令牌，用于在各系统之间的安全可信的数据传输、身份标识

本文将主要介绍jwt的相关知识点，以及如何基于jwt来实现一个简单的用户鉴权方案

<!-- more  -->

## I. JWT知识点

jwt，全称 json web token, JSON Web 令牌是一种开放的行业标准 RFC 7519 方法，用于在两方之间安全地表示声明。

> 详情可以参考： [hhttps://jwt.io/introduction](https://jwt.io/introduction)


### 1. 数据结构

JSON Web Token由三部分组成，它们之间用圆点`.`进行分割， 一个标准的JWT形如 `xxx.yyy.zzz`

- Header
- Payload
- Signature


#### 1.1 header

即第一部分，由两部分组成：token的类型（`JWT`）和算法名称（比如：`HMAC` `SHA256`或者`RSA`等等）。


一个具体实例如

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

然后，用Base64对这个JSON编码就得到JWT的第一部分

#### 1.2 Payload

第二部分具体的实体，可以写入自定义的数据信息，有三种类型

- `Registered claims` : 这里有一组预定义的声明，它们不是强制的，但是推荐。比如：iss (issuer 签发者), exp (expiration time 有效期), sub (subject), aud (audience)等。
- `Public claims` : 可以随意定义。
- `Private claims` : 用于在同意使用它们的各方之间共享信息，并且不是注册的或公开的声明

如一个具体实例

```json
{
    "iss": "一灰灰blog",
    "exp": 1692256049,
    "wechat": "https://spring.hhui.top/spring-blog/imgs/info/wx.jpg",
    "site": "https://spring.hhui.top",
    "uname": "一灰"
}
```

对payload进行Base64编码就得到JWT的第二部分

#### 1.3 Signature

为了得到签名部分，你必须有编码过的header、编码过的payload、一个秘钥，签名算法是header中指定的那个，然对它们签名即可。

如 `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`

签名是用于验证消息在传递过程中有没有被更改，并且，对于使用私钥签名的token，它还可以验证JWT的发送方是否为它所称的发送方。


#### 1.4 具体实例

下面给出一个基于 `java-jwt` 生成的具体实例

```java
public static void main(String[] args) {
    String token = JWT.create().withIssuer("一灰灰blog").withExpiresAt(new Date(System.currentTimeMillis() + 86400_000))
            .withPayload(MapUtils.create("uname", "一灰", "wechat", "https://spring.hhui.top/spring-blog/imgs/info/wx.jpg", "site", "https://spring.hhui.top"))
            .sign(Algorithm.HMAC256("helloWorld"));
    System.out.println(token);
}
```

![](/imgs/230816/00.jpg)


## II. 使用实例


接下来我们基于jwt方案实现一个用户鉴权的示例demo

### 1. 项目搭建


首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

添加web支持，用于配置刷新演示

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.auth0</groupId>
        <artifactId>java-jwt</artifactId>
        <version>4.4.0</version>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
</dependencies>
```

我们采用thymeleaf来进行前端页面的渲染，添加一些相关的配置 `application.yml`

```yaml
server:
  port: 8080

spring:
  thymeleaf:
    mode: HTML
    encoding: UTF-8
    servlet:
      content-type: text/html
    cache: false
```



### 2. JWT鉴权流程

一个简单的基于jwt的身份验证方案如下图

![](/imgs/230816/01.jpg)

基本流程分三步：

1. 用户登录成功之后，后端将生成的jwt返回给前端，然后前端将其保存在本地缓存；

2. 之后前端与后端的交互时，都将jwt放在请求头中，我们这里借助Http的身份认证的请求头`Authorization`

3. 后端接收到用户的请求，从请求头中获取jwt，然后进行校验，通过之后，才响应相关的接口；否则表示未登录


### 3. 实现方案

基于上面的流程，我们可以实现一个非常简单的登录认证演示工程

首先在内存中，维护几个简单用户名/密码信息，用于模拟用户名+密码的校验

```java
@Controller
public class LoginController {
    private Map<String, String> userCache = create("一灰灰", "123", "yihui", "hello");

    private static <K, V> Map<K, V> create(K k, V v, Object... kvs) {
        Map<K, V> map = new HashMap<>(kvs.length + 1);
        map.put(k, v);
        for (int i = 0; i < kvs.length; i += 2) {
            map.put((K) kvs[i], (V) kvs[i + 1]);
        }
        return map;
    }
}
```

然后提供登录接口

```java
@PostMapping(path = "/login")
@ResponseBody
public String login(String uname, String pwd, HttpServletResponse response) {
    if (!userCache.containsKey(uname) || !Objects.equals(pwd, userCache.get(uname))) {
        return "用户名密码错误，登录失败";
    }

    String token = JWT.create()
            .withIssuer("一灰灰blog")
            .withExpiresAt(new Date(System.currentTimeMillis() + 86400_000L))
            .withPayload(create("uname", uname, "wechat", "https://spring.hhui.top/spring-blog/imgs/info/wx.jpg", "site", "https://spring.hhui.top"))
            .sign(Algorithm.HMAC256("helloWorld"));

    response.addCookie(new Cookie("Authorization", token));
    return token;
}
```

上面的接口实现，接收两个请求参数: 用户名 + 密码

当用户身份校验通过之后，将生成一个jwt，这里直接使用开源项目`java-jwt`来生成(当然有兴趣的小伙伴也可以自己来实现)

需要注意的一点是，我们在上面的实现中，除了直接返回jwt之外，也将这个jwt写在cookie中，这种将jwt写入cookie的方案，主要的好处就是前端不需要针对jwt进行特殊处理
当然对应的缺点也和直接使用session的鉴权方式一样，存在csrf风险，以及对于跨资源共享时的资源共享问题(CORS)

> 本项目的实际演示中，采用前端存储返回的jwt，然后通过请求头方式来传递jwt


上面登录完成之后，再提供一个简单的要求登录之后才能查看的查询接口

```java
@GetMapping("query")
@ResponseBody
public Object queryInfo(HttpServletRequest request) {
    // 1. 从请求头中获取jwt
    String token = request.getHeader("Authorization");
    if (StringUtils.isEmpty(token)) {
        return "未登录";
    }
    token = token.substring(token.indexOf(" ")).trim();

    // 2. 验证jwt是否合法
    try {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256("helloWorld")).withIssuer("一灰灰blog").build();
        DecodedJWT decodedJWT = verifier.verify(token);
        HashMap pay = JSONObject.parseObject(new String(Base64Utils.decodeFromString(decodedJWT.getPayload())), HashMap.class);
        pay.put("query", "查询成功!");
        return pay;
    } catch (Exception e) {
        e.printStackTrace();
        return "鉴权失败: " + e.getMessage();
    }
}
```

最后再写一个前端页面来完成整个测试

```java
@GetMapping(path = {"/", "", "/index"})
public String index() {
    return "index";
}
```

对应的前端页面如下:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="SpringBoot thymeleaf"/>
    <meta name="author" content="YiHui"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>JWT示例demo</title>
</head>
<body>

<div>
    <div>准备登录</div>
    <br/>
    <div>
        用户名: <input type="text" id="uname">
    </div>
    <div>
        密码: <input type="password" id="pwd">
    </div>
    <div>
        <button onclick="login()">登录</button>
    </div>
    <div id="tip"></div>
    </br>
    <hr/>
    <div> --- 分割线 ---</div>
    </br>
    <button onclick="query()">查询用户信息</button>
    </br>
    <div>
        <pre id="res"></pre>
    </div>
</div>
<script>
    function login() {
        const uname = document.getElementById("uname").value;
        const pwd = document.getElementById("pwd").value;
        console.log("开始登录", uname, pwd);
        var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
        httpRequest.open('POST', '/login', true); //第二步：打开连接
        httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
        httpRequest.send(`uname=${uname}&pwd=${pwd}`);//发送请求 将情头体写在send中
        /**
         * 获取数据后的处理程序
         */
        httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
                const res = httpRequest.responseText;//获取到服务端返回的数据
                console.log(res);
                document.getElementById("tip").innerText = "登录完成:" + res;
                window.sessionStorage.setItem("jwt", res);
            }
        };
    }

    function query() {
        var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
        httpRequest.open('GET', '/query', true);//第二步：打开连接
        httpRequest.setRequestHeader("Authorization", "Bearer " + window.sessionStorage.getItem("jwt"));
        httpRequest.send();//第三步：发送请求  将请求参数写在URL中
        /**
         * 获取数据后的处理程序
         */
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                var json = httpRequest.responseText;//获取到json字符串，还需解析
                console.log(json);
                document.getElementById("res").innerText = json;
            }
        };
    }
</script>
</body>
</html>
```

### 4. 实例演示

基于上面的实现，接下来我们看一下具体表现情况

![](/imgs/230816/02.jpg)

![](/imgs/230816/03.jpg)

从上面的两张图也可以看出，登录成功之后，jwt写入到本地的session storage中，再后续的请求中，若请求头`Authroization`中携带了jwt信息，则后端可以进行正常校验


有兴趣的小伙伴可以尝试修改一下本地存储中的jwt值，看一下非法或者过期的jwt会怎么表现


### 5. 小结

本文主要介绍了jwt的基本知识点，并给出了一个基于jwt的使用实例，下面针对jwt和session做一个简单的对比

| jwt | session | 
| --- | --- |
| 前端存储，通用的校验规则，后端再获取jwt时校验是否有效 | 前端存索引，后端判断session是否有效 | 
| 验签，不可篡改 | 无签名保障，安全性由后端保障 | 
| 可存储非敏感信息，如用户名，头像等 | 一般不存储业务信息 | 
| jwt生成时，指定了有效期，本身不支持续期以及提前失效 | 后端控制有效期，可提前失效或者自动续期 |
| 通常以请求头方式传递 | 通常以cookie方式传递|
| 可预发csrf攻击 | session-cookie方式存在csrf风险 |

关于上面的两个风险，给一个简单的扩展说明

**csrf攻击**

如再我自己的网站页面上，添加下面内容

```html
<img src="https://paicoding.com/logout" style="display:none;"/>
```

然后当你访问我的网站时，结果发现你在技术派上的登录用户被注销了!!!

使用jwt预防csrf攻击的主要原理就是jwt是通过请求头，由js主动塞进去传递给后端的，而非cookie的方式，从而避免csrf漏洞攻击



## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/225-web-jwt)

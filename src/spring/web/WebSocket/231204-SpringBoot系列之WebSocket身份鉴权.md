---
order: 3
title: 3.从零开始学习SpringBoot WebSocket身份鉴权，让你的项目更上一层楼！
tag: 
  - WebSocket
  - STOMP
category: 
  - WEB系列
  - WebSocket
date: 2023-12-04 09:40:04
keywords:
  - SpringBoot
  - WebSocket
  - STOMP
---

上一篇博文介绍了如何利用STOMP和SpringBoot搭建一个能够实现相互通讯的聊天系统。通过该系统，我们了解了STOMP的基本使用方法以及一些基础概念。接下来，我们将在此基础上进行一些增强。由于聊天的本质是交流，因此我们需要知道是谁在与谁进行聊天，这就需要登录功能的支持。

接下来，我们将探讨如何为WebSocket通信添加身份验证功能。

<!-- more -->

## I. 实例演示

### 1. 项目配置


首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

核心依赖 `spring-boot-starter-websocket`， 其中模板渲染引擎`thymeleaf`主要是集成前端页面

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
</dependencies>
```

### 2. WebSocket配置

首先我们先看一下后端的配置，对于SpringBoot整合STOMP，主要通过实现配置类`WebSocketMessageBrokerConfigurer`来定义相关的信息：

- 注册端点Endpoint
- 定义消息转发规则
- 定义拦截器（配置消息接收、返回的相关参数）

```java
@Configuration
@EnableWebSocketMessageBroker
public class StompConfiguration implements WebSocketMessageBrokerConfigurer {

    /**
     * 这里定义的是客户端接收服务端消息的相关信息
     *
     * @param registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 消息代理指定了客户端订阅地址，前端订阅的就是这个路径, 接收后端发送的消息
        // 对应 index.js中的 stompClient.subscribe('/topic/hello'
        registry.enableSimpleBroker("/topic");

        // 表示配置一个或多个前缀，通过这些前缀过滤出需要被注解方法处理的消息。
        // 例如，前缀为 /app 的 destination 可以通过@MessageMapping注解的方法处理，
        // 而其他 destination （例如 /topic /queue）将被直接交给 broker 处理
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * 添加一个服务端点，来接收客户端的连接
     * 即客户端创建ws时，指定的地址, let socket = new WebSocket("ws://ws/chat/xxx");
     *
     * @param registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint指定了客户端建立连接时的请求地址
        registry.addEndpoint("/ws/chat/{channel}")
                // 设置拦截器，从cookie中识别出登录用户
                .addInterceptors(authHandshakeInterceptor())
                .withSockJS();
    }

    @Bean
    public AuthHandshakeInterceptor authHandshakeInterceptor() {
        return new AuthHandshakeInterceptor();
    }

}
```

有兴趣的小伙伴可以对比一下上面的Endpoint配置与之前整合STOMP的示例中的配置，两者之间存在两个主要差异：

1. `addEndpoint("/ws/chat/{channel}")`

这个端点并不是一个固定的值，最后一个`{channel}`是一个变量。可以理解为聊天群，不同聊天群中的信息是相互隔离的，不会出现串频的情况。

2. `addInterceptors(authHandshakeInterceptor())`

这里设置了身份鉴权拦截器，也是本文的核心内容。在WebSocket连接建立之后，如何识别当前建立连接的用户呢？

### 3. 身份鉴权拦截器

与SpringMVC类似，WebSocket也支持拦截器。在握手之前，可以通过识别用户身份来实现辅助操作。例如，我们可以从cookie中获取用户信息，并将其写入消息的全局属性请求头。

实现方式主要是通过拦截器在握手过程中进行用户身份验证，并将用户信息存储在全局属性中，以便在整个WebSocket连接的生命周期内使用。

```java
@Slf4j
public class AuthHandshakeInterceptor extends HttpSessionHandshakeInterceptor {
    @Autowired
    private UserService userService;

    /**
     * 握手前，进行用户身份校验识别,  继续握手返回true, 中断握手返回false. 通过attributes参数设置登录的用户信息
     *
     * @param request
     * @param response
     * @param wsHandler
     * @param attributes: 即对应的是Message中的 simpSessionAttributes 请求头
     * @return
     * @throws Exception
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        System.out.println("开始握手");
        if (request instanceof ServletServerHttpRequest) {
            for (Cookie cookie : ((ServletServerHttpRequest) request).getServletRequest().getCookies()) {
                if ("l-login".equalsIgnoreCase(cookie.getName())) {
                    String val = cookie.getValue();
                    String uname = userService.getUsername(val);
                    log.info("获取登录用户: {}", uname);
                    attributes.put("uname", uname);
                    return true;
                }
            }
            return false;
        }
        return super.beforeHandshake(request, response, wsHandler, attributes);
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {
        System.out.println("握手结束");
        super.afterHandshake(request, response, wsHandler, ex);
    }
}
```

上面的拦截器可以通过cookie来识别用户身份。当用户登录成功后，将用户名写入请求头uname中。这样，在后续的WebSocket通信过程中，就可以通过访问请求头uname来获取当前登录的用户信息

### 4. 用户登录

我们还是基于springmvc搭建一个用户的登录入口，直接基于内存做一个最简单的用户登录管理

```java
@Slf4j
@Service
public class UserService {
    private Map<String, String> userCache;

    @PostConstruct
    public void init() {
        userCache = new HashMap<>();
    }

    public String login(String uname) {
        return userCache.computeIfAbsent(uname, s -> UUID.randomUUID().toString());
    }

    public String getUsername(String session) {
        for (Map.Entry<String, String> entry : userCache.entrySet()) {
            if (entry.getValue().equalsIgnoreCase(session)) {
                return entry.getKey();
            }
        }
        return null;
    }

    public String getUsernameByCookie() {
        ServletRequestAttributes requestAttr = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes());
        if (requestAttr != null) {
            HttpServletRequest request = requestAttr.getRequest();
            if (request.getCookies() == null) {
                return null;
            }

            Cookie ck = Arrays.stream(request.getCookies()).filter(s -> s.getName().equalsIgnoreCase("l-login")).findAny().orElse(null);
            if (ck != null) {
                return getUsername(ck.getValue());
            }
        }
        return null;
    }
}
```


新增一个用户登录的入口，用户登录成功之后，将session写入cookie，有效期30天

```java
@Controller
public class ChatController {
    @Autowired
    private UserService userService;

    private static final int COOKIE_AGE = 30 * 86400;

    public static Cookie newCookie(String key, String session) {
        return newCookie(key, session, "/", COOKIE_AGE);
    }

    public static Cookie newCookie(String key, String session, String path, int maxAge) {
        Cookie cookie = new Cookie(key, session);
        cookie.setPath(path);
        cookie.setMaxAge(maxAge);
        return cookie;
    }

    @GetMapping(path = "login")
    @ResponseBody
    public String login(String name, HttpServletResponse response) {
        String sessionId = userService.login(name);
        response.addCookie(newCookie("l-login", sessionId));
        return sessionId;
    }
}
```

### 5. ws聊天实现

接下来我们开始写登录聊天的相关业务逻辑

**后端实现**

首先提供一个消息转发的后端接口

```java
@Controller
public class ChatController {

    /**
     * 当接受到客户端发送的消息时, 发送的路径是： /app/hello (这个/app前缀是 StompConfiguration 中的配置的)
     * 将返回结果推送给所有订阅了 /topic/chat/channel 的消费者
     *
     * @param content
     * @return
     */
    @MessageMapping("/hello/{channel}")
    public void sayHello(String content, @DestinationVariable("channel") String channel, SimpMessageHeaderAccessor headerAccessor) {
        String text = String.format("【%s】发送内容：%s", headerAccessor.getSessionAttributes().get("uname"), content);
        WsAnswerHelper.publish("/topic/chat/" + channel, text);
    }
}
```

注意上面的实现，有几个关键信息

1. `@MessageMapping("/hello/{channel}")`

这里的`{channel}`是一个传参形式，表示接收不同目标来源的消息；其取值通过`DestinationVariable("channel") String channel` 来获取

举个简单的例子：

- 客户端往 `app/hello/globalChannel` 发送的消息，会被后端转发给 `/topic/chat/globalChannel`
- 客户端往 `app/hello/signleChannel` 发送的消息，会被后端转发给 `/topic/chat/signleChannel`

2. `headerAccessor.getSessionAttributes().get("uname")`

从请求头中获取用户身份，没错，这里的uname就是在上面的拦截器 `AuthHandshakeInterceptor` 写入的

3. 消息发送

写了一个简单的工具类，实现后端给客户端发送消息， `WsAnswerHelper`实现如下

```java
@Component
public class WsAnswerHelper {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    private static WsAnswerHelper instance;

    @PostConstruct
    public void init() {
        WsAnswerHelper.instance = this;
    }

    public static void publish(String destination, Object msg) {
        instance.simpMessagingTemplate.convertAndSend(destination, msg);
    }
}
```


最后再给出前端访问入口

```java
@Controller
public class ChatController {
    @GetMapping(path = "/")
    public String index(Model model) {
        return "index";
    }
}
```

**前端实现**

前端的实现和上一篇博文的基本没有太大差别，无非是多了一个登录


```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout">
<head>
    <title>Hello WebSocket</title>
    <link th:href="@{/main.css}" rel="stylesheet">
    <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="/js/jquery.js"></script>
    <script src="/js/sockjs.min.js"></script>
    <script src="/js/stomp.min.js"></script>
    <script src="/index.js"></script>
</head>
<body>

<div id="main-content" class="container">
    <div class="row">
        <div class="col-md-6">
            <form class="form-inline">
                <div class="form-group">
                    <label for="connect">WebSocket 连接:</label>
                    <input type="text" id="endpoint" class="form-control" value="globalChannel">
                    <input type="text" id="uname" class="form-control" value="一灰灰">
                    <button id="connect" class="btn btn-warning" type="submit">Connect</button>
                    <button id="disconnect" class="btn btn-danger" type="submit" disabled="disabled">Disconnect
                    </button>
                </div>
            </form>
        </div>
        <div class="col-md-6">
            <form class="form-inline">
                <div class="form-group">
                    <label for="name">send some message: </label>
                    <input type="text" id="name" class="form-control" placeholder="message here...">
                    <button id="send" class="btn btn-dark" type="submit">Send</button>
                </div>
            </form>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <table id="conversation" class="table table-striped">
                <thead>
                <tr>
                    <th>Greetings</th>
                </tr>
                </thead>
                <tbody id="greetings">
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>
```

js实现如下

```javascript
let stompClient = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    } else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

function connect() {
    // 首先进行登录
    const uname = $("#uname").val();
    // 第一步： 创建xhr对象
    let xhr = new XMLHttpRequest();
    // 第二步： 调用open函数 指定请求方式 与URL地址
    xhr.open('GET', 'http://localhost:8080/login?name=' + uname, false);
    // 第三步： 调用send函数 发起ajax请求
    xhr.send();

    // 其次建立ws链接
    const channel = $("#endpoint").val();
    const socket = new SockJS('/ws/chat/' + channel);
    stompClient = Stomp.over(socket);

    stompClient.connect({"uname": $("#uname").val()}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        let topic = '/topic/chat/' + channel;
        // showGreeting("链接成功! 欢迎: " + $("#uname").val());
        console.log("订阅:", topic);
        stompClient.subscribe(topic, function (greeting) {
            // 表示这个长连接，订阅了 "/topic/hello" , 这样后端像这个路径转发消息时，我们就可以拿到对应的返回
            console.log("resp: ", greeting.body)
            showGreeting(greeting.body);
        });
    });
    socket.onclose = disconnect;
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    const channel = $("#endpoint").val();
    const headers = {
        'u-name': $("#uname").val(),
    };
    // 表示将消息转发到哪个目标，类似与http请求中的path路径，对应的是后端 @MessageMapping 修饰的方法
    stompClient.send("/app/hello/" + channel, headers, JSON.stringify({'name': $("#name").val()}));
}

function showGreeting(message) {
    $("#greetings").prepend("<tr><td>" + message + "</td></tr>");
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function () {
        connect();
    });
    $("#disconnect").click(function () {
        disconnect();
    });
    $("#send").click(function () {
        sendName();
    });
});
```

和之前的示例相比，区别在于建立连接之前，先调用了登录接口实现自动登录


### 6. 示例演示

接下来我们演示一下，用户登录之后，再进行聊天的表现形式

![](/imgs/231204/00.gif)

面的示意图也可以看出，在相同channel之间的用户可以相互通信。聊天信息前面都会带上发送这个消息的用户名。这样可以方便用户识别和区分来自不同用户的聊天信息。


### 7. 小结

本文通过实例演示了WebSocket的身份鉴权，其底层依然是借助Cookie来实现用户身份识别。与常规的Cookie鉴权不同之处在于，在WebSocket连接的生命周期内，通过HttpSessionHandshakeInterceptor拦截器来解析用户身份，并将相关信息写入到请求头中，以供其他地方进行使用。

本文的主要目的是为大家演示如何实现WebSocket的身份识别验证，整体的功能相对较少。以下是一些可能的应用场景和实现方式：

- 当一个用户加入聊天室时，系统可以通过广播一个通知来告知其他用户。具体实现方式可以是，在用户加入聊天室时，服务器将该用户的身份信息发送给所有已连接的客户端，客户端收到通知后可以在界面上显示相应的提示信息。
- 当一个用户离开聊天室时，系统同样可以通过广播一个通知来告知其他用户。具体实现方式可以是，在用户离开聊天室时，服务器将该用户的身份信息发送给所有已连接的客户端，客户端收到通知后可以在界面上移除相应的提示信息。
- 如现在一个订阅对应一个websocket连接，那么是否可以一个ws连接，通过订阅不同的topic，来实现多群组聊天的功能呢？

下篇博文将探讨如何实现以下功能：

1. 当一个用户加入聊天时，系统广播一个通知。
2. 当用户离开聊天时，系统广播一个通知。
3. 使用一个WebSocket连接，通过订阅不同的主题来实现多群组聊天的功能。

敬请期待下篇博文！我是你们的好朋友一灰灰


## II. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/207-websocket-chat](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/207-websocket-chat)


---
order: 4
title: 4.SpringBoot WebSocket进阶：如何利用消息拦截器优化聊天功能？
tag: 
  - WebSocket
  - STOMP
category: 
  - WEB系列
  - WebSocket
date: 2023-12-18 14:23:43
keywords:
  - SpringBoot
  - WebSocket
  - STOMP
---

在上一篇文章中，我们成功地为WebSocket的聊天应用添加了身份验证功能。然而，当时遗留了一个关键问题：当一个新用户加入群聊时，我们希望向群聊内的其他成员发送一条欢迎消息，以告知他们有新朋友加入了。那么，如何实现这一需求呢？

接下来，我们将重点介绍如何使用`ChannelInterceptor`来实现加入/退出群聊的通知功能。

<!-- more -->


## I. 实例演示

### 1. 项目搭建

项目搭建过程与前文类似，请直接参考上文 或者 查看文末的项目源码

### 2. WebSocket配置

在之前介绍的几篇博文中，我们提到了通过实现接口`WebSocketMessageBrokerConfigure`在之前介绍的几篇博文中，我们提到了通过实现接口`WebSocketMessageBrokerConfigurer` 来进行 WebSocket 的配置。

本文的重点正是在这个配置类中进行实现，因此我们将借此机会回顾一下之前的内容。

- 首先，我们需要创建一个配置类，并实现 `WebSocketMessageBrokerConfigurer` 接口。然后，我们可以重写其中的方法来配置 WebSocket 的相关参数和消息代理。
- 在 `configureMessageBroker` 方法中，我们可以指定使用的消息代理（例如：SimpleBroker）以及对应的前缀（用于路由消息）。同时，我们还可以设置订阅者模式（`subscriptionChannel`）和广播模式（`publisherChannel`），以便在不同的场景下使用不同的通信方式。
- 接下来，在 `registerStompEndpoints` 方法中，我们可以注册一个或多个端点（`endpoint`），并为每个端点指定一个路径（`path`）。这样，客户端就可以通过这个路径与服务器进行 WebSocket 通信了。
- 最后，在 `addInterceptors` 方法中，我们可以添加一些拦截器（`interceptor`），用于处理 WebSocket 连接、消息发送和接收等过程中的一些逻辑。例如，我们可以添加一个身份验证拦截器，用于验证客户端的身份信息。


 `WebSocketMessageBrokerConfigurer` 接口允许我们配置 Stomp 协议的各种属性，包括端点、拦截器、消息转换器等。

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
     * 即客户端创建ws时，指定的地址, let socket = new WebSocket("ws://ws/hello");
     *
     * @param registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint指定了客户端建立连接时的请求地址
        registry.addEndpoint("/ws/chat/{channel}"
                // 设置拦截器，从cookie中识别出登录用户
                .addInterceptors(authHandshakeInterceptor())
                .withSockJS();
    }

    /**
     * 定义接收客户端发送消息的拦截器
     *
     * @param registration
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new SocketInChannelInterceptor());
    }

    /**
     * 定义后端返回消息给客户端的拦截器
     *
     * @param registration
     */
    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        registration.interceptors(new SocketOutChannelInterceptor());
    }
}
```

**configureMessageBroker()方法**

配置消息代理与消息转发


- `registry.enableSimpleBroker("/topic")`: 启用简单的消息代理，即对于客户端而言，前端需要订阅的就是这个路径，如对应 index.js中的 `stompClient.subscribe('/topic/hello', xx)`
- `registry.setApplicationDestinationPrefixes("/app")`: 设置了目标转发的前缀为`/app`，客户端发送给`/app/xxx`的消息，会被转发给`@MessageMapping`注解修饰的方法

如我们定义的消息转发实现

```java
@Controller
public class ChatController {
    /**
     * 当接受到客户端发送的消息时, 发送的路径是： /app/hello/xxx (这个/app前缀是 StompConfiguration 中的配置的)
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

**registerStompEndpoints()方法**

注册连接端点

- `registry.addEndpoint("/ws/chat/{channel}")`: 添加端点，对应的就是客户端建立连接的url
- `.addInterceptors(authHandshakeInterceptor())`: 上文中用于身份识别的拦截器

此外对于跨域支持，也是在这里进行设置，如在上面的链式使用中，添加 `.setAllowedOrigins("*")`


**configureClientInboundChannel()方法**

用于设置接收客户端消息的相关配置参数，如线程连接参数、拦截器配置

```java
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.taskExecutor().corePoolSize(4).maxPoolSize(4).queueCapacity(100).keepAliveSeconds(60);
    registration.interceptors(new SocketInChannelInterceptor());
}
```

关于拦截器`SocketInChannelInterceptor`为我们自定义的实现，其内部实现了我们对聊天通知的核心逻辑；咱们下一节再看它


请注意上面配置的taskExecutor, 上面的几个配置参数和线程池的配置参数别无二致，一般建议是使用自定义的线程池来进行管理；方便监控


**configureClientOutboundChannel()方法**

与前面的使用姿势一致，唯一的区别则在于它主要设置的是服务端返回消息给客户端的相关配置，或者拦截


### 3. 管道拦截


在完成前面的配置后，接下来我们将进入管道拦截器的重点部分。我们的目标是在用户进入或离开群聊时，向群聊的其他成员推送一条通知。

为了实现这一目标，一个直观的方案是监控客户端的订阅和取消订阅操作，并在此基础上进行相应的操作。因此，我们的核心实现将基于之前定义的`SocketInChannelInterceptor`。

首先来看一下管道拦截器的接口签名

```java
public interface ChannelInterceptor {
    // 消息实际发送到channel之前调用
    @Nullable
    default Message<?> preSend(Message<?> message, MessageChannel channel) {
        return message;
    }

    // 消息发送到channel之后调用
    default void postSend(Message<?> message, MessageChannel channel, boolean sent) {
    }

    // 发送完毕之后调用，无论有没有异常，都会被回调
    default void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, @Nullable Exception ex) {
    }
}
```

对于消息广播通知，我们放在`afterSendCompletion`来实现，判断客户端的命令，对于订阅/取消订阅进行处理

```java
@Slf4j
public class SocketInChannelInterceptor implements ChannelInterceptor {
    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        log.info("IN: afterSendCompletion: {}, sent: {}", message, sent);
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(message);//消息头访问器
        if (headerAccessor.getCommand() == null) return;// 避免非stomp消息类型，例如心跳检测

        // 订阅成功，回复一个订阅成功的消息
        String uname = (String) headerAccessor.getSessionAttributes().getOrDefault("uname", "-");
        if (headerAccessor.getCommand() == StompCommand.SUBSCRIBE) {
            // 订阅成功，回复一个订阅成功的消息
            log.info("[IN-After] {} 订阅完成: {}", uname, message);
            WsAnswerHelper.publish((String) message.getHeaders().get("simpDestination"), "🔔【系统消息】：欢迎: 【" + uname + "】 加入聊天!");
        } else if (headerAccessor.getCommand() == StompCommand.UNSUBSCRIBE) {
            // fixme 需要注意，下面这个要求取消订阅时，将订阅的 destination 也传递过来，否则这个离开的消息不知道发送给谁
            log.info("[IN-After] {} 取消订阅: {}", uname, message);
            WsAnswerHelper.publish((String) message.getHeaders().get("simpSubscriptionId"), "🔔【系统消息】：【" + uname + "】 离开了聊天!");
        }

        ChannelInterceptor.super.afterSendCompletion(message, channel, sent, ex);
    }
}
```

上面的订阅实现相对简单，主要有下面几个关键知识点：

1. 封装消息头访问器： `StompHeaderAccessor.wrap(message)`， 简化请求相关信息的获取方式
2. 判断交互类型： `headerAccessor.getCommand()`
3. 获取请求头：
  - `headerAccessor.getHeader("simpDestination")`
  - `message.getHeaders().get("simpDestination")`


需要注意一点：直接可以从请求头中找到客户端订阅的是哪个群组(通过`destination`)，但是对于取消订阅时，则拿不到这个信息了，因此需要客户端再取消时，将这个关键信息回传给我们


### 4. 前端订阅/取消订阅

前面说到了需要再取消订阅的时候，告诉后端退出的是哪个群组，所以我们的客户端的使用上，需要做一些小的适配调整

完整的前端代码可以参考项目源码中的 `chat.html`， 下面是关键的订阅/取消订阅逻辑

```js
let subscribeMap = {};
/**
 * 订阅
 * @param ref
 * @param id
 */
function subscribe(ref, id, showMsgId) {
    const channel = $(`#${id}`).val();
    console.log("准备订阅: ", channel);

    SUBS_ID = "/topic/chat/" + channel;

    if (ref.classList.contains('btn-success')) {
        if (stompClient == null) {
            alert("请先建立链接");
            return;
        }

        // 执行订阅
        ref.textContent = '订阅成功';
        ref.classList.remove('btn-success');
        ref.classList.add('btn-danger');
        $(`#${id}`).prop("disabled", true);

        // 订阅，并保存返回的对象，用户后续的取消订阅
        subscribeMap[channel] = stompClient.subscribe('/topic/chat/' + channel, function (greeting) {
                // 表示这个长连接，订阅了 "/topic/hello" , 这样后端像这个路径转发消息时，我们就可以拿到对应的返回
                console.log("resp: ", greeting.body)
                showGreeting(showMsgId, greeting.body);
            }, {id: SUBS_ID}
        )
    } else {
        // 取消订阅
        ref.textContent = '开始订阅';
        ref.classList.add('btn-success');
        ref.classList.remove('btn-danger');
        $(`#${id}`).prop("disabled", false);
        // 下面这种取消订阅方式，和if中的取消订阅方式等价
        // stompClient.unsubscribe(SUBS_ID);
        if (subscribeMap[channel]) {
            subscribeMap[channel].unsubscribe();
            subscribeMap[channel] = null;
        }
    }
}
```

再上面的实现中，使用一个对象`subscribeMap`来存储订阅关系，并设置了订阅的ID 正好等于订阅的`channel`, 这样在订阅/取消订阅时，都会新增一个id的请求头，如下图所示，这样后端就可以根据这个id来做离开群聊的广播通知

![](/imgs/231218/00.jpg)

### 5. 效果演示

接下来我们实际演示一下，开始订阅/和结束订阅时，其他的小伙伴是否可以收到相关的提示消息

![](/imgs/231218/01.gif)


从上图可以比较直观的看到，当一个用户加入群聊时，其他用户/自己均可以正常收到对应的系统通知消息；离开群聊时，因为取消了订阅所以也就只有其他的小伙伴能收到系统消息，而自己是收不到的


### 6. 小结

本文主要介绍了管道拦截器，用于在接收和发送客户端消息时进行定制开发，以满足特定需求场景。

目前为止，我们所讨论的都是与群聊相关的内容。然而，如果后台系统希望向用户推送私人消息，例如提醒用户在线时间过长需要休息的提示消息，应该如何实现呢？


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/207-websocket-chat](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-case/207-websocket-chat)


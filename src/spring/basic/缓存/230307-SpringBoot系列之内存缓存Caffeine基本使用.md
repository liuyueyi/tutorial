---
order: 1
title: 1.内存缓存Caffeine基本使用
tag:
  - Caffiene
category:
  - SpringBoot
  - 中间件
  - Caffiene
date: 2023-03-06 22:55:36
keywords:
  - Caffiene
  - 内存缓存
---

Caffeine作为当下本地缓存的王者被大量的应用再实际的项目中，可以有效的提高服务吞吐率、qps，降低rt

本文将简单介绍下Caffeine的使用姿势


<!-- more -->

## 项目配置

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发


```xml
<dependencies>
    <dependency>
        <groupId>com.github.ben-manes.caffeine</groupId>
        <artifactId>caffeine</artifactId>
    </dependency>
</dependencies>
```

## 使用实例

引入上面的jar包之后，就可以进入caffeine的使用环节了；我们主要依照官方wiki来进行演练

> * [Home zh CN · ben-manes/caffeine Wiki](https://github.com/ben-manes/caffeine/wiki/Home-zh-CN)


caffeine提供了四种缓存策略，主要是基于手动添加/自动添加，同步/异步来进行区分

其基本使用姿势于Guava差不多

### 1. 手动加载

```java
private LoadingCache<String, Integer> autoCache;
private AtomicInteger idGen;
public CacheService() {
      // 手动缓存加载方式
      idGen = new AtomicInteger(100);
      uidCache = Caffeine.newBuilder()
              // 设置写入后五分钟失效
              .expireAfterWrite(5, TimeUnit.MINUTES)
              // 设置最多的缓存数量
              .maximumSize(100)
              .build();
}
```

#### 1.1 三种失效策略

注意参数设置，我们先看一下失效策略，共有下面几种

**权重：**

- maximumSize: 基于容量策略，当缓存内元素个数超过时，通过基于就近度和频率的算法来驱逐掉不会再被使用到的元素
- maximumWeight: 基于权重的容量策略，主要应用于缓存中的元素存在不同的权重场景

**时间：**

- expireAfterAccess: 基于访问时间
- expireAfterWrite: 基于写入时间
- expireAfter: 可以根据读更新写入来调整有效期


**引用：**

- weakKeys: 保存的key为弱引用
- weakValues: 保存的value会使用弱引用
- softValues: 保存的value使用软引用

弱引用：这允许在GC的过程中，当没有被任何强引用指向的时候去将缓存元素回收

软引用：在GC过程中被软引用的对象将会被通过LRU算法回收

#### 1.2 缓存增删查姿势

接下来我们看一下手动方式的使用

```java
public void getUid(String session) {
    // 重新再取一次，这次应该就不是重新初始化了
    Integer uid = uidCache.getIfPresent(session);
    System.out.println("查看缓存! 当没有的时候返回的是 uid: " + uid);

    // 第二个参数表示当不存在时，初始化一个，并写入缓存中
    uid = uidCache.get(session, (key) -> 10);
    System.out.println("初始化一个之后，返回的是: " + uid);

    // 移除缓存
    uidCache.invalidate(session);

    // 手动添加一个缓存
    uidCache.put(session + "_2", 11);

    // 查看所有的额缓存
    Map map = uidCache.asMap();
    System.out.println("total: " + map);

    // 干掉所有的缓存
    uidCache.invalidateAll();
}
```

**查询缓存&添加缓存**

- `getIfPresent(key)`: 不存在时，返回null
- `get(key, (key) -> {value初始化策略})`: 不存在时，会根据第二个lambda表达式来写入数据，这个就表示的是手动加载缓存
- `asMap`: 获取缓存所有数据

**添加缓存**

- `put(key, val)`: 主动添加缓存

**清空缓存**

- `invalidate`: 主动移除缓存
- `invalidateAll`: 失效所有缓存

执行完毕之后，输出日志:

```text
查看缓存! 当没有的时候返回的是 uid: null
初始化一个之后，返回的是: 10
total: {02228476-bcd9-412d-b437-bf0092c4a5f6_2=11}
```

### 2. 自动加载

在创建的时候，就指定缓存未命中时的加载规则

```java
// 在创建时，自动指定加载规则
private LoadingCache<String, Integer> autoCache;
private AtomicInteger idGen;

public CacheService() {
    // 手动缓存加载方式
    idGen = new AtomicInteger(100);
    autoCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(100)
            .build(new CacheLoader<String, Integer>() {
                @Override
                public @Nullable Integer load(@NonNull String key) throws Exception {
                    return idGen.getAndAdd(1);
                }
            });
}
```

它的配置，与前面介绍的一致；主要的区别点在于build时，确定缓存值的获取方式

#### 2.1 缓存使用姿势

```java
public void autoGetUid(String session) {
    Integer uid = autoCache.getIfPresent(session);
    System.out.println("自动加载，没有时返回: " + uid);

    uid = autoCache.get(session);
    System.out.println("自动加载，没有时自动加载一个: " + uid);

    // 批量查询
    List<String> keys = Arrays.asList(session, session + "_1");
    Map<String, Integer> map = autoCache.getAll(keys);
    System.out.println("批量获取，一个存在一个不存在时：" + map);

    // 手动加一个
    autoCache.put(session + "_2", 11);
    Map total = autoCache.asMap();
    System.out.println("total: " + total);
}
```

与前面的区别在于获取缓存值的方式

- get(key): 不用传第二个参数，直接传key获取对应的缓存值，如果没有自动加载数据
- getAll(keys): 可以批量获取数据，若某个key不再缓存中，会自动加载；在里面的则直接使用缓存的


实际输出结果如下

```
自动加载，没有时返回: null
自动加载，没有时自动加载一个: 100
批量获取，一个存在一个不存在时：{02228476-bcd9-412d-b437-bf0092c4a5f6=100, 02228476-bcd9-412d-b437-bf0092c4a5f6_1=101}
total: {02228476-bcd9-412d-b437-bf0092c4a5f6_2=11, 02228476-bcd9-412d-b437-bf0092c4a5f6_1=101, 02228476-bcd9-412d-b437-bf0092c4a5f6=100}
```

### 3.异步手动加载

异步，主要是值在获取换粗内容时，采用的异步策略；使用与前面没有什么太大差别

```java
// 手动异步加载缓存
private AsyncCache<String, Integer> asyncUidCache;

public CacheService() {
    asyncUidCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(100)
            .buildAsync();
}
```

#### 3.1 缓存使用姿势

```java
public void asyncGetUid(String session) throws ExecutionException, InterruptedException {
    // 重新再取一次，这次应该就不是重新初始化了
    CompletableFuture<Integer> uid = asyncUidCache.getIfPresent(session);
    System.out.println("查看缓存! 当没有的时候返回的是 uid: " + (uid == null ? "null" : uid.get()));

    // 第二个参数表示当不存在时，初始化一个，并写入缓存中
    uid = asyncUidCache.get(session, (key) -> 10);
    System.out.println("初始化一个之后，返回的是: " + uid.get());

    // 手动塞入一个缓存
    asyncUidCache.put(session + "_2", CompletableFuture.supplyAsync(() -> 12));

    // 移除缓存
    asyncUidCache.synchronous().invalidate(session);
    // 查看所有的额缓存
    System.out.println("print total cache:");
    for (Map.Entry<String, CompletableFuture<Integer>> sub : asyncUidCache.asMap().entrySet()) {
        System.out.println(sub.getKey() + "==>" + sub.getValue().get());
    }
    System.out.println("total over");
}
```

- getIfPresent: 存在时返回CompletableFuture，不存在时返回null，因此注意npe的问题
- get(key, Function<>): 第二个参数表示加载数据的逻辑
- put(key, CompletableFuture<>): 手动加入缓存，注意这里也不是直接加一个具体的value到缓存
- synchronous().invalidate() : 同步清除缓存
- getAll: 一次获取多个缓存，同样的是在缓存的取缓存，不在的根据第二个传参进行加载


与前面相比，使用姿势差不多，唯一注意的是，获取的并不是直接的结果，而是CompletableFuture，上面执行之后的输出如下：

```text
查看缓存! 当没有的时候返回的是 uid: null
初始化一个之后，返回的是: 10
print total cache:
5dd53310-aec7-42a5-957e-f7492719c29d_2==>12
total over
```


### 4. 异步自动加载

在定义缓存时，就指定了缓存不存在的加载逻辑；与第二个相比区别在于这里是异步加载数据到缓存中

```java
private AtomicInteger idGen;
// 自动异步加载缓存
private AsyncLoadingCache<String, Integer> asyncAutoCache;
public CacheService() {
  idGen = new AtomicInteger(100);
  asyncAutoCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(100)
            .buildAsync(new CacheLoader<String, Integer>() {
                @Override
                public @Nullable Integer load(@NonNull String key) throws Exception {
                    return idGen.getAndAdd(1);
                }
            });
}
```

#### 4.1 缓存使用姿势

```java
public void asyncAutoGetUid(String session) {
    try {
        CompletableFuture<Integer> uid = asyncAutoCache.getIfPresent(session);
        System.out.println("自动加载，没有时返回: " + (uid == null ? "null" : uid.get()));

        uid = asyncAutoCache.get(session);
        System.out.println("自动加载，没有时自动加载一个: " + uid.get());

        // 批量查询
        List<String> keys = Arrays.asList(session, session + "_1");
        CompletableFuture<Map<String, Integer>> map = asyncAutoCache.getAll(keys);
        System.out.println("批量获取，一个存在一个不存在时：" + map.get());
        
        // 手动加一个
        asyncAutoCache.put(session + "_2", CompletableFuture.supplyAsync(() -> 11));
        
        // 查看所有的额缓存
        System.out.println("print total cache:");
        for (Map.Entry<String, CompletableFuture<Integer>> sub : asyncAutoCache.asMap().entrySet()) {
            System.out.println(sub.getKey() + "==>" + sub.getValue().get());
        }
        System.out.println("total over");

        // 清空所有缓存
        asyncAutoCache.synchronous().invalidateAll();
      } catch (Exception e) {
        e.printStackTrace();
    }
}
```

输出：

```text
自动加载，没有时返回: null
自动加载，没有时自动加载一个: 102
批量获取，一个存在一个不存在时：{5dd53310-aec7-42a5-957e-f7492719c29d=102, 5dd53310-aec7-42a5-957e-f7492719c29d_1=103}
print total cache:
5dd53310-aec7-42a5-957e-f7492719c29d_2==>11
5dd53310-aec7-42a5-957e-f7492719c29d_1==>103
5dd53310-aec7-42a5-957e-f7492719c29d==>102
total over
```

## 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/)

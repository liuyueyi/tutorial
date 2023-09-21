---
order: 3
title: 3.内存缓存Caffiene自定义CacheManager
tag:
  - Caffiene
category:
  - SpringBoot
  - 中间件
  - Caffiene
date: 2023-03-09 17:55:36
keywords:
  - Caffiene
  - 内存缓存
---

上一篇介绍了Caffiene整合Spring的缓存注解@Cacheable，在这篇示例中，所有的缓存公用，但是实际的场景中，我们可能会更希望针对不同的场景，配置不同的缓存（比如我的关键数据，虽然访问频率可能没那么高，但是每次实际读取的成本很高，又不怎么变动，我希望可以更长久的缓存；不希望这些数据因为缓存的淘汰策略被其他的热点数据给淘汰掉），那么可以怎么处理呢？

接下来我们来看一下两种不同的方式，来实现上面的诉求

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

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
</dependencies>
```

与前面不同，我们不需要在配置文件中指定缓存类型以及caffeine的相关条件参数，直接放在配置类中

### 2. 配置类

```java
@Configuration
public class CacheConfig {

    @Primary
    @Bean("customCacheManager")
    public CacheManager customCacheManager() {
        SimpleCacheManager simpleCacheManager = new SimpleCacheManager();
        List<Cache> cacheList = new ArrayList<>();
        cacheList.add(customCache());
        simpleCacheManager.setCaches(cacheList);
        return simpleCacheManager;
    }

    public Cache customCache() {
        return new CaffeineCache("customCache", Caffeine.newBuilder()
                .maximumSize(200)
                .initialCapacity(100)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats()
                .build(),
                true);
    }
}
```

注意上面的 cacheList，其中传入的就是`Cache`对象，每个Cache对象就可以理解为一个缓存实例，重点注意构造参数中的第一个`customCache`，这个就是后面缓存具体使用时，注解中的`cacheNames`属性

## 使用实例

### 1. SimpleCacheManager 使用实例

```java
@Service
@CacheConfig(cacheNames = "customCache", cacheManager = "customCacheManager")
public class AnoCacheService {

    /**
     * 用一个map来模拟存储
     */
    private Map<Integer, User> userDb = new ConcurrentHashMap<>();

    /**
     * 添加数据，并保存到缓存中, 不管缓存中有没有，都会更新缓存
     *
     * @param user
     */
    @CachePut(key = "#user.uid")
    public User saveUser(User user) {
        userDb.put(user.getUid(), user);
        return user;
    }

    /**
     * 优先从缓存中获取数据，若不存在，则从 userDb 中查询，并会将结果写入到缓存中
     *
     * @param userId
     * @return
     */
    @Cacheable(key = "#userId")
    public User getUser(int userId) {
        System.out.println("doGetUser from DB:" + userId);
        return userDb.get(userId);
    }

    @CacheEvict(key = "#userId")
    public void removeUser(int userId) {
        userDb.remove(userId);
    }

}
```

重点注意一下上面的`@CacheConfig`，它定义了这个类中的的缓存，都使用 `customCacheManager` 缓存管理器，且具体的缓存为定义的`customCache` （改成其他的会报错）

从上面的配置声明，也可以看出，当我们希望使用多个缓存时，可以直接如下面这种方式进行扩展即可

```java
@Primary
@Bean("customCacheManager")
public CacheManager customCacheManager() {
    SimpleCacheManager simpleCacheManager = new SimpleCacheManager();
    List<Cache> cacheList = new ArrayList<>();
    cacheList.add(customCache());
    cacheList.add(customCache2());
    simpleCacheManager.setCaches(cacheList);
    return simpleCacheManager;
}

public Cache customCache() {
    return new CaffeineCache("customCache", Caffeine.newBuilder()
            .maximumSize(200)
            .initialCapacity(100)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .recordStats()
            .build(),
            true);
}

public Cache customCache2() {
    return new CaffeineCache("customCache2", Caffeine.newBuilder()
            .maximumSize(100)
            .initialCapacity(10)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .recordStats()
            .build(),
            true);
}
```

### 2. CaffeineCacheManager 方式

除了上面这种方式之外，我们当然也可以再额外定义一个CacheManager，如下

```java
@Bean("otherCacheManager")
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(Caffeine.newBuilder()
            // 设置过期时间，写入后五分钟国企
            .expireAfterWrite(5, TimeUnit.MINUTES)
            // 初始化缓存空间大小
            .initialCapacity(100)
            // 最大的缓存条数
            .maximumSize(200));
    return cacheManager;
}
```


使用上面这种方式，cacheName可以不需要指定，具体使用如下

```java
/**
 * 1. cacheManager 指定具体的缓存管理器
 * 2. cacheName 表示这个缓存前缀
 * 3. 通过CacheConfig 注解进行修饰，表示适用于这个类下的所有公共方法
 *
 * @author YiHui
 * @date 2023/3/5
 */
@Service
@CacheConfig(cacheNames = "ano2", cacheManager = "otherCacheManager")
public class AnoCacheService2 {

    /**
     * 用一个map来模拟存储
     */
    private Map<Integer, User> userDb = new ConcurrentHashMap<>();

    /**
     * 添加数据，并保存到缓存中, 不管缓存中有没有，都会更新缓存
     *
     * @param user
     */
    @CachePut(key = "#user.uid")
    public User saveUser(User user) {
        userDb.put(user.getUid(), user);
        return user;
    }

    /**
     * 优先从缓存中获取数据，若不存在，则从 userDb 中查询，并会将结果写入到缓存中
     *
     * @param userId
     * @return
     */
    @Cacheable(key = "#userId")
    public User getUser(int userId) {
        System.out.println("doGetUser from DB:" + userId);
        return userDb.get(userId);
    }

    @CacheEvict(key = "#userId")
    public void removeUser(int userId) {
        userDb.remove(userId);
    }

}
```

方法的内部实现完全一致；重点看`@CacheConfig`中的属性值

- cacheNames 表示这个缓存前缀，没有约束限制

### 3. 测试

上面介绍了两种使用不同缓存的姿势：

- SimpleCacheManager: 定义多个Cache
- 多个CacheManager

我们写个简单的验证上面两个CacheManager表示不同缓存的测试用例

```java
@RestController
public class TestController {

    @Autowired
    private AnoCacheService anoCacheService;

    @Autowired
    private AnoCacheService2 anoCacheService2;

    private AtomicInteger uid = new AtomicInteger(1);
    private AtomicInteger uid2 = new AtomicInteger(1);

    @RequestMapping(path = "save")
    public User save(String name,
                     @RequestParam(required = false, defaultValue = "1") Integer type) {
        if (type == 1) {
            return anoCacheService.saveUser(new User(uid.getAndAdd(1), name));
        } else {
            return anoCacheService2.saveUser(new User(uid2.getAndAdd(1), name));
        }
    }

    @RequestMapping(path = "query")
    public User query(int userId, @RequestParam(required = false, defaultValue = "1") Integer type) {
        User user = type == 1 ? anoCacheService.getUser(userId) : anoCacheService2.getUser(userId);
        return user == null ? new User() : user;
    }

    @RequestMapping(path = "remove")
    public String remove(int userId, @RequestParam(required = false, defaultValue = "1") Integer type) {
        if (type == 1) anoCacheService.removeUser(userId);
        else anoCacheService2.removeUser(userId);
        return "ok";
    }

}
```

操作步骤：

- anoCacheService 写入缓存
- anoCacheService2 查看缓存，此时不应该能查到前面写入的缓存

![](/imgs/230309/00.jpg)


## 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/501-cache-caffeine-special](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/501-cache-caffeine-special)

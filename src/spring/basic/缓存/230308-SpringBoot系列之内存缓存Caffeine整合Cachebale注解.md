---
order: 2
title: 2.内存Caffeine整合Cachebale注解
tag:
  - Caffiene
category:
  - SpringBoot
  - 中间件
  - Caffiene
date: 2023-03-08 22:55:36
keywords:
  - Caffiene
  - 内存缓存
---

前面一片文章虽说介绍了Caffeine的使用方式，但是更多的是偏向于基础的Caffeine用法；接下来这边博文将给大家介绍一下Caffeine结合Spring的`@Cacheable`注解，来实现内部缓存的使用姿势

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

### 2. 配置

SpringBoot官方对Caffeine的集成，提供了非常好的支持，比如本文介绍的在使用 `@Cacheable` 注解来处理缓存时，我们无需额外操作，直接在配置文件来实现缓存的指定，以及对应的Caffeine相关配置限定

核心配置如下 application.yml 

```yaml
# 指定全局默认的缓存策略
spring:
  cache:
    type: caffeine
    caffeine:
      spec: initialCapacity=10,maximumSize=200,expireAfterWrite=5m
```

上面的 spring.cache.type 主要用来表明缓存注解的具体缓存实现为 Caffeine，当然还可以是Guava、redis等

其次就是 `spring.cache.caffeine.spec`， 它指定了Caffeine的初始化容量大小，最大个数，失效时间等 （无特殊场景时，所有的缓存注解都是公用这个配置的）


## 使用实例

### 1. 开启缓存注解支持

首先在启动类上添加 `@EnableCaching` 注解，注意若不加则缓存不会生效

```java
@EnableCaching
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

### 2. 使用实例

我们定义一个UserService，主要是用来操作用户相关信息，现在先定义一个`User`实体类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer uid;
    private String uname;
}
```

然后添加增删查

```java
@Service
// 这个注释的是默认的缓存策略，此时对应的 cacheManager 由 spring.cache.caffeine.spec 来指定缓存规则
@CacheConfig(cacheNames = "customCache")
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

上面分别介绍了三个注解

- CachePut: 不管缓存有没有，都将方法的返回结果写入缓存中
- Cacheable: 先从缓存查，没有则执行方法，并塞入缓存
- CacheEvit: 失效缓存

其次在类上还有一个`@CacheConfig`注解，主要定义了一个 `cacheNames` 属性，当我们使用缓存注解时，需要注意的是这个cacheNames必须得有，否则就会报错

当一个类中所有缓存公用一个cacheNames时，可以直接在类上添加`@CacheConfig`来避免在每个地方都添加指定


### 3. 写个测试demo

```java
@RestController
public class TestController {

    @Autowired
    private AnoCacheService anoCacheService;
    private AtomicInteger uid = new AtomicInteger(1);

    @RequestMapping(path = "save")
    public User save(String name) {
        return anoCacheService.saveUser(new User(uid.getAndAdd(1), name));
    }

    @RequestMapping(path = "query")
    public User query(int userId) {
        User user = anoCacheService.getUser(userId);
        return user == null ? new User() : user;
    }

    @RequestMapping(path = "remove")
    public String remove(int userId) {
        anoCacheService.removeUser(userId);
        return "ok";
    }
}
```

我们来实际看一下，第一次没有数据时，返回的是不是空；当有数据之后，缓存是否会命中


![](/imgs/230308/00.gif)

### 4. 小结

这篇博文主要介绍了SpringBoot如何整合Caffeine，结合Spring的缓存注解，基于可以说是很低成本的就让我们的方法实现缓存功能，但是请注意，有几个注意点

1. 当我并不希望所有数据公用一个缓存时，怎么处理？
- 比如我有一些关键数据，虽然访问频率可能没那么高，但是还每次实际读取的成本很高，又不怎么变动，我希望可以更长久的缓存；
- 如果公用一个缓存，则有可能导致它们被其他的热点数据给挤下线了（超过最大数量限制给删除了）

2. 在实际使用时，需要特别注意，加了缓存注解之后，返回的实际上是缓存中的对象，如上面返回的是User对象还好，如果返回的是一个容器，那么直接像这些容器中进行额外的添加、删除元素，是直接影响缓存结果的


另外，查看本文推荐结合下面几篇博文一起享用，以获取更多的知识点

* [【DB系列】缓存注解@Cacheable @CacheEvit @CachePut使用姿势介绍 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2021/06/16/210616-SpringBoot%E7%BC%93%E5%AD%98%E6%B3%A8%E8%A7%A3-Cacheable-CacheEvit-CachePut%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF%E4%BB%8B%E7%BB%8D/)
* [【DB系列】SpringBoot缓存注解@Cacheable之自定义key策略及缓存失效时间指定 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2021/07/01/210701-SpringBoot%E7%BC%93%E5%AD%98%E6%B3%A8%E8%A7%A3-Cacheable%E4%B9%8B%E8%87%AA%E5%AE%9A%E4%B9%89key%E7%AD%96%E7%95%A5%E5%8F%8A%E7%BC%93%E5%AD%98%E5%A4%B1%E6%95%88%E6%97%B6%E9%97%B4%E6%8C%87%E5%AE%9A/)



## 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/500-cache-caffeine](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/500-cache-caffeine)

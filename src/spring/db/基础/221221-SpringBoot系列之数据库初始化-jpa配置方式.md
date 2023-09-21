---
sort: 3
title: 3.数据库初始化-jpa配置方式
tag:
  - MySql
category:
  - SpringBoot
  - DB系列
  - 初始化
date: 2022-12-21 10:59:32
keywords:
  - MySql
  - 数据库
  - 初始化
---

上一篇博文介绍如何使用`spring.datasource`来实现项目启动之后的数据库初始化，本文作为数据库初始化的第二篇，将主要介绍一下，如何使用`spring.jpa`的配置方式来实现相同的效果

<!-- more -->

## I. 项目搭建

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发


```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.hibernate</groupId>
        <artifactId>hibernate-core</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
</dependencies>
```

本文使用MySql数据库, 版本8.0.31


### 2. 配置

注意实现初始化数据库表操作的核心配置就在下面，重点关注

配置文件： `resources/application.yml`

```yml
# 默认的数据库名
database:
  name: story

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/${database.name}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password:
    initialization-mode: always

  jpa:
    show-sql: true
    generate-ddl: true
    hibernate:
      ddl-auto: update # 取值create/create-drop时，会根据Entity生成表之后，再使用import.sql文件导入初始化数据; 为update时，则执行的是 data.sql 

logging:
  level:
    root: info
    org:
      springframework:
        jdbc:
          core: debug
```

注意上面jpa的一个配置，其次就是上一篇博文中介绍的 `spring.datasource.initialization-mode` 同样需要将配置设置为 `always`


使用jpa的配置方式，将`ddl-auto`设置为`create`或者`create-drop`时，会自动搜索`@Entity`实体对象，并创建为对应的表



## II. 示例

### 1. 验证demo

接下来上面的工作准备完毕之后，我们先创建一个实体对象

```java
@Data
@DynamicUpdate
@DynamicInsert
@Entity
@Table(name = "user3")
public class User {
    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "third_account_id")
    private String thirdAccountId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "password")
    private String password;

    @Column(name = "login_type")
    private Integer loginType;

    @Column(name = "deleted")
    private Integer deleted;

    @Column(name = "create_time")
    private Timestamp createTime;

    @Column(name = "update_time")
    private Timestamp updateTime;
}
```

接下来我们的目标就是基于上面这个实体类生成对应的表结构

```java
@Slf4j
@SpringBootApplication
public class Application implements ApplicationRunner {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List list = jdbcTemplate.queryForList("select * from user3 limit 2");
        log.info("启动成功，初始化数据: {}\n{}", list.size(), list);
    }
}
```

直接启动项目之后，到数据库中将可以查到已经创建了一个库`user3`

![](/imgs/221221/01.jpg)


### 2. 初始化数据

上面的过程只是初始化了表结构，如果我们希望导入一些初始化数据，可以怎么办？

如上面的配置： `spring.jpa.hibernate.ddl-auto: update`，此时在资源目录下，新建 `data.sql` , 取值为

```sql
INSERT INTO `user3` (id, third_account_id, `user_name`, `password`, login_type, deleted)
VALUES (3, '333333-0f85-4dd5-845c-7c5df3746e92', 'data', 'data', 0, 0);
```

然后再次执行，既可以看到db中会新增一条数据

![](/spring-blog/imgs/221221/02.jpg)


若`spring.jpa.hibernate.ddl-auto: create`，则再资源目录下，新建`import.sql`文件，来实现数据初始化


### 3. 小结

使用Jpa的配置方式，总体来说和前面的介绍的spring.datasource的配置方式差别不大，jpa方式主要是基于`@Entity`来创建对应的表结构，且不会出现再次启动之后重复建表导致异常的问题（注意如上面data.sql中的数据插入依然会重复执行，会导致主键插入冲突）

本文中需要重点关注的几个配置:

- spring.datasource.initialization-mode: always 同样需要设置为always
- spring.jpa.generate-ddl: true 会根据@Entity注解的实体类生成对应数据表
- spring.jpa.hibernate.ddl-auto: create/create-drop 这两个取值时，再创建表之后执行import.sql文件导入测试数据；若取值为update，则会执行data.sql


本文作为数据初始化第二篇，推荐与前文对比阅读，收获更多的知识点 [【DB系列】 数据库初始化-datasource配置方式](https://spring.hhui.top/spring-blog/2022/12/21/221221-SpringBoot%E7%B3%BB%E5%88%97%E4%B9%8B%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96-datasource%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F/)


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/161-schema-init](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/161-schema-init)

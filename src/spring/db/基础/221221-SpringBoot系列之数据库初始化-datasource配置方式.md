---
sort: 2
title: 2.数据库初始化-datasource配置方式
tag:
  - MySql
category:
  - SpringBoot
  - DB系列
  - 初始化
date: 2022-12-21 09:57:22
keywords:
  - 数据库
  - MySql
  - 初始化
---

在我们的日常业务开发过程中，如果有db的相关操作，通常我们是直接建立好对应的库表结构，并初始化对应的数据，即更常见的情况下是我们在已有表结构基础之下，进行开发；
但是当我们是以项目形式工作时，更常见的做法是所有的库表结构变更、数据的初始、更新等都需要持有对应的sql变更，并保存在项目工程中，这也是使用liqubase的一个重要场景； 
将上面的问题进行简单的翻译一下，就是如何实现在项目启动之后执行相应的sql，实现数据库表的初始化？


本文将作为初始化方式的第一篇：基于SpringBoot的配置方式实现的数据初始化

<!-- more -->

## I. 项目搭建

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发


```xml
<dependencies>
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
    platform: mysql
    separator: ;
    data: classpath:config-data.sql
    #data-username: root
    #data-password:
    schema: classpath:config-schema.sql # schema必须也存在，若只存在data，data中的sql也不会被执行

# springboot 2.7+ 版本使用下面这个
#  sql:
#    init:
#      mode: always
#      data-location: classpath:config-data.sql
#      schema-location: classpath:init-schema.sql
logging:
  level:
    root: info
    org:
      springframework:
        jdbc:
          core: debug
```

上面的配置中，相比较于普通的数据库链接配置，多了几个配置项

- spring.datasource.initialization-mode: 取值为 always，改成其他的会导致sql不会被执行
- spring.datasource.platform: mysql
- spring.datasource.seprator: ;  这个表示sql之间的分隔符
- spring.datasource.data: classpath:config-data.sql  取值可以是数组，这里存的是初始化数据的sql文件地址
- spring.datasource.data-username:  上面data对应的sql文件执行用户名
- spring.datasource.data-password:  上面data对应的sql文件执行用户密码
- spring.datasource.schema: classpath:config-schema.sql   取值也可以是数组，这里存的是初始化表结构的sql文件地址

### 3. 初始化sql

上面指定了两个sql，一个是用于建表的ddl，一个是用于初始化数据的dml

`resources/config-schema.sql` 文件对应的内容如下

```sql
CREATE TABLE `user2`
(
    `id`               int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `third_account_id` varchar(128) NOT NULL DEFAULT '' COMMENT '第三方用户ID',
    `user_name`        varchar(64)  NOT NULL DEFAULT '' COMMENT '用户名',
    `password`         varchar(128) NOT NULL DEFAULT '' COMMENT '密码',
    `login_type`       tinyint      NOT NULL DEFAULT '0' COMMENT '登录方式: 0-微信登录，1-账号密码登录',
    `deleted`          tinyint      NOT NULL DEFAULT '0' COMMENT '是否删除',
    `create_time`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`id`),
    KEY                `key_third_account_id` (`third_account_id`),
    KEY                `user_name` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4  COMMENT='用户登录表';
```


`resources/config-data.sql` 文件对应的内容如下

```sql
INSERT INTO `user2` (id, third_account_id, `user_name`, `password`, login_type, deleted)
VALUES (2, '222222-0f85-4dd5-845c-7c5df3746e92', 'admin2', 'admin2', 0, 0);
```

## II. 示例

### 1. 验证demo

接下来上面的工作准备完毕之后，在我们启动项目之后，正常就会执行上面的两个sql，我们写一个简单的验证demo

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
        List list = jdbcTemplate.queryForList("select * from user2 limit 2");
        log.info("启动成功，初始化数据: {}\n{}", list.size(), list);
    }
}
```

![](/imgs/221221/00.jpg)


### 2. 问题记录

从上面的过程走下来，看起来很简单，但是在实际的使用过程中，很容易遇到不生效的问题，下面记录一下


#### 2.1 只有初始化数据data.sql，没有schema.sql时，不生效

当库表已经存在时，此时我们可能并没有上文中的`config-schema.sql`文件，此时对应的配置可能是

```yml

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/${database.name}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password:
    initialization-mode: always
    platform: mysql
    separator: ; # 默认为 ;
    data: classpath:config-data.sql
    #data-username: root
    #data-password:
    #schema: classpath:config-schema.sql # schema必须也存在，若只存在data，data中的sql也不会被执行
```


如上面所示，当我们只指定了data时，会发现data对应的sql文件也不会被执行；即要求schema对应的sql文件也必须同时存在


针对上面这种情况，可以考虑将data.sql中的语句，卸载schema.sql中


#### 2.2 版本问题导致配置不生效


在SpringBoot2.5+版本，使用 `spring.sql.init` 代替上面的配置项

```yml
# springboot 2.5+ 版本使用下面这个
spring:
  sql:
    init:
      mode: always
      data-location: classpath:config-data.sql
      schema-location: classpath:init-schema.sql
```

相关的配置参数说明如下

- `spring.sql.init.enabled`：是否启动初始化的开关，默认是true。如果不想执行初始化脚本，设置为false即可。通过-D的命令行参数会更容易控制。
- `spring.sql.init.username`和`spring.sql.init.password`：配置执行初始化脚本的用户名与密码。这个非常有必要，因为安全管理要求，通常给业务应用分配的用户对一些建表删表等命令没有权限。这样就可以与datasource中的用户分开管理。
- `spring.sql.init.schema-locations`：配置与schema变更相关的sql脚本，可配置多个（默认用;分割）
- `spring.sql.init.data-locations`：用来配置与数据相关的sql脚本，可配置多个（默认用;分割）
- `spring.sql.init.encoding`：配置脚本文件的编码
- `spring.sql.init.separator`：配置多个sql文件的分隔符，默认是;
- `spring.sql.init.continue-on-error`：如果执行脚本过程中碰到错误是否继续，默认是false`


#### 2.3 mode配置不对导致不生效

当配置完之后发，发现sql没有按照预期的执行，可以检查一下`spring.datasource.initialization-mode`配置是否存在，且值为`always`


#### 2.4 重复启动之后，报错

同样上面的项目，在第一次启动时，会执行schema对应的sql文件，创建表结构；执行data对应的sql文件，初始化数据；但是再次执行之后就会报错了，会提示表已经存在

即初始化是一次性的，第一次执行完毕之后，请将`spring.datasource.initialization-mode`设置为`none`


### 3. 小结

本文主要介绍了项目启动时，数据库的初始化方式，当然除了本文中介绍的`spring.datasource`配置之外，还有`spring.jpa`的配置方式

对于配置方式不太友好的地方则在于不好自适应控制，若表存在则不执行；若不存在则执行；后面将介绍如何使用`DataSourceInitializer`来实现自主可控的数据初始化，以及更现代化一些的基于liquibase的数据库版本管理记录


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/161-schema-init](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/161-schema-init)

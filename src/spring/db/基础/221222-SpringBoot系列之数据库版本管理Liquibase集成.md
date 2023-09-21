---
sort: 4
title: 4.数据库版本管理Liquibase集成
tag:
  - MySql
  - Liquibase
category:
  - SpringBoot
  - DB系列
  - Liquebase
date: 2022-12-22 12:52:35
keywords:
  - Liquebase
  - 数据库
  - 版本管理
---

前面几篇介绍了项目启动之后进行数据库初始化的几种方式，接下来我们看一下如何使用Liquibase来实现数据库版本管理

<!-- more -->

SpringBoot内置了对Liquibase的支持，在项目中使用非常简单

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
    <dependency>
        <groupId>org.liquibase</groupId>
        <artifactId>liquibase-core</artifactId>
        <version>3.8.0</version>
    </dependency>
</dependencies>
```

本文使用MySql数据库, 版本8.0.31; Liquibase的核心依赖`liquibase-core`，版本推荐使用SpringBoot配套的版本，一般来讲无需特殊指定


### 2. 配置

配置文件 `resources/application.yml`

```yml
# 默认的数据库名
database:
  name: tt

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/${database.name}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password:
  liquibase:
    change-log: classpath:liquibase/master.xml
    enabled: true

logging:
  level:
    root: info
    org:
      springframework:
        jdbc:
          core: debug
```


关键配置为 `spring.liquibase.change-log` 和 `spring.liquibase.enabled`

第一个指定的是change-log对应的xml文件，其内容如下

liquibase核心xml文件 `resources/liquibase/master.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.5.xsd">

    <include file="liquibase/changelog/000_initial_schema.xml" relativeToChangelogFile="false"/>

</databaseChangeLog>
```

上面的xml依赖了一个xml文件，如第一个主要定义的是初始化的表结构

`resources/changelog/000_initial_schema.xml` 对应的内容如下

```xml
<?xml version="1.0" encoding="utf-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.5.xsd">

    <property name="now" value="now()" dbms="mysql"/>
    <property name="autoIncrement" value="true"/>

    <changeSet id="00000000000001" author="YiHui">
        <sqlFile dbms="mysql" endDelimiter=";" encoding="UTF-8" path="liquibase/data/init_schema_221209.sql"/>
    </changeSet>

    <changeSet id="00000000000002" author="YiHui">
        <sqlFile dbms="mysql" endDelimiter=";" encoding="UTF-8" path="liquibase/data/init_data_221209.sql"/>
    </changeSet>
</databaseChangeLog>
```

在上面的配置文件中，核心点在 `<changeSet>` 其中id要求全局唯一，`sqlFile`表示这次变动对应的sql语句; 一个`<changeSet>`对应一次变更，注意每次变更完成之后，不能再修改（sql文件内容不能改），changeSet本身也不要再去修改

接下来再看一下对应的sql文件

`resources/liquibase/data/init_schema_221209.sql`对应的schema相关的表结构定义如下

```sql
CREATE TABLE `user`
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

`resources/liquibase/data/init_data_221209.sql`对应的初始化数据定义如下

```sql
INSERT INTO `user` (id, third_account_id, `user_name`, `password`, login_type, deleted)
VALUES (1, 'a7cb7228-0f85-4dd5-845c-7c5df3746e92', 'admin', 'admin', 0, 0);
```

## II. 项目演示

### 1. 测试

上面配置完毕之后，再主项目结构工程中无需特殊处理，我们写一个简单的启动测试一下

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
        List list = jdbcTemplate.queryForList("select * from user limit 2");
        log.info("项目启动成功，初始化数据: {}", list);
    }
}
```

直接执行之后看一下输出结果(再执行之前，请确保数据库已经创建成功了；若没有则会抛异常)

![](/imgs/221222/00.jpg)

### 2. 增量变更

上面演示的是初始化过程；再实际开发过程中，若存在增量的变更，比如现在需要新增一个测试数据，此时我们的操作流程可以如下


再`liquibase/`目录下新增一个`001_change_schema.xml`文件，后续的增量变更相关的`ChangeSet`都放在这个xml文件中；再master.xml文件中，添加上面xml文件的引入

```xml
    <include file="liquibase/changelog/001_change_schema.xml" relativeToChangelogFile="false"/>
```

其次就是 `resources/liquibase/changelog/001_change_schema.xml` 文件内容

```xml
<?xml version="1.0" encoding="utf-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.5.xsd">

    <property name="now" value="now()" dbms="mysql"/>
    <property name="autoIncrement" value="true"/>

    <!-- 后续出现新的变更时，每一个变更都新增一个对应的 changeSet  -->
    <changeSet id="00000000000003" author="YiHui">
        <sqlFile dbms="mysql" endDelimiter=";" encoding="UTF-8" path="liquibase/data/init_data_221212.sql"/>
    </changeSet>
</databaseChangeLog>
```

上面的`changeSet`中包含初始化相关的sql文件，内容如下

```sql
INSERT INTO `user` (id, third_account_id, `user_name`, `password`, login_type, deleted)
VALUES (2, 'a7cb7228-0f85-4dd5-845c-11123123', 'new', 'new', 0, 0);
```


再次启动验证一下，是否增加了新的数据

![](/spring-blog/imgs/221222/01.jpg)


### 3. 小结

本文主要介绍的是SpringBoot如何结合Liquibase来实现数据库版本管理，核心知识点介绍得不多，再实际使用的时候，重点注意

每次变更，都新增一个 `<changeSet>`，且保证所有的id唯一；当变更完成之后，不要再修改对应sql文件内容

> liquibase本身也有一些相关的知识点，如版本回滚，标签语义等，下篇博文再专门介绍Liquibase本身的核心知识点

如对项目启动之后数据初始话相关有兴趣的小伙伴，欢迎查看

* [【DB系列】数据库初始化-datasource配置方式 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2022/12/21/221221-SpringBoot%E7%B3%BB%E5%88%97%E4%B9%8B%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96-datasource%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F/)
* [【DB系列】数据库初始化-jpa配置方式 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2022/12/21/221221-SpringBoot%E7%B3%BB%E5%88%97%E4%B9%8B%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96-jpa%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F/)
* [【DB系列】数据库初始化-DataSourceInitializer方式 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2022/12/21/221221-SpringBoot%E7%B3%BB%E5%88%97%E4%B9%8B%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96-DataSourceInitializer%E6%96%B9%E5%BC%8F/)

## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/162-liquibase](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/162-liquibase)

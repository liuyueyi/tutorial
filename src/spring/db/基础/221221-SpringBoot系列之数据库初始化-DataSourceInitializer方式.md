---
order: 1
title: 1.数据库初始化-DataSourceInitializer方式
tag:
  - MySql
  - DataSourceInitializer
category:
  - SpringBoot
  - DB系列
  - 初始化
date: 2022-12-21 11:52:03
keywords:
  - 数据库
  - MySql
  - 初始化
---

前面介绍的两篇基于配置方式的数据库初始化方式，使用起来非常简单，但是有一个非常明显的问题，如何实现表结构存在时不再初始化，不存在时才执行？ 如果数据库也不存在，也需要初始化时创建，可行么？

接下来介绍一下如何使用DataSourceInitializer来实现自主可控的数据初始化

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


logging:
  level:
    root: info
    org:
      springframework:
        jdbc:
          core: debug
```

注意上面的配置，我们新定义了一个数据库的配置项 `database.name`， 主要是为了检测database是否存在，若不存在时，创建对应的数据库时使用


接下来是初始化sql脚本

`resources/init-schema.sql` 对应的初始化ddl

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

`resources/init-data.sql` 对用的初始化dml

```sql
INSERT INTO `user` (id, third_account_id, `user_name`, `password`, login_type, deleted)
VALUES (1, 'a7cb7228-0f85-4dd5-845c-7c5df3746e92', 'admin', 'admin', 0, 0);
```

## II. 初始化

### 1.初始化配置

```java
@Slf4j
@Configuration
public class DataSourceInit {

    /**
     * 初始化的表结构语句
     */
    @Value("classpath:init-schema.sql")
    private Resource schemaSql;
    /**
     * 初始化数据
     */
    @Value("classpath:init-data.sql")
    private Resource initData;

    @Value("${database.name}")
    private String database;

    @Bean
    public DataSourceInitializer dataSourceInitializer(final DataSource dataSource) {
        final DataSourceInitializer initializer = new DataSourceInitializer();
        // 设置数据源
        initializer.setDataSource(dataSource);
        initializer.setDatabasePopulator(databasePopulator());
        // true表示需要执行，false表示不需要初始化
        initializer.setEnabled(needInit(dataSource));
        return initializer;
    }

    private DatabasePopulator databasePopulator() {
        final ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScripts(schemaSql);
        populator.addScripts(initData);
        populator.setSeparator(";");
        return populator;
    }

    // 省略 needInit方法
}
```

我们这里主要是借助 DataSourceInitializer 来实现初始化，其核心有两个配置 

- DatabasePopulator: 通过`addScripts`来指定对应的sql文件
- DataSourceInitializer#setEnabled: 判断是否需要执行初始化


接下来重点需要看的就是needInit方法，我们再这个方法里面，需要判断数据库是否存在，若不存在时，则创建数据库；然后再判断表是否存在，以此来决定是否需要执行初始化方法


```java
    /**
     * 检测一下数据库中表是否存在，若存在则不初始化；否则基于 init-schema.sql 进行初始化表
     *
     * @param dataSource
     * @return
     */
    private boolean needInit(DataSource dataSource) {
        if (autoInitDatabase()) {
            return true;
        }
        // 根据是否存在表来判断是否需要执行sql操作
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        List list = jdbcTemplate.queryForList("SELECT table_name FROM information_schema.TABLES where table_name = 'user' and table_schema = '" + database + "';");
        boolean init = CollectionUtils.isEmpty(list);
        if (init) {
            log.info("库表不存在，执行建表及数据初始化");
        } else {
            log.info("表结构已存在，无需初始化");
        }
        return init;
    }


    /**
     * 数据库不存在时，尝试创建数据库
     */
    private boolean autoInitDatabase() {
        // 查询失败，可能是数据库不存在，尝试创建数据库之后再次测试
        URI url = URI.create(SpringUtil.getConfig("spring.datasource.url").substring(5));
        String uname = SpringUtil.getConfig("spring.datasource.username");
        String pwd = SpringUtil.getConfig("spring.datasource.password");
        try (Connection connection = DriverManager.getConnection("jdbc:mysql://" + url.getHost() + ":" + url.getPort() +
                "?useUnicode=true&characterEncoding=UTF-8&useSSL=false", uname, pwd);
             Statement statement = connection.createStatement()) {
            ResultSet set = statement.executeQuery("select schema_name from information_schema.schemata where schema_name = '" + database + "'");
            if (!set.next()) {
                // 不存在时，创建数据库
                String createDb = "CREATE DATABASE IF NOT EXISTS " + database;
                connection.setAutoCommit(false);
                statement.execute(createDb);
                connection.commit();
                log.info("创建数据库（{}）成功", database);
                if (set.isClosed()) {
                    set.close();
                }
                return true;
            }
            set.close();
            log.info("数据库已存在，无需初始化");
            return false;
        } catch (SQLException e2) {
            throw new RuntimeException(e2);
        }
    }
```

上面的数据库判断是否存在以及初始化的过程相对基础，直接使用了基础的Connection进行操作；这里借助了SpringUtil来获取配置信息，对应的类源码如下

```java
package com.git.hui.schema.config;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * @author YiHui
 * @date 2022/12/9
 */
@Component
public class SpringUtil implements ApplicationContextAware, EnvironmentAware {
    private static ApplicationContext context;
    private static Environment environment;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SpringUtil.context = applicationContext;
    }

    @Override
    public void setEnvironment(Environment environment) {
        SpringUtil.environment = environment;
    }

    /**
     * 获取bean
     *
     * @param bean
     * @param <T>
     * @return
     */
    public static <T> T getBean(Class<T> bean) {
        return context.getBean(bean);
    }

    public static Object getBean(String beanName) {
        return context.getBean(beanName);
    }

    /**
     * 获取配置
     *
     * @param key
     * @return
     */
    public static String getConfig(String key) {
        return environment.getProperty(key);
    }

    /**
     * 发布事件消息
     *
     * @param event
     */
    public static void publishEvent(ApplicationEvent event) {
        context.publishEvent(event);
    }
}
```

到此整个初始化相关的配置已经完成；接下来我们验证一下

### 2.验证


再项目启动成功之后，查看一下数据

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
        log.info("启动成功，初始化数据: {}\n{}", list.size(), list);
    }
}
```

![](/imgs/221221/03.jpg)


### 3. 小结

本文主要介绍的是基于`DataSourceInitializer`来实现自主可控的数据初始化，其核心配置为

- DatabasePopulator: 通过`addScripts`来指定对应的sql文件
- DataSourceInitializer#setEnabled: 判断是否需要执行初始化


此外本文还介绍了如何判断数据库是否存在，当数据库不存在时，借助基础的Connection来建立连接，创建数据库；从初始化角度来看，这几篇文中介绍的方式已经足够，但是在项目制的场景下，我们需要记录数据库的版本迭代记录，下一篇将介绍如何使用liquibase来实现数据版本管理，解决初始化以及增量的迭代变更


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/)

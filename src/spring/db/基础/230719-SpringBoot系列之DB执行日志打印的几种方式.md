---
order: 5
title: 5.SQL执行日志打印的几种方式
tag:
  - Mybatis
category:
  - SpringBoot
  - DB系列
  - Mybatis
date: 2023-07-19 08:52:04
keywords:
  - Mybatis
---

sql日志打印，再我们日常排查问题时，某些时候帮助可以说是非常大的，那么一般的Spring项目中，可以怎么打印执行的sql日志呢？

本文将介绍三种sql日志打印的方式：

1. Druid打印sql日志
2. Mybatis自带的日志输出
3. 基于拦截器实现sql日志输出

<!-- more -->

## I. 项目配置

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

添加web支持，用于配置刷新演示

```xml
<dependencies>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.2.0</version>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>


    <!-- https://mvnrepository.com/artifact/com.alibaba/druid-spring-boot-starter -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.13</version>
    </dependency>
</dependencies>
```

### 2. 配置

接下来配置一下db的相关配置 `application.yml`

```yaml
spring:
  datasource:
    druid:
      url: jdbc:mysql://localhost:3306/story?characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull&autoReconnect=true&generateSimpleParameterMetadata=true&failOverReadOnly=false&connectTimeout=30000&socketTimeout=1000
      driver-class-name: com.mysql.cj.jdbc.Driver
      username: root
      password:
      initial-size: 1
      min-idle: 1
      max-active: 1
      max-wait: 6000
      test-while-idle: true
      validation-query: select 1
      remove-abandoned: true
      async-init: true
      keep-alive: true
      filter:
        stat:
          log-slow-sql: true
          slow-sql-millis: 0
        slf4j:
          enabled: true
          statement-prepare-after-log-enabled: false

mybatis:
  configuration:
    map-underscore-to-camel-case: true # 驼峰与下划线互转支持
    config-location: classpath:mybatis-config.xml
    log-prefix: money
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 日志打印级别
logging:
  level:
    root: info
    com.git.hui.boot.db.mapper.*: debug
    org.springframework.jdbc.core: debug
    com.alibaba.druid: debug
```


关于上面配置的一些细节，后面进行细说

我们创建一个用于测试的数据库

```sql
drop table `money` if exists;

CREATE TABLE `money` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '' COMMENT '用户名',
  `money` int(26) NOT NULL DEFAULT '0' COMMENT '钱',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=551 DEFAULT CHARSET=utf8mb4
```


对应的myabtis-config.xml，配置我们自定义的sql日志输出拦截器

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration
        PUBLIC "-//ibatis.apache.org//DTD Config 3.1//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <settings>
        <!-- 驼峰下划线格式支持 -->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
    <typeAliases>
        <package name="com.git.hui.boot.mybatis.entity"/>
    </typeAliases>
    <plugins>
        <plugin interceptor="com.git.hui.boot.db.interceptor.SqlStateInterceptor"/>
    </plugins>


</configuration>
```

## II. 实例

### 1. mybatis默认配置

我们先看一下mybatis的默认日志输出方案，首先写一个`money`数据库的db操作mapper

```java
@Mapper
public interface MoneyMapper {

    /**
     * 保存数据，并保存主键id
     *
     * @param po
     * @return int
     */
    @Options(useGeneratedKeys = true, keyProperty = "po.id", keyColumn = "id")
    @Insert("insert into money (name, money, is_deleted) values (#{po.name}, #{po.money}, #{po.isDeleted})")
    int save(@Param("po") MoneyPo po);


    /**
     * 删除数据
     *
     * @param id id
     * @return int
     */
    @Delete("delete from money where id = #{id}")
    int delete(@Param("id") int id);

    /**
     * 主键查询
     *
     * @param id id
     * @return {@link MoneyPo}
     */
    @Select("select * from money where id = #{id}")
    @Results(id = "moneyResultMap", value = {
            @Result(property = "id", column = "id", id = true, jdbcType = JdbcType.INTEGER),
            @Result(property = "name", column = "name", jdbcType = JdbcType.VARCHAR),
            @Result(property = "money", column = "money", jdbcType = JdbcType.INTEGER),
            @Result(property = "isDeleted", column = "is_deleted", jdbcType = JdbcType.TINYINT),
            @Result(property = "createAt", column = "create_at", jdbcType = JdbcType.TIMESTAMP),
            @Result(property = "updateAt", column = "update_at", jdbcType = JdbcType.TIMESTAMP)})
    MoneyPo getById(@Param("id") int id);
}
```

接下来重点看一下，如需开启myabtis默认的sql日志输出，应该如何配置

```yaml
mybatis:
  configuration:
    map-underscore-to-camel-case: true # 驼峰与下划线互转支持
    config-location: classpath:mybatis-config.xml
    log-prefix: money
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

重点看上面的 `mybatis.configuration.log-prefix` 与 `myabtis.configuration.log-impl` 这里制定了日志输出的方式


但是请注意，通常我们的日志是基于`logback/slf4j`来输出，默认的mybati的sql日志输出是debug级别，所以要看到输出的sql日志，还需要配置一下日志输出级别（本项目的实例中是直接控制台输出，因此不配置下面的也没有问题）

```yaml
# 日志打印级别
logging:
  level:
    root: info # 默认日志输出级别是info
    com.git.hui.boot.db.mapper.*: debug  # 这个制定mapper的相关日志输出级别为debug，即可以输出默认的mybatis配置
```

然后写个demo验证一下

```java
@Slf4j
@SpringBootApplication
public class Application {
    public Application(MoneyMapper mapper, JdbcTemplate jdbcTemplate) {
        MoneyPo po = new MoneyPo();
        po.setName("一灰");
        po.setMoney(10L);
        po.setIsDeleted(0);
        mapper.save(po);

        MoneyPo db = mapper.getById(po.getId());
        log.info("查询结果：{}", db);

        mapper.delete(po.getId());
        log.info("删除完成: {}", po);
    }


    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

![](/imgs/230719/00.jpg)

从上图可以看出，myabtis将具体的sql执行，返回的行数等信息进行了返回，但是这个sql，并不是一个可以直接执行的，还需要我们自己来拼装一下，为了解决这个问题，可以通过 [https://book.hhui.top/sql.html](https://book.hhui.top/sql.html) 来进行sql的自动拼接

### 2. Druid日志输出

除了mybatis的默认日志之外，对于使用druid数据源的场景，也可以直接借助druid来打印执行日志

核心的配置如下

```java
spring:
  datasource:
    druid:
      filter:
        slf4j:
          enabled: true
          statement-prepare-after-log-enabled: true
````

示例如下

```java
Map map = jdbcTemplate.queryForMap("select * from money where id = ?", po.getId());
log.info("查询: {}", map);
```

![](/imgs/230719/01.jpg)

druid的默认输出日志中，并没有将请求参数打印出来，其效果相比较于mybatis而言，信息更少一些

### 3. 基于Mybatis的Interceptor实现方案

默认的输出方案虽好，但是总有一些缺陷，如果有一些自定义的诉求，如日志输出的脱敏，不妨考虑下接下来的基于mybatis的拦截器的实现方案

如下面是一个自定义的日志输出拦截器, 相关知识点较多，有兴趣的小伙伴，推荐参考下文

> * [【DB系列】SpringBoot系列Mybatis之插件机制Interceptor | 一灰灰Blog](https://spring.hhui.top/spring-blog/2021/07/26/210726-SpringBoot%E7%B3%BB%E5%88%97Mybatis%E4%B9%8B%E6%8F%92%E4%BB%B6%E6%9C%BA%E5%88%B6Interceptor/)

```java
@Slf4j
@Component
@Intercepts({@Signature(type = StatementHandler.class, method = "query", args = {Statement.class, ResultHandler.class}), @Signature(type = StatementHandler.class, method = "update", args = {Statement.class})})
public class SqlStateInterceptor implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long time = System.currentTimeMillis();
        StatementHandler statementHandler = (StatementHandler) invocation.getTarget();
        String sql = buildSql(statementHandler);
        Object[] args = invocation.getArgs();
        String uname = "";
        if (args[0] instanceof HikariProxyPreparedStatement) {
            HikariProxyConnection connection = (HikariProxyConnection) ((HikariProxyPreparedStatement) invocation.getArgs()[0]).getConnection();
            uname = connection.getMetaData().getUserName();
        } else if (DruidCheckUtil.hasDruidPkg()) {
            if (args[0] instanceof DruidPooledPreparedStatement) {
                Connection connection = ((DruidPooledPreparedStatement) args[0]).getStatement().getConnection();
                if (connection instanceof MysqlConnection) {
                    Properties properties = ((MysqlConnection) connection).getProperties();
                    uname = properties.getProperty("user");
                }
            }
        }

        Object rs;
        try {
            rs = invocation.proceed();
        } catch (Throwable e) {
            log.error("error sql: " + sql, e);
            throw e;
        } finally {
            long cost = System.currentTimeMillis() - time;
            sql = this.replaceContinueSpace(sql);
            // 这个方法的总耗时
            log.info("\n\n ============= \nsql ----> {}\nuser ----> {}\ncost ----> {}\n ============= \n", sql, uname, cost);
        }

        return rs;
    }

    /**
     * 拼接sql
     *
     * @param statementHandler
     * @return
     */
    private String buildSql(StatementHandler statementHandler) throws NoSuchFieldException {
        BoundSql boundSql = statementHandler.getBoundSql();
        Configuration configuration = null;
        if (statementHandler.getParameterHandler() instanceof DefaultParameterHandler) {
            DefaultParameterHandler handler = (DefaultParameterHandler) statementHandler.getParameterHandler();
            Field field = handler.getClass().getDeclaredField("configuration");
            field.setAccessible(true);
            configuration = (Configuration) ReflectionUtils.getField(field, handler);
        }

        if (configuration == null) {
            return boundSql.getSql();
        }

        return getSql(boundSql, configuration);
    }


    /**
     * 生成要执行的SQL命令
     *
     * @param boundSql
     * @param configuration
     * @return
     */
    private String getSql(BoundSql boundSql, Configuration configuration) {
        String sql = boundSql.getSql();
        Object parameterObject = boundSql.getParameterObject();
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
        if (CollectionUtils.isEmpty(parameterMappings) || parameterObject == null) {
            return sql;
        }

        MetaObject mo = configuration.newMetaObject(boundSql.getParameterObject());
        for (ParameterMapping parameterMapping : parameterMappings) {
            if (parameterMapping.getMode() == ParameterMode.OUT) {
                continue;
            }

            //参数值
            Object value;
            //获取参数名称
            String propertyName = parameterMapping.getProperty();
            if (boundSql.hasAdditionalParameter(propertyName)) {
                //获取参数值
                value = boundSql.getAdditionalParameter(propertyName);
            } else if (configuration.getTypeHandlerRegistry().hasTypeHandler(parameterObject.getClass())) {
                //如果是单个值则直接赋值
                value = parameterObject;
            } else {
                value = mo.getValue(propertyName);
            }
            String param = Matcher.quoteReplacement(getParameter(value));
            sql = sql.replaceFirst("\\?", param);
        }
        sql += ";";
        return sql;
    }

    public String getParameter(Object parameter) {
        if (parameter instanceof String) {
            return "'" + parameter + "'";
        } else if (parameter instanceof Date) {
            // 日期格式化
            return "'" + format(((Date) parameter).getTime()) + "'";
        } else if (parameter instanceof java.util.Date) {
            // 日期格式化
            return "'" + format(((java.util.Date) parameter).getTime()) + "'";
        }
        return parameter.toString();
    }

    public static String format(long timestamp) {
        LocalDateTime time = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
        return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").format(time);
    }

    /**
     * 替换连续的空白
     *
     * @param str
     * @return
     */
    private String replaceContinueSpace(String str) {
        StringBuilder builder = new StringBuilder(str.length());
        boolean preSpace = false;
        for (int i = 0, len = str.length(); i < len; i++) {
            char ch = str.charAt(i);
            boolean isSpace = Character.isWhitespace(ch);
            if (preSpace && isSpace) {
                continue;
            }

            if (preSpace) {
                // 前面的是空白字符，当前的不是空白字符
                preSpace = false;
                builder.append(ch);
            } else if (isSpace) {
                // 当前字符为空白字符，前面的那个不是的
                preSpace = true;
                builder.append(" ");
            } else {
                // 前一个和当前字符都非空白字符
                builder.append(ch);
            }
        }
        return builder.toString();
    }

    @Override
    public Object plugin(Object o) {
        return Plugin.wrap(o, this);
    }

    @Override
    public void setProperties(Properties properties) {
    }
}
```

然后将第一种测试用例再跑一下，实际输出如下

![](/imgs/230719/02.jpg)


### 3. 小结

本文主要介绍了三种常见的sql日志输出方案，原则上推荐通过自定义的插件方式来实现更符合业务需求的sql日志打印；但是，掌握了默认的myabtis日志输出方案之后，我们就可以借助配置中心，通过动态添加/修改 `logging.level.com.git.hui.boot.db.mapper.*` 来动态设置日志输出级别，再线上问题排查、尤其时场景可以复现的场景时，会有奇效哦


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/100-db-log)

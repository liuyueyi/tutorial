---
title: 22.Properties配置文件自动装载JavaBean
order: 22
tag:
  - JDK
  - 编程技巧
  - Properties
category:
  - Java
  - 编程技巧
date: 2021-09-03 19:38:55
keywords: java jdk properties
---

# 实战22：**`Properties配置文件自动装载JavaBean`**

SpringBoot的配置自动装载，使用起来还是很舒爽的，可以非常简单的将properties配置文件的内容，填充到Java bean对象中，如果我们现在是一个脱离于Springboot框架的项目，想实现上面这个功能，可以怎么来做呢？

<!-- more -->

## 1.配置封装

### 1.1. 配置文件自动装载

前面介绍了Properties文件的读取以及基本使用姿势，通过上篇博文已知Properties类的本质是一个Map，所以我们需要干的就是将Map容器的值，赋值到JavaBean的成员属性中

要实现这个功能，自然而然会想到的就是利用反射（考虑到我们赋值的通常为标准的java bean，使用内省是个更好的选择）

接下来我们需要实现的也比较清晰了，第一步获取成员属性，两种方式

- 内省: `BeanInfo bean = Introspector.getBeanInfo(clz); PropertyDescriptor[] propertyDescriptors = bean.getPropertyDescriptors();`
- 反射: `Field[] fields = clz.getDeclaredFields();`

第二步遍历成员属性，进行赋值

- 内省：借助前面获取的`PropertyDescriptor`对象，拿到set方法，进行赋值
  - `descriptor.getWriteMethod().invoke(obj, value)`
- 反射：适应`Field.set`来赋值
  - `field.set(obj, value);`
  
**注意**

- 上面的两种赋值方式，都要求我们传入的value对象类型与定义类型一直，否则会抛类型转换异常


为了避免复杂的类型转换与判定，我们这里介绍下apache的`commons-beanutils`来实现属性拷贝

```xml
<!-- https://mvnrepository.com/artifact/commons-beanutils/commons-beanutils -->
<dependency>
    <groupId>commons-beanutils</groupId>
    <artifactId>commons-beanutils</artifactId>
    <version>1.9.4</version>
</dependency>
```


接下来核心的实现逻辑如下

```java
private static boolean isPrimitive(Class clz) {
    if (clz.isPrimitive()) {
        return true;
    }

    try {
        return ((Class) clz.getField("TYPE").get(null)).isPrimitive();
    } catch (Exception e) {
        return false;
    }
}

public static <T> T toBean(Properties properties, Class<T> type, String prefix) throws IntrospectionException, IllegalAccessException, InstantiationException, InvocationTargetException {
    if (prefix == null) {
        prefix = "";
    } else if (!prefix.isEmpty() && !prefix.endsWith(".")) {
        prefix += ".";
    }

    type.getDeclaredFields();

    // 内省方式来初始化
    T obj = type.newInstance();
    BeanInfo bean = Introspector.getBeanInfo(type);
    PropertyDescriptor[] propertyDescriptors = bean.getPropertyDescriptors();
    for (PropertyDescriptor descriptor : propertyDescriptors) {
        // 只支持基本数据类型的拷贝
        Class fieldType = descriptor.getPropertyType();
        if (fieldType == Class.class) {
            continue;
        }

        if (isPrimitive(fieldType) || fieldType == String.class) {
            // 支持基本类型的转换，如果使用 PropertyUtils, 则不会实现基本类型 + String的自动转换
            BeanUtils.setProperty(obj, descriptor.getName(), properties.getProperty(prefix + descriptor.getName()));
        } else {
            BeanUtils.setProperty(obj, descriptor.getName(), toBean(properties, fieldType, prefix + descriptor.getName()));
        }
    }
    return obj;
}
```

注意上面的实现，首先通过内省的方式获取所有的成员，然后进行遍历，借助`BeanUtils.setProperty`来实现属性值设置

这里面有两个知识点

- `BeanUtil` 还是 `PropertyUtil`
  - 它们两都有个设置属性的方法，但是BeanUtil支持简单类型的自动转换；而后者不行，要求类型完全一致
- 非简单类型
  - 对于非简单类型，上面采用了递归的调用方式来处理；请注意，这里并不完善，比如BigDecimal, Date, List, Map这些相对基础的类型，是不太适用的哦


### 1.2. 功能测试

最后针对上面的实现功能，简单的测试一下，是否可行

配置文件`mail.properties`

```
mail.host=localhost
mail.port=25
mail.smtp.auth=false
mail.smtp.starttlsEnable=false
mail.from=test@yhhblog.com
mail.username=user
mail.password=pwd
```

两个Java Bean

```java
@Data
public static class MailProperties {
    private String host;
    private Integer port;
    private Smtp smtp;
    private String from;
    private String username;
    private String password;
}

@Data
public static class Smtp {
    private String auth;
    private String starttlsEnable;
}
```

转换测试类

```java
public static Properties loadProperties(String propertyFile) throws IOException {
    Properties config = new Properties();
    config.load(PropertiesUtil.class.getClassLoader().getResourceAsStream(propertyFile));
    return config;
}

@Test
public void testParse() throws Exception {
    Properties properties = loadProperties("mail.properties");
    MailProperties mailProperties = toBean(properties, MailProperties.class, "mail");
    System.out.println(mailProperties);
}
```

输出结果如下：

```
PropertiesUtil.MailProperties(host=localhost, port=25, smtp=PropertiesUtil.Smtp(auth=false, starttlsEnable=false), from=test@yhhblog.com, username=user, password=pwd)
```



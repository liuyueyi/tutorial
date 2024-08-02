---
order: 4
title: 4. 通过反射执行任意类目标方法的实现全程实录（上篇）
tag:
  - 反射
category:
  - Quick系列
  - QuickFix
  - 方案设计
date: 2019-03-11 22:39:56
keywords: 反射,JSON,QuickFix,JDK
---

反射可以说是java中非常强大的一个特性了，而我们的quick-fix整个项目，也都是基于反射的基础实现任意目标方法的调用执行，对于fix项目而已，核心在于以下几点

- 如何将外部请求定位我们需要执行的类、方法
- 如何将外部参数转换为目标方法的可执行参数
- 如何执行目标方法

简单来讲，就是封装参数为目标类型，定位目标，然后执行

<!-- more -->

## I. 参数类型封装

这对前面提出三个要点，我们先来看如何进行参数解析，将传入的String格式的参数，封装为我们预期的对象

根据上一篇参数的定义，可以对参数进行简单的分类，如基本类型，如JOPO对象，如Class对象，如包括泛型的对象，不同的case，将会有不同的处理方式

### 1. 基本类型解析

通过反射方式创建对象，对于普通类型来说还好，而对于基本类型，就是直接实现了

```java
// type 为参数类型：value为参数值
if ("int".equals(type) || "Integer".equals(type)) {
    return Integer.parseInt(value);
} else if ("long".equals(type) || "Long".equals(type)) {
    return Long.parseLong(value);
} else if ("float".equals(type) || "Float".equals(type)) {
    return Float.parseFloat(value);
} else if ("double".equals(type) || "Double".equals(type)) {
    return Double.parseDouble(value);
} else if ("byte".equals(type) || "Character".equals(type)) {
    return Byte.parseByte(value);
} else if ("boolean".equals(type) || "Boolean".equals(type)) {
    return Boolean.parseBoolean(value);
} else if ("short".equals(type) || "Short".equals(type)) {
    return Short.parseShort(value);
} else if ("BigDecimal".equals(type)) {
    return new BigDecimal(value);
} else if ("BigInteger".equals(type)) {
    return new BigInteger(type);
} else if ("String".equals(type)) {
    return value;
}
```

注意下，这里对BigDecimal和BigInteger类型也进行了兼容，将String转换为目标对象

### 2. POJO对象转换

根据前面的定义，对于POJO对象，采用json格式输出，因此我们需要的是将json字符串转换为对应的POJO对象；对于简单的（不包含泛型）POJO而言，可以直接使用常见的json库来实现反序列化

这里已fastjson进行处理，首先引入依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.45</version>
</dependency>
```

关键代码如下

```java
Class clz = ArgumentParser.class.getClassLoader().loadClass(type);
return JSON.parseObject(value, clz);
```

### 3. Class参数

这也是一种特殊的参数传入，比如我希望调用`com.alibaba.fastjson.JSON#parseObject(java.lang.String, java.lang.Class<T>)`这个方法，需要传入的第二个参数就是Class类型，这种case也是不同于前面两种，这里我们借助 `java.lang.ClassLoader#loadClass(java.lang.String)` 来实现

```java
if ("Class".equalsIgnoreCase(type)) {
    return ArgumentParser.class.getClassLoader().loadClass(value);
}
```

### 4. 泛型处理

关于泛型参数的转换，这个相对而言就麻烦一点，假设我们有个目标方法

```java
public String print(Map<String, Long> params) {
  // xxx
  return "hello";
}
```

如果要执行上面这个方法，我们传入的参数是怎样的呢？

- `java.util.Map#java.lang.String#java.lang.Long#{"world":456,"hello":123}`

我们现在的目标是，将`{"world":456,"hello":123}`转换为Map对象，对于JSON的反序列化，直接使用`com.alibaba.fastjson.JSON#parseObject(java.lang.String, java.lang.Class<T>)`返回的只会是Map对象，而不是我们希望的`Map<String, Long>`

因此我们考虑使用另外一种反序列化方式，`com.alibaba.fastjson.JSON#parseObject(java.lang.String, java.lang.reflect.Type, com.alibaba.fastjson.parser.Feature...)`, 使用这个方法，主要就是如何创建这个Type对象，参考 `TypeReference` 的使用姿势来实现我们的目标, 源码如下

![IMAGE](/hexblog/imgs/190311/00.jpg)

所以我们自己的实现方式也相对明了，下面是关键的代码

```java
/**
 * 将value转换为包含泛型的参数类型
 *
 * @param value   对象json串
 * @param clzType 对象类型
 * @param tTypes  泛型参数类型
 * @return
 */
private static Object parseStr2GenericObj(String value, String clzType, String... tTypes) {
    try {
        Type[] paramsType = new Type[tTypes.length];
        int count = 0;
        for (String t : tTypes) {
            paramsType[count++] = getType(t);
        }

        // 这里借助fastjson指定精确的Type来实现反序列化
        Type type = new ParameterizedTypeImpl(paramsType, null, getType(clzType));
        return JSONObject.parseObject(value, type);
    } catch (Exception e) {
        throw new IllegalInvokeArgumentException(
                "Pare Argument to Object Error! type: " + clzType + " # " + Arrays.asList(tTypes) + " value: " +
                        value, e);
    }
}

/**
 * 获取参数类型
 *
 * @param type
 * @return
 * @throws ClassNotFoundException
 */
private static Type getType(String type) throws ClassNotFoundException {
    return ArgumentParser.class.getClassLoader().loadClass(type);
}
```


下面贴一下完整的参数解析代码

```java
public class ArgumentParser {
    /**
     * default empty arguments
     */
    private static final Object[] EMPTY_ARGS = new Object[]{};

    public static Object[] parse(String[] args) {
        if (args == null || args.length == 0) {
            return EMPTY_ARGS;
        }

        Object[] result = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            result[i] = buildArgObj(args[i]);
        }
        return result;
    }

    /**
     * 将传入的String类型参数封装为目标对象
     *
     * @param arg 以#分割，根据我们的定义，
     *            第一个#前为目标对象类型，
     *            最后一个#后为目标对象值（如果为JOPO，则采用json方式进行反序列化）
     *            中间的作为泛型的参数类型传入
     *
     *            几个常见的case如:
     *
     *            "Hello World"  返回 "Hello Word"
     *            "int#10" 返回 10
     *            "com.git.hui.fix.core.binder.DefaultServerBinder#{}" 返回的是对象 defaultServerBinder
     *            "java.util.List#java.lang.String#["ads","bcd"]  返回的是List集合, 相当于  Arrays.asList("asd", "bcd")
     * @return
     */
    private static Object buildArgObj(String arg) {
        String[] typeValue = arg.split("#");
        if (typeValue.length == 1) {
            // 没有 #，把参数当成String
            return arg;
        } else if (typeValue.length == 2) {
            // 标准的kv参数, 前面为参数类型，后面为参数值
            return parseStrToObj(typeValue[0], typeValue[1]);
        } else if (typeValue.length >= 3) {
            // 对于包含泛型的参数类型
            // java.util.List#java.lang.String#["ads","bcd"]
            String[] reflectTypes = new String[typeValue.length - 2];
            System.arraycopy(typeValue, 1, reflectTypes, 0, typeValue.length - 2);
            return parseStr2GenericObj(typeValue[typeValue.length - 1], typeValue[0], reflectTypes);
        } else {
            throw new IllegalInvokeArgumentException("Illegal invoke arg: " + arg);
        }
    }

    private static Object parseStrToObj(String type, String value) {
        try {
            if ("int".equals(type) || "Integer".equals(type)) {
                return Integer.parseInt(value);
            } else if ("long".equals(type) || "Long".equals(type)) {
                return Long.parseLong(value);
            } else if ("float".equals(type) || "Float".equals(type)) {
                return Float.parseFloat(value);
            } else if ("double".equals(type) || "Double".equals(type)) {
                return Double.parseDouble(value);
            } else if ("byte".equals(type) || "Character".equals(type)) {
                return Byte.parseByte(value);
            } else if ("boolean".equals(type) || "Boolean".equals(type)) {
                return Boolean.parseBoolean(value);
            } else if ("short".equals(type) || "Short".equals(type)) {
                return Short.parseShort(value);
            } else if ("BigDecimal".equals(type)) {
                return new BigDecimal(value);
            } else if ("BigInteger".equals(type)) {
                return new BigInteger(type);
            } else if ("String".equals(type)) {
                return value;
            } else if ("Class".equalsIgnoreCase(type)) {
                return ArgumentParser.class.getClassLoader().loadClass(value);
            } else {
                Class clz = ArgumentParser.class.getClassLoader().loadClass(type);
                return JSON.parseObject(value, clz);
            }
        } catch (Exception e) {
            throw new IllegalInvokeArgumentException(
                    "Pare Argument to Object Error! type: " + type + " value: " + value, e);
        }
    }

    /**
     * 将value转换为包含泛型的参数类型
     *
     * @param value   对象json串
     * @param clzType 对象类型
     * @param tTypes  泛型参数类型
     * @return
     */
    private static Object parseStr2GenericObj(String value, String clzType, String... tTypes) {
        try {
            Type[] paramsType = new Type[tTypes.length];
            int count = 0;
            for (String t : tTypes) {
                paramsType[count++] = getType(t);
            }

            // 这里借助fastjson指定精确的Type来实现反序列化
            Type type = new ParameterizedTypeImpl(paramsType, null, getType(clzType));
            return JSONObject.parseObject(value, type);
        } catch (Exception e) {
            throw new IllegalInvokeArgumentException(
                    "Pare Argument to Object Error! type: " + clzType + " # " + Arrays.asList(tTypes) + " value: " +
                            value, e);
        }
    }

    /**
     * 获取参数类型
     *
     * @param type
     * @return
     * @throws ClassNotFoundException
     */
    private static Type getType(String type) throws ClassNotFoundException {
        return ArgumentParser.class.getClassLoader().loadClass(type);
    }
}
```

## II. 测试

### 1. 基本类型

```java
@Test
public void testArugmentParser() {
    String[] params = new String[]{"Hello World", "int#120", "long#330", "BigDecimal#1.2", "boolean#true"};

    Object[] result = ArgumentParser.parse(params);
    System.out.println(JSON.toJSONString(result));
}
```

测试结果如下：

![IMAGE](/hexblog/imgs/190311/01.jpg)


### 2. POJO对象

首先创建一个pojo对象

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PoJo {
    private String name;
    private Integer age;
    private Boolean male;
}

// 对应的测试类如下

@Test
public void testPOJO() {
    PoJo pojo = new PoJo("一灰灰", 18, true);
    String s = JSON.toJSONString(pojo);

    String[] params = new String[]{"git.hui.fix.test.PoJo#" + s};

    Object[] result = ArgumentParser.parse(params);
    System.out.println(JSON.toJSONString(result));
}
```

测试结果如下：

![IMAGE](/hexblog/imgs/190311/02.jpg)

### 3. Class类型

这个就比较简单了，直接看测试

![IMAGE](/hexblog/imgs/190311/03.jpg)

### 4. 泛型

我们先直接使用反序列化方式, 返回的map的value为int类型，而我么预期的是long类型

![IMAGE](/hexblog/imgs/190311/04.jpg)

然后再改用我们上面封装的方式，截图如下，正好和我们预期的一致

```java
@Test
public void testGenericClass() {
    Map<String, Long> demo = new HashMap<>();
    demo.put("hello", 123L);
    demo.put("world", 456L);

    String[] params = new String[]{"java.util.Map#java.lang.String#java.lang.Long#" + JSON.toJSONString(demo)};
    Object[] result = ArgumentParser.parse(params);
    System.out.println(JSON.toJSONString(result));
}
```

![IMAGE](/hexblog/imgs/190311/05.jpg)

## III. 其他

### 0. 项目相关

**项目地址：**

- [https://github.com/liuyueyi/quick-fix](https://github.com/liuyueyi/quick-fix)


**博文地址：**

- [190108-Quick-Fix 如何优雅的实现应用内外交互之接口设计篇](https://blog.hhui.top/hexblog/2019/01/08/190108-Quick-Fix-%E5%A6%82%E4%BD%95%E4%BC%98%E9%9B%85%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%BA%94%E7%94%A8%E5%86%85%E5%A4%96%E4%BA%A4%E4%BA%92%E4%B9%8B%E6%8E%A5%E5%8F%A3%E8%AE%BE%E8%AE%A1%E7%AF%87/)
- [190104-Quick-Fix 纯Jar应用及扩展手册](https://blog.hhui.top/hexblog/2019/01/04/190104-Quick-Fix-%E7%BA%AFJar%E5%BA%94%E7%94%A8%E5%8F%8A%E6%89%A9%E5%B1%95%E6%89%8B%E5%86%8C/)
- [190102-Quick-Fix 从0到1构建一个应用内服务/数据访问订正工具包 ](https://blog.hhui.top/hexblog/2019/01/02/190102-Quick-Fix-%E4%BB%8E0%E5%88%B01%E6%9E%84%E5%BB%BA%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8%E5%86%85%E6%9C%8D%E5%8A%A1-%E6%95%B0%E6%8D%AE%E8%AE%BF%E9%97%AE%E8%AE%A2%E6%AD%A3%E5%B7%A5%E5%85%B7%E5%8C%85/)
- [190311-Quick-Fix 通过反射执行任意类目标方法的实现全程实录（上篇）](https://blog.hhui.top/hexblog/2019/03/11/190311-Quick-Fix-%E9%80%9A%E8%BF%87%E5%8F%8D%E5%B0%84%E6%89%A7%E8%A1%8C%E4%BB%BB%E6%84%8F%E7%B1%BB%E7%9B%AE%E6%A0%87%E6%96%B9%E6%B3%95%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%85%A8%E7%A8%8B%E5%AE%9E%E5%BD%95%EF%BC%88%E4%B8%8A%E7%AF%87%EF%BC%89/)
- [190315-Quick-Fix 通过反射执行任意类目标方法的实现全程实录（中篇）](https://blog.hhui.top/hexblog/2019/03/15/190315-Quick-Fix-%E9%80%9A%E8%BF%87%E5%8F%8D%E5%B0%84%E6%89%A7%E8%A1%8C%E4%BB%BB%E6%84%8F%E7%B1%BB%E7%9B%AE%E6%A0%87%E6%96%B9%E6%B3%95%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%85%A8%E7%A8%8B%E5%AE%9E%E5%BD%95%EF%BC%88%E4%B8%AD%E7%AF%87%EF%BC%89/)
- [190317-Quick-Fix 通过反射执行任意类目标方法的实现全程实录（下篇）](https://blog.hhui.top/hexblog/2019/03/17/190317-Quick-Fix-%E9%80%9A%E8%BF%87%E5%8F%8D%E5%B0%84%E6%89%A7%E8%A1%8C%E4%BB%BB%E6%84%8F%E7%B1%BB%E7%9B%AE%E6%A0%87%E6%96%B9%E6%B3%95%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%85%A8%E7%A8%8B%E5%AE%9E%E5%BD%95%EF%BC%88%E4%B8%8B%E7%AF%87%EF%BC%89/)



### 1. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 2. 声明

尽信书则不如，已上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 3. 扫描关注

**一灰灰blog**

![QrCode](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/blogInfoV2.png)

**知识星球**

![goals](https://raw.githubusercontent.com/liuyueyi/Source/master/img/info/goals.png)


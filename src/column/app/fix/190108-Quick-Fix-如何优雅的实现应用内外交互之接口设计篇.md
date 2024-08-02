---
order: 3
title: 3. 如何优雅的实现应用内外交互之接口设计篇
tag:
  - Java
  - 技术方案
category:
  - Quick系列
  - QuickFix
date: 2019-01-08 21:33:42
keywords: QuickFix,技术方案,数据订正
---

如何实现应用内外交互，是Quick-Fix框架的核心之一，我们常见的应用有提供web服务的（如Spring应用），有进行大数据计算的（如Storm应用），有提供rpc的后台服务（如通过dubbo提供rpc的数据服务），有纯jar服务等；基本上我们可以划分为两类

- 应用本身，有一套健全的与外界交互的机制（这里不包括db/redis等数据的读写）
- 应用只关注自己的服务功能（接收数据，产生数据，保存数据），本身不与第三方的应用进行交互

针对上面这两种case，我们应该怎么来设计一套应用内外交互的方案，来实现接收外部请求，执行应用内部方法或访问应用内部数据，并返回结果的目的？

<!-- more -->

## I. 交互规范设计

因为不同的应用，与外部交互的方式不一样，我们希望最好能直接复用已有的通信机制来实现我们的需求；比如原来就提供了web服务，我们可以在原有的web服务的基础上，新增一个Controller来实现需求；如果应用本身是通过rpc进行通行的，且已经有了非常完善的rpc测试辅助工具，然后就希望可以直接在现在已有的rpc基础上，新增一个服务来实现应用内外交互；再如果我就是一个独立jar应用，我希望通过http方式与外界交互，所以最好框架本身就提供一种默认的交互方案

简单来讲，交互，不能写死，最好是有一个规范，具体想用哪个实现，可以交给实际使用方来选择和扩展

### 1. 请求参数确认

内外交互，首要的就是确认交互的参数，确定需要哪些基本信息，可以达到我们的目的；以及结果怎么返回

在设计参数之前，再次明确一下我们的目的：

- 执行应用内某个方法
- 访问应用中数据

要实现上面的目的，我们需要些什么？

- service: 用于定位访问的具体类
- field:  用来定位应用中的数据
- method: 需要执行的方法
- params: 方法执行需要传入参数

所以我们的req接口如下

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FixReqDTO implements Serializable {
    private static final long serialVersionUID = -151408688916877734L;
    /**
     * 调用的服务名，.class 结尾，则表示根据类型查找Spring容器中的Bean；否则表示传入的为beanName，通过name方式查找Spring容器中的Bean
     */
    private String service;

    /**
     * type用来区分service传入的是bean还是静态类
     *
     * 当type == static 时要求service传入对应的静态类完整包路径方式
     */
    private String type;

    /**
     * 需要执行的方法
     */
    private String method;

    /**
     * 非空：表示最终执行的是service这个bean中成员field的方法method
     * 空：  表示最终执行的是service这个bean提供的方法method
     */
    private String field;

    /**
     * 请求参数，格式为  class#value, 如
     *
     * - int#20
     * - Integer#20
     * - String#Hello World
     * - net.finbtc.component.model.TradePairDO#{"pairId": 120}
     */
    private String[] params;
}
```

### 2. 请求参数说明

针对请求参数，进行解释

| key | 类型 | 解释 |
| --- | --- | --- |
| service | String | 需要执行的服务，可以是完成路径，可以是beanName | 
| field | String | 需要访问的服务内部成员属性，值为属性名；为空时，表示执行的服务的某个方法 | 
| method | String |  方法名，需要执行的方法；为空时，表示访问某个服务的成员属性值 |
| type | String |  用来辅助service来定位具体执行的类，如static表示访问的是一个静态类；single表示访问的是单例 | 
| params | 数组 |  请求参数，数组，可以不存在，格式为 `类型#值`，对于基本类型，可以省略类型的前缀包 | 

单独看表，可能不太好理解，下面结合实例进行说明，为什么要这么设计

#### a. 静态类和实例的访问

在第一篇的整体设计中，就提及到我们采用反射的方式来执行目标方法，因此拿到请求参数后，第一步就是获取执行的类，我们需要执行的是静态类还是实例，对于反射而言，这个差别可不小；因此我们就有了type字段，用来区分service的类型

**type可以决定用哪个`ServerLoader`来加载传入的Service**

比如在框架提供的两种service加载中，对type支持如下

| value | 说明 |  service取值 |
| ---- | ---- | ---- |
| static | 表示service传入的是一个静态类的包路径，我们需要访问的是静态类的成员或方法 |  service必须是类全路径 | 
| bean 或不传 或空字符串 | 表示service传入的是Spring的Bean（可以是beanName, 也可以是全路径），我们需要访问的是Spring中某个Bean的成员或方法 | service可以穿beanName or 全路径 |

#### b. 方法执行

目标方法的执行，可以分为两种，一个是直接访问某个服务or静态类的方法；另外一个是访问某个服务or静态类的成员属性的方法

上面两种有什么区别呢？

- 第一种，通过传入参数，看返回结果，更常见的是为了确认方法的执行逻辑是否有问题
- 第二种，更多是查询或订正内存数据（应用内存数据，往往是以成员属性的方式存在）

所以field,method 这两个参数的组合，就是用来确认上面的两种场景的

| case | 组合方式 | 效果 | 
| --- | --- | --- |
| case1 | field 不传，或者field为空，method存在 |  相等于执行service的method方法 |
| case2 | field method都存在，且method为field对象可执行的方法 | 分步骤为先获取service中的field属性，然后执行field的method方法 |

### c. 传参说明

方法执行，不可避免的就是传参了，参数我们将分为三类

- 基本类型: `int/long/char/boolean/float/double/byte`
- 特殊类型: `String/Class/BigDecimal/BigInteger`
- 对象

接下来，我们约定下传参的规范

- params 为数组
- 基本类型，传参格式如 `int#value`

| 要求 | 格式 | 示例 | 
| --- | --- | --- |
| params | 数组 | ["asd", "123"] |
| 基本类型 | 类型#value | `”int#123"`, `"long@12039123123"`, `"boolean#true"`, `"float#123.321"` |
| BigDecimal | BigDecimal#value | `BigDecimal#12.2` |
| BigInteger | BigInteger#value | `BigInteger#12` |
| Class | Class#类全路径 | `Class#com.git.hui.fix.example.jar.server.CalculateServer` |
| String | String#Value 或 Value | `"String#Hello"`, `HelloWorld` |
| 对象 | 全路径#Json序列化对象 | `"com.git.hui.fix.example.jar.server.DemoDO#{\"key\":\"kkk\", \"value\":\"aaa11\"}"`


接下来给出以下具体的参数解析逻辑

```java
/**
 * 根据传入的参数来解析为对应的do对象
 * Created by @author yihui in 15:32 18/12/13.
 */
public class ArgumentParser {
    private static final Object[] emptyArgs = new Object[]{};

    public static Object[] parse(String[] args) {
        if (args == null || args.length == 0) {
            return emptyArgs;
        }

        Object[] result = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            result[i] = buildArgObj(args[i]);
        }
        return result;
    }

    private static Object buildArgObj(String arg) {
        String[] typeValue = arg.split("#");
        if (typeValue.length == 1) {
            // 没有 #，把参数当成String
            return arg;
        } else if (typeValue.length == 2) {
            // 标准的kv参数
            return parseStrToObj(typeValue[0], typeValue[1]);
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
            } else if ("BigDecimal".equals(type)) {
                return new BigDecimal(value);
            } else if ("BigInteger".equals(type)) {
                return new BigInteger(type);
            } else if ("String".equals(type)) {
                return value;
            } else if ("Class".equalsIgnoreCase(type)) {
                return ArgumentParser.class.getClassLoader().loadClass(type);
            } else {
                Class clz = ArgumentParser.class.getClassLoader().loadClass(type);
                return JSON.parseObject(value, clz);
            }
        } catch (Exception e) {
            throw new IllegalInvokeArgumentException(
                    "Pare Argument to Object Error! type: " + type + " value: " + value, e);
        }
    }
}
```


## II. 其他

### 0. 项目

- [https://github.com/liuyueyi/quick-fix](https://github.com/liuyueyi/quick-fix)

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


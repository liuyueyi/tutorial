---
order: 5
title: 5. 通过反射执行任意类目标方法的实现全程实录（中篇）
tag:
  - 反射
category:
  - Quick系列
  - QuickFix
  - 方案设计
date: 2019-03-15 21:51:30
keywords: Java,反射,Quick系列,QuickFix
---

全程实录上篇，主要介绍了如何解析传入的String参数为我们目标方法的参数类型和对象，其中主要讲述的是基本类型、Class类型、泛型以及普通的POJO类型转换；我们这一篇，目的则放在如何找到需要执行的类和方法，这里需要借助前面的参数解析结果来确定目标方法

<!-- more -->

## I. 目标方法定位

要想最终通过反射执行目标方法调用，前提就是需要定位到目标方法，而定位方法又需要定位目标类，当然最终的实现，还需要定位到目标对象（对于目标对象的确认，放在下一篇，因为不同的环境，获取目标对象的方式不一样）

我们本篇先采用根据传入的完整类路径的方式来讲述如何定位目标方法

### 1. 获取目标类

直接通过ClassLoader来加载目标对象（这里其实是有一个疑问的，如果业务中使用的ClassLoader和Fixer框架的ClassLoader不一样怎么办？）

```java
Class clz = ReflectUtil.class.getClassLoader().loadClass(strClz);
```

### 2. 获取目标方法

借助上面获取的目标对象类和前一篇博文的参数，获取目标方法岂不是很简单就可以了，分分钟就写出来了

#### a. demo版

```java
public static Method getMethod(Class clz, String method, Object[] args) {
    try {
        Class[] paramsClz = new Class[args.length];
        int i = 0;
        for (Object o: args) {
            paramsClz[i++] = o.getClass();
        }

        return clz.getDeclaredMethod(method, paramsClz);
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
```

看下上面的实现，并没有什么毛病，实际上呢？

先来两个例子是一下

```java
// 参数为基本类型的情况下, 如果传入封装后的参数类型会怎样
public String rand(String name, int seed) {
    return name + " | " + seed;
}


public static class Ac {
    String name = UUID.randomUUID().toString();
}

public static class Bc extends Ac {
    int age = 20;
    String name = age + "|" + super.name;
}

// 如果传入的参数为子类，会怎样？
public void pc(Ac c) {
    System.out.println(c.name);
}
```

写下对应的测试代码，执行后结果很明显了

```java
@Test
public void testGetMethod() {
    Class clz = MethodFoundTest.class;
    String method = "rand";
    Object[] args = new Object[]{"hello", new Integer(123)};
    System.out.println(getMethod(clz, method, args));

    Ac bc = new Bc();
    System.out.println(getMethod(clz, "pc", new Object[]{bc}));

    Ac ac = new Ac();
    System.out.println(getMethod(clz, "pc", new Object[]{ac}));
}
```

![IMAGE](/hexblog/imgs/190315/00.jpg)

#### b. 改进版

很明显，直接用上面的方式可能导致很多方法都找不到，离我们的预期的调用任何你执行的方法差的有点远，因此就只能老老实实的遍历所有的方法，判断是否满足条件

```java
public static Method getMethod(Class clz, String method, Object[] args) {
    if (clz == Object.class) {
        throw new ServerNotFoundException(
                "can't find method by methodName: " + method + " args: " + JSON.toJSONString(args) + " for clz:" +
                        clz.getName());
    }


    for (Method m : clz.getDeclaredMethods()) {
        if (!m.getName().equals(method) || m.getParameterCount() != args.length) {
            continue;
        }

        if (judgeParamsType(m.getParameterTypes(), args)) {
            m.setAccessible(true);
            return m;
        }
    }
    
    return null;
}
```

上面显示了主要的逻辑，我们先获取方法名和参数个数相同的，接下来就是需要来判断参数类型是否一致了，针对前面提出的两类情况，进行分别判断

```java
private static boolean judgeParamsType(Class[] paramTypes, Object[] args) {
    for (int index = 0; index < args.length; index++) {
        if (!judgeTypeMatch(paramTypes[index], args[index].getClass())) {
            // 判断定义的参数类型，是否为传参类型，或者传参的父类or接口类型，不满足时，直接判False
            return false;
        }
    }

    return true;
}

/**
 * 判断类型是否兼容
 *
 * @param base
 * @param target
 * @return
 */
private static boolean judgeTypeMatch(Class base, Class target) {
    if (base.isAssignableFrom(target)) {
        // 类型相同个，或者base为target的父类、接口类型
        return true;
    }

    if (base == int.class) {
        return target == Integer.class;
    } else if (base == Integer.class) {
        return target == int.class;
    } else if (base == long.class) {
        return target == Long.class;
    } else if (base == Long.class) {
        return target == long.class;
    } else if (base == float.class) {
        return target == Float.class;
    } else if (base == Float.class) {
        return target == float.class;
    } else if (base == double.class) {
        return target == Double.class;
    } else if (base == Double.class) {
        return target == double.class;
    } else if (base == boolean.class) {
        return target == Boolean.class;
    } else if (base == Boolean.class) {
        return target == boolean.class;
    } else if (base == char.class) {
        return target == Character.class;
    } else if (base == Character.class) {
        return target == char.class;
    } else if (base == byte.class) {
        return target == Byte.class;
    } else if (base == Byte.class) {
        return target == byte.class;
    } else if (base == short.class) {
        return target == Short.class;
    } else if (base == Short.class) {
        return target == short.class;
    } else {
        return false;
    }
}
```

先看一下上面的实现，有几个约束

- 传入的参数顺序与方法参数顺序一致
- 基本类型，兼容包装类型的匹配
- 非基本类型，同类型，或子类，都认为是匹配的


#### c. 再改进版

上面的实现虽然可以获取到我们目标类中的方法，但是如果我想执行的是父类中的方法，怎么办？

所以需要继续改进一下，在定位方法时，采用迭代的方式来向上层级递归，查找目标方法

```java
public static Method getMethod(Class clz, String method, Object[] args) {
    if (clz == Object.class) {
        throw new ServerNotFoundException(
                "can't find method by methodName: " + method + " args: " + JSON.toJSONString(args) + " for clz:" +
                        clz.getName());
    }


    for (Method m : clz.getDeclaredMethods()) {
        if (!m.getName().equals(method) || m.getParameterCount() != args.length) {
            continue;
        }

        if (judgeParamsType(m.getParameterTypes(), args)) {
            m.setAccessible(true);
            return m;
        }
    }

    return getMethod(clz.getSuperclass(), method, args);
}
```

## II. 测试

### 1. 基本测试

依然借助前面的测试case来使用，和上面的调用基本一致，只是换了具体的调用而已

```java
@Test
public void testReflectMethodGet() {
    Class clz = MethodFoundTest.class;
    String method = "rand";
    Object[] args = new Object[]{"hello", new Integer(123)};

    System.out.println(ReflectUtil.getMethod(clz, method, args));

    Ac bc = new Bc();
    System.out.println(ReflectUtil.getMethod(clz, "pc", new Object[]{bc}));

    Ac ac = new Ac();
    System.out.println(ReflectUtil.getMethod(clz, "pc", new Object[]{ac}));
}
```

输出结果如下

![IMAGE](/hexblog/imgs/190315/01.jpg)

### 2. 父类方法测试

扩展下前面的两个内部类

```java
public static class Ac {
    String name = UUID.randomUUID().toString();

    private void rand(String name) {
        System.out.println("ac rand");
    }
}

public static class Bc extends Ac {
    int age = 20;
    String name = age + "|" + super.name;

    private void rand(String name, int seed) {
        System.out.println(name + " | " + seed);
    }
}
```

接下来我们的测试方法如

```java
@Test
public void testSuperMethodGet() {
    Class clz = Bc.class;
    String method = "rand";
    Object[] arg1 = new Object[]{"name", 1};
    Object[] arg2 = new Object[]{"name"};

    System.out.println(ReflectUtil.getMethod(clz, method, arg1));
    System.out.println(ReflectUtil.getMethod(clz, method, arg2));
}
```

输出结果如下

![IMAGE](/hexblog/imgs/190315/02.jpg)


## III. 扩展之反射获取方法的参数名

上面也说到了，在方法定位的时候，掺入的参数顺序是有指定的，不能乱；所以自然就会有一个想法，我们能不能通过反射获取方法的参数名呢？

- javaasist 字节码的方式可以实现
- 其次就是jdk8 同样支持

### 1. jdk8反射获取参数名

首先看下基本的使用姿势，一个例子如下

```java
@Test
public void testParamNameFound() throws NoSuchMethodException {
    Method method = MethodFoundTest.class.getMethod("rand", String.class, int.class);
    Parameter[] parameters = method.getParameters();

    for (Parameter p : parameters) {
        System.out.println(p.getName());
    }
}
```

直接通过`Parameter.getName`来获取参数名，然后执行看下输出啥

![IMAGE](/hexblog/imgs/190315/03.jpg)

结果居然和我们预期的不一致，什么鬼？！！！说好的支持参数获取的呢？

为了兼容以前的版本，直接这么用还不行，需要指定编译参数，通过 `javac -parameters` 来开启; 

![IMAGE](/hexblog/imgs/190315/04.jpg)


另外针对我们常用的maven也可以如下配置

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.7.0</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <compilerArgs>
                    <jvmArguments>
                        -parameters
                    </jvmArguments>
                </compilerArgs>
            </configuration>
        </plugin>
    </plugins>
</build>
```

然后再次执行

![IMAGE](/hexblog/imgs/190315/05.jpg)



## II. 其他

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


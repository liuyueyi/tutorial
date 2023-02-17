---
title: Java实战系列
index: false
---

![](http://cdn.hhui.top/column/java_cover.png)

# Java实战演练

> 实战小技巧，可用于实际编码过程中的 `code snippets` 带你再日常得编码中写得更加顺畅

本专栏中所有内容来自于笔者（一灰灰blog）的日常收集与分享，其中每一个主题都是针对真实的应用场景，通过提供切实可用与项目中的代码片段或者工具类，来给给位小伙伴提供帮助

---

# 实战1：字符串占位替换

字符串占位替换，相信没有小伙伴是陌生的，这东西可以说是伴随着我们所有的项目工程，编码过程；别不相信，如

- String.format
- sql参数拼接的占位
- log日志输出

接下来我们看一下在我们的日常工作生涯中，经常涉及到的几种占位替换方式

<!-- more -->

## 1. String.format

这种可以说是最原始最基础的方式了，基本上在最开始学习java这门语言的时候就会涉及到，语法也比较简单

举例如下

```java
String.format("hello %s", "一灰灰blog");
```

使用`%`来表示占位，后面跟上不同的标识符，用于限定这个占位处的参数类型

这种使用姿势，由jdk原生提供支持，下表为不同的转换符对应的说明

| 转换符   | 说明                     | 参数实例       |
| ----- | ---------------------- | ---------- |
| `%s`  | 字符串替换                  | "一灰灰"      |
| `%c`  | 字符类型                   | 'a'        |
| `%b`  | 布尔类型                   | true/false |
| `%d`  | 整数，十进制                 | 10         |
| `%x`  | 整数，十六进制                | 0x12       |
| `%o`  | 整数，八进制                 | 012        |
| `%f`  | 浮点                     | 0.12f      |
| `%e`  | 指数                     | 2e2        |
| `%g`  | 通用浮点型                  |            |
| `%h`  | 散列                     |            |
| `%%`  | 百分比                    |            |
| `%n`  | 换行                     |            |
| `%tx` | 日期与时间类型（x代表不同的日期与时间转换符 |            |

虽然上面表中列出了很多，但实际使用时，`%s`, `%d`, `%f` 这三个就足以应付绝大部分的场景了；使用姿势和上面的实例参不多，第一个参数为字符串模板，后面的可变参数为待替换的值

下面是在实际使用过程中的注意事项

### 1.1 类型不匹配

上面的表中介绍了不同的转换符，要求的参数类型，如果没有对应上，会怎样

**`%s`，传入非字符串类型**

```java
@Test
public void testFormat() {
    System.out.println(String.format("hello %s", 120));
    System.out.println(String.format("hello %s", true));
    System.out.println(String.format("hello %s", new int[]{1,2, 3}));
    System.out.println(String.format("hello %s", Arrays.asList(1, 2, 3)));
    System.out.println(String.format("hello %s", 0x12));
}
```

输出如下

```
hello 120
hello true
hello [I@3d82c5f3
hello [1, 2, 3]
hello 18
```

也就是说，`%s`的占位标记，传参如果不是String类型，那么实际替换的是 `arg.toString()` (所以数组输出的是地址，而list输出了内容)

**`%d`，传入非整数**

与字符串的不一样的是，如果我们定义要求替换的参数类型为整数，那么传参不是整数，就会抛异常

```java
System.out.println(String.format("hello %d", 1.0F));
System.out.println(String.format("hello %d", "10"));
```

上面这两个，一个传入的参数为浮点，一个传入的是字符串，在实际替换的时候，可不会调用`Integer.valufOf(String.valueOf(xxx))`来强转，而是采用更直接的方式，抛异常

关键的提示信息如下

```
java.util.IllegalFormatConversionException: d != java.lang.Float
java.util.IllegalFormatConversionException: d != java.lang.String
```

因此在实际使用这种方式进行替换时，推荐选择 `%s`，毕竟兼容性更好

### 1.2 参数个数不匹配

我们会注意到,`String.format`接收的参数是不定长的，那么就可能存在字符串模板中预留的占位与实际传入的参数个数不匹配的场景，那么出现这种场景时，会怎样

**参数缺少**

```java
System.out.println(String.format("hello %s %s", "yihui"));
```

上面的例子中，模板要求两个，实际只传入一个参数，会直接抛异常`MissingFormatArgumentException`

```
java.util.MissingFormatArgumentException: Format specifier '%s'
```

**参数过多**

```java
System.out.println(String.format("hello %s", "yihuihui", "blog"));
```

执行正常，多余的参数不会被替换

因此，我们在使用`String.format`进行字符串替换时，请确保传参不要少于实际定义的参数个数；多了还好，少了就会抛异常

## 2. MessageFormat

上面介绍的String.format虽说简单好用，但我们用多之后，自然会遇到，一个参数，需要替换模板中多个占位的场景，针对这种场景，更友好的方式是`MessageFormat`，这个也是jdk原生提供的

我们来简单看一下它的使用姿势

```java
String ans = MessageFormat.format("hello {0}, wechart site {0}{1}", "一灰灰", "blog");
```

使用`{数字}`来表示占位，其中数字对应的是传参的下标，因此当一个参数需要复用时，使用MessageFormat就可以比较简单的实现了，上面就是一个实例，替换之后的字符串为

```
hello 一灰灰, wechart site 一灰灰blog
```

接下来说一下它使用时的注意事项

### 2.1 {}成对出现

如果字符串中，只出现一个`{`，而没有配套的`}`，会抛异常

```java
System.out.println(MessageFormat.format("hello }", 123));
System.out.println(MessageFormat.format("hello { world",  456));
```

注意上面两种case，上面一个是有`}`而缺少`{`，这样是没有问题的；而下面那个则会抛异常

```java
java.lang.IllegalArgumentException: Unmatched braces in the pattern.
```

如果字符串中却是希望输出`{`，可以使用单引号来处理

```java
System.out.println(MessageFormat.format("hello '{' world",  456));
```

### 2.2 单引号

上面提到需要转移时，可以用单引号进行处理，在字符串模板的定义中，如果有单引号，需要各位注意

**只有一个单引号，会导致后面所有占位都不生效**

```java
System.out.println(MessageFormat.format("hello {0}, I'm {1}", "一灰灰", "blog"));
```

上面这个输出结果可能和我们实际希望的不一致

```
hello 一灰灰, Im {1}
```

要解决上面这个，就是使用两个单引号

```java
System.out.println(MessageFormat.format("hello {0}, I''m {1}", "一灰灰", "blog"));
```

这样输出的就是我们预期的

```
hello 一灰灰, I'm blog
```

### 2.3 序号省略

上面的定义中，已经明确要求我们在`{}`中指定参数的序号，如果模板中没有指定会怎样?

```java
System.out.println(messageFormat.format("hello {}, world", "yihuihui"));
```

直接抛异常

```
java.lang.IllegalArgumentException: can't parse argument number: 
```

## 3. 小结

本文介绍的实战小技巧属于是jdk原生提供的两种实现字符串占位替换的方式，除了这两个之外，我们日常开发中还会遇到其他的占位替换方式

比如sql的`?`替换，mybatis中sql参数组装使用`${paramName}`，或者logback日志输出中的`{}`来表示占位，spring的@Value注解声明的配置注入方式`${name:defaultValue}`，这些也都属于占位替换的范畴，那么它们又是怎么实现的呢？

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战2：数组与list互转

这个考题比较常见，也比较简单，难道就这也有什么可以说到的门路不成？

接下来本文好好的说一说它的几种实现姿势，总有一款你喜欢的

## 1.数组转List

### 1.1. Array.asList

这个考题太简单了，直接使用`Array.asList`不就完事了么，比如

```java
@Test
public void ary2list() {
    String[] ary = new String[]{ "1", "a"};
    List<String> list = Arrays.asList((ary);
    System.out.println(list);
}
```

数组转list，so easy!!!

真的就这么简单么？？？

且看下面这一段代码

```java
public void ary2list() {
    String[] ary = new String[]{ "1", "a"};
    List<String> list = Arrays.asList((ary);
    System.out.println(list);

    list.add("c");
    System.out.println(list);
}
```

直接抛出了异常`java.lang.UnsupportedOperationException`

有兴趣的小伙伴可以看一下源码实现方式，通过`Arrays.asList`创建的List，虽说也命名是`ArrayList`，但是它的全路径为 `java.util.Arrays.ArrayList`， 不支持`add`, `remove`等操作（所以下次再有面试官问ArrayList的知识点时，就可以反问一句，老哥你指的是哪个ArrayList😝，逼格是不是立马拉起来）

**知识点**

- 通过`Arrays.asList`创建的列表，不允许新增，删除元素；但是可以更新列表中元素的值

### 1.2. new ArrayList

上面的数组转list方式虽然是最简单的，但不一定是合适的，特别是当我们可能对转换后的list进行操作时，可能埋坑（而且这种坑还非常隐晦，代码层面上很难发现）

为了减少在代码里面下毒的可能性，不妨使用下面这种方式`new ArrayList<>(Arrays.asList(ary))`

```java
String[] ary = new String[]{ "1", "a"};
List<String> out = new ArrayList<>(Arrays.asList(ary));
out.add("hello");
System.out.println(out);
```

通过上面这种方式创建的List，就是我们熟知的`ArrayList`了

**避雷预警**

看到上面这个使用姿势，就很容易想到一个常见的踩雷点，比如我们的应用中，有一个全局共享的配置列表，张三需要拿id为奇数的配置，李四拿id为偶数的配置，然后他们都是这么做的

```java
list.removeIf(s -> s.id % 2 == 0);
```

然后跑了一次之后发现这个全局的列表清空了，这就是典型的没有做好资源隔离的case了，针对这种场景，要么是限制使用方，直接针对全局的资源进行修改，要么就是使用方拿到的是一个隔离的备份

**禁止修改：**

- 使用不可变的容器，如前面提到的`java.util.Arrays.ArrayList` ()
- 使用`Collections.unmodifiableList`创建

```java
List<String> unModifyList = Collections.unmodifiableList(out);
```

**列表拷贝**

```java
new ArrayList<>(Arrays.asList(ary));
```

（上面这种属于深拷贝的实现，具体可以看一下jdk的源码实现）

### 1.3. Collections.addAll

第三种方式借助jdk提供的容器工具类`Collections`来实现

```java
@Test
public void ary2listV3() {
    String[] ary = new String[]{ "1", "a"};
    // 创建列表，并指定长度，避免可能产生的扩容
    List<String> out = new ArrayList<>(ary.length);
    // 实现数组添加到列表中
    Collections.addAll(out, ary);

    // 因为列表为我们定义的ArrayList，因此可以对它进行增删改
    out.add("hello");
    System.out.println(out);
}
```

原则上是比较推荐这种方式来实现的，至于为啥？看下源码实现

```java
public static <T> boolean addAll(Collection<? super T> c, T... elements) {
    boolean result = false;
    for (T element : elements)
        result |= c.add(element);
    return result;
}
```

这段代码的实现是不是非常眼熟，如果让我们自己来写，也差不多会写成这样吧，简单直观高效，完美

## 2. 列表转数组

不同于数组转列表的几种玩法，列表转数组就简单多了，直接调用`List.toArray`

```java
List<String> list = Arrays.asList("a", "b", "c");
// 返回的是Object[] 数组
Object[] cell = list.toArray();

// 如果需要指定数组类型，可以传一个指定各类型的空的数组
// 也可以传一个与目标列表长度相等的数组，这样会将列表中的元素拷贝到这个数组中
String[] strCell = list.toArray(new String[]{});
```

## 3. 小结

今天的博文主题是数组与列表的互转，虽说题目简单，但是实现方式也是多种，需要搞清楚它们之间的本质区别，一不小心就可能采坑，而最简单的地方掉坑里，往往是最难发现和爬出来的

核心知识点小结如下

**数组转list：**

- `Arrays.asList(xxx)`：创建的是不可变列表，不能删除和新增元素
- `new ArrayList<>(Arrays.asList(xxx)`: 相当于用列表创建列表，属于深拷贝的一种表现，获取到的列表支持新增、删除
- 推荐写法 `Collections.addAll()`

**列表转数组**

- `list.toArray`: 如果需要指定数组类型，则传参指定

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战3：字符串与Collection的互转

将字符串转换为List，这种业务场景可以说非常非常常见了，实现方式也比较简单

```java
public List<String> str2list(String str, String split) {
    String[] cells = str.split(split);
    return Arrays.asList(cells);
}
```

那么除了上面这种实现方式之外，还有其他的么？

<!-- more -->

## 1. 字符串转列表

上面的实现姿势相当于字符串先转数组，然后在通过数组转列表，所以可以沿用前一篇字数组转list的几种方式

### 1.1. jdk支持方式

借助`Collections.addAll`来实现

```java
public List<String> str2list2(String str, String split) {
    List<String> list = new ArrayList<>();
    Collections.addAll(list, str.split(split));
    return list;
}
```

上面这种方式适用于输出String的列表，如果我希望转成int列表呢？可以采用下面的方式

```java
public List<Integer> str2intList(String str, String split) {
    return Stream.of(str.split(split))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(Integer::valueOf).collect(Collectors.toList());
}
```

直接将数组转换为流，然后基于jdk8的特性，来实现转换为int列表

### 1.2. guava方式

引入依赖

```xml
<!-- https://mvnrepository.com/artifact/com.google.guava/guava -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>30.1-jre</version>
</dependency>
```

除了使用jdk原生的方式之外，借助guava也是非常常见的的case了，主要通过Splitter来实现，写法看起来非常秀

```java
public List<String> str2list2(String str, String split) {
    return Splitter.on(split).splitToList(str);
}
```

简单直接的一行代码搞定，如果我们希望是对输出的列表类型进行指定，也可以如下操作

```java
public List<Integer> str2intListV2(String str, String split) {
    return Splitter.on(split).splitToStream(str)
            .map(String::trim).filter(s -> !s.isEmpty())
            .map(Integer::valueOf).collect(Collectors.toList());
}
```

### 1.3. apache-commons

引入依赖

```xml
 <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-collections4</artifactId>
    <version>4.4</version>
</dependency>
```

上面流的方式就很赞了，但是注意它是有jdk版本限制的，虽说现在基本上都是1.8以上的环境进行开发，但也不排除有上古的代码，比如我现在手上的项目，spring还是3...

如果我们不能使用流的方式，那么有什么简单的方式来实现字符串转换为指定类型的列表么？

```java
public List<Integer> str2intListV3(String str, String split) {
    List<Integer> result = new ArrayList<>();
    CollectionUtils.collect(Arrays.asList(str.split(split)), new Transformer<String, Integer>() {
        @Override
        public Integer transform(String s) {
            return Integer.valueOf(s);
        }
    }, result);
    return result;
}
```

上面这个实现也没有多优雅，不过这里有个编程小技巧可以学习，`new Transformer(){}`的传参方式，这种实现方式有点像回调的写法，虽然他们有本质的区别，此外就是jdk8之后的函数方法，就充分的体现这种设计思路，比如上面的换成jdk8的写法，直接简化为

```java
public List<Integer> str2intListV3(String str, String split) {
    List<Integer> result = new ArrayList<>();
    CollectionUtils.collect(Arrays.asList(str.split(split)), Integer::valueOf, result);
    return result;
}
```

## 2. 列表转字符串

### 2.1. StringBuilder

最容易想到的，直接使用StringBuilder来实现拼接

```java
public String list2str(List<String> list, String split) {
    StringBuilder builder = new StringBuilder();
    for (String str: list) {
        builder.append(str).append(split);
    }
    return builder.substring(0, builder.length() - 1);
}
```

注意两点：

- 使用StringBuilder而不是StringBuffer (why?)
- 注意最后一个拼接符号不要

### 2.2. String.join

一个更简单的实现方式如下

```java
public String list2str2(List<String> list, String split) {
    return String.join(split, list);
}
```

当然上面这个的缺点就是列表必须是字符串列表，如果换成int列表，则不行

### 2.3. gauva

guava也提供了列表转String的方式，同样很简单，而且还没有列表类型的限制

```java
public <T> String list2str3(List<T> list, String split) {
    return Joiner.on(split).join(list);
}
```

## 3. 小结

本文的考题也非常常见，列表与字符串的互转，这里介绍了多种实现方式，有jdk原生的case（如果没有什么限制，推荐使用它， `String.split`除外，原因后面再说），如果有更高级的定制场景，如非String类型类表，则可以考虑guava的Splitter/Joinner来实现

在上面的实现中，也提供了几种有意思的编程方式

- Stream: 流，jdk8之后非常常见了
- 函数方法，回调写法case

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战4：字符串拼接

相信没有小伙伴没有写过这样的代码，比如说现在让我们来实现一个字符串拼接的场景，怎样的实现才算是优雅的呢？

<!-- more -->

以将int数组转为英文逗号分隔的字符串为例进行演示

## 1. 实现

### 1.1. 普通写法

直接使用StringBuilder来拼接

```java
public String join(List<Integer> list) {
    StringBuilder builder = new StringBuilder();
    for(Integer sub: list) {
        builder.append(sub).append(",");
    }
    return builder.substring(0, builder.length() - 1);
}
```

上面这种写法相信比较常见，相对来说不太顺眼的地方就是最后的toString，需要将最后的一个英文逗号给干掉

当然也可以用下面这种事前判断方式，避免最终的字符串截取

```java
public String join2(List<Integer> list) {
    StringBuilder builder = new StringBuilder();
    boolean first = true;
    for (Integer sub: list) {
        if (first) {
            first = false;
        } else {
            builder.append(",");
        }
        builder.append(sub);
    }
    return builder.toString();
}
```

### 1.2. StringJoiner

上面实现中，干掉最后的一个分隔符实在不是很优雅，那么有更好一点的用法么，接下来看一下使用`StringJoiner`的方式

```java
public String join3(List<Integer> list) {
    StringJoiner joiner = new StringJoiner(",");
    for (Integer s : list) {
        joiner.add(String.valueOf(s));
    }
    return joiner.toString();
}
```

StringJoiner由jdk1.8提供，除了上面的基础玩法之外，结合jdk1.8带来的流操作方式，可以更简洁的实现

```java
return list.stream().map(String::valueOf).collect(Collectors.joining(","));
```

怎么样，上面这个实现比起前面的代码是不是要简洁多了，一行代码完事

### 1.3. guava joiner

如果使用的jdk还不是1.8版本，不能使用上面的StringJoiner，没关系，还有guava的Joiner也可以实现

```java
public String join5(List<Integer> list) {
    return Joiner.on(",").join(list);
}
```

**注意**

- 接收的参数类型为: 数组/Iterable/Iterator/可变参数, 基本上可以覆盖我们日常的业务场景

## 2. 小结

本篇文章的主题是一个非常非常常见的字符串拼接，一般来讲，我们在做字符串拼接时，最麻烦的事情就是分隔符的处理，要么就是分隔符前置添加，每次循环都需要判断是否为开头；要么就是后置，最后取字符串时，干掉最后一个分隔符

本文提供了一个非常使用的方式`StringJoiner`，完全解决了上面的分隔符问题，它的使用有两种场景

- 简单的容器转String：直接借助Stream的`Collectors.joining`来实现
- for循环 （这种场景一般是for循环内的逻辑不仅仅包括字符串拼接，还包括其他的业务逻辑）： 循环内直接执行`stringJoiner.add()`添加

对于jdk1.8及以上的版本，优先推荐使用上面说的StringJoiner来实现字符串拼接；至于jdk1.8之下，那么Guava就是一个不错的选择了，使用姿势也很很简单

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战5：驼峰与下划线划转

这个考题非常实用，特别是对于我们这些号称只需要CURD的后端开发来说，驼峰与下划线互转，这不是属于日常任务么；一般来讲db中的列名，要求是下划线格式（why? 阿里的数据库规范是这么定义的，就我感觉驼峰也没毛病），而java实体命名则是驼峰格式，所以它们之间的互转，就必然存在一个驼峰与下划线的互转

今天我们就来看一下，这两个的互转支持方式

<!-- more -->

## 1.实现

### 1.1. Gauva

一般来讲遇到这种普适性的问题，大部分都是有现成的工具类可以来直接使用的；在java生态中，说到好用的工具百宝箱，guava可以说是排列靠前的

接下来我们看一下如何使用Gauva来实现我们的目的

```java
// 驼峰转下划线
String ans = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, "helloWorld");
System.out.println(ans);

// 下划线转驼峰
String ans2 = CaseFormat.LOWER_UNDERSCORE.to(CaseFormat.LOWER_CAMEL, "hello_world");
System.out.println(ans2);
```

在这里主要使用的是`CaseFormat`来实现互转，guava的CaseFormat还提供了其他几种方式

上面这个虽然可以实现互转，但是如果我们有一个字符串为 `helloWorld_Case`

将其他转换输出结果如下:

- 下划线：`hello_world__case`
- 驼峰：`helloworldCase`

这种输出，和标准的驼峰/下划线不太一样了（当然原因是由于输入也不标准）

### 1.2. Hutool

除了上面的guava，hutool的使用也非常广，其中包含很多工具类，其`StrUtil`也提供了下划线与驼峰的互转支持

```java
String ans = StrUtil.toCamelCase("hello_world");
System.out.println(ans);
String ans2 = StrUtil.toUnderlineCase("helloWorld");
System.out.println(ans2);
```

同样的我们再来看一下特殊的case

```java
System.out.println(StrUtil.toCamelCase("helloWorld_Case"));
System.out.println(StrUtil.toUnderlineCase("helloWorld_Case"));
```

输出结果如下

- 驼峰：`helloworldCase`
- 下划线: `hello_world_case`

相比较上面的guava的场景，下划线这个貌似还行

### 1.3. 自定义实现

接下来为了满足我们希望转换为标砖的驼峰/下划线输出方式的需求，我们自己来手撸一个

**下划线转驼峰:**

- 关键点就是找到下划线，然后去掉它，下一个字符转大写续上（如果下一个还是下划线，那继续找下一个）

根据上面这个思路来实现，如下

```java
private static final char UNDER_LINE = '_';

/**
 * 下划线转驼峰
 *
 * @param name
 * @return
 */
public static String toCamelCase(String name) {
    if (null == name || name.length() == 0) {
        return null;
    }

    int length = name.length();
    StringBuilder sb = new StringBuilder(length);
    boolean underLineNextChar = false;

    for (int i = 0; i < length; ++i) {
        char c = name.charAt(i);
        if (c == UNDER_LINE) {
            underLineNextChar = true;
        } else if (underLineNextChar) {
            sb.append(Character.toUpperCase(c));
            underLineNextChar = false;
        } else {
            sb.append(c);
        }
    }

    return sb.toString();
}
```

**驼峰转下划线**

- 关键点：大写的，则前位补一个下划线，当前字符转小写（如果前面已经是一个下划线了，那前面不补，直接转小写即可）

```java
public static String toUnderCase(String name) {
    if (name == null) {
        return null;
    }

    int len = name.length();
    StringBuilder res = new StringBuilder(len + 2);
    char pre = 0;
    for (int i = 0; i < len; i++) {
        char ch = name.charAt(i);
        if (Character.isUpperCase(ch)) {
            if (pre != UNDER_LINE) {
                res.append(UNDER_LINE);
            }
            res.append(Character.toLowerCase(ch));
        } else {
            res.append(ch);
        }
        pre = ch;
    }
    return res.toString();
}
```

再次测试`helloWorld_Case`，输出如下

- 驼峰：`helloWorldCase`
- 下划线: `hello_world_case`

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战6：枚举的特殊用法

难道我们日常使用的枚举还有什么特殊的玩法不成？没错，还真有，本文主要介绍枚举的两种不那么常见的使用姿势

- 利用枚举来实现单例模式
- 利用枚举来实现策略模式

<!-- more -->

## 1. 使用场景

### 1.1. 单例模式

单例模式可以说是每个java开发者必须掌握的一个设计模式了，通常我们说它的实现，有饱汉式和饿汉式，也有经常说的双重判断，今天我们介绍另外一种方式，借助枚举来实现

```java
public enum SingleEnum {
    INSTANCE;

    public void print(String word) {
        System.out.println(word);
    }
}

@Test
public void testSingle() {
    SingleEnum.INSTANCE.print("hello world");
}
```

使用枚举来实现单例模式非常非常简单，将类声明为枚举，内部只定义一个值即可

为什么可以这样做？

- 枚举类不能`new`，因此保证单例
- 枚举类不能被继承
- 类不加载时，不会实例化

使用枚举类创建的单例有一个好处，就是即使用反射，也无法打破它的单例性质，这是相比较于其他的实现方式的一个优点

那么，为啥在实际的项目中，不太常见这种写法？

- 就我个人的一点认知（不保证准确）：这个与我们对枚举的认知有一定关系，在 《Effect in java》一书中，推荐我们使用这种方式来实现单例，但是在实际的项目开发中，我们更多的将枚举作为常量来使用，很少在枚举类中，添加复杂的业务逻辑

### 1.2. 策略模式

枚举除了很容易就实现上面的单例模式之外，还可以非常简单的实现策略模式

举一个简单的例子，我现在有一个接口，通过接受的参数，来决定最终的数据存在什么地方

如果按照正常的写法，可能就是很多的if/else

```java
public void save(String type, Object data) {
    if ("db".equals(type) {
        // 保存到db
        saveInDb(data);
    } else if ("file".equals(type)) 
        // 保存在文件
        saveInFile(data);
    } else if ("oss".eqauls(type)) {
        // 保存在oss
        saveInOss(type);
    }
}
```

上面这种写法虽说简单直观，但是当type类型一多了之后，这个if/else的代码行数就会很多很多了，而且看起来也不美观

接下来我们介绍一种利用枚举，基于策略模式的思想来解决上面的if/else问题

```java
public enum SaveStrategyEnum {
    DB("db") {
        @Override
        public void save(Object obj) {
            System.out.println("save in db:" + obj);
        }
    },
    FILE("file") {
        @Override
        public void save(Object obj) {
            System.out.println("save in file: " + obj);
        }
    },
    OSS("oss") {
        @Override
        public void save(Object obj) {
            System.out.println("save in oss: " + obj);
        }
    };

    private String type;

    SaveStrategyEnum(String type) {
        this.type = type;
    }

    public abstract void save(Object obj);

    public static SaveStrategyEnum typeOf(String type) {
        for (SaveStrategyEnum strategyEnum: values()) {
            if (strategyEnum.type.equalsIgnoreCase(type)) {
                return strategyEnum;
            }
        }
        return null;
    }
}

public void save(String type, Object data) {
    SaveStrategyEnum strategyEnum = SaveStrategyEnum.typeOf(type);
    if (strategyEnum != null) {
        strategyEnum.save(data);
    }
}
```

上面的实现，主要利用的是`抽象类 + 枚举`来完成不同的策略具体实现

这种实现方式，相比较与前面的单例模式，还是更常见一点，虽然整体看下来没有什么难度，但是仔细看一看，会发现几个知识点

- 抽象方法的使用 （在模板设计模式中，更能体会抽象方法的使用妙处）
- 利用枚举原生提供的`values()`，来实现遍历，找到目标

## 2. 小结

枚举虽然说是jdk原生提供的一个基础数据类型，但是它的使用姿势除了我们熟知的常量之外，还可以有效的运用在设计模式中，让我们的代码实现更优雅

比如使用枚举来实现单例模式，就不用再面对让人烦躁的双重判断/内部类的方式了

使用枚举的策略模式，也可以有效解决我们类中大量的if/else

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战7：排序比较要慎重

今天介绍的又是一个非常非常基本的基本知识点，为啥要单独拎出来？还是因为这个东西虽然非常简单，但是很容易掉坑，我已经遇到几次不严谨的写法了

<!-- more -->

## 1.排序

### 1.1. Comparator 与 Comparable

输掉排序，这两个接口好像不太容易绕过去，我们简单介绍下它们的区别

- 如果你有一个类，希望支持同类型的自定义比较策略，可以实现接口`Compareable`
- 如果某个类，没有实现`Compareable`接口，但是又希望对它进行比较，则可以自自定义一个`Comparator`，来定义这个类的比较规则

通过一个简单的实例进行演示说明

```java
public static class Demo implements Comparable<Demo> {
    int code;
    int age;

    public Demo(int code, int age) {
        this.code = code;
        this.age = age;
    }

    @Override
    public int compareTo(Demo o) {
        if (code == o.code) {
            return 0;
        } else if (code < o.code) {
            return -1;
        } else {
            return 1;
        }
    }

    @Override
    public String toString() {
        return "Demo{" +
                "code=" + code +
                ", age=" + age +
                '}';
    }
}
```

上面的实现中，重点关注 Demo类，实现了`Comparable`接口，因此可以直接调用`list.sort(null)`来进行比较；

但是如果我们现在需求改变了，希望实现针对demo类的age字段，进行升序排列，那么就可以利用`Comparator`来实现了

```java
@Test
public void testDemoSort() {
    List<Demo> list = new ArrayList<>();
    list.add(new Demo(10, 30));
    list.add(new Demo(12, 10));
    list.add(new Demo(11, 20));
    // 默认根据 code 进行升序比较
    list.sort(null);
    System.out.println("sort by code: " + list);

    list.sort(new Comparator<Demo>() {
        @Override
        public int compare(Demo o1, Demo o2) {
            if (o1.age == o2.age) {
                return 0;
            } else if (o1.age < o2.age) {
                return -1;
            } else {
                return 1;
            }
        }
    });
    System.out.println("sort by age: " + list);
}
```

输出结果如下

```text
sort by code: [Demo{code=10, age=30}, Demo{code=11, age=20}, Demo{code=12, age=10}]
sort by age: [Demo{code=12, age=10}, Demo{code=11, age=20}, Demo{code=10, age=30}]
```

### 1.2. 踩坑预告

再上面的compare方法实现中，我们可以发现里面的实现有点不太美观，我们最终的目的是什么？

- 如果左边的小于右边的，返回 -1
- 如果左边的大于右边的，返回 0
- 如果左边的等于右边的，返回 1

基于此，经常可以看到的实现如下

```java
list.sort(new Comparator<Demo>() {
    @Override
    public int compare(Demo o1, Demo o2) {
       return o1.age - o2.age;
    }
});
```

上面这个实现虽然简洁了，但是有一个致命的问题，可能溢出!!!

所以请注意，千万千万不要用上面这种写法

那么有没有更优雅的方式呢？

- 有，使用基础类的`compare`方法

```java
list.sort(new Comparator<Demo>() {
    @Override
    public int compare(Demo o1, Demo o2) {
       return Integer.compare(o1.age, o2.age);
    }
});
```

上面这一段代码，再jdk1.8中，可以简化为下面一句

```java
list.sort(Comparator.comparingInt(o -> o.age));
```

再扩展一下，如果希望倒排呢？

- 第一种实现方式，调换位置
- Jdk1.8方式，使用负数

```java
list.sort(new Comparator<Demo>() {
    @Override
    public int compare(Demo o1, Demo o2) {
       return Integer.compare(o2.age, o1.age);
    }
});

list.sort(Comparator.comparingInt(o -> -o.age));
```

## 2. 小结

今天主要介绍的知识点是排序，再我们日常使用中，如果一个类希望支持排序，最好的方式就是让它实现`Comparable`接口，然后自定义排序方式

这样再容器中，如果需要排序，直接调用 `list.sort(null)` 或者 `CollectionUtils.sort(list)`

如果目标类没有实现排序接口，或者希望使用另外一种排序方式，则通过自定义的`Comparator`来实现

最后关于`compare`方法的实现，设计到两个类的比较，这种最终的落脚地，多半是基础类型的比较

- o1 与 o2 比较，返回负数，则最终的结果中o1再前面（即升序排列）
- 不要直接使用 `o1-o2`会溢出，推荐使用 `Integer.compare(o1, o2);`

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战8：容器的初始化大小指定

容器可以说是我们日常开发中，除了基本对象之外，使用最多的类了，那么平时在使用的时候，是否有主意到良好编程习惯的大佬，在创建容器的时候，一般会设置size；那么他们为什么要这么干呢？是出于什么进行考量的呢？

今天我们将针对最常见的List/Map/Set三种容器类型的初始化值选择，进行说明

<!-- more -->

## 1. 容器初始化

### 1.1. List

列表，在我们日常使用过程中，会接触到下面几个

- ArrayList: 最常见的数组列表
- LinkedList: 基于链表的列表
- CopyOnWriteArrayList: 线程安全的数组列表

接下来逐一进行说明

#### 1.1.1 ArrayList

现在以ArrayList为例，进行源码分析，当我们不指定列表大小，直接创建时

```java
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

上面是内部实现，其中`elementData`就是列表中存数据的数组，初始化为默认数组

当我们第一次添加一个元素时，发现数组为默认值，会触发一次数组扩容，新的数组大小为10 （详情看源码）

其次就是数组的库容机制，通过源码/网上分享知识点可以知道，这个扩容的实现如下

- 当新添加的元素，数组放不下时，实现扩容
- `扩容后的大小` = `扩容前大小` + max(`添加元素个数`, 1/2 * `扩容前大小`)

基于上面的知识点，大致可以得出指定列表长度的好处

- 节省空间（用多少申请多少，避免浪费）
- 减少扩容带来的拷贝（扩容一次就会带来一次数组拷贝，如果已知列表很大，结果还使用默认的10，这会产生很多可避免的扩容开销）

#### 1.1.2 LinkedList

基于链表的列表，不同于上面的数组列表，它没有提供指定大小的构造方法，why?

因为链表本身的数据结构的特点，它就像糖葫芦一样，一个串一个，有数据，才有接上的可能，因此不需要指定大小

#### 1.1.3 CopyOnWriteArrayList

这个又非常有意思，它同样不能指定大小，但是原因与前面不同，主要在于它保证线程安全的实现方式

- 每次新增/修改(加锁，保证单线程访问)，都是在拷贝的数组操作；完成之后，用新的替换旧的

所以说，每次变更，都会存在数组拷贝，因此就没有必要提前指定数组大小

那么它的初始化每次都使用默认的么?

并不是这样的，当我们已知这个列表中的值时，推荐使用下面这种方式

```java
List<String> values= Arrays.asList("12", "220", "123");
List<String> cList = new CopyOnWriteArrayList<>(values);
```

- 将初始化值，放在一个普通的列表中，然后利用普通列表来初始化`CopyOnWriteArrayList`

### 1.2.Map

常见的map容器使用，大多是下面几个

- `HashMap`
- `LinkedHashMap`: 有序的hashmap
- `TreeMap`: 有序的hashmap
- `ConcurrentHashMap`: 线程安全的map

#### 1.2.1 HashMap

HashMap的底层数据结构是 `数组 + 链表/红黑树`，关于这个就不细说了

我们在初始化时，若不指定size，则数组的默认长度为8（请注意，Map的数组长度是2的倍数）

与ArrayList的扩容时机不一样的是，默认情况下，Map容量没满就会触发一次扩容

默认是数量达到 `size * 0.75`(0.75为扩容因子，可以在创建时修改)，就会触发一次扩容

why?

- 主要是为了减少hash冲突

同样的为了减少冲突，在初始化时，我们需要指定一个合适大小

比如我们

- 已知map的数量为2，这个时候Map的大小选择因该是4
- map数量为6，这个时候Map的大小选择是16

有时候让我们自己来计算这个值，就有些麻烦了，这个时候，可以直接使用Guava的工具类来完成这个目的

```java
Map<String, String> map = Maps.newHashMapWithExpectedSize(6);
```

#### 1.2.2 LinkedHashMap

初始化方式同上，略

#### 1.2.3 ConcurrentHashMap

初始化方式同上，略

#### 1.2.4 TreeMap

不同于上面几个的是treeMap，没有提供指定容器大小的构造方法

原因和前面说到的LinkedList有些类似，TreeMap的底层数据结构为Tree，所以新增数据是挂在树的一个节点下面，无需指定容量大小

### 1.3. Set

集合用的最多应该就是`HashSet`了，底层结构模型复用，所以初始化大小指定与HashMap一致，也不需要多说

## 2. 小结

今天这篇博文主要介绍的是三种常见的容器，在创建时，如何指定容量大小

首先明确一点，指定容量大小是为了

- 减少扩容带来的额外开销
- 指定容量代销，可以减少无效的内存开销

初始化值设置的关键点:

- ArrayList: 数据有多少个，初始化值就是多少
- HashMap: 考虑到扩容因子，初始化大小 = `(size / 0.75 + 1)`

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战9：List.subList使用不当StackOverflowError

相信每个小伙伴都使用过`List.subList`来获取子列表，日常使用可能没啥问题，但是，请注意，它的使用，很可能一不小心就可能导致oom

<!-- more -->

## 1.实例说明

### 1.1. subList

场景复现，如基于list实现一个小顶堆

```java
public List<Integer> minStack(List<Integer> list, int value, int stackSzie) {
    list.add(value);
    if (list.size() < stackSzie) {
        return list;
    }
    list.sort(null);
    return list.subList(0, stackSzie);
}

@Test
public void testFix() {
    List<Integer> list = new ArrayList<>();
    for (int i = Integer.MAX_VALUE; i > Integer.MIN_VALUE; i--) {
        list.add(i);
        list = minStack(list, i, 5);
        System.out.println(list);
    }
}
```

上面这个执行完毕之后，居然出现栈溢出

```
// ....
[2147462802, 2147462803, 2147462804, 2147462805, 2147462806]
[2147462801, 2147462802, 2147462803, 2147462804, 2147462805]

java.lang.StackOverflowError
    at java.util.ArrayList$SubList.add(ArrayList.java:1057)
    at java.util.ArrayList$SubList.add(ArrayList.java:1057)
```

从实现来看，感觉也没啥问题啊， 我们稍微改一下上面的返回

```java
public List<Integer> minStack(List<Integer> list, int value, int stackSzie) {
    list.add(value);
    if (list.size() < stackSzie) {
        return list;
    }
    list.sort(null);
    return new ArrayList<>(list.subList(0, stackSzie));
}
```

再次执行，却没有异常；所以关键点就在与

- list.subList的使用上

### 1.2. StackOverflowError分析

接下来我们主要看一下`list.subList`的实现

```java
public List<E> subList(int fromIndex, int toIndex) {
    subListRangeCheck(fromIndex, toIndex, size);
    return new SubList(this, 0, fromIndex, toIndex);
}

private class SubList extends AbstractList<E> implements RandomAccess {
    private final AbstractList<E> parent;
    private final int parentOffset;
    private final int offset;
    int size;

    SubList(AbstractList<E> parent,
            int offset, int fromIndex, int toIndex) {
        this.parent = parent;
        this.parentOffset = fromIndex;
        this.offset = offset + fromIndex;
        this.size = toIndex - fromIndex;
        this.modCount = ArrayList.this.modCount;
    }
    ...
}
```

上面返回的子列表是ArrayList的一个内部类`SubList`，它拥有一个指向父列表的成员`parrent`

也就是说，从源头的ArryList开始，后面每次调用`subList`，这个指代关系就深一层

然后它的add方法也很有意思

```java
public void add(int index, E e) {
    rangeCheckForAdd(index);
    checkForComodification();
    parent.add(parentOffset + index, e);
    this.modCount = parent.modCount;
    this.size++;
}
```

重点看 `parent.add(parentOffset + index, e);`，添加的数据实际上是加在最源头的ArrayList上的，也就是说，虽然你现在拿到的SubList，只有几个元素，但是它对应的数组，可能超乎你的想象

当然上面这个异常主要是以为调用栈溢出（一直往上找parent）

这里反应的另外一个重要问题则是内存泄漏，就不继续说了

如果需要解决上面这个问题，改造方法如下

```java
public List<E> subList(int fromIndex, int toIndex) {
    subListRangeCheck(fromIndex, toIndex, size);
    return new ArrayList<>(new SubList(this, 0, fromIndex, toIndex));
}s
```

## 2. 小结

jdk提供的原生方法虽然非常好用，但是在使用的时候，也需要多家注意，一不小心就可能掉进坑里；这也告诉我们多看源码是有必要的

最后一句关键知识点小结：

- `ArrayList.subList` 返回的是内部类，与原ArrayList公用一个数组，只是限定了这个数组的起始下标和结束下标而已
- 在使用`subList`，请注意是否会存在内存泄露和栈溢出的问题

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战10：不可变容器

不可变容器，看着好像在实际的业务中不怎么会用到，但实则不然，相信每个小伙伴都用过，或者看到过下面的代码

```java
Collections.emptyList();
Collections.emptyMap();
```

今天我们来介绍一下如何使用不可变容器，以及使用时的注意事项

<!-- more -->

## 1. 不可变容器

### 1.1. JDK不可变容器

java原生提供了一些不可变容器，它们最大的特点就是不支持添加、删除、修改容器内的值

`Collections.emptyXxx`空容器

```java
Collections.emptyMap();
Collections.emptyList();
Collections.emptySet();
```

上面三个是最常用的几个了，通常当我们一个方法的返回结果定义为容器类型时，可能为了避免npe，在返回空容器时，会如此使用

除了上面这几个空的不可变容器之外，还有

- `UnmodifiableList`
- `UnmodifiableMap`
- `UnmodifiableSet`

它们的使用姿势，通常是借助`Collections`来实现

```java
List<Integer> list = Collections.unmodifiableList(Arrays.asList(1, 2, 3));
```

如上面创建的List，就不支持set/remove等修改操作

使用不可变容容器，最大的好处就是基于它的不可修改特性，来实现公用，且不会被污染

- 所以一个自然而然能想到的应用场景就是 `全局共享的配置`

### 1.2. Guava不可变容器

上面是jdk提供的不可变容器，相比较与它们，在实际的项目中，使用Gauva的不可变容器的可能更多

- `ImmutableXxx`；不可变容器

```java
List<Integer> list = ImmutableList.of(1, 2, 3);
Set<Integer> set = ImmutableSet.of(1, 2, 3);
Map<String, Integer> map = ImmutableMap.of("hello", 1, "world", 2);
```

上面是最常见的三个容器对应的不可变型

从使用角度来看，初始化非常方便（相比较与jdk版而言）

## 2. 注意事项

不可变容器虽好，但是使用不当也是很坑的；就我个人的一个观点

- 如果是应用内的接口方法，容器传参，返回容器时，尽量不要使用不可变容器；因为你没办法保证别人拿到你的返回容器之后，会对它进行什么操作
- 如果是对外提供返回结果，特别是null的场景，使用不可变的空容器优于返回null
- 不可变容器，用于全局公用资源，共享配置参数；多线程的数据传递时，属于比较合适的场景

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战11：Map转换Map的几种方式

在日常开发过程中，从一个Map转换为另外一个Map属于基本操作了，那么我们一般怎么去实现这种场景呢？有什么更简洁省事的方法么？

<!-- more -->

## 1.Map互转

### 1.1 实例场景

现在我们给一个简单的实例

希望将一个`Map<String, Integer>` 转换成 `Map<String, String>`，接下来看一下有哪些实现方式，以及各自的优缺点

首先提供一个创建Map的公共方法

```java
private static <T> Map<String, T> newMap(String key, T val, Object... kv) {
    Map<String, T> ans = new HashMap<>(8);
    ans.put(key, val);
    for (int i = 0, size = kv.length; i < size; i += 2) {
        ans.put(String.valueOf(kv[i]), (T) kv[i + 1]);
    }
    return ans;
}
```

#### 1.1.1 基本的for循环转换

这种方式是最容易想到和实现的，直接for循环来转换即可

```java
@Test
public void forEachParse() {
    Map<String, Integer> map = newMap("k", 1, "a", 2, "b", 3);
    Map<String, String> ans = new HashMap<>(map.size());
    for (Map.Entry<String, Integer> entry: map.entrySet()) {
        ans.put(entry.getKey(), String.valueOf(entry.getValue()));
    }
    System.out.println(ans);
}
```

这种方式的优点很明显，实现容易，业务直观；

缺点就是可复用性较差，代码量多（相比于下面的case）

#### 1.1.2 容器的流式使用

在jdk1.8提供了流式操作，同样也可以采用这种方式来实现转换

```java
@Test
public void stream() {
    Map<String, Integer> map = newMap("k", 1, "a", 2, "b", 3);
    Map<String, String> ans = map.entrySet().stream().collect(
            Collectors.toMap(Map.Entry::getKey, s -> String.valueOf(s.getValue()), (a, b) -> a));
    System.out.println(ans);
}
```

使用stream的方式，优点就是链式，代码量少；缺点是相较于上面的阅读体验会差一些（当然这个取决于个人，有些小伙伴就更习惯看这种链式的代码）

#### 1.1.3 Guava的trasform方式

从代码层面来看，上面两个都不够直观，如果对guava熟悉的小伙伴对下面的代码可能就很熟悉了

```java
@Test
public void transfer() {
    Map<String, Integer> map = newMap("k", 1, "a", 2, "b", 3);
    Map<String, String> ans =  Maps.transformValues(map, String::valueOf);
    System.out.println(ans);
}
```

核心逻辑就一行 `Maps.transformValues(map, String::valueOf)`，实现了我们的Map转换的诉求

很明显，这种方式的优点就是间接、直观；当然缺点就是需要引入guava，并且熟悉guava

### 1.2 最后一问，这篇文章目的是啥？

既然我们的标题是实战小技巧，本文除了给大家介绍可以使用guava的`Maps.transformValues`来实现map转换之外，更主要的一个目的是如果让我们自己来实现一个工具类，来支持这个场景，应该怎么做？

直接提供一个转换方法？

**第一步：一个泛型的转换接口**

```java
public <K, T, V> Map<K, V> transform(Map<K, T> map) {
}
```

定义上面这个接口之后，自然而然想到的缺点就是差一个value的转换实现

**第二步：value转换的定义**

这里采用Function接口思想来定义转换类

```java
public <K, T, V> Map<K, V> transform(Map<K, T> map, Function<T, V> func) {
}
```

当然到这里我们就需要注意jdk1.8以下是不支持函数编程的，那么我们可以怎么来实现呢？

这个时候再对照一下guava的实现，然后再手撸一个，知识点就到手了

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战12：巧用函数方法实现二维数组遍历

对于数组遍历，基本上每个开发者都写过，遍历本身没什么好说的，但是当我们在遍历的过程中，有一些复杂的业务逻辑时，将会发现代码的层级会逐渐加深

<!-- more -->

如一个简单的case，将一个二维数组中的偶数找出来，保存到一个列表中

二维数组遍历，每个元素判断下是否为偶数，很容易就可以写出来，如

```java
public void getEven() {
    int[][] cells = new int[][]{{1, 2, 3, 4}, {11, 12, 13, 14}, {21, 22, 23, 24}};
    List<Integer> ans = new ArrayList<>();
    for (int i = 0; i < cells.length; i ++) {
        for (int j = 0; j < cells[0].length; j++) {
            if ((cells[i][j] & 1) == 0) {
                ans.add(cells[i][j]);
            }
        }
    }
    System.out.println(ans);
}
```

上面这个实现没啥问题，但是这个代码的深度很容易就有三层了；当上面这个if中如果再有其他的判定条件，那么这个代码层级很容易增加了；二维数组还好，如果是三维数组，一个遍历就是三层；再加点逻辑，四层、五层不也是分分钟的事情么

那么问题来了，代码层级变多之后会有什么问题呢？

> 只要代码能跑，又能有什么问题呢？！

## 1. 函数方法消减代码层级

由于多维数组的遍历层级天然就很深，那么有办法进行消减么？

要解决这个问题，关键是要抓住重点，遍历的重点是什么？获取每个元素的坐标！那么我们可以怎么办？

> 定义一个函数方法，输入的就是函数坐标，在这个函数体中执行我们的遍历逻辑即可

基于上面这个思路，相信我们可以很容易写一个二维的数组遍历通用方法

```java
public static void scan(int maxX, int maxY, BiConsumer<Integer, Integer> consumer) {
    for (int i = 0; i < maxX; i++) {
        for (int j = 0; j < maxY; j++) {
            consumer.accept(i, j);
        }
    }
}
```

主要上面的实现，函数方法直接使用了JDK默认提供的BiConsumer，两个传参，都是int 数组下表；无返回值

那么上面这个怎么用呢？

同样是上面的例子，改一下之后，如

```java
public void getEven() {
    int[][] cells = new int[][]{{1, 2, 3, 4}, {11, 12, 13, 14}, {21, 22, 23, 24}};
    List<Integer> ans = new ArrayList<>();
    scan(cells.length, cells[0].length, (i, j) -> {
        if ((cells[i][j] & 1) == 0) {
            ans.add(cells[i][j]);
        }
    });
    System.out.println(ans);
}
```

相比于前面的，貌似也就少了一层而已，好像也没什么了不起的

但是，当数组变为三维、四维、无维时，这个改动的写法层级都不会变哦

## 2. 遍历中return支持

前面的实现对于正常的遍历没啥问题；但是当我们在遍历过程中，遇到某个条件直接返回，能支持么？

如一个遍历二维数组，我们希望判断其中是否有偶数，那么可以怎么整？

仔细琢磨一下我们的scan方法，希望可以支持return，主要的问题点就是这个函数方法执行之后，我该怎么知道是继续循环还是直接return呢?

很容易想到的就是执行逻辑中，添加一个额外的返回值，用于标记是否中断循环直接返回

基于此思路，我们可以实现一个简单的demo版本

定义一个函数方法，接受循环的下标 + 返回值

```java
@FunctionalInterface
public interface ScanProcess<T> {
    ImmutablePair<Boolean, T> accept(int i, int j);
}
```

循环通用方法就可以相应的改成

```java
public static <T> T scanReturn(int x, int y, ScanProcess<T> func) {
    for (int i = 0; i < x; i++) {
        for (int j = 0; j < y; j++) {
            ImmutablePair<Boolean, T> ans = func.accept(i, j);
            if (ans != null && ans.left) {
                return ans.right;
            }
        }
    }
    return null;
}
```

基于上面这种思路，我们的实际使用姿势如下

```java
@Test
public void getEven() {
    int[][] cells = new int[][]{{1, 2, 3, 4}, {11, 12, 13, 14}, {21, 22, 23, 24}};
    List<Integer> ans = new ArrayList<>();
    scanReturn(cells.length, cells[0].length, (i, j) -> {
        if ((cells[i][j] & 1) == 0) {
            return ImmutablePair.of(true, i + "_" + j);
        }
        return ImmutablePair.of(false, null);
    });
    System.out.println(ans);
}
```

上面这个实现可满足我们的需求，唯一有个别扭的地方就是返回，总有点不太优雅；那么除了这种方式之外，还有其他的方式么？

既然考虑了返回值，那么再考虑一下传参呢？通过一个定义的参数来装在是否中断以及返回结果，是否可行呢？

基于这个思路，我们可以先定义一个参数包装类

```java
public static class Ans<T> {
    private T ans;
    private boolean tag = false;

    public Ans<T> setAns(T ans) {
        tag = true;
        this.ans = ans;
        return this;
    }

    public T getAns() {
        return ans;
    }
}

public interface ScanFunc<T> {
    void accept(int i, int j, Ans<T> ans)
}
```

我们希望通过Ans这个类来记录循环结果，其中tag=true，则表示不用继续循环了，直接返回ans结果吧

与之对应的方法改造及实例如下

```java
public static <T> T scanReturn(int x, int y, ScanFunc<T> func) {
    Ans<T> ans = new Ans<>();
    for (int i = 0; i < x; i++) {
        for (int j = 0; j < y; j++) {
            func.accept(i, j, ans);
            if (ans.tag) {
                return ans.ans;
            }
        }
    }
    return null;
}

public void getEven() {
    int[][] cells = new int[][]{{1, 2, 3, 4}, {11, 12, 13, 14}, {21, 22, 23, 24}};
    String ans = scanReturn(cells.length, cells[0].length, (i, j, a) -> {
        if ((cells[i][j] & 1) == 0) {
            a.setAns(i + "_" + j);
        }
    });
    System.out.println(ans);
}
```

这样看起来就比前面的要好一点了

实际跑一下，看下输出是否和我们预期的一致；

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/546a699ae4334df4b6525332da4e5770~tplv-k3u1fbpfcp-watermark.image?)

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战13：List转Map List的几种姿势

今天介绍一个实用的小知识点，如何将List转为`Map<Object, List<Object>>`

<!-- more -->

## 1. 转换方式

### 1.1. 基本写法

最开始介绍的当然是最常见、最直观的写法，当然也是任何限制的写法

```java
// 比如将下面的列表，按照字符串长度进行分组
List<String> list = new ArrayList<>();
list.add("hello");
list.add("word");
list.add("come");
list.add("on");
Map<Integer, List<String>> ans = new HashMap<>();

for(String str: list) {
    List<String> sub = ans.get(str.length());
    if(sub == null) {
        sub = new ArrayList<>();
        ans.put(str.length(), sub);
    }
    sub.add(str);
}
System.out.println(ans);
```

对于jdk8+，上面for循环中的内容可以利用`Map.computeIfAbsent`来替换，具体写法如下

```java
for (String str : list) {
    ans.computeIfAbsent(str.length(), k -> new ArrayList<>()).add(str);
}
```

当然既然已经是jdk1.8了，借助Stream的流处理，可以将上面的更一步进行简化，如下

```java
Map<Integer, List<String>> ans = list.stream().collect(Collectors.groupingBy(String::length));
```

### 1.2. 通用方法

上面是针对特定的列表，针对业务进行开发转换，那么我们接下来尝试构建一个通用的工具类

这里我们主要借助的知识点就是泛型，一个重要的点就是如何获取Map中的key

对于jdk < 1.8的写法，通过接口来定义实现key的获取姿势

```java
public static <K, V> Map<K, List<V>> toMapList(List<V> list, KeyFunc<V, K> keyFunc) {
    Map<K, List<V>> result = new HashMap<>();
    for (V item: list) {
        K key = keyFunc.getKey(item);
        if (!result.containsKey(key)) {
            result.put(key, new ArrayList<>());
        }
        result.get(key).add(item);
    }
    return result;
}

public static interface KeyFunc<T, K> {
    K getKey(T t);
}
```

使用demo如下

```java
public static void main(String[] args) {
    List<String> list = new ArrayList<>();
    list.add("hello");
    list.add("word");
    list.add("come");
    list.add("on");
    Map<Integer, List<String>> res = toMapList(list, new KeyFunc<String, Integer>() {
        @Override
        public Integer getKey(String s) {
            return s.length();
        }
    });
    System.out.println(res);
}
```

接下来再看一下jdk1.8之后的写法，结合stream + 函数方法来实现

```java
public static <K, V> Map<K, List<V>> toMapList(List<V> list, Function<V, K> func) {
    return list.stream().collect(Collectors.groupingBy(func));
}
```

其对应的使用方式则如下

```java
public static void main(String[] args) {
    List<String> list = new ArrayList<>();
    list.add("hello");
    list.add("word");
    list.add("come");
    list.add("on");
    Map<Integer, List<String>> res = toMapList(list, (Function<String, Integer>) String::length);
    System.out.println(res);
}
```

### 1.3. 工具类

上一节介绍了基于泛型 + jdk8 Stream + 函数方法来实现通用转换工具类的实现姿势，接下来我们小结一下，输出一个适用于1.8之后的工具类

```java
/**
 * List<V>转换为Map<K, List<V>> 特点在于Map中的value，是个列表，且列表中的元素就是从原列表中的元素
 *
 * @param list
 * @param func 基于list#item生成Map.key的函数方法
 * @param <K>
 * @param <V>
 * @return
 */
public static <K, V> Map<K, List<V>> toMapList(List<V> list, Function<V, K> func) {
    return list.stream().collect(Collectors.groupingBy(func));
}

/**
 * List<I>转换为Map<K, List<V>> 特点在于Map中的value是个列表，且列表中的元素是由list.item转换而来
 *
 * @param list
 * @param keyFunc 基于list#item生成的Map.key的函数方法
 * @param valFunc 基于list#item转换Map.value列表中元素的函数方法
 * @param <K>
 * @param <I>
 * @param <V>
 * @return
 */
public static <K, I, V> Map<K, List<V>> toMapList(List<I> list, Function<I, K> keyFunc, Function<I, V> valFunc) {
    return list.stream().collect(Collectors.groupingBy(keyFunc, Collectors.mapping(valFunc, Collectors.toList())));
}
```

### 1.4.guava HashMultimap扩展知识点

最后再介绍一个扩展知识点，Gauva工具包中提供了一个`HashMultimap`的工具类，他的使用姿势和我们平常的Map并无差别，但是需要在注意的是，它的value是个集合

```java
List<String> list = new ArrayList<>();
list.add("hello");
list.add("word");
list.add("come");
list.add("on");
list.add("on");
HashMultimap<Integer, String> map = HashMultimap.create();
for (String item: strList) {
    map.put(item.length(), item);
}
System.out.println(map);
```

实际输出如下，验证了value实际上是个集合（on只有一个，如果是我们上面的工具类，会输出两个）

```
{2=[on], 4=[word, come], 5=[hello]}
```

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战14：分页遍历得两种实现策略

在日常开发中，分页遍历迭代的场景可以说非常普遍了，比如扫表，每次捞100条数据，然后遍历这100条数据，依次执行某个业务逻辑；这100条执行完毕之后，再加载下一百条数据，直到扫描完毕

那么要实现上面这种分页迭代遍历的场景，我们可以怎么做呢

本文将介绍两种使用姿势

- 常规的使用方法
- 借助Iterator的使用姿势

<!-- more -->

## 1. 实现方式

### 1.1. 数据查询模拟

首先mock一个分页获取数据的逻辑，直接随机生成数据，并且控制最多返回三页

```java
public static int cnt = 0;

private static List<String> randStr(int start, int size) {
    ++cnt;
    if (cnt > 3) {
        return Collections.emptyList();
    } else if (cnt == 3) {
        cnt = 0;
        size -= 2;
    }

    System.out.println("======================= start to gen randList ====================");
    List<String> ans = new ArrayList<>(size);
    for (int i = 0; i < size; i++) {
        ans.add((start + i) + "_" + UUID.randomUUID().toString());
    }
    return ans;
}
```

### 1.2. 基本实现方式

针对这种场景，最常见也是最简单直观的实现方式

- while死循环
- 内部遍历

```java
private static void scanByNormal() {
    int start = 0;
    int size = 5;
    while (true) {
        List<String> list = randStr(start, size);
        for (String str : list) {
            System.out.println(str);
        }

        if (list.size() < size) {
            break;
        }
        start += list.size();
    }
}
```

### 1.3. 迭代器实现方式

接下来介绍一种更有意思的方式，借助迭代器的遍历特性来实现，首先自定义一个通用分页迭代器

```java
public static abstract class MyIterator<T> implements Iterator<T> {
    private int start = 0;
    private int size = 5;

    private int currentIndex;
    private boolean hasMore = true;
    private List<T> list;

    public MyIterator() {
    }

    @Override
    public boolean hasNext() {
        if (list != null && list.size() > currentIndex) {
            return true;
        }

        // 当前的数据已经加载完毕，尝试加载下一批
        if (!hasMore) {
            return false;
        }

        list = load(start, size);
        if (list == null || list.isEmpty()) {
            // 没有加载到数据，结束
            return false;
        }

        if (list.size() < size) {
            // 返回条数小于限制条数，表示还有更多的数据可以加载
            hasMore = false;
        }

        currentIndex = 0;
        start += list.size();
        return true;
    }

    @Override
    public T next() {
        return list.get(currentIndex++);
    }

    public abstract List<T> load(int start, int size);
}
```

接下来借助上面的迭代器可以比较简单的实现我们的需求了

```java
private static void scanByIterator() {
    MyIterator<String> iterator = new MyIterator<String>() {
        @Override
        public List<String> load(int start, int size) {
            return randStr(start, size);
        }
    };

    while (iterator.hasNext()) {
        String str = iterator.next();
        System.out.println(str);
    }
}
```

那么问题来了，上面这种使用方式比前面的优势体现再哪儿呢？

- 双层循环改为单层循环

接下来接入重点了，在jdk1.8引入了函数方法 + lambda之后，又提供了一个更简洁的使用姿势

```java
public class IteratorTestForJdk18 {

    @FunctionalInterface
    public interface LoadFunc<T> {
        List<T> load(int start, int size);
    }

    public static class MyIterator<T> implements Iterator<T> {
        private int start = 0;
        private int size = 5;

        private int currentIndex;
        private boolean hasMore = true;
        private List<T> list;
        private LoadFunc<T> loadFunc;

        public MyIterator(LoadFunc<T> loadFunc) {
            this.loadFunc = loadFunc;
        }

        @Override
        public boolean hasNext() {
            if (list != null && list.size() > currentIndex) {
                return true;
            }

            // 当前的数据已经加载完毕，尝试加载下一批
            if (!hasMore) {
                return false;
            }

            list = loadFunc.load(start, size);
            if (list == null || list.isEmpty()) {
                // 没有加载到数据，结束
                return false;
            }

            if (list.size() < size) {
                // 返回条数小于限制条数，表示还有更多的数据可以加载
                hasMore = false;
            }

            currentIndex = 0;
            start += list.size();
            return true;
        }

        @Override
        public T next() {
            return list.get(currentIndex++);
        }
    }
}
```

在jdk1.8及之后的使用姿势，一行代码即可

```java
private static void scanByIteratorInJdk8() {
    new MyIterator<>(IteratorTestForJdk18::randStr)
        .forEachRemaining(System.out::println);
}
```

这次对比效果是不是非常显眼了，从此以后分页迭代遍历再也不用冗长的双重迭代了

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战15：数组拷贝

说实话，在实际的业务开发中，基本上很少很少很少...会遇到数组拷贝的场景，甚至是我们一般都不怎么用数组，List它不香嘛，为啥要用数组

现在问题来了，要实现数组拷贝，怎么整？

<!-- more -->

## 1. 实现方式

### 1.1. 基础写法

最简单直接的写法，那就是新建一个数组，一个一个拷贝进去，不就完事了么

```java
String[] data = new String[]{"1", "2", "3"};
String[] ans = new String[data.length];
for (int index = 0; index < data.length; index ++) {
    ans[index] = data[index];
}
```

### 1.2. 借用容器中转

数组用起来有点麻烦，还是用容器舒爽，借助List来实现数组的拷贝，也就几行代码

```java
String[] data = new String[]{"1", "2", "3"};
List<String> list = Arrays.asList(data);
String[] out = new String[data.length];
list.toArray(out);
```

### 1.3. Array.copy

上面这个有点绕得远了， 直接使用Array.copy

```java
String[] data = new String[]{"1", "2", "3"};
String[] out = Arrays.copyOf(data, data.length);
```

### 1.4. System.arraycopy

除了上面的，还可以使用更基础的用法

```java
String[] data = new String[]{"1", "2", "3"};
String[] out = new String[data.length];
System.arraycopy(data, 0, out, 0, data.length);
```

如果有看过jdk源码的小伙伴，上面这个用法应该不会陌生，特别是在容器类，这种数组拷贝的方式比比可见

参数说明:

```java
public static native void arraycopy(Object src,  int  srcPos,
        Object dest, int destPos,
        int length);
```

- src : 原数组
- srcPos: 原数组用于拷贝的起始下标
- dest: 拷贝后的数组
- destPos: 目标数组的小标
- length: 原数组中拷贝过去的数组长度

从上面的描述也能看出来，这个方法不仅能实现数组拷贝，还可以实现数组内指定片段的拷贝

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战16：判断类为基础类型or基础类型的包装类

判断一个类是否为基础类型属于常规操作了，一般我们遇到这种case，要怎么处理呢？

一个一个的if/else判断? 还是其他的操作姿势？

<!-- more -->

## 1. 基础类型判断

基础类型可以借助class类的`isPrimitive`方法来实现判定，使用姿势也简单

```java
obj.getClass().isPrimitive()
```

如果返回true，那么这个对象就是基本类型

- boolean
- char
- byte
- short
- int
- long
- float
- double
- void

但是请注意，对于封装类型，比如Long，访问isPrimitive返回的是false

## 2. 封装类型判断

那么封装类型可以怎么判断呢？难道一个一个的判定不成？

首先我们注意到`Class#isPrimitive`的方法签名，如下

```java
/**
 * @see     java.lang.Boolean#TYPE
 * @see     java.lang.Character#TYPE
 * @see     java.lang.Byte#TYPE
 * @see     java.lang.Short#TYPE
 * @see     java.lang.Integer#TYPE
 * @see     java.lang.Long#TYPE
 * @see     java.lang.Float#TYPE
 * @see     java.lang.Double#TYPE
 * @see     java.lang.Void#TYPE
 * @since JDK1.1
 */
public native boolean isPrimitive();
```

上面的注释中，提到了Boolean#Type之类的静态成员，也就是说包装类型，都有一个TYPE的静态成员

比如boolean的是这个

```java
@SuppressWarnings("unchecked")
public static final Class<Boolean> TYPE = (Class<Boolean>) Class.getPrimitiveClass("boolean");
```

所以我们可以通过这个TYPE来判定，当前对象是否为封装对象

```java
try {
    return ((Class) clz.getField("TYPE").get(null)).isPrimitive();
} catch (Exception e) {
    return false;
}
```

如果Class对象没有TYPE字段，那么就不是封装类，直接抛异常，返回false；当然这种通过异常的方式来判定，并不优雅；但是写法上比我们一个一个的if/else进行对比，要好得多了

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战17：Java对象内存地址输出

## 输出对象地址

当一个对象没有重写`hascode`方法时，它返回的内存地址，当覆盖之后，我们有什么办法获取对象的内存地址么? 

- 使用 `System.identityHashCode()` 输出内存地址

<!-- more -->

```java
public static void main(String[] args) {
    BaseDo base = new BaseDo();
    base.name = "hello";
    int addr = System.identityHashCode(base);
    System.out.println(base.hashCode() + "|" + addr);
}

public static class BaseDo {
    String name;

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
```

输出结果如:

```
997608398|997608398
```

这个有啥用？

- 判断两个对象是否为同一个对象时，可以借用（我是在验证Mybatis的一级缓存的，判断返回的Entity是否确实是同一个的时候以此来判定的）

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战18：随机数生成怎么选

随机数生成，java中有一个专门的Random类来实现，除此之外，使用`Math.random`的也比较多，接下来我们简单学习下，随机数的使用姿势

<!-- more -->

## 1.随机数生成

### 1.1. Math.random

jdk提供的基础工具类Math中封装一些常用的基础方法，比如我们今天的主题，生成随机数，使用姿势如下

```java
double val = Math.random();
```

使用起来比较简单，生成的是[0,1)之间的浮点数，但是不要以为它就真的只能生成0-1之间的随机数，举例如下

如果想利用它，生成一个 `[120, 500]` 这个区间的随机数，怎么整？

```java
int ans = Double.valueOf(Math.ceil(Math.random() * 381 + 120)).intValue();
```

为啥上面的可行？

将上面的代码翻译一下，取值区间如

`Math.random() * 381 + 120` 取值范围如下

- [0, 1) * 381 + 120
- [0, 381) + 120
- [120, 501)

借助`Math.ceil`只取浮点数中的整数部分，这样我们的取值范围就是 [120, 500]了，和我们的预期一致

最后简单来看下，`Math.random()`是怎么实现随机数的

```java
private static final class RandomNumberGeneratorHolder {
    static final Random randomNumberGenerator = new Random();
}

public static double random() {
    return RandomNumberGeneratorHolder.randomNumberGenerator.nextDouble();
}
```

请注意上面的实现，原来底层依然使用的是`Random`类来生成随机数，而且上面这种写法属于非常经典的单例模式写法（不同于我们常见的双重判定方式，这种属于内部类的玩法，后面再说为啥可以这么用）

### 1.2. Random

除了使用上面的Math.random来获取随机数之外，直接使用Random类也是很常见的case；接下来先简单看一下Random的使用姿势

**创建Random对象**

```java
// 以当前时间戳作为随机种子
Random random = new Random();
// 以固定的数字作为随机种子，好处是每次执行时生成的随机数是一致的，便于场景复现
Random random2 = new Random(10);
```

**生成随机数**

```java
// [0, max) 之间的随机整数
random.nextInt(max);

// 随机返回ture/false
random.nextBoolean()

// 随机长整数
random.nextLong()

// 随机浮点数
random.nextFloat()
random.nextDouble()
```

伪随机高斯分布双精度数

```java
random.nextGaussian()
```

随机类的nextGaussian()方法返回下一个伪随机数，即与随机数生成器序列的平均值为0.0，标准差为1.0的高斯(正态)分布双精度值

这种使用场景可能用在更专业的场景，至少我接触过的业务开发中，没有用过这个😂

### 1.3. Math.random 与 Random如何选

上面两个都可以用来生成随机数，那么在实际使用的时候，怎么选择呢？

从前面的描述也可以知道，它们两没啥本质区别，底层都是用的Random类，在实际的运用过程中，如果我们希望可以场景复现，比如测试中奖概率的场景下，选择Random类，指定随机种子可能更友好；如果只是简单的随机数生成使用，那么选择`Math.random`即可，至少使用起来一行代码即可

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战19：数字格式化

数字的格式化场景，更多的是在日志输出、金额计算相关的领域中会用到，平常我们可能更多使用`String.format`来格式化，但是请注意，数字格式化是有一个`DecimalFormat`，专门来针对数字进行格式化

今天我们的知识点就是DecimalFormat来实现数字格式化

<!-- more -->

## 1. 格式化

### 1.1. DecimalFormat使用说明

对于DecimalFormat的使用比较简单，主要是借助两个占位`0`与`#`，区别在于当格式化的占位数，多余实际数的时候，占位`0`的场景下，会用前缀0来补齐；而`#`则不需要补齐

上面这个可能不太好理解，举例说明如下

```java
double num = 3.1415926;
System.out.println(new DecimalFormat("000", num));
System.out.println(new DecimalFormat("###", num));
```

上面两个都是只输出整数，但是输出结果不同，如下

```
003
3
```

简单来说，就是`0`，主要用于定长的输出，对于不足的，前缀补0

**整数#小数**

除了上面的基本姿势之外，更常见的是设置整数、小数的位数

```java
System.out.println(new DecimalFormat("000.00", num));
System.out.println(new DecimalFormat("###.##", num));
```

输出结果如下

```
003.14
3.14
```

**百分比**

百分比的输出也属于常见的case，使用DecimalFormat就很简单

```java
System.out.println(new DecimalFormat("000.00%", num));
System.out.println(new DecimalFormat("###.##%", num));
```

输出如下

```
314.16%
314.16%
```

**科学计数**

非专业场景下，科学技术的可能性比较小

```java
System.out.println(new DecimalFormat("000.00E0", num));
System.out.println(new DecimalFormat("###.##E0", num));
```

输出结果如下

```
314.16E-2
3.1416E0
```

**金钱样式输出**

金融相关的钱输出时，非常有意思的是每三位加一个逗号分隔，如果想实现这个效果，也可以很简单完成

```java
double num = 31415926
System.out.println(new DecimalFormat(",###", num));
```

输出结果如下

```
31,415,926
```

**嵌入模板输出**

格式化模板，除了基础的`000, ###`之外，还可以直接放在一个字符串中，实现类似`String.format`的效果

比如显示余额

```java
double num = 31415926
System.out.println(new DecimalFormat("您的余额,###￥", num));
```

输出结果如下

```
您的余额31,415,926￥
```

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战20：进制转换很简单

进制转换，属于基本技能了，在java中要实现进制转换很简单，可以非常简单的实现，接下来我们来看下它的使用姿势

<!-- more -->

## 1. 进制转换

### 1.1. toString实现进制转换

Integer/Long#toString(int i, int radix) 可以将任一进制的整数，转换为其他任意进制的整数

- 第一个参数：待转换的数字
- 第二个参数：转换后的进制位

**十六进制转十进制**

```java
Integer.toString(0x12, 10)
```

**八进制转是十进制**

```java
Integer.toString(012, 10)
```

**八进制转二进制**

```java
Integer.toString(012, 2)
```

### 1.2. 十进制转二进制

除了使用上面的姿势之外，可以直接使用`toBinaryString`来实现转二进制

```java
Integer.toBinaryString(2)
Long.toBinaryString(2)
```

### 1.3. 十进制转八进制

`Integer/Long#toOctalString`: 转八进制

```java
Integer.toOctalString(9)
```

### 1.4. 十进制转十六进制

`Integer/Long#toHexString`: 转十六进制

```java
Integer.toHexString(10)
```

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战21：Properties配置文件

properties配置文件，相信各位小伙伴都不会太陌生，常用Spring的可能会经常看到它，虽说现在更推荐的是使用Yaml配置文件，但是properties配置文件的使用频率也不低

在jdk中有一个直接关连的类Properties，接下来我们来看一下它的用法

<!-- more -->

## 1. Properties配置类

### 1.1. 配置文件

properties文件的格式比较简单

- `key = value`: 等号左边的为配置key，右边的为配置value（value值会去除前后的空格）
- `#`：以`#`来区分注释

一个基础的配置文件如下

```
# 测试

key = value
user.name = 一灰灰blog
user.age = 18
user.skill = java,python,js,shell
```

### 1.2. 配置文件加载

对于Properties配置文件，我们可以非常简单的借助`Properties`类，来实现配置的加载

```java
public class PropertiesUtil {

    /**
     * 从文件中读取配置
     *
     * @param propertyFile
     * @return
     * @throws IOException
     */
    public static Properties loadProperties(String propertyFile) throws IOException {
        Properties config = new Properties();
        config.load(PropertiesUtil.class.getClassLoader().getResourceAsStream(propertyFile));
        return config;
    }
}
```

直接使用`Properties#config`就可以读取配置文件内容，并赋值到java对象

**重点注意：**

重点看一下Properties类的继承关系，它的父类是Hashtable, 也就是说它的本质是Map对象

```java
public
class Properties extends Hashtable<Object,Object> {
}
```

### 1.3. Properties对象使用

因为`Properties`是继承自Hashtable，而Hashtable是线程安全的Map容器，因此Properties也是线程安全的，同样的，在多线程并发获取配置的时候，它的性能表现也就不咋地了，why? 

首先看一下配置获取

```java
// 获取配置属性
public String getProperty(String key) {
    Object oval = super.get(key);
    String sval = (oval instanceof String) ? (String)oval : null;
    return ((sval == null) && (defaults != null)) ? defaults.getProperty(key) : sval;
}

// 获取配置属性，如果不存在，则返回默认值
public String getProperty(String key, String defaultValue) {
    String val = getProperty(key);
    return (val == null) ? defaultValue : val;
}
```

上面两个方法的使用频率很高，从签名上也很容易知道使用姿势；接下来需要看一下的为啥说并发效率很低

关键点就在第一个方法的`super.get()`，它对应的源码正是

```java
public synchronized V get(Object key) {
  // ...
}
```

方法签名上有`synchronized`，所以为啥说并发环境下的性能表现不会特别好也就知道原因了

除了获取配置之外，另外一个常用的就是更新配置

```java
public synchronized Object setProperty(String key, String value) {
    return put(key, value);
}
```

## 2. 小结

本文介绍的知识点主要是properties配置文件的处理，使用同名的java类来操作；需要重点注意的是Properties类属于Hashtable的子类，同样属于容器的范畴

最后提一个扩展的问题，在SpringBoot的配置自动装载中，可以将配置内容自动装载到配置类中，简单来讲就是支持配置到java bean的映射，如果现在让我们来实现这个，可以怎么整？

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战22：Properties配置文件自动装载JavaBean

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

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战23：基于引入包选择具体实现类

最近遇到一个需求场景，开源的工具包，新增了一个高级特性，会依赖json序列化工具，来做一些特殊操作；但是，这个辅助功能并不是必须的，也就是说对于使用这个工具包的业务方而言，正常使用完全不需要json相关的功能；如果我强引用某个json工具，一是对于不适用高级特性的用户而言没有必要；二则是我引入的json工具极有可能与使用者的不一致，会增加使用者的成本

因此我希望这个工具包对外提供时，并不会引入具体的json工具依赖；也就是说maven依赖中的`<scope>`设置为`provided`；具体的json序列化的实现，则取决于调用方自身引入了什么json工具包

那么可以怎么实现上面这个方式呢？

<!-- more -->

## 1.实现方式

### 1.1. 任务说明

上面的简单的说了一下我们需要做的事情，接下来我们重点盘一下，我们到底是要干什么

核心诉求相对清晰

1. 不强引入某个json工具
2. 若需要使用高级特性，则直接使用当前环境中已集成的json序列化工具；若没有提供，则抛异常，不支持

对于上面这个场景，常年使用Spring的我们估计不会陌生，Spring集成了很多的第三方开源组件，根据具体的依赖来选择最终的实现，比如日志，可以是logback，也可以是log4j；比如redis操作，可以是jedis，也可以是lettuce

那么Spring是怎么实现的呢？

### 1.2.具体实现

在Spring中有个注解名为`ConditionalOnClass`，表示当某个类存在时，才会干某些事情（如初始化bean对象）

它是怎么是实现的呢？（感兴趣的小伙伴可以搜索一下，或者重点关注下 `SpringBootCondition` 的实现）

这里且抛开Spring的实现姿势，我们采用传统的实现方式，直接判断是否有加载对应的类，来判断有没有引入相应的工具包

如需要判断是否引入了gson包，则判断ClassLoader是否有加载`com.google.gson.Gson`类

```java
public static boolean exist(String name) {
    try {
        return JsonUtil.class.getClassLoader().loadClass(name) != null;
    } catch (Exception e) {
        return false;
    }
}
```

上面这种实现方式就可以达到我们的效果了；接下来我们参考下Spring的ClassUtils实现，做一个简单的封装，以判断是否存在某个类

```java
// 这段代码来自Spring
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

import java.lang.reflect.Array;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Spring
 */
public abstract class ClassUtils {
    private static final Map<String, Class<?>> primitiveTypeNameMap = new HashMap(32);
    private static final Map<String, Class<?>> commonClassCache = new HashMap(64);

    private ClassUtils() {
    }

    public static boolean isPresent(String className) {
        try {
            forName(className, getDefaultClassLoader());
            return true;
        } catch (IllegalAccessError var3) {
            throw new IllegalStateException("Readability mismatch in inheritance hierarchy of class [" + className + "]: " + var3.getMessage(), var3);
        } catch (Throwable var4) {
            return false;
        }
    }

    public static boolean isPresent(String className, ClassLoader classLoader) {
        try {
            forName(className, classLoader);
            return true;
        } catch (IllegalAccessError var3) {
            throw new IllegalStateException("Readability mismatch in inheritance hierarchy of class [" + className + "]: " + var3.getMessage(), var3);
        } catch (Throwable var4) {
            return false;
        }
    }

    public static Class<?> forName(String name, ClassLoader classLoader) throws ClassNotFoundException, LinkageError {
        Class<?> clazz = resolvePrimitiveClassName(name);
        if (clazz == null) {
            clazz = (Class) commonClassCache.get(name);
        }

        if (clazz != null) {
            return clazz;
        } else {
            Class elementClass;
            String elementName;
            if (name.endsWith("[]")) {
                elementName = name.substring(0, name.length() - "[]".length());
                elementClass = forName(elementName, classLoader);
                return Array.newInstance(elementClass, 0).getClass();
            } else if (name.startsWith("[L") && name.endsWith(";")) {
                elementName = name.substring("[L".length(), name.length() - 1);
                elementClass = forName(elementName, classLoader);
                return Array.newInstance(elementClass, 0).getClass();
            } else if (name.startsWith("[")) {
                elementName = name.substring("[".length());
                elementClass = forName(elementName, classLoader);
                return Array.newInstance(elementClass, 0).getClass();
            } else {
                ClassLoader clToUse = classLoader;
                if (classLoader == null) {
                    clToUse = getDefaultClassLoader();
                }

                try {
                    return Class.forName(name, false, clToUse);
                } catch (ClassNotFoundException var9) {
                    int lastDotIndex = name.lastIndexOf(46);
                    if (lastDotIndex != -1) {
                        String innerClassName = name.substring(0, lastDotIndex) + '$' + name.substring(lastDotIndex + 1);

                        try {
                            return Class.forName(innerClassName, false, clToUse);
                        } catch (ClassNotFoundException var8) {
                        }
                    }

                    throw var9;
                }
            }
        }
    }


    public static Class<?> resolvePrimitiveClassName(String name) {
        Class<?> result = null;
        if (name != null && name.length() <= 8) {
            result = (Class) primitiveTypeNameMap.get(name);
        }

        return result;
    }

    public static ClassLoader getDefaultClassLoader() {
        ClassLoader cl = null;

        try {
            cl = Thread.currentThread().getContextClassLoader();
        } catch (Throwable var3) {
        }

        if (cl == null) {
            cl = ClassUtils.class.getClassLoader();
            if (cl == null) {
                try {
                    cl = ClassLoader.getSystemClassLoader();
                } catch (Throwable var2) {
                }
            }
        }

        return cl;
    }
}
```

工具类存在之后，我们实现一个简单的json工具类，根据已有的json包来选择具体的实现

```java
public class JsonUtil {
    private static JsonApi jsonApi;

    private static void initJsonApi() {
        if (jsonApi == null) {
            synchronized (JsonUtil.class) {
                if (jsonApi == null) {
                    if (ClassUtils.isPresent("com.fasterxml.jackson.databind.ObjectMapper", JsonUtil.class.getClassLoader())) {
                        jsonApi = new JacksonImpl();
                    } else if (ClassUtils.isPresent("com.google.gson.Gson", JsonUtil.class.getClassLoader())) {
                        jsonApi = new GsonImpl();
                    } else if (ClassUtils.isPresent("com.alibaba.fastjson.JSONObject", JsonUtil.class.getClassLoader())) {
                        jsonApi = new JacksonImpl();
                    } else {
                        throw new UnsupportedOperationException("no json framework to deserialize string! please import jackson|gson|fastjson");
                    }
                }
            }
        }
    }

    /**
     * json转实体类，会根据当前已有的json框架来执行反序列化
     *
     * @param str
     * @param t
     * @param <T>
     * @return
     */
    public static <T> T toObj(String str, Class<T> t) {
        initJsonApi();
        return jsonApi.toObj(str, t);
    }

    public static <T> String toStr(T t) {
        initJsonApi();
        return jsonApi.toStr(t);
    }
}
```

上面的实现中，根据已有的json序列化工具，选择具体的实现类，我们定义了一个JsonApi接口，然后分别gson,jackson,fastjson给出默认的实现类

```java
public interface JsonApi {
    <T> T toObj(String str, Class<T> clz);

    <T> String toStr(T t);
}

public class FastjsonImpl implements JsonApi {
    public <T> T toObj(String str, Class<T> clz) {
        return JSONObject.parseObject(str, clz);
    }

    public <T> String toStr(T t) {
        return JSONObject.toJSONString(t);
    }
}

public class GsonImpl implements JsonApi {
    private static final Gson gson = new Gson();

    public <T> T toObj(String str, Class<T> t) {
        return gson.fromJson(str, t);
    }

    public <T> String toStr(T t) {
        return gson.toJson(t);
    }
}

public class JacksonImpl implements JsonApi{
    private static final ObjectMapper jsonMapper = new ObjectMapper();

    public <T> T toObj(String str, Class<T> clz) {
        try {
            return jsonMapper.readValue(str, clz);
        } catch (Exception e) {
            throw new UnsupportedOperationException(e);
        }
    }

    public <T> String toStr(T t) {
        try {
            return jsonMapper.writeValueAsString(t);
        } catch (Exception e) {
            throw new UnsupportedOperationException(e);
        }
    }

}
```

最后的问题来了，如果调用方并没有使用上面三个序列化工具，而是使用其他的呢，可以支持么？

既然我们定义了一个JsonApi，那么是不是可以由用户自己来实现接口，然后自动选择它呢？

现在的问题就是如何找到用户自定义的接口实现了

### 1.3. 扩展机制

对于SPI机制比较熟悉的小伙伴可能非常清楚，可以通过在配置目录`META-INF/services/`下新增接口文件，内容为实现类的全路径名称，然后通过 `ServiceLoader.load(JsonApi.class)` 的方式来获取所有实现类

除了SPI的实现方式之外，另外一个策略则是上面提到的Spring的实现原理，借助字节码来处理（详情原理后面专文说明）

当然也有更容易想到的策略，扫描包路径下的class文件，遍历判断是否为实现类(额外注意jar包内的实现类场景)

接下来以SPI的方式来介绍下扩展实现方式，首先初始化JsonApi的方式改一下，优先使用用户自定义实现

```java
private static void initJsonApi() {
    if (jsonApi == null) {
        synchronized (JsonUtil.class) {
            if (jsonApi == null) {
                ServiceLoader<JsonApi> loader = ServiceLoader.load(JsonApi.class);
                for (JsonApi value : loader) {
                    jsonApi = value;
                    return;
                }

                if (ClassUtils.isPresent("com.fasterxml.jackson.databind.ObjectMapper", JsonUtil.class.getClassLoader())) {
                    jsonApi = new JacksonImpl();
                } else if (ClassUtils.isPresent("com.google.gson.Gson", JsonUtil.class.getClassLoader())) {
                    jsonApi = new GsonImpl();
                } else if (ClassUtils.isPresent("com.alibaba.fastjson.JSONObject", JsonUtil.class.getClassLoader())) {
                    jsonApi = new JacksonImpl();
                } else{
                    throw new UnsupportedOperationException("no json framework to deserialize string! please import jackson|gson|fastjson");
                }
            }
        }
    }
}
```

对于使用者而言，首先是实现接口

```java
package com.github.hui.quick.plugin.test;

import com.github.hui.quick.plugin.qrcode.util.json.JsonApi;

public class DemoJsonImpl implements JsonApi {
    @Override
    public <T> T toObj(String str, Class<T> clz) {
        // ...
    }

    @Override
    public <T> String toStr(T t) {
        // ...
    }
}
```

接着就是实现定义, `resources/META-INF/services/` 目录下，新建文件名为 `com.github.hui.quick.plugin.qrcode.util.json.JsonApi`

内容如下

```text
com.github.hui.quick.plugin.test.DemoJsonImpl
```

然后完工~

## 2. 小结

主要介绍一个小的知识点，如何根据应用已有的jar包来选择具体的实现类的方式；本文介绍的方案是通过ClassLoader来尝试加载对应的类，若能正常加载，则认为有；否则认为没有；这种实现方式虽然非常简单，但是请注意，它是有缺陷的，至于缺陷是啥...

除此之外，也可以考虑通过字节码的方式来判断是否有某个类，或者获取某个接口的实现；文中最后抛出了一个问题，如何获取接口的所有实现类

常见的方式有下面三类（具体介绍了SPI的实现姿势，其他的两种感兴趣的可以搜索一下）

- SPI定义方式
- 扫描包路径
- 字节码方式(如Spring，如Tomcat的`@HandlesTypes`)

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战24： 基于JDK的LRU算法实现

## 1. LRU算法

缓存淘汰算法--LRU算法LRU（Least recently used，最近最少使用）算法

根据数据的历史访问记录来进行淘汰数据，其核心思想是"如果数据最近被访问过，那么将来被访问的几率也更高"

再Java中可以非常简单的实现LRU算法，主要利用的是LinkedHashMap容器

### 1.1 LRU算法实现

inkedHashMap底层就是用的HashMap加双链表实现的，而且本身已经实现了按照访问顺序的存储。此外，LinkedHashMap中本身就实现了一个方法removeEldestEntry用于判断是否需要移除最不常读取的数，方法默认是直接返回false，不会移除元素

因此我们只需要重写这个方法，可以实现当缓存满之后，就移除最不常用的数据

```java
public class LruCache<K, V> extends LinkedHashMap<K, V> {
    private int size;

    public LruCache(int size) {
        super(size, 0.75f, true);
        this.size = size;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        // 当元素个数，超过指定的大小时，淘汰最老的数据
        return size() > size;

    }

    public static void main(String[] args) {
        LruCache<String, Integer> cache = new LruCache<>(4);
        for (int i = 0; i < 8; i++) {
            if (i == 6) {
                cache.get("一灰灰blog_2");
            }
            cache.put("一灰灰blog_" + i, i);
            System.out.println(i + ":" + cache);
        }

        System.out.println(cache.size);
    }
}
```

注意上面的访问，当i == 6 时，主动访问了一下 `一灰灰blog_2`，主要就是不希望淘汰掉它，再看下对应的输出

```
0:{一灰灰blog_0=0}
1:{一灰灰blog_0=0, 一灰灰blog_1=1}
2:{一灰灰blog_0=0, 一灰灰blog_1=1, 一灰灰blog_2=2}
3:{一灰灰blog_0=0, 一灰灰blog_1=1, 一灰灰blog_2=2, 一灰灰blog_3=3}
4:{一灰灰blog_1=1, 一灰灰blog_2=2, 一灰灰blog_3=3, 一灰灰blog_4=4}
5:{一灰灰blog_2=2, 一灰灰blog_3=3, 一灰灰blog_4=4, 一灰灰blog_5=5}
6:{一灰灰blog_4=4, 一灰灰blog_5=5, 一灰灰blog_2=2, 一灰灰blog_6=6}
7:{一灰灰blog_5=5, 一灰灰blog_2=2, 一灰灰blog_6=6, 一灰灰blog_7=7}
4
```

实际输出与我们预期一致

### 1.2 小结

jdk中蕴含了大量的财富，就看我们能不能识别出来了；通常我非常推荐<3年的小伙伴，有事没事多盘一下jdk的经典实现，比如各种容器的底层结构，并发类的设计思想等

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战25： 数字型字面量中的下划线

不知道有没有小伙伴看过下面这种写法，不用质疑，它没有语法错误；再很多开源的框架中可以看到类似的写法；这种再字面量中添加下划线的方式，是一种小却使用的编程小技巧，推荐给CURD开发者

```java
long price = 1_000_123L;
```

<!-- more -->

## 1. Java7新特性之数字中使用下划线

为了直观性而言，在大数之间，加上下划线用于肉眼区分，下面实例小结下用法

```java
float pi1 = 3_.1415F; // 无效的; 不能在小数点之前有下划线
float pi2 = 3._1415F; // 无效的; 不能在小数点之后有下划线
long socialSecurityNumber1 = 999_99_9999_L; //无效的，不能在L下标之前加下划线
int a1 = _52; // 这是一个下划线开头的标识符，不是个数字
int a2 = 5_2; // 有效
int a3 = 52_; // 无效的，不能以下划线结尾
int a4 = 5_______2; // 有效的
int a5 = 0_x52; // 无效，不能在0x之间有下划线
int a6 = 0x_52; // 无效的，不能在数字开头有下划线
int a7 = 0x5_2; // 有效的 (16进制数字)
int a8 = 0x52_; // 无效的，不能以下划线结尾
int a9 = 0_52; // 有效的（8进制数）
int a10 = 05_2; // 有效的（8进制数）
int a11 = 052_; // 无效的，不能以下划线结尾

long creditCardNumber = 6684_5678_9012_3456l;
long socialSecurityNumber = 333_99_9999l; 
float pi = 3.14_15F;
long hexBytes = 0xFF_EC_DE_5E;
long hexWords = 0xCAFE_BABE;
long maxLong = 0x7fff_ffff_ffff_ffffL;
byte nybbles = 0b0010_0101;
long bytes = 0b11010010_01101001_10010100_10010010;
```

简单来说，就是在数中间，插上下划线，用于划分段落

## 2. 小结

再字面量中添加下划线，主要用于分割大数，方便阅读，重点注意：

- 不能在小数点正前后添加
- 不要在L/D/F等数据类型标识的正前方添加
- 不能作为数字开头，也不能作为结尾
- 不要往进制修饰符中间或后面添加

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战26：列表遍历删除使用实例

在实际的业务开发中，容器的遍历可以说是非常非常常见的场景了，遍历删除呢，用的机会也不会少，但你真的会用么？

<!-- more -->

## 1. List遍历删除

对于列表，这里以ArrayList进行举例说明，下面给出几种经常会遇到的写法

首先初始化一个list数组

```java
List<String> list = new ArrayList<>();
for (int i = 0; i < 20; i++) {
    list.add(i + ">index");
}
```

### 1.1. foreach

这个属于我们最常见的foreach循环，在循环内部判断满足条件的直接删除

```java
for (String id : list) {
    if (id.contains("2")) {
        list.remove(id);
    }
}
```

上面这种写法导致的问题，很容易可以发现，因为上面代码跑完之后，堆栈就出来了

![IMAGE](https://blog.hhui.top/hexblog/imgs/190521/00.jpg)

很典型的并发修改错误，在foreach循环中不允许删除,新增

### 1.2. 普通for循环

```java
for (int index = 0; index < list.size(); index++) {
    if (index % 5 == 0) {
        list.remove(index);
    }
}
System.out.println(list);
```

上面这种写法呢？我们希望把列表中，第0，5，10，15位置的元素干掉，正常执行，倒是不会报错，然而输出的结果却和我们的预期不一致

```
[1>index, 2>index, 3>index, 4>index, 5>index, 7>index, 8>index, 9>index, 10>index, 11>index, 13>index, 14>index, 15>index, 16>index, 17>index, 19>index]
```

for循环中，另外一种写法可能更加常见，为了避免每次都访问 `list.size()` 方法，我可能提前用一个变量保存数组大小

```java
int size = list.size();
for (int index = 0; index < size; index++) {
    if (index % 5 == 0) {
        list.remove(index);
    } else {
        System.out.print(list.get(index));
    }
}
```

上面这个问题就很明显了，数组越界

```
2>index3>index4>index5>index8>index9>index10>index11>index14>index15>index16>index17>indexException in thread "main" java.lang.IndexOutOfBoundsException: Index: 16, Size: 16
  at java.util.ArrayList.rangeCheck(ArrayList.java:659)
  at java.util.ArrayList.get(ArrayList.java:435)
```

### 1.3. 迭代方式

下面这种可以说是标准的迭代删除的写法了，基本上大多都是这么玩

```java
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String tmp = iterator.next();
    if (tmp.contains("2")) {
        iterator.remove();
    }
}
```

### 1.4. jdk8+ 流方式

jdk8+ 推荐下面这种写法，简洁明了

```java
list.removeIf(s -> s.contains("3"));
```

## 2. 小结

注意不要在for/foreach遍历过程中删除元素，如果有移除元素的需求，使用迭代器；或者使用jdk8的流式写法也行

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战27：HashMap遍历删除使用实例

map的迭代删除，和我们常见的list，set不太一样，不能直接获取Iteraotr对象，提供的删除方法也是单个的，根据key进行删除，如果我们有个需求，将map中满足某些条件的元素删除掉，要怎么做呢？

<!-- more -->

## 1. Map 迭代删除

迭代删除，在不考虑并发安全的前提下，我们看下可以怎么支持

### 1.1. 非常不优雅版本

我们知道map并不是继承自Collection接口的，HashMap 也没有提供迭代支持，既然没法直接迭代，那我就老老实的low b版好了

```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
map.put("d", 4);

List<String> removeKey = new ArrayList<>();
for (Map.Entry<String, Integer> e: map.entrySet()) {
  if (e.getValue() % 2== 0) {
      removeKey.add(e.getKey());
  }
}
removeKey.forEach(map::remove);
```

上面的实现怎么样？并没有什么毛病

(为啥不直接在遍历中删除？）

### 1.2. 正确姿势版

虽然Map没有迭代，但是它的entrySet有啊，所以我们可以通过它来实现遍历删除

```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
map.put("d", 4);

Iterator<Map.Entry<String, Integer>> iterator = map.entrySet().iterator();
Map.Entry<String, Integer> entry;
while (iterator.hasNext()) {
    entry = iterator.next();
    if (entry.getValue() % 2 == 0) {
        iterator.remove();
    }
}
System.out.println(map);
```

上面这个可能是我们经常使用的操作姿势了，利用迭代器来操作元素

### 1.3. 简洁版

到jdk8之后，针对容器提供了很多简洁的操作方式，迭代删除这方面可以说更加简单了

```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
map.put("d", 4);
map.entrySet().removeIf(entry -> entry.getValue() % 2 == 0);
```

## 2. 小结

和列表删除元素一样，不要在for/foreach迭代过程中删除数据，如有需要，迭代器才是正解；jdk8之后更推荐流式写法

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战28：优雅的实现代码耗时统计

在我们的实际开发中，多多少少会遇到统计一段代码片段的耗时的情况，我们一般的写法如下

```java
long start = System.currentTimeMillis();
try {
    // .... 具体的代码段
} finally {
    System.out.println("cost: " + (System.currentTimeMillis() - start));
}
```

上面的写法没有什么毛病，但是看起来就不太美观了，那么有没有什么更优雅的写法呢？

<!-- more -->

## 1. 代理方式

了解Spring AOP的同学可能立马会想到一个解决方法，如果想要统计某个方法耗时，使用切面可以无侵入的实现，如

```java
// 定义切点，拦截所有满足条件的方法
@Pointcut("execution(public * com.git.hui.boot.aop.demo.*.*(*))")
public void point() {
}

@Around("point()")
public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
    long start = System.currentTimeMillis();
    try{
        return joinPoint.proceed();
    } finally {
        System.out.println("cost: " + (System.currentTimeMillis() - start));
    }
}
```

Spring AOP的底层支持原理为代理模式，为目标对象提供增强功能；在Spring的生态体系下，使用aop的方式来统计方法耗时，可以说少侵入且实现简单，但是有以下几个问题

- 统计粒度为方法级别
- 类内部方法调用无法生效（详情可以参考博文：[【SpringBoot 基础系列教程】AOP之高级使用技能](http://spring.hhui.top/spring-blog/2019/03/02/190302-SpringBoot%E5%9F%BA%E7%A1%80%E7%AF%87AOP%E4%B9%8B%E9%AB%98%E7%BA%A7%E4%BD%BF%E7%94%A8%E6%8A%80%E8%83%BD/)）

## 2. AutoCloseable

在JDK1.7引入了一个新的接口`AutoCloseable`, 通常它的实现类配合`try{}`使用，可在IO流的使用上，经常可以看到下面这种写法

```java
// 读取文件内容并输出
try (Reader stream = new BufferedReader(new InputStreamReader(new FileInputStream("/tmp")))) {
    List<String> list = ((BufferedReader) stream).lines().collect(Collectors.toList());
    System.out.println(list);
} catch (IOException e) {
    e.printStackTrace();
}
```

注意上面的写法中，最值得关注一点是，不需要再主动的写`stream.close`了，主要原因就是在`try(){}`执行完毕之后，会调用方法`AutoCloseable#close`方法；

基于此，我们就会有一个大单的想法，下一个`Cost`类实现`AutoCloseable`接口，创建时记录一个时间，close方法中记录一个时间，并输出时间差值；将需要统计耗时的逻辑放入`try(){}`代码块

下面是一个具体的实现：

```java
public static class Cost implements AutoCloseable {
    private long start;

    public Cost() {
        this.start = System.currentTimeMillis();
    }

    @Override
    public void close() {
        System.out.println("cost: " + (System.currentTimeMillis() - start));
    }
}

public static void testPrint() {
    for (int i = 0; i < 5; i++) {
        System.out.println("now " + i);
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

public static void main(String[] args) {
    try (Cost c = new Cost()) {
        testPrint();
    }
    System.out.println("------over-------");
}
```

执行后输出如下:

```
now 0
now 1
now 2
now 3
now 4
cost: 55
------over-------
```

如果代码块抛异常，也会正常输出耗时么？

```java
public static void testPrint() {
    for (int i = 0; i < 5; i++) {
        System.out.println("now " + i);
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        if (i == 3) {
            throw new RuntimeException("some exception!");
        }
    }
}
```

再次输出如下，并没有问题

```
now 0
now 1
now 2
now 3
cost: 46
Exception in thread "main" java.lang.RuntimeException: some exception!
  at com.git.hui.boot.order.Application.testPrint(Application.java:43)
  at com.git.hui.boot.order.Application.main(Application.java:50)
```

## 3. 小结

除了上面介绍的两种方式，还有一种在业务开发中不太常见，但是在中间件、偏基础服务的功能组件中可以看到，利用Java Agent探针技术来实现，比如阿里的arthas就是在JavaAgent的基础上做了各种上天的功能，后续介绍java探针技术时会专门介绍

下面小结一下三种统计耗时的方式

**基本写法**

```java
long start = System.currentTimeMillis();
try {
    // .... 具体的代码段
} finally {
    System.out.println("cost: " + (System.currentTimeMillis() - start));
}
```

优点是简单，适用范围广泛；缺点是侵入性强，大量的重复代码

**Spring AOP**

在Spring生态下，可以借助AOP来拦截目标方法，统计耗时

```java
@Around("...")
public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
    long start = System.currentTimeMillis();
    try{
        return joinPoint.proceed();
    } finally {
        System.out.println("cost: " + (System.currentTimeMillis() - start));
    }
}
```

优点：无侵入，适合统一管理（比如测试环境输出统计耗时，生产环境不输出）；缺点是适用范围小，且粒度为方法级别，并受限于AOP的使用范围

**AutoCloseable**

这种方式可以看做是第一种写法的进阶版

```java
// 定义类
public static class Cost implements AutoCloseable {
    private long start;

    public Cost() {
        this.start = System.currentTimeMillis();
    }

    @Override
    public void close() {
        System.out.println("cost: " + (System.currentTimeMillis() - start));
    }
}

// 使用姿势
try (Cost c = new Cost()) {
    ...
}
```

优点是：简单，适用范围广泛，且适合统一管理；缺点是依然有代码侵入

**说明**

上面第二种方法看着属于最优雅的方式，但是限制性强；如果有更灵活的需求，建议考虑第三种写法，在代码的简洁性和统一管理上都要优雅很多，相比较第一种可以减少大量冗余代码

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战29：获取类路径的常见方式

## 1. 资源路径查询

在Java环境中，如何获取当前类的路径，如何获取项目根路径，可以说是比较常见的需求场景了，下面简单的记录一下

<!-- more -->

```java
@Test
public void showURL() throws IOException {
    // 第一种：获取类加载的根路径
    File f = new File(this.getClass().getResource("/").getPath());
    System.out.println(f);

    // 获取当前类的所在工程路径; 如果不加“/”  获取当前类的加载目录
    File f2 = new File(this.getClass().getResource("").getPath());
    System.out.println(f2);

    // 第二种：获取项目路径
    File directory = new File("");// 参数为空
    String courseFile = directory.getCanonicalPath();
    System.out.println(courseFile);


    // 第三种：根据系统资源获取
    URL xmlpath = this.getClass().getClassLoader().getResource("");
    System.out.println(xmlpath);


    // 第四种：系统变量
    System.out.println(System.getProperty("user.dir"));

    // 第五种：获取所有的类路径 包括jar包的路径
    System.out.println(System.getProperty("java.class.path"));
}
```

输出如下:

```sh
/Users/user/Project/hui/testApp/pair/target/test-classes
/Users/user/Project/hui/testApp/pair/target/test-classes/net/finbtc/coin/test
/Users/user/Project/hui/testApp/pair
file:/Users/user/Project/hui/testApp/pair/target/test-classes/
/Users/user/Project/hui/testApp/pair
/Applications/IntelliJ IDEA.app/Contents/lib/idea_rt.jar:... （太长省略）
```

## 2. 小结

1. `new File(this.getClass().getResource("/").getPath())`
   - 获取类加载的根路径
2. `new File(this.getClass().getResource("").getPath())`
   - 获取当前类的所在工程路径; 如果不加“/”  获取当前类的加载目录
3. `new File("").getCanonicalPath()`
   - 获取项目路径
4. `this.getClass().getClassLoader().getResource("")`
5. `System.getProperty("user.dir")`
6. `System.getProperty("java.class.path")`
   - 获取所有的类路径 包括jar包的路径

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战30：JDK压缩与解压工具类

在实际的应用场景中，特别是对外传输数据时，将原始数据压缩之后丢出去，可以说是非常常见的一个case了，平常倒是没有直接使用JDK原生的压缩工具类，使用Protosutff和Kryo的机会较多,正好在实际的工作场景中遇到了，现在简单的看下使用姿势

<!-- more -->

## 1. 压缩与解压工具类

### 1.1. 基本实现

主要借助的就是Deflater, Inflater两个工具类，其使用姿势如下

```java
public static String uncompress(byte[] input) throws IOException {
    Inflater inflater = new Inflater();
    inflater.setInput(input);
    ByteArrayOutputStream baos = new ByteArrayOutputStream(input.length);
    try {
        byte[] buff = new byte[1024];
        while (!inflater.finished()) {
            int count = inflater.inflate(buff);
            baos.write(buff, 0, count);
        }
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        baos.close();
    }
    inflater.end();
    byte[] output = baos.toByteArray();
    return new String(output, "UTF-8");
}

public static byte[] compress(byte[] data) throws IOException {
    byte[] output;
    Deflater compress = new Deflater();

    compress.reset();
    compress.setInput(data);
    compress.finish();
    ByteArrayOutputStream bos = new ByteArrayOutputStream(data.length);
    try {
        byte[] buf = new byte[1024];
        while (!compress.finished()) {
            int i = compress.deflate(buf);
            bos.write(buf, 0, i);
        }
        output = bos.toByteArray();
    } catch (Exception e) {
        output = data;
        e.printStackTrace();
    } finally {
        bos.close();
    }
    compress.end();
    return output;
}
```

一个简单的测试

```java
public static void main(String[] args) throws IOException {
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < 200; i++) {
        builder.append('a' + (new Random().nextInt() * 26));
    }
    String text = builder.toString();
    byte[] compres = compress(text.getBytes());
    System.out.println(compres.length + " : " + text.getBytes().length);

    String res = uncompress(compres);
    System.out.println("uncompress! \n" + text + "\n" + res);
}
```

输出结果

```sh
1011 : 1974
uncompress! 
1159641073884270587-148914555-876348695-140903655914152858511750740619-504526839109631208315104321891746743931-228808979-1303586499-19431155411964999751-1784318475-954798177-1812907183-831342707-3149322476028964551802022597-269963287-6384200011467670385844411707877038035412670417-1119826115558346219-959513147646693111435818855-32626587-18184494797054550038966016212145089137523302939171183465807867207-5294746515903446057333959811216956465-11772186456902770294071039871896527261-126190055310658640239029635411410052621945318513-1099749933-2044334159884087065-1705740759-1313321287-1408007761-12659778231544522691472523171153203782987609706919936632357801287155512488271333115291-1121944135941979389-179880545175884207196204559-2097788799145839653133892163716038492252042396151523357607329397509-2453452914618397691174247129-542507633-1893723573237001573-84175562119492726191070559557-875056377-1763237523-662399435-170798495-12405874171550890051-1938474621-701626601-1246867757-1138873077164155271023310391435811251050668025181338411-7641844471088518205-1570482881-1690731767-954924683-213656821149494003-544272515-9322840891981997411254437701-183054198720365002211448655569-54030518916444117051191350451-900732825-2072105047160877226512403288354302424851213478975-57604286986096457192173124564975571096304687-213425653510984804314132356831371957625714091709-327695077-182546427-372769058150182636433743131293942149315625331-1010625457741185365-81246881-565236593-1937214707-2090999425-1673181289-1110250756450022071917863643-127217577910228760391902441297-31318475-535669437-1151216791170962161121375401911260706331-1873591233-495048743-8876731551362670289-686442615-6752584831233249861-3467630691547253127-345092207-908370541-1788351797644350365-67770933-4703179231930520693138257968522450375-1171662023-5791753311816936409-1745781765-922801857281665531707439257928142703-367587763829971705455779401438501763-1398546079-606883161-924403277-1617582925-2005411841279115903
1159641073884270587-148914555-876348695-140903655914152858511750740619-504526839109631208315104321891746743931-228808979-1303586499-19431155411964999751-1784318475-954798177-1812907183-831342707-3149322476028964551802022597-269963287-6384200011467670385844411707877038035412670417-1119826115558346219-959513147646693111435818855-32626587-18184494797054550038966016212145089137523302939171183465807867207-5294746515903446057333959811216956465-11772186456902770294071039871896527261-126190055310658640239029635411410052621945318513-1099749933-2044334159884087065-1705740759-1313321287-1408007761-12659778231544522691472523171153203782987609706919936632357801287155512488271333115291-1121944135941979389-179880545175884207196204559-2097788799145839653133892163716038492252042396151523357607329397509-2453452914618397691174247129-542507633-1893723573237001573-84175562119492726191070559557-875056377-1763237523-662399435-170798495-12405874171550890051-1938474621-701626601-1246867757-1138873077164155271023310391435811251050668025181338411-7641844471088518205-1570482881-1690731767-954924683-213656821149494003-544272515-9322840891981997411254437701-183054198720365002211448655569-54030518916444117051191350451-900732825-2072105047160877226512403288354302424851213478975-57604286986096457192173124564975571096304687-213425653510984804314132356831371957625714091709-327695077-182546427-372769058150182636433743131293942149315625331-1010625457741185365-81246881-565236593-1937214707-2090999425-1673181289-1110250756450022071917863643-127217577910228760391902441297-31318475-535669437-1151216791170962161121375401911260706331-1873591233-495048743-8876731551362670289-686442615-6752584831233249861-3467630691547253127-345092207-908370541-1788351797644350365-67770933-4703179231930520693138257968522450375-1171662023-5791753311816936409-1745781765-922801857281665531707439257928142703-367587763829971705455779401438501763-1398546079-606883161-924403277-1617582925-2005411841279115903
```

### 1.2. 注意事项

上面这个运作的还挺好，但在接入使用时，总是提示`java.util.zip.DataFormatException: incorrect header check`, 因为接受的是第三方传递过来的压缩数据，比较坑爹的是对方就写了个Deflater压缩，然后什么都没有了，那么这个是啥原因呢？

其实看下Deflater的构造方法，发现还可以传一个boolean值(nowrap), 官方说明是

```java
/**
 * Creates a new compressor using the specified compression level.
 * If 'nowrap' is true then the ZLIB header and checksum fields will
 * not be used in order to support the compression format used in
 * both GZIP and PKZIP.
 * @param level the compression level (0-9)
 * @param nowrap if true then use GZIP compatible compression
 */
public Deflater(int level, boolean nowrap) {
    this.level = level;
    this.strategy = DEFAULT_STRATEGY;
    this.zsRef = new ZStreamRef(init(level, DEFAULT_STRATEGY, nowrap));
}
```

简单来说，就是压缩时，如果nowrap为true，那么解压时也要为true；否则对不上时，就会抛异常

接下来简单对比下两种不同传参的情况，首先更新下工具类

```java
public static String uncompress(byte[] input, boolean nowrap) throws IOException {
    Inflater inflater = new Inflater(nowrap);
    inflater.setInput(input);
    ByteArrayOutputStream baos = new ByteArrayOutputStream(input.length);
    try {
        byte[] buff = new byte[1024];
        while (!inflater.finished()) {
            int count = inflater.inflate(buff);
            baos.write(buff, 0, count);
        }
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        baos.close();
    }
    inflater.end();
    byte[] output = baos.toByteArray();
    return new String(output);
}

public static byte[] compress(byte[] data, boolean nowrap) throws IOException {
    byte[] output;
    Deflater compress = new Deflater(Deflater.DEFAULT_COMPRESSION, nowrap);

    compress.reset();
    compress.setInput(data);
    compress.finish();
    ByteArrayOutputStream bos = new ByteArrayOutputStream(data.length);
    try {
        byte[] buf = new byte[1024];
        while (!compress.finished()) {
            int i = compress.deflate(buf);
            bos.write(buf, 0, i);
        }
        output = bos.toByteArray();
    } catch (Exception e) {
        output = data;
        e.printStackTrace();
    } finally {
        bos.close();
    }
    compress.end();
    return output;
}
```

测试如下

```java
public static void main(String[] args) throws IOException {
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < 1000; i++) {
        builder.append('a' + (new Random().nextInt() * 26));
    }
    String text = builder.toString();
    byte[] compres = compress(text.getBytes(), true);
    System.out.println(compres.length + " : " + text.getBytes().length);
    String res = uncompress(compres, true);
    System.out.println(res.equals(text));


    byte[] compres2 = compress(text.getBytes(), false);
    System.out.println(compres2.length + " : " + text.getBytes().length);
    String res2 = uncompress(compres2, false);
    System.out.println(res2.equals(text));
}
```

输出结果如下，从大小来看，前者小那么一点点

```sh
5086 : 9985
true
5092 : 9985
true
```

## 2. 小结

一般来说，jdk自带的压缩与解压，除了方便之外，可能优势并不是那么的大，这里盗一张网上的对比表格

以下来自: [[java]序列化框架性能对比（kryo、hessian、java、protostuff）](https://www.cnblogs.com/lonelywolfmoutain/p/5563985.html)

|                    | 优点                      | 缺点                                             |
| ------------------ | ----------------------- | ---------------------------------------------- |
| kryo               | 速度快，序列化后体积小             | 跨语言支持较复杂                                       |
| hessian            | 默认支持跨语言                 | 较慢                                             |
| protostuff         | 速度快，基于protobuf          | 需静态编译                                          |
| Protostuff-Runtime | 无需静态编译，但序列化前需预先传入schema | 不支持无默认构造函数的类，反序列化时需用户自己初始化序列化后的对象，其只负责将该对象进行赋值 |
| jdk                | 使用方便，可序列化所有类            | 速度慢，占空间                                        |

其次，在使用java的压缩与解压时，需要注意下，nowrap这个参数，需要保持一致，否则会报错

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战31：深拷贝浅拷贝及对象拷贝的两种方式

## 1. Java之Clone

### 1.1 背景

对象拷贝，是一个非常基础的内容了，为什么会单独的把这个领出来讲解，主要是先前遇到了一个非常有意思的场景

有一个任务，需要解析类xml标记语言，然后生成document对象，之后将会有一系列针对document对象的操作

通过实际的测试，发现生成Document对象是比较耗时的一个操作，再加上这个任务场景中，需要解析的xml文档是固定的几个，那么一个可以优化的思路就是能不能缓存住创建后的Document对象，在实际使用的时候clone一份出来

<!-- more  -->

### 1.2 内容说明

看到了上面的应用背景，自然而言的就会想到深拷贝了，本篇博文则主要内容如下

- 介绍下两种拷贝方式的区别
- 深拷贝的辅助工具类
- 如何自定义实现对象拷贝

## 2. 深拷贝和浅拷贝

### 2.1 定义说明

**深拷贝**

相当于创建了一个新的对象，只是这个对象的所有内容，都和被拷贝的对象一模一样而已，即两者的修改是隔离的，相互之间没有影响

**浅拷贝**

也是创建了一个对象，但是这个对象的某些内容（比如A）依然是被拷贝对象的，即通过这两个对象中任意一个修改A，两个对象的A都会受到影响

看到上面两个简单的说明，那么问题来了

- 浅拷贝中，是所有的内容公用呢？还是某些内容公用？
- 从隔离来将，都不希望出现浅拷贝这种方式了，太容易出错了，那么两种拷贝方式的应用场景是怎样的？

### 2.2 浅拷贝

一般来说，浅拷贝方式需要实现`Cloneable`接口，下面结合一个实例，来看下浅拷贝中哪些是独立的，哪些是公用的

```java
@Data
public class ShallowClone implements Cloneable {

    private String name;

    private int age;

    private List<String> books;


    public ShallowClone clone() {
        ShallowClone clone = null;
        try {
            clone = (ShallowClone) super.clone();
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
        return clone;
    }


    public static void main(String[] args) {
        ShallowClone shallowClone = new ShallowClone();
        shallowClone.setName("SourceName");
        shallowClone.setAge(28);
        List<String> list = new ArrayList<>();
        list.add("java");
        list.add("c++");
        shallowClone.setBooks(list);


        ShallowClone cloneObj = shallowClone.clone();


        // 判断两个对象是否为同一个对象（即是否是新创建了一个实例）
        System.out.println(shallowClone == cloneObj);

        // 修改一个对象的内容是否会影响另一个对象
        shallowClone.setName("newName");
        shallowClone.setAge(20);
        shallowClone.getBooks().add("javascript");
        System.out.println("source: " + shallowClone.toString() + "\nclone:" + cloneObj.toString());

        shallowClone.setBooks(Arrays.asList("hello"));
        System.out.println("source: " + shallowClone.toString() + "\nclone:" + cloneObj.toString());
    }
}
```

输出结果:

```sh
false
source: ShallowClone(name=newName, age=20, books=[java, c++, javascript])
clone:ShallowClone(name=SourceName, age=28, books=[java, c++, javascript])
source: ShallowClone(name=newName, age=20, books=[hello])
clone:ShallowClone(name=SourceName, age=28, books=[java, c++, javascript])
```

结果分析：

- 拷贝后获取的是一个独立的对象，和原对象拥有不同的内存地址
- 基本元素类型，两者是隔离的（虽然上面只给出了int，String）
  - 基本元素类型包括:
  - int, Integer, long, Long, char, Charset, byte,Byte, boolean, Boolean, float,Float, double, Double, String
- 非基本数据类型（如基本容器，其他对象等），只是拷贝了一份引用出去了，实际指向的依然是同一份

其实，浅拷贝有个非常简单的理解方式：

**浅拷贝的整个过程就是，创建一个新的对象，然后新对象的每个值都是由原对象的值，通过 `=` 进行赋值**

这个怎么理解呢？

上面的流程拆解就是：

```
- Object clone = new Object();
- clone.a = source.a
- clone.b = source.b
- ...
```

那么=赋值有什么特点呢？

基本数据类型是值赋值；非基本的就是引用赋值

### 2.3 深拷贝

深拷贝，就是要创建一个全新的对象，新的对象内部所有的成员也都是全新的，只是初始化的值已经由被拷贝的对象确定了而已

那么上面的实例改成深拷贝应该是怎样的呢？

可以加上这么一个方法

```java
public ShallowClone deepClone() {
    ShallowClone clone = new ShallowClone();
    clone.name = this.name;
    clone.age = this.age;
    if (this.books != null) {
        clone.books = new ArrayList<>(this.books);
    }
    return clone;
}


// 简单改一下测试case
public static void main(String[] args) {
    ShallowClone shallowClone = new ShallowClone();
    shallowClone.setName("SourceName");
    shallowClone.setAge(new Integer(1280));
    List<String> list = new ArrayList<>();
    list.add("java");
    list.add("c++");
    shallowClone.setBooks(list);


    ShallowClone cloneObj = shallowClone.deepClone();


    // 判断两个对象是否为同一个对象（即是否是新创建了一个实例）
    System.out.println(shallowClone == cloneObj);

    // 修改一个对象的内容是否会影响另一个对象
    shallowClone.setName("newName");
    shallowClone.setAge(2000);
    shallowClone.getBooks().add("javascript");
    System.out.println("source: " + shallowClone.toString() + "\nclone:" + cloneObj.toString());


    shallowClone.setBooks(Arrays.asList("hello"));
    System.out.println("source: " + shallowClone.toString() + "\nclone:" + cloneObj.toString());
}
```

输出结果为：

```sh
false
source: ShallowClone(name=newName, age=2000, books=[java, c++, javascript])
clone:ShallowClone(name=SourceName, age=1280, books=[java, c++])
source: ShallowClone(name=newName, age=2000, books=[hello])
clone:ShallowClone(name=SourceName, age=1280, books=[java, c++])
```

结果分析：

- 深拷贝独立的对象
- 拷贝后对象的内容，与原对象的内容完全没关系，都是独立的

简单来说，深拷贝是需要自己来实现的，对于基本类型可以直接赋值，而对于对象、容器、数组来讲，需要创建一个新的出来，然后重新赋值

### 2.4 应用场景区分

深拷贝的用途我们很容易可以想见，某个复杂对象创建比较消耗资源的时候，就可以缓存一个蓝本，后续的操作都是针对深clone后的对象，这样就不会出现混乱的情况了

那么浅拷贝呢？感觉留着是一个坑，一个人修改了这个对象的值，结果发现对另一个人造成了影响，真不是坑爹么？

假设又这么一个通知对象长下面这样

```java
private String notifyUser;

// xxx

private List<String> notifyRules;
```

我们现在随机挑选了一千个人，同时发送通知消息，所以需要创建一千个上面的对象，这些对象中呢，除了notifyUser不同，其他的都一样

在发送之前，突然发现要临时新增一条通知信息，如果是浅拷贝的话，只用在任意一个通知对象的notifyRules中添加一调消息，那么这一千个对象的通知消息都会变成最新的了；而如果你是用深拷贝，那么苦逼的得遍历这一千个对象，每个都加一条消息了

---

## 3. 对象拷贝工具

上面说到，浅拷贝，需要实现Clonebale接口，深拷贝一般需要自己来实现，那么我现在拿到一个对象A，它自己没有提供深拷贝接口，我们除了主动一条一条的帮它实现之外，有什么辅助工具可用么？

对象拷贝区别与clone，它可以支持两个不同对象之间实现内容拷贝

**Apache的两个版本：（反射机制）**

```
org.apache.commons.beanutils.PropertyUtils.copyProperties(Object dest, Object orig)


org.apache.commons.beanutils.BeanUtils#cloneBean
```

**Spring版本：（反射机制）**

```
org.springframework.beans.BeanUtils.copyProperties(Object source, Object target, Class editable, String[] ignoreProperties)
```

**cglib版本：（使用动态代理，效率高）**

```
net.sf.cglib.beans.BeanCopier.copy(Object paramObject1, Object paramObject2, Converter paramConverter)
```

从上面的几个有名的工具类来看，提供了两种使用者姿势，一个是反射，一个是动态代理，下面分别来看两种思路

### 3.1 借助反射实现对象拷贝

通过反射的方式实现对象拷贝的思路还是比较清晰的，先通过反射获取对象的所有属性，然后修改可访问级别，然后赋值；再获取继承的父类的属性，同样利用反射进行赋值

上面的几个开源工具，内部实现封装得比较好，所以直接贴源码可能不太容易一眼就能看出反射方式的原理，所以简单的实现了一个, 仅提供思路

```java
public static void copy(Object source, Object dest) throws Exception {
    Class destClz = dest.getClass();

    // 获取目标的所有成员
    Field[] destFields = destClz.getDeclaredFields();
    Object value;
    for (Field field : destFields) { // 遍历所有的成员，并赋值
        // 获取value值
        value = getVal(field.getName(), source);

        field.setAccessible(true);
        field.set(dest, value);
    }
}


private static Object getVal(String name, Object obj) throws Exception {
    try {
        // 优先获取obj中同名的成员变量
        Field field = obj.getClass().getDeclaredField(name);
        field.setAccessible(true);
        return field.get(obj);
    } catch (NoSuchFieldException e) {
        // 表示没有同名的变量
    }

    // 获取对应的 getXxx() 或者 isXxx() 方法
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    String methodName = "get" + name;
    String methodName2 = "is" + name;
    Method[] methods = obj.getClass().getMethods();
    for (Method method : methods) {
        // 只获取无参的方法
        if (method.getParameterCount() > 0) {
            continue;
        }

        if (method.getName().equals(methodName)
                || method.getName().equals(methodName2)) {
            return method.invoke(obj);
        }
    }

    return null;
}
```

上面的实现步骤还是非常清晰的，首先是找同名的属性，然后利用反射获取对应的值

```java
Field field = obj.getClass().getDeclaredField(name);
field.setAccessible(true);
return field.get(obj);
```

如果找不到，则找getXXX, isXXX来获取

### 3.2 代理的方式实现对象拷贝

Cglib的BeanCopier就是通过代理的方式实现拷贝，性能优于反射的方式，特别是在大量的数据拷贝时，比较明显

代理，我们知道可以区分为静态代理和动态代理，简单来讲就是你要操作对象A，但是你不直接去操作A，而是找一个中转porxyA, 让它来帮你操作对象A

那么这种技术是如何使用在对象拷贝的呢？

我们知道，效率最高的对象拷贝方式就是Getter/Setter方法了，前面说的代理的含义指我们不直接操作，而是找个中间商来赚差价，那么方案就出来了

将原SourceA拷贝到目标DestB

- 创建一个代理 copyProxy
- 在代理中，依次调用 SourceA的get方法获取属性值，然后调用DestB的set方法进行赋值

实际上BeanCopier的思路大致如上，具体的方案当然就不太一样了, 简单看了一下实现逻辑，挺有意思的一块，先留个坑，后面单独开个博文补上

**说明**

从实现原理和通过简单的测试，发现BeanCopier是扫描原对象的getXXX方法，然后赋值给同名的 setXXX 方法，也就是说，如果这个对象中某个属性没有get/set方法，那么就无法赋值成功了

---

## 3. 小结

### 3.1 深拷贝和浅拷贝

**深拷贝**

> 相当于创建了一个新的对象，只是这个对象的所有内容，都和被拷贝的对象一模一样而已，即两者的修改是隔离的，相互之间没有影响

- 完全独立

**浅拷贝**

> 也是创建了一个对象，但是这个对象的某些内容（比如A）依然是被拷贝对象的，即通过这两个对象中任意一个修改A，两个对象的A都会受到影响

- 等同与新创建一个对象，然后使用=，将原对象的属性赋值给新对象的属性
- 需要实现Cloneable接口

### 3.2 对象拷贝的两种方法

**通过反射方式实现对象拷贝**

主要原理就是通过反射获取所有的属性，然后反射更改属性的内容

**通过代理实现对象拷贝**

将原SourceA拷贝到目标DestB

创建一个代理 copyProxy
在代理中，依次调用 SourceA的get方法获取属性值，然后调用DestB的set方法进行赋值

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战32：Java可以如何实现文件变动的监听

应用中使用logback作为日志输出组件的话，大部分会去配置 `logback.xml` 这个文件，而且生产环境下，直接去修改logback.xml文件中的日志级别，不用重启应用就可以生效

那么，这个功能是怎么实现的呢？

<!-- more -->

## 1. 问题描述及分析

针对上面的这个问题，首先抛出一个实际的case，在我的个人网站 * [神奇工具箱 - 小工具集合](https://tool.hhui.top/) 中，所有的小工具都是通过配置文件来动态新增和隐藏的，因为只有一台服务器，所以配置文件就简化的直接放在了服务器的某个目录下

现在的问题时，我需要在这个文件的内容发生变动时，应用可以感知这种变动，并重新加载文件内容，更新应用内部缓存

一个最容易想到的方法，就是轮询，判断文件是否发生修改，如果修改了，则重新加载，并刷新内存，所以主要需要关心的问题如下：

- 如何轮询？
- 如何判断文件是否修改？
- 配置异常，会不会导致服务不可用？（即容错，这个与本次主题关联不大，但又比较重要...）

## 2. 设计与实现

问题抽象出来之后，对应的解决方案就比较清晰了

- 如何轮询 ？ --》 定时器 Timer, ScheduledExecutorService 都可以实现
- 如何判断文件修改？ --》根据 `java.io.File#lastModified` 获取文件的上次修改时间，比对即可

那么一个很简单的实现就比较容易了:

```java
public class FileUpTest {

    private long lastTime;

    @Test
    public void testFileUpdate() {
        File file = new File("/tmp/alarmConfig");

        // 首先文件的最近一次修改时间戳
        lastTime = file.lastModified();

        // 定时任务，每秒来判断一下文件是否发生变动，即判断lastModified是否改变
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
        scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                if (file.lastModified() > lastTime) {
                    System.out.println("file update! time : " + file.lastModified());
                    lastTime = file.lastModified();
                }
            }
        },0, 1, TimeUnit.SECONDS);


        try {
            Thread.sleep(1000 * 60);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

上面这个属于一个非常简单，非常基础的实现了，基本上也可以满足我们的需求，那么这个实现有什么问题呢？

**定时任务的执行中，如果出现了异常会怎样？**

对上面的代码稍作修改

```java
public class FileUpTest {

    private long lastTime;

    private void ttt() {
        throw new NullPointerException();
    }

    @Test
    public void testFileUpdate() {
        File file = new File("/tmp/alarmConfig");

        lastTime = file.lastModified();

        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
        scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                if (file.lastModified() > lastTime) {
                    System.out.println("file update! time : " + file.lastModified());
                    lastTime = file.lastModified();
                    ttt();
                }
            }
        }, 0, 1, TimeUnit.SECONDS);


        try {
            Thread.sleep(1000 * 60 * 10);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

实际测试，发现只有首次修改的时候，触发了上面的代码，但是再次修改则没有效果了，即当抛出异常之后，定时任务将不再继续执行了，这个问题的主要原因是因为 `ScheduledExecutorService` 的原因了

直接查看ScheduledExecutorService的源码注释说明

> If any execution of the task encounters an exception, subsequent executions are suppressed.Otherwise, the task will only terminate via cancellation or termination of the executor.
> 即如果定时任务执行过程中遇到发生异常，则后面的任务将不再执行。

**所以，使用这种姿势的时候，得确保自己的任务不会抛出异常，否则后面就没法玩了**

对应的解决方法也比较简单，整个catch一下就好

## 3. 进阶版

前面是一个基础的实现版本了，当然在java圈，基本上很多常见的需求，都是可以找到对应的开源工具来使用的，当然这个也不例外，而且应该还是大家比较属性的apache系列

### 3.1 apache版

首先maven依赖

```xml
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.6</version>
</dependency>
```

主要是借助这个工具中的 `FileAlterationObserver`, `FileAlterationListener`, `FileAlterationMonitor` 三个类来实现相关的需求场景了，当然使用也算是很简单了，以至于都不太清楚可以再怎么去说明了，直接看下面从我的一个开源项目quick-alarm中拷贝出来的代码

```java
public class PropertiesConfListenerHelper {

    public static boolean registerConfChangeListener(File file, Function<File, Map<String, AlarmConfig>> func) {
        try {
            // 轮询间隔 5 秒
            long interval = TimeUnit.SECONDS.toMillis(5);


            // 因为监听是以目录为单位进行的，所以这里直接获取文件的根目录
            File dir = file.getParentFile();

            // 创建一个文件观察器用于过滤
            FileAlterationObserver observer = new FileAlterationObserver(dir,
                    FileFilterUtils.and(FileFilterUtils.fileFileFilter(),
                            FileFilterUtils.nameFileFilter(file.getName())));

            //设置文件变化监听器
            observer.addListener(new MyFileListener(func));
            FileAlterationMonitor monitor = new FileAlterationMonitor(interval, observer);
            monitor.start();

            return true;
        } catch (Exception e) {
            log.error("register properties change listener error! e:{}", e);
            return false;
        }
    }


    static final class MyFileListener extends FileAlterationListenerAdaptor {

        private Function<File, Map<String, AlarmConfig>> func;

        public MyFileListener(Function<File, Map<String, AlarmConfig>> func) {
            this.func = func;
        }

        @Override
        public void onFileChange(File file) {
            Map<String, AlarmConfig> ans = func.apply(file); // 如果加载失败，打印一条日志
            log.warn("PropertiesConfig changed! reload ans: {}", ans);
        }
    }
}
```

针对上面的实现，简单说明几点：

- 这个文件监听，是以目录为根源，然后可以设置过滤器，来实现对应文件变动的监听
- 如上面`registerConfChangeListener`方法，传入的file是具体的配置文件，因此构建参数的时候，捞出了目录，捞出了文件名作为过滤
- 第二参数是jdk8语法，其中为具体的读取配置文件内容，并映射为对应的实体对象

一个问题，如果 func方法执行时，也抛出了异常，会怎样？

实际测试表现结果和上面一样，抛出异常之后，依然跪，所以依然得注意，不要跑异常

那么简单来看一下上面的实现逻辑，直接扣出核心模块

```java
public void run() {
    while(true) {
        if(this.running) {
            Iterator var1 = this.observers.iterator();

            while(var1.hasNext()) {
                FileAlterationObserver observer = (FileAlterationObserver)var1.next();
                observer.checkAndNotify();
            }

            if(this.running) {
                try {
                    Thread.sleep(this.interval);
                } catch (InterruptedException var3) {
                    ;
                }
                continue;
            }
        }

        return;
    }
}
```

从上面基本上一目了然，整个的实现逻辑了，和我们的第一种定时任务的方法不太一样，这儿直接使用线程，死循环，内部采用sleep的方式来来暂停，因此出现异常时，相当于直接抛出去了，这个线程就跪了

### 3.2 JDK版本

jdk1.7，提供了一个`WatchService`，也可以用来实现文件变动的监听，之前也没有接触过，看到说明，然后搜了一下使用相关，发现也挺简单的，同样给出一个简单的示例demo

```java
@Test
public void testFileUpWather() throws IOException {
    // 说明，这里的监听也必须是目录
    Path path = Paths.get("/tmp");
    WatchService watcher = FileSystems.getDefault().newWatchService();
    path.register(watcher, ENTRY_MODIFY);

    new Thread(() -> {
        try {
            while (true) {
                WatchKey key = watcher.take();
                for (WatchEvent<?> event : key.pollEvents()) {
                    if (event.kind() == OVERFLOW) {
                        //事件可能lost or discarded 
                        continue;
                    }
                    Path fileName = (Path) event.context();
                    System.out.println("文件更新: " + fileName);
                }
                if (!key.reset()) { // 重设WatchKey
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }).start();


    try {
        Thread.sleep(1000 * 60 * 10);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

## 4. 小结

使用Java来实现配置文件变动的监听，主要涉及到的就是两个点

- 如何轮询：  定时器（Timer, ScheduledExecutorService）, 线程死循环+sleep
- 文件修改： File#lastModified

整体来说，这个实现还是比较简单的，无论是自定义实现，还是依赖 commos-io来做，都没太大的技术成本，但是需要注意的一点是：

- 千万不要在定时任务 or 文件变动的回调方法中抛出异常！！！

为了避免上面这个情况，一个可以做的实现是借助EventBus的异步消息通知来实现，当文件变动之后，发送一个消息即可，然后在具体的重新加载文件内容的方法上，添加一个 `@Subscribe`注解即可，这样既实现了解耦，也避免了异常导致的服务异常 （如果对这个实现有兴趣的可以评论说明）

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战33：实用的Map初始化工具类

虽说java作为编译语言，但是它本身也提供了很多运行时能力，今天介绍一个非常基础的知识点，可变参数传递

<!-- more -->

在日常的开发过程中，创建Map对象还是比较常见的，现在我希望写一个工具类，可以非常简单创建并初始化Map对象

因此我们可以实现一个MapUtil工具类，来支持这个场景

```java
 public static <K, V> Map<K, V> newMap(K k, V v, Object... kv) {
        Map<K, V> ans = new HashMap<>();
        ans.put(k, v);
        for (int i = 0; i < kv.length; i += 2) {
            ans.put((K) kv[i], (V) kv[1]);
        }
        return ans;
}
```

注意一下上面的实现，kv这个参数就是我们要说的可变参数，在方法内部，kv可以看成是一个数组对象（而且是安全的对象，当不传递时，它的取值也不是null）

在使用可变参数时，下面是一些需要注意的点

**可变参数注意与数组参数的冲突**

注意下面的两个方法，不能同时出现，直接出现编译错误

```java
public static <K, V> Map<K, V> newMap(K k, V v, Object... kv)
public static <K, V> Map<K, V> newMap(K k, V v, Object[] kv)
```

**重载的选择**

如果只有一个可变参数的方法，`newMap("key", "value")`不会报错，会直接访问下面这个方法，kv参数为空数组

```java
public static <K, V> Map<K, V> newMap(K k, V v, Object... kv)
```

当出现重载时，即如下

```java
public static <K, V> Map<K, V> newMap(K k, V v, Object... kv)
public static <K, V> Map<K, V> newMap(K k, V v)
```

上面两个方法的调用，如果传参只有两个时，会调用哪个？

- `newMap("key", "value")` 调用的下面的方法
- `newMap("key", "value", "k", "v") 调用的上面的方法

**可变参数传数组会怎样**

虽说我们在使用的时候，将可变参数当做数组来使用，但是传递时，若传数组，是否可行呢？

```java
public static <K, V> Map<K, V> newMap(K k, V v, Object... kv) {
    Map<K, V> ans = new HashMap<>();
    ans.put(k, v);
    for (int i = 0; i < kv.length; i += 2) {
        ans.put((K) kv[i], (V) kv[1]);
    }
    return ans;
}

@Test
public void tt() {
    Map map = newMap("key", "value", new Object[]{"1", "2"});
    System.out.println(map);
}
```

实际输出如下

```
{1=2, key=value}
```

从实际测试来看，传数组并没有问题

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战34：通用的根据路径获取文件资源的工具类

通常我们最多的场景是从本地资源中读取文件，这个时候我们经常需要注意的是相对路径、绝对路径问题；

除了从本地获取文件之外，从网络中获取文件资源（如图片）也属于相对常见的场景，接下来我们封装一个工具类，可以支持以上各种类型的数据读取

<!-- more -->

## 1. 工具实现类

首先定义一个公共方法如下，内部支持四种方式的数据获取

- 相对路径
- 绝对路径
- 用户根目录
- 网络

```java
public static InputStream getStreamByFileName(String fileName) throws IOException {
    if (fileName == null) {
        throw new IllegalArgumentException("fileName should not be null!");
    }

    if (fileName.startsWith("http")) {
        // 网络地址
        return new URL(fileName).openConnection().getInputStream();
    } else if (BasicFileUtil.isAbsFile(fileName)) {
        // 绝对路径
        Path path = Paths.get(fileName);
        return Files.newInputStream(path);
    } else if (fileName.startsWith("~")) {
        // 用户目录下的绝对路径文件
        fileName = BasicFileUtil.parseHomeDir2AbsDir(fileName);
        return Files.newInputStream(Paths.get(fileName));
    } else { // 相对路径
        return FileReadUtil.class.getClassLoader().getResourceAsStream(fileName);
    }
}
```

请注意上面的实现，绝对路径与相对路径比较好理解，用户目录，这个处理又是怎样的呢？

关键点在于，用户目录转绝对路径

- 借助`System.getProperties`系统属性来处理

```java
/**
 * 将用户目录下地址~/xxx 转换为绝对地址
 *
 * @param path
 * @return
 */
public static String parseHomeDir2AbsDir(String path) {
    String homeDir = System.getProperties().getProperty("user.home");
    return StringUtils.replace(path, "~", homeDir);
}
```

接下来再看如何判断一个路径是否为绝对路径呢？

这里需要格外注意不同操作系统的差异性，比如win，区分C盘，D盘，但是mac/linux则不分这个，上面判断的核心逻辑如下

```java
public static boolean isAbsFile(String fileName) {
    if (OSUtil.isWinOS()) {
        // windows 操作系统时，绝对地址形如  c:\descktop
        return fileName.contains(":") || fileName.startsWith("\\");
    } else {
        // mac or linux
        return fileName.startsWith("/");
    }
}

/**
 * 是否windows系统
 */
public static boolean isWinOS() {
    boolean isWinOS = false;
    try {
        String osName = System.getProperty("os.name").toLowerCase();
        String sharpOsName = osName.replaceAll("windows", "{windows}").replaceAll("^win([^a-z])", "{windows}$1")
                .replaceAll("([^a-z])win([^a-z])", "$1{windows}$2");
        isWinOS = sharpOsName.contains("{windows}");
    } catch (Exception e) {
        e.printStackTrace();
    }
    return isWinOS;
}
```

除了上面的三种本地资源获取之外，还有一个就是网络资源的读取，上面介绍的实现姿势主要是基于JDK原生的URL，在实际使用时，这个并不稳定，不能确定能获取到完整的数据，原则上不推荐使用；如果可以，使用http-client/okhttp都是不错的选择

最后给一个简单的测试

最后一个简单下载图片的case

```java
String img = "https://c-ssl.duitang.com/uploads/item/201809/16/20180916175034_Gr2hk.thumb.1000_0.jpeg";
BufferedImage pic = ImageIO.read(FileReadUtil.getStreamByFileName(img));
System.out.println(pic);
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0542b4ae409b4336a431fac44c1cef5f~tplv-k3u1fbpfcp-watermark.image?)

---

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战35：调用本地程序的几种姿势

作为一个后端同学，经常被安全的小伙伴盯上，找一找安全漏洞；除了常说的注入之外，还有比较吓人的执行远程命令，唤醒本地应用程序等；然后有意思的问题就来了，写了这么多年的代码，好像还真没有尝试过用java来唤醒本地应用程序的

比如说一个最简单的，打开本地的计算器，应该怎么搞？

接下来本文将介绍一下如何使用java打开本地应用，以及打开mac系统中特殊一点的处理方式（直白来说就是不同操作系统，使用姿势不一样）

<!-- more -->

## 1. Runtime使用方式

主要是基于`Runtime.getRuntime().exec()`来执行shell命令，来打开应用

- 传参就是需要打开的应用名

比如上面说到的打开计算器

```java
// win系统
Runtime.getRuntime().exec("exec");
// mac系统
Runtime.getRuntime().exec("open -n /Applications/Calculator.app")
```

从上面的传参也可以看出两者的区别，为什么mac会整一个 `open -n`， 这个其实可以理解为在终端执行命令，打开计算器

**注意事项**

对于mac系统而言，除了上面这种打开方式之外，还有下面这种姿势

```java
Runtime.getRuntime().exec("/Applications/Calculator.app/Contents/MacOS/Calculator")
```

在exec中指定计算器的路径，有个很容易采的坑，直接写成下面这种

```java
Runtime.getRuntime().exec("/Applications/Calculator.app")
```

上面这个直接执行之后会提示`权限错误`，其主要原因是mac系统的应用和win中的exe作为启动方式不太一样，对于mac而言，可以理解`xxx.app`为一个目录，真正执行文件是内部的`xxx/Contents/MacOS/xxx`

## 2. ProcessBuilder使用方式

除了Runtime唤起之外，使用ProcessBuilder也属于非常常见的case

```java
// win
new ProcessBuilder("exec").start()

// mac 注意，使用下面这个，则传参不能是 open -n xxx
new ProcessBuilder("/Applications/Calculator.app/Contents/MacOS/Calculator").start()
```

使用上面这种姿势，特别需要注意的是内部传参不能是`open -n`

## 3. 小结

从上面介绍的方式来看，其实打开应用程序的思路主要就是利用java来执行脚本命令；内容比较简单，隐患却是比较大的；在自己的项目中，最好不要出现这种调用方式

微信搜 **楼仔** 或扫描下方二维码关注楼仔的原创公众号，回复 **110** 即可免费领取 10 本面试必刷八股文。
![](https://files.mdnice.com/user/13837/4b47ac79-8256-47cf-ac1a-036729635246.png)

---

# 实战36：技术派开源项目

大家好，足足搞了半年，我们的第一个项目——技术派，终于上线啦！

之前就有很多粉丝催，久等了各位！心急的小伙伴，可以到文末直接看网站域名。

在此之前，我先来介绍（吹一吹）网站。

## 网站内容有什么？

技术派致力于打造一个完整的社区平台，采用现阶段最流行的技术实现。

网站的内容丰富，又不失整洁，整体以橘色为主色调，颜值很高。

![](https://files.mdnice.com/user/13837/180e1ba7-7074-43b7-9250-ac6bc158b1a9.png)

什么，卡片的颜色不喜欢？我们还有其它的，**这些色系是根据图片自动识别**，满满的黑科技。

![](https://files.mdnice.com/user/13837/0d4b3010-58a1-4279-9268-574981ca81e9.png)

再看看文章详情页，整个阅读体验非常不错。

![](https://files.mdnice.com/user/13837/9d52c137-5b44-4ffe-a6a8-98df2d40f739.png)

除了文章，我们还有配套的教程，目前的教程，都是楼仔的原创系列文章，让你刷得飞起，嘎嘎。。。

![](https://files.mdnice.com/user/13837/4492a683-f131-4320-b8fe-e3d5e78a567e.png)

下面是个人中心，还是我喜欢的配色，如果你也喜欢写文，欢迎入驻哈，没事一起侃侃大山。

![](https://files.mdnice.com/user/13837/5b9617c7-b728-4824-9331-b538933b7e3a.png)

那如何登录呢？当然是微信扫码呗，来来，一起扫一扫，公众号内输入验证码，即可登录成功，是不是很方便？

![](https://files.mdnice.com/user/13837/8d8b4592-0e64-49e7-8caf-a8386f60cb08.png)

告诉你一个秘密，**登录后，还会有惊喜哦**，一般人我不告诉他，嘿嘿。。。

除了前端，我们也有自己的运营后台，文末有登录方式。

![](https://files.mdnice.com/user/13837/fbacda81-41a9-4f88-8eac-d3826828df47.png)

## 技术派能给你提供什么帮助呢？

可能有粉丝会问 “市面上的技术网站已经很多，你们为啥还要做一个呢？”

其实我们做这个网站的目的，**主要是为了教大家如何从 0 到 1 去构建一个商业化的社区平台**，特别是对于那些缺乏项目经验，或者需要深入学习 Java 的同学。

下面我就给大家讲讲，技术派用到哪些牛逼的框架的技术。

技术派包括前台社区系统和后台管理系统，基于 SpringBoot + MyBatis Plus 实现，采用 Docker 容器化部署。

**前台社区系统**包括首页门户、文章浏览、文章编辑、文章搜索、系列教程、登录鉴权、用户评论、点赞收藏、个人中心、消息通知、广告运营、粉丝管理等模块。

**后台管理系统**包括数据统计、运营配置、分类管理、标签管理、文章管理、教程配置、教程文章、权限管理等模块。

是不是讲的太泛？给你来一张系统架构图，所有的模块和技术，都能一目了然。

![](https://files.mdnice.com/user/13837/6cfb2a84-78cd-45b6-80b3-15ab422997c4.png)

再来一张业务架构图，让你对前后台模块更清晰。

![](https://files.mdnice.com/user/13837/7720af6c-2ae4-47ea-aad4-593d74347d81.png)

有同学会说，楼哥，我想要更详细的模块介绍，好好学学，好嘞，下面就给安排上。

![](https://files.mdnice.com/user/13837/ac8f2050-5d19-447e-be3b-19776c11e32a.png)

这个是我们的开发进度，核心功能都已完成，后面也会持续迭代。

![](https://files.mdnice.com/user/13837/86ee6878-33cf-4bc8-a746-a8648ac5256c.png)

最后就是大家最关心的地方，我们的项目源码能下载么，那必须的，我们的项目完全开源！

对，你没有听错，文末有 GitHub 地址，大家可以自行下载。

同时，我们后续也会出配套的项目教程，无论你是小白，还是有一定工作经验的同学，这套教程都会帮你进阶，让你大厂 Offer 拿到手软。

这套教程直接对标大厂，下面是教程目录。

![](https://files.mdnice.com/user/13837/f84b0111-4cf3-41e1-a8bd-ada028071b04.png)

由于出教程比较花时间，所以前期的教程，会在楼仔的公众号中连载，请大家持续关注哈。

最后告诉大家一个秘密，后面我们也会开通**技术派的知识星球**，更好去帮助大家学习这个项目，有没有亿点小期待呢？

## 网站地址

好了，楼仔不啰嗦了，大家自己去体验下网站吧。

* **前台地址**：<https://paicoding.com>

* **后台地址**：<https://paicoding.com/admin-view>

前台可以直接访问，后台需要扫描/长按下方的二维码关注「楼仔」的公众号后，**回复 “001” 即可获取登录账号和密码。**

![](https://files.mdnice.com/user/13837/e670d6d3-b4d8-4c17-80c0-fa2dd68000e4.png)

大家在体验的过程中，如果发现任何问题，都可以直接在 Github 上提交 PR，我们会定期 fix。

* 前台社区系统 GitHub：<https://github.com/itwanger/paicoding>

* 后台管理系统 GitHub：<https://github.com/itwanger/paicoding-admin>

欢迎大家奔走相告，将技术派网站分享给你们的朋友，他们一定很感激你告诉他这么牛逼的学习资源。

> 我从清晨走过，也拥抱夜晚的星辰，人生没有捷径，你我皆平凡，你好，陌生人，一起共勉。

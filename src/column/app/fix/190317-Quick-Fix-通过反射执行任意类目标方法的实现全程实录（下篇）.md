---
order: 6
title: 6. 通过反射执行任意类目标方法的实现全程实录（下篇）
tag:
  - 反射
category:
  - Quick系列
  - QuickFix
  - 方案设计
date: 2019-03-17 16:13:20
keywords: Java,反射,Quick系列,QuickFix
---


前面两篇反射，分别介绍了如何封装参数和定位方法，对于最终的反射调用，还缺少的是目标类的确定和方法执行；本篇博文将目标集中在这最后一块

链上上两篇文章地址

- [190311-Quick-Fix 通过反射执行任意类目标方法的实现全程实录（上篇）](https://blog.hhui.top/hexblog/2019/03/11/190311-Quick-Fix-%E9%80%9A%E8%BF%87%E5%8F%8D%E5%B0%84%E6%89%A7%E8%A1%8C%E4%BB%BB%E6%84%8F%E7%B1%BB%E7%9B%AE%E6%A0%87%E6%96%B9%E6%B3%95%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%85%A8%E7%A8%8B%E5%AE%9E%E5%BD%95%EF%BC%88%E4%B8%8A%E7%AF%87%EF%BC%89/)
- [190315-Quick-Fix 通过反射执行任意类目标方法的实现全程实录（中篇）](https://blog.hhui.top/hexblog/2019/03/15/190315-Quick-Fix-%E9%80%9A%E8%BF%87%E5%8F%8D%E5%B0%84%E6%89%A7%E8%A1%8C%E4%BB%BB%E6%84%8F%E7%B1%BB%E7%9B%AE%E6%A0%87%E6%96%B9%E6%B3%95%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%85%A8%E7%A8%8B%E5%AE%9E%E5%BD%95%EF%BC%88%E4%B8%AD%E7%AF%87%EF%BC%89/)

<!-- more -->

## I. 目标对象确定

对于找到我们的目标对象，这个就与我们最终的应用的运行方式有关系了。如果是一个Spring应用，我们知道所有的bean都会放在`ApplicationContext`上下文中，可以通过beanName或者Class来找到目标对象；如果我们的应用就是一个单纯的jar包，没有引入第三方容器管理，这个要获取目标类就与具体的实现有关系了

下面我们将进行分别说到

### 1. 目标对象分类

分类是个啥意思，为什么要分类了？

- 这个主要是从我们的目标出发，我们最终的目的是通过反射调用我们的目标方法，那么方法的调用执行，通常分为两种，一个是静态类的调用；一个是实例的调用

这两个的区别在哪里？

- 最终的反射执行`java.lang.reflect.Method#invoke(object, args)`
  - 静态类调用方式，传入null
  - 实例调用方式，传入实例对象s

从上面的区别可以看出，对于静态类方式，找到方法和参数就行了，不需要再额外的去找对应的实例了

### 2. 目标对象类型判断

同样我们可以通过反射的方式判断方法是否属于静态方法

```java
// true 表示属于静态方法
Modifier.isStatic(method.getModifiers())
```

在QuickFix（<=1.1）的实现中，并没有采用这种方式，而是直接选择了通过外部传参的方式来确定目标对象是否为静态类；原因在于实现简单，所以这里有个优化点，完全可以直接自动化判断


### 3. 获取目标对象

前面说到了，不同的运行环境，获取目标对象的方式不一样，所以让我们直接覆盖所有的场景时不太现实的。一个可选的方案就是预留接口，让接入方自己来选择，如何根据传入的参数，来选择对应的目标对象，所以我们定义了一个接口

```java
@LoaderOrder
public interface ServerLoader {
    /**
     * 返回优先级
     *
     * @return
     */
    default int order() {
        try {
            return this.getClass().getAnnotation(LoaderOrder.class).order();
        } catch (Exception e) {
            return 10;
        }
    }

    /**
     * ServerLoader是否支持获取目标对象
     *
     * @param reqDTO
     * @return
     */
    boolean enable(FixReqDTO reqDTO);

    /**
     * 根据传入参数，获取目标对象和目标对象的class
     *
     * @param reqDTO
     * @return
     */
    ImmutablePair<Object, Class> getInvokeObject(FixReqDTO reqDTO);
}
```

上面接口中，三个方法，先看第二个，因为我们前面进行了分类，所以我们必然会有一个`StaticServerLoader`，专门用来加载静态目标对象，而这个loader对于普通对象获取就无法满足了

第二个需要注意的就是`order()`方法，用来指定ServerLoader的优先级，特别是当我们的系统中存在多个ServerLoader可以返回我们想要的结构时，这个时候设置优先级就是一个较好的方案了


看到源码的同学会发现，我们的实现类并不是直接实现`ServerLoader`接口，而是继承自模板类`ServerLoaderTemplate`，抽象了公共的业务逻辑

```java
public abstract class ServerLoaderTemplate implements ServerLoader {

    @Override
    public ImmutablePair<Object, Class> getInvokeObject(FixReqDTO reqDTO) {
        ImmutablePair<Object, Class> serverPair = loadServicePair(reqDTO.getService());

        if (StringUtils.isEmpty(reqDTO.getField())) {
            return serverPair;
        }

        return loadFieldPair(reqDTO, serverPair);
    }

    /**
     * 返回目标对象
     *
     * @param service
     * @return
     */
    public abstract ImmutablePair<Object, Class> loadServicePair(String service);

    public ImmutablePair<Object, Class> loadFieldPair(FixReqDTO reqDTO, ImmutablePair<Object, Class> serverPair) {
        try {
            return ReflectUtil.getField(serverPair.getLeft(), serverPair.getRight(), reqDTO.getField());
        } catch (Exception e) {
            throw new ServerNotFoundException("get server#filed error!", e);
        }
    }
}
```

从模板类的中，可以发现一个有意思的地方，我们传入的Service可能并不是最终要执行的目标对象

怎么理解呢？举一个简单的例子

```java
public class A {
  private B b;
}

public class B {
  public void print() {}
}
```

我们现在希望执行的是A对象中成员b的print方法，所以这种case下我们的目标对象是b，因此上面的实现中，添加了方法 `loadFieldPair`


接下来给出两个具体获取目标对象的实现，一个是静态类的，一个是Spring容器的


`StaticServerLoader`实现相对简单，直接使用`ClassLoader.load()`

```java
public class StaticServerLoader extends ServerLoaderTemplate {
    private static final String STATIC_TYPE = "static";

    @Override
    public boolean enable(FixReqDTO reqDTO) {
        return STATIC_TYPE.equalsIgnoreCase(reqDTO.getType());
    }

    @Override
    public ImmutablePair<Object, Class> loadServicePair(String service) {
        try {
            Class clz = this.getClass().getClassLoader().loadClass(service);
            return ImmutablePair.of(null, clz);
        } catch (Exception e) {
            throw new ServerNotFoundException("parse " + service + " to bean error: " + e.getMessage());
        }
    }
}
```

`spring`的获取方式，则主要是借助`SprintContext`

```java
public class BeanServerLoader extends ServerLoaderTemplate {
    private static final String BEAN_TYPE = "bean";

    private static ApplicationContext applicationContext;

    public BeanServerLoader(ApplicationContext applicationContext) {
        BeanServerLoader.applicationContext = applicationContext;
    }

    @Override
    public boolean enable(FixReqDTO reqDTO) {
        return StringUtils.isEmpty(reqDTO.getType()) || BEAN_TYPE.equalsIgnoreCase(reqDTO.getType().trim());
    }

    private boolean beanName(String server) {
        return !server.contains(".");
    }

    @Override
    public ImmutablePair<Object, Class> loadServicePair(String server) {
        Object invokeBean = null;
        if (beanName(server)) {
            // 表示传入的是beanName，通过beanName来查找对应的bean
            invokeBean = applicationContext.getBean(server.trim());
        } else {
            // 表示传入的是完整的服务名，希望通过class来查找对应的bean
            try {
                Class clz = this.getClass().getClassLoader().loadClass(server.trim());
                if (clz != null) {
                    invokeBean = applicationContext.getBean(clz);
                }
            } catch (Exception e) {
                throw new ServerNotFoundException("Failed to load Server: " + server);
            }
        }

        if (invokeBean == null) {
            throw new ServerNotFoundException("Server not found: " + server);
        }

        return ImmutablePair.of(invokeBean, invokeBean.getClass());
    }

    public static BeanServerLoader getLoader() {
        return applicationContext.getBean(BeanServerLoader.class);
    }
}
```

关于ServerLoader的更多设计理念，会放在QuickFix的后续博文中进行说明

### 4. 执行目标方法

当我们获取到了目标对象，目标方法，传参之后，调用就简单了

```java
public static String execute(Object bean, Class clz, String method, Object[] args) {
    if (StringUtils.isEmpty(method)) {
        // 获取类的成员属性值时，不传method，直接返回属性值
        return JSON.toJSONString(bean);
    }

    Method chooseMethod = getMethod(clz, method, args);

    if (chooseMethod == null) {
        throw new ServerNotFoundException("can't find server's method: " + clz.getName() + "#" + method);
    }

    try {
        chooseMethod.setAccessible(true);
        Object result = chooseMethod.invoke(bean, args);
        return JSON.toJSONString(result);
    } catch (Exception e) {
        throw new ServerInvokedException(
                "unexpected server invoked " + clz.getName() + "#" + method + " args: " + JSON.toJSONString(args),
                e);
    }
}
```

### 5. other

至此，QuickFix项目中关于反射的相关技能点已经说完了，可以说QuickFix项目，整个都是依托于反射来玩耍的，如果希望了解下java反射相关知识点和使用姿势的话，这个项目也是一个很好的选择（简单、轻量）

QuickFix项目中另外一个我个人认为有意思的点在于支持扩展的设计理念，如何让这个简单的框架适用于各种不同的应用中，也是一个很有意思的挑战，后续博文将带来这方面的介绍



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


---
order: 2
title: 2.自定义bean注册扩展机制BeanDefinitionRegistryPostProcessor
tag:
  - 扩展点
  - Spring Extention
category:
  - Spring源码
  - 扩展点
date: 2022-10-26 14:45:41
keywords:
  - SpringBoot
  - 扩展点
  - BeanDefinitionRegistryPostProcessor
---

接着上一篇容器刷新前的扩展点，我们继续往下走；接下来来到的就是bean的定义扩展处，它是在Spring容器刷新之后，应用的bean定义加载完成、实例化之前提供的切入点，主要是通过实现`BeanDefinitionRegistryPostProcessor`接口的两个方法，来实现自定义的bean定义，或者对已注册的bean进行修改or代理替换

本文将带来的知识点如下：

- BeanDefinitionRegistryPostProcessor： 基本使用姿势
- `postProcessBeanDefinitionRegistry` 方法 优先于  `postProcessBeanFactory` 方法执行
- 实现自定义的bean注册，实现对容器的bean定义进行修改

<!-- more -->

## I. 项目准备

本文创建的实例工程采用`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `idea`进行开发

具体的SpringBoot项目工程创建就不赘述了，核心的pom文件，无需额外的依赖； 配置文件 `application.yml`， 也没有什么特殊的配置

**说明**

- 源码工程参考文末的源码
- 虽然本文是基于 `2.2.1.RELEASE` 版本进行实测；实际上这些基础的扩展点，在更高的版本中表现也不会有太大的变动，基本上可以无修改复现

## II. 自定义bean注册


有关注过博主一灰灰的朋友，应该在我之前的文章中可以翻到bean的动态注册的内容，其中其实也介绍到通过`BeanDefinitionRegistryPostProcessor`来实现bean的动态注册，有兴趣的小伙伴可以翻一下，链接如下

> * [【基础系列】Bean之动态注册 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2018/10/13/181013-SpringBoot%E5%9F%BA%E7%A1%80%E7%AF%87Bean%E4%B9%8B%E5%8A%A8%E6%80%81%E6%B3%A8%E5%86%8C/)

接下来我们开始进入正题

### 1. 自定义bean注册

现在我们定义一个普通的bean对象，也定义了几个常见的bean初始化之后的回调方法，顺带验证两个知识点

- 自定义注册的bean是否表现和普通的bean一致
- 初始化后的方法执行的顺序

```java
public class DemoBean implements InitializingBean {
    private int initCode;

    public DemoBean() {
        initCode = new Random().nextInt(100);
        System.out.println("demo bean create! -> " + initCode);
    }

    @PostConstruct
    public void init() {
        System.out.println("PostConstruct" + initCode);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("afterPropertiesSet" + initCode);
    }

    public int getInitCode() {
        return initCode;
    }
}
```


再定义一个bean，构造方法依赖其他的bean

```java
public class DemoBeanWrapper extends DemoBean {
    private DemoBean demoBean;

    public DemoBeanWrapper(DemoBean demoBean) {
        super();
        this.demoBean = demoBean;
    }
}
```

接下来我们再看一下这两个bean如何进行注册

```java
@Configuration
public class AutoBeanDefinitionRegistryPostProcessor implements BeanDefinitionRegistryPostProcessor {
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanDefinitionRegistry) throws BeansException {
        System.out.println("========> postProcessBeanDefinitionRegistry --->");
        // 这个接口主要是在读取项目中的 beanDefinition 之后执行，简单来说就是项目本身的bean定义读取完毕之后，如果我们还想补充一些自定义的bean注册信息，则可以用它
        // 注意两个核心点： Spring上下文的注册Bean定义的逻辑都跑完后，但是所有的Bean都还没真正实例化之前

        // 构建bean的定义
        BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(DemoBean.class, () -> {
            // 这个方法可以定义这个bean的实例创建方式，如构造函数之后还想调用其他的方法，也可以在这里做
            DemoBean demoBean = new DemoBean();
            return demoBean;
        });
        BeanDefinition beanDefinition = beanDefinitionBuilder.getRawBeanDefinition();
        //注册bean定义
        beanDefinitionRegistry.registerBeanDefinition("demoBean", beanDefinition);
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        System.out.println("========> postProcessBeanFactory --->");
        // 这个方法调用时再上面的方法执行之后，如加载自定义的bean注册依赖有其他的bean对象时，可以执行这个方法

        BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition(DemoBeanWrapper.class, () -> {
            DemoBeanWrapper autoFacDIBean = new DemoBeanWrapper(configurableListableBeanFactory.getBean("demoBean", DemoBean.class));
            return autoFacDIBean;
        });

        BeanDefinition beanDefinition = builder.getRawBeanDefinition();
        ((DefaultListableBeanFactory) configurableListableBeanFactory).registerBeanDefinition("demoBeanWrapper", beanDefinition);
    }
}
```

bean的注册从上面的代码来看比较简单，先看DemoBean的注册

**方法： `postProcessBeanDefinitionRegistry`**

在这个方法中进行简单的bean注册，除了上面这个稍显复杂的注册方式之外，也可以使用更简单的策略，如下，省略掉`BeanDefinitionBuilder.genericBeanDefinition`第二个参数

```java
BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(DemoBean.class);
BeanDefinition beanDefinition = beanDefinitionBuilder.getRawBeanDefinition();
//注册bean定义
beanDefinitionRegistry.registerBeanDefinition("demoBean", beanDefinition);
```

这个方法内的bean注册，更适用于简单的bean对象注册，如当其构造方法依赖其他的bean时，放在这个方法中好像没辙，此时则放在第二个方法中就更合适了

**方法： `postProcessBeanFactory`**

这个方法的参数是BeanFactory，可以通过它获取其他的bean对象，因此适用于DemoBeanWrapper的注册了，当然除了上面的使用姿势之外，也可以如下

```java
@Override
public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
    BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition(DemoBeanWrapper.class);
    //  用下面这种方式指定构造方法的传参也可以
    builder.addConstructorArgValue(configurableListableBeanFactory.getBean("demoBean", DemoBean.class));
    BeanDefinition beanDefinition = builder.getRawBeanDefinition();
    ((DefaultListableBeanFactory) configurableListableBeanFactory).registerBeanDefinition("demoBeanWrapper", beanDefinition);
}
```

### 2.bean注册知识点

单独看上面的代码可能对知识点理解不够直观清晰，那么我们就进行知识点归纳一下

**bean注册方式**

如何生成Bean的定义 `BeanDefinition` ? 

```java
// 1. bean定义构造器
BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(bean.class, () -> { 
  // bean实例化 实现方式, 若bean存在无参构造方法，则可以省略这个参数
});

// 2. bean定义获取
BeanDefinition beanDefinition = beanDefinitionBuilder.getRawBeanDefinition();
// 拿到上面的bean定义之后，可以设置构造方法参数，作用域等

// 3. 注册
beanDefinitionRegistry.registerBeanDefinition(beanName, beanDefinition);
```


**两个方法的选择**

 - `postProcessBeanDefinitionRegistry` 方法执行先于 `postProcessBeanFactory`
 - `postProcessBeanDefinitionRegistry` 在bean实例化之前触发，可用于注册简单的自定义bean对象
 - `postProcessBeanFactory`: 若bean的定义中需要依赖其他的bean对象，则放在这个方法内实现，通过BeanFactory参数获取其他bean


### 3. bean定义扩展

文章开头介绍了除了自定义bean之外，还可以做一些其他的操作，如针对现有的bean定义进行修改，下面给一个基础的demo，针对一个已有的bean，设置它的init方法

新增一个普通的bean对象

```java
@Component
public class NormalBean implements InitializingBean {
    @Autowired
    private DemoBean demoBean;
    @Autowired
    private DemoBeanWrapper demoBeanWrapper;

    @PostConstruct
    public void show() {
        System.out.println("NormalBean: postConstruct");
        System.out.println(demoBean.getInitCode());
        System.out.println(demoBeanWrapper.getInitCode());
    }


    public void init() {
        System.out.println("NormalBean: method init");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("NormalBean: afterPropertiesSet");
    }
}
```

然后我们通过修改bean注册，来指定bean加载完之后，执行init方法，在前面的`AutoBeanDefinitionRegistryPostProcessor`中进行扩展

```java
 @Override
public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
    // ....

    // 针对已有的bean定义进行调整
    for (String beanName : configurableListableBeanFactory.getBeanDefinitionNames()) {
        BeanDefinition definition = configurableListableBeanFactory.getBeanDefinition(beanName);
        if (definition.getBeanClassName() == null) {
            continue;
        }

        if (definition.getBeanClassName().equalsIgnoreCase(NormalBean.class.getName())) {
            // 手动指定一下初始化方法
            definition.setInitMethodName("init");
        }
    }
}
```

然后我们将整个项目执行以下，看下会输出些啥

```bash
========> postProcessBeanDefinitionRegistry --->
========> postProcessBeanFactory --->
# 下面是DemoBean的相关输出
demo bean create! -> 58
afterPropertiesSet58
# 下面是DemoBeanWrapper的相关输出
demo bean create! -> 46
PostConstruct46
afterPropertiesSet46
# 下面是NormalBean的相关输出
NormalBean: postConstruct
58
46
NormalBean: afterPropertiesSet
NormalBean: method init
````

从上面的输出也可以看出，我们的几个自定义bean都被正常的加载、注入，依赖使用也没有什么问题；而且从日志输出还可以看出bean初始化后的触发方法，也有先后顺序

- `@PostConstruct` > `InitializingBean#afterPropertiesSet` >  `init-method` (这个可以理解为xml定义bean中的初始化方法, @Bean注解中的initMethod)


### 4. 小结

最后进入大家喜闻乐见的知识点汇总环节，本文中主要介绍的是bean定义加载之后、实例化之前的扩展点`BeanDefinitionRegistryPostProcessor`

#### 4.1 知识点一：核心方法说明

通过它，我们可以实现自定义的bean注册，也可以实现对现有的bean定义进行扩展修改；有两个方法

**postProcessBeanDefinitionRegistry**

- 执行顺序在下面的方法之前，通常是在bean实例化之前被触发
- 适用于通用的bean注册定义

**postProcessBeanFactory**

- 其参数为BeanFactory，因此可以通过它获取Spring容器中的其他bean对象


#### 4.2 知识点二：bean注册

**bean注册方式**

如何生成Bean的定义 `BeanDefinition` ? 

```java
// 1. bean定义构造器
BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(bean.class, () -> { 
  // bean实例化 实现方式, 若bean存在无参构造方法，则可以省略这个参数
});

// 2. bean定义获取
BeanDefinition beanDefinition = beanDefinitionBuilder.getRawBeanDefinition();
// 拿到上面的bean定义之后，可以设置构造方法参数，作用域等

// 3. 注册
beanDefinitionRegistry.registerBeanDefinition(beanName, beanDefinition);
```

#### 4.3 知识点三：使用场景

看完本文之后，勤于思考的小伙伴可能就会想，这个东西到底有啥用，有真实的应用场景么？

**自定义bean注册实例场景**

这个应用场景就非常的典型了，用过mybatis的小伙伴都知道，我们会定义一个Mapper接口，用于与对应的xml文件进行映射，那么这些mapper接口是怎么注册到Spring容器的呢？

- 核心实现 `org.mybatis.spring.mapper.MapperScannerConfigurer`
- 借助`BeanDefinitionRegistryPostProcessor`与`ClassPathBeanDefinitionScanner`来实现扫描相关的类，并注册bean


**bean定义修改实例场景**

对于已有的bean定义进行修改，同样也有一个应用场景，在SpringCloud中，有个`RefreshAutoConfiguration#RefreshScopeBeanDefinitionEnhancer`

它会捞出`HikariDataSource`数据源bean对象，添加`RefreshScope`的能力增强，支持配置文件的动态加载

从而实现数据源配置的热加载更新（不发版，直接改数据库连接池，是不是很方便？）

#### 4.4 知识点四：bean初始化后执行方法先后顺序

我们知道在bean创建之后执行某些方法有多种策略，那么不同的方式先后顺序是怎样的呢？

bean创建到销毁的先后执行顺序如下

- 构造方法
- @PostConstruct修饰的方法
- InitializingBean接口的实现方法
- xml/@Bean中定义的initMethod
- @PreDestroy bean销毁前的执行方法

#### 其他

本文为Spring扩展点系列中的第二篇，接下来的扩展知识点同样是bean定义之后，实例化之前的`BeanFactoryPostProcessor`，那么这两个究竟又有什么区别呢？ 应用场景又有什么区别呢？我是一灰灰，欢迎关注我的Spring专栏，咱们下文见

- [一灰灰的Spring专栏](https://hhui.top/spring-extention/)


## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-extention/101-bean-definition](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-extention/101-bean-definition)

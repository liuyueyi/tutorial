---
order: 1
title: 1.容器刷新前回调ApplicationContextInitializer
tag:
  - 扩展点
  - Spring Extention
category:
  - Spring源码
  - 扩展点
date: 2022-09-27 19:26:11
keywords:
  - SpringBoot
  - 扩展点
  - ApplicationContextInitializer
---


本文将作为Spring系列教程中源码版块的第一篇，整个源码系列将分为两部分进行介绍；单纯的源码解析，大概率是个吃力没人看的事情，因此我们将结合源码解析，一个是学习下别人的优秀设计，一个是站在源码的角度看一下我们除了日常的CURD之外，还可以干些啥

<!-- more -->

在Spring的启动过程中，一系列的操作步骤中，提供了很多的扩展点，供我们来增强；简单来说就是提供了很多的钩子，这样当我们在某个节点执行前后，想干点其他的事情时，可以很简单的支持；本文介绍的`ApplicationContextInitializer`，spring容器在刷新之前会回调这个接口，从而实现在spring容器未初始化前，干一些用户希望做的事情

## I. 项目准备

本文创建的实例工程采用`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `idea`进行开发

具体的SpringBoot项目工程创建就不赘述了，核心的pom文件，无需额外的依赖

配置文件 `application.yml`， 也没有什么特殊的配置

源码工程参考文末的源码

## II. 容器刷新前扩展点实例

### 1. 自定义ApplicationContextInitializer

当我们希望实现一个自定义的上下文初始化时，非常简单，实现上面这个接口就行了，如

```java
public class ApplicationContextInitializer01 implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        System.out.println("ApplicationContextInitializer01");
    }
}
```

### 2. 扩展点注册

上面自定义一个扩展点，如何使它生效呢？

官方提供了三种方式，如在启动时，直接进行注册: `springApplication.addInitializers(new ApplicationContextInitializer01());`

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication springApplication = new SpringApplication(Application.class);
        springApplication.addInitializers(new ApplicationContextInitializer01());
        try (ConfigurableApplicationContext context = springApplication.run(args)) {
        }
    }
}
```

当我们的扩展点是放在一个jar包中对外提供时，使用上面的启动注册方式显然是不可行的，此时更推荐的做法就是通过Spring的SPI机制进行注册

在资源目录下的`META-INF/spring.factories`文件中进行注册

```
org.springframework.context.ApplicationContextInitializer=com.git.hui.extention.context.ApplicationContextInitializer02
```

**说明**

- 上面SPI的机制非常推荐大家使用，在之前的文章中，`AutoConfiguration`的注册通常也是使用这种方式

除了上面的两种注册方式之外，另外还有一个配置文件的方式，在配置文件`application.properties` 或 `application.yml`中，如下配置

```yaml
context:
  initializer:
    classes: com.git.hui.extention.context.ApplicationContextInitializer03
```

**启动测试**

上面三种注册方式，我们实现三个自定义的扩展点，然后启动之后，看一下实际输出

![](/imgs/220927/00.jpg)

上面的输出，可以简单的得出一个结论，不同注册方式的优先级（为了更合理的验证下面的观点，推荐大家修改下上面三个自定义扩展点名，排除掉是因为扩展名导致的排序问题）

- 配置文件注册 > SPI注册 > 启动时注册

### 3. 执行顺序指定

对于自定义的扩展点实现，当存在顺序关系时，我们可以通过`@Order`注解来实现， 如当上面的三个扩展点都是通过启动方式注册时

```java
@Order(5)
public class ApplicationContextInitializer01 implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        System.out.println("ApplicationContextInitializer01");
    }
}

@Order(2)
public class ApplicationContextInitializer02 implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        System.out.println("ApplicationContextInitializer02");
    }
}

@Order(10)
public class ApplicationContextInitializer03 implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        System.out.println("ApplicationContextInitializer03");
    }
}

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication springApplication = new SpringApplication(Application.class);
        springApplication.addInitializers(new ApplicationContextInitializer01(), new ApplicationContextInitializer02(), new ApplicationContextInitializer03());
        try (ConfigurableApplicationContext context = springApplication.run(args)) {
        }
    }
}
```

输出实例如下

![](/imgs/220927/01.jpg)

**接着重点来了**

- 若上面的三个自定义实现，不是相同的注册方式，如将03采用配置文件方式进行注册，那么01, 02 依然是启动注册
- 则顺序是 03 > 02 > 01
- 即 `@Order`注解修饰的顺序，并不能打破  **配置文件 > SPI > 启动方式注册的顺序**

关于自定义实现类的执行顺序，规则如下

- 配置文件 > SPI > 启动方式
- 相同的注册方式，可以通过 `@Order` 注解进行修饰，值越小则优先级越高

### 4. 使用场景示例

最后我们再来看一下，这个扩展点到底有什么用，我们再什么场景下会用到这个呢？

一个经常可以看到的应用场景如通过它来指定需要激活的配置文件

```java
public class ApplicationContextInitializer03 implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        // 指定激活prod对应的配置文件
        configurableApplicationContext.getEnvironment().setActiveProfiles("prod");
    }
}
```

但是一般也很少见到有人这么干，因为直接使用配置参数就行了，那么有场景需要这么做么？

答案当然是有的，比如现在广为流行的docker容器部署，当我们希望每次都是打同一个镜像，然后在实际运行的时候，根据不同的环境来决定当前镜像到底启用哪些配置文件，这时就有用了

比如我们通过容器的环境参数 `app.env` 来获取当前运行的环境，如果是prod，则激活`application-prod.yml`; 如果是test，则激活`application-test.yml`

那么此时可以这么干

```java
public class EenvActiveApplicationContextInitializer implements ApplicationContextInitializer {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        String env = System.getenv("app.env");
        if ("prod".equalsIgnoreCase(env)) {
            configurableApplicationContext.getEnvironment().setActiveProfiles("prod");
        } else if ("test".equalsIgnoreCase(env)) {
            configurableApplicationContext.getEnvironment().setActiveProfiles("test");
        } else {
            throw new RuntimeException("非法的环境参数：" + env);
        }
    }
}
```

### 5. 小结

本文作为扩展点的第一篇，通过实现`ApplicationContextInitializer`接口，从而达到在spring容器刷新之前做某些事情的目的

通常自定义的ApplicationContextInitializer有三种注册方式，按照优先级如下

- 配置文件 > SPI方式 > 启动方式注册
- 相同的注册方式中，可以使用`@Order`注解来指定优先级，值越小优先级越高

最后还给出了一个可以应用得实例场景，即如何实现一个镜像在不同的环境中启动运行

下一个扩展点我们将介绍如何通过`BeanDefinitionRegistryPostProcessor`来实现非Spring生态的Bean加载使用

## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/)

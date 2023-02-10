---
order: 3
title: 3.过滤器Filter使用指南扩展篇
tag: 
  - Filter
category: 
  - SpringBoot
  - WEB系列
  - web三剑客
date: 2019-10-18 19:47:57
keywords: Filter Spring SpringBoot WebFilter FilterRegistrationBean Order Bean 优先级
---

前面一篇博文介绍了在SpringBoot中使用Filter的两种使用方式，这里介绍另外一种直接将Filter当做Spring的Bean来使用的方式，并且在这种使用方式下，Filter的优先级可以直接通过`@Order`注解来指定；最后将从源码的角度分析一下两种不同的使用方式下，为什么`@Order`注解一个生效，一个不生效

> 本篇博文强烈推荐与上一篇关联阅读，可以get到更多的知识点: [191016-SpringBoot系列教程web篇之过滤器Filter使用指南](https://mp.weixin.qq.com/s/f01KWO3d2zhoN0Qa9-Qb6w)

<!-- more -->

## I. Filter

本篇博文的工程执行的环境依然是`SpringBoot2+`, 项目源码可以在文章最后面get

### 1. 使用姿势

前面一篇博文，介绍了两种使用姿势，下面简单介绍一下

**WebFilter注解**

在Filter类上添加注解`@WebFilter`；然后再项目中，显示声明`@ServletComponentScan`，开启Servlet的组件扫描

```java
@WebFilter
public class SelfFilter implements Filter {
}

@ServletComponentScan
public class SelfAutoConf {
}
```

**FilterRegistrationBean**

另外一种方式则是直接创建一个Filter的注册Bean，内部持有Filter的实例；在SpringBoot中，初始化的是Filter的包装Bean就是这个

```java
@Bean
public FilterRegistrationBean<OrderFilter> orderFilter() {
    FilterRegistrationBean<OrderFilter> filter = new FilterRegistrationBean<>();
    filter.setName("orderFilter");
    filter.setFilter(new SelfFilter());
    filter.setOrder(-1);
    return filter;
}
```

本篇将介绍另外一种方式，直接将Filter当做普通的Bean对象来使用，也就是说，我们直接在Filter类上添加注解`@Component`即可，然后Spring会将实现Filter接口的Bean当做过滤器来注册

而且这种使用姿势下，Filter的优先级可以通过`@Order`注解来指定;

设计一个case，定义两个Filter(`ReqFilter`和`OrderFilter`), 当不指定优先级时，根据名字来，OrderFilter优先级会更高；我们主动设置下，希望`ReqFilter`优先级更高

```java
@Order(1)
@Component
public class ReqFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("req filter");
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {

    }
}

@Order(10)
@Component
public class OrderFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("order filter!");
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {

    }
}
```

### 2. 优先级测试

上面两个Filter直接当做了Bean来写入，我们写一个简单的rest服务来测试一下

```java
@RestController
public class IndexRest {
    @GetMapping(path = {"/", "index"})
    public String hello(String name) {
        return "hello " + name;
    }
}

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

}
```

请求之后输出结果如下， ReqFilter优先执行了

![](/imgs/191018/00.jpg)

## II. 源码分析

当我们直接将Filter当做Spring Bean来使用时，`@Order`注解来指定Filter的优先级没有问题；但是前面一篇博文中演示的`@WebFilter`注解的方式，则并不会生效

- 这两种方式的区别是什么？
- `@Order`注解到底有什么用，该怎么用

### 1. Bean方式

首先我们分析一下将Filter当做Spring bean的使用方式，我们的目标放在Filter的注册逻辑上

第一步将目标放在: `org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext#selfInitialize`

下面的逻辑中包括了ServeltContext的初始化，而我们的Filter则可以看成是属于Servlet的Bean

```java
private void selfInitialize(ServletContext servletContext) throws ServletException {
	prepareWebApplicationContext(servletContext);
	ConfigurableListableBeanFactory beanFactory = getBeanFactory();
	ExistingWebApplicationScopes existingScopes = new ExistingWebApplicationScopes(
			beanFactory);
	WebApplicationContextUtils.registerWebApplicationScopes(beanFactory,
			getServletContext());
	existingScopes.restore();
	WebApplicationContextUtils.registerEnvironmentBeans(beanFactory,
			getServletContext());
	for (ServletContextInitializer beans : getServletContextInitializerBeans()) {
		beans.onStartup(servletContext);
	}
}
```

注意上面代码中的for循环，在执行`getServletContextInitializerBeans()`的时候，Filter就已经注册完毕，所以我们需要再深入进去

将目标集中在`org.springframework.boot.web.servlet.ServletContextInitializerBeans#ServletContextInitializerBeans`

```java
public ServletContextInitializerBeans(ListableBeanFactory beanFactory) {
	this.initializers = new LinkedMultiValueMap<>();
	addServletContextInitializerBeans(beanFactory);
	addAdaptableBeans(beanFactory);
	List<ServletContextInitializer> sortedInitializers = this.initializers.values()
			.stream()
			.flatMap((value) -> value.stream()
					.sorted(AnnotationAwareOrderComparator.INSTANCE))
			.collect(Collectors.toList());
	this.sortedList = Collections.unmodifiableList(sortedInitializers);
}
```

上面有两行代码比较突出，下面单独捞出来了，需要我们重点关注

```java
addServletContextInitializerBeans(beanFactory);
addAdaptableBeans(beanFactory);
```

通过断点进来，发现第一个方法只是注册了`dispatcherServletRegistration`；接下来重点看第二个

```java
@SuppressWarnings("unchecked")
private void addAdaptableBeans(ListableBeanFactory beanFactory) {
	MultipartConfigElement multipartConfig = getMultipartConfig(beanFactory);
	addAsRegistrationBean(beanFactory, Servlet.class,
			new ServletRegistrationBeanAdapter(multipartConfig));
	addAsRegistrationBean(beanFactory, Filter.class,
			new FilterRegistrationBeanAdapter());
	for (Class<?> listenerType : ServletListenerRegistrationBean
			.getSupportedTypes()) {
		addAsRegistrationBean(beanFactory, EventListener.class,
				(Class<EventListener>) listenerType,
				new ServletListenerRegistrationBeanAdapter());
	}
}
```

从上面调用的方法命名就可以看出，我们的Filter注册就在`addAsRegistrationBean(beanFactory, Filter.class, new FilterRegistrationBeanAdapter());`

![](/imgs/191018/01.jpg)

上面的截图就比较核心了，在创建`FilterRegistrationBean`的时候，根据Filter的顺序来指定最终的优先级

然后再回到构造方法中，根据order进行排序, 最终确定Filter的优先级

![](/imgs/191018/02.jpg)

### 2. WebFilter方式

接下来我们看一下WebFilter方式为什么不生效，在根据我的项目源码进行测试的时候，请将需要修改一下自定义的Filter，将类上的`@WebFilter`注解打开，`@Component`注解删除，并且打开Application类上的`ServletComponentScan`

我们这里debug的路径和上面的差别不大，重点关注下面`ServletContextInitializerBeans`的构造方法上面

当我们深入`addServletContextInitializerBeans(beanFactory);`这一行进去debug的时候，会发现我们自定义的Filter是在这里面完成初始化的；而前面的使用方式，则是在`addAdapterBeans()`方法中初始化的，如下图

![](/imgs/191018/03.jpg)

在`getOrderedBeansOfType(beanFactory, ServletContextInitializer.class)`的调用中就返回了我们自定义的Bean，也就是说我们自定义的Filter被认为是`ServletContextInitializer`的类型了

然后我们换个目标，看一下ReqFilter在注册的时候是怎样的

关键代码: `org.springframework.beans.factory.support.DefaultListableBeanFactory#registerBeanDefinition`

（因为bean很多，所以我们可以加上条件断点）

![](/imgs/191018/04.jpg)

> 通过断点调试，可以知道我们的自定义Filter是通过`WebFilterHandler`类扫描注册的, 对这一块管兴趣的可以深入看一下`org.springframework.boot.web.servlet.ServletComponentRegisteringPostProcessor#scanPackage`

上面只是声明了Bean的注册信息，但是还没有具体的实例化，接下来我们回到前面的进程，看一下Filter的实例过程

```java
private <T> List<Entry<String, T>> getOrderedBeansOfType(
			ListableBeanFactory beanFactory, Class<T> type, Set<?> excludes) {
		Comparator<Entry<String, T>> comparator = (o1,
				o2) -> AnnotationAwareOrderComparator.INSTANCE.compare(o1.getValue(),
						o2.getValue());
		String[] names = beanFactory.getBeanNamesForType(type, true, false);
		Map<String, T> map = new LinkedHashMap<>();
		for (String name : names) {
			if (!excludes.contains(name) && !ScopedProxyUtils.isScopedTarget(name)) {
				T bean = beanFactory.getBean(name, type);
				if (!excludes.contains(bean)) {
					map.put(name, bean);
				}
			}
		}
		List<Entry<String, T>> beans = new ArrayList<>();
		beans.addAll(map.entrySet());
		beans.sort(comparator);
		return beans;
	}
```

注意我们的Filter实例在`T bean = beanFactory.getBean(name, type);` 

通过这种方式获取的Filter实例，并不会将ReqFilter类上的Order注解的值，来更新`FilterRegistrationBean`的order属性，所以这个注解不会生效

最后我们再看一下，通过WebFilter的方式，容器类不会存在`ReqFilter.class`类型的Bean, 这个与前面的方式不同

![](/imgs/191018/05.jpg)

## III. 小结

本文主要介绍了另外一种Filter的使用姿势，将Filter当做普通的Spring Bean对象进行注册，这种场景下，可以直接使用`@Order`注解来指定Filter的优先级

但是，这种方式下，我们的Filter的很多基本属性不太好设置，一个方案是参考SpringBoot提供的一些Fitler的写法，在Filter内部来实现相关逻辑


### 0. 项目

#### web系列博文

- [191016-SpringBoot系列教程web篇之过滤器Filter使用指南](https://mp.weixin.qq.com/s/f01KWO3d2zhoN0Qa9-Qb6w)
- [191012-SpringBoot系列教程web篇之自定义异常处理HandlerExceptionResolver](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484348&idx=1&sn=e9b36572c721418b097396b50319d140&chksm=fce71810cb9091063e810327e44f7ed07256188aecd352fa43f37e63e63dc64292b1a48b00cf&token=823367253&lang=zh_CN#rd)
- [191010-SpringBoot系列教程web篇之全局异常处理](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484344&idx=1&sn=d4b1422a709d9540583e33443aab6fff&chksm=fce71814cb9091025a960312c878ff9fc4f44fd0035aa597f55f37c90dcbac25a3e96ee2c528&token=118864495&lang=zh_CN#rd)
- [190930-SpringBoot系列教程web篇之404、500异常页面配置](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484336&idx=1&sn=d70f15e77bbd219af8015f9037a167fb&chksm=fce7181ccb90910aee427a3f3ed7660e8303c7460859c82622a651ce1cc3d7a97f62f80ed4e0&token=2447275&lang=zh_CN#rd)
- [190929-SpringBoot系列教程web篇之重定向](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484322&idx=1&sn=b18090f35b59097f78858b6609506b74&chksm=fce7180ecb909118d939f3ddf741a11c0977b1213d7afa12c970590590d40441c3a085c43c52&token=2447275&lang=zh_CN#rd)
- [190913-SpringBoot系列教程web篇之返回文本、网页、图片的操作姿势](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484310&idx=1&sn=f6259cf1b79db095ff2e9534993d27cf&chksm=fce7183acb90912cd150f086e90ecab3eceb3464e9352853e2e722288d412dbb3eb20c6e6ae7&scene=21#wechat_redirect)
- [190905-SpringBoot系列教程web篇之中文乱码问题解决](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484309&idx=1&sn=33d782f7529268eef6607a1ab8d41018&chksm=fce71839cb90912f6020aa9463bc0136cb57969ebe27eba865d97e212c28211435791aa874ea&scene=21#wechat_redirect)
- [190831-SpringBoot系列教程web篇之如何自定义参数解析器](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484291&idx=1&sn=3f7e8c92ca4d7270cc5c40cafea39683&chksm=fce7182fcb90913922654a4f2f04e7029b8944d71c31741334a3235aecbe1e60babcb0c0be74&scene=21#wechat_redirect)
- [190828-SpringBoot系列教程web篇之Post请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484287&idx=1&sn=44461f564d6b04cbf1a5902dcb4f23c6&chksm=fce718d3cb9091c5d730e63ae954c0831d53f3dd5af5d19d9c78b6009102838efaf56f7838ff&scene=21#wechat_redirect)
- [190824-SpringBoot系列教程web篇之Get请求参数解析姿势汇总](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484282&idx=1&sn=a8d236d935ae24cfbe6977e24a479caa&chksm=fce718d6cb9091c0dd8a6b113236f9ae9388fb026c9403c97bdf7505f773bd7330a43e3b269c&scene=21#wechat_redirect)
- [190822-SpringBoot系列教程web篇之Beetl环境搭建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=3&sn=9e8a6121dce291c65bd2b3d4fab24178&chksm=fce718c0cb9091d6674fb809d68ca3dc3b1695162368481abf8dc094000412116d2f9971c54b&scene=21#wechat_redirect)
- [190820-SpringBoot系列教程web篇之Thymeleaf环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=2&sn=f800c001061eabe74e2cad915af1921a&chksm=fce718c0cb9091d682b600673a0584955783f0d339248e34323efbea9b698560c432018717ef&scene=21#wechat_redirect)
- [190816-SpringBoot系列教程web篇之Freemaker环境搭建](http://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484268&idx=1&sn=acd691729488d81a94c938151d5737ce&chksm=fce718c0cb9091d63ef5f12893bb835c256a18318e791a0d193d00ef767ecfd019491d02e83d&scene=21#wechat_redirect)
- [190421-SpringBoot高级篇WEB之websocket的使用说明](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484217&idx=1&sn=9fdf45d2261cdcf2ccaccaebfb5ef598&chksm=fce71895cb90918361f1afd55a2b5fc9d65508913c1d793710afa79cae38bd9d57e32ad2c187&token=2447275&lang=zh_CN#rd)
- [190327-Spring-RestTemplate之urlencode参数解析异常全程分析](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484197&idx=1&sn=0184953527f58058ee8c2bbcfc2689ec&chksm=fce71889cb90919f9be003bf2487343f7952d6b33ab5ee5fb7251ae37a631d4c32e6d8a57528&token=2447275&lang=zh_CN#rd)
- [190317-Spring MVC之基于java config无xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484193&idx=1&sn=d8a284fe0a2b8e1fefe07d892558f563&chksm=fce7188dcb90919b1f8a2408bf955e37e88b043e2dbd59b5290ac1501e3d2d303512bac6af2c&token=2447275&lang=zh_CN#rd)
- [190316-Spring MVC之基于xml配置的web应用构建](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484186&idx=1&sn=18db571b670815965ae9185830c4e88f&chksm=fce718b6cb9091a054e0ac4be051341d8ce38ff8e40c5911302e3d6981206c14b80770590044&token=2447275&lang=zh_CN#rd)
- [190213-SpringBoot文件上传异常之提示The temporary upload location xxx is not valid](https://mp.weixin.qq.com/s?__biz=MzU3MTAzNTMzMQ==&mid=2247484139&idx=1&sn=b4a5f3ca6215641c6bcf5123f2bfb501&chksm=fce71947cb9090511042ae97a12cc975d2b199521e17980e685cccb5e0be91a8e932cef4eb76&token=2447275&lang=zh_CN#rd)

#### 项目源码

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/201-web](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/201-web)


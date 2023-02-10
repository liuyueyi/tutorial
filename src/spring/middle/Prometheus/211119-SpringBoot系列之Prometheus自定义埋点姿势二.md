---
order: 3
title: 3.自定义埋点姿势二
tag: 
  - Prometheus
category: 
  - SpringBoot
  - 中间件
  - Prometheus
date: 2021-11-19 19:30:15
keywords: 
  - Prometheus
  - SpringBoot
---

关于Prometheus的自定义埋点，前一篇博文已经介绍了，为啥这里又来一次？

看过前文的小伙伴可能会知道，之前采用的`simpleclient`包定义的几个metric来实现的，实际上有更简单方便的姿势，那就是直接借助`MeterRegistry`来创建Metric来实现数据采集即可

相比较于前文的实现，总的来说简易程度可见一般，上篇文章可以点击下文查看

* [【中间件】Prometheus自定义埋点上报 | 一灰灰Blog](https://spring.hhui.top/spring-blog/2021/11/09/211109-SpringBoot%E4%B9%8BPrometheus%E8%87%AA%E5%AE%9A%E4%B9%89%E5%9F%8B%E7%82%B9%E4%B8%8A%E6%8A%A5/)

<!-- more -->

## I. 自定义上报

依然是搭建一个基础项目工程，本文演示的项目主要为SpringBoot2.2.1版本，更高的版本使用姿势没有太大的区别，至于1.x版本的不确保可行（因为我并没有测试）

### 1.依赖

pom依赖，主要是下面几个包

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
</dependencies>
```


### 2. 配置信息

其次是配置文件，注册下Prometheus的相关信息

```yaml
spring:
  application:
    name: prometheus-example
management:
  endpoints:
    web:
      exposure:
        include: "*"
  metrics:
    tags:
      application: ${spring.application.name}
```

上面配置中，有两个关键信息，前面博文也有介绍，这里简单说明

- `management.endpoints.web.exposure.include` 这里指定所有的web接口都会上报
- `metrics.tags.application` 这个应用所有上报的metrics 都会带上application这个标签

配置完毕之后，会提供一个 `/actuator/prometheus`的端点，供prometheus来拉取Metrics信息

### 3. 自定义拦截器实现采集上报

实现一个基础的拦截器，用来拦截所有的http请求，然后收集请求信息上报

```java
public class MetricInterceptor extends HandlerInterceptorAdapter {
    @Autowired
    private MeterRegistry meterRegistry;
    private ThreadLocal<Timer.Sample> threadLocal = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 总计数 + 1
        meterRegistry.counter("micro_req_total", Tags.of("url", request.getRequestURI(), "method", request.getMethod())).increment();
        // 处理中计数 +1
        meterRegistry.gauge("micro_process_req", Tags.of("url", request.getRequestURI(), "method", request.getMethod()), 1);

        Timer.Sample sample = Timer.start();
        threadLocal.set(sample);
        return super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        try {
            super.postHandle(request, response, handler, modelAndView);
        } finally {
            meterRegistry.gauge("micro_process_req", Tags.of("url", request.getRequestURI(), "method", request.getMethod()), -1);
            //  Timer timer = meterRegistry.timer("micro_req_histogram", Tags.of("url", request.getRequestURI(), "method", request.getMethod(), "code", String.valueOf(response.getStatus())));
            Timer timer = Timer.builder("micro_req_histogram").minimumExpectedValue(Duration.ofMillis(1)).maximumExpectedValue(Duration.ofMinutes(3))
                    .sla(Duration.ofMillis(10), Duration.ofMillis(50), Duration.ofMillis(100), Duration.ofMillis(300), Duration.ofMillis(1000))
                    .tags(Tags.of("url", request.getRequestURI(), "method", request.getMethod(), "code", String.valueOf(response.getStatus())))
                    .register(meterRegistry);
            threadLocal.get().stop(timer);
            threadLocal.remove();
        }
    }
}
```

注意上面的三种Metric的创建方式
- Counter: 直接使用 `meterRegistry.counter()`来创建metric并实现计数+1
  - 传参中，Tags组成的就是propmetheus中定义的label，kv格式，第一个参数用来定义MetricName
- Gauge: 使用姿势与上面基本相同，不过需要注意计数的加减是直接在传参中
- Histogram: 它的使用姿势就需要特别注意下了，在preHander中定义的是 `Timer.Sampler`对象，在 `postHandler`中实现的数据采集

上面短短一点代码，就实现了一个简单的自定义信息上报；接下来就是注册拦截器了

### 4. 注册并测试

拦截器依赖了Spring的bean对象，因此需要将它定义为bean对象

```java
@RestController
@SpringBootApplication
public class Application implements WebMvcConfigurer {
    private Random random = new Random();

    @Bean
    public MetricInterceptor metricInterceptor() {
        return new MetricInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(metricInterceptor()).addPathPatterns("/**");
    }

    @GetMapping(path = "hello")
    public String hello(String name) {
        int sleep = random.nextInt(200);
        try {
            Thread.sleep(sleep);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "hello sleep: " + sleep + " for " + name;
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

基于此一个简单的自定义采集上报就完成了；项目启动之后，通过访问采集端点查看是否有数据上报

![](/imgs/211119/00.jpg)

最后小结一下，虽然SpringBoot可以非常方便的接入prometheus来采集一些常见的指标，但是当我们有自定义上报指标的需求时，直接使用`MeterRegistry`来收集信息，创建Metric是个不错的选择，通常我们选择的三种类型作用如下

- 总的请求数：采用`Counter`
- 当前正在处理的请求数：采用`Gauge`
- 请求耗时直方图: `Histogram`


## II. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/421-prometheus-micro](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/421-prometheus-micro)

### 1. 微信公众号: 一灰灰Blog

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

下面一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛

- 一灰灰Blog个人博客 [https://blog.hhui.top](https://blog.hhui.top)
- 一灰灰Blog-Spring专题博客 [http://spring.hhui.top](http://spring.hhui.top)


![一灰灰blog](https://spring.hhui.top/spring-blog/imgs/info/info.png)


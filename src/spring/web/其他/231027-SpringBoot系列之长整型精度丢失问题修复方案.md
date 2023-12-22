---
order: 7
title: 7.别再为JS长整型精度丢失烦恼了！这些方法帮你轻松搞定！
tag:
  - Thymeleaf
category:
  - SpringBoot
  - WEB系列
  - Response
date: 2023-10-27 13:50:27
keywords:
  - Thymeleaf
  - 精度问题
---


javascript以64位双精度浮点数存储所有Number类型值，即计算机最多存储64位二进制数。 但是需要注意的是Number包含了我们常说的整形、浮点型，相比较于整形而言，会有一位存储小数点的偏移位，由于存储二进制时小数点的偏移量最大为52位，计算机存储的为二进制，而能存储的二进制为62位，超出就会有舍入操作，因此 JS 中能精准表示的最大整数是 Math.pow(2, 53)，十进制即`9007199254740992` 大于`9007199254740992`的可能会丢失精度

因此对于java后端返回的一个大整数，如基于前面说到的雪花算法生成的id，前端js接收处理时，就可能出现精度问题

接下来我们以Thymeleaf模板渲染引擎，来介绍一下对于大整数的精度丢失问题的几种解决方案

<!-- more -->


## I. 测试项目搭建

### 1. 依赖

首先搭建一个标准的SpringBoot项目工程，相关版本以及依赖如下

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA`进行开发

添加web支持，用于配置刷新演示

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
</dependencies>
```

### 2. 配置

接下来配置一下db的相关配置 `application.yml`

```yaml
server:
  port: 8080

spring:
  thymeleaf:
    mode: HTML
    encoding: UTF-8
    servlet:
      content-type: text/html
    cache: false
```

## II. 长整型适配

首先我们借助Thymeleaf创建一个简单的页面，用于返回演示长整型的使用

### 1. 场景复现

模板网页如下

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="SpringBoot thymeleaf"/>
    <meta name="author" content="YiHui"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>YiHui's SpringBoot Demo</title>
</head>
<body>

<div>
    <div class="title">hello world!</div>
    <br/>
    <div class="content" th:text="'HuTool = ' + ${hu}">hu id</div>
    <br/>
    <div class="sign" th:text="'自定义 = ' + ${se}">self id</div>
    <br/>
    <strong>直接输出，模拟精度丢失</strong>
    <br/>
    <hr/>
    <div>
        huTool:
        <div th:text="${hu}">hu id</div>
    </div>
    <br/>
    <div>
        自定义:
        <div th:text="${se}">self id</div>
    </div>
</div>
<script th:inline="javascript">
    let hu = [[${hu == null ? vo.hu : hu}]];
    let se = [[${se == null ? vo.se : se}]];
    console.log("hu = ", hu);
    console.log("se = ", se);
    var vo = [[${vo}]]
    console.log("vo = ", vo);
</script>
</body>
</html>
```

我们直接借助前面实现的Snowflake来生成长整数，写一个对应的接口

```java
@Controller
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

    @Autowired
    private HuToolSnowFlakeProducer huToolSnowFlakeProducer;
    @Autowired
    private SelfSnowflakeProducer selfSnowflakeProducer;

    @ResponseBody
    @GetMapping(path = "id2")
    public IdVo id2() {
        Long hu = huToolSnowFlakeProducer.nextId();
        Long se = selfSnowflakeProducer.nextId();
        return new IdVo(hu, se);
    }

    @GetMapping("show")
    public String idShow(Model model) {
        Map<String, Long> map = new HashMap<>();
        map.put("hu", huToolSnowFlakeProducer.nextId());
        map.put("se", selfSnowflakeProducer.nextId());
        model.addAllAttributes(map);
        System.out.println("show: " + map);
        return "show";
    }

    @Data
    public static class IdVo {
        private Long hu;
        private Long se;
        private String h;
        private String s;

        public IdVo(Long hu, Long se) {
            this.hu = hu;
            this.se = se;
            this.h = String.valueOf(hu);
            this.s = String.valueOf(se);
        }
    }
}
```

直接访问，表现如下

![](/imgs/231027/00.jpg)


从截图可以看出，再html标签中，直接使用`${hu}`获取长整型时，显示正常；

但是js中，获取的长整型，则出现了精度丢失问题

如控制台中打印的 `console.log("hu = ", hu);` 最后的几位变成了0，与实际不符

### 2. long转String，解决长整型问题

对于长整型导致的精度问题，最容易想到也是最推荐的解决方案，即对于long类型的参数，改为String方式进行返回，让前端以String的方式进行处理，从而解决精度丢失问题

方案1：修改后端的返回，将长整形改String

如将上面的流程如下修改:

```java
@GetMapping("show")
public String idShow(Model model) {
    Map<String, Long> map = new HashMap<>();
    map.put("hu", String.valueOf(huToolSnowFlakeProducer.nextId()));
    map.put("se", selfSnowflakeProducer.nextId() + "");
    model.addAllAttributes(map);
    System.out.println("show: " + map);
    return "show";
}
```

方案2：前端js使用String方式接收长整形

```html
<script th:inline="javascript">
    let hu = [[${hu == null ? '' + vo.hu : '' + hu}]];
    let se = [[${se == null ? '' + vo.se : '' + se}]];
    console.log("hu = ", hu);
    console.log("se = ", se);
</script>
```

具体的效果就不再演示，有兴趣的小伙伴可以自己体验一下；这种方式虽然简单有效，但是对现有的项目改造还是挺大的，且很容易有遗漏；自然的，我们就会思考一下，是否有统一的处理方式来解决这种问题


### 3. 修改序列化方式，实现长整型转字符串

作为后端，前端的使用姿势我们无法控制；为了整个程序的准确性，后端直接返回String格式通常是首选的方案；对于现下主流的前后端分离方案，后端一般是返回json格式的数据，所以要想实现统一的格式转换，自然会想到对序列化做文章

比如SpringBoot默认的jackson序列化框架，直接让其实现对长整型转String的转换

先实现一个工具类，来实现上面的诉求，支持long/bigint/bigdecimal转string

```java
public class JacksonUtil {

    /**
     * 序列换成json时,将所有的long变成string
     * 因为js中得数字类型不能包含所有的java long值
     */
    public static SimpleModule bigIntToStrsimpleModule() {
        SimpleModule simpleModule = new SimpleModule();
        simpleModule.addSerializer(Long.class, newSerializer(s -> String.valueOf(s)));
        simpleModule.addSerializer(Long.TYPE, ToStringSerializer.instance);
        simpleModule.addSerializer(long[].class, newSerializer((Function<Long, String>) String::valueOf));
        simpleModule.addSerializer(Long[].class, newSerializer((Function<Long, String>) String::valueOf));
        simpleModule.addSerializer(BigDecimal.class, newSerializer(BigDecimal::toString));
        simpleModule.addSerializer(BigDecimal[].class, newSerializer(BigDecimal::toString));
        simpleModule.addSerializer(BigInteger.class, ToStringSerializer.instance);
        simpleModule.addSerializer(BigInteger[].class, newSerializer((Function<BigInteger, String>) BigInteger::toString));
        return simpleModule;
    }

    public static <T, K> JsonSerializer<T> newSerializer(Function<K, String> func) {
        return new JsonSerializer<T>() {
            @Override
            public void serialize(T t, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
                if (t == null) {
                    jsonGenerator.writeNull();
                    return;
                }

                if (t.getClass().isArray()) {
                    jsonGenerator.writeStartArray();
                    Stream.of(t).forEach(s -> {
                        try {
                            jsonGenerator.writeString(func.apply((K) s));
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });
                    jsonGenerator.writeEndArray();
                } else {
                    jsonGenerator.writeString(func.apply((K) t));
                }
            }
        };
    }
}
```

其次就是注册一个支持长整型转String的序列化转换类`HttpMessageConverter`

```java
@Slf4j
@Configuration
public class MyWebConfig implements WebMvcConfigurer {
    /**
     * 配置序列化方式
     *
     * @param converters
     */
    @Override
        public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter convert = new MappingJackson2HttpMessageConverter();
        ObjectMapper mapper = new ObjectMapper();
        // 长整型序列化返回时，更新为string，避免前端js精度丢失
        // 注意这个仅适用于json数据格式的返回，对于Thymeleaf的模板渲染依然会出现精度问题
        mapper.registerModule(JacksonUtil.bigIntToStrsimpleModule());
        convert.setObjectMapper(mapper);
        // 这里指定了自定义的convert为第一优先级；
        converters.add(0, convert);
    }
}
```


接下来我们对比一下，上面注册前后，访问 'http://localhost:8080/id2' 返回的数据格式

![](/imgs/231027/01.jpg)


基于上面的输出结果，可以看到我们的目标已经实现，返回的长整型会自动转换为字符串；这样前端使用时，就不会出现精度丢失问题了（除非前端又将字符串转number）

上面这个是后端直接返回Json对象数据；这种解决方案适用于 `Thymeleaf` 模板渲染引擎么？

- 直接访问一下 `http://localhost:8080/show` 看一下控制台输出
- 很遗憾的是，依然是**精度丢失**

why?

> Thymeleaf模板的参数传递，并不是通过`HttpMessageConverter`来实现的，数据转换的实现主要是靠`IStandardJavaScriptSerializer`


### 4. Thymeleaf 长整型精度丢失问题解决方案

既然直接返回json数据可以通过修改序列化的转换方式来实现，那么Thymeleaf按照这个思路，应该也是可行的

直接通过debug，我们可以知道Thymeleaf默认使用的是`JacksonStandardJavaScriptSerializer`来对js传递的对象进行序列化

![](/imgs/231027/02.jpg)

从`JacksonStandardJavaScriptSerializer`的实现来看，比较遗憾的是它并没有支持长整型转字符串，也没有预留给我们进行注册`Module`的口子

因此一个粗暴的解决方案就是反射拿到它，然后进行主动注册

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring5.dialect.SpringStandardDialect;
import org.thymeleaf.standard.serializer.IStandardJavaScriptSerializer;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Objects;


@Slf4j
@Configuration
public class MyWebConfig implements WebMvcConfigurer {
    @Resource
    private TemplateEngine templateEngine;

    @PostConstruct
    private void init() {
        // 通过templateEngine获取SpringStandardDialect
        SpringStandardDialect springStandardDialect = CollectionUtils.findValueOfType(templateEngine.getDialects(), SpringStandardDialect.class);
        //  使用反射的方式，在序列化框架上添加长整型转String
        reflectRegistertModule(springStandardDialect);
    }

    private void reflectRegistertModule(SpringStandardDialect springStandardDialect) {
        IStandardJavaScriptSerializer standardJavaScriptSerializer = springStandardDialect.getJavaScriptSerializer();
        // 反射获取 IStandardJavaScriptSerializer
        Field delegateField = ReflectionUtils.findField(standardJavaScriptSerializer.getClass(), "delegate");
        if (delegateField == null) {
            log.warn("delegeteField is null !!!");
            return;
        }
        ReflectionUtils.makeAccessible(delegateField);
        Object delegate = ReflectionUtils.getField(delegateField, standardJavaScriptSerializer);
        if (delegate == null) {
            log.warn("delegete is null !!!");
            return;
        }
        // 如果代理类是JacksonStandardJavaScriptSerializer,则获取mapper,设置model
        if (Objects.equals("JacksonStandardJavaScriptSerializer", delegate.getClass().getSimpleName())) {
            Field mapperField = ReflectionUtils.findField(delegate.getClass(), "mapper");
            if (mapperField == null) {
                log.warn("mapperField is null !!!");
                return;
            }
            ReflectionUtils.makeAccessible(mapperField);
            ObjectMapper objectMapper = (ObjectMapper) ReflectionUtils.getField(mapperField, delegate);
            if (objectMapper == null) {
                log.warn("mapper is null !!!");
                return;
            }
            // 设置序列化Module,修改long型序列化为字符串
            objectMapper.registerModule(JacksonUtil.bigIntToStrsimpleModule());
            log.info("WebConf init 设置jackson序列化长整型为字符串成功!!!");
        }
    }
}
```

上面配置完毕之后，正常我们再js中获取到的长整型就会变成字符串，不会再出现精度丢失问题了；直接再次验证一下，正常输出应该如下：

![](/imgs/231027/03.jpg)


使用反射的方式虽然可以解决我们的诉求，但是不太优雅，既然官方定义了接口，我们完全可以注册自定义实现，来解决这个问题

```java
/**
 * 直接copy org.thymeleaf.standard.serializer.StandardJavaScriptSerializer
 * 添加 this.mapper.registerModule(JacksonUtil.bigIntToStrsimpleModule());
 */
public final class MyStandardJavaScriptSerializer implements IStandardJavaScriptSerializer {
    private static final Logger logger = LoggerFactory.getLogger(MyStandardJavaScriptSerializer.class);
    private final IStandardJavaScriptSerializer delegate;

    private String computeJacksonPackageNameIfPresent() {
        try {
            Class<?> objectMapperClass = ObjectMapper.class;
            String objectMapperPackageName = objectMapperClass.getPackage().getName();
            return objectMapperPackageName.substring(0, objectMapperPackageName.length() - ".databind".length());
        } catch (Throwable var3) {
            return null;
        }
    }

    public MyStandardJavaScriptSerializer(boolean useJacksonIfAvailable) {
        IStandardJavaScriptSerializer newDelegate = null;
        String jacksonPrefix = useJacksonIfAvailable ? this.computeJacksonPackageNameIfPresent() : null;
        if (jacksonPrefix != null) {
            try {
                newDelegate = new JacksonStandardJavaScriptSerializer(jacksonPrefix);
            } catch (Exception var5) {
                this.handleErrorLoggingOnJacksonInitialization(var5);
            } catch (NoSuchMethodError var6) {
                this.handleErrorLoggingOnJacksonInitialization(var6);
            }
        }
        this.delegate = (IStandardJavaScriptSerializer) newDelegate;
    }

    public void serializeValue(Object object, Writer writer) {
        this.delegate.serializeValue(object, writer);
    }

    private void handleErrorLoggingOnJacksonInitialization(Throwable e) {
        String warningMessage = "[THYMELEAF] Could not initialize Jackson-based serializer even if the Jackson library was detected to be present at the classpath. Please make sure you are adding the jackson-databind module to your classpath, and that version is >= 2.5.0. THYMELEAF INITIALIZATION WILL CONTINUE, but Jackson will not be used for JavaScript serialization.";
        if (logger.isDebugEnabled()) {
            logger.warn("[THYMELEAF] Could not initialize Jackson-based serializer even if the Jackson library was detected to be present at the classpath. Please make sure you are adding the jackson-databind module to your classpath, and that version is >= 2.5.0. THYMELEAF INITIALIZATION WILL CONTINUE, but Jackson will not be used for JavaScript serialization.", e);
        } else {
            logger.warn("[THYMELEAF] Could not initialize Jackson-based serializer even if the Jackson library was detected to be present at the classpath. Please make sure you are adding the jackson-databind module to your classpath, and that version is >= 2.5.0. THYMELEAF INITIALIZATION WILL CONTINUE, but Jackson will not be used for JavaScript serialization. Set the log to DEBUG to see a complete exception trace. Exception message is: " + e.getMessage());
        }

    }

    private static final class JacksonThymeleafCharacterEscapes extends CharacterEscapes {
        private static final int[] CHARACTER_ESCAPES = CharacterEscapes.standardAsciiEscapesForJSON();
        private static final SerializableString SLASH_ESCAPE;
        private static final SerializableString AMPERSAND_ESCAPE;

        JacksonThymeleafCharacterEscapes() {
        }

        public int[] getEscapeCodesForAscii() {
            return CHARACTER_ESCAPES;
        }

        public SerializableString getEscapeSequence(int ch) {
            if (ch == 47) {
                return SLASH_ESCAPE;
            } else {
                return ch == 38 ? AMPERSAND_ESCAPE : null;
            }
        }

        static {
            CHARACTER_ESCAPES[47] = -2;
            CHARACTER_ESCAPES[38] = -2;
            SLASH_ESCAPE = new SerializedString("\\/");
            AMPERSAND_ESCAPE = new SerializedString("\\u0026");
        }
    }

    private static final class JacksonThymeleafISO8601DateFormat extends DateFormat {
        private static final long serialVersionUID = 1354081220093875129L;
        private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZZZ");

        JacksonThymeleafISO8601DateFormat() {
            this.setCalendar(this.dateFormat.getCalendar());
            this.setNumberFormat(this.dateFormat.getNumberFormat());
        }

        public StringBuffer format(Date date, StringBuffer toAppendTo, FieldPosition fieldPosition) {
            StringBuffer formatted = this.dateFormat.format(date, toAppendTo, fieldPosition);
            formatted.insert(26, ':');
            return formatted;
        }

        public Date parse(String source, ParsePosition pos) {
            throw new UnsupportedOperationException("JacksonThymeleafISO8601DateFormat should never be asked for a 'parse' operation");
        }

        public Object clone() {
            JacksonThymeleafISO8601DateFormat other = (JacksonThymeleafISO8601DateFormat) super.clone();
            other.dateFormat = (SimpleDateFormat) this.dateFormat.clone();
            return other;
        }
    }

    private static final class JacksonStandardJavaScriptSerializer implements IStandardJavaScriptSerializer {
        private final ObjectMapper mapper = new ObjectMapper();

        JacksonStandardJavaScriptSerializer(String jacksonPrefix) {
            this.mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            this.mapper.disable(new JsonGenerator.Feature[]{Feature.AUTO_CLOSE_TARGET});
            this.mapper.enable(new JsonGenerator.Feature[]{Feature.ESCAPE_NON_ASCII});
            this.mapper.getFactory().setCharacterEscapes(new JacksonThymeleafCharacterEscapes());
            this.mapper.setDateFormat(new JacksonThymeleafISO8601DateFormat());
            Class<?> javaTimeModuleClass = ClassLoaderUtils.findClass(jacksonPrefix + ".datatype.jsr310.JavaTimeModule");
            if (javaTimeModuleClass != null) {
                try {
                    this.mapper.registerModule((Module) javaTimeModuleClass.newInstance());
                    this.mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
                } catch (InstantiationException var4) {
                    throw new ConfigurationException("Exception while trying to initialize JSR310 support for Jackson", var4);
                } catch (IllegalAccessException var5) {
                    throw new ConfigurationException("Exception while trying to initialize JSR310 support for Jackson", var5);
                }
            }
            this.mapper.registerModule(JacksonUtil.bigIntToStrsimpleModule());
        }

        public void serializeValue(Object object, Writer writer) {
            try {
                this.mapper.writeValue(writer, object);
            } catch (IOException var4) {
                throw new TemplateProcessingException("An exception was raised while trying to serialize object to JavaScript using Jackson", var4);
            }
        }
    }
}
```


然后再将我们自定义的是转换类注册到`TemplateEngine`

```java
@PostConstruct
public void init() {
    log.info("XmlWebConfig init...");
    // 通过templateEngine获取SpringStandardDialect
    SpringStandardDialect springStandardDialect = CollectionUtils.findValueOfType(templateEngine.getDialects(), SpringStandardDialect.class);
//         方式1. 通过自定义重写 StandardJavaScriptSerializer 方式，支持序列化的长整型转换
    springStandardDialect.setJavaScriptSerializer(new MyStandardJavaScriptSerializer(true));
    System.out.println("over");

    // 方式2. 使用反射的方式，在序列化框架上添加长整型转String
//        reflectRegistertModule(springStandardDialect);
}
```

### 5. 小结

本文的内容相对较多，但是核心的问题解决思路只有一个：

**对于长整型的精度问题，解决方案就是将长整型转换为字符串**

对应的解决方案有下面几种

1. 后端直接编码中，对于长整型的字段转换为字符串进行返回
2. 前端接收时，以字符串方式接收长整形
3. 后端针对json返回，通过注册自定义的`HttpMessageConverter`做统一的长整型格式化转换
4. 对于Thymeleaf模板渲染引擎，通过修改`IStandardJavaScriptSerializer`支持长整型的格式转换

最后再抛出一个问题，上面给出了Thymeleaf的长整形转换，但是如果我用的是Freemaker渲染引擎， 序列化工具使用的是gson, fastjson，那应该怎么处理呢？

## III. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/600-snowflake-id](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/600-snowflake-id)
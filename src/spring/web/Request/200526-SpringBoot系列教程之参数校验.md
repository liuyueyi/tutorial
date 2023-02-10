---
order: 5
title: 5.参数校验Validation
tag: 
  - Validation
category: 
  - SpringBoot
  - WEB系列
  - Request
date: 2020-05-26 09:14:34
keywords: SpringBoot SpringMVC validation jsr303 hibernate 参数校验
---

业务开发的小伙伴总有那么几个无法逃避的点，如大段if/else，接口的参数校验等。接下来将介绍几种使用`Validation-Api`的方式，来实现参数校验，让我们的业务代码更简洁

<!-- more -->

## I. 基本知识点

### 1. validation-api

参数校验有自己的一个规范JSR303, 它是一套 JavaBean 参数校验的标准，它定义了很多常用的校验注解。

java开发环境中，可以通过引入`validation-api`包的相关注解，来实现参数的条件限定

```xml
<dependency>
  <groupId>jakarta.validation</groupId>
  <artifactId>jakarta.validation-api</artifactId>
  <version>2.0.1</version>
  <scope>compile</scope>
</dependency>
```

请注意上面这个包只是定义，如果项目中单独的引入上面的这个包，并没有什么效果，我们通常选用`hibernate-validator`来作为具体的实现

```java
<dependency>
  <groupId>org.hibernate.validator</groupId>
  <artifactId>hibernate-validator</artifactId>
  <version>6.0.18.Final</version>
  <scope>compile</scope>
  <exclusions>
    <exclusion>
      <artifactId>validation-api</artifactId>
      <groupId>javax.validation</groupId>
    </exclusion>
  </exclusions>
</dependency>
```

下面给出一些常用的参数限定注解

| 注解 | 描述
| --- | --- 
| `@AssertFalse` | 被修饰的元素必须为 false |
| `@AssertTrue` | 被修饰的元素必须是true |
| `@DecimalMax` | 被修饰的元素必须是一个数字，其值必须小于等于指定的最大值 |
| `@DecimalMin` | 同DecimalMax |
| `@Digits` | 被修饰的元素是数字 |
| `@Email` | 被修饰的元素必须是邮箱格式 |
| `@Future` | 将来的日期 |
| `@Max` | 被修饰的元素必须是一个数字，其值必须小于等于指定的最大值 |
| `@Min` | 被修饰的元素必须是一个数字，其值必须大于等于指定的最小值 |
| `@NotNull` | 不能是Null |
| `@Null` | 元素是Null |
| `@Past` | 被修饰的元素必须是一个过去的日期 |
| `@Pattern` | 被修饰的元素必须符合指定的正则表达式 |
| `@Size` | 被修饰的元素长度 |
| `@Positive` | 正数 | 
| `@PositiveOrZero` | 0 or 正数 |
| `@Negative` | 负数 |
| `@NegativeOrZero` | 0 or 负数 |

### 2. 项目搭建

接下来我们创建一个SpringBoot项目，用于后续的实例演示

我们采用IDEA + JDK1.8 进行项目开发

- SpringBoot: `2.2.1.RELEASE`

pom核心依赖如下

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**请注意** 并没有显示的添加上一小节的两个依赖，因为已经集成在start包中了


## II. 实例演示

接下来我们进入实例演示环节，会给出几种常见的使用case，以及如何扩展参数校验，使其支持自己定制化的参数校验规则

### 1. 校验失败抛异常

如果我们的参数校验失败，直接抛异常，可以说是最简单的使用方式了；首先我们创建一个简单ReqDo，并对参数进行一些必要的限定

```java
@Data
public class ReqDo {

    @NotNull
    @Max(value = 100, message = "age不能超过100")
    @Min(value = 18, message = "age不能小于18")
    private Integer age;

    @NotBlank(message = "name不能为空")
    private String name;

    @NotBlank
    @Email(message = "email非法")
    private String email;

}
```

然后提供一个rest接口

```java
@RestController
public class RestDemo {

    @GetMapping(path = "exception")
    public String exception(@Valid ReqDo reqDo) {
        return reqDo.toString();
    }
}
```

参数左边有一个`@Valid`注解，用于表示这个对象需要执行参数校验，如果校验失败，会抛400错误

演示如下

![](/imgs/200526/00.jpg)


### 2. BindingResult

将校验失败的结果塞入`BindingResult`，避免直接返回400，这种方式只需要在方法参数中，加一个对象即可，通过它来获取所有的参数异常错误

```java
@GetMapping(path = "bind")
public String bind(@Valid ReqDo reqDo, BindingResult bindingResult) {
    if (bindingResult.hasErrors()) {
        return bindingResult.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList()).toString();
    }

    return reqDo.toString();
}
```

![](/imgs/200526/01.jpg)


### 3. 手动校验

除了上面两个借助 `@Valid` 注解修饰，自动实现参数校验之外，我们还可以手动校验一个DO是否准确，下面给出一个简单的实例

```java
@GetMapping(path = "manual")
public String manual(ReqDo reqDo) {
    Set<ConstraintViolation<ReqDo>> ans =
            Validation.buildDefaultValidatorFactory().getValidator().validate(reqDo, new Class[0]);
    if (!CollectionUtils.isEmpty(ans)) {
        return ans.stream().map(ConstraintViolation::getMessage).collect(Collectors.toList()).toString();
    }

    return reqDo.toString();
}
```

![](/imgs/200526/02.jpg)


### 4. 自定义参数校验

虽然JSR303规范中给出了一些常见的校验限定，但显示的业务场景千千万万，总会有覆盖不到的地方，比如最简单的手机号校验就没有，所以可扩展就很有必要了，接下来我们演示一下，自定义一个身份证校验的注解

首先定义注解 `@IdCard`

```java
@Documented
@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IdCardValidator.class)
public @interface IdCard {
    String message() default "身份证号码不合法";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
    
    @Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
    @Retention(RUNTIME)
    @Documented
    @interface List {

        IdCard[] value();
    }
}
```

上面的实现中，有几个需要注意的点

- `@Constraint` 注解，指定校验器为 `IdCardValidator`, 即表示待有`@IdCard`直接的属性，由`IdCardValidator`来校验是否合乎规范
- `groups`: 分组，主要用于不同场景下，校验方式不一样的case
  - 如新增数据时，主键id可以为空；更新数据时，主键id不能为空
- `payload`: 知道这个具体干嘛用的老哥请留言指点一下

接下来完成身份证号的校验器`IdCardValidator`

> 这里直接借助`hutool`工具集中的`cn.hutool.core.util.IdcardUtil#isValidCard`来实现身份证有效性判断

```java
public class IdCardValidator implements ConstraintValidator<IdCard, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        return IdcardUtil.isValidCard(value);
    }
}
```

然后将我们前面的ReqDo修改一下，新增一个身份证的字段

```java
@IdCard
private String idCard;
```

再次访问测试(说明，图1中身份证号是随便填的，图2中的身份证号是`http://sfz.uzuzuz.com/`这个网站生成的，并不指代真实的某个小伙伴)

![IdCard校验](/imgs/200526/03.jpg)
![IdCard校验](/imgs/200526/04.jpg)

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码: [https://github.com/liuyueyi/spring-boot-demo/spring-boot/202-web-params-validate](https://github.com/liuyueyi/spring-boot-demo/spring-boot/202-web-params-validate)


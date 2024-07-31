---
order: 4
title: 4. SPI框架实现之旅四：使用测试
date: 2017-05-30 20:50:37
tag:
  - Java
  - 技术方案
category:
  - Quick系列
  - QuickSpi
---

#  使用测试

> 前面三篇主要是介绍如何设计的，如何实现的，这一篇，则主要集中在如何使用。实现得再好，如果不好用，也白搭

本篇介绍几个简单的使用case，包括静态使用，动态适配，自定义选择器等

<!-- more -->

## 1. 简单的静态使用

定义一个SPI接口  `IPrint`,  两个实现  `FilePrint`, `ConsolePrint`

```java
@Spi
public interface IPrint {
    void print(String str);
}

public class FilePrint implements IPrint {
    @Override
    public void print(String str) {
        System.out.println("file print: " + str);
    }
}

public class ConsolePrint implements IPrint {
    @Override
    public void print(String str) {
        System.out.println("console print: " + str);
    }
}
```

添加配置文件 `com.hust.hui.quicksilver.spi.test.print.IPrint`, 内容如下

    com.hust.hui.quicksilver.spi.test.print.ConsolePrint
    com.hust.hui.quicksilver.spi.test.print.FilePrint


测试代码如下

```
@Test
public void testPrint() throws NoSpiMatchException {
   SpiLoader<IPrint> spiLoader = SpiLoader.load(IPrint.class);

   IPrint print = spiLoader.getService("ConsolePrint");
   print.print("console---->");


   print = spiLoader.getService("FilePrint");
   print.print("file---->");


   try {
       print = spiLoader.getService("undefine");
       print.print("undefine----");
       Assert.assertTrue(false);
   } catch (Exception e) {
       System.out.println("type error-->" + e);
   }


   try {
       print = spiLoader.getService(123);
       print.print("type error----");
       Assert.assertTrue(false);
   } catch (Exception e){
       System.out.println("type error-->" + e);
   }
}
```

输出如下

```
console print: console---->
file print: file---->
type error-->com.hust.hui.quicksilver.spi.exception.NoSpiMatchException: no spiImpl match the name you choose! your choose is: undefine
type error-->java.lang.IllegalArgumentException: conf spiInterfaceType should be sub class of [class java.lang.String] but yours:class java.lang.Integer
```


演示如下


![http://s2.mogucdn.com/mlcdn/c45406/170531_308geabej59hh3hegbf2cdkb0e8kj_1224x718.gif](http://s2.mogucdn.com/mlcdn/c45406/170531_308geabej59hh3hegbf2cdkb0e8kj_1224x718.gif)


## 2. 动态适配

与静态的使用有点区别，主要的区别点在于接口的定义（需要注意第一个参数是作为选择器选择SPI实现的参数），同样是上面这个spi接口

```java
@Spi
public interface IPrint {

    void print(String str);


    void adaptivePrint(String conf, String str);

}

    @Override
    public void print(String str) {
        System.out.println("file print: " + str);
    }

    @Override
    public void adaptivePrint(String conf, String str) {
        System.out.println("file adaptivePrint: " + str);
    }
}

public class ConsolePrint implements IPrint {

    @Override
    public void print(String str) {
        System.out.println("console print: " + str);
    }

    @Override
    public void adaptivePrint(String conf, String str) {
        System.out.println("console adaptivePrint: " + str);
    }
}
```

 主要是新增了一个接口 `adaptivePrint`,  其他的没有啥区别，测试代码如下
 
 ```java
@Test
public void testAdaptivePrint() throws SpiProxyCompileException {
   IPrint print = SpiLoader.load(IPrint.class).getAdaptive();


   print.adaptivePrint("FilePrint", "[file print]");
   print.adaptivePrint("ConsolePrint", "[console print]");
}
 ```

输出结果

```
file adaptivePrint: [file print]
console adaptivePrint: [console print]
``` 
 
 演示图

 
 ![http://s2.mogucdn.com/mlcdn/c45406/170531_54f638fkcl58c6lihl92adei31c78_1222x718.gif](http://s2.mogucdn.com/mlcdn/c45406/170531_54f638fkcl58c6lihl92adei31c78_1222x718.gif)



## 3. 自定义选择器

> 上面两个很简单的演示了下使用方式，最基本的方法， 没有加上 @SpiConf 注解， 没有显示指定选择器类
型，下面则演示下，如何自定义选择器

**SPI接口**

有一个欢迎方法，我们需求根据用户的来源显示不同的欢迎至此， 下面定义了一个 `UserSelector`选择器，这个就是我们自定义的选择器

```java
@Spi
public interface IUser {
    @SpiAdaptive(selector = UserSelector.class)
    void welcome(UserDO userDO);
}
```

spi实现类

```java
public class QQUser implements IUser {

    @Override
    public void welcome(UserDO userDO) {
        System.out.println("qq 欢迎你! " + userDO);
    }
}

public class WeixinUser implements IUser {

    @Override
    public void welcome(UserDO userDO) {
        System.out.println("weixin 欢迎你! " + userDO);
    }
}
```

`META-INF/services/` 目录下的配置如下 `com.hust.hui.quicksilver.spi.def.spi.IUser`

    com.hust.hui.quicksilver.spi.def.spi.QQUser
    com.hust.hui.quicksilver.spi.def.spi.WeixinUser

选择器实现如下

```java
public class UserSelector implements ISelector<UserDO> {

    @Override
    public <K> K selector(Map<String, SpiImplWrapper<K>> map, UserDO conf) throws NoSpiMatchException {

        if (conf == null || conf.getMarket() == null) {
            throw new IllegalArgumentException("userDo or userDO#market should not be null!");
        }


        String name = conf.getMarket().getName();
        if (map.containsKey(name)) {
            return map.get(name).getSpiImpl();
        }


        throw new NoSpiMatchException("no spiImp matched marked: " + conf.getMarket());
    }
}
```

从上面的选择器逻辑可以看出，我们是根据 UserDO的market参数来进行选择的， UserDO的定义如下

```java
@Getter
@Setter
@ToString
public class UserDO {

    private String uname;

    private String avatar;

    private MarketEnum market;

}

public enum MarketEnum {
    WEIXIN("WeixinUser"),

    QQ("QQUser");

    private String name;

    MarketEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```


测试代码如下

```java
@Test
public void testUserSPI() throws SpiProxyCompileException {
   SpiLoader<IUser> loader = SpiLoader.load(IUser.class);
   IUser user = loader.getAdaptive();


   UserDO weixinUser = new UserDO();
   weixinUser.setAvatar("weixin.avatar.jpg");
   weixinUser.setUname("微信用户");
   weixinUser.setMarket(MarketEnum.WEIXIN);
   user.welcome(weixinUser);


   UserDO qqUser = new UserDO();
   qqUser.setAvatar("qq.avatar.jpg");
   qqUser.setUname("qq用户");
   qqUser.setMarket(MarketEnum.QQ);
   user.welcome(qqUser);

   System.out.println("-----over------");
}
```

输出结果:

    weixin 欢迎你! UserDO(uname=微信用户, avatar=weixin.avatar.jpg, market=WEIXIN)
    qq 欢迎你! UserDO(uname=qq用户, avatar=qq.avatar.jpg, market=QQ)



演示如下:

![http://s2.mogucdn.com/mlcdn/c45406/170531_8af3ek900d8c783031lc7h375a0b8_1222x718.gif](http://s2.mogucdn.com/mlcdn/c45406/170531_8af3ek900d8c783031lc7h375a0b8_1222x718.gif)


## 3. 其他

### 博客系列链接：

- [SPI框架实现之旅四：使用测试](/hexblog/2018/05/30/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E5%9B%9B%EF%BC%9A%E4%BD%BF%E7%94%A8%E6%B5%8B%E8%AF%95/)
- [SPI框架实现之旅三：实现说明](/hexblog/2018/05/30/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E4%B8%89%EF%BC%9A%E5%AE%9E%E7%8E%B0%E8%AF%B4%E6%98%8E/)
- [SPI框架实现之旅二：整体设计](/hexblog/2018/05/30/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E4%BA%8C%EF%BC%9A%E6%95%B4%E4%BD%93%E8%AE%BE%E8%AE%A1/)
- [SPI框架实现之旅一：背景介绍](/hexblog/2017/05/29/SPI%E6%A1%86%E6%9E%B6%E5%AE%9E%E7%8E%B0%E4%B9%8B%E6%97%85%E4%B8%80%EF%BC%9A%E8%83%8C%E6%99%AF%E4%BB%8B%E7%BB%8D/)

### 项目: QuickAlarm

- 项目地址： [Quick-SPI](https://github.com/liuyueyi/quick-spi)
- 博客地址： [小灰灰Blog](https://liuyueyi.github.io/hexblog/)

### 个人博客： [Z+|blog](https://liuyueyi.github.io/hexblog)

基于hexo + github pages搭建的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 声明

尽信书则不如，已上内容，纯属一家之言，因本人能力一般，见识有限，如发现bug或者有更好的建议，随时欢迎批评指正，我的微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)

### 扫描关注

![QrCode](https://s17.mogucdn.com/mlcdn/c45406/180209_74fic633aebgh5dgfhid2fiiggc99_1220x480.png)
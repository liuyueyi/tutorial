---
order: 5
title: 5. Grafana使用语法之ES/Luence篇
tag:
  - Grafana
category:
  - 开源
  - 运维
date: 2022-03-02 14:48:19
keywords:
  - Grafana
  - Elasticsearch
---

Grafnan结合ElasticSearch，实现数据统计，大盘配置

<!-- more -->

### 1. 查询成员字段

语法：`{"find": "fields", "type": "keyword"}`

- find： 表示查什么东西
- type：表示检索条件

如查询`long`类型的字段，可以如下处理

```json
{
	"find": "fields",
	"type": "long"
}
```

什么时候用这个呢？

- 比如我想知道这个es中定义了哪些字段
- 比如在配置Grafana的变量时，可以使用它来做一些限定

### 2. 查询成员值

语法： `{"find": "terms", "field": "成员名", "size": 100}`

- find：后面跟上的是 terms， 表示查询具体的值
- field: 用于限定需要查的成员
- size：数量限制，可以不填

举例如下，查询所有的服务器ip

```json
{
	"find": "terms",
	"field": "server_ip"
}
```

使用范围：
- 常见于配置Grafana变量，配置一个服务器ip选择的变量，用于查看不同服务器的表现情况

### 3. 条件查询成员值

在前面的基础上加一下限定，比如一个es为多个应用使用，此时我只关注其中app1的大盘，此时配置服务器时，想加一个条件限定

语法: `{"find": "terms", "field": "成员名", "query": "k:v"}`

- query： lucence查询语法，要求成员k的值为v

举例，查询server_name = app的服务器ip

```json
{
	"find": "terms",
	"field": "server_ip",
	"query": "server_name:app"
}
```

### 4. Lucene 查询语法

配置大盘的查询条件，主要就是借助lucene语法来处理，接下来看一下常见的使用姿势

#### 4.1  条件等于查询

语法： `field_name: filed_value`

- filed_name: 字段名
- field_value: 需要检索的值

**注意：** 中间使用英文冒号分隔，表示条件命中

#### 4.2 不等于查询

如果希望不等于查询，主要使用下面这种方式

- `!(field_name:field_value)`

#### 4.3 字段本身存在与否

- `_exists_:field_name`:  查询包含field成员的记录
- `_missing_:field_name`:  查询不包含field成员的记录

#### 4.4 通配符查询

在查询条件中，包含下面两个的表示使用通配查询

- `?`匹配打个字符
- `*` 匹配0或多个字符

比如我有个应用，部署多个环境，分别名为 app-cn, app-usa，现在想统计整个应用的情况，就可以使用下面这种正则方式

```bash
server_name: app-*
```

除了上面的示例，在实际的工作中，更常见的是url的统计，比如统计 `/get/` 这个域名开头的请求

```bash
# 下面使用了转义
url: \/get\/*
```

#### 4.5 模糊搜索

在单次后面添加剂上 `~`来实现模糊搜索，这种更适用于搜索业务场景，通常对于grafana的大盘配置，个人感觉不太实用

实用方式

```bash
// 可以匹配 app-cn
server_name: app-nc~
```

#### 4.6 范围搜索

除了前面的精确搜索，我们还可以进行范围搜索

语法： `[ a TO b ]`,  `{a TO B}`

- `[]`： 闭包区间，包含左边的值
- `{}`： 开区间，不包含两边值
- `a/b` 如果为 `*` 表示某一侧不限制范围

实例演示，查询http状态码为 4xx 的case

```bash
http_code: [400 TO 499]
```

除了上面这种写法，也可以使用 `> < `的方式，比如上面的写法等价

```bash
// >=400之间不要加上空格
http_code: (>=400 AND <=499)
```

#### 4.7 逻辑操作

多条件组合，使用AND/OR来处理，这里的组合即可以表明多个field，也可以是一个field的多个value组合

如多字段匹配：找出app-cn应用中状态码为500的记录

```bash
http_code:500 and server_name:app-cn
```

如多value匹配：找出状态码为500, 503的记录

```bash
http_code: (500 OR 503)
```

#### 4.8 转移字符

当查询条件中，包含下面字符中的一个时，需要使用注意

- 特殊字符: `+ - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /`
- 转义修饰: `\/`

如url的查询时，通常会用到转义

```bash
url: \/get\/info
```

### 5. 小结

本文主要介绍Grafana中使用es数据源时，常见的语法操作，当然其中Lucence的部分，在kibana中也同样适用；

通常来讲，在Grafana中，有下面几个地方会使用到上面的知识点

变量配置时，使用第1，2，3节中的方式，过滤出下拉选项

![](/hexblog/imgs/220302/00.jpg)


在大盘配置的Query输入框中，使用 Lucene 语法

![](/hexblog/imgs/220302/01.jpg)

在Explore中使用Lucene语法

![](/hexblog/imgs/220302/02.jpg)


参考博文：

- [Lucene查询语法详解](https://www.cnblogs.com/xing901022/p/4974977.html)


## 一灰灰的联系方式 

尽信书则不如无书，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 个人站点：[https://blog.hhui.top](https://blog.hhui.top)
- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840
- 微信公众号：**一灰灰blog**

![QrCode](https://spring.hhui.top/spring-blog/imgs/info/info.png)

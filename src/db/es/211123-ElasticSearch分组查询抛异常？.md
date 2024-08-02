---
order: 8
title: 8. 分组查询抛异常解决方案
tag:
  - ElasticSearch
category:
  - 开源
  - ElasticSearch
date: 2021-11-23 18:11:36
keywords: 
  - ElasticSearch
  - Solr
  - 搜索
---

在使用es进行组合查询的时候，遇到一个非常有意思的场景，特此记录一下

某些场景下，直接针对某个Field进行分组查询，居然无法返回结果，会给出类似`Text fields are not optimised for operations that require per-document field data like aggregations and sorting, so these operations are disabled by default`的提示信息，接下来看一下这个问题是个什么情况，以及如何解决

<!-- more -->

### 1. 数据准备

初始化一个索引，写入一些测试数据

```json
post second-index/_doc
{
  "url": "/test",
  "execute": {
    "args": "id=10&age=20",
    "cost": 10,
    "res": "test result"
  },
  "response_code": 200,
  "app": "yhh_demo"
}


post second-index/_doc
{
  "url": "/test",
  "execute": {
    "args": "id=20&age=20",
    "cost": 11,
    "res": "test result2"
  },
  "response_code": 200,
  "app": "yhh_demo"
}


post second-index/_doc
{
  "url": "/test",
  "execute": {
    "args": "id=10&age=20",
    "cost": 12,
    "res": "test result2"
  },
  "response_code": 200,
  "app": "yhh_demo"
}


post second-index/_doc
{
  "url": "/hello",
  "execute": {
    "args": "tip=welcome",
    "cost": 2,
    "res": "welcome"
  },
  "response_code": 200,
  "app": "yhh_demo"
}

post second-index/_doc
{
  "url": "/404",
  "execute": {
    "args": "tip=welcome",
    "cost": 2,
    "res": "xxxxxxxx"
  },
  "response_code": 404,
  "app": "yhh_demo"
}
```

### 2. 分组查询基本知识点

相当于sql中的`group by`，常用于聚合操作中的统计计数的场景

在es中，使用`aggs`来实现，语法如下


```json
"aggs": {
    "agg-name": { // 这个agg-name 是自定义的聚合名称
        "terms": { // 这个terms表示聚合的策略，根据 field进行分组
            "field": "",
            "size": 10
        }
    }
}
```

比如我们希望根据url统计访问计数，对应的查询可以是

```json
GET second-index/_search
{
  "query": {
    "match_all": {}
  },
  "size": 1, 
  "aggs": {
    "my-agg": {
      "terms": {
        "field": "url",
        "size": 2
      }
    }
  }
}
```

直接执行上面的分组查询，结果问题来了

![](/hexblog/imgs/211123/00.jpg)

右边返回的提示信息为`Text fields are not optimised for operations that require per-document field data like aggregations and sorting, so these operations are disabled by default. Please use a keyword field instead. Alternatively, set fielddata=true on [url] in order to load field data by uninverting the inverted index. Note that this can use significant memory`这个异常



### 3. 解决方案

简单来说，上面这个问题，就是因为url这个字段为text类型，默认情况下这种类型的不走索引，不支持聚合排序，如果需要则需要设置`fielddata=true`，或者使用url的分词`url.keyword`

```json
GET second-index/_search
{
  "query": {
    "match_all": {}
  },
  "size": 1, 
  "aggs": {
    "my-agg": {
      "terms": {
        "field": "url.keyword",
        "size": 2
      }
    }
  }
}
```



![](/hexblog/imgs/211123/01.jpg)



**注意**

- 虽然我们更注重的是分组后的结果，但是`hits`中依然会返回命中的文档，若是只想要分组后的统计结果，可以在查询条件中添加 `size:0`

- 聚合操作和查询条件是可以组合的，如只查询某个url对应的计数



```json
GET second-index/_search
{
  "query": {
    "term": {
      "url.keyword": {
        "value": "/test"
      }
    }
  },
  "size": 1, 
  "aggs": {
    "my-agg": {
      "terms": {
        "field": "url.keyword",
        "size": 2
      }
    }
  }
}
```



![](/hexblog/imgs/211123/02.jpg)

上面介绍了TEXT类型的field，根据分词进行聚合操作；还有一种方式就是设置`fielddata=true`，操作姿势如下

```json
PUT second-index/_mapping
{
  "properties": {
    "url": {
      "type": "text",
      "fielddata": true
    }
  }
}
```

修改完毕之后，再根据url进行分组查询，就不会抛异常了

![](/hexblog/imgs/211123/03.jpg)



### 4. 小结

最后小结一下，当我们使用es的某个field进行分组操作时，此时需要注意

当这个field类型为text，默认的场景下是不支持分组操作的，如果非要用它进行分组查询，有两个办法

- 使用它的索引字段，如 `url.keyword`
- 在索引的filed上添加`fileddata: true` 配置



## 一灰灰的联系方式 

尽信书则不如无书，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 个人站点：[https://blog.hhui.top](https://blog.hhui.top)
- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840
- 微信公众号：**一灰灰blog**

![QrCode](https://spring.hhui.top/spring-blog/imgs/info/info.png)

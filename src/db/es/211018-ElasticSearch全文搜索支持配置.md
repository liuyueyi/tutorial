---
order: 6
title: 6. 全文搜索支持配置
tag:
  - ElasticSearch
category:
  - 开源
  - ElasticSearch
date: 2021-10-18 18:47:39
keywords: elasticsearch,es,java,搜索,luence
---

在es的使用过程中，全文搜索属于一个常见的场景，特别是当我们将es作为日志存储检索来使用时，根据关键字查询对应的日志信息，可以怎么处理呢?

<!-- more -->

### 1. 动态模板结合copy_to方式

在创建索引的时候，我们新增一个allColumnValue的字段，将所有其他的column值都拷贝过去，然后针对这个字段进行检索，即可以实现全文的搜索方式了

这里借助`dynamic_templtes`来实现上面的自动拷贝逻辑，因此我们可以如下创建一个索引

```json
PUT search_all_demo 
{
  "mappings": {
    "dynamic_templates" : [
        {
          "copy_to_allcolumnvalue" : {
            "match_mapping_type" : "*",
            "mapping" : {
              "copy_to" : "allColumnValue",
              "ignore_above" : 512,
              "type" : "keyword"
            }
          }
        }
    ],
    "properties": {
      "allColumnValue" : {
          "type" : "text"
        }
    }
  }
}
```

创建上面的映射表时，两个点
- allColumnValue：字段
- dynamic_templates: 实现字段拷贝

接下来写入一个数据进行测试

```json

POST search_all_demo/_doc
{
  "name": "一灰灰",
  "site": "www.hhui.top",
  "title": "java developer"
}
```

然后检索一下是否可以查询到希望的结果

```json
GET search_all_demo/_search
{
  "query": {
    "match": {
      "allColumnValue": "灰灰"
    }
  }
}
```

上面这个查询之后，正常会命中我们的数据，并返回

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.7911257,
    "hits" : [
      {
        "_index" : "search_all_demo",
        "_type" : "_doc",
        "_id" : "1FoBk3wB-kdeh8MF_IbL",
        "_score" : 0.7911257,
        "_source" : {
          "name" : "一灰灰",
          "site" : "www.hhui.top",
          "title" : "java developer"
        }
      }
    ]
  }
}
```

**注意**

使用上面这种配置时，对于Field有要求，当我们制定一个Map类型时，会失败

```json
POST search_all_demo/_doc
{
  "name": "一灰",
  "site": "blog.hhui.top",
  "ddd": {
    "user": "yihui",
    "pwd": "yihui"
  }
}
```
上面的`ddd`会提示异常

```json
{
  "error" : {
    "root_cause" : [
      {
        "type" : "mapper_parsing_exception",
        "reason" : "failed to parse field [ddd] of type [keyword] in document with id '11qek3wB-kdeh8MFm4bN'. Preview of field's value: '{pwd=yihui, user=yihui}'"
      }
    ],
    "type" : "mapper_parsing_exception",
    "reason" : "failed to parse field [ddd] of type [keyword] in document with id '11qek3wB-kdeh8MFm4bN'. Preview of field's value: '{pwd=yihui, user=yihui}'",
    "caused_by" : {
      "type" : "illegal_state_exception",
      "reason" : "Can't get text on a START_OBJECT at 4:10"
    }
  },
  "status" : 400
}
```

### 2. 部分字段组合搜索

上面介绍的是全量的数据凭借到allColumnValue，从而实现全文检索；可能在实际的场景中，我只是希望对部分的field进行联合检索，基于此可以如下设置

```json
PUT search_union_demo 
{
  "mappings": {
    "properties": {
      "allColumnValue" : {
          "type" : "text"
        },
        "name": {
          "type" : "keyword",
          "ignore_above" : 512,
          "copy_to" : [
            "allColumnValue"
          ]
        },
         "site" : {
          "type" : "keyword",
          "ignore_above" : 512,
          "copy_to" : [
            "allColumnValue"
          ]
        }
    }
  }
}
```

新增两个数据

```json
POST search_union_demo/_doc
{
  "name": "test",
  "site": "spring.hhui.top",
  "ddd": {
    "user": "一灰",
    "pwd": "yihui"
  }
}

POST search_union_demo/_doc
{
  "name": "一灰",
  "site": "blog.hhui.top",
  "ddd": {
    "user": "yihui",
    "pwd": "yihui"
  }
}
```

然后我们检索`一灰`时，可以查到第二条数据

```json
GET search_union_demo/_search
{
  "query": {
    "match": {
      "allColumnValue": "一灰"
    }
  }
}
```

输出结果

```json
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.2814486,
    "hits" : [
      {
        "_index" : "search_union_demo",
        "_type" : "_doc",
        "_id" : "2Fqjk3wB-kdeh8MFy4aC",
        "_score" : 1.2814486,
        "_source" : {
          "name" : "一灰",
          "site" : "blog.hhui.top",
          "ddd" : {
            "user" : "yihui",
            "pwd" : "yihui"
          }
        }
      }
    ]
  }
}
```

### 3. 小结

本文主要介绍借助copy_to，来实现es的联合/全文搜索的功能；通过简单的设置，来支撑更友好的查询场景

## II. 其他

### 1. [一灰灰Blog](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog

一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛


### 2. 声明

尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840

### 3. 扫描关注

**一灰灰blog**

![QrCode](https://spring.hhui.top/spring-blog/imgs/info/info.png)

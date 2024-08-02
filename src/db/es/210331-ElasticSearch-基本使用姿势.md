---
order: 3
title: 3. 基本使用姿势
tag:
  - ElasticSearch 
category:
  - 开源
  - ElasticSearch 
date: 2021-03-31 17:39:55
keywords: ElasticSearch ES Kinbana 搜索
---

ElasticSearch 基本使用姿势，如常见的

- 添加文档
- 常见的查询姿势
- 修改/删除文档

<!-- more -->

### 1. 添加文档

首次添加文档时，若索引不存在会自动创建； 借助kibana的`dev-tools`来实现es的交互

```bash
POST first-index/_doc
{
  "@timestamp": "2021-03-31T01:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "YiHui",
    "name": "一灰灰Blog"
  },
  "addr": {
    "country": "cn",
    "province": "hubei",
    "city": "wuhan"
  },
  "age": 18
}

## 添加两个数据进行测试
POST first-index/_doc
{
  "@timestamp": "2021-03-31T02:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "ErHui",
    "name": "二灰灰Blog"
  },
  "addr": {
    "country": "cn",
    "province": "hubei",
    "city": "wuhan"
  },
  "age": 19
}
```

当然也可以直接使用http进行交互，下面的方式和上面等价（后面都使用kibanan进行交互，更直观一点）

```bash
curl  -X POST 'http://localhost:9200/first-index/_doc?pretty' -H 'Content-Type: application/json' -d '
{
  "@timestamp": "2021-03-31T01:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "YiHui",
    "name": "一灰灰Blog"
  },
  "addr": {
    "country": "cn",
    "province": "hubei",
    "city": "wuhan"
  },
  "age": 18
}'
```

![](/hexblog/imgs/210331/00.jpg)


### 2. 查询文档

#### 2.0 kibana配置并查询

除了基础的查询语法之外，直接使用kibana进行查询，对于使用方而言，门槛最低；首先配置上面的es索引

- Management -> Stack Management -> Kiabana Index Patterns 
- index pattern name 
- 时间字段，选择 `@timestamp` 这个与实际的文档中的field有关

![](/hexblog/imgs/210331/01.jpg)

![](/hexblog/imgs/210331/02.jpg)

![](/hexblog/imgs/210331/03.jpg)

![](/hexblog/imgs/210331/04.jpg)


接下来进入`Discover` 进行查询

![](/hexblog/imgs/210331/05.jpg)

比如字段查询

![](/hexblog/imgs/210331/06.jpg)

#### 2.1 查询所有

不加任何匹配，捞出文档(当数据量很多时，当然也不会真的全部返回，也是会做分页的)

```bash
GET my-index/_search
{
  "query": {
    "match_all": {
    }
  }
}
```

![](/hexblog/imgs/210331/07.jpg)

#### 2.2 term精确匹配

根据field进行value匹配，忽略大小写;

查询语法，形如:   `{"query": {"term": {"成员名": {"value": "查询值"}}}}`

- `query`, `term`, `value` 三个key为固定值
- `成员名`: 为待查询的成员
- `查询值`: 需要匹配的值

(说明：后面语法中，中文的都是需要替换的，英文的为固定值)

```bash
GET first-index/_search
{
  "query": {
    "term": {
      "user.id": {
        "value": "yihui"
      }
    }
  }
}
```

![](/hexblog/imgs/210331/08.jpg)



当value不匹配，或者查询的field不存在，则查不到的对应的信息，如

![](/hexblog/imgs/210331/09.jpg)



#### 2.3 terms 多值匹配

term表示value的精确匹配，如果我希望类似`value in (xxx)`的查询，则可以使用terms

语法:

```json
{
	"query": {
		"terms": {
			"成员名": [成员值, 成员值]
		}
	}
}
```

实例如

```bash
GET first-index/_search
{
  "query": {
    "terms": {
      "user.id": ["yihui", "erhui"]
    }
  }
}
```

![](/hexblog/imgs/210331/10.jpg)



#### 2.4 range 范围匹配

适用于数值、日期的比较查询，如常见的 >, >=, <, <=

查询语法

```json
{
	"query": {
        "range": {
            "成员名": {
                "gte": "查询下界" ,
                "lte": "查询下界"
            }
        }
	}
}
```

| 范围操作符 | 说明        |
| ---------- | ----------- |
| `gt`       | 大于 >      |
| `gte`      | 大于等于 >= |
| `lt`       | 小于 <      |
| `lte`      | 小于等于 <= |

实例如下

```bash
GET first-index/_search
{
  "query": {
    "range": {
      "age": {
        "gte": 10,
        "lte": 18
      }
    }
  }
}
```

![](/hexblog/imgs/210331/11.jpg)


#### 2.5 字段过滤

根据是否包含某个字段来查询， 主要有两个 `exists` 表示要求存在， `missing`表示要求不存在

查询语法

```json
{
    "query": {
        "exists/missing": {
            "field": "字段值"
        }
    }
}
```

实例如下

```bash
GET first-index/_search
{
  "query": {
    "exists": {
      "field": "age"
    }
  }
}
```

![](/hexblog/imgs/210331/12.jpg)


#### 2.6 组合查询

上面都是单个查询条件，单我们需要多个查询条件组合使用时，可以使用`bool + must/must_not/should`来实现

查询语法

```json
{
    "query": {
        "bool": {
            "must": [ # 相当于and查询
                "查询条件1",
                "查询条件2"
            ],
            "must_not": [ # 多个查询条件相反匹配，相当与not
                ...
            ],
            "should": [ # 有一个匹配即可， 相当于or
                ...
            ]
        }
    }
}
```

实例如下

```bash
## user.id = yihui and age < 20
GET first-index/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "user.id": {
              "value": "yihui"
            }
          }
        },
        {
          "range": {
            "age": {
              "lt": 20
            }
          }
        }
      ] 
    }
  }
}

# !(user.id) = yihui and !(age>20)
GET first-index/_search
{
  "query": {
    "bool": {
      "must_not": [
        {
          "term": {
            "user.id": {
              "value": "yihui"
            }
          }
        },
        {
          "range": {
            "age": {
              "gt": 20
            }
          }
        }
      ] 
    }
  }
}

# user.id = 'yihui' or age>20
GET first-index/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "term": {
            "user.id": {
              "value": "yihui"
            }
          }
        },
        {
          "range": {
            "age": {
              "gt": 20
            }
          }
        }
      ] 
    }
  }
}
```

下面截图以 must_not 输出示意

![](/hexblog/imgs/210331/13.jpg)

**说明**

- 前面根据字段查询 `existing` 只能单个匹配，可以借助这里的组合来实现多个的判断

#### 2.7 match查询

最大的特点是它更适用于模糊查询，比如查询某个field中的字段匹配

语法

```json
{
    "query": {
        "match": {
            "字段名": "查询值"
        }
    }
}
```

举例说明

```bash
GET first-index/_search
{
  "query": {
    "match": {
      "user.name": "灰og"
    }
  }
}
```

![](/hexblog/imgs/210331/14.jpg)

**说明，如果有精确查询的需求，使用前面的term，可以缓存结果**

#### 2.8 multi_match查询

> 更多相关信息，可以查看: [官网-multi_match查询](https://www.elastic.co/guide/cn/elasticsearch/guide/current/multi-match-query.html)

多个字段中进行查询

语法

- type: `best_fields` 、 `most_fields` 和 `cross_fields` （最佳字段、多数字段、跨字段）
- **最佳字段** ：当搜索词语具体概念的时候，比如 “brown fox” ，词组比各自独立的单词更有意义
- **多数字段**：为了对相关度进行微调，常用的一个技术就是将相同的数据索引到不同的字段，它们各自具有独立的分析链。
- **混合字段**：对于某些实体，我们需要在多个字段中确定其信息，单个字段都只能作为整体的一部分

```json
{
    "query": {
        "multi_match": {
            "query":                "Quick brown fox",
            "type":                 "best_fields", 
            "fields":               [ "title", "body" ],
            "tie_breaker":          0.3,
            "minimum_should_match": "30%" 
        }
    }
}
```

实例演示

```bash
GET first-index/_search
{
  "query": {
    "multi_match": {
      "query": "汉",
      "fields": ["user.id", "addr.city"]
    }
  }
}
```

![](/hexblog/imgs/210331/15.jpg)


上面除了写上精确的字段之外，还支持模糊匹配，比如所有字段中进行匹配

```bash
GET first-index/_search
{
  "query": {
    "multi_match": {
      "query": "blog",
      "fields": ["*"]
    }
  }
}
```

#### 2.9 wildcard查询

shell统配符

- `?`: 0/1个字符
- `*`: 0/n个字符

```
GET first-index/_search
{
  "query": {
    "wildcard": {
      "user.id": {
        "value": "*Hu?"
      }
    }
  }
}
```

**说明，对中文可能有问题**

#### 2.10 regexp查询

正则匹配

```bash
GET first-index/_search
{
  "query": {
    "regexp": {
      "user.name": ".*log"
    }
  }
}
```



#### 2.11 prefix查询

前缀匹配

```bash
GET first-index/_search
{
  "query": {
    "prefix": {
      "user.name": "一"
    }
  }
}
```

#### 2.12 排序

查询结果排序，根据sort来指定

```json
{
	"sort": [
        {
          "成员变量": {
            "order": "desc"
          }
        }
  	]
}
```

实例如下

```bash
GET first-index/_search
{
  "query":{
    "match_all": {}
  },
  "sort": [
    {
      "@timestamp": {
        "order": "desc"
      }
    }
  ]
}
```

#### 2.13 更多

更多操作姿势，可以在官方文档上获取

[官方教程](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)

### 3. 删除文档

需要根据文档id进行指定删除

```
DELETE first-index/_doc/gPYLh3gBF9fSFsHNEe58
```

![](/hexblog/imgs/210331/16.jpg)

删除成功

![](/hexblog/imgs/210331/17.jpg)

### 4.更新文档

#### 4.1 覆盖更新

使用PUT来实现更新，同样通过id进行

- 覆盖更新
- version版本会+1
- 如果id对应的文档不存在，则新增

```bash
PUT first-index/_doc/f_ZFhngBF9fSFsHNte7f
{
  "age": 28
}
```

![](/hexblog/imgs/210331/18.jpg)

#### 4.2 增量更新

采用POST来实现增量更新

- field 存在，则更新
- field不存在，则新增

```bash
POST first-index/_update/gvarh3gBF9fSFsHNuO49
{
  "doc": {
    "age": 25
  }
}
```

![](/hexblog/imgs/210331/19.jpg)

此外还可以采用script脚本更新

- 在原来的age基础上 + 5

```bash
POST first-index/_update/gvarh3gBF9fSFsHNuO49
{
  "script": "ctx._source.age += 5"
}
```


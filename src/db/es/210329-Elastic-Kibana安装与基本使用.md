---
order: 2
title: 2. Elastic & Kibana安装与基本使用
tag:
  - ElasticSearch
category:
  - 开源
  - ElasticSearch
date: 2021-03-29 18:49:05
keywords: elasticsearch kibana 搜索 ELK ES
---

本文主要介绍es & kibana的安装和基本使用，更多es的相关用法后面逐一补上

<!-- more -->

### 1. elasticsearch安装

linux环境下，直接下载安装包

```bash
 # 下载
 wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.0-linux-x86_64.tar.gz
 
 # 解压
 tar -zxvf elasticsearch-7.12.0-linux-x86_64.tar.gz
```

jvm参数配置

默认es启动，占用的内存太大了，本机测试有必要限制一下

```bash
vim config/jvm.options

## 堆空间，根据实际情况调整
-Xms2g
-Xmx2g
```

启动

```bash
bin/elasticsearch
```

启动完毕之后，会看到控制台有一些输出，日志不打印时，可以输入下面的查询，验证是否ok

```bash
curl -X GET http://localhost:9200/
```



### 2. kibana安装

同样linux环境下，直接下载tar包解压使用

```bash
wget https://artifacts.elastic.co/downloads/kibana/kibana-7.12.0-linux-x86_64.tar.gz

tar -zxvf kibana-7.12.0-linux-x86_64.tar.gz
```

参数配置

```yml
vim config/kibana.yml

# 端口
server.port: 5601

# es 地址
elasticsearch.hosts: ["http://localhost:9200"]

# 指定索引名
kibana.index: ".kibana"
```

启动

```bash
bin/kibana
```

访问

```
http://localhost:5601/app/home
```

### 3. Dev Tools 实现es基本操作

借助kibana来做一些es的基本操作，如添加文档，查询等

打开url: http://localhost:5601/app/dev_tools#/console

**添加文档**

```text
POST my-index-000001/_doc
{
  "@timestamp": "2021-03-29T10:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy",
    "name": "YiHui"
  },
  "hobby": [
    "java",
    "python"
  ]
}
```





![](/hexblog/imgs/210329/00.jpg)

**查询所有**

```text
POST my-index-000001/_search
{
  "query": {
    "match_all": {
      
    }
  }
}
```



![](/hexblog/imgs/210329/01.jpg)



精确查询

```text
POST my-index-000001/_search
{
  "query": {
    "match": {
      "user.name": "YiHui"
    }
  }
}
```



![](/hexblog/imgs/210329/02.jpg)



删除索引

```text
DELETE my-index-000001
```



![](/hexblog/imgs/210329/03.jpg)


---
order: 1
title: 1. Centos 安装ElasticSearch
tag:
  - Shell
  - ElasticSearch
category:
  - 开源
  - ElasticSearch
date: 2020-06-05 17:24:44
keywords: ElasticSearch solr 搜索 环境安装
---

本文记录`Centos 7.5` 安装 `ElasticSearch 6.8.5` 版本的全过程

<!-- more -->

### 1. ES安装流程

> es的运行依赖jdk，所以需要先安装好java环境，我们这里用的jdk1.8，这里不额外说明jdk环境的安装流程

#### a. 下载

首先到目标网站，查询需要下载的版本 : [https://www.elastic.co/cn/downloads/past-releases#elasticsearch](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)

本文选择`6.8.5`（主要是为了和`SpringBoot 2.2.0-RELEASE`对上）

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.8.5.tar.gz
```

#### b. 解压启动

下载完之后，直接解压，并进入目录，

```bash
unzip elasticsearch-6.8.5.tar.gz
cd elasticsearch-6.8.5
```

修改配置，指定数据存储和日志路径，支持外部访问

```bash
vim conf/elasticsearch.yml

# 请确保下面两个目录存在，且拥有访问权限
path.data: /data/es/data
path.logs: /data/es/logs

# 本机ip
network.host: 192.168.0.174
```

#### c. 启动测试

直接运行bin目录下的`elasticsearch`即可启动es，当然也可以以后台方式启动

```bash
vim starth.sh

nohup bin/elasticsearch 1> /dev/null 2>&1 &
echo $! 1> pid.log

# 执行starth.sh脚本，运行
sh start.sh
```

本机访问:

```bash
curl http://192.168.0.174:9200/

{
  "name" : "ZyI14BD",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "YYFtAHGOSS6ijjDf4VuDoA",
  "version" : {
    "number" : "6.8.4",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "bca0c8d",
    "build_date" : "2019-10-16T06:19:49.319352Z",
    "build_snapshot" : false,
    "lucene_version" : "7.7.2",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```


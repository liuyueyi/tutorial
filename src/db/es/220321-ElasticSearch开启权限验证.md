---
order: 7
title: 7. 开启权限验证
tag:
  - ElasticSearch
category:
  - 开源
  - ElasticSearch
date: 2022-03-21 20:04:31
keywords:
  - ElasticSearch
  - Elastic
  - 搜索引擎
  - ES
  - Solr
---

为了保证es的安全性，一般来讲我们会对es集群开启权限验证，下面将简单记录一下如何开启Basic Auth验证

<!-- more -->

修改配置文件 `config/elasticsearch.yml`，添加下面的配置

```yaml
xpack.security.enabled: true
xpack.security.authc.accept_default_password: false
```

启动es服务

```bash
bin/elasticsearch
```

生成密码

```bash
# 执行完毕之后输入密码， 比如测试的密码都是 test123 (生产环境不要这么干)
bin/elasticsearch-setup-passwords interactive
```

es的交互，主要使用 `Basic Auth` 方式进行身份校验，简单来讲，就是在请求头中，添加

```bash
Authorization: Basic ZWxhc3RpYzp0ZXN0MTIz
```



## 一灰灰的联系方式 

尽信书则不如无书，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激

- 个人站点：[https://blog.hhui.top](https://blog.hhui.top)
- 微博地址: [小灰灰Blog](https://weibo.com/p/1005052169825577/home)
- QQ： 一灰灰/3302797840
- 微信公众号：**一灰灰blog**

![QrCode](https://spring.hhui.top/spring-blog/imgs/info/info.png)

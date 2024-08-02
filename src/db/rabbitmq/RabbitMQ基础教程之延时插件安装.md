---
order: 8
title: 8. 延时插件安装
tag:
  - RabbitMQ
category:
  - 开源
  - RabbitMQ
date: 2020-10-16 15:32:27
keywords: rabbitmq 延时队列
---

源码: [https://github.com/rabbitmq/rabbitmq-delayed-message-exchange](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange)

下载二进制的插件，如3.8.0下载地址: [https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/tag/v3.8.0](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/tag/v3.8.0)

将下载的`ez`包，放在插件目录下，一般centos的查检目录放在`/usr/lib/rabbitmq/lib/rabbitmq_server-xxx/plugins`

如果不知道具体在什么地方，可以通过进程查看

![](/hexblog/imgs/201021/00.jpg)

拷贝完毕之后，启用插件

```bash
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

接着重启一下rabbit

```bash
service rabbit-server restart
```

<!-- more -->

再控制台中，查看是否安装成功

![](/hexblog/imgs/201021/01.jpg)

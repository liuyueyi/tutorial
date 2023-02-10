---
order: 1
title: 1.基础使用介绍
tag: 
  - ZooKeeper
category: 
  - SpringBoot
  - 中间件
  - ZooKeeper
date: 2021-04-14 22:45:21
keywords: springboot ZooKeeper 分布式
---

ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务，广泛应用于分布式系统中，比如有用它做配置中心，注册中心，也有使用它来实现分布式锁的，作为高并发技术栈中不可或缺的一个基础组件，接下来我们将看一下，zk应该怎么玩，可以怎么玩

本文作为第一篇，将主要介绍基于zk-client的基本使用姿势，以次来了解下zk的基本概念

<!-- more -->

## I. 准备

### 1. zk环境安装

用于学习试点目的的体验zk功能，安装比较简单，可以参考博文: [210310-ZooKeeper安装及初体验](https://blog.hhui.top/hexblog/2021/03/10/210310-ZooKeeper%E5%AE%89%E8%A3%85%E5%8F%8A%E5%88%9D%E4%BD%93%E9%AA%8C/)

```bash
wget https://mirrors.bfsu.edu.cn/apache/zookeeper/zookeeper-3.6.2/apache-zookeeper-3.6.2-bin.tar.gz
tar -zxvf apache-zookeeper-3.6.2-bin.tar.gz
cd apache-zookeeper-3.6.2-bin

# 前台启动
bin/zkServer.sh start-foreground
```

### 2. 项目环境

本文演示的是直接使用apache的zookeeper包来操作zk，与是否是SpringBoot环境无关

核心依赖

```xml
<!-- https://mvnrepository.com/artifact/org.apache.zookeeper/zookeeper -->
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.7.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

版本说明:

- zk: 3.6.2
- SpringBoot: 2.2.1.RELEASE


## II. ZK使用姿势

### 1. zk基本知识点

首先介绍下zk的几个主要的知识点，如zk的数据模型，四种常说的节点

#### 1.1 数据模型

zk的数据模型和我们常见的目录树很像，从`/`开始，每一个层级就是一个节点

每个节点，包含数据 + 子节点

注意：EPHEMERAL节点，不能有子节点（可以理解为这个目录下不能再挂目录）

zk中常说的监听器，就是基于节点的，一般来讲监听节点的创建、删除、数据变更

#### 1.2 节点

- 持久节点 persistent node
- 持久顺序节点 persistent sequental
- 临时节点 ephemeral node
- 临时顺序节点 ephemeral sequental

**注意：**

- 节点类型一经指定，不允许修改
- 临时节点，当会话结束，会自动删除，且不能有子节点


### 2. 节点创建

接下来我们看一下zk的使用姿势，首先是创建节点，当然创建前提是得先拿到zkClient

初始化连接

```java
private ZooKeeper zooKeeper;

@PostConstruct
public void initZk() throws IOException {
    // 500s 的会话超时时间
    zooKeeper = new ZooKeeper("127.0.0.1:2181", 500_000, this);
}
```

节点创建方法，下面分别给出两种不同的case

```java
@Service
public class NodeExample implements Watcher {
    /**
     * 创建节点
     *
     * @param path
     */
    private void nodeCreate(String path) {
        // 第三个参数ACL 表示访问控制权限
        // 第四个参数，控制创建的是持久节点，持久顺序节点，还是临时节点；临时顺序节点
        // 返回 the actual path of the created node
        // 单节点存在时，抛异常 KeeperException.NodeExists
        try {
            String node = zooKeeper.create(path + "/yes", "保存的数据".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
            System.out.println("create node: " + node);
        } catch (KeeperException.NodeExistsException e) {
            // 节点存在
            System.out.println("节点已存在: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 带生命周期的节点
        try {
            Stat stat = new Stat();
            // 当这个节点上没有child，且1s内没有变动，则删除节点
            // 实测抛了异常，未知原因
            String node = zooKeeper.create(path + "/ttl", ("now: " + LocalDateTime.now()).getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT_WITH_TTL, stat, 1000);
            System.out.println("ttl nod:" + node + " | " + stat);
            // 创建已给监听器来验证
            zooKeeper.exists(path + "/ttl", (e) -> {
                System.out.println("ttl 节点变更: " + e);
            });
        } catch (KeeperException.NodeExistsException e) {
            System.out.println("节点已存在: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

节点创建，核心在于 `zooKeeper.create(path + "/yes", "保存的数据".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);`

- 当节点已存在时，再创建会抛异常 `KeeperException.NodeExistsException`
- 最后一个参数，来决定我们创建的节点类型
- todo: 上面实例中在指定ttl时，没有成功，暂未找到原因，待解决


### 3. 节点存在判断

判断节点是否存在，比较常见了（比如我们在创建之前，可能会先判断一下是否存在）

```java
/**
 * 判断节点是否存在
 */
private void checkPathExist(String path) {
    try {
        // 节点存在，则返回stat对象； 不存在时，返回null
        // watch: true 表示给这个节点添加监听器，当节点出现创建/删除 或者 新增数据时，触发watcher回调
        Stat stat = zooKeeper.exists(path + "/no", false);
        System.out.println("NoStat: " + stat);
    } catch (Exception e) {
        e.printStackTrace();
    }

    try {
        // 判断节点是否存在，并监听 节点的创建 + 删除 + 数据变更
        // 注意这个事件监听，只会触发一次，即单这个节点数据变更多次，只有第一次能拿到，之后的变动，需要重新再注册监听
        Stat stat = zooKeeper.exists(path + "/yes", this);
        System.out.println("YesStat: " + stat);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

**注意**

核心用法： `zooKeeper.exists(path + "/yes", this);`

- 当节点存在时，返回Stat对象，包含一些基本信息；如果不存在，则返回null
- 第二个参数，传入的是事件回调对象，我们的测试类`NodeExmaple` 实现了接口 `Watcher`， 所以直接传的是`this`
- 注册事件监听时，需要注意这个回调只会执行一次，即触发之后就没了；后面再次修改、删除、创建节点都不会再被接收到

### 4. 子节点获取

获取某个节点的所有子节点，这里返回的是当前节点的一级子节点

```java
/**
 * 获取节点的所有子节点, 只能获取一级节点
 *
 * @param path
 */
private void nodeChildren(String path) {
    try {
        // 如果获取成功，会监听 当前节点的删除，子节点的创建和删除，触发回调事件, 这个回调也只会触发一次
        List<String> children = zooKeeper.getChildren(path, this, new Stat());
        System.out.println("path:" + path + " 's children:" + children);
    } catch (KeeperException e) {
        System.out.println(e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### 5. 数据获取与修改

节点上是可以存储数据的，在创建的时候，可以加上数据；后期可以读取，也可以修改

```java
/**
 * 设置数据，获取数据
 *
 * @param path
 */
public void dataChange(String path) {
    try {
        Stat stat = new Stat();
        byte[] data = zooKeeper.getData(path, false, stat);
        System.out.println("path: " + path + " data: " + new String(data) + " : " + stat);

        // 根据版本精确匹配; version = -1 就不需要进行版本匹配了
        Stat newStat = zooKeeper.setData(path, ("new data" + LocalDateTime.now()).getBytes(), stat.getVersion());
        System.out.println("newStat: " + stat.getVersion() + "/" + newStat.getVersion() + " data: " + new String(zooKeeper.getData(path, false, stat)));
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

在设置数据时，可以指定版本，当version > 0时，表示根据版本精确匹配；如果为-1时，则只要节点路径对上就成

### 6. 事件监听

监听主要是针对节点而言，前面在判断节点是否存在、修改数据时都可以设置监听器，但是他们是一次性的，如果我们希望长久有效，则可以使用下面的`addWatch`

```java
public void watchEvent(String path) {
    try {
        // 注意这个节点存在
        // 添加监听, 与 exist判断节点是否存在时添加的监听器 不同的在于，触发之后，依然有效还会被触发， 只有手动调用remove才会取消
        // 感知： 节点创建，删除，数据变更 ； 创建子节点，删除子节点
        // 无法感知： 子节点的子节点创建/删除， 子节点的数据变更
        zooKeeper.addWatch(path + "/yes", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("事件触发 on " + path + " event:" + event);
            }
        }, AddWatchMode.PERSISTENT);
    } catch (Exception e) {
        e.printStackTrace();
    }

    try {
        // 注意这个节点不存在
        // 添加监听, 与 exist 不同的在于，触发之后，依然有效还会被触发， 只有手动调用remove才会取消
        // 与前面的区别在于，它的子节点的变动也会被监听到
        zooKeeper.addWatch(path + "/no", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("事件触发 on " + path + " event:" + event);
            }
        }, AddWatchMode.PERSISTENT_RECURSIVE);
    } catch (Exception e) {
        e.printStackTrace();
    }

    // 移除所有的监听
    //zooKeeper.removeAllWatches(path, WatcherType.Any, true);
}
```

上面给出了两种case，

- AddWatchMode.PERSISTENT： 表示只关心当前节点的删除、数据变更，创建，一级子节点的创建、删除；无法感知子节点的子节点创建、删除，无法感知子节点的数据变更
- AddWatchMode.PERSISTENT_RECURSIVE: 相当于递归监听，改节点及其子节点的所有变更都监听

### 7. 节点删除

最后再介绍一个基本功能，节点删除，只有子节点都不存在时，才能删除当前节点（和linux的rmdir类似）

```java
/**
 * 删除节点
 */
public void deleteNode(String path) {
    try {
        // 根据版本限定删除， -1 表示不需要管版本，path匹配就可以执行；否则需要版本匹配，不然就会抛异常
        zooKeeper.delete(path, -1);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### 8. 小结

本文主要介绍的是java侧对zookeeper的基本操作姿势，可以算是zk的入门，了解下节点的增删改，事件监听；

当然一般更加推荐的是使用Curator来操作zk，相比较于apache的jar包，使用姿势更加顺滑，后面也会做对比介绍


## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目源码: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/410-zookeeper-basic](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/410-zookeeper-basic)


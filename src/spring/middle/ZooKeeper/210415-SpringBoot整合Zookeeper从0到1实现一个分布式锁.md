---
order: 2
title: 2.从0到1实现一个分布式锁
tag: 
  - ZooKeeper
  - 分布式锁
category: 
  - SpringBoot
  - 中间件
  - ZooKeeper
date: 2021-04-15 20:18:26
keywords: ZooKeeper 分布式锁
---

分布式锁，在实际的业务使用场景中算是比较常用的了，而分布式锁的实现，常见的除了redis之外，就是zk的实现了，前面一篇博文介绍了zk的基本概念与使用姿势，那么如果让我们来记住zk的特性来设计一个分布式锁，可以怎么做呢?

<!-- more -->

## I. 方案设计

### 1. 创建节点方式实现

zk有四种节点，一个最容易想到的策略就是创建节点，谁创建成功了，就表示谁持有了这个锁

这个思路与redis的`setnx`有点相似，因为zk的节点创建，也只会有一个会话会创建成功，其他的则会抛已存在的异常

借助临时节点，会话丢掉之后节点删除，这样可以避免持有锁的实例异常而没有主动释放导致所有实例都无法持有锁的问题


如果采用这种方案，如果我想实现阻塞获取锁的逻辑，那么其中一个方案就需要写一个while(true)来不断重试

```java
while(true) {
    if (tryLock(xxx)) return true;
    else Thread.sleep(1000);
}
```

另外一个策略则是借助事件监听，当节点存在时，注册一个节点删除的触发器，这样就不需要我自己重试判断了；充分借助zk的特性来实现异步回调

```java
public void lock() {
  if (tryLock(path,  new Watcher() {
        @Override
        public void process(WatchedEvent event) {
            synchronized (path){
                path.notify();
            }
        }
    })) {
      return true;
  }

  synchronized (path) {
      path.wait();
  }
}
```

那么上面这个实现有什么问题呢？

每次节点的变更，那么所有的都会监听到变动，好处是非公平锁的支持；缺点就是剩下这些唤醒的实例中也只会有一个抢占到锁，无意义的唤醒浪费性能

### 2. 临时顺序节点方式

接下来这种方案更加常见，晚上大部分的教程也是这种case，主要思路就是创建临时顺序节点

只有序号最小的节点，才表示抢占锁成功；如果不是最小的节点，那么就监听它前面一个节点的删除事件，前面节点删除了，一种可能是他放弃抢锁，一种是他释放自己持有的锁，不论哪种情况，对我而言，我都需要捞一下所有的节点，要么拿锁成功；要么换一个前置节点

## II.分布式锁实现

接下来我们来一步步看下，基于临时顺序节点，可以怎么实现分布式锁

对于zk，我们依然采用apache的提供的包 `zookeeper`来操作；后续提供`Curator`的分布式锁实例

### 1. 依赖

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

- zk版本: 3.6.2
- SpringBoot: 2.2.1.RELEASE

### 2. 简单的分布式锁

第一步，都是实例创建

```java
public class ZkLock implements Watcher {

    private ZooKeeper zooKeeper;
    // 创建一个持久的节点，作为分布式锁的根目录
    private String root;

    public ZkLock(String root) throws IOException {
        try {
            this.root = root;
            zooKeeper = new ZooKeeper("127.0.0.1:2181", 500_000, this);
            Stat stat = zooKeeper.exists(root, false);
            if (stat == null) {
                // 不存在则创建
                createNode(root, true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    
    // 简单的封装节点创建，这里只考虑持久 + 临时顺序
    private String createNode(String path, boolean persistent) throws Exception {
        return zooKeeper.create(path, "0".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, persistent ? CreateMode.PERSISTENT : CreateMode.EPHEMERAL_SEQUENTIAL);
    }
}
```

在我们的这个设计中，我们需要持有当前节点和监听前一个节点的变更，所以我们在ZkLock实例中，添加两个成员

```java
/**
 * 当前节点
 */
private String current;

/**
 * 前一个节点
 */
private String pre;
```

接下来就是尝试获取锁的逻辑

- current不存在，在表示没有创建过，就创建一个临时顺序节点，并赋值current
- current存在，则表示之前已经创建过了，目前处于等待锁释放过程
- 接下来根据当前节点顺序是否最小，来表明是否持有锁成功
- 当顺序不是最小时，找前面那个节点，并赋值 pre；
- 监听pre的变化

```java
/**
 * 尝试获取锁，创建顺序临时节点，若数据最小，则表示抢占锁成功；否则失败
 *
 * @return
 */
public boolean tryLock() {
    try {
        String path = root + "/";
        if (current == null) {
            // 创建临时顺序节点
            current = createNode(path, false);
        }
        List<String> list = zooKeeper.getChildren(root, false);
        Collections.sort(list);

        if (current.equalsIgnoreCase(path + list.get(0))) {
            // 获取锁成功
            return true;
        } else {
            // 获取锁失败，找到前一个节点
            int index = Collections.binarySearch(list, current.substring(path.length()));
            // 查询当前节点前面的那个
            pre = path + list.get(index - 1);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}
```

请注意上面的实现，这里并没有去监听前一个节点的变更，在设计`tryLock`，因为是立马返回成功or失败，所以使用这个接口的，不需要注册监听

我们的监听逻辑，放在 `lock()` 同步阻塞里面

- 尝试抢占锁，成功则直接返回
- 拿锁失败，则监听前一个节点的删除事件

```java
public boolean lock() {
    if (tryLock()) {
        return true;
    }

    try {
        // 监听前一个节点的删除事件
        Stat state = zooKeeper.exists(pre, true);
        if (state != null) {
            synchronized (pre) {
                // 阻塞等待前面的节点释放
                pre.wait();
                // 这里不直接返回true，因为前面的一个节点删除，可能并不是因为它持有锁并释放锁，如果是因为这个会话中断导致临时节点删除，这个时候需要做的是换一下监听的 preNode
                return lock();
            }
        } else {
          // 不存在，则再次尝试拿锁
          return lock();
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}

```

**注意：**

- 当节点不存在时，或者事件触发回调之后，重新调用`lock()`，表明我胡汉三又来竞争锁了？

为啥不是直接返回 true? 而是需要重新竞争呢？

- 因为前面节点的删除，有可能是因为前面节点的会话中断导致的；但是锁还在另外的实例手中，这个时候我应该做的是重新排队


最后别忘了释放锁

```java
public void unlock() {
    try {
        zooKeeper.delete(current, -1);
        current = null;
        zooKeeper.close();
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```


到此，我们的分布式锁就完成了，接下来我们复盘下实现过程

- 所有知识点来自前一篇的zk基础使用（创建节点，删除节点，获取所有自己点，监听事件）
- 抢锁过程 =》 创建序号最小的节点
- 若节点不是最小的，那么就监听前面的节点删除事件

这个实现，支持了锁的重入（why? 因为锁未释放时，我们保存了current，当前节点存在时则直接判断是不是最小的；而不是重新创建）

### 3. 测试

最后写一个测试case，来看下

```java
@SpringBootApplication
public class Application {

    private void tryLock(long time) {
        ZkLock zkLock = null;
        try {
            zkLock = new ZkLock("/lock");
            System.out.println("尝试获取锁: " + Thread.currentThread() + " at: " + LocalDateTime.now());
            boolean ans = zkLock.lock();
            System.out.println("执行业务逻辑:" + Thread.currentThread() + " at:" + LocalDateTime.now());
            Thread.sleep(time);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (zkLock != null) {
                zkLock.unlock();
            }
        }
    }

    public Application() throws IOException, InterruptedException {
        new Thread(() -> tryLock(10_000)).start();

        Thread.sleep(1000);
        // 获取锁到执行锁会有10s的间隔，因为上面的线程抢占到锁，并持有了10s
        new Thread(() -> tryLock(1_000)).start();
        System.out.println("---------over------------");

        Scanner scanner = new Scanner(System.in);
        String ans = scanner.next();
        System.out.println("---> over --->" + ans);
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }

}
```

输出结果如下

![](/imgs/210415/00.jpg)

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/411-zookeeper-distributelock](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/411-zookeeper-distributelock)


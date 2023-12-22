---
order: 6
title: 6.如何利用雪花算法生成分布式ID
tag:
  - Snowflake
category:
  - SpringBoot
  - DB系列
  - 配置
date: 2023-10-26 17:28:47
keywords:
  - 雪花算法
---

系统唯一ID是我们在设计一个系统的时候常常会遇见的问题，比如常见的基于数据库自增主键生成的id，随机生成的uuid，亦或者redis自增的计数器等都属于常见的解决方案；本文我们将会重点看一下业界内大名鼎鼎的雪花算法，是如何实现分布式id的

<!-- more -->

## I. 雪花算法

### 1. 全局唯一id

雪花算法主要是为了解决全局唯一id，那么什么是全局唯一id呢？它应该满足什么属性呢

基本属性：

- 全局唯一性：不能出现重复的 ID 号，既然是唯一标识，这是最基本的要求；
- 趋势递增：在 MySQL InnoDB 引擎中使用的是聚集索引，由于多数 RDBMS 使用 B-tree 的数据结构来存储索引数据，在主键的选择上面我们应该尽量使用有序的主键保证写入性能；
- 单调递增：保证下一个 ID 一定大于上一个 ID，例如事务版本号、IM 增量消息、排序等特殊需求；
- 信息安全：如果 ID 是连续的，恶意用户的爬取工作就非常容易做了，直接按照顺序下载指定 URL 即可；如果是订单号就更危险了，竞争对手可以直接知道我们一天的单量。所以在一些应用场景下，会需要 ID 无规则、不规则。

### 2. 雪花算法

雪花算法可以说是业界内生成全局唯一id的经典算法，其基本原理也比较简单

![](/tutorial/imgs/231026/00.jpg)

Snowflake 以 64 bit 来存储组成 ID 的4 个部分：

1. 最高位占1 bit，值固定为 0，以保证生成的 ID 为正数；
2. 中位占 41 bit，值为毫秒级时间戳；
3. 中下位占 10 bit，值为机器标识id，值的上限为 1024；
4. 末位占 12 bit，值为当前毫秒内生成的不同的自增序列，值的上限为 4096；

从上面的结构设计来看，雪花算法的实现可以说比较清晰了，我们重点看一下它的缺陷

1. 时钟回拨问题：由于id的高位依赖于系统的时间戳，因此当服务器时间错乱或者出现时钟回拨，可能导致数据重复
2. 集群规模1024台机器，每1ms单机4096个id最大限制

### 3. 实现与使用

目前雪花算法的实现方式较多，通常也不需要我们进行额外开发，如直接Hutool的`Snowflake`

看下它的核心实现

```java
public class Snowflake implements Serializable {
  private static final long serialVersionUID = 1L;


  /**
   * 默认的起始时间，为Thu, 04 Nov 2010 01:42:54 GMT
   */
  public static long DEFAULT_TWEPOCH = 1288834974657L;
  /**
   * 默认回拨时间，2S
   */
  public static long DEFAULT_TIME_OFFSET = 2000L;

  private static final long WORKER_ID_BITS = 5L;
  // 最大支持机器节点数0~31，一共32个
  @SuppressWarnings({"PointlessBitwiseExpression", "FieldCanBeLocal"})
  private static final long MAX_WORKER_ID = -1L ^ (-1L << WORKER_ID_BITS);
  private static final long DATA_CENTER_ID_BITS = 5L;
  // 最大支持数据中心节点数0~31，一共32个
  @SuppressWarnings({"PointlessBitwiseExpression", "FieldCanBeLocal"})
  private static final long MAX_DATA_CENTER_ID = -1L ^ (-1L << DATA_CENTER_ID_BITS);
  // 序列号12位（表示只允许workId的范围为：0-4095）
  private static final long SEQUENCE_BITS = 12L;
  // 机器节点左移12位
  private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;
  // 数据中心节点左移17位
  private static final long DATA_CENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
  // 时间毫秒数左移22位
  private static final long TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATA_CENTER_ID_BITS;
  // 序列掩码，用于限定序列最大值不能超过4095
  private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);// 4095

  /**
   * 初始化时间点
   */
  private final long twepoch;
  private final long workerId;
  private final long dataCenterId;
  private final boolean useSystemClock;
  /**
   * 允许的时钟回拨毫秒数
   */
  private final long timeOffset;
  /**
   * 当在低频模式下时，序号始终为0，导致生成ID始终为偶数<br>
   * 此属性用于限定一个随机上限，在不同毫秒下生成序号时，给定一个随机数，避免偶数问题。<br>
   * 注意次数必须小于{@link #SEQUENCE_MASK}，{@code 0}表示不使用随机数。<br>
   * 这个上限不包括值本身。
   */
  private final long randomSequenceLimit;

  /**
   * 自增序号，当高频模式下时，同一毫秒内生成N个ID，则这个序号在同一毫秒下，自增以避免ID重复。
   */
  private long sequence = 0L;
  private long lastTimestamp = -1L;

  /**
   * 构造，使用自动生成的工作节点ID和数据中心ID
   */
  public Snowflake() {
    this(IdUtil.getWorkerId(IdUtil.getDataCenterId(MAX_DATA_CENTER_ID), MAX_WORKER_ID));
  }

  /**
   * 构造
   *
   * @param workerId 终端ID
   */
  public Snowflake(long workerId) {
    this(workerId, IdUtil.getDataCenterId(MAX_DATA_CENTER_ID));
  }

  /**
   * 构造
   *
   * @param workerId     终端ID
   * @param dataCenterId 数据中心ID
   */
  public Snowflake(long workerId, long dataCenterId) {
    this(workerId, dataCenterId, false);
  }

  /**
   * 构造
   *
   * @param workerId         终端ID
   * @param dataCenterId     数据中心ID
   * @param isUseSystemClock 是否使用{@link SystemClock} 获取当前时间戳
   */
  public Snowflake(long workerId, long dataCenterId, boolean isUseSystemClock) {
    this(null, workerId, dataCenterId, isUseSystemClock);
  }

  /**
   * @param epochDate        初始化时间起点（null表示默认起始日期）,后期修改会导致id重复,如果要修改连workerId dataCenterId，慎用
   * @param workerId         工作机器节点id
   * @param dataCenterId     数据中心id
   * @param isUseSystemClock 是否使用{@link SystemClock} 获取当前时间戳
   * @since 5.1.3
   */
  public Snowflake(Date epochDate, long workerId, long dataCenterId, boolean isUseSystemClock) {
    this(epochDate, workerId, dataCenterId, isUseSystemClock, DEFAULT_TIME_OFFSET);
  }

  /**
   * @param epochDate        初始化时间起点（null表示默认起始日期）,后期修改会导致id重复,如果要修改连workerId dataCenterId，慎用
   * @param workerId         工作机器节点id
   * @param dataCenterId     数据中心id
   * @param isUseSystemClock 是否使用{@link SystemClock} 获取当前时间戳
   * @param timeOffset       允许时间回拨的毫秒数
   * @since 5.8.0
   */
  public Snowflake(Date epochDate, long workerId, long dataCenterId, boolean isUseSystemClock, long timeOffset) {
    this(epochDate, workerId, dataCenterId, isUseSystemClock, timeOffset, 0);
  }

  /**
   * @param epochDate           初始化时间起点（null表示默认起始日期）,后期修改会导致id重复,如果要修改连workerId dataCenterId，慎用
   * @param workerId            工作机器节点id
   * @param dataCenterId        数据中心id
   * @param isUseSystemClock    是否使用{@link SystemClock} 获取当前时间戳
   * @param timeOffset          允许时间回拨的毫秒数
   * @param randomSequenceLimit 限定一个随机上限，在不同毫秒下生成序号时，给定一个随机数，避免偶数问题，0表示无随机，上限不包括值本身。
   * @since 5.8.0
   */
  public Snowflake(Date epochDate, long workerId, long dataCenterId,
           boolean isUseSystemClock, long timeOffset, long randomSequenceLimit) {
    this.twepoch = (null != epochDate) ? epochDate.getTime() : DEFAULT_TWEPOCH;
    this.workerId = Assert.checkBetween(workerId, 0, MAX_WORKER_ID);
    this.dataCenterId = Assert.checkBetween(dataCenterId, 0, MAX_DATA_CENTER_ID);
    this.useSystemClock = isUseSystemClock;
    this.timeOffset = timeOffset;
    this.randomSequenceLimit = Assert.checkBetween(randomSequenceLimit, 0, SEQUENCE_MASK);
  }

  /**
   * 根据Snowflake的ID，获取机器id
   *
   * @param id snowflake算法生成的id
   * @return 所属机器的id
   */
  public long getWorkerId(long id) {
    return id >> WORKER_ID_SHIFT & ~(-1L << WORKER_ID_BITS);
  }

  /**
   * 根据Snowflake的ID，获取数据中心id
   *
   * @param id snowflake算法生成的id
   * @return 所属数据中心
   */
  public long getDataCenterId(long id) {
    return id >> DATA_CENTER_ID_SHIFT & ~(-1L << DATA_CENTER_ID_BITS);
  }

  /**
   * 根据Snowflake的ID，获取生成时间
   *
   * @param id snowflake算法生成的id
   * @return 生成的时间
   */
  public long getGenerateDateTime(long id) {
    return (id >> TIMESTAMP_LEFT_SHIFT & ~(-1L << 41L)) + twepoch;
  }

  /**
   * 下一个ID
   *
   * @return ID
   */
  public synchronized long nextId() {
    long timestamp = genTime();
    if (timestamp < this.lastTimestamp) {
      if (this.lastTimestamp - timestamp < timeOffset) {
        // 容忍指定的回拨，避免NTP校时造成的异常
        timestamp = lastTimestamp;
      } else {
        // 如果服务器时间有问题(时钟后退) 报错。
        throw new IllegalStateException(StrUtil.format("Clock moved backwards. Refusing to generate id for {}ms", lastTimestamp - timestamp));
      }
    }

    if (timestamp == this.lastTimestamp) {
      final long sequence = (this.sequence + 1) & SEQUENCE_MASK;
      if (sequence == 0) {
        timestamp = tilNextMillis(lastTimestamp);
      }
      this.sequence = sequence;
    } else {
      // issue#I51EJY
      if (randomSequenceLimit > 1) {
        sequence = RandomUtil.randomLong(randomSequenceLimit);
      } else {
        sequence = 0L;
      }
    }

    lastTimestamp = timestamp;

    return ((timestamp - twepoch) << TIMESTAMP_LEFT_SHIFT)
        | (dataCenterId << DATA_CENTER_ID_SHIFT)
        | (workerId << WORKER_ID_SHIFT)
        | sequence;
  }

  /**
   * 下一个ID（字符串形式）
   *
   * @return ID 字符串形式
   */
  public String nextIdStr() {
    return Long.toString(nextId());
  }

  // ------------------------------------------------------------------------------------------------------------------------------------ Private method start

  /**
   * 循环等待下一个时间
   *
   * @param lastTimestamp 上次记录的时间
   * @return 下一个时间
   */
  private long tilNextMillis(long lastTimestamp) {
    long timestamp = genTime();
    // 循环直到操作系统时间戳变化
    while (timestamp == lastTimestamp) {
      timestamp = genTime();
    }
    if (timestamp < lastTimestamp) {
      // 如果发现新的时间戳比上次记录的时间戳数值小，说明操作系统时间发生了倒退，报错
      throw new IllegalStateException(
          StrUtil.format("Clock moved backwards. Refusing to generate id for {}ms", lastTimestamp - timestamp));
    }
    return timestamp;
  }

  /**
   * 生成时间戳
   *
   * @return 时间戳
   */
  private long genTime() {
    return this.useSystemClock ? SystemClock.now() : System.currentTimeMillis();
  }
  // ------------------------------------------------------------------------------------------------------------------------------------ Private method end
}
```


关键实现在 `nextId()` 方法内，做了两个保护性兼容

1. 记录上次生成id的时间戳，若当前时间戳小于上次产生的时间戳，则表示出现了时钟回拨，超过一定间隔，则直接抛异常

![](/tutorial/imgs/231026/01.jpg)


2. 当前时间戳生成的id数量超过了4096最大值限制，则等待下一秒

![](/tutorial/imgs/231026/02.jpg)


接下来看一下实际的使用

```java
private static final Date EPOC = new Date(2023, 1, 1);

    private Snowflake snowflake;

    public HuToolSnowFlakeProducer(int workId, int dataCenter) {
        snowflake = new Snowflake(EPOC, workId, dataCenter, false);
    }

    public Long nextId() {
        return snowflake.nextId();
    }

    public static void main(String[] args) throws InterruptedException {
        HuToolSnowFlakeProducer producer = new HuToolSnowFlakeProducer();
        for (int i = 0; i < 20; i++) {
            if (i % 3 == 0) {
                Thread.sleep(2);
            }
            System.out.println(producer.nextId());
        }
    }
}
```

输出如下:

```
1717380884565065728
1717380884565065729
1717380884565065730
1717380884573454336
1717380884573454337
1717380884573454338
1717380884586037248
1717380884586037249
1717380884586037250
1717380884594425856
1717380884594425857
1717380884594425858
1717380884607008768
1717380884607008769
1717380884607008770
1717380884619591680
1717380884619591681
1717380884619591682
1717380884632174592
1717380884632174593
```

- 生成的id：19位
- 单调递增，同一毫秒内，序号+1


### 4. 自定义雪花算法实现

在某些时候我们对雪花算法的实现有一些特殊的定制化场景，比如希望生成的id能一些更具有标识性，如以商城领域的订单数据模型为例

- 第一位：标记订单类型， 1: 普通订单  2: 换货订单  3: 退货订单  4: 退款订单
- 第二三位：标记订单所属年份，如 22xxx，表示22年的订单；23xxx，则表示23年的订单

再比如对订单的长度希望做一些限制,19位太多了，我希望16、7位的长度

再比如我希望调整workerId 与 datacenter之间的分配比例

基于以上等等原因，当我们面对需要修改雪花算法逻辑时，再知晓算法原理的基础上，完全可以自己手撸

```java
@Slf4j
@Component
public class SelfSnowflakeProducer {
    /**
     * 自增序号位数
     */
    private static final long SEQUENCE_BITS = 12L;

    /**
     * 机器位数
     */
    private static final long WORKER_ID_BITS = 7L;
    private static final long DATA_CENTER_BITS = 3L;

    private static final long SEQUENCE_MASK = (1 << SEQUENCE_BITS) - 1;

    private static final long WORKER_ID_LEFT_SHIFT_BITS = SEQUENCE_BITS;
    private static final long DATACENTER_LEFT_SHIFT_BITS = SEQUENCE_BITS + WORKER_ID_BITS;
    private static final long TIMESTAMP_LEFT_SHIFT_BITS = WORKER_ID_LEFT_SHIFT_BITS + WORKER_ID_BITS + DATA_CENTER_BITS;
    /**
     * 机器id (7位）
     */
    private long workId = 1;
    /**
     * 数据中心 (3位)
     */
    private long dataCenter = 1;

    /**
     * 上次的访问时间
     */
    private long lastTime;
    /**
     * 自增序号
     */
    private long sequence;

    private byte sequenceOffset;

    public SelfSnowflakeProducer() {
        List<Integer> list = DevUtil.calculateDefaultInfo(DATA_CENTER_BITS, WORKER_ID_BITS);
        this.dataCenter = list.get(0);
        this.workId = list.get(1);
    }

    public SelfSnowflakeProducer(int workId, int dateCenter) {
        this.workId = workId;
        this.dataCenter = dateCenter;
    }

    /**
     * 生成趋势自增的id
     *
     * @return
     */
    public synchronized Long nextId() {
        long nowTime = waitToIncrDiffIfNeed(getNowTime());
        if (lastTime == nowTime) {
            if (0L == (sequence = (sequence + 1) & SEQUENCE_MASK)) {
                // 表示当前这一时刻的自增数被用完了；等待下一时间点
                nowTime = waitUntilNextTime(nowTime);
            }
        } else {
            // 上一毫秒若以0作为序列号开始值，则这一秒以1为序列号开始值
            vibrateSequenceOffset();
            sequence = sequenceOffset;
        }
        lastTime = nowTime;
        long ans = ((nowTime % 86400) << TIMESTAMP_LEFT_SHIFT_BITS) | (dataCenter << DATACENTER_LEFT_SHIFT_BITS) | (workId << WORKER_ID_LEFT_SHIFT_BITS) | sequence;
        if (log.isDebugEnabled()) {
            log.debug("seconds:{}, datacenter:{}, work:{}, seq:{}, ans={}", nowTime % 86400, dataCenter, workId, sequence, ans);
        }
        return Long.parseLong(String.format("%s%012d", getDaySegment(nowTime), ans));
    }

    /**
     * 若当前时间比上次执行时间要小，则等待时间追上来，避免出现时钟回拨导致的数据重复
     *
     * @param nowTime 当前时间戳
     * @return 返回新的时间戳
     */
    private long waitToIncrDiffIfNeed(final long nowTime) {
        if (lastTime <= nowTime) {
            return nowTime;
        }
        long diff = lastTime - nowTime;
        try {
            Thread.sleep(diff < 1000 ? diff * 1000 : diff);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return getNowTime();
    }

    /**
     * 等待下一秒
     *
     * @param lastTime
     * @return
     */
    private long waitUntilNextTime(final long lastTime) {
        long result = getNowTime();
        while (result <= lastTime) {
            result = getNowTime();
        }
        return result;
    }

    private void vibrateSequenceOffset() {
        sequenceOffset = (byte) (~sequenceOffset & 1);
    }


    /**
     * 获取当前时间
     *
     * @return 秒为单位
     */
    private long getNowTime() {
        return System.currentTimeMillis() / 1000;
    }

    /**
     * 基于年月日构建分区
     *
     * @param time 时间戳
     * @return 时间分区
     */
    private static String getDaySegment(long time) {
        LocalDateTime localDate = LocalDateTime.ofInstant(Instant.ofEpochMilli(time * 1000L), ZoneId.systemDefault());
        return String.format("%02d%03d", localDate.getYear() % 100, localDate.getDayOfYear());
    }
}
```


注意上面的实现，相比较于前面HuTool的实现，有几个变更

1. 时间戳从毫秒改为秒
2. 生成id前五位：年 + 天
3. workcenterId : dataCenterId = 3 : 7
4. 当时钟回拨时，等待时间追上，而不是直接抛异常
5. 自增序列的起始值，0/1互切

接下来再看下实际的使用输出

```java
public static void main(String[] args) throws InterruptedException {
    SelfSnowflakeProducer producer = new SelfSnowflakeProducer();
    for (int i = 0; i < 20; i++) {
        if (i % 3 == 0) {
            Thread.sleep(2000);
        }
        System.out.println(producer.nextId());
    }
}
```

输出如下

```
23299055409901569
23299055409901570
23299055409901571
23299055418290176
23299055418290177
23299055418290178
23299055426678785
23299055426678786
23299055426678787
23299055435067392
23299055435067393
23299055435067394
23299055443456001
23299055443456002
23299055443456003
23299055451844608
23299055451844609
23299055451844610
23299055460233217
23299055460233218
```

### 5. 小结

雪花算法本身的实现并不复杂，但是它的设计理念非常有意思；业界内也有不少基于雪花算法的变种实现，主要是为了解决时钟不一致及时钟回拨问题，如百度`UIDGenerator`，美团的`Leaf-Snowflake`方案

雪花算法其实是依赖于时间的一致性的，如果时间回拨，就可能有问题，其次机器数与自增序列虽然官方推荐是10位与12位，但正如没有万能的解决方案，只有最合适的解决方案，我们完全可以根据自己的实际诉求，对64个字节，进行灵活的分配

再实际使用雪花算法时，有几个注意事项

1. 雪花算法生成的id，通常是长整形，对于前端使用时，对于超过16位的数字，会出现精度问题，需要转换成String的方式传递，否则就会出现各种预料之外的事情发生
2. workId如何获取？  
  - 如：借助第三方服务(db/redis/zk)，统一为每个实例分配唯一的workId
  - 如：同一个局域网内的所有应用，借助ip的最后一段来定位




## II. 不能错过的源码和相关知识点

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 源码：[https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/600-snowflake-id](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/600-snowflake-id)


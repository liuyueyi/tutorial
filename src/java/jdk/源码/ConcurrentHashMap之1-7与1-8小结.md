---
title: ConcurrentHashMap之1.7与1.8小结
tag:
  - Java
  - JDK
category:
  - Java
  - JDK
  - 容器
date: 2018-05-14 10:01:40
---

## I. ConcurrentHashMap 两种实现方式小结

### 1. 锁分段机制

HashMap的底层数据结构是数组+hash链表的方式，非线程安全

ConcurrentHashMap 采用锁分段机制，底层数据结构为二维数组，其中第一层是Segment的数组，每个Segment持有一把独立的锁，而Segment的结构和HashMap很相似；这就是锁分段机制；线程安全


关注几个点：

- ConcurrentHashMap 如何定位 Segment, 如何定位 HashEntry
- 修改的加锁逻辑，如何进行扩容
- 读数据时，如何做到不加锁但保证线程安全的？

<!-- more -->


#### 1. 定位逻辑

同样是利用hash值进行定位，这里分为两步定位，首先是确定Segment，其次是Segent中的HashEntry

- hash值都是通过再hash后得到的（避免hash碰撞）
- 通过再hash值，取高位，然后与Segment数组的长度求余，获取Segment的位置
- 在Segment中，通过再hash值与数组的长度求余，定位HashEntry在数组中的索引，然后遍历hash链表定位具体的HashEntry

注意其中Segment是hash值取高位进行定位的，后者直接hash值进行求余定位的，这样做的目的就是为了避免两次哈希后的值一样，导致元素虽然在Segment里散列开了，但是却没有在HashEntry里散列开

#### 2. 添加数据

- 添加数据的逻辑，首先依然是通过上面的定位获取Segment
- 对Segment加锁，防止其他线程同步修改
- 第一步判断是否需要对Segment里的HashEntry数组进行扩容
- 第二步定位添加元素的位置然后放在HashEntry数组里。

**是否需要扩容**

- 在插入元素前会先判断Segment里的HashEntry数组是否超过容量（threshold），如果超过阀值，数组进行扩容。
- Segment的扩容判断比HashMap更恰当，因为HashMap是在插入元素后判断元素是否已经到达容量的，如果到达了就进行扩容，但是很有可能扩容之后没有新元素插入，这时HashMap就进行了一次无效的扩容


**如何扩容**

- 扩容的时候首先会创建一个两倍于原容量的数组，然后将原数组里的元素进行再hash后插入到新的数组里
- 为了高效ConcurrentHashMap不会对整个容器进行扩容，而只对某个segment进行扩容

#### 3. 线程安全的不加锁读

查询数据时，没有加锁，这又是如何保证线程安全的呢？

- 如果在查询过程中，没有线程对容器进行修改，则没有问题
- 如果有线程同步修改呢？

有以下几个机制来保障

- 每个节点HashEntry除了value不是final的，其它值都是final的，这意味着不能从hash链的中间或尾部添加或删除节点，因为这需要修改next引用值，所有的节点的修改只能从头部开始。
- 对于put操作，可以一律添加到Hash链的头部
- 但是对于remove操作，可能需要从中间删除一个节点，这就需要将要删除节点的前面所有节点整个复制一遍，最后一个节点指向要删除结点的下一个结点。为了确保读操作能够看到最新的值，将value设置成volatile，这避免了加锁

针对增加和删除具体分析：

对于PUT操作，如果在读取时，已经定位到对应的HashEntry索引，根据这个hash链表进行从头到尾的遍历，如果在遍历前已经插入，因为volatile，所以遍历的第一个就是目标所在；而如果已经在链表查询中间，再插入，可以认为是本次查询之后才新加入的数据，查不到也是ok的


对于删除而言，因为删除链表中间的HashEntry时，会新生成一个链表，将原来的节点拷贝过来；那么读取的遍历就有两种可能，落到新链表上，没问题；落到老链表上，仍旧读取旧数据，也认为是OK的

#### 4. 计算size

先采用不加锁的方式，连续计算元素的个数，最多计算3次：

1、如果前后两次计算结果相同，则说明计算出来的元素个数是准确的；
2、如果前后两次计算结果都不同，则给每个Segment进行加锁，再计算一次元素的个数

---

### 2. Node + CAS + Synchronized

jdk1.8重写了ConcurrentHashMap的实现，丢掉了锁分段的二维数组结构，改用Node数组进行

从结构上来看，1.8中ConcurrentHashMap的数据结构和HashMap的一样，区别只是在于修改时如何保障线程安全

#### 1. 新增一个数据

新插入一个HashEntry的内容时，首先是定位到具体的Node，如果这个位置没有加过数据，直接通过cas插入即可（无锁）

如果存在node，则锁住这个node（因此其他修改如果需要方位这个node对应的链表时，会竞争锁）；然后将数据插入到链表尾部（或者红黑树的指定位置）

#### 2. 修改一个已经存在的数据

定位node，锁住，然后修改对应的value值即可

#### 3. 删除数据

定位node，如果不存在表示不用删；存在时，锁住这个node，然后遍历查找到需要删除的节点，干掉

#### 4. 读数据

不加锁，和hashmap的原理差不多；需要注意的是Node节点中的value和next都是volatile的，即线程对这些数据的修改对其他线程是立马可见的


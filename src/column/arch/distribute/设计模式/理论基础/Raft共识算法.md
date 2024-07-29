---
order: 1
title: raft共识算法
tag: 
  - 分布式
  - 算法
category: 
  - 分布式
  - 设计模式
  - 理论基础
date: 2022-07-12 19:27:54
keywords: 
  - 分布式
  - 设计模式
  - raft
---

# Raft共识算法

> 推荐有兴趣的小伙伴，查看
> * [Raft 算法动画演示](http://thesecretlivesofdata.com/raft/)
> * [Raft算法详解 - 知乎](https://zhuanlan.zhihu.com/p/32052223)


为了解决paxos的复杂性，raft算法提供了一套更易理解的算法基础

角色划分：

- Leader：领导者，接受客户端请求，并向Follower同步请求，当数据同步到大多数节点上后告诉Follower提交日志
- Follow: 接受并持久化Leader同步的数据，在Leader告之日志可以提交之后，提交
- Candidate：Leader选举过程中的临时角色，向其他节点拉选票，得到多数的晋升为leader，选举完成之后不存在这个角色

![Raft角色](/imgs/column/distribute/220708/raft01.jpg)

Follower只响应其他服务器的请求。如果Follower超时没有收到Leader的消息，它会成为一个Candidate并且开始一次Leader选举。收到大多数服务器投票的Candidate会成为新的Leader。Leader在宕机之前会一直保持Leader的状态。

## 选举

Raft算法将时间分为一个个的任期（term），每一个term的开始都是Leader选举。在成功选举Leader之后，Leader会在整个term内管理整个集群。如果Leader选举失败，该term就会因为没有Leader而结束。

Raft 使用心跳（heartbeat）来检测Leader是否存活，Leader向所有Followers周期性发送heartbeat，表示自己还活着

如果Follower在选举超时时间内没有收到Leader的heartbeat，就会等待一段随机的时间后发起一次Leader选举

![Raft选举](/imgs/column/distribute/220708/raft02.jpg)

选举的核心要点在于：

- follower一段时间没有接受到leader的心跳，认为leader挂了，变成candidate状态。 为了避免选举冲突，这个超时时间是一个150/300ms之间的随机数
- candidate，会重置计时器，先投自己一票，向其他节点拉选票
- 得到多数选票的晋升为主节点
- 当多个节点的选票相同，则选举失败；之后等待计时器超时的follower会变成candidate，将任期加一并开始新一轮的投票。

## 日志同步

Leader接受外部请求，并将请求作为LogEntries加入日志中，然后复制给其他的Follow节点，

- 大部分结点响应时才提交日志
- 通知所有follower结点日志已提交
- 所有follower也提交日志

![Raft日志同步](/imgs/column/distribute/220708/raft03.jpg)


## 脑裂问题

> 指在一个高可用（HA）系统中，当联系着的两个节点断开联系时，本来为一个整体的系统，分裂为两个独立节点，这时两个节点开始争抢共享资源， 结果会导致系统混乱，数据损坏。

假设`A~E`五个结点，B是leader。 如果发生“脑裂”，A、B成为一个子分区，C、D、E成为一个子分区。 

- 此时C、D、E会发生选举，选出C作为新term的leader。这样我们在两个子分区内就有了不同term的两个leader
- 这时如果有客户端写A时, 因为B无法复制日志到大部分follower所以日志处于uncommitted未提交状态。
- 而同时另一个客户端对C的写操作却能够正确完成，因为C是新的leader，它只知道D和E。
- 当网络通信恢复，B能够发送心跳给C、D、E了，却发现有新的leader了，因为C的term值更大，所以B自动降格为follower。 然后A和B都回滚未提交的日志，并从新leader那里复制最新的日志。

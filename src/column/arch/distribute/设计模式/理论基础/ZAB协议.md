---
order: 2
title: zab协议
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
  - zab
---

# Zookeeper Atomic Broadcast, ZK原子广播协议

> ZAB(Zookeeper Atomic Broadcast) 协议是为分布式协调服务ZooKeeper专门设计的一种支持崩溃恢复的一致性协议，基于该协议，ZooKeeper 实现了一种 主从模式的系统架构来保持集群中各个副本之间的数据一致性。
>
> * [zookeeper核心之ZAB协议就这么简单！](https://segmentfault.com/a/1190000037550497)

**角色划分**

- Leader: 负责整个Zookeeper 集群工作机制中的核心
  - 事务请求的唯一调度和处理者，保证集群事务处理的顺序性
  - 集群内部各服务器的调度者
- Follower：Leader的追随者
  - 处理客户端的非实物请求，转发事务请求给 Leader 服务器
  - 参与事务请求 Proposal 的投票
  - 参与 Leader 选举投票
- Observer：是 zookeeper 自 3.3.0 开始引入的一个角色，
  - 它不参与事务请求 Proposal 的投票，
  - 也不参与 Leader 选举投票
  - 只提供非事务的服务（查询），通常在不影响集群事务处理能力的前提下提升集群的非事务处理能力。

**消息广播**

![ZAB消息广播](/imgs/column/distribute/220708/zab00.jpg)


leader再接收到事务请求之后，将请求转换为事务Proposal提案，leader会为每个follower创建一个队列，将该事务proposal放入响应队列，保证事务的顺序性；

然后再在队列中按照顺序向其它节点广播该提案；

follower收到后会将其以事务的形式写入到本地日志中，并且向leader发送Ack信息确认

有一半以上的follower返回Ack信息时， leader会提交该提案并且向其它节点发送commit信息


**事务有序性**

队列 + 事务递增ID（ZXID）来保证提案的有序性，

ZXID:

- 高32位：纪元epoch，新选举一个leader，纪元+1
- 低32位：计数器counter，单调递增的数字
---
order: 2
title: 2. Centos使用docker构建ecs环境
tag:
  - Docker
category:
  - Shell
  - Docker
date: 2018-12-07 17:22:09
keywords: Centos,Docker,JAVA,maven,nginx,tomcat,mysql
---

本文主要介绍利用docker来构建一个java后端可用的开发运维环境

<!-- more -->

## I. java环境搭建

首先是jdk的安装，可以安装open-jdk，也可以从jdk官网下载jdk包进行配置，简单说明下两种使用方式

### 1. open-jdk安装

基本安装过程如下

```sh
# 切换root
su
# 首先查看当前支持的jdk版本
yum list | grep jdk
yum install java-11-openjdk-devel.x86_64 java-11-openjdk.x86_64 -y
```

### 2. jdk包安装

#### a. 获取包

**官网下载**

```sh
## 到官网找到对应的版本，获取下载地址
wget http://download.oracle.com/otn-pub/java/jdk/8u171-b11/512cd62ec5174c3487ac17c61aaa89e8/jdk-8u171-linux-x64.tar.gz?AuthParam=1529400028_058a3f3fdf9c78aa6502a6e91edfb1d2

## 解压
tar -zxvf jdk-8u171-linux-x64.tar.gz?AuthParam=1529400028_058a3f3fdf9c78aa6502a6e91edfb1d2

## 目录指定
mv jdk-8u171-linux-x64 /usr/local/java/
```

**宿主机拷贝**

```sh
# 拷贝
docker cp jdk1.8.0_131.tar.gz 0e118346222c:/home/soft
# 进入容器
docker exec -it 0e118346222c /bin/bash
```

#### b. 安装

```sh
cd /usr
mkdir java
cp /home/soft
tar -zxvf jdk1.8.0_131.tar.gz
rm jdk1.8.0_131.tar.gz
```

#### c. 配置

进入配置文件 `vi /etc/profile`

```sh
## 文件末尾添加
export JAVA_HOME=/home/soft/jdk1.8.0_131
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
```

应用并查看是否配置ok

```sh
source /etc/profile
java
javac
```

### 3. 删除自带的openjdk

如果希望删除自带的jdk，可以执行下面的命令查看安装的版本

```sh
rpm -qa | grep java
```

然后执行

```sh
yum remove java-11-openjdk-headless-debug
# 或者执行
rpm -e --nodeps java-11-openjdk-headless-debug-11.0.1.13-3.el7_6.x86_64
```

## II. Maven配置

maven的配置相对简单，下载好包之后，设置mvn的配置即可

### 1. 获取包

下载maven包，推荐到官网下载，我这里是从宿主机拷贝

```sh
docker cp maven-3.5.3.tar.gz 0e118346222c:/home/soft
```

### 2. 解压

到docker中，解压并配置

```sh
cd /home/soft
tar -zxvf maven-3.5.3.tar.gz
```

### 3. 配置

设置配置文件 `vi /etc/profile`

```sh
M2_HOME=/home/soft/maven-3.5.3
export PATH=${M2_HOME}/bin:${PATH}
```

配置生效 `source /etc/profile` 并查看

```sh
[root@0e118346222c maven-3.5.3]# mvn --version
Apache Maven 3.5.3 (3383c37e1f9e9b3bc3df5050c29c8aff9f295297; 2018-02-24T19:49:05Z)
Maven home: /home/soft/maven-3.5.3
Java version: 1.8.0_131, vendor: Oracle Corporation
Java home: /usr/java/jdk1.8.0_131/jre
Default locale: en_US, platform encoding: ANSI_X3.4-1968
OS name: "linux", version: "3.10.0-693.2.2.el7.x86_64", arch: "amd64", family: "unix"
```

## III. tomcat安装

tomcat的安装基本上就是解压个包的事情了

```sh
docker cp tomcat.tar.gz 0e118346222c:/home/soft
docker exec -it 0e118346222c /bin/bash
cd /home/soft
tar -zxvf tomcat.tar.gz
```

## IV. nginx安装

### 1. 直接使用 yum 安装

后面一个参数表示指定安装的位置

```
yum install nginx  --prefix=/home/soft/nginx
```

上面这种安装，在配置https时，会有问题，提示要安装ssl模块啥的，因此可以这么添加一下参数


```
yum install nginx --prefix=/home/soft/nginx --with-http_stub_status_module --with-http_ssl_module
```

如果你是先执行了上面的步骤，后面发现需要安装ssl模块，要怎么办 ？


操作如下：

```bash
1. 获取安装的nginx版本 `nginx -V`
2. 获取对应的源码包  `wget http://nginx.org/download/nginx-1.12.0.tar.gz`
3. 解压源码包  `tar -zxvf nginx-1.12.0.tar.gz`, 进入解压的目录
4. 编译 `./configure --prefix=/app/soft/nginx --with-http_stub_status_module --with-http_ssl_module`
5. `make`  
6. 备份老的nginx     `cp /app/soft/nginx/sbin/nginx  cp /app/soft/nginx/sbin/nginx.bk`
7. 拷贝新的nginx     `cp sbin/nginx /app/soft/nginx/sbin/nginx`
```

### 2. 源码安装

上面其实已经包含了源码安装的步骤，下面简单的列一下

```bash
安装之前，先安装依赖
- yum install -y zlib zlib-devel gcc
- yum install -y pcre pcre-devel
- yum install -y openssl openssl-devel

wget http://nginx.org/download/nginx-1.12.0.tar.gz
tar -zxvf nginx-1.12.0.tar.gz; cd nginx-1.12.0
./configure --prefix=/home/soft/nginx --with-http_stub_status_module --with-http_ssl_module
make 
make install
```

### 3. 命令

nginx 命令

```bash
# 启动
/app/soft/nginx/sbin/nginx  

# 停止
/app/soft/nginx/sbin/nginx -s stop
```


验证是否启动成功

```sh
curl 'http://locahost'
```

## V. Redis安装

redis的安装，可以直接根据`yum`简单的进行安装，也可以下载安装包

### 1. yum安装方式

```sh
yum install redis
```


后台启动redis方式：

```sh

# 设置redis.conf文件，开启后台启动

vim /etc/redis.conf


## 找到 daemonize no 这一行
## 修改成yes，并保存
daemonize yes


## 启动redis
redis-server /etc/redis.conf
```

查看redis启动是否正常

```sh
# 查看进程号
ps -ef | grep redis
```

客户端连接测试

```sh
redis-cli

> set test 123
> get test
> expire test
```

关闭redis

```sh
redis-cli shutdown
```

### 2. 源码安装方式

下载源码并编译

```sh
wget http://download.redis.io/releases/redis-5.0.2.tar.gz
tar -zxvf redis-5.0.2.tar.gz
cd redis-5.0.2
make
```

设置下redis的相关配置文件，假设我们约定将数据文件存放在 `/home/data/redis` 目录下，则配置需要如下修改

进入配置文件 redis.conf

```conf
# 修改默认的端口号
port 6868

# 修改密码
requirepass newPwd!

# 设置进程文件
pidfile /home/data/redis-6868/redis.pid

# 设置日志文件
logfile "/home/data/redis-6868/log/redis.log"

# 设置数据文件
dir /home/data/redis-6868/data
```

在启动redis之前，首先需要创建对应的目录

```sh
cd /home/data
mkdir redis-6868
cd redis-6868
mkdir data log
```

开始启动redis并测试

```sh
cd /home/soft/redis-5.0.2/
src/redis-server redis.conf

# 测试连接
src/redis-cli -p 6868
auth newPwd!
```

## VI. Mysql环境安装

这里采用最简单的方式进行安装mysql，需要关注的是后面的默认配置的修改

### 1. 安装

```sh
# 添加源
rpm -Uvh http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm

# 安装
yum install mysql mysql-server mysql-libs mysql-server
```

上面安装完毕之后，可以开始启动服务

```sh
systemctl start mysqld
```

上面的命令在docker中执行时，会报错

```sh
Failed to get D-Bus connection: Operation not permitted
```

可以如下操作

```sh
# 首先设置下密码
passwd
> 输入密码 (yihui)

# 退出容器
exit

# 保存docker镜像
docker commit 0e118346222c yihui/centos

# 再次启动镜像
docker run --privileged -e "container=docker" -v /sys/fs/cgroup:/sys/fs/cgroup -ti yihui/centos /usr/sbin/init

# 输入账号和密码
4af0575c5181 login: root
Password: (yihui)
```

上面搞定之后，就可以继续启动mysql了

如果登录需要密码时，如下确定

```sh
grep "temporary password" /var/log/mysqld.log

## 输出如下
# A temporary password is generated for root@localhost: WClOFXUqF4&4
```


### 2. 配置修改

#### a. 端口号修改

默认的端口号为3306，如果需要修改端口号，则找到my.cnf文件，新加一个配置即可:

```sh
vim /etc/my.cnf

## 找到指定的位置，修改端口号
[mysqld]
port=3305
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
```

服务重启

```sh
service mysqld restart
```

#### 2. 密码修改

使用set password

**格式：**

```
mysql> set password for 用户名@localhost = password('新密码');  
```

**例子：**

```sh
mysql> set password for root@localhost = password('123');  
```

update 方式

```sh
mysql> use mysql;  

mysql> update user set password=password('123') where user='root' and host='localhost';  

mysql> flush privileges;  
```

添加用户

```sh
alter user 'root'@'localhost' identified by 'test';
create user 'test'@'%' IDENTIFIED BY 'test';
```

授予权限

```sh
# root 方式登录
grant all PRIVILEGES on test.* to 'yihui'@'%' IDENTIFIED by 'test';
flush privileges;
```

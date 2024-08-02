---
order: 2
title: 2. Ubuntu终端实现Maven中央仓库包上传
tag:
  - Maven
category:
  - Shell
  - Maven
date: 2022-06-02 14:03:53
keywords:
  - Maven
  - 教程
---

最近换了个win10的笔记本，发布jar到中央仓库就得重新配置下了，特此记录一下，在win10的ubuntu终端界面下，如果我们希望实现发布jar包到中央仓库，需要的完整环境安装配置教程

<!-- more -->

主要内容与之前介绍的没有太大改动，因为账号相关的已经有了，这里将直接跳过；前文超链

* [201128-Maven 中央仓库提交Jar包全程指南 - 一灰灰Blog](https://blog.hhui.top/hexblog/2020/11/28/201128-Maven-%E4%B8%AD%E5%A4%AE%E4%BB%93%E5%BA%93%E6%8F%90%E4%BA%A4Jar%E5%8C%85%E5%85%A8%E7%A8%8B%E6%8C%87%E5%8D%97/)

### 1. maven环境安装

既然是打包上传，那么maven环境得有，而maven则又需要借助jdk，所以第一步就是安装jdk

```bash
sudo apt-get install openjdk-8-jdk
```

安装完毕之后，执行下`java`命令确认下是否安装准确

第二步就是安装maven了

直接到官网找对应得下载包

```bash
# 1. 下载
wget https://dlcdn.apache.org/maven/maven-3/3.8.5/binaries/apache-maven-3.8.5-bin.tar.gz
# 2. 解压
tar -zxvf apache-maven-3.8.5-bin.tar.gz

# 3. 配置环境变量
vim ~/.profile

# 注意下面得地址，根据实际的进行替换
export MAVEN_HOME="/home/yihui/soft/apache-maven-3.8.5/bin"
export PATH=$PATH:$MAVEN_HOME

## 4. 让配置生效
source ~/.profile
```

到此maven就算配置完成了，可以通过执行 `mvn` 命令来验证下是否ok

### 2. gpg配置

相比于之前因为mac系统老旧安装这个折腾很久来说，这次安装可以说无比顺畅了，直接apt即可

```bash
sudo apt-get install gdb
```

安装完之后，就是配置密钥了

```bash
# 生成密钥对
# 输入用户名 + 邮箱，请记住这个密码，后面上传jar包的时候会用到
gpg --gen-key
```

**注意：上面这个key的密钥非常重要，以后每次上传包进行签名的就是它**

查看本地密钥

```bash
gpg --list-keys
```

正常返回结果如下

```
pub   rsa3072 2022-06-02 [SC] [expires: 2024-06-01]
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  （<- 注意这个就是我们需要上传的公钥id）
uid                      yihuihui <yihuihuiyi@gmail.com>
sub   rsa3072 2022-06-02 [E] [expires: 2024-06-01]
```

接下来就是上传公钥id到密钥服务器

```bash
## 上传公钥
gpg --keyserver hkp://keyserver.ubuntu.com:11371 --send-keys 公钥ID

## 查看公钥上传情况
gpg --keyserver hkp://keyserver.ubuntu.com:11371 --recv-keys 公钥ID
```

上传成功之后，查看返回如下

```
gpg: key 274D20CF942E6787: "yihuihui <yihuihuiyi@gmail.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1
```

### 4. 配置.m2/setting.xml

最后剩下的配置就是mvn上传仓库的账号信息

```xml
<servers>
  <server> 
    <id>ossrh</id>
    <username>user</username>
    <password>password</password>
  </server>
</servers>
```

### 5. 上传

到这里就可以愉快的发布包到maven中央仓库了，当然前提是对应的项目已经配置好了，这里以 [https://github.com/liuyueyi/quick-media](https://github.com/liuyueyi/quick-media) 为例（若希望知道具体的pom文件应该怎么配的，可以翻看文章头的博文，或者直接看左边这个项目的pom文件）

```bash
# 打包上传
mvn clean deploy -DskipTests=true -P release
```

执行上面打包上传之后，却发现没有提示输gpg密码的地方，果不其然最后的上传结果也是失败，提示信息如下

```
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-gpg-plugin:1.6:sign (sign-artifacts) on project quick-media: Exit code: 2 -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException
```

当然错误原因我们也能猜测到，但是怎么解决呢?

stackoverflow 上有一个类似的提问其中一个回答可以解决这个问题 [failed to execute goal org.apache.maven.plugins:maven-gpg-plugin](https://stackoverflow.com/questions/32018765/failed-to-execute-goal-org-apache-maven-pluginsmaven-gpg-plugin)

解决方法选的是第二个回答，执行下面这个命令

```
export GPG_TTY=$(tty)
```

再次执行上传，就没啥问题了


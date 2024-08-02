---
order: 4
title: 4. Centos SSH免密登录配置不生效问题fix
tag:
  - Shell
category:
  - Shell
  - CMD
date: 2018-12-22 17:19:03
keywords: Shell,SSH
---

centos添加ssh免密配置，结果发现登录时，依然要求设置密码，记录一下解决过程与最终的方案

<!-- more -->

## I. ssh免密配置

免密配置比较简单，自己的电脑上生成公私钥，然后将公钥丢上去即可

本机执行流程：

```bash
ssh-keygen
# 一路回车，在home目录的.ssh下会生成两个文件
cd ~/.ssh; ls
# id_rsa      这个是生成的私钥
# id_rsa.pub  这个是生成的公钥
```

接下来我们需要将`id_rsa.pub`的内容，粘贴到服务器的
`authorized_keys`

```bash
vim ~/.ssh/authorized_keys
# 将上面的公钥内容拷贝进来，保存，退出即可
```

正常来讲，上面的逻辑执行完毕之后，就可以免密登录了，但是突然遇到了登录还是要密码的情况

**原因定位**

查看ssh的登录日志

```bash
vi /var/log/secure
```

然后发现日志显示

```txt
Dec 22 17:00:15 localhost sshd[21485]: Connection closed by xxx port xxx [preauth]
Dec 22 17:01:15 localhost sshd[21528]: Authentication refused: bad ownership or modes for directory /home/xxx/.ssh
```

从上面的日志中看出，问题应该就在.ssh目录的权限上，添加上权限即可

```sh
chmod 600 ~/.ssh
```


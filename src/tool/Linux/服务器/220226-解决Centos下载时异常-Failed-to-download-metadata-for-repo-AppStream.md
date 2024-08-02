---
order: 11
title: 11. 解决Centos下载时异常 Failed to download metadata for repo AppStream
tag:
  - Shell
category:
  - Shell
  - 环境搭建
date: 2022-02-25 16:27:15
keywords:
  - Shell
  - Centos
---

阿里云ecs服务器，通过`yum install`安装命令时，突然发现报错，提示信息如下

```bash
Repository extras is listed more than once in the configuration
CentOS Linux 8 - AppStream                                                                            18 kB/s | 2.3 kB     00:00    
Errors during downloading metadata for repository 'appstream':
  - Status code: 404 for http://mirrors.cloud.aliyuncs.com/centos/8/AppStream/x86_64/os/repodata/repomd.xml (IP: 100.100.2.148)
Error: Failed to download metadata for repo 'appstream': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried
```

搜索一番之后发现原因貌似是

> 2022年1月1日起CentOS官方将不再对CentOS 8提供服务支持,虽然系统可以正常使用,但CentOS 8的yum源已经移除无法使用了,使用yum安装会报错：`Repository extras is listed more than once in the configuration CentOS Linux 8 - AppStream Errors during downloading metadata for repository 'appstream':  - Status code: 404 for`

<!-- more -->

且不论原因为何，解决问题才是真理，下面记录一下阿里云centos的修复脚本

```bash
# 切root权限
su root

# 备份repo
rename '.repo' '.repo.bak' /etc/yum.repos.d/*.repo 

# 下载新的repo
wget https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo -O /etc/yum.repos.d/Centos-vault-8.5.2111.repo
wget https://mirrors.aliyun.com/repo/epel-archive-8.repo -O /etc/yum.repos.d/epel-archive-8.repo

# 替换repo文件中的url
sed -i 's/mirrors.cloud.aliyuncs.com/url_tmp/g'  /etc/yum.repos.d/Centos-vault-8.5.2111.repo &&  sed -i 's/mirrors.aliyun.com/mirrors.cloud.aliyuncs.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo && sed -i 's/url_tmp/mirrors.aliyun.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo
sed -i 's/mirrors.aliyun.com/mirrors.cloud.aliyuncs.com/g' /etc/yum.repos.d/epel-archive-8.repo

# 重建缓存
yum clean all & yum make cache
```

完事之后，重新执行以下安装命令，判断是否ok，比如安装nc命令

```bash
yum install nc -y
```

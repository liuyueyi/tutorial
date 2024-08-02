---
order: 6
title: 6. acme.sh 快速实现https证书颁发
tag:
  - ssl
category:
  - Shell
  - 环境搭建
date: 2020-08-10 08:43:59
keywords: linux shell acme lets'encrypt 证书 ssl
---

借助`acem.sh`来迅速实现let's encrypt的泛域名ssl证书颁发与续期，基本上五分钟就可以解决战斗

> 本文主要内容来自acme.sh的官方wiki，一切以官方说明为准: [acme wiki](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)

<!-- more -->

## I. 安装步骤

### 1. 登录服务器

登录到某台linux服务器，我这里以Centos举例说明

```bash
ssh xxx@xxx

# 切换root账号
su
```

### 2. 安装`acme.sh`

```bash
yum install socat -y
curl  https://get.acme.sh | sh
cd ~/.acme.sh/
```

### 3. 申请密钥

到域名购买服务商，申请api key，用于后期的txt记录验证

**DNSPod**

密钥申请完毕之后，如下操作导入命令

```bash
# DNSPod
export DP_Id="id"
export DP_Key="key"
```

**阿里云**

>  ALY_KEY 和 ALY_TOKEN：阿里云 [API key 和 Secrec 官方申请文档](https://help.aliyun.com/knowledge_detail/38738.html)。

申请完毕之后，如下操作

```bash
export Ali_Key="key"
export Ali_Secret="secret"
```

**godaddy**

- GODADDY_KEY 和 GODADDY_TOKEN：GoDaddy [API 密钥官方申请文档](https://developer.godaddy.com/getstarted)

```bash
export GD_Key="key"
export GD_Secret="secret"
```

**其他**

至于其他平台，应该如何导入API key，可以参考下面的文档，这里不一一说明了

- [https://github.com/acmesh-official/acme.sh/wiki/dnsapi](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)


### 4. 证书生成

```bash
# 请注意，--dns后面的参数，一般来讲后缀就是上面的导入key的前缀
# 如果不确定，到上面的github连接中去找

# 针对 hhui.top 域名生成通配的证书
# 在我的测试中，如果只指定  -d *.hhui.top ，那么生成的证书没有包含 hhui.top 这个主域名，所以当我希望这个证书都能包含时，第一个填写主域名
./acme.sh --issue --dns dns_ali -d 'hhui.top' -d '*.hhui.top'
```

证书生成之后，会在`.acme.sh`目录下，新生成一个 `*.hhui.top`(就是我们上面指定的通配域名) 文件夹，证书在里面

### 5. 安装证书

接下来将我们的证书安装到nginx（当然也可以是tomcat），下面的脚本除了安装之外，也添加了一个自动更新的任务（一般来说，60 天以后会自动更新，并会强制重启nginx使新的证书生效，可以通过 `crontab -e`看到对应的定时任务）

```bash
./acme.sh  --installcert -d 'hhui.top' -d '*.hhui.top' --key-file /etc/nginx/ssl/key.pem  --fullchain-file /etc/nginx/ssl/cert.pem --reloadcmd     "service nginx force-reload"
```

### 6. nginx配置

然后就是配置nginx，支持https

下面是一个基础的nginx配置实例

```conf
server {
    server_name blog.hhui.top;
    root /home/yihui/xxx;
    index index.html;

    gzip on;
    gzip_buffers 32 4K;
    gzip_comp_level 6;
    gzip_min_length 100;
    gzip_types application/javascript text/css text/xml;
    gzip_disable "MSIE [1-6]\."; #配置禁用gzip条件，支持正则。此处表示ie6及以下不启用gzip（因为ie低版本不支持）
    gzip_vary on;

    location ~* ^.+\.(ico|gif|jpg|jpeg|png)$ {
        access_log   off;
        expires      1d;
    }

    location ~* ^.+\.(css|js|txt|xml|swf|wav|pptx)$ {
        access_log   off;
        expires      10m;
    }

    location / {
        try_files $uri $uri/ @router;
    }

    location @router {
        rewrite ^.*$ /index.html last;
    }

    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 1.1.1.1 valid=60s;
    resolver_timeout 2s;
}

server {
    if ($host = blog.hhui.top) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name blog.hhui.top;
    return 404;
}
```

### 7. 手动续期

手动续期，强制执行，命令如下

```bash
./acme.sh --issue --dns dns_ali -d 'hhui.top' -d '*.hhui.top' --force
```

执行完毕之后，会输出几个证书，我们需要的是 `fullchain.cer` 与 `hhui.top.key`

安装证书并重启

```bash
cp ~/.acme.sh/hhui.top/hhui.top.key /etc/nginx/ssl/key.pem
cp ~/.acme.sh/hhui.top/fullchain.cer /etc/nginx/ssl/cert.pem

nginx -s reload
```

然后浏览器访问目标网站，查看证书判断是否ok

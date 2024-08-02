---
order: 5
title: 5. Let’s Encrypt 快速实现https证书颁发
tag:
  - SSL
category:
  - Shell
  - 环境搭建
date: 2020-04-20 16:22:43
keywords: ssl lets encrypt https 证书
---

现在站点不挂个https，就连微信分享都开不了，然而商用https证书又特别贵，作为草根想搞个https证书，有下面两种方案：

- 可以到阿里云的控制台上申请免费证书（必须备案，一年有效期，一个域名一个证书）
- 另外一个方案就是利用let's encrypt来申请证书（支持通配符，即多个域名一个证书）


下面手把手教你利用let's encrypt进行证书申请

<!-- more -->

### 1. 准备

我们这里借助 `certbot` 来安装依赖包，和后续的一些必要操作

```bash
wget https://dl.eff.org/certbot-auto --no-check-certificate
chmod +x ./certbot-auto
cp certbot-auto /usr/local/bin/
```

其次借助开源项目: [https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au](https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au) 进行通配证书生成

```bash
git clone https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au certbot
cd certbot
chmod 0777 au.sh
```

### 2. 配置

下面的操作，都在`certbot`目录下，

#### a. 配置根域名

进入`domain.ini`，查看是否包含你的根域名，没有则添加

```bash
vim domain.ini
```

#### b. 配置DNS密钥

因为我域名是在阿里云上购买，下面贴出阿里云的密钥配置流程，登录阿里云控制台，点击个人账号，进入AccessKey管理

![](/hexblog/imgs/200420/00.jpg)

然后创建一个`AccessKey`，记录生成的key,secret，然后填写在下面的文件中

```bash
vim au.sh
```

![](/hexblog/imgs/200420/01.jpg)


#### c. 安装依赖并测试

执行下面脚本，进行依赖安装与测试

```bash
certbot-auto certonly  -d "*.hhui.top" --manual --preferred-challenges dns --dry-run  --manual-auth-hook "/home/soft/letsencrypt/certbot/au.sh php aly add" --manual-cleanup-hook "/home/soft/letsencrypt/certbot/au.sh php aly clean"
```

说明：

- `-d "*.hhui.top"` 这里双引号内替换为自己的域名，*表示通配，支持如`blog.hhui.top`, `spring.hhui.top`的二级域名证书
- `--dry-run` 这个表示用于验证
- `/home/soft/letsencrypt/certbot/au.sh php aly add` 
  - 分为四部分
  - `/xx/au.sh` 表示完整的脚本路径
  - `php`: >4; 可以替换为python, 支持2.7/3.7
  - `aly`: 阿里云，腾讯用`txy`，华为用 `hwy`
  - `add`: 增加dns
  

#### d. 生成证书并使用

```bash
./certbot-auto certonly  -d "*.hhui.top" --manual --preferred-challenges dns  --manual-auth-hook "/home/soft/letsencrypt/certbot/au.sh php aly add" --manual-cleanup-hook "/home/soft/letsencrypt/certbot/au.sh php aly clean"
```

上面执行的过程中，需要输入邮箱、等各种信息，按照提示输入即可

![](/hexblog/imgs/200420/02.jpg)


最终生成的签名在目录 `/etc/letsencrypt/live/hhui.top` （最后最后一个为你的域名）

![](/hexblog/imgs/200420/03.jpg)


- `privkey.pem`: `nginx`配置时，用到的`ssl_certificate_key`
- `cert.pem`: `nginx`配置时，用到的`ssl_certificate`

如一个简单的nginx配置如下（配置完成之后注意重启nginx)

![](/hexblog/imgs/200420/04.jpg)

#### e. 续期

使用let's encrypt进行签名的证书，只有90天的有效期，如果不想每次快到期之前，人工的再处理，可以考虑通过定时任务来续期

使用crontab来处理

```bash
0 3 */7 * * certbot-auto renew --manual --preferred-challenges dns --deploy-hook  "/app/soft/nginx/sbin/nginx -s reload" --manual-auth-hook "/home/soft/letsencrypt/certbot/au.sh php aly add" --manual-cleanup-hook "/home/soft/letsencrypt/certbot/au.sh php aly clean"
```

注意参数`--deploy-hook`，用于续期成功之后，重启nginx

**说明**

- `2020.04.04` 国内出现dns解析污染，导致域名`a771.dscq.akamai.net`解析有问题，如果有非大陆的机器，可以考虑在上面执行，然后把证书捞过来

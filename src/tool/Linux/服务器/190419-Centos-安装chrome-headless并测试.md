---
order: 5
title: 5. Centos 安装chrome headless并测试
tag:
  - Shell
category:
  - Shell
date: 2019-04-19 16:07:41
keywords: chrome,headless
---

### 1. 安装命令

```bash
sudo curl https://intoli.com/install-google-chrome.sh | bash
```

<!-- more -->

安装完毕之后，会提示安装成功，然后查看对应版本

```bash
google-chrome --version
google-chrome-stable --version
```

### 2. 简单使用

```bash
google-chrome --headless --disable-gpu --screenshot  http://spring.hhui.top
```

<!-- more -->

### 3. chrome-driver安装

打开连接: `http://npm.taobao.org/mirrors/chromedriver/`

查找匹配的版本下载

import{_ as s,V as a,W as n,X as e,Z as i,Y as l}from"./framework-b1bd8911.js";const d={},t=i("p",null,"本文主要介绍利用docker来构建一个java后端可用的开发运维环境",-1),c=l(`<h2 id="i-java环境搭建" tabindex="-1"><a class="header-anchor" href="#i-java环境搭建" aria-hidden="true">#</a> I. java环境搭建</h2><p>首先是jdk的安装，可以安装open-jdk，也可以从jdk官网下载jdk包进行配置，简单说明下两种使用方式</p><h3 id="_1-open-jdk安装" tabindex="-1"><a class="header-anchor" href="#_1-open-jdk安装" aria-hidden="true">#</a> 1. open-jdk安装</h3><p>基本安装过程如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 切换root</span>
<span class="token function">su</span>
<span class="token comment"># 首先查看当前支持的jdk版本</span>
yum list <span class="token operator">|</span> <span class="token function">grep</span> jdk
yum <span class="token function">install</span> java-11-openjdk-devel.x86_64 java-11-openjdk.x86_64 <span class="token parameter variable">-y</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-jdk包安装" tabindex="-1"><a class="header-anchor" href="#_2-jdk包安装" aria-hidden="true">#</a> 2. jdk包安装</h3><h4 id="a-获取包" tabindex="-1"><a class="header-anchor" href="#a-获取包" aria-hidden="true">#</a> a. 获取包</h4><p><strong>官网下载</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment">## 到官网找到对应的版本，获取下载地址</span>
<span class="token function">wget</span> http://download.oracle.com/otn-pub/java/jdk/8u171-b11/512cd62ec5174c3487ac17c61aaa89e8/jdk-8u171-linux-x64.tar.gz?AuthParam<span class="token operator">=</span>1529400028_058a3f3fdf9c78aa6502a6e91edfb1d2

<span class="token comment">## 解压</span>
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> jdk-8u171-linux-x64.tar.gz?AuthParam<span class="token operator">=</span>1529400028_058a3f3fdf9c78aa6502a6e91edfb1d2

<span class="token comment">## 目录指定</span>
<span class="token function">mv</span> jdk-8u171-linux-x64 /usr/local/java/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>宿主机拷贝</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 拷贝</span>
<span class="token function">docker</span> <span class="token function">cp</span> jdk1.8.0_131.tar.gz 0e118346222c:/home/soft
<span class="token comment"># 进入容器</span>
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> 0e118346222c /bin/bash
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="b-安装" tabindex="-1"><a class="header-anchor" href="#b-安装" aria-hidden="true">#</a> b. 安装</h4><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /usr
<span class="token function">mkdir</span> <span class="token function">java</span>
<span class="token function">cp</span> /home/soft
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> jdk1.8.0_131.tar.gz
<span class="token function">rm</span> jdk1.8.0_131.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="c-配置" tabindex="-1"><a class="header-anchor" href="#c-配置" aria-hidden="true">#</a> c. 配置</h4><p>进入配置文件 <code>vi /etc/profile</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment">## 文件末尾添加</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">JAVA_HOME</span><span class="token operator">=</span>/home/soft/jdk1.8.0_131
<span class="token builtin class-name">export</span> <span class="token assign-left variable">JRE_HOME</span><span class="token operator">=</span><span class="token variable">\${JAVA_HOME}</span>/jre
<span class="token builtin class-name">export</span> <span class="token assign-left variable">CLASSPATH</span><span class="token operator">=</span>.:<span class="token variable">\${JAVA_HOME}</span>/lib:<span class="token variable">\${JRE_HOME}</span>/lib
<span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token variable">\${JAVA_HOME}</span>/bin:<span class="token environment constant">$PATH</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>应用并查看是否配置ok</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">source</span> /etc/profile
<span class="token function">java</span>
javac
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-删除自带的openjdk" tabindex="-1"><a class="header-anchor" href="#_3-删除自带的openjdk" aria-hidden="true">#</a> 3. 删除自带的openjdk</h3><p>如果希望删除自带的jdk，可以执行下面的命令查看安装的版本</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">rpm</span> <span class="token parameter variable">-qa</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token function">java</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>然后执行</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>yum remove java-11-openjdk-headless-debug
<span class="token comment"># 或者执行</span>
<span class="token function">rpm</span> <span class="token parameter variable">-e</span> <span class="token parameter variable">--nodeps</span> java-11-openjdk-headless-debug-11.0.1.13-3.el7_6.x86_64
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ii-maven配置" tabindex="-1"><a class="header-anchor" href="#ii-maven配置" aria-hidden="true">#</a> II. Maven配置</h2><p>maven的配置相对简单，下载好包之后，设置mvn的配置即可</p><h3 id="_1-获取包" tabindex="-1"><a class="header-anchor" href="#_1-获取包" aria-hidden="true">#</a> 1. 获取包</h3><p>下载maven包，推荐到官网下载，我这里是从宿主机拷贝</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">cp</span> maven-3.5.3.tar.gz 0e118346222c:/home/soft
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_2-解压" tabindex="-1"><a class="header-anchor" href="#_2-解压" aria-hidden="true">#</a> 2. 解压</h3><p>到docker中，解压并配置</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /home/soft
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> maven-3.5.3.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-配置" tabindex="-1"><a class="header-anchor" href="#_3-配置" aria-hidden="true">#</a> 3. 配置</h3><p>设置配置文件 <code>vi /etc/profile</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token assign-left variable">M2_HOME</span><span class="token operator">=</span>/home/soft/maven-3.5.3
<span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token variable">\${M2_HOME}</span>/bin:<span class="token variable">\${<span class="token environment constant">PATH</span>}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>配置生效 <code>source /etc/profile</code> 并查看</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token punctuation">[</span>root@0e118346222c maven-3.5.3<span class="token punctuation">]</span><span class="token comment"># mvn --version</span>
Apache Maven <span class="token number">3.5</span>.3 <span class="token punctuation">(</span>3383c37e1f9e9b3bc3df5050c29c8aff9f295297<span class="token punctuation">;</span> <span class="token number">2018</span>-02-24T19:49:05Z<span class="token punctuation">)</span>
Maven home: /home/soft/maven-3.5.3
Java version: <span class="token number">1.8</span>.0_131, vendor: Oracle Corporation
Java home: /usr/java/jdk1.8.0_131/jre
Default locale: en_US, platform encoding: ANSI_X3.4-1968
OS name: <span class="token string">&quot;linux&quot;</span>, version: <span class="token string">&quot;3.10.0-693.2.2.el7.x86_64&quot;</span>, arch: <span class="token string">&quot;amd64&quot;</span>, family: <span class="token string">&quot;unix&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="iii-tomcat安装" tabindex="-1"><a class="header-anchor" href="#iii-tomcat安装" aria-hidden="true">#</a> III. tomcat安装</h2><p>tomcat的安装基本上就是解压个包的事情了</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">cp</span> tomcat.tar.gz 0e118346222c:/home/soft
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> 0e118346222c /bin/bash
<span class="token builtin class-name">cd</span> /home/soft
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> tomcat.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="iv-nginx安装" tabindex="-1"><a class="header-anchor" href="#iv-nginx安装" aria-hidden="true">#</a> IV. nginx安装</h2><h3 id="_1-直接使用-yum-安装" tabindex="-1"><a class="header-anchor" href="#_1-直接使用-yum-安装" aria-hidden="true">#</a> 1. 直接使用 yum 安装</h3><p>后面一个参数表示指定安装的位置</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>yum install nginx  --prefix=/home/soft/nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>上面这种安装，在配置https时，会有问题，提示要安装ssl模块啥的，因此可以这么添加一下参数</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>yum install nginx --prefix=/home/soft/nginx --with-http_stub_status_module --with-http_ssl_module
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果你是先执行了上面的步骤，后面发现需要安装ssl模块，要怎么办 ？</p><p>操作如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token number">1</span>. 获取安装的nginx版本 <span class="token variable"><span class="token variable">\`</span>nginx <span class="token parameter variable">-V</span><span class="token variable">\`</span></span>
<span class="token number">2</span>. 获取对应的源码包  <span class="token variable"><span class="token variable">\`</span><span class="token function">wget</span> http://nginx.org/download/nginx-1.12.0.tar.gz<span class="token variable">\`</span></span>
<span class="token number">3</span>. 解压源码包  <span class="token variable"><span class="token variable">\`</span><span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> nginx-1.12.0.tar.gz<span class="token variable">\`</span></span>, 进入解压的目录
<span class="token number">4</span>. 编译 <span class="token variable"><span class="token variable">\`</span>./configure <span class="token parameter variable">--prefix</span><span class="token operator">=</span>/app/soft/nginx --with-http_stub_status_module --with-http_ssl_module<span class="token variable">\`</span></span>
<span class="token number">5</span>. <span class="token variable"><span class="token variable">\`</span><span class="token function">make</span><span class="token variable">\`</span></span>  
<span class="token number">6</span>. 备份老的nginx     <span class="token variable"><span class="token variable">\`</span><span class="token function">cp</span> /app/soft/nginx/sbin/nginx  <span class="token function">cp</span> /app/soft/nginx/sbin/nginx.bk<span class="token variable">\`</span></span>
<span class="token number">7</span>. 拷贝新的nginx     <span class="token variable"><span class="token variable">\`</span><span class="token function">cp</span> sbin/nginx /app/soft/nginx/sbin/nginx<span class="token variable">\`</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-源码安装" tabindex="-1"><a class="header-anchor" href="#_2-源码安装" aria-hidden="true">#</a> 2. 源码安装</h3><p>上面其实已经包含了源码安装的步骤，下面简单的列一下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>安装之前，先安装依赖
- yum <span class="token function">install</span> <span class="token parameter variable">-y</span> zlib zlib-devel gcc
- yum <span class="token function">install</span> <span class="token parameter variable">-y</span> pcre pcre-devel
- yum <span class="token function">install</span> <span class="token parameter variable">-y</span> openssl openssl-devel

<span class="token function">wget</span> http://nginx.org/download/nginx-1.12.0.tar.gz
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> nginx-1.12.0.tar.gz<span class="token punctuation">;</span> <span class="token builtin class-name">cd</span> nginx-1.12.0
./configure <span class="token parameter variable">--prefix</span><span class="token operator">=</span>/home/soft/nginx --with-http_stub_status_module --with-http_ssl_module
<span class="token function">make</span> 
<span class="token function">make</span> <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-命令" tabindex="-1"><a class="header-anchor" href="#_3-命令" aria-hidden="true">#</a> 3. 命令</h3><p>nginx 命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 启动</span>
/app/soft/nginx/sbin/nginx  

<span class="token comment"># 停止</span>
/app/soft/nginx/sbin/nginx <span class="token parameter variable">-s</span> stop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>验证是否启动成功</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token string">&#39;http://locahost&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="v-redis安装" tabindex="-1"><a class="header-anchor" href="#v-redis安装" aria-hidden="true">#</a> V. Redis安装</h2><p>redis的安装，可以直接根据<code>yum</code>简单的进行安装，也可以下载安装包</p><h3 id="_1-yum安装方式" tabindex="-1"><a class="header-anchor" href="#_1-yum安装方式" aria-hidden="true">#</a> 1. yum安装方式</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>yum <span class="token function">install</span> redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>后台启动redis方式：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
<span class="token comment"># 设置redis.conf文件，开启后台启动</span>

<span class="token function">vim</span> /etc/redis.conf


<span class="token comment">## 找到 daemonize no 这一行</span>
<span class="token comment">## 修改成yes，并保存</span>
daemonize <span class="token function">yes</span>


<span class="token comment">## 启动redis</span>
redis-server /etc/redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看redis启动是否正常</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 查看进程号</span>
<span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>客户端连接测试</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>redis-cli

<span class="token operator">&gt;</span> <span class="token builtin class-name">set</span> <span class="token builtin class-name">test</span> <span class="token number">123</span>
<span class="token operator">&gt;</span> get <span class="token builtin class-name">test</span>
<span class="token operator">&gt;</span> expire <span class="token builtin class-name">test</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关闭redis</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>redis-cli <span class="token function">shutdown</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_2-源码安装方式" tabindex="-1"><a class="header-anchor" href="#_2-源码安装方式" aria-hidden="true">#</a> 2. 源码安装方式</h3><p>下载源码并编译</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">wget</span> http://download.redis.io/releases/redis-5.0.2.tar.gz
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> redis-5.0.2.tar.gz
<span class="token builtin class-name">cd</span> redis-5.0.2
<span class="token function">make</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>设置下redis的相关配置文件，假设我们约定将数据文件存放在 <code>/home/data/redis</code> 目录下，则配置需要如下修改</p><p>进入配置文件 redis.conf</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code># 修改默认的端口号
port 6868

# 修改密码
requirepass newPwd!

# 设置进程文件
pidfile /home/data/redis-6868/redis.pid

# 设置日志文件
logfile &quot;/home/data/redis-6868/log/redis.log&quot;

# 设置数据文件
dir /home/data/redis-6868/data
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在启动redis之前，首先需要创建对应的目录</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /home/data
<span class="token function">mkdir</span> redis-6868
<span class="token builtin class-name">cd</span> redis-6868
<span class="token function">mkdir</span> data log
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>开始启动redis并测试</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /home/soft/redis-5.0.2/
src/redis-server redis.conf

<span class="token comment"># 测试连接</span>
src/redis-cli <span class="token parameter variable">-p</span> <span class="token number">6868</span>
auth newPwd<span class="token operator">!</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="vi-mysql环境安装" tabindex="-1"><a class="header-anchor" href="#vi-mysql环境安装" aria-hidden="true">#</a> VI. Mysql环境安装</h2><p>这里采用最简单的方式进行安装mysql，需要关注的是后面的默认配置的修改</p><h3 id="_1-安装" tabindex="-1"><a class="header-anchor" href="#_1-安装" aria-hidden="true">#</a> 1. 安装</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 添加源</span>
<span class="token function">rpm</span> <span class="token parameter variable">-Uvh</span> http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm

<span class="token comment"># 安装</span>
yum <span class="token function">install</span> mysql mysql-server mysql-libs mysql-server
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面安装完毕之后，可以开始启动服务</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>systemctl start mysqld
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>上面的命令在docker中执行时，会报错</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>Failed to get D-Bus connection: Operation not permitted
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>可以如下操作</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 首先设置下密码</span>
<span class="token function">passwd</span>
<span class="token operator">&gt;</span> 输入密码 <span class="token punctuation">(</span>yihui<span class="token punctuation">)</span>

<span class="token comment"># 退出容器</span>
<span class="token builtin class-name">exit</span>

<span class="token comment"># 保存docker镜像</span>
<span class="token function">docker</span> commit 0e118346222c yihui/centos

<span class="token comment"># 再次启动镜像</span>
<span class="token function">docker</span> run <span class="token parameter variable">--privileged</span> <span class="token parameter variable">-e</span> <span class="token string">&quot;container=docker&quot;</span> <span class="token parameter variable">-v</span> /sys/fs/cgroup:/sys/fs/cgroup <span class="token parameter variable">-ti</span> yihui/centos /usr/sbin/init

<span class="token comment"># 输入账号和密码</span>
4af0575c5181 login: root
Password: <span class="token punctuation">(</span>yihui<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面搞定之后，就可以继续启动mysql了</p><p>如果登录需要密码时，如下确定</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">grep</span> <span class="token string">&quot;temporary password&quot;</span> /var/log/mysqld.log

<span class="token comment">## 输出如下</span>
<span class="token comment"># A temporary password is generated for root@localhost: WClOFXUqF4&amp;4</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-配置修改" tabindex="-1"><a class="header-anchor" href="#_2-配置修改" aria-hidden="true">#</a> 2. 配置修改</h3><h4 id="a-端口号修改" tabindex="-1"><a class="header-anchor" href="#a-端口号修改" aria-hidden="true">#</a> a. 端口号修改</h4><p>默认的端口号为3306，如果需要修改端口号，则找到my.cnf文件，新加一个配置即可:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> /etc/my.cnf

<span class="token comment">## 找到指定的位置，修改端口号</span>
<span class="token punctuation">[</span>mysqld<span class="token punctuation">]</span>
<span class="token assign-left variable">port</span><span class="token operator">=</span><span class="token number">3305</span>
<span class="token assign-left variable">datadir</span><span class="token operator">=</span>/var/lib/mysql
<span class="token assign-left variable">socket</span><span class="token operator">=</span>/var/lib/mysql/mysql.sock
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>服务重启</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">service</span> mysqld restart
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="_2-密码修改" tabindex="-1"><a class="header-anchor" href="#_2-密码修改" aria-hidden="true">#</a> 2. 密码修改</h4><p>使用set password</p><p><strong>格式：</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>mysql&gt; set password for 用户名@localhost = password(&#39;新密码&#39;);  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>例子：</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> <span class="token builtin class-name">set</span> password <span class="token keyword">for</span> root@localhost <span class="token operator">=</span> password<span class="token punctuation">(</span><span class="token string">&#39;123&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>update 方式</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> use mysql<span class="token punctuation">;</span>  

mysql<span class="token operator">&gt;</span> update user <span class="token builtin class-name">set</span> <span class="token assign-left variable">password</span><span class="token operator">=</span>password<span class="token punctuation">(</span><span class="token string">&#39;123&#39;</span><span class="token punctuation">)</span> where <span class="token assign-left variable">user</span><span class="token operator">=</span><span class="token string">&#39;root&#39;</span> and <span class="token assign-left variable">host</span><span class="token operator">=</span><span class="token string">&#39;localhost&#39;</span><span class="token punctuation">;</span>  

mysql<span class="token operator">&gt;</span> flush privileges<span class="token punctuation">;</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>添加用户</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>alter user <span class="token string">&#39;root&#39;</span>@<span class="token string">&#39;localhost&#39;</span> identified by <span class="token string">&#39;test&#39;</span><span class="token punctuation">;</span>
create user <span class="token string">&#39;test&#39;</span>@<span class="token string">&#39;%&#39;</span> IDENTIFIED BY <span class="token string">&#39;test&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>授予权限</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># root 方式登录</span>
grant all PRIVILEGES on test.* to <span class="token string">&#39;yihui&#39;</span>@<span class="token string">&#39;%&#39;</span> IDENTIFIED by <span class="token string">&#39;test&#39;</span><span class="token punctuation">;</span>
flush privileges<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,109);function r(p,o){return a(),n("div",null,[t,e(" more "),c])}const u=s(d,[["render",r],["__file","181207-Centos使用docker构建ecs环境.html.vue"]]);export{u as default};

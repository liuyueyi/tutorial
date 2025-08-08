import{_ as i,V as r,W as l,Y as s,Z as n,$ as a,X as t,a1 as c,F as d}from"./framework-094145d2.js";const p="/tutorial/hexblog/imgs/190925/00.jpg",o={},u=s("p",null,"之前在使用redis的case中，更多的只是单机的使用；随着业务的增长，为了更好的性能提供，集群是一个必然的发展趋势；下面记录一下搭建集群的步骤",-1),m={href:"https://blog.hhui.top/hexblog/2018/04/24/redis%E5%AE%89%E8%A3%85/",target:"_blank",rel:"noopener noreferrer"},b=s("h2",{id:"i-redis集群搭建过程",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#i-redis集群搭建过程","aria-hidden":"true"},"#"),n(" I. redis集群搭建过程")],-1),v=s("h3",{id:"_1-获取项目并编译",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#_1-获取项目并编译","aria-hidden":"true"},"#"),n(" 1. 获取项目并编译")],-1),k={href:"https://redis.io/",target:"_blank",rel:"noopener noreferrer"},h=c(`<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 下载redis包</span>
<span class="token function">wget</span> http://download.redis.io/releases/redis-5.0.5.tar.gz
<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> redis-5.0.5

<span class="token comment"># 开始编译</span>
<span class="token function">make</span>
<span class="token function">make</span> <span class="token builtin class-name">test</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过上面执行完毕之后，在src目录下，会生成常见的操作命令，如<code>redis-cli</code> <code>redis-server</code></p><h3 id="_2-开始配置" tabindex="-1"><a class="header-anchor" href="#_2-开始配置" aria-hidden="true">#</a> 2. 开始配置</h3><p>在redis目录下，配置文件<code>redis.conf</code>是我们需要关注的目标</p><p>我们这里在本机搭建三个节点，对应的端口号分别为7000, 7001, 7002</p><p>接下来，进入配置文件，进行修改</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">mkdir</span> <span class="token parameter variable">-p</span> data/7000 data/7001 data/7002 log/7000 log/7001 log/7002 

<span class="token comment"># 下面的配置，一次操作三遍，分别获得r7000.conf r7001.conf r7002.conf</span>
<span class="token function">cp</span> redis.conf r7000.conf
<span class="token function">vim</span> r7000.conf

<span class="token comment">## 下面是我们需要修改的地方</span>
port <span class="token number">7000</span> <span class="token comment"># 端口号</span>
pidfile /var/run/redis_7000.pid <span class="token comment"># pid进程文件</span>

<span class="token comment"># 日志和数据存储路径</span>
logfile <span class="token string">&quot;/home/yihui/redis/log/7000/redis.log&quot;</span>
<span class="token function">dir</span> <span class="token string">&quot;/home/yihui/redis/data/7000/&quot;</span>

<span class="token comment"># 后台启动</span>
daemonize <span class="token function">yes</span>
<span class="token comment"># 开启集群</span>
cluster-enabled <span class="token function">yes</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-启动并设置集群" tabindex="-1"><a class="header-anchor" href="#_3-启动并设置集群" aria-hidden="true">#</a> 3. 启动并设置集群</h3><p>上面设置完毕之后，开始启动redis</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>src/redis-server r7000.conf
src/redis-server r7001.conf
src/redis-server r7002.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>启动完毕之后，可以查看到如下的进程</p><figure><img src="`+p+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>到这里，集群还没有设置完成，还需要通过<code>redis-cli</code>设置一下集群关系</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>redis/src/redis-cli <span class="token parameter variable">--cluster</span> create <span class="token number">127.0</span>.0.1:7000 <span class="token number">127.0</span>.0.1:7001 <span class="token number">127.0</span>.0.1:7002 --cluster-replicas <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>执行上面的命名，发现并不能成功，提示如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>*** ERROR: Invalid configuration <span class="token keyword">for</span> cluster creation.
*** Redis Cluster requires at least <span class="token number">3</span> master nodes.
*** This is not possible with <span class="token number">3</span> nodes and <span class="token number">1</span> replicas per node.
*** At least <span class="token number">6</span> nodes are required.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面表示redis集群必须有三个主节点，当我们设置主从时，最少需要六个节点；当然我们在本机测试的时候，搞六个必要性不大，这里直接不要从节点</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>redis/src/redis-cli <span class="token parameter variable">--cluster</span> create <span class="token number">127.0</span>.0.1:7000 <span class="token number">127.0</span>.0.1:7001 <span class="token number">127.0</span>.0.1:7002
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>执行上面命令并确认之后，redis集群基本上就搭建完毕</p><h3 id="_4-测试" tabindex="-1"><a class="header-anchor" href="#_4-测试" aria-hidden="true">#</a> 4. 测试</h3><p>借助<code>redis-cli</code>进行集群的连接和测试</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>redis/src/redis-cli <span class="token parameter variable">-c</span> <span class="token parameter variable">-p</span> <span class="token number">7000</span>
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">0</span>&gt;</span> cluster nodes
e1bd930c0b6f42da4af18f5aca551fd26d769330 <span class="token number">127.0</span>.0.1:7001@17001 master - <span class="token number">0</span> <span class="token number">1569411511851</span> <span class="token number">2</span> connected <span class="token number">5461</span>-10922
7b8b9ea9feab9dc1c052c4a6215f211c25776e38 <span class="token number">127.0</span>.0.1:7002@17002 master - <span class="token number">0</span> <span class="token number">1569411512853</span> <span class="token number">3</span> connected <span class="token number">10923</span>-16383
d7b8d578eedf9d1148009b6930e5da6bdbd90661 <span class="token number">127.0</span>.0.1:7000@17000 myself,master - <span class="token number">0</span> <span class="token number">1569411512000</span> <span class="token number">1</span> connected <span class="token number">0</span>-5460
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">0</span>&gt;</span> <span class="token builtin class-name">set</span> <span class="token builtin class-name">test</span> <span class="token number">123</span>
-<span class="token operator">&gt;</span> Redirected to slot <span class="token punctuation">[</span><span class="token number">6918</span><span class="token punctuation">]</span> located at <span class="token number">127.0</span>.0.1:7001
OK
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">1</span>&gt;</span> <span class="token builtin class-name">set</span> test2 <span class="token number">1342</span>
OK
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">1</span>&gt;</span> <span class="token builtin class-name">set</span> test3 <span class="token number">123</span>
-<span class="token operator">&gt;</span> Redirected to slot <span class="token punctuation">[</span><span class="token number">13026</span><span class="token punctuation">]</span> located at <span class="token number">127.0</span>.0.1:7002
OK
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span> <span class="token builtin class-name">set</span> test1 <span class="token number">123</span>
-<span class="token operator">&gt;</span> Redirected to slot <span class="token punctuation">[</span><span class="token number">4768</span><span class="token punctuation">]</span> located at <span class="token number">127.0</span>.0.1:7000
OK
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">0</span>&gt;</span> keys *
<span class="token number">1</span><span class="token punctuation">)</span> <span class="token string">&quot;test1&quot;</span>
<span class="token number">127.0</span>.0.1:700<span class="token operator"><span class="token file-descriptor important">0</span>&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过<code>keys</code>命令查看，我们上面设置的几个值分布在三个实例上了</p>`,23);function g(f,_){const e=d("ExternalLinkIcon");return r(),l("div",null,[u,s("blockquote",null,[s("p",null,[n("单机安装手册，可以查看： "),s("a",m,[n("单机redis安装手册"),a(e)])])]),t(" more "),b,v,s("p",null,[n("首先是从官网获取最新稳定版的redis包，官网友链 -> "),s("a",k,[n("https://redis.io/"),a(e)])]),h])}const q=i(o,[["render",g],["__file","02.Redis集群搭建手册.html.vue"]]);export{q as default};

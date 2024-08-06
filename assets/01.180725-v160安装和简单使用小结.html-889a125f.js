import{_ as a,V as i,W as d,a1 as l,X as n,Y as s,Z as r,a0 as t,F as c}from"./framework-23f3cf9b.js";const o={},u=n("h1",{id:"influxdb安装和简单使用小结",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#influxdb安装和简单使用小结","aria-hidden":"true"},"#"),s(" InfluxDB安装和简单使用小结")],-1),p=n("p",null,"InfluxDB是一个时序性数据库，因为工作需求，安装后使用测试下是否支持大数据下的业务场景",-1),v=n("p",null,[n("strong",null,"说明：")],-1),m=n("ul",null,[n("li",null,"安装最新版本 v1.6.0"),n("li",null,"集群版本要收费，单机版本免费"),n("li",null,"内部集成的web控制台被ko掉了")],-1),b=n("h2",{id:"i-安装",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#i-安装","aria-hidden":"true"},"#"),s(" I. 安装")],-1),h=n("p",null,"直接到官网，查询对应的下载安装方式",-1),g={href:"https://docs.influxdata.com/influxdb/v1.6/introduction/installation/",target:"_blank",rel:"noopener noreferrer"},k=t(`<p>安装方式</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SHA256: fa118d657151b6de7c79592cf7516b3d9fada813262d5ebe16516f5c0bf62039
<span class="token function">wget</span> https://dl.influxdata.com/influxdb/releases/influxdb-1.6.0.x86_64.rpm
<span class="token function">sudo</span> yum localinstall influxdb-1.6.0.x86_64.rpm
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>服务启动命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 启动命令</span>
<span class="token function">service</span> influxdb start
<span class="token comment"># 关闭命令</span>
<span class="token function">service</span> influxdb stop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>注意</strong></p><p>默认占用8086/8088两个端口号，可以根据自己的实际场景进行替换，进入配置文件 <code>/etc/influxdb/influxdb.conf</code></p><p>查询 bind-address，其中端口号对应的用处说明如下</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code># Bind address to use for the RPC service for backup and restore.
bind-address = &quot;127.0.0.1:8088&quot;

...

[http]
  # Determines whether HTTP endpoint is enabled.
  # enabled = true

  # The bind address used by the HTTP service.
  bind-address = &quot;:8086&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ii-控制台简单使用" tabindex="-1"><a class="header-anchor" href="#ii-控制台简单使用" aria-hidden="true">#</a> II. 控制台简单使用</h2><p>influx提供了一个控制台进行简单的操作，下面给出基本的使用姿势，对于influxdb的一些概念性问题，放在下一篇专门给与说明</p><p>首先进入控制台</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>influx

<span class="token comment"># 如果修改了端口号，则需要显示指定</span>
<span class="token comment"># influx -port xxx</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-database相关" tabindex="-1"><a class="header-anchor" href="#_1-database相关" aria-hidden="true">#</a> 1. database相关</h3><p>这个数据库和我们平常接触比较多的mysql中的数据库差不多，使用姿势也相差无几</p><h4 id="a-显示所有的数据库" tabindex="-1"><a class="header-anchor" href="#a-显示所有的数据库" aria-hidden="true">#</a> a. 显示所有的数据库</h4><p>说明： <code>&gt;后面跟的是命令，后面的是输出结果</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show databases
name: databases
name
----
_internal
hh_test
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="b-创建数据库" tabindex="-1"><a class="header-anchor" href="#b-创建数据库" aria-hidden="true">#</a> b. 创建数据库</h4><p>和mysql语法一致， <code>create database xxx</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> create database mytest
<span class="token operator">&gt;</span> show databases
name: databases
name
----
_internal
hh_test
mytest
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="c-删除数据库" tabindex="-1"><a class="header-anchor" href="#c-删除数据库" aria-hidden="true">#</a> c. 删除数据库</h4><p>使用drop进行删除，<code>drop database xxx</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> drop database mytest
<span class="token operator">&gt;</span> show databases
name: databases
name
----
_internal
hh_test
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="d-选择数据库" tabindex="-1"><a class="header-anchor" href="#d-选择数据库" aria-hidden="true">#</a> d. 选择数据库</h4><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> use hh_test
Using database hh_test
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-表相关" tabindex="-1"><a class="header-anchor" href="#_2-表相关" aria-hidden="true">#</a> 2. 表相关</h3><p>在influxDB中，表不是我们传统理解的table，在这里，专业术语叫做 <code>measurement</code> (度量？）</p><p>查看所有的measurement的命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>show measurements<span class="token punctuation">;</span>
name: measurements
name
----
trade
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>不同于mysql，没有提供专门的创建表，新插入数据，就会自动创建一个不存在的表</p><h3 id="_1-新增数据" tabindex="-1"><a class="header-anchor" href="#_1-新增数据" aria-hidden="true">#</a> 1. 新增数据</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>insert &lt;tbname&gt;,&lt;tags&gt; &lt;values&gt; [timestamp]    
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>说明：</p><ul><li>tbname : 数据表名称</li><li>tags : 表的tag域</li><li>values : 表的value域</li><li>timestamp ：当前数据的时间戳（可选，没有提供的话系统会自带添加）</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert students,addr<span class="token operator">=</span>wuhan <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">124</span>

<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from students
name: students
<span class="token function">time</span>                addr  phone
----                ----  -----
<span class="token number">1532514647456815845</span> wuhan <span class="token number">124</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-查询" tabindex="-1"><a class="header-anchor" href="#_2-查询" aria-hidden="true">#</a> 2. 查询</h3><p>查询和sql类似，基本结构如下，但是有很多的限制，后面详解</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>select * from table where condition group by xxx order by time asc limit 10
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>一个实例case</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert students,addr<span class="token operator">=</span>wuhan <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">124</span>
<span class="token operator">&gt;</span> insert students,addr<span class="token operator">=</span>wuhan <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">123</span>
<span class="token operator">&gt;</span> insert students,addr<span class="token operator">=</span>changsha <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">15</span>

<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from students where phone<span class="token operator">&gt;</span><span class="token number">0</span> group by addr order by <span class="token function">time</span> desc limit <span class="token number">10</span><span class="token punctuation">;</span>
name: students
tags: <span class="token assign-left variable">addr</span><span class="token operator">=</span>wuhan
<span class="token function">time</span>                phone
----                -----
<span class="token number">1532515056470523491</span> <span class="token number">123</span>
<span class="token number">1532515052664001894</span> <span class="token number">124</span>

name: students
tags: <span class="token assign-left variable">addr</span><span class="token operator">=</span>changsha
<span class="token function">time</span>                phone
----                -----
<span class="token number">1532515064351295620</span> <span class="token number">15</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-更新与删除" tabindex="-1"><a class="header-anchor" href="#_3-更新与删除" aria-hidden="true">#</a> 3. 更新与删除</h3><p>当需要更新一个记录时，直接覆盖一个时间戳+所有的tag相等的即可</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from students
name: students
<span class="token function">time</span>                addr     phone
----                ----     -----
<span class="token number">1532515052664001894</span> wuhan    <span class="token number">124</span>
<span class="token number">1532515056470523491</span> wuhan    <span class="token number">123</span>
<span class="token number">1532515064351295620</span> changsha <span class="token number">15</span>


<span class="token operator">&gt;</span> insert students,addr<span class="token operator">=</span>wuhan <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">111123</span> <span class="token number">1532515052664001894</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from students
name: students
<span class="token function">time</span>                addr     phone
----                ----     -----
<span class="token number">1532515052664001894</span> wuhan    <span class="token number">111123</span>
<span class="token number">1532515056470523491</span> wuhan    <span class="token number">123</span>
<span class="token number">1532515064351295620</span> changsha <span class="token number">15</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>删除一条记录，用delete命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from students
name: students
<span class="token function">time</span>                addr     phone
----                ----     -----
<span class="token number">1532515052664001894</span> wuhan    <span class="token number">111123</span>
<span class="token number">1532515056470523491</span> changsha <span class="token number">123</span>
<span class="token number">1532515056470523491</span> wuhan    <span class="token number">123</span>


<span class="token operator">&gt;</span> delete from students where <span class="token assign-left variable">time</span><span class="token operator">=</span><span class="token number">1532515056470523491</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from students
name: students
<span class="token function">time</span>                addr  phone
----                ----  -----
<span class="token number">1532515052664001894</span> wuhan <span class="token number">111123</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-删除表" tabindex="-1"><a class="header-anchor" href="#_4-删除表" aria-hidden="true">#</a> 4. 删除表</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>drop measurement students
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,47);function f(x,_){const e=c("ExternalLinkIcon");return i(),d("div",null,[u,p,l(" more "),v,m,b,h,n("ul",null,[n("li",null,[n("a",g,[s("Installing InfluxDB OSS"),r(e)])])]),k])}const y=a(o,[["render",f],["__file","01.180725-v160安装和简单使用小结.html.vue"]]);export{y as default};

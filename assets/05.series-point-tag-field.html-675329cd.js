import{_ as o,V as l,W as p,a1 as i,X as s,Y as e,Z as t,a0 as n,F as r}from"./framework-23f3cf9b.js";const c={},d=s("p",null,"influxdb中的一条记录point，主要可以分为三类，必须存在的time（时间），string类型的tag，以及其他成员field；而series则是一个measurement中保存策略和tag集构成；本篇教程将介绍一些这几个概念",-1),u=n(`<h3 id="_1-tag" tabindex="-1"><a class="header-anchor" href="#_1-tag" aria-hidden="true">#</a> 1. tag</h3><p>influxdb数据结构中记录元数据（metadata）的kv对，不要求必须存在，tag key/value 都是字符串类型，而且会建立索引，因此基于tag进行查询效率比单纯的基于field进行查询是要高的；后续的一些sql也会发现，某些查询只能基于tag</p><p><strong>重点提炼</strong></p><ul><li>tag key/value: 字符串类型</li><li>有索引</li></ul><p>常见的查询tag的语法如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>show tag keys on <span class="token operator">&lt;</span>database<span class="token operator">&gt;</span> from <span class="token operator">&lt;</span>measurement<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>下面给出一个实际的例子, insert语句后面会说到，我们塞入的一条数据，指定name为tag，另外三个为field</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰 <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">26</span>,id<span class="token operator">=</span><span class="token number">10</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://blog.hhui.top&quot;</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name
----                --- ----                 -- ----
<span class="token number">1563888301725811554</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token operator">&gt;</span> show tag keys from yhh
name: yhh
tagKey
------
name
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面是获取tag keys的查询方式，下面介绍下查询tag values的使用姿势</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>show tag values on <span class="token operator">&lt;</span>database<span class="token operator">&gt;</span> from <span class="token operator">&lt;</span>measurement<span class="token operator">&gt;</span> with KEY <span class="token punctuation">[</span> <span class="token punctuation">[</span><span class="token operator">&lt;</span>operator<span class="token operator">&gt;</span> <span class="token string">&quot;&lt;tag_key&gt;&quot;</span> <span class="token operator">|</span> <span class="token operator">&lt;</span>regular_expression<span class="token operator">&gt;</span><span class="token punctuation">]</span> <span class="token operator">|</span> <span class="token punctuation">[</span>IN <span class="token punctuation">(</span><span class="token string">&quot;&lt;tag_key1&gt;&quot;</span>,<span class="token string">&quot;&lt;tag_key2&quot;</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>WHERE <span class="token operator">&lt;</span>tag_key<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>operator<span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token string">&#39;&lt;tag_value&gt;&#39;</span> <span class="token operator">|</span> <span class="token operator">&lt;</span>regular_expression<span class="token operator">&gt;</span><span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>LIMIT_clause<span class="token punctuation">]</span> <span class="token punctuation">[</span>OFFSET_clause<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>with key 后面带上查询条件，必须存在，如查询汇率表中，base_symbol有哪些</li><li>连接符号可以为：等于 <code>=</code>, 不等于：<code>!=</code>, <code>&lt;&gt;</code>, 正则：<code>=~</code>, <code>!~</code></li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show tag values from currency_rate with <span class="token assign-left variable">key</span><span class="token operator">=</span><span class="token string">&quot;base&quot;</span>
name: currency_rate
key  value
---  -----
base AUD
base CAD
base CNY
base DKK
base EUR
base GBP
base HKD
base IDR
base INR
base JPY
base KRW
base NZD
base PHP
base PLN
base RUB
base SGD
base THB
base TRY
base UAH
base USD
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-field" tabindex="-1"><a class="header-anchor" href="#_2-field" aria-hidden="true">#</a> 2. field</h3><p>成员，也可以理解为一条记录中，不需要建立索引的数据，一般来说，不太会有参与查询语句建设的可以设置为field</p><p>区别与tag，field有下面几个特性</p><ul><li>类型可以为：浮点，字符串，整形</li><li>没有索引</li></ul><p>查看field key的语句如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>show field keys on <span class="token operator">&lt;</span>database<span class="token operator">&gt;</span> from <span class="token operator">&lt;</span>measurement<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>下面演示一下查看的姿势</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show field keys from yhh
name: yhh
fieldKey fieldType
-------- ---------
age      float
blog     string
<span class="token function">id</span>       float
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-point" tabindex="-1"><a class="header-anchor" href="#_3-point" aria-hidden="true">#</a> 3. point</h3>`,21),m={href:"https://docs.influxdata.com/influxdb/v1.7/concepts/glossary/#point",target:"_blank",rel:"noopener noreferrer"},b=n('<p>在influxdb中，你可以将一条mysql中的记录简单的理解为一个point，它由四个组件</p><ul><li>measurement</li><li>tag set</li><li>field set</li><li>timestamp</li></ul><p>每个point是根据 <code>timestamp + series</code> 来保证唯一性。</p><p>关于point可以怎么理解呢？因为influxdb是时序数据库，简单来讲就是每个数据都是时间轴上的一个点，这些数据与时间强相关，其中的tag用来检索，field用来记录一些信息，measurement用来将相同类型的数据归集</p><h3 id="_4-series" tabindex="-1"><a class="header-anchor" href="#_4-series" aria-hidden="true">#</a> 4. series</h3>',5),v={href:"https://docs.influxdata.com/influxdb/v1.7/concepts/glossary/#series",target:"_blank",rel:"noopener noreferrer"},h=n(`<p>上面说到point的唯一性时，说到了series，这个概念又是啥呢？</p><p>官方的说明是:</p><blockquote><p>The collection of data in the InfluxDB data structure that share a measurement, tag set, and retention policy.</p><p>influxdb中measurement + tags set + retention policy 组成的数据集合</p></blockquote><p>直接看定义可能有点懵逼，官方提供查看series的命令如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>show series on <span class="token operator">&lt;</span>database<span class="token operator">&gt;</span> from <span class="token operator">&lt;</span>measurement<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>下面是几个实例辅助说明</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰 <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">26</span>,id<span class="token operator">=</span><span class="token number">10</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://blog.hhui.top&quot;</span>
<span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰 <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">30</span>,id<span class="token operator">=</span><span class="token number">11</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://blog.hhui.top&quot;</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh<span class="token punctuation">;</span>
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name
----                --- ----                 -- ----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token operator">&gt;</span> show series on <span class="token builtin class-name">test</span> from yhh
key
---
yhh,name<span class="token operator">=</span>一灰灰
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们插入两个<code>point</code>到<code>yhh</code>这个<code>measurement</code>中，但是他们的tag相同都是<code>一灰灰</code>，此时我们查看series时，发现只有一条<code>yhh,name=一灰灰</code>，包含<code>measurement</code>和<code>tag set</code></p><p>接下来我们试一下，新增一个tag，series是否会增加呢？</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰2 <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">30</span>,id<span class="token operator">=</span><span class="token number">11</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://blog.hhui.top&quot;</span>
<span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰3,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">30</span>,id<span class="token operator">=</span><span class="token number">11</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://blog.hhui.top&quot;</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
<span class="token operator">&gt;</span> show series on <span class="token builtin class-name">test</span> from yhh
key
---
yhh,name<span class="token operator">=</span>一灰灰
yhh,name<span class="token operator">=</span>一灰灰2
yhh,name<span class="token operator">=</span>一灰灰3,phone<span class="token operator">=</span><span class="token number">110</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>官方定义中series还与保存策略有关，前面两个case都是默认的保存测录，我们现在在新的保存策略中测试</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> create retention policy <span class="token string">&quot;1D&quot;</span> on <span class="token builtin class-name">test</span> duration 1d replication <span class="token number">1</span>
<span class="token operator">&gt;</span> insert into <span class="token string">&quot;1D&quot;</span> yhh,name<span class="token operator">=</span>一灰灰4 <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">26</span>,id<span class="token operator">=</span><span class="token number">10</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://blog.hhui.top&quot;</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh<span class="token punctuation">;</span>
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;1D&quot;</span>.yhh
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563890614849474879</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰4
<span class="token operator">&gt;</span> show series
key
---
yhh,name<span class="token operator">=</span>一灰灰
yhh,name<span class="token operator">=</span>一灰灰2
yhh,name<span class="token operator">=</span>一灰灰3,phone<span class="token operator">=</span><span class="token number">110</span>
yhh,name<span class="token operator">=</span>一灰灰4
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>插入到&quot;1D&quot;保存策略中的point也构成了一个series: <code>yhh,name=一灰灰4</code></p><p><strong>注意</strong></p><p><code>show series</code>预计中还支持基于<code>tag</code>的<code>where</code>查询，下面是一个简单的示例</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>show series from yhh where <span class="token string">&quot;name&quot;</span> <span class="token operator">=</span> <span class="token string">&#39;一灰灰&#39;</span>
key
---
yhh,name<span class="token operator">=</span>一灰灰
<span class="token operator">&gt;</span> show series from yhh where phone <span class="token operator">!=</span> <span class="token string">&#39;&#39;</span>
key
---
yhh,name<span class="token operator">=</span>一灰灰3,phone<span class="token operator">=</span><span class="token number">110</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,16);function k(g,f){const a=r("ExternalLinkIcon");return l(),p("div",null,[d,i(" more "),u,s("blockquote",null,[s("p",null,[s("a",m,[e("https://docs.influxdata.com/influxdb/v1.7/concepts/glossary/#point"),t(a)])])]),b,s("blockquote",null,[s("p",null,[s("a",v,[e("https://docs.influxdata.com/influxdb/v1.7/concepts/glossary/#series"),t(a)])])]),h])}const _=o(c,[["render",k],["__file","05.series-point-tag-field.html.vue"]]);export{_ as default};

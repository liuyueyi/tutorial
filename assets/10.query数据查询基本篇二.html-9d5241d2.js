import{_ as e,V as p,W as l,Z as n,a1 as s,$ as t,X as i,Y as o,F as c}from"./framework-b1bd8911.js";const r={},u=n("p",null,"前面一篇介绍了influxdb中基本的查询操作，在结尾处提到了如果我们希望对查询的结果进行分组，排序，分页时，应该怎么操作，接下来我们看一下上面几个场景的支持",-1),d={href:"https://blog.hhui.top/hexblog/2019/08/13/190813-Influx-Sql%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E5%85%AB%EF%BC%9Aquery%E6%95%B0%E6%8D%AE%E6%9F%A5%E8%AF%A2%E5%9F%BA%E6%9C%AC%E7%AF%87/",target:"_blank",rel:"noopener noreferrer"},m=o(`<h3 id="_0-数据准备" tabindex="-1"><a class="header-anchor" href="#_0-数据准备" aria-hidden="true">#</a> 0. 数据准备</h3><p>在开始查询之前，先看一下我们准备的数据，其中<code>name,phone</code>为tag, <code>age,blog,id</code>为field</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>&gt; select * from yhh
name: yhh
time                age blog                 id name phone
----                --- ----                 -- ---- -----
1563889538654374538 26  http://blog.hhui.top 10 一灰灰
1563889547738266214 30  http://blog.hhui.top 11 一灰灰
1563889704754695002 30  http://blog.hhui.top 11 一灰灰2
1563889723440000821 30  http://blog.hhui.top 11 一灰灰3 110


&gt; show tag keys from yhh
name: yhh
tagKey
------
name
phone
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-分组查询" tabindex="-1"><a class="header-anchor" href="#_1-分组查询" aria-hidden="true">#</a> 1. 分组查询</h3><p>和sql语法一样，influxdb sql的分组也是使用<code>group by</code>语句，其定义如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT_clause FROM_clause <span class="token punctuation">[</span>WHERE_clause<span class="token punctuation">]</span> GROUP BY <span class="token punctuation">[</span>* <span class="token operator">|</span> <span class="token operator">&lt;</span>tag_key<span class="token operator">&gt;</span><span class="token punctuation">[</span>,<span class="token operator">&lt;</span>tag_key<span class="token punctuation">]</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="a-group-by-tag" tabindex="-1"><a class="header-anchor" href="#a-group-by-tag" aria-hidden="true">#</a> a. group by tag</h4><p>从上面的定义中，有一点需要特别强调，<strong>用来分组的必须是tag</strong>，也就是说对于influxdb而言，不支持根据field进行分组</p><p>一个实际的演示如下:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh group by phone
name: yhh
tags: <span class="token assign-left variable">phone</span><span class="token operator">=</span>
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name
----                --- ----                 -- ----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2

name: yhh
tags: <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">110</span>
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name
----                --- ----                 -- ----
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意上面的输出结果，比较有意思，分成了两个结构段落，且可以输出完整的数据；而mysql的分组查询条件中一般需要带上分组key，然后实现一些数据上的聚合查询</p><p>如果我的分组中，使用field进行分组查询，会怎样？报错么?</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh group by age
name: yhh
tags: <span class="token assign-left variable">age</span><span class="token operator">=</span>
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面的case中可以看出，虽然执行了，但是返回的结果并不是我们预期的。</p><h4 id="b-group-by" tabindex="-1"><a class="header-anchor" href="#b-group-by" aria-hidden="true">#</a> b. group by *</h4><p>另外一个与一般SQL语法不一样的是<code>group by</code> 后面可以跟上<code>*</code>，表示根据所有的tag进行分组，一个测试如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh group by *
name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰, <span class="token assign-left variable">phone</span><span class="token operator">=</span>
<span class="token function">time</span>                age blog                 <span class="token function">id</span>
----                --- ----                 --
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span>
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰2, <span class="token assign-left variable">phone</span><span class="token operator">=</span>
<span class="token function">time</span>                age blog                 <span class="token function">id</span>
----                --- ----                 --
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰3, <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">110</span>
<span class="token function">time</span>                age blog                 <span class="token function">id</span>
----                --- ----                 --
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="c-group-by-time" tabindex="-1"><a class="header-anchor" href="#c-group-by-time" aria-hidden="true">#</a> c. group by time</h4><p>除了上面的根据tag进行分组之外，还有一个更高级的特性，根据时间来分组，这个时间还支持一些简单的函数操作</p><p>定义如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT <span class="token operator">&lt;</span>function<span class="token operator">&gt;</span><span class="token punctuation">(</span><span class="token operator">&lt;</span>field_key<span class="token operator">&gt;</span><span class="token punctuation">)</span> FROM_clause WHERE <span class="token operator">&lt;</span>time_range<span class="token operator">&gt;</span> GROUP BY time<span class="token punctuation">(</span><span class="token operator">&lt;</span>time_interval<span class="token operator">&gt;</span><span class="token punctuation">)</span>,<span class="token punctuation">[</span>tag_key<span class="token punctuation">]</span> <span class="token punctuation">[</span>fill<span class="token punctuation">(</span><span class="token operator">&lt;</span>fill_option<span class="token operator">&gt;</span><span class="token punctuation">)</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>我们知道influxdb的一个重要应用场景就是监控的记录，在监控面板上经常会有的就是根据时间进行聚合，比如查询某个服务每分钟的异常数，qps, rt等</p><p>下面给出一个简单的使用case</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 为了显示方便，将数据的时间戳改成日期方式展示</span>
<span class="token operator">&gt;</span> precision rfc3339

<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh
name: yhh
<span class="token function">time</span>                           age blog                 <span class="token function">id</span> name phone
----                           --- ----                 -- ---- -----
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">2019</span>-07-23T13:45:47.738266214Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">2019</span>-07-23T13:48:24.754695002Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> count<span class="token punctuation">(</span>*<span class="token punctuation">)</span> from yhh where time<span class="token operator">&gt;</span><span class="token string">&#39;2019-07-23T13:44:38.654374538Z&#39;</span> and time<span class="token operator">&lt;</span><span class="token string">&#39;2019-07-23T13:50:43.440000821Z&#39;</span>  GROUP BY time<span class="token punctuation">(</span>2m<span class="token punctuation">)</span>
name: yhh
<span class="token function">time</span>                 count_age count_blog count_id
----                 --------- ---------- --------
<span class="token number">2019</span>-07-23T13:44:00Z <span class="token number">2</span>         <span class="token number">2</span>          <span class="token number">2</span>
<span class="token number">2019</span>-07-23T13:46:00Z <span class="token number">0</span>         <span class="token number">0</span>          <span class="token number">0</span>
<span class="token number">2019</span>-07-23T13:48:00Z <span class="token number">2</span>         <span class="token number">2</span>          <span class="token number">2</span>
<span class="token number">2019</span>-07-23T13:50:00Z <span class="token number">0</span>         <span class="token number">0</span>          <span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上面的查询语句中，有几个地方需要说明一下</p><ul><li>select后面跟上的是单个or多个field的聚合操作，根据时间进行分组时，不允许查询具体的field值，否则会有下面的错误提示<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh where time<span class="token operator">&gt;</span><span class="token string">&#39;2019-07-23T13:44:38.654374538Z&#39;</span> and time<span class="token operator">&lt;</span><span class="token string">&#39;2019-07-23T13:50:43.440000821Z&#39;</span>  GROUP BY time<span class="token punctuation">(</span>2m<span class="token punctuation">)</span>
ERR: GROUP BY requires at least one aggregate <span class="token keyword">function</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div></li><li>where条件限定查询的时间范围，否则会得到很多数据</li><li><code>group by time(2m)</code> 表示每2分钟做一个分组， <code>group by time(2s)</code>则表示每2s做一个分组</li></ul><h3 id="_2-排序" tabindex="-1"><a class="header-anchor" href="#_2-排序" aria-hidden="true">#</a> 2. 排序</h3><p>在influxdb中排序，只支持针对time进行排序，其他的field，tag（因为是string类型，也没法排）是不能进行排序的</p><p>语法比较简单，如下，根据时间倒序/升序</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>order by <span class="token function">time</span> desc/asc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>一个简单的实例如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 根据非time进行排序时，直接报错</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh order by age
ERR: error parsing query: only ORDER BY <span class="token function">time</span> supported at this <span class="token function">time</span>


<span class="token comment"># 根据时间进行倒排</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh order by <span class="token function">time</span> desc
name: yhh
<span class="token function">time</span>                           age blog                 <span class="token function">id</span> name phone
----                           --- ----                 -- ---- -----
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
<span class="token number">2019</span>-07-23T13:48:24.754695002Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">2019</span>-07-23T13:45:47.738266214Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-查询限制" tabindex="-1"><a class="header-anchor" href="#_3-查询限制" aria-hidden="true">#</a> 3. 查询限制</h3><p>我们常见的分页就是limit语句，我们常见的limit语句为 <code>limit page, size</code>，可以实现分页；然而在influxdb中则不同，limit后面只能跟上一个数字，表示限定查询的最多条数</p><h4 id="a-limit" tabindex="-1"><a class="header-anchor" href="#a-limit" aria-hidden="true">#</a> a. limit</h4><p>N指定每次measurement返回的point个数</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT_clause <span class="token punctuation">[</span>INTO_clause<span class="token punctuation">]</span> FROM_clause <span class="token punctuation">[</span>WHERE_clause<span class="token punctuation">]</span> <span class="token punctuation">[</span>GROUP_BY_clause<span class="token punctuation">]</span> <span class="token punctuation">[</span>ORDER_BY_clause<span class="token punctuation">]</span> LIMIT <span class="token operator">&lt;</span>N<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>下满给出几个实际的case</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh limit <span class="token number">2</span>
name: yhh
<span class="token function">time</span>                           age blog                 <span class="token function">id</span> name phone
----                           --- ----                 -- ---- -----
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">2019</span>-07-23T13:45:47.738266214Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰

<span class="token comment"># 分组之后，再限定查询条数</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh group by <span class="token string">&quot;name&quot;</span> limit <span class="token number">1</span>
name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰
<span class="token function">time</span>                           age blog                 <span class="token function">id</span> phone
----                           --- ----                 -- -----
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰2
<span class="token function">time</span>                           age blog                 <span class="token function">id</span> phone
----                           --- ----                 -- -----
<span class="token number">2019</span>-07-23T13:48:24.754695002Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰3
<span class="token function">time</span>                           age blog                 <span class="token function">id</span> phone
----                           --- ----                 -- -----
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> <span class="token number">110</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="b-slimit" tabindex="-1"><a class="header-anchor" href="#b-slimit" aria-hidden="true">#</a> b. slimit</h4><p>N指定从指定measurement返回的series数</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT_clause <span class="token punctuation">[</span>INTO_clause<span class="token punctuation">]</span> FROM_clause <span class="token punctuation">[</span>WHERE_clause<span class="token punctuation">]</span> GROUP BY *<span class="token punctuation">[</span>,time<span class="token punctuation">(</span><span class="token operator">&lt;</span>time_interval<span class="token operator">&gt;</span><span class="token punctuation">)</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>ORDER_BY_clause<span class="token punctuation">]</span> SLIMIT <span class="token operator">&lt;</span>N<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>接下来演示下这个的使用姿势，首先准备插入几条数据，确保tag相同</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">blog</span><span class="token operator">=</span><span class="token string">&quot;http://spring.hhui.top&quot;</span>,age<span class="token operator">=</span><span class="token number">14</span>,id<span class="token operator">=</span><span class="token number">14</span>
<span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">blog</span><span class="token operator">=</span><span class="token string">&quot;http://spring.hhui.top&quot;</span>,age<span class="token operator">=</span><span class="token number">15</span>,id<span class="token operator">=</span><span class="token number">15</span>
<span class="token operator">&gt;</span> insert yhh,name<span class="token operator">=</span>一灰灰,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">blog</span><span class="token operator">=</span><span class="token string">&quot;http://spring.hhui.top&quot;</span>,age<span class="token operator">=</span><span class="token number">16</span>,id<span class="token operator">=</span><span class="token number">16</span>



<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh
name: yhh
<span class="token function">time</span>                           age blog                   <span class="token function">id</span> name phone
----                           --- ----                   -- ---- -----
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top   <span class="token number">10</span> 一灰灰
<span class="token number">2019</span>-07-23T13:45:47.738266214Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰
<span class="token number">2019</span>-07-23T13:48:24.754695002Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰2
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:06.804162557Z <span class="token number">14</span>  http://spring.hhui.top <span class="token number">14</span> 一灰灰  <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:10.146588721Z <span class="token number">15</span>  http://spring.hhui.top <span class="token number">15</span> 一灰灰  <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:12.753413004Z <span class="token number">16</span>  http://spring.hhui.top <span class="token number">16</span> 一灰灰  <span class="token number">110</span>
<span class="token operator">&gt;</span> show series on <span class="token builtin class-name">test</span> from yhh
key
---
yhh,name<span class="token operator">=</span>一灰灰
yhh,name<span class="token operator">=</span>一灰灰,phone<span class="token operator">=</span><span class="token number">110</span>
yhh,name<span class="token operator">=</span>一灰灰2
yhh,name<span class="token operator">=</span>一灰灰3,phone<span class="token operator">=</span><span class="token number">110</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如下面的一个使用case</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh group by * slimit <span class="token number">3</span>
name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰, <span class="token assign-left variable">phone</span><span class="token operator">=</span>
<span class="token function">time</span>                           age blog                 <span class="token function">id</span>
----                           --- ----                 --
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span>
<span class="token number">2019</span>-07-23T13:45:47.738266214Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰, <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">110</span>
<span class="token function">time</span>                           age blog                   <span class="token function">id</span>
----                           --- ----                   --
<span class="token number">2019</span>-08-14T11:18:06.804162557Z <span class="token number">14</span>  http://spring.hhui.top <span class="token number">14</span>
<span class="token number">2019</span>-08-14T11:18:10.146588721Z <span class="token number">15</span>  http://spring.hhui.top <span class="token number">15</span>
<span class="token number">2019</span>-08-14T11:18:12.753413004Z <span class="token number">16</span>  http://spring.hhui.top <span class="token number">16</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰2, <span class="token assign-left variable">phone</span><span class="token operator">=</span>
<span class="token function">time</span>                           age blog                 <span class="token function">id</span>
----                           --- ----                 --
<span class="token number">2019</span>-07-23T13:48:24.754695002Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>

name: yhh
tags: <span class="token assign-left variable">name</span><span class="token operator">=</span>一灰灰3, <span class="token assign-left variable">phone</span><span class="token operator">=</span><span class="token number">110</span>
<span class="token function">time</span>                           age blog                 <span class="token function">id</span>
----                           --- ----                 --
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>说实话，这一块没看懂，根据官方的文档进行翻译的，没有get这个slimit的特点</strong></p><h3 id="_4-分页" tabindex="-1"><a class="header-anchor" href="#_4-分页" aria-hidden="true">#</a> 4. 分页</h3><p>上面只有point个数限制，但是分页怎么办？难道不支持么？</p><p>在influxdb中，有专门的offset来实现分页</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT_clause <span class="token punctuation">[</span>INTO_clause<span class="token punctuation">]</span> FROM_clause <span class="token punctuation">[</span>WHERE_clause<span class="token punctuation">]</span> <span class="token punctuation">[</span>GROUP_BY_clause<span class="token punctuation">]</span> <span class="token punctuation">[</span>ORDER_BY_clause<span class="token punctuation">]</span> LIMIT_clause OFFSET <span class="token operator">&lt;</span>N<span class="token operator">&gt;</span> <span class="token punctuation">[</span>SLIMIT_clause<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>简单来讲，就是<code>limit 条数 offset 偏移</code></p><p>使用实例</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh
name: yhh
<span class="token function">time</span>                           age blog                   <span class="token function">id</span> name phone
----                           --- ----                   -- ---- -----
<span class="token number">2019</span>-07-23T13:45:38.654374538Z <span class="token number">26</span>  http://blog.hhui.top   <span class="token number">10</span> 一灰灰
<span class="token number">2019</span>-07-23T13:45:47.738266214Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰
<span class="token number">2019</span>-07-23T13:48:24.754695002Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰2
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:06.804162557Z <span class="token number">14</span>  http://spring.hhui.top <span class="token number">14</span> 一灰灰  <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:10.146588721Z <span class="token number">15</span>  http://spring.hhui.top <span class="token number">15</span> 一灰灰  <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:12.753413004Z <span class="token number">16</span>  http://spring.hhui.top <span class="token number">16</span> 一灰灰  <span class="token number">110</span>



<span class="token comment"># 查询结果只有2条数据，从第三个开始（0开始计数）</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh limit <span class="token number">2</span> offset <span class="token number">3</span>
name: yhh
<span class="token function">time</span>                           age blog                   <span class="token function">id</span> name phone
----                           --- ----                   -- ---- -----
<span class="token number">2019</span>-07-23T13:48:43.440000821Z <span class="token number">30</span>  http://blog.hhui.top   <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>
<span class="token number">2019</span>-08-14T11:18:06.804162557Z <span class="token number">14</span>  http://spring.hhui.top <span class="token number">14</span> 一灰灰  <span class="token number">110</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh limit <span class="token number">2</span> offset <span class="token number">3</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-小结" tabindex="-1"><a class="header-anchor" href="#_5-小结" aria-hidden="true">#</a> 5. 小结</h3><p>本篇influxdb的查询篇主要介绍了sql中的三种常用case，分组，排序，分页；虽然使用姿势和我们常见的SQL大同小异，但是一些特殊点需要额外注意一下</p><ul><li>分组查询时，注意分组的key必须是time或者tag，分组查询可以返回完整的point</li><li>排序，只支持根据时间进行排序，其他的字段都不支持</li><li>分页，需要注意<code>limit size offset startIndex</code>和我们一般的使用case不同，它的两个参数分别表示查询的point个数，以及偏移量；而不是传统sql中的页和条数</li></ul>`,57);function b(v,k){const a=c("ExternalLinkIcon");return p(),l("div",null,[u,n("blockquote",null,[n("p",null,[s("在开始本文之前，建议先阅读上篇博文: "),n("a",d,[s("190813-Influx Sql系列教程八：query数据查询基本篇"),t(a)])])]),i(" more "),m])}const g=e(r,[["render",b],["__file","10.query数据查询基本篇二.html.vue"]]);export{g as default};

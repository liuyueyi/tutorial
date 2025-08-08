import{_ as n,V as s,W as e,X as a,Y as t,a1 as l}from"./framework-094145d2.js";const i={},o=t("p",null,"前面几篇介绍了InfluxDB的添加，删除修改数据，接下来进入查询篇，掌握一定的SQL知识对于理解本篇博文有更好的帮助，下面在介绍查询的基础操作的同时，也会给出InfluxSql与SQL之间的一些差别",-1),p=l(`<p>在开始之前，先看一下供查询的数据</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show measurements
name: measurements
name
----
yhh


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>


<span class="token operator">&gt;</span> show tag keys from yhh
name: yhh
tagKey
------
name
phone
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-基本查询" tabindex="-1"><a class="header-anchor" href="#_1-基本查询" aria-hidden="true">#</a> 1. 基本查询</h3><p>基本查询语法如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT <span class="token operator">&lt;</span>field_key<span class="token operator">&gt;</span><span class="token punctuation">[</span>,<span class="token operator">&lt;</span>field_key<span class="token operator">&gt;</span>,<span class="token operator">&lt;</span>tag_key<span class="token operator">&gt;</span><span class="token punctuation">]</span> FROM <span class="token operator">&lt;</span>measurement_name<span class="token operator">&gt;</span><span class="token punctuation">[</span>,<span class="token operator">&lt;</span>measurement_name<span class="token operator">&gt;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>上面的语法中，划分了select和from两块</p><p><strong>select语句</strong></p><ul><li><code>select *</code> : 表示查询所有的field和tag对应的值</li><li><code>select field_key</code>: 表示查询特定的field对应的值</li><li><code>select tag_key</code>: 表示查询的特定的tag对应的值</li><li><code>SELECT &quot;&lt;field_key&gt;&quot;::field,&quot;&lt;tag_key&gt;&quot;::tag</code>: 注意<code>::field</code>和<code>::tag</code>用来限定这个数据的类型为tag或者是field</li></ul><p><strong>from语句</strong></p><p>from后面需要接上measurement，表示从这个mesaurement中查询数据</p><ul><li><code>FROM &lt;measurement_name&gt;</code> 从指定的measurement中获取数据</li><li><code>FROM &lt;measurement_name&gt;,&lt;measurement_name&gt; </code> 从多个measurement中获取数据</li><li><code>FROM &lt;database_name&gt;.&lt;retention_policy_name&gt;.&lt;measurement_name&gt;</code> 从某个数据库中某个保留策略中查询measurement中的数据</li></ul><p><strong>实例演示</strong></p><p>下面给出几个简答的演示实例，分别介绍查询指定的field/tag的方式</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> age from yhh<span class="token punctuation">;</span>
name: yhh
<span class="token function">time</span>                age
----                ---
<span class="token number">1563889538654374538</span> <span class="token number">26</span>
<span class="token number">1563889547738266214</span> <span class="token number">30</span>
<span class="token number">1563889704754695002</span> <span class="token number">30</span>
<span class="token number">1563889723440000821</span> <span class="token number">30</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> <span class="token string">&quot;age&quot;</span>::field, <span class="token string">&quot;name&quot;</span>::tag from yhh<span class="token punctuation">;</span>
name: yhh
<span class="token function">time</span>                age name
----                --- ----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  一灰灰2
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  一灰灰3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-保留策略数据查询" tabindex="-1"><a class="header-anchor" href="#_2-保留策略数据查询" aria-hidden="true">#</a> 2. 保留策略数据查询</h3><p>上面的定义中，说明了可以查询指定保留策略中的数据，下面演示一下应该如何实现</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 创建保留策略</span>
<span class="token operator">&gt;</span> create retention policy <span class="token string">&quot;1D&quot;</span> duration 1d on <span class="token builtin class-name">test</span>


<span class="token comment"># 插入一条数据</span>
<span class="token operator">&gt;</span> insert into <span class="token string">&quot;1D&quot;</span> yhh,name<span class="token operator">=</span>二灰,phone<span class="token operator">=</span><span class="token number">119</span> <span class="token assign-left variable">email</span><span class="token operator">=</span><span class="token string">&quot;bangzewu@126.com&quot;</span>,blog<span class="token operator">=</span><span class="token string">&quot;http://spring.hhui.top&quot;</span>,id<span class="token operator">=</span><span class="token number">27</span>


<span class="token comment"># 查询</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;1D&quot;</span>.yhh
name: yhh
<span class="token function">time</span>                blog                   email            <span class="token function">id</span> name phone
----                ----                   -----            -- ---- -----
<span class="token number">1565693045801509796</span> http://spring.hhui.top bangzewu@126.com <span class="token number">27</span> 二灰   <span class="token number">119</span>
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查询语句和一般的select没有什么特别的区别，唯一需要注意的是measurement前面需要加上保留策略</p><h3 id="_3-where语句" tabindex="-1"><a class="header-anchor" href="#_3-where语句" aria-hidden="true">#</a> 3. Where语句</h3><p>前面的查询主要是限定需要获取的数据，而我们实际的场景中，更多的是查询某类满足条件的数据，也就是常见的SQL中加上where查询条件限定</p><p>语法如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SELECT_clause FROM_clause WHERE <span class="token operator">&lt;</span>conditional_expression<span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token punctuation">(</span>AND<span class="token operator">|</span>OR<span class="token punctuation">)</span> <span class="token operator">&lt;</span>conditional_expression<span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token punctuation">..</span>.<span class="token punctuation">]</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>主要看一下where后面的条件表达式，因为influxdb中的数据可以划分为两类，这两种不同的类型，在构建查询语句的时候，会有一些区别</p><p><strong>field查询条件</strong></p><p>我们已知field的类型有四种：<code>string|int|boolean|float</code>，所以它支持的操作符有</p><table><thead><tr><th>操作符</th><th>说明</th></tr></thead><tbody><tr><td><code>=</code></td><td>相等</td></tr><tr><td><code>&lt;&gt;</code>, <code>!=</code></td><td>不相同</td></tr><tr><td><code>&gt;</code>, <code>&gt;=</code></td><td>大于,大于等于</td></tr><tr><td><code>&lt;</code>, <code>&lt;=</code></td><td>小于,小于等于</td></tr></tbody></table><p><strong>tag查询条件</strong></p><p>在influxdb中tag都是string类型，会建立索引，所以基于tag的查询效率一般来讲是优于field查询的，它支持的操作符为</p><table><thead><tr><th>操作符</th><th>说明</th></tr></thead><tbody><tr><td><code>=</code></td><td>相等</td></tr><tr><td><code>&lt;&gt;</code>, <code>!=</code></td><td>不相同</td></tr></tbody></table><p>在influxdb中没有in查询，不同的查询条件可以使用and/or来连接，表示同时满足or一个满足即可，下满给出几个简单的实例</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 根据field进行查询</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh where <span class="token assign-left variable">age</span><span class="token operator">=</span><span class="token number">26</span>
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰


<span class="token comment"># 根据tag进行查询</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh where phone<span class="token operator">!=</span><span class="token string">&#39;&#39;</span>
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>


<span class="token comment"># 简单的运算查询</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh where age + <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token number">30</span>
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
<span class="token number">1563889704754695002</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰2
<span class="token number">1563889723440000821</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰3 <span class="token number">110</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from yhh where <span class="token string">&quot;name&quot;</span><span class="token operator">=</span><span class="token string">&#39;一灰灰&#39;</span>
name: yhh
<span class="token function">time</span>                age blog                 <span class="token function">id</span> name phone
----                --- ----                 -- ---- -----
<span class="token number">1563889538654374538</span> <span class="token number">26</span>  http://blog.hhui.top <span class="token number">10</span> 一灰灰
<span class="token number">1563889547738266214</span> <span class="token number">30</span>  http://blog.hhui.top <span class="token number">11</span> 一灰灰
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-小结" tabindex="-1"><a class="header-anchor" href="#_4-小结" aria-hidden="true">#</a> 4. 小结</h3><p>这一小节内容，介绍的是最基础的inflxudb查询操作，和我们了解的SQL基本上没有太多的区别，可能唯一需要注意的就是制定保留策略查询时，需要使用<code>&quot;&lt;retention policy&gt;&quot;.&lt;measurement&gt;</code>的方式跟在from语句之后</p><p>其次一个需要注意的时，查询语句中，推荐的写法是</p><ul><li><code>tag key</code>或<code>field key</code>请使用双引号括起来</li><li>如果类型为string，请用单引号把过滤条件括起来</li></ul><p>如下面这种写法，否则可能会出现问题</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">select</span> <span class="token operator">*</span> <span class="token keyword">from</span> yhh <span class="token keyword">where</span> <span class="token string">&quot;name&quot;</span><span class="token operator">=</span><span class="token string">&#39;一灰灰&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>下一篇，我们将介绍查询语句中常见的分组，排序，分页等场景的使用姿势</p>`,38);function c(r,d){return s(),e("div",null,[o,a(" more "),p])}const m=n(i,[["render",c],["__file","09.query数据查询基本篇.html.vue"]]);export{m as default};

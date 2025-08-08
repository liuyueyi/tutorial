import{_ as s,V as n,W as a,X as e,Y as t,a1 as l}from"./framework-094145d2.js";const i={},o=t("p",null,"前面介绍了使用insert实现新增和修改记录的使用姿势，接下来我们看一下另外一个简单的使用方式，如何删除数据",-1),p=l(`<h3 id="_1-delete-语句" tabindex="-1"><a class="header-anchor" href="#_1-delete-语句" aria-hidden="true">#</a> 1. delete 语句</h3><p>delete的官方语法如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>DELETE FROM <span class="token operator">&lt;</span>measurement_name<span class="token operator">&gt;</span> WHERE <span class="token punctuation">[</span><span class="token operator">&lt;</span>tag_key<span class="token operator">&gt;=</span><span class="token string">&#39;&lt;tag_value&gt;&#39;</span><span class="token punctuation">]</span> <span class="token operator">|</span> <span class="token punctuation">[</span><span class="token operator">&lt;</span>time interval<span class="token operator">&gt;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>delete语句和我们常见sql语法有点像，但是注意一下上面的where中的条件，只允许根据tag和时间来进行删除操作</p><p>下面给出几个简单的例子</p><p><strong>case1 根据时间删除</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test
name: add_test
<span class="token function">time</span>                age boy  email            name  phone user_id
----                --- ---  -----            ----  ----- -------
<span class="token number">1564149327925320596</span> <span class="token number">19</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">0</span>
<span class="token number">1564149920283253824</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">21</span>
<span class="token number">1564150279123000000</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">22</span>


<span class="token operator">&gt;</span> delete from add_test where time<span class="token operator">&gt;=</span><span class="token number">1564150279123000000</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test
name: add_test
<span class="token function">time</span>                age boy  email            name  phone user_id
----                --- ---  -----            ----  ----- -------
<span class="token number">1564149327925320596</span> <span class="token number">19</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">0</span>
<span class="token number">1564149920283253824</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">21</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>case2 根据tag删除</strong></p><p>注意name为保留名，因此需要用双引号括起来</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show tag keys from add_test
name: add_test
tagKey
------
name
phone


<span class="token operator">&gt;</span> delete from add_test where <span class="token string">&quot;name&quot;</span><span class="token operator">=</span><span class="token string">&#39;YiHui&#39;</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-不同保存策略的数据删除" tabindex="-1"><a class="header-anchor" href="#_2-不同保存策略的数据删除" aria-hidden="true">#</a> 2. 不同保存策略的数据删除</h3><p>从前面的语法定义中，没有看到指定保留策略的情况，那么如果需要删除某个保存策略的数据，应该怎样？</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">boy</span><span class="token operator">=</span>true,age<span class="token operator">=</span>19i,user_id<span class="token operator">=</span><span class="token number">2</span>


<span class="token operator">&gt;</span> insert into <span class="token string">&quot;1D&quot;</span> add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">boy</span><span class="token operator">=</span>true,age<span class="token operator">=</span>19i,user_id<span class="token operator">=</span><span class="token number">1</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test
name: add_test
<span class="token function">time</span>                age boy  name  phone user_id
----                --- ---  ----  ----- -------
<span class="token number">1564483471390538399</span> <span class="token number">19</span>  <span class="token boolean">true</span> YiHui <span class="token number">110</span>   <span class="token number">2</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;1D&quot;</span>.add_test
name: add_test
<span class="token function">time</span>                age boy  name  phone user_id
----                --- ---  ----  ----- -------
<span class="token number">1564483483748916258</span> <span class="token number">19</span>  <span class="token boolean">true</span> YiHui <span class="token number">110</span>   <span class="token number">1</span>


<span class="token operator">&gt;</span> delete from add_test where <span class="token string">&quot;name&quot;</span><span class="token operator">=</span><span class="token string">&#39;YiHui&#39;</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;1D&quot;</span>.add_test
<span class="token operator">&gt;</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>执行上面的case之后，发现根据tag进行删除时，默认策略，和&quot;1D&quot;保存策略中的数据都被删除掉了</p><p>下面是另外一个验证</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test<span class="token punctuation">;</span>
name: add_test
<span class="token function">time</span>                age boy  name  phone user_id
----                --- ---  ----  ----- -------
<span class="token number">1564483778197609864</span> <span class="token number">19</span>  <span class="token boolean">true</span> YiHui <span class="token number">110</span>   <span class="token number">1</span>


<span class="token operator">&gt;</span> insert into <span class="token string">&quot;2_h&quot;</span>  add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">boy</span><span class="token operator">=</span>true,age<span class="token operator">=</span>19i,user_id<span class="token operator">=</span><span class="token number">1</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;2_h&quot;</span>.add_test<span class="token punctuation">;</span>
name: add_test
<span class="token function">time</span>                age boy  name  phone user_id
----                --- ---  ----  ----- -------
<span class="token number">1564483793280811751</span> <span class="token number">19</span>  <span class="token boolean">true</span> YiHui <span class="token number">110</span>   <span class="token number">1</span>


<span class="token operator">&gt;</span> delete from add_test where <span class="token assign-left variable">time</span><span class="token operator">=</span><span class="token number">1564483793280811751</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;2_h&quot;</span>.add_test<span class="token punctuation">;</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test<span class="token punctuation">;</span>
name: add_test
<span class="token function">time</span>                age boy  name  phone user_id
----                --- ---  ----  ----- -------
<span class="token number">1564483778197609864</span> <span class="token number">19</span>  <span class="token boolean">true</span> YiHui <span class="token number">110</span>   <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们在<code>&quot;2_h&quot;</code>这个策略中新增了一条数据，直接根据时间进行删除，当前的策略下的数据没有影响，<code>&quot;2_h&quot;</code>策略中刚添加的数据被删除掉了</p>`,17);function r(d,c){return n(),a("div",null,[o,e(" more "),p])}const m=s(i,[["render",r],["__file","08.delete-删除数据.html.vue"]]);export{m as default};

import{_ as s,V as e,W as a,X as i,Z as n,Y as l}from"./framework-b1bd8911.js";const t={},d=n("p",null,"接下来开始进入influxdb的curd篇，首先我们看一下如何添加数据，也就是insert的使用姿势",-1),o=n("blockquote",null,[n("p",null,"在进入本篇之前，对于不了解什么是retention policy, tag, field的同学，有必要快速过一下这几个基本概念，可以参考文后的系列教程")],-1),r=l(`<h2 id="i-insert-使用说明" tabindex="-1"><a class="header-anchor" href="#i-insert-使用说明" aria-hidden="true">#</a> I. Insert 使用说明</h2><p>基本语法</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>insert into <span class="token operator">&lt;</span>retention policy<span class="token operator">&gt;</span> measurement,tagKey<span class="token operator">=</span>tagValue <span class="token assign-left variable">fieldKey</span><span class="token operator">=</span>fieldValue timestamp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_1-基本写数据姿势" tabindex="-1"><a class="header-anchor" href="#_1-基本写数据姿势" aria-hidden="true">#</a> 1. 基本写数据姿势</h3><p>当measurement不存在的时候，我们插入一条数据时，就会创建这个measurement</p><h4 id="a-基本case" tabindex="-1"><a class="header-anchor" href="#a-基本case" aria-hidden="true">#</a> a. 基本case</h4><p>下面给出一个简单的实例</p><ul><li><code>insert add_test,name=YiHui,phone=110 user_id=20,email=&quot;bangzewu@126.com&quot;</code></li><li>新增一条数据，measurement为<code>add_test</code>, tag为<code>name</code>,<code>phone</code>, field为<code>user_id</code>,<code>email</code></li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show measurements
name: measurements
name
----
yhh


<span class="token operator">&gt;</span> insert add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">user_id</span><span class="token operator">=</span><span class="token number">20</span>,email<span class="token operator">=</span><span class="token string">&quot;bangzewu@126.com&quot;</span>



<span class="token operator">&gt;</span> show measurements<span class="token punctuation">;</span>
name: measurements
name
----
add_test
yhh


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test
name: add_test
<span class="token function">time</span>                email            name  phone user_id
----                -----            ----  ----- -------
<span class="token number">1564149327925320596</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">20</span>



<span class="token operator">&gt;</span> show tag keys from add_test<span class="token punctuation">;</span>
name: add_test
tagKey
------
name
phone



<span class="token operator">&gt;</span> show field keys from add_test<span class="token punctuation">;</span>
name: add_test
fieldKey fieldType
-------- ---------
email    string
user_id  float
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面的输出，简单小结一下插入的语句写法</p><ul><li><code>insert</code> + <code>measurement</code> + <code>&quot;,&quot;</code> + <code>tag=value,tag=value</code> + <code></code> + <code>field=value,field=value</code></li><li>tag与tag之间用逗号分隔；field与field之间用逗号分隔</li><li>tag与field之间用空格分隔</li><li>tag都是string类型，不需要引号将value包裹</li><li>field如果是string类型，需要加引号</li></ul><h4 id="b-field类型" tabindex="-1"><a class="header-anchor" href="#b-field类型" aria-hidden="true">#</a> b. field类型</h4><p>我们知道field有四种类型，<code>int</code>, <code>float</code>, <code>string</code>, <code>boolean</code>，下面看一下插入数据时，四种类型如何处理</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">user_id</span><span class="token operator">=</span><span class="token number">21</span>,email<span class="token operator">=</span><span class="token string">&quot;bangzewu@126.com&quot;</span>,age<span class="token operator">=</span>18i,boy<span class="token operator">=</span>true


<span class="token operator">&gt;</span> show field keys from add_test
name: add_test
fieldKey fieldType
-------- ---------
age      integer
boy      boolean
email    string
user_id  float
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>小结一下四种类型的指定方式</p><table><thead><tr><th>类型</th><th>方式</th><th>示例</th></tr></thead><tbody><tr><td>float</td><td><code>数字</code></td><td><code>user_id=21</code></td></tr><tr><td>int</td><td><code>数字i</code></td><td><code>age=18i</code></td></tr><tr><td>boolean</td><td><code>true/false</code></td><td><code>boy=true</code></td></tr><tr><td>String</td><td><code>&quot;&quot;</code> or <code>&#39;&#39;</code></td><td><a href="mailto:email=%22bangzewu@126.com">email=&quot;bangzewu@126.com</a>&quot;</td></tr></tbody></table><h4 id="c-时间戳指定" tabindex="-1"><a class="header-anchor" href="#c-时间戳指定" aria-hidden="true">#</a> c. 时间戳指定</h4><p>当写入数据不指定时间时，会自动用当前时间来补齐，如果需要自己指定时间时，再最后面添加上即可，注意时间为ns</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">user_id</span><span class="token operator">=</span><span class="token number">22</span>,email<span class="token operator">=</span><span class="token string">&quot;bangzewu@126.com&quot;</span>,age<span class="token operator">=</span>18i,boy<span class="token operator">=</span>true <span class="token number">1564150279123000000</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test<span class="token punctuation">;</span>
name: add_test
<span class="token function">time</span>                age boy  email            name  phone user_id
----                --- ---  -----            ----  ----- -------
<span class="token number">1564149327925320596</span>          bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">20</span>
<span class="token number">1564149920283253824</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">21</span>
<span class="token number">1564150279123000000</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">22</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-指定保存策略插入数据" tabindex="-1"><a class="header-anchor" href="#_2-指定保存策略插入数据" aria-hidden="true">#</a> 2. 指定保存策略插入数据</h3><p>前面写入数据没有指定保存策略，表示这条数据写入到默认的保存策略中；我们知道一个数据库可以有多个保存策略，一个measurement中也可以存不同的保存策略的数据，在写入数据时，如果需要指定保存策略，可以使用 <code>insert into 保存策略 ...</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show retention policies on <span class="token builtin class-name">test</span>
name    duration shardGroupDuration replicaN default
----    -------- ------------------ -------- -------
autogen 0s       168h0m0s           <span class="token number">1</span>        <span class="token boolean">true</span>
1_d     24h0m0s  1h0m0s             <span class="token number">1</span>        <span class="token boolean">false</span>
1_h     1h0m0s   1h0m0s             <span class="token number">1</span>        <span class="token boolean">false</span>


<span class="token operator">&gt;</span> insert into <span class="token string">&quot;1_d&quot;</span> add_test,name<span class="token operator">=</span>YiHui2,phone<span class="token operator">=</span><span class="token number">911</span> <span class="token assign-left variable">user_id</span><span class="token operator">=</span><span class="token number">23</span>,email<span class="token operator">=</span><span class="token string">&quot;bangzewu@126.com&quot;</span>,age<span class="token operator">=</span>18i,boy<span class="token operator">=</span>true <span class="token number">1564150279123000000</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test<span class="token punctuation">;</span>
name: add_test
<span class="token function">time</span>                age boy  email            name  phone user_id
----                --- ---  -----            ----  ----- -------
<span class="token number">1564149327925320596</span>          bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">20</span>
<span class="token number">1564149920283253824</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">21</span>
<span class="token number">1564150279123000000</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">22</span>



<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from <span class="token string">&quot;1_d&quot;</span>.add_test<span class="token punctuation">;</span>
name: add_test
<span class="token function">time</span>                age boy  email            name   phone user_id
----                --- ---  -----            ----   ----- -------
<span class="token number">1564150279123000000</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui2 <span class="token number">911</span>   <span class="token number">23</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22);function c(p,u){return e(),a("div",null,[d,o,i(" more "),r])}const v=s(t,[["render",c],["__file","06.insert-添加数据.html.vue"]]);export{v as default};

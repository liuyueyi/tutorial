import{_ as n,V as s,W as e,X as a,Y as i,a1 as l}from"./framework-094145d2.js";const r={},d=i("p",null,"在influxdb中measurement相当于mysql中的表，可以理解为一条一条记录都是存与measurent中的，一个数据库中可以有多个measurement，一个measurement中可以存很多的数据。虽然可将measurement类比为mysql中的表，但是他们之间的差别也挺明显的",-1),t=l(`<p>首先我们先了解一下measurement的几个常用命令，如何查看、新增删除</p><h3 id="_1-show-measurements" tabindex="-1"><a class="header-anchor" href="#_1-show-measurements" aria-hidden="true">#</a> 1. show measurements</h3><p>查看一个数据库中有哪些measurement，属于常规操作了</p><ul><li>先确定数据库</li><li>执行<code>show measurements</code> 查看当前数据库的所有measurement</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> use <span class="token builtin class-name">test</span>
Using database <span class="token builtin class-name">test</span>
<span class="token operator">&gt;</span> show measurements
name: measurements
name
----
yhh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们也可以在不执行<code>use databaseName</code>的时候，进行查看；而且还支持按名进行匹配，语法为</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>SHOW MEASUREMENTS <span class="token punctuation">[</span>ON <span class="token operator">&lt;</span>database_name<span class="token operator">&gt;</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>WITH MEASUREMENT <span class="token operator">&lt;</span>regular_expression<span class="token operator">&gt;</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>WHERE <span class="token operator">&lt;</span>tag_key<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>operator<span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token string">&#39;&lt;tag_value&gt;&#39;</span> <span class="token operator">|</span> <span class="token operator">&lt;</span>regular_expression<span class="token operator">&gt;</span><span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>LIMIT_clause<span class="token punctuation">]</span> <span class="token punctuation">[</span>OFFSET_clause<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>下面给出查询指定数据库中，以yhh开头的所有measurement示例</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show measurements on <span class="token builtin class-name">test</span>
name: measurements
name
----
doraemon
doraemon2
yhh
yhh2
<span class="token operator">&gt;</span> show measurements on <span class="token builtin class-name">test</span> with measurement <span class="token operator">=~</span> /yhh*/
name: measurements
name
----
yhh
yhh2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-创建measurement" tabindex="-1"><a class="header-anchor" href="#_2-创建measurement" aria-hidden="true">#</a> 2. 创建measurement</h3><p>在influxdb中没有专门用来创建measurement的命令，在执行向某个measurement新增记录的时候，如果不存在measurement，则会新创建一个</p><p>下面是一条简单的演示case</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 像userInfo中新增一条记录，如果userInfo这个measurement不存在，则新建一个</span>
<span class="token operator">&gt;</span> insert userInfo,name<span class="token operator">=</span>一灰灰blog <span class="token assign-left variable">userId</span><span class="token operator">=</span><span class="token number">10</span>,blog<span class="token operator">=</span><span class="token string">&quot;https://blog.hhui.top/&quot;</span>
<span class="token operator">&gt;</span> show measurements
name: measurements
name
----
doraemon
doraemon2
userInfo
yhh
yhh2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-删除measurement" tabindex="-1"><a class="header-anchor" href="#_3-删除measurement" aria-hidden="true">#</a> 3. 删除measurement</h3><p>两种方式，一个是把measurement里面的所有数据都删完，那么这个measurement就没了</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from userInfo
name: userInfo
<span class="token function">time</span>                blog                   name    userId
----                ----                   ----    ------
<span class="token number">1563712849953792293</span> https://blog.hhui.top/ 一灰灰blog <span class="token number">10</span>
<span class="token comment"># 删除userInfo中的记录</span>
<span class="token operator">&gt;</span> delete from userInfo where <span class="token assign-left variable">time</span><span class="token operator">=</span><span class="token number">1563712849953792293</span>
<span class="token comment"># 再次查看，发现userInfo已经被删除</span>
<span class="token operator">&gt;</span> show measurements
name: measurements
name
----
doraemon
doraemon2
yhh
yhh2
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外一种方式就是直接使用<code>drop measurement</code>命令实现删除</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 先创建userInfo</span>
<span class="token operator">&gt;</span> insert userInfo,name<span class="token operator">=</span>一灰灰blog <span class="token assign-left variable">userId</span><span class="token operator">=</span><span class="token number">10</span>,blog<span class="token operator">=</span><span class="token string">&quot;https://blog.hhui.top/&quot;</span>
<span class="token operator">&gt;</span> show measurements
name: measurements
name
----
doraemon
doraemon2
userInfo
yhh
yhh2


<span class="token comment"># 直接使用drop语句删除</span>
<span class="token operator">&gt;</span> drop measurement userInfo
<span class="token operator">&gt;</span> show measurements
name: measurements
name
----
doraemon
doraemon2
yhh
yhh2
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-修改" tabindex="-1"><a class="header-anchor" href="#_4-修改" aria-hidden="true">#</a> 4. 修改</h3><p>不同于mysql中的表，measurement是没有修改操作的，从前面的创建操作也可以看出，对于measurement而言，也就只有一个名字，那如果我希望重命名现有的measurement，该怎么办？</p><p><strong>原则上不建议这么干，如果确实有需要，可以用下面的方式来变相实现</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show measurements
name: measurements
name
----
doraemon
doraemon2
userInfo
yhh
yhh2


<span class="token comment"># 使用select into语句实现将查询结果保存到另外一个measurement中</span>
<span class="token operator">&gt;</span> <span class="token keyword">select</span> * into userBaseInfo from userInfo
name: result
<span class="token function">time</span> written
---- -------
<span class="token number">0</span>    <span class="token number">1</span>


<span class="token operator">&gt;</span> show measurements
name: measurements
name
----
doraemon
doraemon2
userBaseInfo
userInfo
yhh
yhh2



<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from userBaseInfo, userInfo
name: userBaseInfo
<span class="token function">time</span>                blog                   name    name_1 userId
----                ----                   ----    ------ ------
<span class="token number">1563713690876924095</span> https://blog.hhui.top/ 一灰灰blog        <span class="token number">10</span>

name: userInfo
<span class="token function">time</span>                blog                   name name_1  userId
----                ----                   ---- ------  ------
<span class="token number">1563713690876924095</span> https://blog.hhui.top/      一灰灰blog <span class="token number">10</span>
<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22);function o(m,u){return s(),e("div",null,[d,a(" more "),t])}const p=n(r,[["render",o],["__file","04.measurement-表.html.vue"]]);export{p as default};

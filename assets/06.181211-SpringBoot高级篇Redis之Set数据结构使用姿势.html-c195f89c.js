import{_ as t,V as p,W as c,a1 as i,X as n,Y as s,Z as e,$ as o,F as l}from"./framework-e9360be2.js";const u={},r=n("p",null,"Redis的五大数据结构，前面讲述了String和List,Hash的使用姿势，接下来就是Set集合，与list最大的区别就是里面不允许存在重复的数据",-1),d=n("h2",{id:"i-基本使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#i-基本使用","aria-hidden":"true"},"#"),s(" I. 基本使用")],-1),k=n("p",null,"在开始之前，序列化的指定需要额外处理，上一篇已经提及，相关内容可以参考：",-1),v={href:"http://spring.hhui.top/spring-blog/2018/11/09/181109-SpringBoot%E9%AB%98%E7%BA%A7%E7%AF%87Redis%E4%B9%8BList%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/#1-%E5%BA%8F%E5%88%97%E5%8C%96%E6%8C%87%E5%AE%9A",target:"_blank",rel:"noopener noreferrer"},m=o(`<h3 id="_1-新增元素" tabindex="-1"><a class="header-anchor" href="#_1-新增元素" aria-hidden="true">#</a> 1. 新增元素</h3><p>新增元素时，可以根据返回值来判断是否添加成功, 如下面的单个插入时，如果集合中之前就已经有数据了，那么返回0，否则返回1</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token doc-comment comment">/**
 * 新增一个  sadd
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-删除元素" tabindex="-1"><a class="header-anchor" href="#_2-删除元素" aria-hidden="true">#</a> 2. 删除元素</h3><p>因为list是有序的，所以在list的删除需要指定位置；而set则不需要</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 删除集合中的值  srem
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-判断是否存在" tabindex="-1"><a class="header-anchor" href="#_3-判断是否存在" aria-hidden="true">#</a> 3. 判断是否存在</h3><p>set一个最大的应用场景就是判断某个元素是否有了，从而决定怎么执行后续的操作, 用的是 <code>isMember</code>方法，来判断集合中是否存在某个value</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 判断是否包含  sismember
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">contains</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isMember</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-获取所有的value" tabindex="-1"><a class="header-anchor" href="#_4-获取所有的value" aria-hidden="true">#</a> 4. 获取所有的value</h3><p>set无序，因此像list一样获取某个范围的数据，不太容易，更常见的方式就是全部获取出来</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 获取集合中所有的值 smembers
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">values</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">members</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-集合运算" tabindex="-1"><a class="header-anchor" href="#_5-集合运算" aria-hidden="true">#</a> 5. 集合运算</h3><p>set还提供了另外几个高级一点的功能，就是集合的运算，如求并集，交集等操作，虽然在我有限的业务应用中，并没有使用到这些高级功能，下面依然个给出使用的姿势</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 返回多个集合的并集  sunion
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key1</span>
 * <span class="token keyword">@param</span> <span class="token parameter">key2</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">union</span><span class="token punctuation">(</span><span class="token class-name">String</span> key1<span class="token punctuation">,</span> <span class="token class-name">String</span> key2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">union</span><span class="token punctuation">(</span>key1<span class="token punctuation">,</span> key2<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * 返回多个集合的交集 sinter
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key1</span>
 * <span class="token keyword">@param</span> <span class="token parameter">key2</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">intersect</span><span class="token punctuation">(</span><span class="token class-name">String</span> key1<span class="token punctuation">,</span> <span class="token class-name">String</span> key2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">intersect</span><span class="token punctuation">(</span>key1<span class="token punctuation">,</span> key2<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * 返回集合key1中存在，但是key2中不存在的数据集合  sdiff
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key1</span>
 * <span class="token keyword">@param</span> <span class="token parameter">key2</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">diff</span><span class="token punctuation">(</span><span class="token class-name">String</span> key1<span class="token punctuation">,</span> <span class="token class-name">String</span> key2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">difference</span><span class="token punctuation">(</span>key1<span class="token punctuation">,</span> key2<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ii-其他" tabindex="-1"><a class="header-anchor" href="#ii-其他" aria-hidden="true">#</a> II. 其他</h2><h3 id="_0-项目" tabindex="-1"><a class="header-anchor" href="#_0-项目" aria-hidden="true">#</a> 0. 项目</h3>`,17),b={href:"https://github.com/liuyueyi/spring-boot-demo",target:"_blank",rel:"noopener noreferrer"};function h(y,g){const a=l("ExternalLinkIcon");return p(),c("div",null,[r,i(" more "),d,k,n("ul",null,[n("li",null,[n("a",v,[s("181109-SpringBoot高级篇Redis之List数据结构使用姿势"),e(a)])])]),m,n("ul",null,[n("li",null,[s("工程："),n("a",b,[s("spring-boot-demo"),e(a)])])])])}const f=t(u,[["render",h],["__file","06.181211-SpringBoot高级篇Redis之Set数据结构使用姿势.html.vue"]]);export{f as default};

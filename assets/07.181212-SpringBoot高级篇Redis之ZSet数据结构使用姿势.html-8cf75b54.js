import{_ as p,V as t,W as c,a1 as o,Y as n,a0 as s,Z as e,X as i,F as l}from"./framework-ad59245f.js";const u={},r=n("p",null,"Redis的五大数据结构，目前就剩下最后的ZSET，可以简单的理解为带权重的集合；与前面的set最大的区别，就是每个元素可以设置一个score，从而可以实现各种排行榜的功能",-1),d=n("h2",{id:"i-基本使用",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#i-基本使用","aria-hidden":"true"},"#"),s(" I. 基本使用")],-1),k=n("p",null,"在开始之前，序列化的指定需要额外处理，前面List这一篇已经提及，相关内容可以参考：",-1),v={href:"http://spring.hhui.top/spring-blog/2018/11/09/181109-SpringBoot%E9%AB%98%E7%BA%A7%E7%AF%87Redis%E4%B9%8BList%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/#1-%E5%BA%8F%E5%88%97%E5%8C%96%E6%8C%87%E5%AE%9A",target:"_blank",rel:"noopener noreferrer"},m=i(`<h3 id="_1-新增元素" tabindex="-1"><a class="header-anchor" href="#_1-新增元素" aria-hidden="true">#</a> 1. 新增元素</h3><p>新增元素时，用起来和set差不多，无非是多一个score的参数指定而已</p><p>如果元素存在，会用新的score来替换原来的，返回0；如果元素不存在，则会会新增一个</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 添加一个元素, zset与set最大的区别就是每个元素都有一个score，因此有个排序的辅助功能;  zadd
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 * <span class="token keyword">@param</span> <span class="token parameter">score</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">,</span> <span class="token keyword">double</span> score<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">,</span> score<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-删除元素" tabindex="-1"><a class="header-anchor" href="#_2-删除元素" aria-hidden="true">#</a> 2. 删除元素</h3><p>删除就和普通的set没啥区别了</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 删除元素 zrem
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-修改score" tabindex="-1"><a class="header-anchor" href="#_3-修改score" aria-hidden="true">#</a> 3. 修改score</h3><p>zset中的元素塞入之后，可以修改其score的值，通过 <code>zincrby</code> 来对score进行加/减；当元素不存在时，则会新插入一个</p><p>从上面的描述来看，<code>zincrby</code> 与 <code>zadd</code> 最大的区别是前者是增量修改；后者是覆盖score方式</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * score的增加or减少 zincrby
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 * <span class="token keyword">@param</span> <span class="token parameter">score</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Double</span> <span class="token function">incrScore</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">,</span> <span class="token keyword">double</span> score<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">incrementScore</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">,</span> score<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-获取value对应的score" tabindex="-1"><a class="header-anchor" href="#_4-获取value对应的score" aria-hidden="true">#</a> 4. 获取value对应的score</h3><p>这个需要注意的是，当value在集合中时，返回其score；如果不在，则返回null</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 查询value对应的score   zscore
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Double</span> <span class="token function">score</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">score</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-获取value在集合中排名" tabindex="-1"><a class="header-anchor" href="#_5-获取value在集合中排名" aria-hidden="true">#</a> 5. 获取value在集合中排名</h3><p>前面是获取value对应的score；这里则是获取排名；这里score越小排名越高;</p><p>从这个使用也可以看出结合4、5, 用zset来做排行榜可以很简单的获取某个用户在所有人中的排名与积分</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 判断value在zset中的排名  zrank
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Long</span> <span class="token function">rank</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">rank</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-集合大小" tabindex="-1"><a class="header-anchor" href="#_6-集合大小" aria-hidden="true">#</a> 6. 集合大小</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 返回集合的长度
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Long</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">zCard</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-获取集合中数据" tabindex="-1"><a class="header-anchor" href="#_7-获取集合中数据" aria-hidden="true">#</a> 7. 获取集合中数据</h3><p>因为是有序，所以就可以获取指定范围的数据，下面有两种方式</p><ul><li>根据排序位置获取数据</li><li>根据score区间获取排序位置</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 查询集合中指定顺序的值， 0 -1 表示获取全部的集合内容  zrange
 *
 * 返回有序的集合，score小的在前面
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">start</span>
 * <span class="token keyword">@param</span> <span class="token parameter">end</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">range</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token keyword">int</span> start<span class="token punctuation">,</span> <span class="token keyword">int</span> end<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">range</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> start<span class="token punctuation">,</span> end<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * 查询集合中指定顺序的值和score，0, -1 表示获取全部的集合内容
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">start</span>
 * <span class="token keyword">@param</span> <span class="token parameter">end</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ZSetOperations<span class="token punctuation">.</span>TypedTuple</span><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">rangeWithScore</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token keyword">int</span> start<span class="token punctuation">,</span> <span class="token keyword">int</span> end<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">rangeWithScores</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> start<span class="token punctuation">,</span> end<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * 查询集合中指定顺序的值  zrevrange
 *
 * 返回有序的集合中，score大的在前面
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">start</span>
 * <span class="token keyword">@param</span> <span class="token parameter">end</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">revRange</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token keyword">int</span> start<span class="token punctuation">,</span> <span class="token keyword">int</span> end<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">reverseRange</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> start<span class="token punctuation">,</span> end<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * 根据score的值，来获取满足条件的集合  zrangebyscore
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">min</span>
 * <span class="token keyword">@param</span> <span class="token parameter">max</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">sortRange</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token keyword">int</span> min<span class="token punctuation">,</span> <span class="token keyword">int</span> max<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForZSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">rangeByScore</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> min<span class="token punctuation">,</span> max<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ii-其他" tabindex="-1"><a class="header-anchor" href="#ii-其他" aria-hidden="true">#</a> II. 其他</h2><h3 id="_0-项目" tabindex="-1"><a class="header-anchor" href="#_0-项目" aria-hidden="true">#</a> 0. 项目</h3>`,26),b={href:"https://github.com/liuyueyi/spring-boot-demo",target:"_blank",rel:"noopener noreferrer"};function y(h,g){const a=l("ExternalLinkIcon");return t(),c("div",null,[r,o(" more "),d,k,n("ul",null,[n("li",null,[n("a",v,[s("181109-SpringBoot高级篇Redis之List数据结构使用姿势"),e(a)])])]),m,n("ul",null,[n("li",null,[s("工程："),n("a",b,[s("spring-boot-demo"),e(a)])])])])}const _=p(u,[["render",y],["__file","07.181212-SpringBoot高级篇Redis之ZSet数据结构使用姿势.html.vue"]]);export{_ as default};

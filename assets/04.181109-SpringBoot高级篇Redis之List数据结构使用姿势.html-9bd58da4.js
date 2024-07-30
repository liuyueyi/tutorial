import{_ as e,V as t,W as p,a1 as i,X as n,Y as s,Z as c,$ as l,F as o}from"./framework-e9360be2.js";const u={},r=n("p",null,"前面一篇博文介绍redis五种数据结构中String的使用姿势，这一篇则将介绍另外一个用的比较多的List，对于列表而言，用的最多的场景可以说是当做队列或者堆栈来使用了",-1),d=l(`<h2 id="i-基本使用" tabindex="-1"><a class="header-anchor" href="#i-基本使用" aria-hidden="true">#</a> I. 基本使用</h2><h3 id="_1-序列化指定" tabindex="-1"><a class="header-anchor" href="#_1-序列化指定" aria-hidden="true">#</a> 1. 序列化指定</h3><p>前面一篇的操作都是直接使用的<code>execute</code>配合回调方法来说明的，其实还有一种更加方便的方式，即 <code>opsForValue</code>, <code>opsForList</code>，本文则以这种方式演示list数据结构的操作</p><p>所以在正式开始之前，有必要指定一下key和value的序列化方式，当不现实指定时，采用默认的序列化（即jdk的对象序列化方式），直接导致的就是通过redis-cli获取存储数据时，会发现和你预期的不一样</p><p>首先实现序列化类</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultSerializer</span> <span class="token keyword">implements</span> <span class="token class-name">RedisSerializer</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Charset</span> charset<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">DefaultSerializer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">(</span><span class="token class-name">Charset</span><span class="token punctuation">.</span><span class="token function">forName</span><span class="token punctuation">(</span><span class="token string">&quot;UTF8&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">DefaultSerializer</span><span class="token punctuation">(</span><span class="token class-name">Charset</span> charset<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">notNull</span><span class="token punctuation">(</span>charset<span class="token punctuation">,</span> <span class="token string">&quot;Charset must not be null!&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>charset <span class="token operator">=</span> charset<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>


    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">byte</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token function">serialize</span><span class="token punctuation">(</span><span class="token class-name">Object</span> o<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">SerializationException</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> o <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">?</span> <span class="token keyword">null</span> <span class="token operator">:</span> <span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span>o<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getBytes</span><span class="token punctuation">(</span>charset<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Object</span> <span class="token function">deserialize</span><span class="token punctuation">(</span><span class="token keyword">byte</span><span class="token punctuation">[</span><span class="token punctuation">]</span> bytes<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">SerializationException</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> bytes <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">?</span> <span class="token keyword">null</span> <span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">String</span><span class="token punctuation">(</span>bytes<span class="token punctuation">,</span> charset<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其次定义RedisTemplate的序列化方式</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">AutoConfig</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Bean</span>
    <span class="token keyword">public</span> <span class="token class-name">RedisTemplate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">redisTemplate</span><span class="token punctuation">(</span><span class="token class-name">RedisConnectionFactory</span> redisConnectionFactory<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">RedisTemplate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> redis <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RedisTemplate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        redis<span class="token punctuation">.</span><span class="token function">setConnectionFactory</span><span class="token punctuation">(</span>redisConnectionFactory<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 设置redis的String/Value的默认序列化方式</span>
        <span class="token class-name">DefaultSerializer</span> stringRedisSerializer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">DefaultSerializer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        redis<span class="token punctuation">.</span><span class="token function">setKeySerializer</span><span class="token punctuation">(</span>stringRedisSerializer<span class="token punctuation">)</span><span class="token punctuation">;</span>
        redis<span class="token punctuation">.</span><span class="token function">setValueSerializer</span><span class="token punctuation">(</span>stringRedisSerializer<span class="token punctuation">)</span><span class="token punctuation">;</span>
        redis<span class="token punctuation">.</span><span class="token function">setHashKeySerializer</span><span class="token punctuation">(</span>stringRedisSerializer<span class="token punctuation">)</span><span class="token punctuation">;</span>
        redis<span class="token punctuation">.</span><span class="token function">setHashValueSerializer</span><span class="token punctuation">(</span>stringRedisSerializer<span class="token punctuation">)</span><span class="token punctuation">;</span>

        redis<span class="token punctuation">.</span><span class="token function">afterPropertiesSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> redis<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-添加元素" tabindex="-1"><a class="header-anchor" href="#_2-添加元素" aria-hidden="true">#</a> 2. 添加元素</h3><p>对于list而言，添加元素常见的有两种，从左边加和从右边加，以lpush为例</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 在列表的最左边塞入一个value
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lpush</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">leftPush</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-获取元素" tabindex="-1"><a class="header-anchor" href="#_3-获取元素" aria-hidden="true">#</a> 3. 获取元素</h3><p>既然是list，就是有序的，因此完全是可以向jdk的list容器一样，获取指定索引的值</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 获取指定索引位置的值, index为-1时，表示返回的是最后一个；当index大于实际的列表长度时，返回null
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">index</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">index</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token keyword">int</span> index<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">index</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> index<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>与jdk中的List获取某个索引value不同的是，这里的index可以为负数，-1表示最右边的一个，-2则表示最右边的第二个，依次</p><h3 id="_4-范围查询" tabindex="-1"><a class="header-anchor" href="#_4-范围查询" aria-hidden="true">#</a> 4. 范围查询</h3><p>这个查询就类似JDK容器中的<code>List#subList</code>了，查询指定范围的列表</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 获取范围值，闭区间，start和end这两个下标的值都会返回; end为-1时，表示获取的是最后一个；
 *
 * 如果希望返回最后两个元素，可以传入  -2, -1
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">start</span>
 * <span class="token keyword">@param</span> <span class="token parameter">end</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">range</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token keyword">int</span> start<span class="token punctuation">,</span> <span class="token keyword">int</span> end<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">range</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> start<span class="token punctuation">,</span> end<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-列表长度" tabindex="-1"><a class="header-anchor" href="#_5-列表长度" aria-hidden="true">#</a> 5. 列表长度</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 返回列表的长度
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@return</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Long</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> redisTemplate<span class="token punctuation">.</span><span class="token function">opsForList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-修改" tabindex="-1"><a class="header-anchor" href="#_6-修改" aria-hidden="true">#</a> 6. 修改</h3><p>更新List中某个下标的value，也属于比较常见的case了，</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 设置list中指定下标的值，采用干的是替换规则, 最左边的下标为0；-1表示最右边的一个
 *
 * @param key
 * @param index
 * @param value
 */
public void set(String key, Integer index, String value) {
    redisTemplate.opsForList().set(key, index, value);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-删除" tabindex="-1"><a class="header-anchor" href="#_7-删除" aria-hidden="true">#</a> 7. 删除</h3><p>在接口中没有看到删除指定小标的元素，倒是看到可以根据value进行删除，以及控制列表长度的方法</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 删除列表中值为value的元素，总共删除count次；
 *
 * 如原来列表为 【1， 2， 3， 4， 5， 2， 1， 2， 5】
 * 传入参数 value=2, count=1 表示删除一个列表中value为2的元素
 * 则执行后，列表为 【1， 3， 4， 5， 2， 1， 2， 5】
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">value</span>
 * <span class="token keyword">@param</span> <span class="token parameter">count</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">String</span> value<span class="token punctuation">,</span> <span class="token keyword">int</span> count<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> count<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * 删除list首尾，只保留 [start, end] 之间的值
 *
 * <span class="token keyword">@param</span> <span class="token parameter">key</span>
 * <span class="token keyword">@param</span> <span class="token parameter">start</span>
 * <span class="token keyword">@param</span> <span class="token parameter">end</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">trim</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">Integer</span> start<span class="token punctuation">,</span> <span class="token class-name">Integer</span> end<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    redisTemplate<span class="token punctuation">.</span><span class="token function">opsForList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">trim</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> start<span class="token punctuation">,</span> end<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>个人感觉在实际的使用中remove这个方法用得不太多；但是trim方法则比较有用了，特别是在控制list的长度，避免出现非常大的列表时，很有效果，传入的start/end参数，采用的是闭区间的原则</p><h2 id="ii-其他" tabindex="-1"><a class="header-anchor" href="#ii-其他" aria-hidden="true">#</a> II. 其他</h2><h3 id="_0-项目" tabindex="-1"><a class="header-anchor" href="#_0-项目" aria-hidden="true">#</a> 0. 项目</h3>`,29),k={href:"https://github.com/liuyueyi/spring-boot-demo",target:"_blank",rel:"noopener noreferrer"};function v(m,b){const a=o("ExternalLinkIcon");return t(),p("div",null,[r,i(" more "),d,n("ul",null,[n("li",null,[s("工程："),n("a",k,[s("spring-boot-demo"),c(a)])])])])}const y=e(u,[["render",v],["__file","04.181109-SpringBoot高级篇Redis之List数据结构使用姿势.html.vue"]]);export{y as default};

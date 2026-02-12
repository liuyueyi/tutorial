import{_ as p,V as t,W as o,X as c,Z as n,a1 as s,$ as e,Y as l,F as i}from"./framework-b1bd8911.js";const u="/tutorial/imgs/231026/00.jpg",k="/tutorial/imgs/231026/01.jpg",r="/tutorial/imgs/231026/02.jpg",d={},m=n("p",null,"系统唯一ID是我们在设计一个系统的时候常常会遇见的问题，比如常见的基于数据库自增主键生成的id，随机生成的uuid，亦或者redis自增的计数器等都属于常见的解决方案；本文我们将会重点看一下业界内大名鼎鼎的雪花算法，是如何实现分布式id的",-1),v=l('<h2 id="i-雪花算法" tabindex="-1"><a class="header-anchor" href="#i-雪花算法" aria-hidden="true">#</a> I. 雪花算法</h2><h3 id="_1-全局唯一id" tabindex="-1"><a class="header-anchor" href="#_1-全局唯一id" aria-hidden="true">#</a> 1. 全局唯一id</h3><p>雪花算法主要是为了解决全局唯一id，那么什么是全局唯一id呢？它应该满足什么属性呢</p><p>基本属性：</p><ul><li>全局唯一性：不能出现重复的 ID 号，既然是唯一标识，这是最基本的要求；</li><li>趋势递增：在 MySQL InnoDB 引擎中使用的是聚集索引，由于多数 RDBMS 使用 B-tree 的数据结构来存储索引数据，在主键的选择上面我们应该尽量使用有序的主键保证写入性能；</li><li>单调递增：保证下一个 ID 一定大于上一个 ID，例如事务版本号、IM 增量消息、排序等特殊需求；</li><li>信息安全：如果 ID 是连续的，恶意用户的爬取工作就非常容易做了，直接按照顺序下载指定 URL 即可；如果是订单号就更危险了，竞争对手可以直接知道我们一天的单量。所以在一些应用场景下，会需要 ID 无规则、不规则。</li></ul><h3 id="_2-雪花算法" tabindex="-1"><a class="header-anchor" href="#_2-雪花算法" aria-hidden="true">#</a> 2. 雪花算法</h3><p>雪花算法可以说是业界内生成全局唯一id的经典算法，其基本原理也比较简单</p><figure><img src="'+u+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>Snowflake 以 64 bit 来存储组成 ID 的4 个部分：</p><ol><li>最高位占1 bit，值固定为 0，以保证生成的 ID 为正数；</li><li>中位占 41 bit，值为毫秒级时间戳；</li><li>中下位占 10 bit，值为机器标识id，值的上限为 1024；</li><li>末位占 12 bit，值为当前毫秒内生成的不同的自增序列，值的上限为 4096；</li></ol><p>从上面的结构设计来看，雪花算法的实现可以说比较清晰了，我们重点看一下它的缺陷</p><ol><li>时钟回拨问题：由于id的高位依赖于系统的时间戳，因此当服务器时间错乱或者出现时钟回拨，可能导致数据重复</li><li>集群规模1024台机器，每1ms单机4096个id最大限制</li></ol><h3 id="_3-实现与使用" tabindex="-1"><a class="header-anchor" href="#_3-实现与使用" aria-hidden="true">#</a> 3. 实现与使用</h3><p>目前雪花算法的实现方式较多，通常也不需要我们进行额外开发，如直接Hutool的<code>Snowflake</code></p><p>看下它的核心实现</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Snowflake</span> <span class="token keyword">implements</span> <span class="token class-name">Serializable</span> <span class="token punctuation">{</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">1L</span><span class="token punctuation">;</span>


  <span class="token doc-comment comment">/**
   * 默认的起始时间，为Thu, 04 Nov 2010 01:42:54 GMT
   */</span>
  <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">long</span> <span class="token constant">DEFAULT_TWEPOCH</span> <span class="token operator">=</span> <span class="token number">1288834974657L</span><span class="token punctuation">;</span>
  <span class="token doc-comment comment">/**
   * 默认回拨时间，2S
   */</span>
  <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">long</span> <span class="token constant">DEFAULT_TIME_OFFSET</span> <span class="token operator">=</span> <span class="token number">2000L</span><span class="token punctuation">;</span>

  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">WORKER_ID_BITS</span> <span class="token operator">=</span> <span class="token number">5L</span><span class="token punctuation">;</span>
  <span class="token comment">// 最大支持机器节点数0~31，一共32个</span>
  <span class="token annotation punctuation">@SuppressWarnings</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token string">&quot;PointlessBitwiseExpression&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;FieldCanBeLocal&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">MAX_WORKER_ID</span> <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">^</span> <span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">WORKER_ID_BITS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">DATA_CENTER_ID_BITS</span> <span class="token operator">=</span> <span class="token number">5L</span><span class="token punctuation">;</span>
  <span class="token comment">// 最大支持数据中心节点数0~31，一共32个</span>
  <span class="token annotation punctuation">@SuppressWarnings</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token string">&quot;PointlessBitwiseExpression&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;FieldCanBeLocal&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">MAX_DATA_CENTER_ID</span> <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">^</span> <span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">DATA_CENTER_ID_BITS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token comment">// 序列号12位（表示只允许workId的范围为：0-4095）</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">SEQUENCE_BITS</span> <span class="token operator">=</span> <span class="token number">12L</span><span class="token punctuation">;</span>
  <span class="token comment">// 机器节点左移12位</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">WORKER_ID_SHIFT</span> <span class="token operator">=</span> <span class="token constant">SEQUENCE_BITS</span><span class="token punctuation">;</span>
  <span class="token comment">// 数据中心节点左移17位</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">DATA_CENTER_ID_SHIFT</span> <span class="token operator">=</span> <span class="token constant">SEQUENCE_BITS</span> <span class="token operator">+</span> <span class="token constant">WORKER_ID_BITS</span><span class="token punctuation">;</span>
  <span class="token comment">// 时间毫秒数左移22位</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">TIMESTAMP_LEFT_SHIFT</span> <span class="token operator">=</span> <span class="token constant">SEQUENCE_BITS</span> <span class="token operator">+</span> <span class="token constant">WORKER_ID_BITS</span> <span class="token operator">+</span> <span class="token constant">DATA_CENTER_ID_BITS</span><span class="token punctuation">;</span>
  <span class="token comment">// 序列掩码，用于限定序列最大值不能超过4095</span>
  <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">SEQUENCE_MASK</span> <span class="token operator">=</span> <span class="token operator">~</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">SEQUENCE_BITS</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">// 4095</span>

  <span class="token doc-comment comment">/**
   * 初始化时间点
   */</span>
  <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> twepoch<span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> workerId<span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> dataCenterId<span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> useSystemClock<span class="token punctuation">;</span>
  <span class="token doc-comment comment">/**
   * 允许的时钟回拨毫秒数
   */</span>
  <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> timeOffset<span class="token punctuation">;</span>
  <span class="token doc-comment comment">/**
   * 当在低频模式下时，序号始终为0，导致生成ID始终为偶数<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>br</span><span class="token punctuation">&gt;</span></span>
   * 此属性用于限定一个随机上限，在不同毫秒下生成序号时，给定一个随机数，避免偶数问题。<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>br</span><span class="token punctuation">&gt;</span></span>
   * 注意次数必须小于<span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">SEQUENCE_MASK</span></span><span class="token punctuation">}</span>，<span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span>表示不使用随机数。<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>br</span><span class="token punctuation">&gt;</span></span>
   * 这个上限不包括值本身。
   */</span>
  <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> randomSequenceLimit<span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 自增序号，当高频模式下时，同一毫秒内生成N个ID，则这个序号在同一毫秒下，自增以避免ID重复。
   */</span>
  <span class="token keyword">private</span> <span class="token keyword">long</span> sequence <span class="token operator">=</span> <span class="token number">0L</span><span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token keyword">long</span> lastTimestamp <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1L</span><span class="token punctuation">;</span>

  <span class="token doc-comment comment">/**
   * 构造，使用自动生成的工作节点ID和数据中心ID
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span><span class="token class-name">IdUtil</span><span class="token punctuation">.</span><span class="token function">getWorkerId</span><span class="token punctuation">(</span><span class="token class-name">IdUtil</span><span class="token punctuation">.</span><span class="token function">getDataCenterId</span><span class="token punctuation">(</span><span class="token constant">MAX_DATA_CENTER_ID</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">MAX_WORKER_ID</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 构造
   *
   * <span class="token keyword">@param</span> <span class="token parameter">workerId</span> 终端ID
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token keyword">long</span> workerId<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span>workerId<span class="token punctuation">,</span> <span class="token class-name">IdUtil</span><span class="token punctuation">.</span><span class="token function">getDataCenterId</span><span class="token punctuation">(</span><span class="token constant">MAX_DATA_CENTER_ID</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 构造
   *
   * <span class="token keyword">@param</span> <span class="token parameter">workerId</span>     终端ID
   * <span class="token keyword">@param</span> <span class="token parameter">dataCenterId</span> 数据中心ID
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token keyword">long</span> workerId<span class="token punctuation">,</span> <span class="token keyword">long</span> dataCenterId<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span>workerId<span class="token punctuation">,</span> dataCenterId<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 构造
   *
   * <span class="token keyword">@param</span> <span class="token parameter">workerId</span>         终端ID
   * <span class="token keyword">@param</span> <span class="token parameter">dataCenterId</span>     数据中心ID
   * <span class="token keyword">@param</span> <span class="token parameter">isUseSystemClock</span> 是否使用<span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">SystemClock</span></span><span class="token punctuation">}</span> 获取当前时间戳
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token keyword">long</span> workerId<span class="token punctuation">,</span> <span class="token keyword">long</span> dataCenterId<span class="token punctuation">,</span> <span class="token keyword">boolean</span> isUseSystemClock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> workerId<span class="token punctuation">,</span> dataCenterId<span class="token punctuation">,</span> isUseSystemClock<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * <span class="token keyword">@param</span> <span class="token parameter">epochDate</span>        初始化时间起点（null表示默认起始日期）,后期修改会导致id重复,如果要修改连workerId dataCenterId，慎用
   * <span class="token keyword">@param</span> <span class="token parameter">workerId</span>         工作机器节点id
   * <span class="token keyword">@param</span> <span class="token parameter">dataCenterId</span>     数据中心id
   * <span class="token keyword">@param</span> <span class="token parameter">isUseSystemClock</span> 是否使用<span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">SystemClock</span></span><span class="token punctuation">}</span> 获取当前时间戳
   * <span class="token keyword">@since</span> 5.1.3
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token class-name">Date</span> epochDate<span class="token punctuation">,</span> <span class="token keyword">long</span> workerId<span class="token punctuation">,</span> <span class="token keyword">long</span> dataCenterId<span class="token punctuation">,</span> <span class="token keyword">boolean</span> isUseSystemClock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span>epochDate<span class="token punctuation">,</span> workerId<span class="token punctuation">,</span> dataCenterId<span class="token punctuation">,</span> isUseSystemClock<span class="token punctuation">,</span> <span class="token constant">DEFAULT_TIME_OFFSET</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * <span class="token keyword">@param</span> <span class="token parameter">epochDate</span>        初始化时间起点（null表示默认起始日期）,后期修改会导致id重复,如果要修改连workerId dataCenterId，慎用
   * <span class="token keyword">@param</span> <span class="token parameter">workerId</span>         工作机器节点id
   * <span class="token keyword">@param</span> <span class="token parameter">dataCenterId</span>     数据中心id
   * <span class="token keyword">@param</span> <span class="token parameter">isUseSystemClock</span> 是否使用<span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">SystemClock</span></span><span class="token punctuation">}</span> 获取当前时间戳
   * <span class="token keyword">@param</span> <span class="token parameter">timeOffset</span>       允许时间回拨的毫秒数
   * <span class="token keyword">@since</span> 5.8.0
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token class-name">Date</span> epochDate<span class="token punctuation">,</span> <span class="token keyword">long</span> workerId<span class="token punctuation">,</span> <span class="token keyword">long</span> dataCenterId<span class="token punctuation">,</span> <span class="token keyword">boolean</span> isUseSystemClock<span class="token punctuation">,</span> <span class="token keyword">long</span> timeOffset<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span>epochDate<span class="token punctuation">,</span> workerId<span class="token punctuation">,</span> dataCenterId<span class="token punctuation">,</span> isUseSystemClock<span class="token punctuation">,</span> timeOffset<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * <span class="token keyword">@param</span> <span class="token parameter">epochDate</span>           初始化时间起点（null表示默认起始日期）,后期修改会导致id重复,如果要修改连workerId dataCenterId，慎用
   * <span class="token keyword">@param</span> <span class="token parameter">workerId</span>            工作机器节点id
   * <span class="token keyword">@param</span> <span class="token parameter">dataCenterId</span>        数据中心id
   * <span class="token keyword">@param</span> <span class="token parameter">isUseSystemClock</span>    是否使用<span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">SystemClock</span></span><span class="token punctuation">}</span> 获取当前时间戳
   * <span class="token keyword">@param</span> <span class="token parameter">timeOffset</span>          允许时间回拨的毫秒数
   * <span class="token keyword">@param</span> <span class="token parameter">randomSequenceLimit</span> 限定一个随机上限，在不同毫秒下生成序号时，给定一个随机数，避免偶数问题，0表示无随机，上限不包括值本身。
   * <span class="token keyword">@since</span> 5.8.0
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token class-name">Date</span> epochDate<span class="token punctuation">,</span> <span class="token keyword">long</span> workerId<span class="token punctuation">,</span> <span class="token keyword">long</span> dataCenterId<span class="token punctuation">,</span>
           <span class="token keyword">boolean</span> isUseSystemClock<span class="token punctuation">,</span> <span class="token keyword">long</span> timeOffset<span class="token punctuation">,</span> <span class="token keyword">long</span> randomSequenceLimit<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>twepoch <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">null</span> <span class="token operator">!=</span> epochDate<span class="token punctuation">)</span> <span class="token operator">?</span> epochDate<span class="token punctuation">.</span><span class="token function">getTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token constant">DEFAULT_TWEPOCH</span><span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>workerId <span class="token operator">=</span> <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">checkBetween</span><span class="token punctuation">(</span>workerId<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token constant">MAX_WORKER_ID</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>dataCenterId <span class="token operator">=</span> <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">checkBetween</span><span class="token punctuation">(</span>dataCenterId<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token constant">MAX_DATA_CENTER_ID</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>useSystemClock <span class="token operator">=</span> isUseSystemClock<span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>timeOffset <span class="token operator">=</span> timeOffset<span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>randomSequenceLimit <span class="token operator">=</span> <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">checkBetween</span><span class="token punctuation">(</span>randomSequenceLimit<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token constant">SEQUENCE_MASK</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 根据Snowflake的ID，获取机器id
   *
   * <span class="token keyword">@param</span> <span class="token parameter">id</span> snowflake算法生成的id
   * <span class="token keyword">@return</span> 所属机器的id
   */</span>
  <span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">getWorkerId</span><span class="token punctuation">(</span><span class="token keyword">long</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> id <span class="token operator">&gt;&gt;</span> <span class="token constant">WORKER_ID_SHIFT</span> <span class="token operator">&amp;</span> <span class="token operator">~</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">WORKER_ID_BITS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 根据Snowflake的ID，获取数据中心id
   *
   * <span class="token keyword">@param</span> <span class="token parameter">id</span> snowflake算法生成的id
   * <span class="token keyword">@return</span> 所属数据中心
   */</span>
  <span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">getDataCenterId</span><span class="token punctuation">(</span><span class="token keyword">long</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> id <span class="token operator">&gt;&gt;</span> <span class="token constant">DATA_CENTER_ID_SHIFT</span> <span class="token operator">&amp;</span> <span class="token operator">~</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">DATA_CENTER_ID_BITS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 根据Snowflake的ID，获取生成时间
   *
   * <span class="token keyword">@param</span> <span class="token parameter">id</span> snowflake算法生成的id
   * <span class="token keyword">@return</span> 生成的时间
   */</span>
  <span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">getGenerateDateTime</span><span class="token punctuation">(</span><span class="token keyword">long</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>id <span class="token operator">&gt;&gt;</span> <span class="token constant">TIMESTAMP_LEFT_SHIFT</span> <span class="token operator">&amp;</span> <span class="token operator">~</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">1L</span> <span class="token operator">&lt;&lt;</span> <span class="token number">41L</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">+</span> twepoch<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 下一个ID
   *
   * <span class="token keyword">@return</span> ID
   */</span>
  <span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">long</span> <span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">long</span> timestamp <span class="token operator">=</span> <span class="token function">genTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>timestamp <span class="token operator">&lt;</span> <span class="token keyword">this</span><span class="token punctuation">.</span>lastTimestamp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>lastTimestamp <span class="token operator">-</span> timestamp <span class="token operator">&lt;</span> timeOffset<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 容忍指定的回拨，避免NTP校时造成的异常</span>
        timestamp <span class="token operator">=</span> lastTimestamp<span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 如果服务器时间有问题(时钟后退) 报错。</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span><span class="token class-name">StrUtil</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token string">&quot;Clock moved backwards. Refusing to generate id for {}ms&quot;</span><span class="token punctuation">,</span> lastTimestamp <span class="token operator">-</span> timestamp<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>timestamp <span class="token operator">==</span> <span class="token keyword">this</span><span class="token punctuation">.</span>lastTimestamp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">final</span> <span class="token keyword">long</span> sequence <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>sequence <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span> <span class="token constant">SEQUENCE_MASK</span><span class="token punctuation">;</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>sequence <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        timestamp <span class="token operator">=</span> <span class="token function">tilNextMillis</span><span class="token punctuation">(</span>lastTimestamp<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span>sequence <span class="token operator">=</span> sequence<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token comment">// issue#I51EJY</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>randomSequenceLimit <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sequence <span class="token operator">=</span> <span class="token class-name">RandomUtil</span><span class="token punctuation">.</span><span class="token function">randomLong</span><span class="token punctuation">(</span>randomSequenceLimit<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        sequence <span class="token operator">=</span> <span class="token number">0L</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    lastTimestamp <span class="token operator">=</span> timestamp<span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>timestamp <span class="token operator">-</span> twepoch<span class="token punctuation">)</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">TIMESTAMP_LEFT_SHIFT</span><span class="token punctuation">)</span>
        <span class="token operator">|</span> <span class="token punctuation">(</span>dataCenterId <span class="token operator">&lt;&lt;</span> <span class="token constant">DATA_CENTER_ID_SHIFT</span><span class="token punctuation">)</span>
        <span class="token operator">|</span> <span class="token punctuation">(</span>workerId <span class="token operator">&lt;&lt;</span> <span class="token constant">WORKER_ID_SHIFT</span><span class="token punctuation">)</span>
        <span class="token operator">|</span> sequence<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 下一个ID（字符串形式）
   *
   * <span class="token keyword">@return</span> ID 字符串形式
   */</span>
  <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">nextIdStr</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">Long</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// ------------------------------------------------------------------------------------------------------------------------------------ Private method start</span>

  <span class="token doc-comment comment">/**
   * 循环等待下一个时间
   *
   * <span class="token keyword">@param</span> <span class="token parameter">lastTimestamp</span> 上次记录的时间
   * <span class="token keyword">@return</span> 下一个时间
   */</span>
  <span class="token keyword">private</span> <span class="token keyword">long</span> <span class="token function">tilNextMillis</span><span class="token punctuation">(</span><span class="token keyword">long</span> lastTimestamp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">long</span> timestamp <span class="token operator">=</span> <span class="token function">genTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 循环直到操作系统时间戳变化</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span>timestamp <span class="token operator">==</span> lastTimestamp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      timestamp <span class="token operator">=</span> <span class="token function">genTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>timestamp <span class="token operator">&lt;</span> lastTimestamp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// 如果发现新的时间戳比上次记录的时间戳数值小，说明操作系统时间发生了倒退，报错</span>
      <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span>
          <span class="token class-name">StrUtil</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token string">&quot;Clock moved backwards. Refusing to generate id for {}ms&quot;</span><span class="token punctuation">,</span> lastTimestamp <span class="token operator">-</span> timestamp<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> timestamp<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token doc-comment comment">/**
   * 生成时间戳
   *
   * <span class="token keyword">@return</span> 时间戳
   */</span>
  <span class="token keyword">private</span> <span class="token keyword">long</span> <span class="token function">genTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>useSystemClock <span class="token operator">?</span> <span class="token class-name">SystemClock</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token comment">// ------------------------------------------------------------------------------------------------------------------------------------ Private method end</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关键实现在 <code>nextId()</code> 方法内，做了两个保护性兼容</p><ol><li>记录上次生成id的时间戳，若当前时间戳小于上次产生的时间戳，则表示出现了时钟回拨，超过一定间隔，则直接抛异常</li></ol><figure><img src="`+k+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><ol start="2"><li>当前时间戳生成的id数量超过了4096最大值限制，则等待下一秒</li></ol><figure><img src="'+r+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>接下来看一下实际的使用</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Date</span> <span class="token constant">EPOC</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token number">2023</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token class-name">Snowflake</span> snowflake<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">HuToolSnowFlakeProducer</span><span class="token punctuation">(</span><span class="token keyword">int</span> workId<span class="token punctuation">,</span> <span class="token keyword">int</span> dataCenter<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        snowflake <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Snowflake</span><span class="token punctuation">(</span><span class="token constant">EPOC</span><span class="token punctuation">,</span> workId<span class="token punctuation">,</span> dataCenter<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">Long</span> <span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> snowflake<span class="token punctuation">.</span><span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
        <span class="token class-name">HuToolSnowFlakeProducer</span> producer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HuToolSnowFlakeProducer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">20</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>i <span class="token operator">%</span> <span class="token number">3</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>producer<span class="token punctuation">.</span><span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出如下:</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>1717380884565065728
1717380884565065729
1717380884565065730
1717380884573454336
1717380884573454337
1717380884573454338
1717380884586037248
1717380884586037249
1717380884586037250
1717380884594425856
1717380884594425857
1717380884594425858
1717380884607008768
1717380884607008769
1717380884607008770
1717380884619591680
1717380884619591681
1717380884619591682
1717380884632174592
1717380884632174593
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>生成的id：19位</li><li>单调递增，同一毫秒内，序号+1</li></ul><h3 id="_4-自定义雪花算法实现" tabindex="-1"><a class="header-anchor" href="#_4-自定义雪花算法实现" aria-hidden="true">#</a> 4. 自定义雪花算法实现</h3><p>在某些时候我们对雪花算法的实现有一些特殊的定制化场景，比如希望生成的id能一些更具有标识性，如以商城领域的订单数据模型为例</p><ul><li>第一位：标记订单类型， 1: 普通订单 2: 换货订单 3: 退货订单 4: 退款订单</li><li>第二三位：标记订单所属年份，如 22xxx，表示22年的订单；23xxx，则表示23年的订单</li></ul><p>再比如对订单的长度希望做一些限制,19位太多了，我希望16、7位的长度</p><p>再比如我希望调整workerId 与 datacenter之间的分配比例</p><p>基于以上等等原因，当我们面对需要修改雪花算法逻辑时，再知晓算法原理的基础上，完全可以自己手撸</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Slf4j</span>
<span class="token annotation punctuation">@Component</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SelfSnowflakeProducer</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * 自增序号位数
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">SEQUENCE_BITS</span> <span class="token operator">=</span> <span class="token number">12L</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 机器位数
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">WORKER_ID_BITS</span> <span class="token operator">=</span> <span class="token number">7L</span><span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">DATA_CENTER_BITS</span> <span class="token operator">=</span> <span class="token number">3L</span><span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">SEQUENCE_MASK</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">SEQUENCE_BITS</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">WORKER_ID_LEFT_SHIFT_BITS</span> <span class="token operator">=</span> <span class="token constant">SEQUENCE_BITS</span><span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">DATACENTER_LEFT_SHIFT_BITS</span> <span class="token operator">=</span> <span class="token constant">SEQUENCE_BITS</span> <span class="token operator">+</span> <span class="token constant">WORKER_ID_BITS</span><span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">TIMESTAMP_LEFT_SHIFT_BITS</span> <span class="token operator">=</span> <span class="token constant">WORKER_ID_LEFT_SHIFT_BITS</span> <span class="token operator">+</span> <span class="token constant">WORKER_ID_BITS</span> <span class="token operator">+</span> <span class="token constant">DATA_CENTER_BITS</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 机器id (7位）
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> workId <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 数据中心 (3位)
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> dataCenter <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 上次的访问时间
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> lastTime<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 自增序号
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> sequence<span class="token punctuation">;</span>

    <span class="token keyword">private</span> <span class="token keyword">byte</span> sequenceOffset<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">SelfSnowflakeProducer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Integer</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> <span class="token class-name">DevUtil</span><span class="token punctuation">.</span><span class="token function">calculateDefaultInfo</span><span class="token punctuation">(</span><span class="token constant">DATA_CENTER_BITS</span><span class="token punctuation">,</span> <span class="token constant">WORKER_ID_BITS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>dataCenter <span class="token operator">=</span> list<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>workId <span class="token operator">=</span> list<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">SelfSnowflakeProducer</span><span class="token punctuation">(</span><span class="token keyword">int</span> workId<span class="token punctuation">,</span> <span class="token keyword">int</span> dateCenter<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>workId <span class="token operator">=</span> workId<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>dataCenter <span class="token operator">=</span> dateCenter<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 生成趋势自增的id
     *
     * <span class="token keyword">@return</span>
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token class-name">Long</span> <span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">long</span> nowTime <span class="token operator">=</span> <span class="token function">waitToIncrDiffIfNeed</span><span class="token punctuation">(</span><span class="token function">getNowTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>lastTime <span class="token operator">==</span> nowTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token number">0L</span> <span class="token operator">==</span> <span class="token punctuation">(</span>sequence <span class="token operator">=</span> <span class="token punctuation">(</span>sequence <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span> <span class="token constant">SEQUENCE_MASK</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 表示当前这一时刻的自增数被用完了；等待下一时间点</span>
                nowTime <span class="token operator">=</span> <span class="token function">waitUntilNextTime</span><span class="token punctuation">(</span>nowTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">// 上一毫秒若以0作为序列号开始值，则这一秒以1为序列号开始值</span>
            <span class="token function">vibrateSequenceOffset</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            sequence <span class="token operator">=</span> sequenceOffset<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        lastTime <span class="token operator">=</span> nowTime<span class="token punctuation">;</span>
        <span class="token keyword">long</span> ans <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>nowTime <span class="token operator">%</span> <span class="token number">86400</span><span class="token punctuation">)</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">TIMESTAMP_LEFT_SHIFT_BITS</span><span class="token punctuation">)</span> <span class="token operator">|</span> <span class="token punctuation">(</span>dataCenter <span class="token operator">&lt;&lt;</span> <span class="token constant">DATACENTER_LEFT_SHIFT_BITS</span><span class="token punctuation">)</span> <span class="token operator">|</span> <span class="token punctuation">(</span>workId <span class="token operator">&lt;&lt;</span> <span class="token constant">WORKER_ID_LEFT_SHIFT_BITS</span><span class="token punctuation">)</span> <span class="token operator">|</span> sequence<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>log<span class="token punctuation">.</span><span class="token function">isDebugEnabled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;seconds:{}, datacenter:{}, work:{}, seq:{}, ans={}&quot;</span><span class="token punctuation">,</span> nowTime <span class="token operator">%</span> <span class="token number">86400</span><span class="token punctuation">,</span> dataCenter<span class="token punctuation">,</span> workId<span class="token punctuation">,</span> sequence<span class="token punctuation">,</span> ans<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token class-name">Long</span><span class="token punctuation">.</span><span class="token function">parseLong</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token string">&quot;%s%012d&quot;</span><span class="token punctuation">,</span> <span class="token function">getDaySegment</span><span class="token punctuation">(</span>nowTime<span class="token punctuation">)</span><span class="token punctuation">,</span> ans<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 若当前时间比上次执行时间要小，则等待时间追上来，避免出现时钟回拨导致的数据重复
     *
     * <span class="token keyword">@param</span> <span class="token parameter">nowTime</span> 当前时间戳
     * <span class="token keyword">@return</span> 返回新的时间戳
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> <span class="token function">waitToIncrDiffIfNeed</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token keyword">long</span> nowTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>lastTime <span class="token operator">&lt;=</span> nowTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> nowTime<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">long</span> diff <span class="token operator">=</span> lastTime <span class="token operator">-</span> nowTime<span class="token punctuation">;</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span>diff <span class="token operator">&lt;</span> <span class="token number">1000</span> <span class="token operator">?</span> diff <span class="token operator">*</span> <span class="token number">1000</span> <span class="token operator">:</span> diff<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RuntimeException</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token function">getNowTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 等待下一秒
     *
     * <span class="token keyword">@param</span> <span class="token parameter">lastTime</span>
     * <span class="token keyword">@return</span>
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> <span class="token function">waitUntilNextTime</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token keyword">long</span> lastTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">long</span> result <span class="token operator">=</span> <span class="token function">getNowTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>result <span class="token operator">&lt;=</span> lastTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            result <span class="token operator">=</span> <span class="token function">getNowTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> result<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">vibrateSequenceOffset</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sequenceOffset <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">byte</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">~</span>sequenceOffset <span class="token operator">&amp;</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>


    <span class="token doc-comment comment">/**
     * 获取当前时间
     *
     * <span class="token keyword">@return</span> 秒为单位
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> <span class="token function">getNowTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">1000</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 基于年月日构建分区
     *
     * <span class="token keyword">@param</span> <span class="token parameter">time</span> 时间戳
     * <span class="token keyword">@return</span> 时间分区
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token class-name">String</span> <span class="token function">getDaySegment</span><span class="token punctuation">(</span><span class="token keyword">long</span> time<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">LocalDateTime</span> localDate <span class="token operator">=</span> <span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">ofInstant</span><span class="token punctuation">(</span><span class="token class-name">Instant</span><span class="token punctuation">.</span><span class="token function">ofEpochMilli</span><span class="token punctuation">(</span>time <span class="token operator">*</span> <span class="token number">1000L</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token class-name">ZoneId</span><span class="token punctuation">.</span><span class="token function">systemDefault</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token string">&quot;%02d%03d&quot;</span><span class="token punctuation">,</span> localDate<span class="token punctuation">.</span><span class="token function">getYear</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">%</span> <span class="token number">100</span><span class="token punctuation">,</span> localDate<span class="token punctuation">.</span><span class="token function">getDayOfYear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意上面的实现，相比较于前面HuTool的实现，有几个变更</p><ol><li>时间戳从毫秒改为秒</li><li>生成id前五位：年 + 天</li><li>workcenterId : dataCenterId = 3 : 7</li><li>当时钟回拨时，等待时间追上，而不是直接抛异常</li><li>自增序列的起始值，0/1互切</li></ol><p>接下来再看下实际的使用输出</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
    <span class="token class-name">SelfSnowflakeProducer</span> producer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SelfSnowflakeProducer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">20</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>i <span class="token operator">%</span> <span class="token number">3</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">2000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>producer<span class="token punctuation">.</span><span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>23299055409901569
23299055409901570
23299055409901571
23299055418290176
23299055418290177
23299055418290178
23299055426678785
23299055426678786
23299055426678787
23299055435067392
23299055435067393
23299055435067394
23299055443456001
23299055443456002
23299055443456003
23299055451844608
23299055451844609
23299055451844610
23299055460233217
23299055460233218
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-小结" tabindex="-1"><a class="header-anchor" href="#_5-小结" aria-hidden="true">#</a> 5. 小结</h3><p>雪花算法本身的实现并不复杂，但是它的设计理念非常有意思；业界内也有不少基于雪花算法的变种实现，主要是为了解决时钟不一致及时钟回拨问题，如百度<code>UIDGenerator</code>，美团的<code>Leaf-Snowflake</code>方案</p><p>雪花算法其实是依赖于时间的一致性的，如果时间回拨，就可能有问题，其次机器数与自增序列虽然官方推荐是10位与12位，但正如没有万能的解决方案，只有最合适的解决方案，我们完全可以根据自己的实际诉求，对64个字节，进行灵活的分配</p><p>再实际使用雪花算法时，有几个注意事项</p><ol><li>雪花算法生成的id，通常是长整形，对于前端使用时，对于超过16位的数字，会出现精度问题，需要转换成String的方式传递，否则就会出现各种预料之外的事情发生</li><li>workId如何获取？</li></ol><ul><li>如：借助第三方服务(db/redis/zk)，统一为每个实例分配唯一的workId</li><li>如：同一个局域网内的所有应用，借助ip的最后一段来定位</li></ul><h2 id="ii-不能错过的源码和相关知识点" tabindex="-1"><a class="header-anchor" href="#ii-不能错过的源码和相关知识点" aria-hidden="true">#</a> II. 不能错过的源码和相关知识点</h2><h3 id="_0-项目" tabindex="-1"><a class="header-anchor" href="#_0-项目" aria-hidden="true">#</a> 0. 项目</h3>`,47),b={href:"https://github.com/liuyueyi/spring-boot-demo",target:"_blank",rel:"noopener noreferrer"},w={href:"https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/600-snowflake-id",target:"_blank",rel:"noopener noreferrer"};function y(f,g){const a=i("ExternalLinkIcon");return t(),o("div",null,[m,c(" more "),v,n("ul",null,[n("li",null,[s("工程："),n("a",b,[s("https://github.com/liuyueyi/spring-boot-demo"),e(a)])]),n("li",null,[s("源码："),n("a",w,[s("https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/600-snowflake-id"),e(a)])])])])}const _=p(d,[["render",y],["__file","231026-SpringBoot自定义雪花算法生成分布式id.html.vue"]]);export{_ as default};

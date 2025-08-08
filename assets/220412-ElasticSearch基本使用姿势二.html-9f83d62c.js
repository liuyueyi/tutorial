import{_ as o,V as p,W as i,Y as n,Z as s,$ as e,X as l,a1 as t,F as c}from"./framework-094145d2.js";const u="/tutorial/hexblog/imgs/220412/00.png",r="/tutorial/hexblog/imgs/220412/01.png",d="/tutorial/hexblog/imgs/220412/02.png",v="/tutorial/hexblog/imgs/220412/03.png",k="/tutorial/hexblog/imgs/220412/04.png",m="/tutorial/hexblog/imgs/220412/05.png",b="/tutorial/hexblog/imgs/220412/06.png",q="/tutorial/hexblog/imgs/220412/07.png",g="/tutorial/hexblog/imgs/220412/08.png",h="/tutorial/hexblog/imgs/220412/09.png",_="/tutorial/hexblog/imgs/220412/10.png",y="/tutorial/hexblog/imgs/220412/11.png",x="/tutorial/hexblog/imgs/220412/12.png",f="/tutorial/hexblog/imgs/220412/13.png",j={},E=n("p",null,"本文作为elasticsearch 基本使用姿势第二篇，包含以下内容",-1),z=n("ul",null,[n("li",null,"查询指定字段"),n("li",null,"限制返回条数"),n("li",null,"分页查询"),n("li",null,"分组查询"),n("li",null,"高亮"),n("li",null,"自动补全提示"),n("li",null,"排序"),n("li",null,"返回结果聚合，如统计文档数，某个field value的求和、平均值等")],-1),T={href:"https://blog.hhui.top/hexblog/2021/03/31/210331-ElasticSearch-%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF/",target:"_blank",rel:"noopener noreferrer"},G=t(`<h3 id="_0-数据准备" tabindex="-1"><a class="header-anchor" href="#_0-数据准备" aria-hidden="true">#</a> 0. 数据准备</h3><p>初始化一个索引，写入一些测试数据</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>post second-index/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;@timestamp&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2021-06-10 08:08:08&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/test&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;execute&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;args&quot;</span><span class="token operator">:</span> <span class="token string">&quot;id=10&amp;age=20&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;cost&quot;</span><span class="token operator">:</span> <span class="token number">10</span><span class="token punctuation">,</span>
    <span class="token property">&quot;res&quot;</span><span class="token operator">:</span> <span class="token string">&quot;test result&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;response_code&quot;</span><span class="token operator">:</span> <span class="token number">200</span><span class="token punctuation">,</span>
  <span class="token property">&quot;app&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yhh_demo&quot;</span>
<span class="token punctuation">}</span>


post second-index/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;@timestamp&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2021-06-10 08:08:09&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/test&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;execute&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;args&quot;</span><span class="token operator">:</span> <span class="token string">&quot;id=20&amp;age=20&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;cost&quot;</span><span class="token operator">:</span> <span class="token number">11</span><span class="token punctuation">,</span>
    <span class="token property">&quot;res&quot;</span><span class="token operator">:</span> <span class="token string">&quot;test result2&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;response_code&quot;</span><span class="token operator">:</span> <span class="token number">200</span><span class="token punctuation">,</span>
  <span class="token property">&quot;app&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yhh_demo&quot;</span>
<span class="token punctuation">}</span>


post second-index/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;@timestamp&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2021-06-10 08:08:10&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/test&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;execute&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;args&quot;</span><span class="token operator">:</span> <span class="token string">&quot;id=10&amp;age=20&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;cost&quot;</span><span class="token operator">:</span> <span class="token number">12</span><span class="token punctuation">,</span>
    <span class="token property">&quot;res&quot;</span><span class="token operator">:</span> <span class="token string">&quot;test result2&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;response_code&quot;</span><span class="token operator">:</span> <span class="token number">200</span><span class="token punctuation">,</span>
  <span class="token property">&quot;app&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yhh_demo&quot;</span>
<span class="token punctuation">}</span>


post second-index/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;@timestamp&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2021-06-10 08:08:09&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/hello&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;execute&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;args&quot;</span><span class="token operator">:</span> <span class="token string">&quot;tip=welcome&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;cost&quot;</span><span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
    <span class="token property">&quot;res&quot;</span><span class="token operator">:</span> <span class="token string">&quot;welcome&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;response_code&quot;</span><span class="token operator">:</span> <span class="token number">200</span><span class="token punctuation">,</span>
  <span class="token property">&quot;app&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yhh_demo&quot;</span>
<span class="token punctuation">}</span>

post second-index/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;@timestamp&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2021-06-10 08:08:09&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/404&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;execute&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;args&quot;</span><span class="token operator">:</span> <span class="token string">&quot;tip=welcome&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;cost&quot;</span><span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
    <span class="token property">&quot;res&quot;</span><span class="token operator">:</span> <span class="token string">&quot;xxxxxxxx&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;response_code&quot;</span><span class="token operator">:</span> <span class="token number">404</span><span class="token punctuation">,</span>
  <span class="token property">&quot;app&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yhh_demo&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-查询指定字段" tabindex="-1"><a class="header-anchor" href="#_1-查询指定字段" aria-hidden="true">#</a> 1. 查询指定字段</h3><p>比如我现在只关心url返回的状态码, 主要借助<code>_source</code>来指定需要查询的字段，查询的语法和之前介绍的一致</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;_source&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token string">&quot;url&quot;</span><span class="token punctuation">,</span>
    <span class="token string">&quot;response_code&quot;</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match_all&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+u+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_2-返回条数限制" tabindex="-1"><a class="header-anchor" href="#_2-返回条数限制" aria-hidden="true">#</a> 2. 返回条数限制</h3><p>针对返回结果条数进行限制，属于比较常见的case了，在es中，直接通过<code>size</code>来指定</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match_all&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">2</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+r+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_3-分页查询" tabindex="-1"><a class="header-anchor" href="#_3-分页查询" aria-hidden="true">#</a> 3. 分页查询</h3><p>通过size限制返回的文档数，通过from来实现分页</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match_all&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
  <span class="token property">&quot;from&quot;</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>(注意下面输出截图，与上面的对比，这里返回的是第二条数据)</p><figure><img src="`+d+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_4-分组查询" tabindex="-1"><a class="header-anchor" href="#_4-分组查询" aria-hidden="true">#</a> 4. 分组查询</h3><p>相当于sql中的<code>group by</code>，常用于聚合操作中的统计计数的场景</p><p>在es中，使用<code>aggs</code>来实现，语法如下</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;agg-name&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token comment">// 这个agg-name 是自定义的聚合名称</span>
        <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token comment">// 这个terms表示聚合的策略，根据 field进行分组</span>
            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span>
            <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">10</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>比如我们希望根据url统计访问计数，对应的查询可以是</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match_all&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;my-agg&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;url&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">2</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但是在执行时，会发现并不能正常响应</p><figure><img src="`+v+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>右边返回的提示信息为<code>Text fields are not optimised for operations that require per-document field data like aggregations and sorting, so these operations are disabled by default. Please use a keyword field instead. Alternatively, set fielddata=true on [url] in order to load field data by uninverting the inverted index. Note that this can use significant memory</code>这个异常</p><p>简单来说，就是url这个字段为text类型，默认情况下这种类型的不走索引，不支持聚合排序，如果需要则需要设置<code>fielddata=true</code>，或者使用url的分词<code>url.keyword</code></p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match_all&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;my-agg&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;url.keyword&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">2</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+k+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>注意</strong></p><ul><li><p>虽然我们更注重的是分组后的结果，但是<code>hits</code>中依然会返回命中的文档，若是只想要分组后的统计结果，可以在查询条件中添加 <code>size:0</code></p></li><li><p>聚合操作和查询条件是可以组合的，如只查询某个url对应的计数</p></li></ul><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;term&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;url.keyword&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/test&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;my-agg&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;url.keyword&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">2</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+m+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>上面介绍了TEXT类型的field，根据分词进行聚合操作；还有一种方式就是设置<code>fielddata=true</code>，操作姿势如下</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>PUT second-index/_mapping
<span class="token punctuation">{</span>
  <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span>
      <span class="token property">&quot;fielddata&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修改完毕之后，再根据url进行分组查询，就不会抛异常了</p><figure><img src="`+b+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_5-全文搜索" tabindex="-1"><a class="header-anchor" href="#_5-全文搜索" aria-hidden="true">#</a> 5. 全文搜索</h3>',37),B={href:"https://blog.hhui.top/hexblog/2021/10/18/211018-ElasticSearch%E5%85%A8%E6%96%87%E6%90%9C%E7%B4%A2%E6%94%AF%E6%8C%81%E9%85%8D%E7%BD%AE/",target:"_blank",rel:"noopener noreferrer"},A=t(`<p>通过配置一个动态索引模板，将所有的field构建一个用于全文检索的field，从而实现全文搜索</p><h3 id="_6-聚合操作" tabindex="-1"><a class="header-anchor" href="#_6-聚合操作" aria-hidden="true">#</a> 6. 聚合操作</h3><p>上面的分组也算是聚合操作中的一种，接下来仔细看一下es的聚合，可以支持哪些东西</p><p><strong>聚合语法:</strong></p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;agg_name&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token comment">// 自定义聚合名</span>
        <span class="token property">&quot;agg_type&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token comment">// agg_type聚合类型， 如 min, max</span>
            <span class="token string">&quot;agg_body&quot;</span> <span class="token comment">// 要操作的计算值</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span> 
        <span class="token property">&quot;meta&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">,</span> 
        <span class="token property">&quot;aggregations&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token comment">// 子聚合查询</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从聚合分类来看，可以划分为下面几种</p><ul><li>Metric Aggregation: 指标分析聚合</li><li>Bucket Aggregation: 分桶聚合</li><li>Pipeline: 管道分析类型</li><li>Matrix: 矩阵分析类型</li></ul><h4 id="_5-1-metric-aggregation-指标分析聚合" tabindex="-1"><a class="header-anchor" href="#_5-1-metric-aggregation-指标分析聚合" aria-hidden="true">#</a> 5.1 Metric Aggregation: 指标分析聚合</h4><p>常见的有 <code>min, max, avg, sum, cardinality, value count</code></p><p>通常是值查询一些需要通过计算获取到的值</p><p>下面分别给出一些演示说明</p><h5 id="_5-1-1-min最小值" tabindex="-1"><a class="header-anchor" href="#_5-1-1-min最小值" aria-hidden="true">#</a> 5.1.1 min最小值</h5><p>获取请求耗时最小的case</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;min_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;min&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>size: 0 表示不需要返回原数据</li><li>min_cost: 自定义的聚合名</li><li>min: 表示聚合类型，为取最小值</li><li><code>&quot;field&quot;: &quot;execute.cost&quot;</code>: 表示取的是<code>Field: execute.cost</code>的最小值</li></ul><figure><img src="`+q+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h5 id="_5-1-2-max-最大值" tabindex="-1"><a class="header-anchor" href="#_5-1-2-max-最大值" aria-hidden="true">#</a> 5.1.2 max 最大值</h5><p>基本同上，下面中贴出请求代码，截图就省略掉了</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;max_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;max&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_5-1-3-sum-求和" tabindex="-1"><a class="header-anchor" href="#_5-1-3-sum-求和" aria-hidden="true">#</a> 5.1.3 sum 求和</h5><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;sum_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;sum&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_5-1-4-avg平均值" tabindex="-1"><a class="header-anchor" href="#_5-1-4-avg平均值" aria-hidden="true">#</a> 5.1.4 avg平均值</h5><p>在监控平均耗时的统计中，这个还是比较能体现服务的整体性能的</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;avg_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;avg&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_5-1-5-cardinality-去重统计计数" tabindex="-1"><a class="header-anchor" href="#_5-1-5-cardinality-去重统计计数" aria-hidden="true">#</a> 5.1.5 cardinality 去重统计计数</h5><p>这个等同于我们常见的 <code>distinct count</code> 注意与后面的 <code>value count</code> 统计所有有值的文档数量之间的区别</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;_source&quot;</span><span class="token operator">:</span> <span class="token string">&quot;url&quot;</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;cardinality_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;cardinality&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;url&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>去重统计url的计数，如下图，可以看到返回统计结果为3，但是实际的文档数有5个</p><figure><img src="`+g+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h5 id="_5-1-6-value-count-计数统计" tabindex="-1"><a class="header-anchor" href="#_5-1-6-value-count-计数统计" aria-hidden="true">#</a> 5.1.6 value count 计数统计</h5><p>文档数量统计，区别于上面的去重统计，这里返回的是全量</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET second-index/_search
{
  &quot;size&quot;: 0, 
  &quot;aggs&quot;: {
    &quot;count_cost&quot;: {
      &quot;value_count&quot;: {
        &quot;field&quot;: &quot;url&quot;
      }
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出结果配合cardinality的返回，做一个对比可以加强理解</p><figure><img src="`+h+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h5 id="_5-1-7-stats-多值计算" tabindex="-1"><a class="header-anchor" href="#_5-1-7-stats-多值计算" aria-hidden="true">#</a> 5.1.7 stats 多值计算</h5><p>一个stats 可以返回上面<code>min,max,sum...</code>等的计算值</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;mult_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;stats&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+_+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h5 id="_5-1-8-extended-stats-多值扩展" tabindex="-1"><a class="header-anchor" href="#_5-1-8-extended-stats-多值扩展" aria-hidden="true">#</a> 5.1.8 extended_stats 多值扩展</h5><p>在上面stats的基础上进行扩展，支持方差，标准差等返回</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;mult_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;extended_stats&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+y+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h5 id="_5-1-9-percentile-百分位数统计" tabindex="-1"><a class="header-anchor" href="#_5-1-9-percentile-百分位数统计" aria-hidden="true">#</a> 5.1.9 percentile 百分位数统计</h5><blockquote><p>用于统计 xx% 的记录值，小于等于右边</p></blockquote><p>如下面截图，可知 99%的记录，耗时小于12</p><figure><img src="'+x+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>默认的百分比区间是: <code>[1, 45, 25, 50, 75, 95, 99]</code>， 可以手动修改</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span> 
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;agg_cost&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;percentiles&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;execute.cost&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;percents&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
          <span class="token number">10</span><span class="token punctuation">,</span>
          <span class="token number">50</span><span class="token punctuation">,</span>
          <span class="token number">90</span><span class="token punctuation">,</span>
          <span class="token number">99</span>
        <span class="token punctuation">]</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_5-1-10-percentile-rank统计值所在的区间" tabindex="-1"><a class="header-anchor" href="#_5-1-10-percentile-rank统计值所在的区间" aria-hidden="true">#</a> 5.1.10 percentile rank统计值所在的区间</h5><p>上面用于统计不同区间的占比，比如公司的人员年龄分布；而这一个则是我想知道18岁的我，在哪个占比里</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET second-index/_search
{
  &quot;size&quot;: 0, 
  &quot;aggs&quot;: {
    &quot;agg_cost&quot;: {
      &quot;percentile_ranks&quot;: {
        &quot;field&quot;: &quot;execute.cost&quot;,
        &quot;values&quot;: [6, 9]
      }
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+f+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_5-2-bucket-aggregation-分桶聚合" tabindex="-1"><a class="header-anchor" href="#_5-2-bucket-aggregation-分桶聚合" aria-hidden="true">#</a> 5.2 Bucket Aggregation 分桶聚合</h4><p>参考博文：</p>',54),w={href:"https://blog.csdn.net/qq_41063182/article/details/108944340",target:"_blank",rel:"noopener noreferrer"},C={href:"https://zhuanlan.zhihu.com/p/107820698",target:"_blank",rel:"noopener noreferrer"},S={href:"https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html",target:"_blank",rel:"noopener noreferrer"},F=n("h2",{id:"一灰灰的联系方式",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#一灰灰的联系方式","aria-hidden":"true"},"#"),s(" 一灰灰的联系方式")],-1),N=n("p",null,"尽信书则不如无书，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激",-1),V={href:"https://blog.hhui.top",target:"_blank",rel:"noopener noreferrer"},Q={href:"https://weibo.com/p/1005052169825577/home",target:"_blank",rel:"noopener noreferrer"},D=n("li",null,"QQ： 一灰灰/3302797840",-1),M=n("li",null,[s("微信公众号："),n("strong",null,"一灰灰blog")],-1),P=n("figure",null,[n("img",{src:"https://spring.hhui.top/spring-blog/imgs/info/info.png",alt:"QrCode",tabindex:"0",loading:"lazy"}),n("figcaption",null,"QrCode")],-1);function I(L,X){const a=c("ExternalLinkIcon");return p(),i("div",null,[E,z,n("blockquote",null,[n("p",null,[s("更多相关知识点请查看: * "),n("a",T,[s("210331-ElasticSearch 基本使用姿势 - 一灰灰Blog"),e(a)])])]),l(" more "),G,n("ul",null,[n("li",null,[n("a",B,[s("211018-ElasticSearch全文搜索支持配置 - 一灰灰Blog"),e(a)])])]),A,n("p",null,[n("a",w,[s("ElasticSearch：aggregations 聚合详解"),e(a)])]),n("p",null,[n("a",C,[s("Elasticsearch 聚合分析深入学习"),e(a)])]),n("p",null,[n("a",S,[s("Elasticsearch: 权威指南-聚合"),e(a)])]),F,N,n("ul",null,[n("li",null,[s("个人站点："),n("a",V,[s("https://blog.hhui.top"),e(a)])]),n("li",null,[s("微博地址: "),n("a",Q,[s("小灰灰Blog"),e(a)])]),D,M]),P])}const W=o(j,[["render",I],["__file","220412-ElasticSearch基本使用姿势二.html.vue"]]);export{W as default};

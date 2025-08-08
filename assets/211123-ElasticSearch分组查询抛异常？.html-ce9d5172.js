import{_ as t,V as o,W as p,X as i,Y as n,Z as s,$ as e,a1 as l,F as c}from"./framework-094145d2.js";const r="/tutorial/hexblog/imgs/211123/00.jpg",u="/tutorial/hexblog/imgs/211123/01.jpg",d="/tutorial/hexblog/imgs/211123/02.jpg",k="/tutorial/hexblog/imgs/211123/03.jpg",v={},m=n("p",null,"在使用es进行组合查询的时候，遇到一个非常有意思的场景，特此记录一下",-1),q=n("p",null,[s("某些场景下，直接针对某个Field进行分组查询，居然无法返回结果，会给出类似"),n("code",null,"Text fields are not optimised for operations that require per-document field data like aggregations and sorting, so these operations are disabled by default"),s("的提示信息，接下来看一下这个问题是个什么情况，以及如何解决")],-1),b=l(`<h3 id="_1-数据准备" tabindex="-1"><a class="header-anchor" href="#_1-数据准备" aria-hidden="true">#</a> 1. 数据准备</h3><p>初始化一个索引，写入一些测试数据</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>post second-index/_doc
<span class="token punctuation">{</span>
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
  <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/404&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;execute&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;args&quot;</span><span class="token operator">:</span> <span class="token string">&quot;tip=welcome&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;cost&quot;</span><span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
    <span class="token property">&quot;res&quot;</span><span class="token operator">:</span> <span class="token string">&quot;xxxxxxxx&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;response_code&quot;</span><span class="token operator">:</span> <span class="token number">404</span><span class="token punctuation">,</span>
  <span class="token property">&quot;app&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yhh_demo&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-分组查询基本知识点" tabindex="-1"><a class="header-anchor" href="#_2-分组查询基本知识点" aria-hidden="true">#</a> 2. 分组查询基本知识点</h3><p>相当于sql中的<code>group by</code>，常用于聚合操作中的统计计数的场景</p><p>在es中，使用<code>aggs</code>来实现，语法如下</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>直接执行上面的分组查询，结果问题来了</p><figure><img src="`+r+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>右边返回的提示信息为<code>Text fields are not optimised for operations that require per-document field data like aggregations and sorting, so these operations are disabled by default. Please use a keyword field instead. Alternatively, set fielddata=true on [url] in order to load field data by uninverting the inverted index. Note that this can use significant memory</code>这个异常</p><h3 id="_3-解决方案" tabindex="-1"><a class="header-anchor" href="#_3-解决方案" aria-hidden="true">#</a> 3. 解决方案</h3><p>简单来说，上面这个问题，就是因为url这个字段为text类型，默认情况下这种类型的不走索引，不支持聚合排序，如果需要则需要设置<code>fielddata=true</code>，或者使用url的分词<code>url.keyword</code></p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+u+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>注意</strong></p><ul><li><p>虽然我们更注重的是分组后的结果，但是<code>hits</code>中依然会返回命中的文档，若是只想要分组后的统计结果，可以在查询条件中添加 <code>size:0</code></p></li><li><p>聚合操作和查询条件是可以组合的，如只查询某个url对应的计数</p></li></ul><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET second-index/_search
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+d+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>上面介绍了TEXT类型的field，根据分词进行聚合操作；还有一种方式就是设置<code>fielddata=true</code>，操作姿势如下</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>PUT second-index/_mapping
<span class="token punctuation">{</span>
  <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;url&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span>
      <span class="token property">&quot;fielddata&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修改完毕之后，再根据url进行分组查询，就不会抛异常了</p><figure><img src="`+k+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_4-小结" tabindex="-1"><a class="header-anchor" href="#_4-小结" aria-hidden="true">#</a> 4. 小结</h3><p>最后小结一下，当我们使用es的某个field进行分组操作时，此时需要注意</p><p>当这个field类型为text，默认的场景下是不支持分组操作的，如果非要用它进行分组查询，有两个办法</p><ul><li>使用它的索引字段，如 <code>url.keyword</code></li><li>在索引的filed上添加<code>fileddata: true</code> 配置</li></ul><h2 id="一灰灰的联系方式" tabindex="-1"><a class="header-anchor" href="#一灰灰的联系方式" aria-hidden="true">#</a> 一灰灰的联系方式</h2><p>尽信书则不如无书，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激</p>',30),g={href:"https://blog.hhui.top",target:"_blank",rel:"noopener noreferrer"},y={href:"https://weibo.com/p/1005052169825577/home",target:"_blank",rel:"noopener noreferrer"},h=n("li",null,"QQ： 一灰灰/3302797840",-1),_=n("li",null,[s("微信公众号："),n("strong",null,"一灰灰blog")],-1),f=n("figure",null,[n("img",{src:"https://spring.hhui.top/spring-blog/imgs/info/info.png",alt:"QrCode",tabindex:"0",loading:"lazy"}),n("figcaption",null,"QrCode")],-1);function x(j,z){const a=c("ExternalLinkIcon");return o(),p("div",null,[m,q,i(" more "),b,n("ul",null,[n("li",null,[s("个人站点："),n("a",g,[s("https://blog.hhui.top"),e(a)])]),n("li",null,[s("微博地址: "),n("a",y,[s("小灰灰Blog"),e(a)])]),h,_]),f])}const E=t(v,[["render",x],["__file","211123-ElasticSearch分组查询抛异常？.html.vue"]]);export{E as default};

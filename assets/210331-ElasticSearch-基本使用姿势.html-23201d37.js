import{_ as t,V as l,W as o,X as p,Z as n,a1 as s,$ as i,Y as a,F as u}from"./framework-b1bd8911.js";const c="/tutorial/hexblog/imgs/210331/00.jpg",d="/tutorial/hexblog/imgs/210331/01.jpg",r="/tutorial/hexblog/imgs/210331/02.jpg",v="/tutorial/hexblog/imgs/210331/03.jpg",m="/tutorial/hexblog/imgs/210331/04.jpg",b="/tutorial/hexblog/imgs/210331/05.jpg",k="/tutorial/hexblog/imgs/210331/06.jpg",g="/tutorial/hexblog/imgs/210331/07.jpg",q="/tutorial/hexblog/imgs/210331/08.jpg",h="/tutorial/hexblog/imgs/210331/09.jpg",f="/tutorial/hexblog/imgs/210331/10.jpg",_="/tutorial/hexblog/imgs/210331/11.jpg",x="/tutorial/hexblog/imgs/210331/12.jpg",y="/tutorial/hexblog/imgs/210331/13.jpg",j="/tutorial/hexblog/imgs/210331/14.jpg",T="/tutorial/hexblog/imgs/210331/15.jpg",E="/tutorial/hexblog/imgs/210331/16.jpg",z="/tutorial/hexblog/imgs/210331/17.jpg",G="/tutorial/hexblog/imgs/210331/18.jpg",w="/tutorial/hexblog/imgs/210331/19.jpg",S={},P=n("p",null,"ElasticSearch 基本使用姿势，如常见的",-1),H=n("ul",null,[n("li",null,"添加文档"),n("li",null,"常见的查询姿势"),n("li",null,"修改/删除文档")],-1),B=a(`<h3 id="_1-添加文档" tabindex="-1"><a class="header-anchor" href="#_1-添加文档" aria-hidden="true">#</a> 1. 添加文档</h3><p>首次添加文档时，若索引不存在会自动创建； 借助kibana的<code>dev-tools</code>来实现es的交互</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>POST first-index/_doc
<span class="token punctuation">{</span>
  <span class="token string">&quot;@timestamp&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;2021-03-31T01:12:00&quot;</span>,
  <span class="token string">&quot;message&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;GET /search HTTP/1.1 200 1070000&quot;</span>,
  <span class="token string">&quot;user&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;id&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;YiHui&quot;</span>,
    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;一灰灰Blog&quot;</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;addr&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;country&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;cn&quot;</span>,
    <span class="token string">&quot;province&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;hubei&quot;</span>,
    <span class="token string">&quot;city&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;wuhan&quot;</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">18</span>
<span class="token punctuation">}</span>

<span class="token comment">## 添加两个数据进行测试</span>
POST first-index/_doc
<span class="token punctuation">{</span>
  <span class="token string">&quot;@timestamp&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;2021-03-31T02:12:00&quot;</span>,
  <span class="token string">&quot;message&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;GET /search HTTP/1.1 200 1070000&quot;</span>,
  <span class="token string">&quot;user&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;id&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ErHui&quot;</span>,
    <span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;二灰灰Blog&quot;</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;addr&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;country&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;cn&quot;</span>,
    <span class="token string">&quot;province&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;hubei&quot;</span>,
    <span class="token string">&quot;city&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;wuhan&quot;</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">19</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然也可以直接使用http进行交互，下面的方式和上面等价（后面都使用kibanan进行交互，更直观一点）</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span>  <span class="token parameter variable">-X</span> POST <span class="token string">&#39;http://localhost:9200/first-index/_doc?pretty&#39;</span> <span class="token parameter variable">-H</span> <span class="token string">&#39;Content-Type: application/json&#39;</span> <span class="token parameter variable">-d</span> <span class="token string">&#39;
{
  &quot;@timestamp&quot;: &quot;2021-03-31T01:12:00&quot;,
  &quot;message&quot;: &quot;GET /search HTTP/1.1 200 1070000&quot;,
  &quot;user&quot;: {
    &quot;id&quot;: &quot;YiHui&quot;,
    &quot;name&quot;: &quot;一灰灰Blog&quot;
  },
  &quot;addr&quot;: {
    &quot;country&quot;: &quot;cn&quot;,
    &quot;province&quot;: &quot;hubei&quot;,
    &quot;city&quot;: &quot;wuhan&quot;
  },
  &quot;age&quot;: 18
}&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+c+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_2-查询文档" tabindex="-1"><a class="header-anchor" href="#_2-查询文档" aria-hidden="true">#</a> 2. 查询文档</h3><h4 id="_2-0-kibana配置并查询" tabindex="-1"><a class="header-anchor" href="#_2-0-kibana配置并查询" aria-hidden="true">#</a> 2.0 kibana配置并查询</h4><p>除了基础的查询语法之外，直接使用kibana进行查询，对于使用方而言，门槛最低；首先配置上面的es索引</p><ul><li>Management -&gt; Stack Management -&gt; Kiabana Index Patterns</li><li>index pattern name</li><li>时间字段，选择 <code>@timestamp</code> 这个与实际的文档中的field有关</li></ul><figure><img src="'+d+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><figure><img src="'+r+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><figure><img src="'+v+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><figure><img src="'+m+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>接下来进入<code>Discover</code> 进行查询</p><figure><img src="'+b+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>比如字段查询</p><figure><img src="'+k+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_2-1-查询所有" tabindex="-1"><a class="header-anchor" href="#_2-1-查询所有" aria-hidden="true">#</a> 2.1 查询所有</h4><p>不加任何匹配，捞出文档(当数据量很多时，当然也不会真的全部返回，也是会做分页的)</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET my-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;match_all&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+g+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_2-2-term精确匹配" tabindex="-1"><a class="header-anchor" href="#_2-2-term精确匹配" aria-hidden="true">#</a> 2.2 term精确匹配</h4><p>根据field进行value匹配，忽略大小写;</p><p>查询语法，形如: <code>{&quot;query&quot;: {&quot;term&quot;: {&quot;成员名&quot;: {&quot;value&quot;: &quot;查询值&quot;}}}}</code></p><ul><li><code>query</code>, <code>term</code>, <code>value</code> 三个key为固定值</li><li><code>成员名</code>: 为待查询的成员</li><li><code>查询值</code>: 需要匹配的值</li></ul><p>(说明：后面语法中，中文的都是需要替换的，英文的为固定值)</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;user.id&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;value&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;yihui&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+q+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>当value不匹配，或者查询的field不存在，则查不到的对应的信息，如</p><figure><img src="'+h+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_2-3-terms-多值匹配" tabindex="-1"><a class="header-anchor" href="#_2-3-terms-多值匹配" aria-hidden="true">#</a> 2.3 terms 多值匹配</h4><p>term表示value的精确匹配，如果我希望类似<code>value in (xxx)</code>的查询，则可以使用terms</p><p>语法:</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
	<span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
		<span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
			<span class="token property">&quot;成员名&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>成员值<span class="token punctuation">,</span> 成员值<span class="token punctuation">]</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实例如</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;terms&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;user.id&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span><span class="token string">&quot;yihui&quot;</span>, <span class="token string">&quot;erhui&quot;</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+f+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_2-4-range-范围匹配" tabindex="-1"><a class="header-anchor" href="#_2-4-range-范围匹配" aria-hidden="true">#</a> 2.4 range 范围匹配</h4><p>适用于数值、日期的比较查询，如常见的 &gt;, &gt;=, &lt;, &lt;=</p><p>查询语法</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
	<span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;range&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;成员名&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                <span class="token property">&quot;gte&quot;</span><span class="token operator">:</span> <span class="token string">&quot;查询下界&quot;</span> <span class="token punctuation">,</span>
                <span class="token property">&quot;lte&quot;</span><span class="token operator">:</span> <span class="token string">&quot;查询下界&quot;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th>范围操作符</th><th>说明</th></tr></thead><tbody><tr><td><code>gt</code></td><td>大于 &gt;</td></tr><tr><td><code>gte</code></td><td>大于等于 &gt;=</td></tr><tr><td><code>lt</code></td><td>小于 &lt;</td></tr><tr><td><code>lte</code></td><td>小于等于 &lt;=</td></tr></tbody></table><p>实例如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;range&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;gte&quot;</span><span class="token builtin class-name">:</span> <span class="token number">10</span>,
        <span class="token string">&quot;lte&quot;</span><span class="token builtin class-name">:</span> <span class="token number">18</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+_+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_2-5-字段过滤" tabindex="-1"><a class="header-anchor" href="#_2-5-字段过滤" aria-hidden="true">#</a> 2.5 字段过滤</h4><p>根据是否包含某个字段来查询， 主要有两个 <code>exists</code> 表示要求存在， <code>missing</code>表示要求不存在</p><p>查询语法</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;exists/missing&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;字段值&quot;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实例如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;exists&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;field&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;age&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+x+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_2-6-组合查询" tabindex="-1"><a class="header-anchor" href="#_2-6-组合查询" aria-hidden="true">#</a> 2.6 组合查询</h4><p>上面都是单个查询条件，单我们需要多个查询条件组合使用时，可以使用<code>bool + must/must_not/should</code>来实现</p><p>查询语法</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;bool&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;must&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span> # 相当于and查询
                <span class="token string">&quot;查询条件1&quot;</span><span class="token punctuation">,</span>
                <span class="token string">&quot;查询条件2&quot;</span>
            <span class="token punctuation">]</span><span class="token punctuation">,</span>
            <span class="token property">&quot;must_not&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span> # 多个查询条件相反匹配，相当与not
                ...
            <span class="token punctuation">]</span><span class="token punctuation">,</span>
            <span class="token property">&quot;should&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span> # 有一个匹配即可， 相当于or
                ...
            <span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实例如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment">## user.id = yihui and age &lt; 20</span>
GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;must&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
          <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;user.id&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
              <span class="token string">&quot;value&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;yihui&quot;</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>,
        <span class="token punctuation">{</span>
          <span class="token string">&quot;range&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
              <span class="token string">&quot;lt&quot;</span><span class="token builtin class-name">:</span> <span class="token number">20</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">]</span> 
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment"># !(user.id) = yihui and !(age&gt;20)</span>
GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;must_not&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
          <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;user.id&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
              <span class="token string">&quot;value&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;yihui&quot;</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>,
        <span class="token punctuation">{</span>
          <span class="token string">&quot;range&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
              <span class="token string">&quot;gt&quot;</span><span class="token builtin class-name">:</span> <span class="token number">20</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">]</span> 
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment"># user.id = &#39;yihui&#39; or age&gt;20</span>
GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;bool&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;should&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
          <span class="token string">&quot;term&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;user.id&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
              <span class="token string">&quot;value&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;yihui&quot;</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>,
        <span class="token punctuation">{</span>
          <span class="token string">&quot;range&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
              <span class="token string">&quot;gt&quot;</span><span class="token builtin class-name">:</span> <span class="token number">20</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">]</span> 
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面截图以 must_not 输出示意</p><figure><img src="`+y+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>说明</strong></p><ul><li>前面根据字段查询 <code>existing</code> 只能单个匹配，可以借助这里的组合来实现多个的判断</li></ul><h4 id="_2-7-match查询" tabindex="-1"><a class="header-anchor" href="#_2-7-match查询" aria-hidden="true">#</a> 2.7 match查询</h4><p>最大的特点是它更适用于模糊查询，比如查询某个field中的字段匹配</p><p>语法</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;字段名&quot;</span><span class="token operator">:</span> <span class="token string">&quot;查询值&quot;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>举例说明</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;user.name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;灰og&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+j+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>说明，如果有精确查询的需求，使用前面的term，可以缓存结果</strong></p><h4 id="_2-8-multi-match查询" tabindex="-1"><a class="header-anchor" href="#_2-8-multi-match查询" aria-hidden="true">#</a> 2.8 multi_match查询</h4>',72),F={href:"https://www.elastic.co/guide/cn/elasticsearch/guide/current/multi-match-query.html",target:"_blank",rel:"noopener noreferrer"},N=a(`<p>多个字段中进行查询</p><p>语法</p><ul><li>type: <code>best_fields</code> 、 <code>most_fields</code> 和 <code>cross_fields</code> （最佳字段、多数字段、跨字段）</li><li><strong>最佳字段</strong> ：当搜索词语具体概念的时候，比如 “brown fox” ，词组比各自独立的单词更有意义</li><li><strong>多数字段</strong>：为了对相关度进行微调，常用的一个技术就是将相同的数据索引到不同的字段，它们各自具有独立的分析链。</li><li><strong>混合字段</strong>：对于某些实体，我们需要在多个字段中确定其信息，单个字段都只能作为整体的一部分</li></ul><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;multi_match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;query&quot;</span><span class="token operator">:</span>                <span class="token string">&quot;Quick brown fox&quot;</span><span class="token punctuation">,</span>
            <span class="token property">&quot;type&quot;</span><span class="token operator">:</span>                 <span class="token string">&quot;best_fields&quot;</span><span class="token punctuation">,</span> 
            <span class="token property">&quot;fields&quot;</span><span class="token operator">:</span>               <span class="token punctuation">[</span> <span class="token string">&quot;title&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;body&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">,</span>
            <span class="token property">&quot;tie_breaker&quot;</span><span class="token operator">:</span>          <span class="token number">0.3</span><span class="token punctuation">,</span>
            <span class="token property">&quot;minimum_should_match&quot;</span><span class="token operator">:</span> <span class="token string">&quot;30%&quot;</span> 
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实例演示</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;multi_match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;汉&quot;</span>,
      <span class="token string">&quot;fields&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span><span class="token string">&quot;user.id&quot;</span>, <span class="token string">&quot;addr.city&quot;</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+T+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>上面除了写上精确的字段之外，还支持模糊匹配，比如所有字段中进行匹配</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;multi_match&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;blog&quot;</span>,
      <span class="token string">&quot;fields&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span><span class="token string">&quot;*&quot;</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-9-wildcard查询" tabindex="-1"><a class="header-anchor" href="#_2-9-wildcard查询" aria-hidden="true">#</a> 2.9 wildcard查询</h4><p>shell统配符</p><ul><li><code>?</code>: 0/1个字符</li><li><code>*</code>: 0/n个字符</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET first-index/_search
{
  &quot;query&quot;: {
    &quot;wildcard&quot;: {
      &quot;user.id&quot;: {
        &quot;value&quot;: &quot;*Hu?&quot;
      }
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>说明，对中文可能有问题</strong></p><h4 id="_2-10-regexp查询" tabindex="-1"><a class="header-anchor" href="#_2-10-regexp查询" aria-hidden="true">#</a> 2.10 regexp查询</h4><p>正则匹配</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;regexp&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;user.name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;.*log&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-11-prefix查询" tabindex="-1"><a class="header-anchor" href="#_2-11-prefix查询" aria-hidden="true">#</a> 2.11 prefix查询</h4><p>前缀匹配</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;prefix&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
      <span class="token string">&quot;user.name&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;一&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-12-排序" tabindex="-1"><a class="header-anchor" href="#_2-12-排序" aria-hidden="true">#</a> 2.12 排序</h4><p>查询结果排序，根据sort来指定</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
	<span class="token property">&quot;sort&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
          <span class="token property">&quot;成员变量&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;order&quot;</span><span class="token operator">:</span> <span class="token string">&quot;desc&quot;</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
  	<span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实例如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET first-index/_search
<span class="token punctuation">{</span>
  <span class="token string">&quot;query&quot;</span>:<span class="token punctuation">{</span>
    <span class="token string">&quot;match_all&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;sort&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      <span class="token string">&quot;@timestamp&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
        <span class="token string">&quot;order&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;desc&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-13-更多" tabindex="-1"><a class="header-anchor" href="#_2-13-更多" aria-hidden="true">#</a> 2.13 更多</h4><p>更多操作姿势，可以在官方文档上获取</p>`,27),O={href:"https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html",target:"_blank",rel:"noopener noreferrer"},V=a(`<h3 id="_3-删除文档" tabindex="-1"><a class="header-anchor" href="#_3-删除文档" aria-hidden="true">#</a> 3. 删除文档</h3><p>需要根据文档id进行指定删除</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>DELETE first-index/_doc/gPYLh3gBF9fSFsHNEe58
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="`+E+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>删除成功</p><figure><img src="'+z+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="_4-更新文档" tabindex="-1"><a class="header-anchor" href="#_4-更新文档" aria-hidden="true">#</a> 4.更新文档</h3><h4 id="_4-1-覆盖更新" tabindex="-1"><a class="header-anchor" href="#_4-1-覆盖更新" aria-hidden="true">#</a> 4.1 覆盖更新</h4><p>使用PUT来实现更新，同样通过id进行</p><ul><li>覆盖更新</li><li>version版本会+1</li><li>如果id对应的文档不存在，则新增</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>PUT first-index/_doc/f_ZFhngBF9fSFsHNte7f
<span class="token punctuation">{</span>
  <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">28</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+G+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h4 id="_4-2-增量更新" tabindex="-1"><a class="header-anchor" href="#_4-2-增量更新" aria-hidden="true">#</a> 4.2 增量更新</h4><p>采用POST来实现增量更新</p><ul><li>field 存在，则更新</li><li>field不存在，则新增</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>POST first-index/_update/gvarh3gBF9fSFsHNuO49
<span class="token punctuation">{</span>
  <span class="token string">&quot;doc&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;age&quot;</span><span class="token builtin class-name">:</span> <span class="token number">25</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+w+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>此外还可以采用script脚本更新</p><ul><li>在原来的age基础上 + 5</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>POST first-index/_update/gvarh3gBF9fSFsHNuO49
<span class="token punctuation">{</span>
  <span class="token string">&quot;script&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;ctx._source.age += 5&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,20);function L(Y,C){const e=u("ExternalLinkIcon");return l(),o("div",null,[P,H,p(" more "),B,n("blockquote",null,[n("p",null,[s("更多相关信息，可以查看: "),n("a",F,[s("官网-multi_match查询"),i(e)])])]),N,n("p",null,[n("a",O,[s("官方教程"),i(e)])]),V])}const D=t(S,[["render",L],["__file","210331-ElasticSearch-基本使用姿势.html.vue"]]);export{D as default};

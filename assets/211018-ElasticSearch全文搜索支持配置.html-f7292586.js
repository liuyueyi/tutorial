import{_ as o,V as e,W as p,X as l,Y as n,Z as s,$ as t,a1 as i,F as u}from"./framework-094145d2.js";const c={},r=n("p",null,"在es的使用过程中，全文搜索属于一个常见的场景，特别是当我们将es作为日志存储检索来使用时，根据关键字查询对应的日志信息，可以怎么处理呢?",-1),d=i(`<h3 id="_1-动态模板结合copy-to方式" tabindex="-1"><a class="header-anchor" href="#_1-动态模板结合copy-to方式" aria-hidden="true">#</a> 1. 动态模板结合copy_to方式</h3><p>在创建索引的时候，我们新增一个allColumnValue的字段，将所有其他的column值都拷贝过去，然后针对这个字段进行检索，即可以实现全文的搜索方式了</p><p>这里借助<code>dynamic_templtes</code>来实现上面的自动拷贝逻辑，因此我们可以如下创建一个索引</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>PUT search_all_demo 
<span class="token punctuation">{</span>
  <span class="token property">&quot;mappings&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;dynamic_templates&quot;</span> <span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
          <span class="token property">&quot;copy_to_allcolumnvalue&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;match_mapping_type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;*&quot;</span><span class="token punctuation">,</span>
            <span class="token property">&quot;mapping&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
              <span class="token property">&quot;copy_to&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;allColumnValue&quot;</span><span class="token punctuation">,</span>
              <span class="token property">&quot;ignore_above&quot;</span> <span class="token operator">:</span> <span class="token number">512</span><span class="token punctuation">,</span>
              <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;allColumnValue&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;text&quot;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建上面的映射表时，两个点</p><ul><li>allColumnValue：字段</li><li>dynamic_templates: 实现字段拷贝</li></ul><p>接下来写入一个数据进行测试</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>
POST search_all_demo/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;一灰灰&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;site&quot;</span><span class="token operator">:</span> <span class="token string">&quot;www.hhui.top&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;java developer&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后检索一下是否可以查询到希望的结果</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET search_all_demo/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;allColumnValue&quot;</span><span class="token operator">:</span> <span class="token string">&quot;灰灰&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面这个查询之后，正常会命中我们的数据，并返回</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;took&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
  <span class="token property">&quot;timed_out&quot;</span> <span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  <span class="token property">&quot;_shards&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;total&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token property">&quot;successful&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token property">&quot;skipped&quot;</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
    <span class="token property">&quot;failed&quot;</span> <span class="token operator">:</span> <span class="token number">0</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;hits&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;total&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;value&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
      <span class="token property">&quot;relation&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;eq&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;max_score&quot;</span> <span class="token operator">:</span> <span class="token number">0.7911257</span><span class="token punctuation">,</span>
    <span class="token property">&quot;hits&quot;</span> <span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token punctuation">{</span>
        <span class="token property">&quot;_index&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;search_all_demo&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;_doc&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_id&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;1FoBk3wB-kdeh8MF_IbL&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_score&quot;</span> <span class="token operator">:</span> <span class="token number">0.7911257</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_source&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;name&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;一灰灰&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;site&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;www.hhui.top&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;title&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;java developer&quot;</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">]</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>注意</strong></p><p>使用上面这种配置时，对于Field有要求，当我们制定一个Map类型时，会失败</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST search_all_demo/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;一灰&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;site&quot;</span><span class="token operator">:</span> <span class="token string">&quot;blog.hhui.top&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;ddd&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;user&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;pwd&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的<code>ddd</code>会提示异常</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;error&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;root_cause&quot;</span> <span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token punctuation">{</span>
        <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;mapper_parsing_exception&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;reason&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;failed to parse field [ddd] of type [keyword] in document with id &#39;11qek3wB-kdeh8MFm4bN&#39;. Preview of field&#39;s value: &#39;{pwd=yihui, user=yihui}&#39;&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;mapper_parsing_exception&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;reason&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;failed to parse field [ddd] of type [keyword] in document with id &#39;11qek3wB-kdeh8MFm4bN&#39;. Preview of field&#39;s value: &#39;{pwd=yihui, user=yihui}&#39;&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;caused_by&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;illegal_state_exception&quot;</span><span class="token punctuation">,</span>
      <span class="token property">&quot;reason&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;Can&#39;t get text on a START_OBJECT at 4:10&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;status&quot;</span> <span class="token operator">:</span> <span class="token number">400</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-部分字段组合搜索" tabindex="-1"><a class="header-anchor" href="#_2-部分字段组合搜索" aria-hidden="true">#</a> 2. 部分字段组合搜索</h3><p>上面介绍的是全量的数据凭借到allColumnValue，从而实现全文检索；可能在实际的场景中，我只是希望对部分的field进行联合检索，基于此可以如下设置</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>PUT search_union_demo 
<span class="token punctuation">{</span>
  <span class="token property">&quot;mappings&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;allColumnValue&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;text&quot;</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;ignore_above&quot;</span> <span class="token operator">:</span> <span class="token number">512</span><span class="token punctuation">,</span>
          <span class="token property">&quot;copy_to&quot;</span> <span class="token operator">:</span> <span class="token punctuation">[</span>
            <span class="token string">&quot;allColumnValue&quot;</span>
          <span class="token punctuation">]</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
         <span class="token property">&quot;site&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;ignore_above&quot;</span> <span class="token operator">:</span> <span class="token number">512</span><span class="token punctuation">,</span>
          <span class="token property">&quot;copy_to&quot;</span> <span class="token operator">:</span> <span class="token punctuation">[</span>
            <span class="token string">&quot;allColumnValue&quot;</span>
          <span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>新增两个数据</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>POST search_union_demo/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;test&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;site&quot;</span><span class="token operator">:</span> <span class="token string">&quot;spring.hhui.top&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;ddd&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;user&quot;</span><span class="token operator">:</span> <span class="token string">&quot;一灰&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;pwd&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

POST search_union_demo/_doc
<span class="token punctuation">{</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;一灰&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;site&quot;</span><span class="token operator">:</span> <span class="token string">&quot;blog.hhui.top&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;ddd&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;user&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;pwd&quot;</span><span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后我们检索<code>一灰</code>时，可以查到第二条数据</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code>GET search_union_demo/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;allColumnValue&quot;</span><span class="token operator">:</span> <span class="token string">&quot;一灰&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出结果</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;took&quot;</span> <span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
  <span class="token property">&quot;timed_out&quot;</span> <span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  <span class="token property">&quot;_shards&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;total&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token property">&quot;successful&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token property">&quot;skipped&quot;</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
    <span class="token property">&quot;failed&quot;</span> <span class="token operator">:</span> <span class="token number">0</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;hits&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;total&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;value&quot;</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
      <span class="token property">&quot;relation&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;eq&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;max_score&quot;</span> <span class="token operator">:</span> <span class="token number">1.2814486</span><span class="token punctuation">,</span>
    <span class="token property">&quot;hits&quot;</span> <span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token punctuation">{</span>
        <span class="token property">&quot;_index&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;search_union_demo&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_type&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;_doc&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_id&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;2Fqjk3wB-kdeh8MFy4aC&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_score&quot;</span> <span class="token operator">:</span> <span class="token number">1.2814486</span><span class="token punctuation">,</span>
        <span class="token property">&quot;_source&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;name&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;一灰&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;site&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;blog.hhui.top&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;ddd&quot;</span> <span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;user&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span><span class="token punctuation">,</span>
            <span class="token property">&quot;pwd&quot;</span> <span class="token operator">:</span> <span class="token string">&quot;yihui&quot;</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">]</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-小结" tabindex="-1"><a class="header-anchor" href="#_3-小结" aria-hidden="true">#</a> 3. 小结</h3><p>本文主要介绍借助copy_to，来实现es的联合/全文搜索的功能；通过简单的设置，来支撑更友好的查询场景</p><h2 id="ii-其他" tabindex="-1"><a class="header-anchor" href="#ii-其他" aria-hidden="true">#</a> II. 其他</h2>`,29),k={id:"_1-一灰灰blog-https-liuyueyi-github-io-hexblog",tabindex:"-1"},v=n("a",{class:"header-anchor",href:"#_1-一灰灰blog-https-liuyueyi-github-io-hexblog","aria-hidden":"true"},"#",-1),q={href:"https://liuyueyi.github.io/hexblog",target:"_blank",rel:"noopener noreferrer"},m={href:"https://liuyueyi.github.io/hexblog",target:"_blank",rel:"noopener noreferrer"},b=n("p",null,"一灰灰的个人博客，记录所有学习和工作中的博文，欢迎大家前去逛逛",-1),y=n("h3",{id:"_2-声明",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#_2-声明","aria-hidden":"true"},"#"),s(" 2. 声明")],-1),h=n("p",null,"尽信书则不如，以上内容，纯属一家之言，因个人能力有限，难免有疏漏和错误之处，如发现bug或者有更好的建议，欢迎批评指正，不吝感激",-1),_={href:"https://weibo.com/p/1005052169825577/home",target:"_blank",rel:"noopener noreferrer"},g=n("li",null,"QQ： 一灰灰/3302797840",-1),f=n("h3",{id:"_3-扫描关注",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#_3-扫描关注","aria-hidden":"true"},"#"),s(" 3. 扫描关注")],-1),x=n("p",null,[n("strong",null,"一灰灰blog")],-1),j=n("figure",null,[n("img",{src:"https://spring.hhui.top/spring-blog/imgs/info/info.png",alt:"QrCode",tabindex:"0",loading:"lazy"}),n("figcaption",null,"QrCode")],-1);function w(C,V){const a=u("ExternalLinkIcon");return e(),p("div",null,[r,l(" more "),d,n("h3",k,[v,s(" 1. "),n("a",q,[s("一灰灰Blog"),t(a)]),s("： "),n("a",m,[s("https://liuyueyi.github.io/hexblog"),t(a)])]),b,y,h,n("ul",null,[n("li",null,[s("微博地址: "),n("a",_,[s("小灰灰Blog"),t(a)])]),g]),f,x,j])}const B=o(c,[["render",w],["__file","211018-ElasticSearch全文搜索支持配置.html.vue"]]);export{B as default};

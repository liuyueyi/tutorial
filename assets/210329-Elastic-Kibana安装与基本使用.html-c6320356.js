import{_ as i,V as l,W as t,a1 as d,X as e,Y as a,Z as c,a0 as n,F as r}from"./framework-23f3cf9b.js";const o="/tutorial/hexblog/imgs/210329/00.jpg",u="/tutorial/hexblog/imgs/210329/01.jpg",v="/tutorial/hexblog/imgs/210329/02.jpg",p="/tutorial/hexblog/imgs/210329/03.jpg",m={},b=e("p",null,"本文主要介绍es & kibana的安装和基本使用，更多es的相关用法后面逐一补上",-1),g=n(`<h3 id="_1-elasticsearch安装" tabindex="-1"><a class="header-anchor" href="#_1-elasticsearch安装" aria-hidden="true">#</a> 1. elasticsearch安装</h3><p>linux环境下，直接下载安装包</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code> <span class="token comment"># 下载</span>
 <span class="token function">wget</span> https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.0-linux-x86_64.tar.gz
 
 <span class="token comment"># 解压</span>
 <span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> elasticsearch-7.12.0-linux-x86_64.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>jvm参数配置</p><p>默认es启动，占用的内存太大了，本机测试有必要限制一下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> config/jvm.options

<span class="token comment">## 堆空间，根据实际情况调整</span>
<span class="token parameter variable">-Xms2g</span>
<span class="token parameter variable">-Xmx2g</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>启动</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>bin/elasticsearch
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>启动完毕之后，会看到控制台有一些输出，日志不打印时，可以输入下面的查询，验证是否ok</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">-X</span> GET http://localhost:9200/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_2-kibana安装" tabindex="-1"><a class="header-anchor" href="#_2-kibana安装" aria-hidden="true">#</a> 2. kibana安装</h3><p>同样linux环境下，直接下载tar包解压使用</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">wget</span> https://artifacts.elastic.co/downloads/kibana/kibana-7.12.0-linux-x86_64.tar.gz

<span class="token function">tar</span> <span class="token parameter variable">-zxvf</span> kibana-7.12.0-linux-x86_64.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参数配置</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>vim config/kibana.yml

<span class="token comment"># 端口</span>
<span class="token key atrule">server.port</span><span class="token punctuation">:</span> <span class="token number">5601</span>

<span class="token comment"># es 地址</span>
<span class="token key atrule">elasticsearch.hosts</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;http://localhost:9200&quot;</span><span class="token punctuation">]</span>

<span class="token comment"># 指定索引名</span>
<span class="token key atrule">kibana.index</span><span class="token punctuation">:</span> <span class="token string">&quot;.kibana&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>启动</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>bin/kibana
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>访问</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>http://localhost:5601/app/home
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_3-dev-tools-实现es基本操作" tabindex="-1"><a class="header-anchor" href="#_3-dev-tools-实现es基本操作" aria-hidden="true">#</a> 3. Dev Tools 实现es基本操作</h3><p>借助kibana来做一些es的基本操作，如添加文档，查询等</p>`,21),h={href:"http://localhost:5601/app/dev_tools#/console",target:"_blank",rel:"noopener noreferrer"},x=n(`<p><strong>添加文档</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST my-index-000001/_doc
{
  &quot;@timestamp&quot;: &quot;2021-03-29T10:12:00&quot;,
  &quot;message&quot;: &quot;GET /search HTTP/1.1 200 1070000&quot;,
  &quot;user&quot;: {
    &quot;id&quot;: &quot;kimchy&quot;,
    &quot;name&quot;: &quot;YiHui&quot;
  },
  &quot;hobby&quot;: [
    &quot;java&quot;,
    &quot;python&quot;
  ]
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+o+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>查询所有</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST my-index-000001/_search
{
  &quot;query&quot;: {
    &quot;match_all&quot;: {
      
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+u+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>精确查询</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST my-index-000001/_search
{
  &quot;query&quot;: {
    &quot;match&quot;: {
      &quot;user.name&quot;: &quot;YiHui&quot;
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+v+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>删除索引</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>DELETE my-index-000001
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="`+p+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure>',12);function _(k,q){const s=r("ExternalLinkIcon");return l(),t("div",null,[b,d(" more "),g,e("p",null,[a("打开url: "),e("a",h,[a("http://localhost:5601/app/dev_tools#/console"),c(s)])]),x])}const y=i(m,[["render",_],["__file","210329-Elastic-Kibana安装与基本使用.html.vue"]]);export{y as default};

import{_ as e,V as t,W as i,X as l,Z as s,a1 as n,$ as c,Y as o,F as r}from"./framework-b1bd8911.js";const d={},p=s("p",null,[n("本文记录"),s("code",null,"Centos 7.5"),n(" 安装 "),s("code",null,"ElasticSearch 6.8.5"),n(" 版本的全过程")],-1),u=s("h3",{id:"_1-es安装流程",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#_1-es安装流程","aria-hidden":"true"},"#"),n(" 1. ES安装流程")],-1),v=s("blockquote",null,[s("p",null,"es的运行依赖jdk，所以需要先安装好java环境，我们这里用的jdk1.8，这里不额外说明jdk环境的安装流程")],-1),m=s("h4",{id:"a-下载",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#a-下载","aria-hidden":"true"},"#"),n(" a. 下载")],-1),b={href:"https://www.elastic.co/cn/downloads/past-releases#elasticsearch",target:"_blank",rel:"noopener noreferrer"},h=o(`<p>本文选择<code>6.8.5</code>（主要是为了和<code>SpringBoot 2.2.0-RELEASE</code>对上）</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">wget</span> https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.8.5.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="b-解压启动" tabindex="-1"><a class="header-anchor" href="#b-解压启动" aria-hidden="true">#</a> b. 解压启动</h4><p>下载完之后，直接解压，并进入目录，</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">unzip</span> elasticsearch-6.8.5.tar.gz
<span class="token builtin class-name">cd</span> elasticsearch-6.8.5
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>修改配置，指定数据存储和日志路径，支持外部访问</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> conf/elasticsearch.yml

<span class="token comment"># 请确保下面两个目录存在，且拥有访问权限</span>
path.data: /data/es/data
path.logs: /data/es/logs

<span class="token comment"># 本机ip</span>
network.host: <span class="token number">192.168</span>.0.174
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="c-启动测试" tabindex="-1"><a class="header-anchor" href="#c-启动测试" aria-hidden="true">#</a> c. 启动测试</h4><p>直接运行bin目录下的<code>elasticsearch</code>即可启动es，当然也可以以后台方式启动</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> starth.sh

<span class="token function">nohup</span> bin/elasticsearch <span class="token operator"><span class="token file-descriptor important">1</span>&gt;</span> /dev/null <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span> <span class="token operator">&amp;</span>
<span class="token builtin class-name">echo</span> <span class="token variable">$!</span> <span class="token operator"><span class="token file-descriptor important">1</span>&gt;</span> pid.log

<span class="token comment"># 执行starth.sh脚本，运行</span>
<span class="token function">sh</span> start.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>本机访问:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> http://192.168.0.174:9200/

<span class="token punctuation">{</span>
  <span class="token string">&quot;name&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;ZyI14BD&quot;</span>,
  <span class="token string">&quot;cluster_name&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;elasticsearch&quot;</span>,
  <span class="token string">&quot;cluster_uuid&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;YYFtAHGOSS6ijjDf4VuDoA&quot;</span>,
  <span class="token string">&quot;version&quot;</span> <span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;number&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;6.8.4&quot;</span>,
    <span class="token string">&quot;build_flavor&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;default&quot;</span>,
    <span class="token string">&quot;build_type&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;tar&quot;</span>,
    <span class="token string">&quot;build_hash&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;bca0c8d&quot;</span>,
    <span class="token string">&quot;build_date&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;2019-10-16T06:19:49.319352Z&quot;</span>,
    <span class="token string">&quot;build_snapshot&quot;</span> <span class="token builtin class-name">:</span> false,
    <span class="token string">&quot;lucene_version&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;7.7.2&quot;</span>,
    <span class="token string">&quot;minimum_wire_compatibility_version&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;5.6.0&quot;</span>,
    <span class="token string">&quot;minimum_index_compatibility_version&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;5.0.0&quot;</span>
  <span class="token punctuation">}</span>,
  <span class="token string">&quot;tagline&quot;</span> <span class="token builtin class-name">:</span> <span class="token string">&quot;You Know, for Search&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12);function k(g,q){const a=r("ExternalLinkIcon");return t(),i("div",null,[p,l(" more "),u,v,m,s("p",null,[n("首先到目标网站，查询需要下载的版本 : "),s("a",b,[n("https://www.elastic.co/cn/downloads/past-releases#elasticsearch"),c(a)])]),h])}const f=e(d,[["render",k],["__file","200605-Centos-安装ElasticSearch.html.vue"]]);export{f as default};

import{_ as e,V as i,W as l,Y as n,Z as s,$ as t,X as c,a1 as o,F as d}from"./framework-094145d2.js";const p={},u=n("p",null,"本文记录基于bind服务搭建的内网dns解析过程",-1),r={href:"https://blog.csdn.net/qq_40478570/article/details/79778997?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase",target:"_blank",rel:"noopener noreferrer"},m=o(`<h3 id="_1-安装" tabindex="-1"><a class="header-anchor" href="#_1-安装" aria-hidden="true">#</a> 1. 安装</h3><p>centos7 直接使用<code>yum</code>进行安装</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>yum <span class="token parameter variable">-y</span> <span class="token function">install</span> <span class="token builtin class-name">bind</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_2-配置" tabindex="-1"><a class="header-anchor" href="#_2-配置" aria-hidden="true">#</a> 2. 配置</h3><p>named相关配置文件，在 <code>/etc/named*</code>下面</p><p>首先进入配置文件<code>named.conf</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>options <span class="token punctuation">{</span>
 		  // 改成any，侦听所有网卡
        listen-on port <span class="token number">53</span> <span class="token punctuation">{</span> any<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
        // 不监听ipv6
        // listen-on-v6 port <span class="token number">53</span> <span class="token punctuation">{</span> ::1<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
        <span class="token punctuation">..</span>.
        // 注意，将这个里面的内容改成any, 允许所有人查询
        allow-query     <span class="token punctuation">{</span> any<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
        <span class="token punctuation">..</span>.
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>进入内网域名配置, <code>named.rfc1912.zone</code>，添加local内网域名</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>zone <span class="token string">&quot;local&quot;</span> IN <span class="token punctuation">{</span>
        <span class="token builtin class-name">type</span> master<span class="token punctuation">;</span>
        <span class="token function">file</span> <span class="token string">&quot;local.zone&quot;</span><span class="token punctuation">;</span>
        allow-update <span class="token punctuation">{</span> none<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来需要编写 <code>local.zone</code> 文件</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> /var/named/local.zone


<span class="token variable">$TTL</span>    1D
@       IN      SOA     @       local. <span class="token punctuation">(</span>
                                        <span class="token number">0</span>       <span class="token punctuation">;</span> serial
                                        1D      <span class="token punctuation">;</span> refresh
                                        1H      <span class="token punctuation">;</span> retry
                                        1W      <span class="token punctuation">;</span> expire
                                        3H <span class="token punctuation">)</span>    <span class="token punctuation">;</span> minimum
                IN NS           @
                IN A            <span class="token number">192.168</span>.0.188
<span class="token builtin class-name">test</span>            IN A            <span class="token number">192.168</span>.0.188
wiki            IN A            <span class="token number">192.168</span>.0.188
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一列为主机名 + 第二列为记录类型 + 第三列为映射地址</p><h3 id="_3-启动" tabindex="-1"><a class="header-anchor" href="#_3-启动" aria-hidden="true">#</a> 3. 启动</h3><p>使用 <code>systemctl</code> 启动服务</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 启动</span>
systemctl start named
<span class="token comment"># 关闭</span>
systemctl stop named
<span class="token comment"># 重启</span>
systemctl restart named
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>测试</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">nslookup</span> wiki.local

Server:		<span class="token number">192.168</span>.0.188
Address:	<span class="token number">192.168</span>.0.188<span class="token comment">#53</span>

Name:	wiki.local
Address: <span class="token number">192.168</span>.0.188
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,17);function v(b,k){const a=d("ExternalLinkIcon");return i(),l("div",null,[u,n("blockquote",null,[n("p",null,[s("参考: "),n("a",r,[s("Centos7Bind正反区域配置"),t(a)])])]),c(" more "),m])}const _=e(p,[["render",v],["__file","200624-Centos-内网DNS服务named配置手册.html.vue"]]);export{_ as default};

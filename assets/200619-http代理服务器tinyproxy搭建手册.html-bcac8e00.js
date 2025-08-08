import{_ as i,V as t,W as l,X as r,Y as n,Z as e,$ as c,a1 as s,F as o}from"./framework-094145d2.js";const d={},p=s(`<p>简单记录一下http代理服务器tinyproxy的搭建与简单配置过程</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 安装</span>
<span class="token function">sudo</span> yum <span class="token function">install</span> tinyproxy <span class="token parameter variable">-y</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,2),m=s(`<p>安装完毕之后，做一些基本的配置，比如端口，允许的ip等</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> /etc/tinyproxy/tinyproxy.conf

<span class="token comment"># 端口</span>
Port <span class="token number">18888</span>

<span class="token comment"># 允许的ip，如果不配置allow，那么默认所有的ip都可以进来</span>
Allow <span class="token number">127.0</span>.0.1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>服务启动关闭等命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 启动</span>
systemctl start tinyproxy.service
<span class="token comment"># 重启</span>
systemctl restart tinyproxy.service
<span class="token comment"># 关闭</span>
systemctl stop tinyproxy.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看代理日志</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">tail</span> <span class="token parameter variable">-f</span> /var/log/tinyproxy/tinyproxy.log
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>测试：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 请注意，</span>
<span class="token function">curl</span> <span class="token parameter variable">-x</span> <span class="token string">&quot;127.0.0.1:18888&quot;</span> <span class="token parameter variable">-v</span> <span class="token string">&#39;http://www.baidu.com&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,8),v={href:"https://blog.csdn.net/weixin_45926849/article/details/103455406",target:"_blank",rel:"noopener noreferrer"};function u(b,h){const a=o("ExternalLinkIcon");return t(),l("div",null,[p,r(" more "),m,n("p",null,[e("参考文档: "),n("a",v,[e("linux搭建http代理服务器"),c(a)])])])}const y=i(d,[["render",u],["__file","200619-http代理服务器tinyproxy搭建手册.html.vue"]]);export{y as default};

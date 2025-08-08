import{_ as e,V as n,W as a,X as i,Y as s,Z as d,a1 as l}from"./framework-094145d2.js";const c={},r=s("h2",{id:"i-redis安装",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#i-redis安装","aria-hidden":"true"},"#"),d(" I. redis安装")],-1),t=s("p",null,"centos安装并后台启动redis记录过程",-1),o=l(`<p>安装redis命令，比较简单</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>yum <span class="token function">install</span> redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>后台启动redis方式：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 设置redis.conf文件，开启后台启动</span>

<span class="token function">vim</span> /etc/redis.conf


<span class="token comment">## 找到 daemonize no 这一行</span>
<span class="token comment">## 修改成yes，并保存</span>
daemonize <span class="token function">yes</span>


<span class="token comment">## 启动redis</span>
redis-server /etc/redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看redis启动是否正常</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 查看进程号</span>
<span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>客户端连接测试</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>redis-cli

<span class="token operator">&gt;</span> <span class="token builtin class-name">set</span> <span class="token builtin class-name">test</span> <span class="token number">123</span>
<span class="token operator">&gt;</span> get <span class="token builtin class-name">test</span>
<span class="token operator">&gt;</span> expire <span class="token builtin class-name">test</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,8);function p(m,v){return n(),a("div",null,[r,t,i(" more "),o])}const b=e(c,[["render",p],["__file","01.redis安装.html.vue"]]);export{b as default};

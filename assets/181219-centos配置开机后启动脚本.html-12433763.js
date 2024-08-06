import{_ as e,V as n,W as s,a0 as a}from"./framework-23f3cf9b.js";const c={},i=a(`<h2 id="配置开机后执行脚本" tabindex="-1"><a class="header-anchor" href="#配置开机后执行脚本" aria-hidden="true">#</a> 配置开机后执行脚本</h2><p>配置相对简单，添加一个执行命令即可</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> /etc/rc.d/rc.local

<span class="token comment"># 在文件最后添加</span>
<span class="token function">sh</span> /home/yihui/xxx.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>执行脚本，添加上可执行的权限即可</p>`,4),t=[i];function d(l,o){return n(),s("div",null,t)}const _=e(c,[["render",d],["__file","181219-centos配置开机后启动脚本.html.vue"]]);export{_ as default};

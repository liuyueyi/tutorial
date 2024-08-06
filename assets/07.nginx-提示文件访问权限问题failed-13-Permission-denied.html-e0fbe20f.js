import{_ as e,V as n,W as s,a0 as a}from"./framework-23f3cf9b.js";const i={},d=a(`<p>nginx配置完毕之后，添加一个html页面，访问直接500错误，通过查看错误日志，显示 <code>failed (13: Permission denied)</code></p><p>解决方法，修改配置文件中的<code>user</code>为<code>root</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> /etc/nginx/nginx.conf

user root<span class="token punctuation">;</span>
worker_processes auto<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修改完之后，重启即可</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>nginx <span class="token parameter variable">-s</span> reload
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,5),c=[d];function o(l,r){return n(),s("div",null,c)}const _=e(i,[["render",o],["__file","07.nginx-提示文件访问权限问题failed-13-Permission-denied.html.vue"]]);export{_ as default};

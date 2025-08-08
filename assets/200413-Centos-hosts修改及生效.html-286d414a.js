import{_ as e,V as s,W as n,a1 as t}from"./framework-094145d2.js";const a={},c=t(`<p>centos域名绑定与生效</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 修改域名</span>
<span class="token function">vim</span> /etc/hosts

<span class="token comment"># 生效</span>
/etc/init.d/network restart
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),i=[c];function o(l,d){return s(),n("div",null,i)}const _=e(a,[["render",o],["__file","200413-Centos-hosts修改及生效.html.vue"]]);export{_ as default};

import{_ as n,V as s,W as e,a1 as a}from"./framework-094145d2.js";const t={},o=a(`<p><strong>centos 6 修改方式</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 修改hostname，立即生效</span>
<span class="token function">hostname</span> new-hostname
<span class="token comment"># 查看hostanme</span>
<span class="token function">hostname</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>centos 7 修改方式</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 修改hostname，立即生效</span>
hostnamectl set-hostname new-hostname
<span class="token comment"># 查看hostname</span>
<span class="token function">hostname</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4),c=[o];function i(l,d){return s(),e("div",null,c)}const r=n(t,[["render",i],["__file","200728-Centos-hostname修改.html.vue"]]);export{r as default};

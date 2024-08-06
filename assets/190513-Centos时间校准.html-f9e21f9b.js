import{_ as e,V as s,W as a,a1 as t,X as n,a0 as l}from"./framework-23f3cf9b.js";const c={},i=n("p",null,"centos系统时间校准",-1),d=n("div",{class:"language-bash line-numbers-mode","data-ext":"sh"},[n("pre",{class:"language-bash"},[n("code",null,`ntpdate cn.pool.ntp.org
`)]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"})])],-1),o=l(`<p>安装ntp，然后后台启动，持续校准</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 安装ntp</span>
<span class="token function">sudo</span> yum <span class="token parameter variable">-y</span> <span class="token function">install</span> ntp
<span class="token comment"># 使用 ntpdate 测试 NTP</span>
ntpdate cn.pool.ntp.org
<span class="token comment"># 查看服务器时间</span>
<span class="token function">date</span>
<span class="token comment"># 启动ntpd daemon，持续校准时间</span>
systemctl start ntpd
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2);function r(p,m){return s(),a("div",null,[i,d,t(" more "),o])}const v=e(c,[["render",r],["__file","190513-Centos时间校准.html.vue"]]);export{v as default};

import{_ as e,V as n,W as s,a1 as a}from"./framework-094145d2.js";const i={},l=a(`<p>直接使用influx-cli查询数据时，时间戳格式不太友好，记录下显示日期的方式</p><p><strong>连接时添加参数</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>influx <span class="token parameter variable">-precision</span> rfc3339
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>连接后设置参数</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 进入控制台</span>
influx

<span class="token comment"># 设置参数</span>
precision rfc3339
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5),c=[l];function r(d,t){return n(),s("div",null,c)}const _=e(i,[["render",r],["__file","06.190509-InfluxDb之时间戳显示为日期格式.html.vue"]]);export{_ as default};

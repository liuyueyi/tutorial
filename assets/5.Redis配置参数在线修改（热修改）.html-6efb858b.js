import{_ as e,V as s,W as n,X as a,Z as i,Y as d}from"./framework-b1bd8911.js";const t={},l=i("p",null,"redis的配置除了直接修改配置文件之后，重启进程之外，还支持在线修改，下面记录一下使用姿势",-1),c=d(`<p>我们主要通过config命令来查询和修改配置，如获取所有配置</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 获取所有的配置</span>
config get *
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>下面以一个具体的实例来进行说明，我们知道redis的默认保存策略是RDB方式，通过save参数配置保存规则</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>config get save
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>默认输出结果如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>1) &quot;save&quot;
2) &quot;900 1 300 10 60 10000&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>第一行返回的是配置名</p><p>第二行返回的是配置信息，对应配置文件中的</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>save 900 1              #在900秒(15分钟)之后，如果至少有1个key发生变化，则dump内存快照。
save 300 10            #在300秒(5分钟)之后，如果至少有10个key发生变化，则dump内存快照。
save 60 10000        #在60秒(1分钟)之后，如果至少有10000个key发生变化，则dump内存快照。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以修改一下，将60s的策略扔掉，如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> config <span class="token builtin class-name">set</span> save <span class="token string">&quot;900 1 300 10&quot;</span>
OK
<span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> config get save
<span class="token number">1</span><span class="token punctuation">)</span> <span class="token string">&quot;save&quot;</span>
<span class="token number">2</span><span class="token punctuation">)</span> <span class="token string">&quot;900 1 300 10&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,11);function o(r,p){return s(),n("div",null,[l,a(" more "),c])}const v=e(t,[["render",o],["__file","5.Redis配置参数在线修改（热修改）.html.vue"]]);export{v as default};

import{_ as n,V as s,W as i,X as t,Z as e,a1 as a,Y as d}from"./framework-b1bd8911.js";const l={},o=e("h1",{id:"centos网络带宽监控小结",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#centos网络带宽监控小结","aria-hidden":"true"},"#"),a(" Centos网络带宽监控小结")],-1),r=e("p",null,[a("查看机器的网络流入流出带宽，一个简单的方式就是利用 "),e("code",null,"iftop"),a(" ,下面简单的记录下使用姿势")],-1),c=d(`<h2 id="i-详情" tabindex="-1"><a class="header-anchor" href="#i-详情" aria-hidden="true">#</a> I. 详情</h2><h3 id="_1-安装依赖" tabindex="-1"><a class="header-anchor" href="#_1-安装依赖" aria-hidden="true">#</a> 1. 安装依赖</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment">## 首先确认是否已经安装</span>
<span class="token function">which</span> iftop

<span class="token comment">## 安装</span>
<span class="token function">sudo</span> yum <span class="token function">install</span> iftop <span class="token parameter variable">-y</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-使用" tabindex="-1"><a class="header-anchor" href="#_2-使用" aria-hidden="true">#</a> 2. 使用</h3><p>安装完毕之后，使用也比较简单，首先找出需要监控的网卡</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">ifconfig</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>其次就是监控网卡的流入流出</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>iftop <span class="token parameter variable">-i</span> eth0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>运行后截图如下</p><figure><img src="https://upload-images.jianshu.io/upload_images/1405936-4fa147e24e7eb07d.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure><p>参数说明</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>&quot;&lt;=&quot;与&quot;=&gt;&quot;，表示的是流量的方向

&quot;TX&quot;：从网卡发出的流量
&quot;RX&quot;：网卡接收流量
&quot;TOTAL&quot;：网卡发送接收总流量
&quot;cum&quot;：iftop开始运行到当前时间点的总流量
&quot;peak&quot;：网卡流量峰值
&quot;rates&quot;：分别表示最近2s、10s、40s 的平均流量
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12);function u(p,m){return s(),i("div",null,[o,r,t("more"),c])}const h=n(l,[["render",u],["__file","180906-Centos网络带宽监控小结.html.vue"]]);export{h as default};

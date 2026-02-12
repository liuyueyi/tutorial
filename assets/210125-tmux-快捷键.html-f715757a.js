import{_ as i,V as l,W as a,X as d,Z as n,a1 as e,$ as r,Y as c,F as t}from"./framework-b1bd8911.js";const v={},u=n("p",null,"tmux 终端复用器，最简单质朴的需求就是多窗格，会话复用，本文简单记录一下常用的快捷键",-1),m=c(`<p><strong>安装</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># unbuntu</span>
<span class="token function">sudo</span> <span class="token function">apt-get</span> <span class="token function">install</span> tmux
<span class="token comment"># centos</span>
<span class="token function">sudo</span> yum <span class="token function">install</span> tmux
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>基本命令</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 启动</span>
tmux

<span class="token comment"># 退出, 下面两个都可以</span>
ctrl + d
<span class="token builtin class-name">exit</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>快捷键</strong></p><p>请注意，使用快捷键之前，先按 <code>ctrl+b</code> 松开，再输入其他的</p><p>窗格快捷键</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 左右两个窗格
ctrl + b: %

# 上下两个窗格
ctrl + b: &quot;

# 选中不同的窗格 
ctrl + b: 四个方向键
ctrl + b: : 上个窗格
ctrl + b: o 下个窗格

# 关闭当前窗格
ctrl + b: x

# 当前窗格拆分为独立窗口
ctrl + b: !

# 全屏显示
ctrl + b: z # 再来一次就缩小

# 大小调整
Ctrl+b Ctrl+&lt;arrow key&gt;：按箭头方向调整窗格大小
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>窗口快捷键</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 创建一个新窗口，状态栏会显示多个窗口的信息
Ctrl+b : c

# 切换到上一个窗口（按照状态栏上的顺序）。
Ctrl+b :p

# 切换到下个窗口
Ctrl+b :n

# 切换
Ctrl+b &lt;number&gt;：切换到指定编号的窗口，其中的&lt;number&gt;是状态栏上的窗口编号。

# 从列表中选择窗口
Ctrl+b :w

# 窗口重命名
Ctrl+b :,
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,10),b={href:"https://www.ruanyifeng.com/blog/2019/10/tmux.html",target:"_blank",rel:"noopener noreferrer"};function o(p,g){const s=t("ExternalLinkIcon");return l(),a("div",null,[u,d(" more "),m,n("p",null,[e("以上信息参考自博文: "),n("a",b,[e("Tmux 使用教程"),r(s)])])])}const _=i(v,[["render",o],["__file","210125-tmux-快捷键.html.vue"]]);export{_ as default};

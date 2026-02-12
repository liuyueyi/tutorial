import{_ as n,V as e,W as s,Y as a}from"./framework-b1bd8911.js";const i={},t=a(`<p>平常工作中，经常会出现的一个case就是查询端口号占用情况，一般在linux下使用<code>netstat</code>，在mac下则使用<code>lsof</code>；本篇则记录下Linux之netstat命令的使用</p><p>最常用的一个查看端口号占用命令：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">netstat</span> <span class="token parameter variable">-alnp</span> <span class="token operator">|</span> <span class="token function">grep</span> port
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_1-参数说明" tabindex="-1"><a class="header-anchor" href="#_1-参数说明" aria-hidden="true">#</a> 1. 参数说明</h3><p>主要是查看对应的参数相关</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>-a或--all：显示所有连线中的Socket；
-A&lt;网络类型&gt;或--&lt;网络类型&gt;：列出该网络类型连线中的相关地址；
-c或--continuous：持续列出网络状态；
-C或--cache：显示路由器配置的快取信息；
-e或--extend：显示网络其他相关信息；
-F或--fib：显示FIB；
-g或--groups：显示多重广播功能群组组员名单；
-h或--help：在线帮助；
-i或--interfaces：显示网络界面信息表单；
-l或--listening：显示监控中的服务器的Socket；
-M或--masquerade：显示伪装的网络连线；
-n或--numeric：直接使用ip地址，而不通过域名服务器；
-N或--netlink或--symbolic：显示网络硬件外围设备的符号连接名称；
-o或--timers：显示计时器；
-p或--programs：显示正在使用Socket的程序识别码和程序名称；
-r或--route：显示Routing Table；
-s或--statistice：显示网络工作信息统计表；
-t或--tcp：显示TCP传输协议的连线状况；
-u或--udp：显示UDP传输协议的连线状况；
-v或--verbose：显示指令执行过程；
-V或--version：显示版本信息；
-w或--raw：显示RAW传输协议的连线状况；
-x或--unix：此参数的效果和指定&quot;-A unix&quot;参数相同；
--ip或--inet：此参数的效果和指定&quot;-A inet&quot;参数相同。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-常用的几个组合" tabindex="-1"><a class="header-anchor" href="#_2-常用的几个组合" aria-hidden="true">#</a> 2. 常用的几个组合</h3><p>列出所有端口（包括监听和未监听）</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">netstat</span> <span class="token parameter variable">-a</span>
<span class="token function">netstat</span> <span class="token parameter variable">-at</span> <span class="token comment"># 显示所有tcp端口</span>
<span class="token function">netstat</span> <span class="token parameter variable">-au</span> <span class="token comment"># 显示所有udp端口</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>列出所有处于监听状态的 Sockets</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">netstat</span> <span class="token parameter variable">-l</span>        <span class="token comment">#只显示监听端口</span>
<span class="token function">netstat</span> <span class="token parameter variable">-lt</span>       <span class="token comment">#只列出所有监听 tcp 端口</span>
<span class="token function">netstat</span> <span class="token parameter variable">-lu</span>       <span class="token comment">#只列出所有监听 udp 端口</span>
<span class="token function">netstat</span> <span class="token parameter variable">-lx</span>       <span class="token comment">#只列出所有监听 UNIX 端口</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>显示pid和进程</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">netstat</span> <span class="token parameter variable">-pt</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,13),l=[t];function d(c,r){return e(),s("div",null,l)}const o=n(i,[["render",d],["__file","05.netstat常用命令学习小结.html.vue"]]);export{o as default};

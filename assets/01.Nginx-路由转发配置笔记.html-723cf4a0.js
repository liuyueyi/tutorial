import{_ as s,V as d,W as o,a1 as r,X as e,Y as n,Z as l,a0 as a,F as c}from"./framework-23f3cf9b.js";const t={},u=a("<blockquote><p>由于预算有限，只有一台服务器，想要玩的东西不少，所以这个台服务器上会提供多重服务，因此涉及到的nginx转发就必有重要了</p></blockquote><p>由nginx做请求代理，提供多种服务</p><ol><li>php搭建的网站</li><li>hexo创建的博客系统</li><li>spring-boot &amp; tomcat搭建的后台</li><li>静态网页</li></ol><p>本片配置笔记中，主要集中以下几个内容</p><ul><li>location的匹配规则是怎样的</li><li>如何实现路由转发（反向代理）</li><li>如何修改请求的路径（如请求的是 a/index.html 改为 a/public/index.html）</li></ul>",5),v=a(`<h2 id="i-location匹配规则" tabindex="-1"><a class="header-anchor" href="#i-location匹配规则" aria-hidden="true">#</a> I. location匹配规则</h2><h3 id="_1-语法" tabindex="-1"><a class="header-anchor" href="#_1-语法" aria-hidden="true">#</a> 1. 语法</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>location <span class="token punctuation">[</span><span class="token operator">=</span><span class="token operator">|</span>~<span class="token operator">|</span>~*<span class="token operator">|</span>^~<span class="token operator">|</span>@<span class="token punctuation">]</span> /uri/ <span class="token punctuation">{</span>
  <span class="token punctuation">..</span>.
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-说明" tabindex="-1"><a class="header-anchor" href="#_2-说明" aria-hidden="true">#</a> 2. 说明</h3><p>从上面的语法出发，可以了解到location可以区分为三个部分，接下来一个一个的研究一下</p><h4 id="a-partone" tabindex="-1"><a class="header-anchor" href="#a-partone" aria-hidden="true">#</a> a. PartOne: <code>[=|~|~*|^~|@]</code></h4><ul><li><code>=</code> : 表示精确匹配后面的url</li><li><code>~</code> : 表示正则匹配，但是区分大小写</li><li><code>~*</code> : 正则匹配，不区分大小写</li><li><code>^~</code> : 表示普通字符匹配，如果该选项匹配，只匹配该选项，不匹配别的选项，一般用来匹配目录</li><li><code>@</code> : &quot;@&quot; 定义一个命名的 location，使用在内部定向时，例如 error_page</li></ul><p>上面定义了几个不同的符号，表示不同的匹配规则，那么先后顺序呢？</p><ol><li>=前缀的指令严格匹配这个查询。如果找到，停止搜索。</li><li>所有剩下的常规字符串，最长的匹配。如果这个匹配使用^〜前缀，搜索停止。</li><li>正则表达式，在配置文件中定义的顺序。</li><li>如果第3条规则产生匹配的话，结果被使用。否则，使用第2条规则的结果。</li></ol><p>直接看这个可能不太好理解，写几个case实际测试一下</p><hr><p><strong>测试case1:</strong></p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>location = /world {
  return 600;
}

location = /hello {
  return 600;
}

location ~ /hellowo {
  return 602;
}

location ^~ /hello {
  return 601;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>- 请求 localhost/world 返回600
- 请求 localhost/world2 localhost/test/world 返回其他
- 请求 localhost/hello  返回600
- 请求 localhost/hello/123 返回601
- 请求 localhost/hellow 返回601
- 请求 localhost/hellowo 返回601
- 请求 localhost/test/hellowo  返回602
- 请求 localhost/test/hello 返回其他
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此可以知道</p><ul><li><code>=</code> 是精确完整匹配, 且优秀最高</li><li>正则匹配时，如果 <code>~</code> 和 <code>^~</code> 同时匹配规则，则 <code>^~</code> 优先</li><li><code>^~</code> 这个不会匹配请求url中后面的路径, 如上面的 <code>/test/hello</code> 没有匹配上</li><li><code>^~</code> 不支持正则，和<code>=</code>相比，范围更广， <code>hellowo</code> 是可以被<code>^~</code>匹配，但是 <code>=</code> 不会匹配</li><li><code>~</code> 路径中只要包含就可以匹配，如上面的 <code>/test/hellowo</code> 返回了602</li></ul><p><strong>测试case2:</strong></p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>location ~ /hello {
  return 602;
}

location ~ /helloworld {
  return 601;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>- 请求 localhost/world/helloworld 返回 602
- 请求 localhost/helloworld 返回 602
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>调整一下上面的顺序之后</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>location ~ /helloworld {
  return 601;
}

location ~ /hello {
  return 602;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>- 请求 localhost/helloworld 返回601
- 请求 localhost/world/helloworld 返回601
- 请求 localhost/helloWorld 返回602
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以同时正则匹配时</p><ul><li>放在前面的优先匹配</li><li>注意如果不区分大小写时，使用<code>~*</code></li><li>尽量将精确匹配的放在前面</li></ul><p><strong>测试case3:</strong></p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>location ^~ /hello/ {
  return 601;
}

location /hello/world {
  return 602;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这种场景中，存在一个没有符号的路由规则，那么实际的测试是怎样呢？</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>- http://localhost/hello/wor 返回601
- http://localhost/hello/world 返回602
- http://localhost/hello/world23 返回602
- http://localhost/hello/world/123 返回602
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面case可以看出</p><ul><li>没有符号时，全匹配是优先于^~的</li></ul><h4 id="b-parttwo-uri" tabindex="-1"><a class="header-anchor" href="#b-parttwo-uri" aria-hidden="true">#</a> b. PartTwo: [uri]</h4><p>这里主要填的就是需要匹配的path路径，根据前面的符号，这里可以填写精确的path路径，也可以填正则表达式，下面则主要针对正则进行说明</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>. ： 匹配除换行符以外的任意字符
? ： 重复0次或1次
+ ： 重复1次或更多次
* ： 重复0次或更多次
\\d ：匹配数字
^ ： 匹配字符串的开始
$ ： 匹配字符串的介绍
{n} ： 重复n次
{n,} ： 重复n次或更多次
[c] ： 匹配单个字符c
[a-z] ： 匹配a-z小写字母的任意一个
小括号()之间匹配的内容，可以在后面通过$1来引用，$2表示的是前面第二个()里的内容。正则里面容易让人困惑的是\\转义特殊字符。


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="c-partthree" tabindex="-1"><a class="header-anchor" href="#c-partthree" aria-hidden="true">#</a> c. PartThree: {}</h4><p>匹配完毕之后内部定义一些列的处理动作，这个涉及到的点比较多，这里不详细展开，后面有空单独捞出</p><hr><h2 id="ii-路由转发" tabindex="-1"><a class="header-anchor" href="#ii-路由转发" aria-hidden="true">#</a> II. 路由转发</h2><blockquote><p>请求path匹配只是第一步，匹配完了之后，如何将请求转发给其他的web服务呢？</p></blockquote><h3 id="_0-反向代理" tabindex="-1"><a class="header-anchor" href="#_0-反向代理" aria-hidden="true">#</a> 0. 反向代理</h3><p>通常可见的一种使用姿势就是使用nginx，代理请求，转发到内部的tomact服务上</p><p>主要是通过 proxy_pass 这个来实现</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>location ^~ /webs <span class="token punctuation">{</span>
  proxy_pass http://127.0.0.1:8080/webs<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将所有以 webs开头的请求，转发给8080端口的tomcat服务上</p><p>上面是直接写死转发到一个ip上，如果是多个机器提供服务呢？可以这么玩</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment">## 下面放在http的括号内，作为第一层</span>
upstream test.online <span class="token punctuation">{</span>
    server <span class="token number">120.11</span>.11.11:8080 <span class="token assign-left variable">weight</span><span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">;</span>
    server <span class="token number">120.11</span>.11.12:8080 <span class="token assign-left variable">weight</span><span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

location ^~ /webs <span class="token punctuation">{</span>
      proxy_pass http://test.online<span class="token punctuation">;</span>
      proxy_redirect default<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-rewrite命令" tabindex="-1"><a class="header-anchor" href="#_1-rewrite命令" aria-hidden="true">#</a> 1. Rewrite命令</h3><p>rewrite功能就是，使用nginx提供的全局变量或自己设置的变量，结合正则表达式和标志位实现url重写以及重定向。</p><p>rewrite只能放在server{},location{},if{}中，</p><p>并且只能对域名后边的除去传递的参数外的字符串起作用, 如</p>`,49),p={href:"http://zbang.online/a/we/index.php?id=1&u=str",target:"_blank",rel:"noopener noreferrer"},h=a(`<p><strong>语法rewrite regex replacement [flag];</strong></p><p>一个case，通过rewrite实现对url的重写，将下面的</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>location ^~ /hexo {
  root &#39;/Users/yihui/GitHub/&#39;;
}

location ~ /hello {
  rewrite ^(/hello).*$ /hexo/public/index.html last;
  return 603;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将hello开头的，全部转发到<code>/hexo/public/index.html</code></p><h2 id="iii-小结" tabindex="-1"><a class="header-anchor" href="#iii-小结" aria-hidden="true">#</a> III. 小结</h2><h3 id="_1-demo" tabindex="-1"><a class="header-anchor" href="#_1-demo" aria-hidden="true">#</a> 1. demo</h3><p>将所有以blog开头的请求，全部转发到某个地方</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>location ^~ /blog {
  root &#39;/var/www/html/blog&#39;;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-路径匹配规则" tabindex="-1"><a class="header-anchor" href="#_2-路径匹配规则" aria-hidden="true">#</a> 2. 路径匹配规则</h3><ul><li><code>=</code> : 表示精确匹配后面的url</li><li><code>~</code> : 表示正则匹配，但是区分大小写</li><li><code>~*</code> : 正则匹配，不区分大小写</li><li><code>^~</code> : 表示普通字符匹配，如果该选项匹配，只匹配该选项，不匹配别的选项，一般用来匹配目录</li><li><code>@</code> : &quot;@&quot; 定义一个命名的 location，使用在内部定向时，例如 error_page</li></ul><p>匹配顺序如下：</p><ol><li>=前缀的指令严格匹配这个查询。如果找到，停止搜索。</li><li>所有剩下的常规字符串，最长的匹配。如果这个匹配使用^〜前缀，搜索停止。</li><li>正则表达式，在配置文件中定义的顺序。</li><li>如果第3条规则产生匹配的话，结果被使用。否则，使用第2条规则的结果。</li></ol><h3 id="_3-路由转发" tabindex="-1"><a class="header-anchor" href="#_3-路由转发" aria-hidden="true">#</a> 3. 路由转发</h3><ul><li>通过 proxy_pass 可以实现反向代理</li><li>通过 rewrite 可以实现路由转发</li></ul><h2 id="iv-参考" tabindex="-1"><a class="header-anchor" href="#iv-参考" aria-hidden="true">#</a> IV. 参考</h2>`,15),b={href:"https://www.cnblogs.com/coder-yoyo/p/6346595.html",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.cnblogs.com/netsa/p/6383094.html",target:"_blank",rel:"noopener noreferrer"};function g(x,_){const i=c("ExternalLinkIcon");return d(),o("div",null,[u,r(" more "),v,e("p",null,[e("a",p,[n("http://zbang.online/a/we/index.php?id=1&u=str"),l(i)]),n(" 只对/a/we/index.php重写。")]),h,e("ul",null,[e("li",null,[e("a",b,[n("location匹配顺序"),l(i)])]),e("li",null,[e("a",m,[n("nginx 常见正则匹配符号表示"),l(i)])])])])}const f=s(t,[["render",g],["__file","01.Nginx-路由转发配置笔记.html.vue"]]);export{f as default};

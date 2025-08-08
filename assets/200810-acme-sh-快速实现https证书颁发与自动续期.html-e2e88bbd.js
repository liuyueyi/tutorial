import{_ as l,V as r,W as t,Y as e,Z as s,$ as a,X as d,a1 as i,F as c}from"./framework-094145d2.js";const o={},p=e("p",null,[s("借助"),e("code",null,"acem.sh"),s("来迅速实现let's encrypt的泛域名ssl证书颁发与续期，基本上五分钟就可以解决战斗")],-1),v={href:"https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E",target:"_blank",rel:"noopener noreferrer"},u=i(`<h2 id="i-安装步骤" tabindex="-1"><a class="header-anchor" href="#i-安装步骤" aria-hidden="true">#</a> I. 安装步骤</h2><h3 id="_1-登录服务器" tabindex="-1"><a class="header-anchor" href="#_1-登录服务器" aria-hidden="true">#</a> 1. 登录服务器</h3><p>登录到某台linux服务器，我这里以Centos举例说明</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">ssh</span> xxx@xxx

<span class="token comment"># 切换root账号</span>
<span class="token function">su</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-安装acme-sh" tabindex="-1"><a class="header-anchor" href="#_2-安装acme-sh" aria-hidden="true">#</a> 2. 安装<code>acme.sh</code></h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>yum <span class="token function">install</span> socat <span class="token parameter variable">-y</span>
<span class="token function">curl</span>  https://get.acme.sh <span class="token operator">|</span> <span class="token function">sh</span>
<span class="token builtin class-name">cd</span> ~/.acme.sh/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-申请密钥" tabindex="-1"><a class="header-anchor" href="#_3-申请密钥" aria-hidden="true">#</a> 3. 申请密钥</h3><p>到域名购买服务商，申请api key，用于后期的txt记录验证</p><p><strong>DNSPod</strong></p><p>密钥申请完毕之后，如下操作导入命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># DNSPod</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">DP_Id</span><span class="token operator">=</span><span class="token string">&quot;id&quot;</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">DP_Key</span><span class="token operator">=</span><span class="token string">&quot;key&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>阿里云</strong></p>`,12),m={href:"https://help.aliyun.com/knowledge_detail/38738.html",target:"_blank",rel:"noopener noreferrer"},h=i(`<p>申请完毕之后，如下操作</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">export</span> <span class="token assign-left variable">Ali_Key</span><span class="token operator">=</span><span class="token string">&quot;key&quot;</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">Ali_Secret</span><span class="token operator">=</span><span class="token string">&quot;secret&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>godaddy</strong></p>`,3),b={href:"https://developer.godaddy.com/getstarted",target:"_blank",rel:"noopener noreferrer"},g=i(`<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">export</span> <span class="token assign-left variable">GD_Key</span><span class="token operator">=</span><span class="token string">&quot;key&quot;</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">GD_Secret</span><span class="token operator">=</span><span class="token string">&quot;secret&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>其他</strong></p><p>至于其他平台，应该如何导入API key，可以参考下面的文档，这里不一一说明了</p>`,3),_={href:"https://github.com/acmesh-official/acme.sh/wiki/dnsapi",target:"_blank",rel:"noopener noreferrer"},k=i(`<h3 id="_4-证书生成" tabindex="-1"><a class="header-anchor" href="#_4-证书生成" aria-hidden="true">#</a> 4. 证书生成</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 请注意，--dns后面的参数，一般来讲后缀就是上面的导入key的前缀</span>
<span class="token comment"># 如果不确定，到上面的github连接中去找</span>

<span class="token comment"># 针对 hhui.top 域名生成通配的证书</span>
<span class="token comment"># 在我的测试中，如果只指定  -d *.hhui.top ，那么生成的证书没有包含 hhui.top 这个主域名，所以当我希望这个证书都能包含时，第一个填写主域名</span>
./acme.sh <span class="token parameter variable">--issue</span> <span class="token parameter variable">--dns</span> dns_ali <span class="token parameter variable">-d</span> <span class="token string">&#39;hhui.top&#39;</span> <span class="token parameter variable">-d</span> <span class="token string">&#39;*.hhui.top&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>证书生成之后，会在<code>.acme.sh</code>目录下，新生成一个 <code>*.hhui.top</code>(就是我们上面指定的通配域名) 文件夹，证书在里面</p><h3 id="_5-安装证书" tabindex="-1"><a class="header-anchor" href="#_5-安装证书" aria-hidden="true">#</a> 5. 安装证书</h3><p>接下来将我们的证书安装到nginx（当然也可以是tomcat），下面的脚本除了安装之外，也添加了一个自动更新的任务（一般来说，60 天以后会自动更新，并会强制重启nginx使新的证书生效，可以通过 <code>crontab -e</code>看到对应的定时任务）</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>./acme.sh  <span class="token parameter variable">--installcert</span> <span class="token parameter variable">-d</span> <span class="token string">&#39;hhui.top&#39;</span> <span class="token parameter variable">-d</span> <span class="token string">&#39;*.hhui.top&#39;</span> --key-file /etc/nginx/ssl/key.pem  --fullchain-file /etc/nginx/ssl/cert.pem <span class="token parameter variable">--reloadcmd</span>     <span class="token string">&quot;service nginx force-reload&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_6-nginx配置" tabindex="-1"><a class="header-anchor" href="#_6-nginx配置" aria-hidden="true">#</a> 6. nginx配置</h3><p>然后就是配置nginx，支持https</p><p>下面是一个基础的nginx配置实例</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>server {
    server_name blog.hhui.top;
    root /home/yihui/xxx;
    index index.html;

    gzip on;
    gzip_buffers 32 4K;
    gzip_comp_level 6;
    gzip_min_length 100;
    gzip_types application/javascript text/css text/xml;
    gzip_disable &quot;MSIE [1-6]\\.&quot;; #配置禁用gzip条件，支持正则。此处表示ie6及以下不启用gzip（因为ie低版本不支持）
    gzip_vary on;

    location ~* ^.+\\.(ico|gif|jpg|jpeg|png)$ {
        access_log   off;
        expires      1d;
    }

    location ~* ^.+\\.(css|js|txt|xml|swf|wav|pptx)$ {
        access_log   off;
        expires      10m;
    }

    location / {
        try_files $uri $uri/ @router;
    }

    location @router {
        rewrite ^.*$ /index.html last;
    }

    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 1.1.1.1 valid=60s;
    resolver_timeout 2s;
}

server {
    if ($host = blog.hhui.top) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name blog.hhui.top;
    return 404;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-手动续期" tabindex="-1"><a class="header-anchor" href="#_7-手动续期" aria-hidden="true">#</a> 7. 手动续期</h3><p>手动续期，强制执行，命令如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>./acme.sh <span class="token parameter variable">--issue</span> <span class="token parameter variable">--dns</span> dns_ali <span class="token parameter variable">-d</span> <span class="token string">&#39;hhui.top&#39;</span> <span class="token parameter variable">-d</span> <span class="token string">&#39;*.hhui.top&#39;</span> <span class="token parameter variable">--force</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>执行完毕之后，会输出几个证书，我们需要的是 <code>fullchain.cer</code> 与 <code>hhui.top.key</code></p><p>安装证书并重启</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">cp</span> ~/.acme.sh/hhui.top/hhui.top.key /etc/nginx/ssl/key.pem
<span class="token function">cp</span> ~/.acme.sh/hhui.top/fullchain.cer /etc/nginx/ssl/cert.pem

nginx <span class="token parameter variable">-s</span> reload
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后浏览器访问目标网站，查看证书判断是否ok</p>`,17);function x(f,y){const n=c("ExternalLinkIcon");return r(),t("div",null,[p,e("blockquote",null,[e("p",null,[s("本文主要内容来自acme.sh的官方wiki，一切以官方说明为准: "),e("a",v,[s("acme wiki"),a(n)])])]),d(" more "),u,e("blockquote",null,[e("p",null,[s("ALY_KEY 和 ALY_TOKEN：阿里云 "),e("a",m,[s("API key 和 Secrec 官方申请文档"),a(n)]),s("。")])]),h,e("ul",null,[e("li",null,[s("GODADDY_KEY 和 GODADDY_TOKEN：GoDaddy "),e("a",b,[s("API 密钥官方申请文档"),a(n)])])]),g,e("ul",null,[e("li",null,[e("a",_,[s("https://github.com/acmesh-official/acme.sh/wiki/dnsapi"),a(n)])])]),k])}const D=l(o,[["render",x],["__file","200810-acme-sh-快速实现https证书颁发与自动续期.html.vue"]]);export{D as default};

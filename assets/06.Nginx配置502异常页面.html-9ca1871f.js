import{_ as e,V as n,W as i,a1 as r,X as s,a0 as d}from"./framework-23f3cf9b.js";const a={},l=s("p",null,"使用nginx做SpringBoot应用的反向代理，然后每次重启就会出现默认的502错误页面，下面记录一下将设置专属的502异常页面的配置方式",-1),t=d(`<p>在nginx.conf配置文件中，添加502异常页面</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>server {
    error_page 502 /index.html;
    location = /index.html {
         root /home/yihui/workspace/html/error; # 这里使用你自己的错误页面地址来代替
    }

    location / {
        proxy_next_upstream error timeout http_500 http_502 http_504;
        proxy_intercept_errors on; # 这个比较核心，需要开启
        proxy_set_header X-real-ip  $remote_addr;
        proxy_pass http://127.0.0.1:8080;
        proxy_redirect default;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2);function o(c,_){return n(),i("div",null,[l,r(" more "),t])}const m=e(a,[["render",o],["__file","06.Nginx配置502异常页面.html.vue"]]);export{m as default};

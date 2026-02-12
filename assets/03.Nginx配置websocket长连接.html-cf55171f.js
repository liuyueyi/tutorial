import{_ as e,V as n,W as o,X as s,Z as r,Y as d}from"./framework-b1bd8911.js";const a={},i=r("p",null,"websocket使用wss连接时，同样也是需要证书的；当我们使用nginx做反向代理时，需要做一个简单的配置",-1),t=d(`<blockquote><p>WebSockets应用程序会在客户端和服务器之间建立一个长连接，使得开发实时应用很容易。HTTP的Upgrade协议头机制用于将连接从HTTP连接升级到WebSocket连接，Upgrade机制使用了Upgrade协议头和Connection协议头。反向代理服务器在支持WebSocket协议方面面临着一些挑战。挑战之一是WebSocket是一个逐段转发（hop-by-hop）协议，因此当代理服务器拦截到来自客户端的Upgrade请求时，代理服务器需要将自己的Upgrade请求发送给后端服务器，包括适合的请求头。而且，由于WebSocket连接是长连接，与传统的HTTP端连接截然不同，故反向代理服务器还需要允许这些连接处于打开（Open）状态，而不能因为其空闲就关闭了连接。 Nginx通过在客户端和后端服务器之间建立隧道来支持WebSockets通信。为了让Nginx可以将来自客户端的Upgrade请求发送到后端服务器，Upgrade和Connection的头信息必须被显式的设置</p></blockquote><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code># 支持wss websocket连接
location /gpt {
    proxy_set_header  Host $host;
    proxy_set_header  X-Real-IP  $remote_addr;
    proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header  X-Forwarded-Proto   $scheme;

    proxy_pass http://127.0.0.1:8080/gpt;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade; # 重要
    proxy_set_header Connection &quot;upgrade&quot;; # 重要
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2);function c(l,_){return n(),o("div",null,[i,s(" more "),t])}const v=e(a,[["render",c],["__file","03.Nginx配置websocket长连接.html.vue"]]);export{v as default};

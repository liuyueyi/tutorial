import{_,V as c,W as s,Z as e,$ as n,a0 as r,a1 as a,Y as h,F as o}from"./framework-b1bd8911.js";const i={},l=h('<h1 id="技术专栏" tabindex="-1"><a class="header-anchor" href="#技术专栏" aria-hidden="true">#</a> 技术专栏</h1><h2 id="❤️-管理" tabindex="-1"><a class="header-anchor" href="#❤️-管理" aria-hidden="true">#</a> ❤️ 管理</h2><p><a href="tech/manager">一灰灰的技术管理</a></p><h2 id="📝-架构" tabindex="-1"><a class="header-anchor" href="#📝-架构" aria-hidden="true">#</a> 📝 架构</h2>',4),p=e("h2",{id:"🏪-项目",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#🏪-项目","aria-hidden":"true"},"#"),a(" 🏪 项目")],-1),x=e("h2",{id:"🤖-ai",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#🤖-ai","aria-hidden":"true"},"#"),a(" 🤖 AI")],-1),f={href:"http://127.0.0.1:8077",target:"_blank",rel:"noopener noreferrer"},u=e("pre",null,[e("code",null,`    # 明确 Accept，不透传浏览器的
    proxy_set_header Accept "text/event-stream";
    proxy_set_header Cache-Control "no-cache";

    # 长连接支持
    proxy_set_header Connection keep-alive;

    # 保留必要的头
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # 禁用缓冲
    proxy_buffering off;
    proxy_cache off;
    proxy_request_buffering off;

    # 超时设置（SSE 可能几小时不断开）
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
    proxy_connect_timeout 86400s;
}	
`)],-1);function m(y,k){const t=o("RouterLink"),d=o("ExternalLinkIcon");return c(),s("div",null,[l,e("p",null,[n(t,{to:"/column/arch/"},{default:r(()=>[a("分布式专栏")]),_:1})]),p,e("p",null,[n(t,{to:"/column/app/"},{default:r(()=>[a("实战项目 & 配套教程")]),_:1})]),x,e("p",null,[n(t,{to:"/column/ai/"},{default:r(()=>[a("AI相关")]),_:1})]),e("p",null,[a("location /redpacket/api/chat/ { proxy_pass "),e("a",f,[a("http://127.0.0.1:8077"),n(d)]),a("; proxy_http_version 1.1;")]),u])}const v=_(i,[["render",m],["__file","index.html.vue"]]);export{v as default};

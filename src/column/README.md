---
icon: diagram
title: 专栏
index: false
---

# 技术专栏

## ❤️ 管理

[一灰灰的技术管理](tech/manager)

## 📝 架构

[分布式专栏](arch/)


## 🏪 项目

[实战项目 & 配套教程](app/)

## 🤖 AI

[AI相关](ai/)


  location /redpacket/api/chat/ {
	    proxy_pass http://127.0.0.1:8077;
	    proxy_http_version 1.1;

	    # 明确 Accept，不透传浏览器的
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
import{_ as i,V as n,W as e,a0 as s}from"./framework-23f3cf9b.js";const a={},l=s(`<p>ngxin 开启gzip压缩，减少数据包大小，默认场景下nginx没有开启gzip压缩，需要主动指定</p><p>关键配置修改如下（进入配置文件 nginx.conf)</p><div class="language-conf line-numbers-mode" data-ext="conf"><pre class="language-conf"><code>http {
	# ...

	# 开启gzip压缩
	gzip  on;
	# 表示当请求的资源超过1k时，才开启压缩
	gzip_min_length 1k;
	# 设置压缩所需要的缓冲区大小
	gzip_buffers 4 16k;
	# 针对的http版本
	gzip_http_version 1.0;
	# 压缩级别，级别越底压缩速度越快文件压缩比越小，反之速度越慢文件压缩比越大
	gzip_comp_level 2;
	# 支持压缩的资源类型，对于前后盾分离的项目而言，注意下json的压缩支持
	gzip_types text/plain application/x-javascript text/css application/xml application/json text/javascript application/x-httpd-php image/jpeg image/gif image/png;
	# 是否在http header中添加Vary: Accept-Encoding，建议开启
	gzip_vary off;
	# 禁用IE 6 gzip
	gzip_disable &quot;MSIE [1-6]\\.&quot;;
	
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>修改完毕之后重启nginx即可</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>nginx <span class="token parameter variable">-s</span> reload
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,5),d=[l];function t(c,v){return n(),e("div",null,d)}const p=i(a,[["render",t],["__file","02.nginx-开启gzip压缩配置.html.vue"]]);export{p as default};

import{_ as n,V as e,W as i,a1 as s,X as a,a0 as l}from"./framework-23f3cf9b.js";const d={},u=a("p",null,"influxdb安装完毕之后，一般来讲，有些配置有必要改一下的，比如默认的端口号，默认的数据存储位置，本篇将介绍下常用配置的修改姿势",-1),t=l(`<h2 id="i-配置" tabindex="-1"><a class="header-anchor" href="#i-配置" aria-hidden="true">#</a> I. 配置</h2><p>系统环境为centos，influxdb的版本为1.6</p><h3 id="_1-配置文件" tabindex="-1"><a class="header-anchor" href="#_1-配置文件" aria-hidden="true">#</a> 1. 配置文件</h3><p>默认配置文件安装目录为: <code>/etc/influxdb/influxdb.conf</code></p><p>默认配置查看</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>infuxd config
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>输出结果如</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>Merging with configuration at: /etc/influxdb/influxdb.conf
reporting-disabled = false
bind-address = &quot;127.0.0.1:8088&quot;

[meta]
  dir = &quot;/var/lib/influxdb/meta&quot;
  retention-autocreate = true
  logging-enabled = true

[data]
  dir = &quot;/var/lib/influxdb/data&quot;
  index-version = &quot;inmem&quot;
  wal-dir = &quot;/var/lib/influxdb/wal&quot;
  wal-fsync-delay = &quot;0s&quot;
  validate-keys = false
  query-log-enabled = true
  cache-max-memory-size = 1073741824
  cache-snapshot-memory-size = 26214400
  cache-snapshot-write-cold-duration = &quot;10m0s&quot;
  compact-full-write-cold-duration = &quot;4h0m0s&quot;
  compact-throughput = 50331648
  compact-throughput-burst = 50331648
  max-series-per-database = 1000000
  max-values-per-tag = 100000
  max-concurrent-compactions = 0
  max-index-log-file-size = 1048576
  series-id-set-cache-size = 100
  trace-logging-enabled = false
  tsm-use-madv-willneed = false

[coordinator]
  write-timeout = &quot;10s&quot;
  max-concurrent-queries = 0
  query-timeout = &quot;0s&quot;
  log-queries-after = &quot;0s&quot;
  max-select-point = 0
  max-select-series = 0
  max-select-buckets = 0

[retention]
  enabled = true
  check-interval = &quot;30m0s&quot;

[shard-precreation]
  enabled = true
  check-interval = &quot;10m0s&quot;
  advance-period = &quot;30m0s&quot;

[monitor]
  store-enabled = true
  store-database = &quot;_internal&quot;
  store-interval = &quot;10s&quot;

[subscriber]
  enabled = true
  http-timeout = &quot;30s&quot;
  insecure-skip-verify = false
  ca-certs = &quot;&quot;
  write-concurrency = 40
  write-buffer-size = 1000

[http]
  enabled = true
  bind-address = &quot;:8086&quot;
  auth-enabled = true
  log-enabled = true
  suppress-write-log = false
  write-tracing = false
  flux-enabled = false
  flux-log-enabled = false
  pprof-enabled = true
  debug-pprof-enabled = false
  https-enabled = false
  https-certificate = &quot;/etc/ssl/influxdb.pem&quot;
  https-private-key = &quot;&quot;
  max-row-limit = 0
  max-connection-limit = 0
  shared-secret = &quot;&quot;
  realm = &quot;InfluxDB&quot;
  unix-socket-enabled = false
  unix-socket-permissions = &quot;0777&quot;
  bind-socket = &quot;/var/run/influxdb.sock&quot;
  max-body-size = 25000000
  access-log-path = &quot;&quot;
  max-concurrent-write-limit = 0
  max-enqueued-write-limit = 0
  enqueued-write-timeout = 30000000000

[logging]
  format = &quot;auto&quot;
  level = &quot;info&quot;
  suppress-logo = false

[[graphite]]
  enabled = false
  bind-address = &quot;:2003&quot;
  database = &quot;graphite&quot;
  retention-policy = &quot;&quot;
  protocol = &quot;tcp&quot;
  batch-size = 5000
  batch-pending = 10
  batch-timeout = &quot;1s&quot;
  consistency-level = &quot;one&quot;
  separator = &quot;.&quot;
  udp-read-buffer = 0

[[collectd]]
  enabled = false
  bind-address = &quot;:25826&quot;
  database = &quot;collectd&quot;
  retention-policy = &quot;&quot;
  batch-size = 5000
  batch-pending = 10
  batch-timeout = &quot;10s&quot;
  read-buffer = 0
  typesdb = &quot;/usr/share/collectd/types.db&quot;
  security-level = &quot;none&quot;
  auth-file = &quot;/etc/collectd/auth_file&quot;
  parse-multivalue-plugin = &quot;split&quot;

[[opentsdb]]
  enabled = false
  bind-address = &quot;:4242&quot;
  database = &quot;opentsdb&quot;
  retention-policy = &quot;&quot;
  consistency-level = &quot;one&quot;
  tls-enabled = false
  certificate = &quot;/etc/ssl/influxdb.pem&quot;
  batch-size = 1000
  batch-pending = 5
  batch-timeout = &quot;1s&quot;
  log-point-errors = true

[[udp]]
  enabled = false
  bind-address = &quot;:8089&quot;
  database = &quot;udp&quot;
  retention-policy = &quot;&quot;
  batch-size = 5000
  batch-pending = 10
  read-buffer = 0
  batch-timeout = &quot;1s&quot;
  precision = &quot;&quot;

[continuous_queries]
  log-enabled = true
  enabled = true
  query-stats-enabled = false
  run-interval = &quot;1s&quot;

[tls]
  min-version = &quot;&quot;
  max-version = &quot;&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-数据存储修改" tabindex="-1"><a class="header-anchor" href="#_2-数据存储修改" aria-hidden="true">#</a> 2. 数据存储修改</h3><p>从上面的配置中可以知道，默认的数据存储为<code>/var/lib/influxdb/data</code>， <code>/var/lib/influxdb/wal</code>, <code>/var/lib/influxdb/meta</code></p><p>将数据保存在我们挂载的硬盘 <code>/influx</code></p><p><strong>第一步，修改配置文件</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> /etc/influxdb/influxdb.conf

<span class="token comment">## 修改配置</span>
<span class="token punctuation">[</span>meta<span class="token punctuation">]</span>
  <span class="token function">dir</span> <span class="token operator">=</span> <span class="token string">&#39;/influx/meta&#39;</span>
  
<span class="token punctuation">[</span>data<span class="token punctuation">]</span>
  <span class="token function">dir</span> <span class="token operator">=</span> <span class="token string">&#39;/influx/data&#39;</span>
  war-dir <span class="token operator">=</span> <span class="token string">&#39;/influx/wal&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>第二步，修改用户组</strong></p><p>重新制定存储目录之后，需要修改文件夹的owner和分组，否则influxdb将无法正常启动</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">chown</span> <span class="token parameter variable">-R</span> influxdb:influxdb /influx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>第三步，重启</strong></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">service</span> influxdb restart
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_3-端口修改" tabindex="-1"><a class="header-anchor" href="#_3-端口修改" aria-hidden="true">#</a> 3. 端口修改</h3><p>可以修改默认的端口号，首先进入配置文件</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token punctuation">[</span><span class="token punctuation">[</span>udp<span class="token punctuation">]</span><span class="token punctuation">]</span>
  bind-address <span class="token operator">=</span> <span class="token string">&quot;:18089&quot;</span>

<span class="token punctuation">[</span><span class="token punctuation">[</span>http<span class="token punctuation">]</span><span class="token punctuation">]</span>
  bind-address <span class="token operator">=</span> <span class="token string">&quot;:18086&quot;</span>
  <span class="token comment"># 开启下权限验证，相关配置可以参考博文: https://blog.hhui.top/hexblog/2019/05/05/190505-InfluxDB之权限管理/ </span>
  auth-enabled <span class="token operator">=</span> <span class="token boolean">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,21);function r(v,c){return e(),i("div",null,[u,s(" more "),t])}const b=n(d,[["render",r],["__file","05.190506-InfluxDB之配置修改.html.vue"]]);export{b as default};

import{_ as a,V as i,W as l,X as t,Z as n,a1 as s,$ as o,Y as r,F as p}from"./framework-b1bd8911.js";const d={},c=n("p",null,[s("在influxdb中没有专门的修改数据的"),n("code",null,"update"),s("语句，对于influxdb而言，如果想修改数据，还是得使用我们前面的说到的"),n("code",null,"insert"),s("来实现，那么怎么判断一条insert语句是插入还是修改呢?")],-1),u=n("h3",{id:"_1-insert数据修改",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#_1-insert数据修改","aria-hidden":"true"},"#"),s(" 1. insert数据修改")],-1),m={href:"https://blog.hhui.top/hexblog/2019/07/26/190726-Influx-Sql%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%BA%94%EF%BC%9Ainsert-%E6%B7%BB%E5%8A%A0%E6%95%B0%E6%8D%AE/",target:"_blank",rel:"noopener noreferrer"},b=r(`<p>这里只是贴一下基本语法</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>insert into <span class="token operator">&lt;</span>retention policy<span class="token operator">&gt;</span> measurement,tagKey<span class="token operator">=</span>tagValue <span class="token assign-left variable">fieldKey</span><span class="token operator">=</span>fieldValue timestamp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果我们希望修改一条数据，比如修改既有的field，或者增加/删除field时，我们需要指定具体的时间戳和tag</p><p>下面是一个简单的修改演示</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test where <span class="token assign-left variable">time</span><span class="token operator">=</span><span class="token number">1564149327925320596</span>
name: add_test
<span class="token function">time</span>                age boy email            name  phone user_id
----                --- --- -----            ----  ----- -------
<span class="token number">1564149327925320596</span>         bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">20</span>


<span class="token operator">&gt;</span> show tag keys from add_test
name: add_test
tagKey
------
name
phone


<span class="token operator">&gt;</span> insert add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">user_id</span><span class="token operator">=</span><span class="token number">20</span>,email<span class="token operator">=</span><span class="token string">&quot;bangzewu@126.com&quot;</span>,boy<span class="token operator">=</span>true,age<span class="token operator">=</span>18i <span class="token number">1564149327925320596</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test where <span class="token assign-left variable">time</span><span class="token operator">=</span><span class="token number">1564149327925320596</span>
name: add_test
<span class="token function">time</span>                age boy  email            name  phone user_id
----                --- ---  -----            ----  ----- -------
<span class="token number">1564149327925320596</span> <span class="token number">18</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">20</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上面的case中，我们执行的的insert语句来修改某条已有的记录时，有几个参数必须存在</p><ul><li>time: 指定为要要改记录的时间戳</li><li>tag: 所有的tag都必须和要修改的数据一致 <code>name=YiHui,phone=110</code></li></ul><p>然后field的内容，会增量修改之前的数据,如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> insert add_test,name<span class="token operator">=</span>YiHui,phone<span class="token operator">=</span><span class="token number">110</span> <span class="token assign-left variable">boy</span><span class="token operator">=</span>true,age<span class="token operator">=</span>19i <span class="token number">1564149327925320596</span>


<span class="token operator">&gt;</span> <span class="token keyword">select</span> * from add_test where <span class="token assign-left variable">time</span><span class="token operator">=</span><span class="token number">1564149327925320596</span>
name: add_test
<span class="token function">time</span>                age boy  email            name  phone user_id
----                --- ---  -----            ----  ----- -------
<span class="token number">1564149327925320596</span> <span class="token number">19</span>  <span class="token boolean">true</span> bangzewu@126.com YiHui <span class="token number">110</span>   <span class="token number">20</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过上面的insert，可以动态新增field，但是如果我希望删除field怎么办？</p><ul><li>目前提供的<code>influxdb sql</code>中没有找到删除field的方式，一个可供选择的方式就是把原来的记录删掉；然后再重新插入一条</li></ul><p>如果需要修改tag怎么办？</p><ul><li>前面的case已经表明，修改记录是根据 time + tag values来唯一定位记录，然后执行删除的，如果你需要修改一个tag，对<code>insert</code>语句而言就是新增了一个point；这个时候可以考虑由自己来删除旧的数据</li></ul>`,13);function v(k,g){const e=p("ExternalLinkIcon");return i(),l("div",null,[c,t(" more "),u,n("p",null,[s("关于insert的使用语法，可以参考上一篇博文："),n("a",m,[s("190726-Influx Sql系列教程五：insert 添加数据 "),o(e)])]),b])}const h=a(d,[["render",v],["__file","07.insert-修改数据.html.vue"]]);export{h as default};

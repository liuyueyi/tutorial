import{_ as e,V as t,W as l,X as n,Y as s,Z as i,a0 as p,F as c}from"./framework-23f3cf9b.js";const o="/tutorial/imgs/column/ai/7-1.jpg",u="/tutorial/imgs/column/ai/7-2.jpg",d="/tutorial/imgs/column/ai/7-3.webp",v={},r=n("p",null,"一恍惚25年就已经过了一半，上半年借助AI开发工具也做了不少小玩具；在下半年，给自己订一个小目标，做一个完整功能更完整的产品，计划做三端（PC、小程序、APP），并且包含独立的后端服务能力。",-1),b=n("p",null,"实际上我个人也没有特别想做的东西，正好小朋友最近开始学习识字、背诗，那就做一个中华文化知识相关的产品得了",-1),k=n("h2",{id:"一、-前置准备",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#一、-前置准备","aria-hidden":"true"},"#"),s(" 一、 前置准备")],-1),m=n("p",null,"有想法之后，第一件事情，当然是全网搜一下，有没有类似的可以学习致敬（抄袭）的竞品",-1),_={href:"https://www.zhihu.com/question/21528388",target:"_blank",rel:"noopener noreferrer"},h=n("p",null,"推荐的产品还挺多，app/网站/小程序均有，下面是摘抄目录",-1),g=n("figure",null,[n("img",{src:o,alt:"",tabindex:"0",loading:"lazy"}),n("figcaption")],-1),f=n("p",null,"产品有一些可以学习的对象；接下来再看看开源社区上是否有可以拿来当“基座”的原型😊",-1),A=n("p",null,"比如一些数据源：",-1),x={href:"https://github.com/caoxingyu/chinese-gushiwen",target:"_blank",rel:"noopener noreferrer"},w={href:"https://github.com/chanind/hanzi-writer-data",target:"_blank",rel:"noopener noreferrer"},P=n("p",null,"一些可用的产品：",-1),y={href:"https://github.com/hefengbao/jingmo/tree/main",target:"_blank",rel:"noopener noreferrer"},I={href:"https://github.com/a2636340559/YaFeng",target:"_blank",rel:"noopener noreferrer"},F={href:"https://github.com/SongC1229/song",target:"_blank",rel:"noopener noreferrer"},R=p(`<h2 id="二、-原型设计" tabindex="-1"><a class="header-anchor" href="#二、-原型设计" aria-hidden="true">#</a> 二、 原型设计</h2><p>基于上面的过程我们大概知道自己想做些啥，但是具体的产品设计这块由于并不专业不知道该怎么做，既然我不会，那就借助一下AI来帮我整一下</p><p>直接大力出奇迹，对于小白完全不考虑什么提示词</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>我现在准备开发一个中华相关知识的app，其中包含下面这些内容，请帮我设计一份产品原型

经典诗文 955 篇；
诗文 140 万篇,包含诗、词、辞赋、残句、联、文等；
诗文名句 10000 句；
人物 126830 个；
字典 20552 字
词典 320349 词；
成语 49639 条；
歇后语 14026 条；
谚语 964 组；
谜语 42446 组；
绕口令 45 段；
对联 490 对；
歌词 499 首;
知识卡片 464 组；
句子 326 段；
诗歌 45 首；
中国传统节日 19 个；
二十四节气；
中国传统色 161 种；
中国的世界文化遗产 44 个；
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+u+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>省略调整的过程，看看AI生成的原型方案</p><div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code><span class="token title important"><span class="token punctuation">###</span> **一、核心设计原则**</span>
<span class="token list punctuation">1.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">文化感+现代感</span><span class="token punctuation">**</span></span>：古籍纹理+留白+传统色（如靛青、朱砂）
<span class="token list punctuation">2.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">极速检索</span><span class="token punctuation">**</span></span>：支持模糊搜索/分类筛选/高级语法
<span class="token list punctuation">3.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">内容关联</span><span class="token punctuation">**</span></span>：诗↔作者↔历史事件↔地理标签
<span class="token list punctuation">4.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">轻量化学习</span><span class="token punctuation">**</span></span>：卡片式设计+每日碎片化推送

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> **二、信息架构（关键模块）**</span>

graph TD
    A[首页] --&gt; B[探索]
    A --&gt; C[搜索]
    A --&gt; D[学习计划]
    A --&gt; E[收藏]
    B --&gt; F[分类库]
    B --&gt; G[今日推荐]
    F --&gt; H[诗文库]
    F --&gt; I[字典词典]
    F --&gt; J[传统文化]
    J --&gt; K[节气/节日]
    J --&gt; L[文化遗产]
    J --&gt; M[传统色]

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> **三、核心页面原型设计**</span>

<span class="token title important"><span class="token punctuation">####</span> **1. 首页 - 文化仪表盘**</span>
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">顶部</span><span class="token punctuation">**</span></span>：个人勋章（学习成就）+ 搜索栏（支持语音输入）
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">中部</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 动态古籍卷轴：展示今日节气/节日（点击进入详情）
  <span class="token list punctuation">-</span> 四象限导航：
    <span class="token list punctuation">-</span> <span class="token code-snippet code keyword">\`[名句赏析] [成语猜谜] [遗产巡礼] [色彩图谱]\`</span>
    
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">底部</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 每日任务进度条
  <span class="token list punctuation">-</span> 推荐卡片流（根据用户偏好推送：诗文/谜语/文化冷知识）

<span class="token title important"><span class="token punctuation">####</span> **2. 超级搜索页**</span>
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">场景化筛选器</span><span class="token punctuation">**</span></span>：
  
  <span class="token url">[<span class="token content">按朝代</span>] [<span class="token variable">按体裁</span>]</span> <span class="token url">[<span class="token content">按字数</span>] [<span class="token variable">按作者</span>]</span>
  <span class="token url">[<span class="token content">含典故</span>] [<span class="token variable">中小学必背</span>]</span> [风景关联] 

<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">特色搜索模式</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 拍诗识句（OCR识别图片中的诗句）
  <span class="token list punctuation">-</span> 「飞花令」模式（输入关键字查相关诗词）

<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">结果页</span><span class="token punctuation">**</span></span>：三维过滤（内容/人物/地点标签云）

<span class="token title important"><span class="token punctuation">####</span> **3. 诗文详情页（沉浸式阅读）**</span>


[标题] 静夜思
[朝代] 唐 [作者] 李白 ★收藏
——————————————————
正文区域（繁简切换/字体选择）
——————————————————
▣ 智能笺注（点击生词解析）
▶️ 朗诵音频（名家版本）
🌍 创作地地图（长安地理位置）
📚 关联知识卡片：
   <span class="token list punctuation">-</span> 盛唐诗风特点 
   <span class="token list punctuation">-</span> 同期诗人对比
   <span class="token list punctuation">-</span> 床前明月考证


<span class="token title important"><span class="token punctuation">####</span> **4. 传统文化模块**</span>
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">二十四节气</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 环形时间轴+物候动效
  <span class="token list punctuation">-</span> 每个节气包含：
    
<span class="token code keyword">    [三候图解] [养生食谱] [相关诗词10+]</span>
    
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">世界遗产</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 3D地球仪导航
  <span class="token list punctuation">-</span> 遗产详情页含：
    
<span class="token code keyword">    [AR复原模型] [历史脉络图] [关联古诗文]</span>
    
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">传统色谱</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 色卡墙（按朝代/用途分类）
  <span class="token list punctuation">-</span> 色值详情：
    
<span class="token code keyword">    朱湛 RGB(158,36,35)
    出处：《周礼·考工记》
    意象：宫廷庄严/喜庆祥瑞</span>
    

<span class="token title important"><span class="token punctuation">####</span> **5. 互动学习系统**</span>
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">知识迷宫</span><span class="token punctuation">**</span></span>：
  
  graph LR
      成语接龙 --&gt; 诗词填空
      诗词填空 --&gt; 谜语解析
      谜语解析 --&gt; 节气问答
  
<span class="token list punctuation">-</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">成就体系</span><span class="token punctuation">**</span></span>：
  <span class="token list punctuation">-</span> 解锁称号（「行走的成语词典」「唐诗百晓生」）
  <span class="token list punctuation">-</span> 实体勋章兑换（合作博物馆文创）

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> **四、特色交互设计**</span>
<span class="token list punctuation">1.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">古籍翻阅动效</span><span class="token punctuation">**</span></span>：诗文列表页采用右滑翻页动画，伴随纸张摩擦音效
<span class="token list punctuation">2.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">墨水扩散加载</span><span class="token punctuation">**</span></span>：数据加载时屏幕中央墨滴晕染动画
<span class="token list punctuation">3.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">节气感知背景</span><span class="token punctuation">**</span></span>：立春自动切换柳枝飘动动态背景
<span class="token list punctuation">4.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">AR文化空间</span><span class="token punctuation">**</span></span>：手机扫描桌面可投射虚拟文物模型（需3D资源支持）

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> **五、技术实现标注**</span>
<span class="token table"><span class="token table-header-row"><span class="token punctuation">|</span><span class="token table-header important"> 模块          </span><span class="token punctuation">|</span><span class="token table-header important"> 关键技术点                 </span><span class="token punctuation">|</span>
</span><span class="token table-line"><span class="token punctuation">|</span><span class="token punctuation">---------------</span><span class="token punctuation">|</span><span class="token punctuation">--------------------------</span><span class="token punctuation">|</span>
</span><span class="token table-data-rows"><span class="token punctuation">|</span><span class="token table-data"> 搜索系统      </span><span class="token punctuation">|</span><span class="token table-data"> Elasticsearch+中文分词优化 </span><span class="token punctuation">|</span>
<span class="token punctuation">|</span><span class="token table-data"> 离线库        </span><span class="token punctuation">|</span><span class="token table-data"> SQLite压缩数据库（核心内容）</span><span class="token punctuation">|</span>
<span class="token punctuation">|</span><span class="token table-data"> 音频资源      </span><span class="token punctuation">|</span><span class="token table-data"> 预加载+流媒体分级加载      </span><span class="token punctuation">|</span>
<span class="token punctuation">|</span><span class="token table-data"> AR功能        </span><span class="token punctuation">|</span><span class="token table-data"> ARCore/ARKit+轻量化3D模型  </span><span class="token punctuation">|</span>
</span></span>
<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> **六、原型预览图关键帧**</span>
<span class="token list punctuation">1.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">首页</span><span class="token punctuation">**</span></span>：青山水墨背景，中央悬浮动态节气轮盘  
<span class="token list punctuation">2.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">搜索页</span><span class="token punctuation">**</span></span>：输入「明月」后展示关联树：  
   
   诗句(1280+) → 李白(42首) 
          → 中秋(96首)
          → 苏州(寒山寺相关) 
   
<span class="token list punctuation">3.</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">谜语页</span><span class="token punctuation">**</span></span>：  
   
   [谜面] 半部春秋（打一字）
   [提示] 点击展开解析
   [用户猜测] 输入______
   [答案] 秦（春秋各取一半）
   

<span class="token blockquote punctuation">&gt;</span> 建议工具：Figma制作可交互原型，重点演示「搜索-详情-关联」的核心路径

此设计既满足学者深度研究需求（高级搜索+考据资料），又通过游戏化设计吸引大众用户。下一步可开发MVP版本验证内容组织逻辑。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然对于一个研发而言，上面的这套设计方案仅使用参考，我还是更喜欢可视化的交互页面</p><h2 id="三、快速原型实现" tabindex="-1"><a class="header-anchor" href="#三、快速原型实现" aria-hidden="true">#</a> 三、快速原型实现</h2><p>使用AI体验最好的就在这里了，我可以直接让它快速将上面的设计实现一个demo出来看看效果</p><figure><img src="`+d+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>这个生成的网页效果实际上超出了我的预期，至少我自己是设计不出来的。 接下来我们就是基于这个原型进行丰富补全</p>',12);function z(B,C){const a=c("ExternalLinkIcon");return t(),l("div",null,[r,b,k,m,n("p",null,[s("知乎上有一个挺好的话题，- "),n("a",_,[s("有没有公认比较好的诗词APP推荐？ - 知乎"),i(a)])]),h,g,f,A,n("ul",null,[n("li",null,[n("a",x,[s("caoxingyu/chinese-gushiwen: 中华古诗文数据库和API。包含10000首古文(诗、词、歌、赋以及其它形式的文言文)，近4000名作者，10000名句"),i(a)])]),n("li",null,[n("a",w,[s("chanind/hanzi-writer-data: The data used by Hanzi Writer"),i(a)])])]),P,n("ul",null,[n("li",null,[n("a",y,[s("hefengbao/jingmo: 『京墨』开源的中华文化宝典 APP，诗（词）文（名句）、汉字、成语、词语、歇后语、绕口令、传统节日、传统色、节气、人物等。"),i(a)])]),n("li",null,[n("a",I,[s("a2636340559/YaFeng: “雅风”古诗词APP"),i(a)])]),n("li",null,[n("a",F,[s("SongC1229/song: 基于Flutter框架的诗词app,采用sqlite数据库"),i(a)])])]),R])}const D=e(v,[["render",z],["__file","07.基于AI开发产品-文渊阁原型设计.html.vue"]]);export{D as default};

import{_ as a,V as o,W as s,X as i,Y as e,Z as l,a0 as r,F as t}from"./framework-23f3cf9b.js";const d="/tutorial/imgs/column/ai/1_1.webp",c="/tutorial/imgs/column/ai/1_2.webp",p="/tutorial/imgs/column/ai/1_3.webp",u="/tutorial/imgs/column/ai/1_4.webp",_="/tutorial/imgs/column/ai/1_5.png",h="/tutorial/imgs/column/ai/1_6.webp",m="/tutorial/imgs/column/ai/1_7.webp",v={},b=i("p",null,"hello大家好，我是一灰灰，距离上一次和大家分享技术相关内容已经过去了两年多了；若不是最近AICoding的大火，估计也不会继续发文啦。最近这个月深度体验了ai coding的能力，也借助字节的Trae完成了几个产品，借着首个app上架一周的时间、并获得首个自然用户的评价（虽然是个差评）这个时机，给大家分享一下我最近在筹划的一个专栏 -- 《人人都是程序员》",-1),g={href:"https://mp.weixin.qq.com/s/qtxF-vnUeKrp9BZZRaeeSw",target:"_blank",rel:"noopener noreferrer"},f=r('<figure><img src="'+d+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>确实是没想到外国人也会因为语言问题给差评，谁说欧洲人素质高来着😡</p><h2 id="_1-colorpicker上架谷歌应用市场" tabindex="-1"><a class="header-anchor" href="#_1-colorpicker上架谷歌应用市场" aria-hidden="true">#</a> 1. ColorPicker上架谷歌应用市场</h2><p>最近这段时间的各种AI工具的使用，加上首个99%以上内容由AI生成的APP（ColorPicker）在谷歌应用市场的成功上线，忽然意识到“人人都是程序员”这一现实好像在加速到来。</p><p>还记得我在初入这一行时，当时的TL推荐我们程序员要有产品思维，多看看《人人都是产品经理》这一本书，没想到今天我要开始着手准备《人人都是程序员》了。</p><p>首先给大家看一下这个完全由AI完成的APP（3.17号上架通过）</p><figure><img src="'+c+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>下面是实际的体验效果（整体功能齐全啦）</p>',8),k={href:"https://mp.weixin.qq.com/s/qtxF-vnUeKrp9BZZRaeeSw",target:"_blank",rel:"noopener noreferrer"},A=i("p",null,"希望体验h5的小伙伴可以访问下面两个地址（一个是自己的域名，一个是白嫖的cloudflare服务），或者直接点击文末的访问原文直达",-1),x={href:"http://cdn.hhui.top/app/color-picker/index.html#/",target:"_blank",rel:"noopener noreferrer"},P={href:"https://colorpicker-bpx.pages.dev/#/",target:"_blank",rel:"noopener noreferrer"},I=i("p",null,[i("strong",null,"1. 主要的业务逻辑：")],-1),y=i("p",null,"• 照相 + 本地相册读取图片，识别图片颜色 • 支持颜色分组，收藏 • 颜色详情，支持全屏显示 • 系统推荐色彩专栏 • APP国际化",-1),w=i("p",null,[i("strong",null,"2. 集成谷歌Admob广告，支持变现")],-1),C=i("p",null,[i("strong",null,"3. 多端支持")],-1),q={href:"https://colorpicker-bpx.pages.dev/#/",target:"_blank",rel:"noopener noreferrer"},T=i("h2",{id:"_2-ai生成app的契机",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#_2-ai生成app的契机","aria-hidden":"true"},"#"),e(" 2. AI生成APP的契机")],-1),B=i("p",null,"ColorPicker的诞生也比较偶然，今年年初的DeepSeek掀起AI届的新一轮高潮，好久没怎么学习的我也凑了一波热闹，借助字节提供的免费AI编辑器Trae，看一下现在的ai工具代码到底写得怎么样。",-1),z=i("p",null,"如到现在，基于Trae我共实现了三个应用：",-1),S=i("h3",{id:"_2-1-像素图填色游戏",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#_2-1-像素图填色游戏","aria-hidden":"true"},"#"),e(" 2.1. 像素图填色游戏")],-1),V={href:"https://liuyueyi.github.io/ai-web-case/",target:"_blank",rel:"noopener noreferrer"},Z=r('<p>1.一个简单的单页面web应用，通过解析给定的配置文件，生成像素图；用户可以根据自己选择的颜色对像素进行填色 2.特点：页面布局单一、业务逻辑简单，交互不多</p><figure><img src="'+p+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>这个web页面的开发过程非常顺利，基本上没有什么特别糟心的事情，整个实现也就两天的时间（关于将图片转换为用于渲染像素图的二维矩阵花了我一天，这块还是借助我的老本行java实现的😂），接下来我就想上点难度，看下AICoding的能力在哪里，接下来就有了下面的AI对战游戏</p><h3 id="_2-2-ai人机对战棋牌游戏" tabindex="-1"><a class="header-anchor" href="#_2-2-ai人机对战棋牌游戏" aria-hidden="true">#</a> 2.2. AI人机对战棋牌游戏</h3><p>1.人机对战的棋牌游戏，原定计划实现 五子棋、黑白棋、三子/九子棋、中国象棋、国际象棋等经典棋牌的人机方式 2.最终结果：完成五子棋、黑白棋、三子棋的基础实现 3.特点：布局相对复杂（比如三子棋盘的绘制），算法要求高（AI下棋策略，人机交互策略）</p><figure><img src="'+u+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>相较于像素填色，这个AI棋盘对战的开发过程就比较难受了，不管是棋盘的布局（尤其是三子棋的棋盘，反复修改调整)、AI的游戏策略/判定策略调教，都不是一个轻松的活，原定计划的中国象棋和国际象棋也没有耐心继续调教了。</p><p>这个游戏差不多花了我一周的时间，做完之后，感受就是AICoding确实方便，虽然离取代资深程序员还是有不小的距离，但是对初级程序员的挑战就很非常大了。这个项目做完之后，我就萌生了一个“人人都是程序员”的想法，这好像并不是不可能</p><h3 id="_2-3-colorpicker-图片颜色提取app" tabindex="-1"><a class="header-anchor" href="#_2-3-colorpicker-图片颜色提取app" aria-hidden="true">#</a> 2.3. ColorPicker 图片颜色提取APP</h3>',9),N={href:"https://github.com/liuyueyi/ai-color-picker",target:"_blank",rel:"noopener noreferrer"},E=i("p",null,"接下来就准备开始验证这个“人人都是程序员”是否属于我的异想天开了。",-1),F=i("p",null,"直接在应用市场，按照工具类进行下载、好评进行搜索，然后看到了一个百万下载量，而且功能不复杂应用，看到它的时候我就深信这个app完全可以有AI来生成，于是就有了下面的Ai生成应用",-1),H=i("figure",null,[i("img",{src:_,alt:"AI致敬版，百万下载量的高分APP",tabindex:"0",loading:"lazy"}),i("figcaption",null,"AI致敬版，百万下载量的高分APP")],-1),L=i("figure",null,[i("img",{src:h,alt:"AI生成的ColorPicker",tabindex:"0",loading:"lazy"}),i("figcaption",null,"AI生成的ColorPicker")],-1),j={href:"https://play.google.com/store/apps/details?id=com.git.hui.colorpicker.google",target:"_blank",rel:"noopener noreferrer"},K=i("ol",null,[i("li",null,"根据上传的图片，识别指定位置的图片颜色的工具"),i("li",null,"特点：一个完全由AI设计原型、实现业务逻辑细节，并且最终打包为Android APP，集成Admob广告，并上架谷歌应用市场，走通app的开发到上线全流程")],-1),R=i("h2",{id:"_3-colorpicker的历程",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#_3-colorpicker的历程","aria-hidden":"true"},"#"),e(" 3. ColorPicker的历程")],-1),U={href:"https://github.com/liuyueyi/ai-color-picker/commits/main/",target:"_blank",rel:"noopener noreferrer"},D=r('<figure><img src="'+m+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><ol><li><p>3.11 号确定应用的主体功能、展现形式，开始编码 • a. 功能：图片提色 • b. 展现形式：wap应用 + 小程序 + app • c. 技术栈：基于uniapp的技术栈来实现一套代码，多端生成 • d. 编程工具：HBuilder + AndroidStudio + Trae</p></li><li><p>3.12 号完成主体业务功能</p></li><li><p>3.13 号打包到apk，到android进行运行，尝试集成谷歌广告；并提交谷歌应用市场</p></li><li><p>3.14 号谷歌应用市场审批通过；开始第二版的迭代更新 a. 第二版新增：颜色搜索功能、分组、系统推荐色等能力</p></li><li><p>3.15 号解决uniapp上架到谷歌应用市场之后下载安装白屏问题（uniapp的bug)</p></li></ol><p>从想法诞生到最终的落地实现，基本上在五天内（其中app的相干样式适配、广告集成等问题最少花了两天😂），排除android相关的一些改造，其他的内容99.9%的内容全部由Trae来提供支撑，通过实际体验，“人人都是程序员”好像还挺容易成真的；</p><p>事后我重新复盘了一下这个开发过程，我将尝试以最大的可能性，给不是程序员这一行的小伙伴，介绍一条可以完全按照自己的想法设计app的小路，让你的创业不再停留在“就缺一个程序员”上了</p><h2 id="_4-人人都是程序员专栏" tabindex="-1"><a class="header-anchor" href="#_4-人人都是程序员专栏" aria-hidden="true">#</a> 4. 人人都是程序员专栏</h2><p>按照个人经验，拟定的专栏内容如下：（当然什么时候更新，我也无法给出肯定的承诺，欢迎关注公众号“一灰灰blog”蹲守第一手信息）</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>一、准备篇

相关账号：

科学上网（非必须，有更好）

谷歌账号 + 小程序账号 + uniapp账号

trae账号 + v0.dev + grok


开发工具：

前端开发环境准备：nvm + nodejs + HBuilder + Trae 安装

Android开发环境准备：AndroidStudio + Java

小程序篇：微信开发工具

代码管理相关：

  a. 国内的建议使用 gitee 管理代码

二、实战篇

从0到1完整一个APP，速通版视频 + 图文教程

	- 借助一个真实的例子进行演示

介绍Trae的基本使用姿势（重点）

介绍Git的几个简单应用

介绍HBuilder的基本使用（启动、打包到h5、打包到android、生成小程序相关资源）

介绍AndroidStudio生成apk的过程

介绍集成admob广告的过程

- 提供经过验证的内容admob-sdk （安卓版本）

介绍集成adsense广告的过程

介绍部署自己的wap应用

介绍发布自己的app到应用市场
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7);function G(J,W){const n=t("ExternalLinkIcon");return o(),s("div",null,[b,i("blockquote",null,[i("p",null,[e("第一手原文："),i("a",g,[e("首个完全由AI生成的APP-ColorPicker上架啦 | 一灰灰blog的公众号"),l(n)])])]),f,i("blockquote",null,[i("p",null,[e("点击查看原文："),i("a",k,[e("演示视频原文"),l(n)])])]),A,i("ul",null,[i("li",null,[i("a",x,[e("http://cdn.hhui.top/app/color-picker/index.html#/"),l(n)])]),i("li",null,[i("a",P,[e("https://colorpicker-bpx.pages.dev/#/"),l(n)])])]),I,y,w,C,i("p",null,[e("•android 版本 （已上架） •ios 版本（没有苹果应用账号，因此没上架） •h5/pc 版本: 已上线 "),i("a",q,[e("https://colorpicker-bpx.pages.dev/#/"),l(n)]),e(" •小程序版（未备案，所以未上线）")]),T,B,z,S,i("blockquote",null,[i("p",null,[e("源码："),i("a",V,[e("https://liuyueyi.github.io/ai-web-case/"),l(n)])])]),Z,i("blockquote",null,[i("p",null,[e("源码 "),i("a",N,[e("https://github.com/liuyueyi/ai-color-picker"),l(n)])])]),E,F,H,L,i("p",null,[e("AI生成的ColorPicker 谷歌市场下载地址 -> "),i("a",j,[e("https://play.google.com/store/apps/details?id=com.git.hui.colorpicker.google"),l(n)])]),K,R,i("p",null,[e("接下来我将回顾一下 ColorPicker 的诞生历程 "),i("a",U,[e("https://github.com/liuyueyi/ai-color-picker/commits/main/"),l(n)])]),D])}const Y=a(v,[["render",G],["__file","00.首个完全由AI生成的APP上架啦.html.vue"]]);export{Y as default};

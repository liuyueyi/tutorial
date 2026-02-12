import{_ as n,V as s,W as i,Y as a}from"./framework-b1bd8911.js";const l="/tutorial/imgs/column/llm/03-1.png",t={},e=a('<p>下面是一份<strong>可以直接作为成稿使用的「前言」章节内容</strong>，风格与全书保持一致：不炫技、不晦涩，用问题牵引认知转变，并且<strong>明确告诉读者这本书“解决什么、不解决什么”</strong>。</p><hr><h2 id="前言" tabindex="-1"><a class="header-anchor" href="#前言" aria-hidden="true">#</a> 前言</h2><h3 id="为什么你-会用-llm-但做不出复杂应用" tabindex="-1"><a class="header-anchor" href="#为什么你-会用-llm-但做不出复杂应用" aria-hidden="true">#</a> 为什么你“会用 LLM”，但做不出复杂应用？</h3><p>如果你已经读到这里，大概率符合下面的画像之一：</p><ul><li><p>你能写出效果不错的 Prompt</p></li><li><p>你做过一些 Demo，看起来“挺智能”</p></li><li><p>但一到真实场景，就开始不对劲：</p><ul><li>回答时好时坏</li><li>对话一长就跑偏</li><li>数据一多就失控</li><li>Demo 很难上线，更谈不上长期维护</li></ul></li></ul><p>你可能已经问过自己一些问题：</p><ul><li><strong>为什么 Prompt 调得很好，系统却依然不稳定？</strong></li><li><strong>为什么 Demo 阶段“看起来能用”，上线后问题不断？</strong></li><li><strong>为什么模型很强，但应用却很脆弱？</strong></li></ul><p>如果你有这些困惑，那问题<strong>并不在于你不会用 LLM</strong>。</p><p>真正的问题是：</p><blockquote><p><strong>你学到的大多数内容，都是“如何驱动模型”， 而不是“如何构建系统”。</strong></p></blockquote><hr><h4 id="调得好-prompt-系统就稳定" tabindex="-1"><a class="header-anchor" href="#调得好-prompt-系统就稳定" aria-hidden="true">#</a> 调得好 Prompt ≠ 系统就稳定</h4><p>这是很多开发者都会踩的第一个坑。</p><p>Prompt 确实重要，但它只解决一件事：</p><blockquote><p><strong>在一次生成中，如何约束模型行为。</strong></p></blockquote><p>而真实的 LLM 应用，必然涉及：</p><ul><li>多轮对话</li><li>状态变化</li><li>知识更新</li><li>错误处理</li><li>成本与安全边界</li></ul><p>这些问题，<strong>没有一个是靠多写几句 Prompt 能解决的</strong>。</p><hr><h4 id="为什么多数-demo-无法上线" tabindex="-1"><a class="header-anchor" href="#为什么多数-demo-无法上线" aria-hidden="true">#</a> 为什么多数 Demo 无法上线？</h4><p>因为 Demo 往往具备三个“天然优势”：</p><ul><li>用户少</li><li>数据小</li><li>时间短</li></ul><p>一旦进入真实环境：</p><ul><li>上下文开始膨胀</li><li>知识开始过期</li><li>用户开始“乱问”</li><li>错误开始积累</li></ul><p>你会发现：</p><blockquote><p><strong>Demo 是“一次生成的问题”， 而上线是“系统随时间演化的问题”。</strong></p></blockquote><p>这正是两者之间的本质鸿沟。</p><hr><h4 id="这篇系列教程解决什么问题-不解决什么问题" tabindex="-1"><a class="header-anchor" href="#这篇系列教程解决什么问题-不解决什么问题" aria-hidden="true">#</a> 这篇系列教程解决什么问题？不解决什么问题？</h4><p>这个系列教程<strong>不试图</strong>做以下事情：</p><ul><li>❌ 教你写“最强 Prompt 模板”</li><li>❌ 罗列各种框架 API 用法</li><li>❌ 追逐最新模型或参数技巧</li></ul><p>本书真正要解决的是：</p><blockquote><p><strong>如何把一个不可靠的大模型， 放进一个可控、可维护、可演进的系统中。</strong></p></blockquote><p>更具体地说：</p><ul><li>为什么 Prompt 必须是“约束”，而不是“知识”</li><li>为什么上下文会天然失控，以及如何设计记忆</li><li>为什么 RAG 不是外挂，而是工程必然</li><li>为什么 Agent 不是智能幻想，而是系统循环</li><li>为什么评估与监控决定了项目能不能活下来</li></ul><p>如果你期待的是“技巧合集”，这个系列教程可能不适合你。</p><p>如果你想的是<strong>真正把 LLM 应用做成产品</strong>，那你来对了。</p><hr><h3 id="本书的学习路径说明" tabindex="-1"><a class="header-anchor" href="#本书的学习路径说明" aria-hidden="true">#</a> 本书的学习路径说明</h3><p>这不是一本可以“跳着看也无所谓”的书。</p><p>因为它试图做一件事：</p><blockquote><p><strong>带你完成一次从“模型使用者”到“系统设计者”的转变。</strong></p></blockquote><hr><h4 id="你需要什么基础" tabindex="-1"><a class="header-anchor" href="#你需要什么基础" aria-hidden="true">#</a> 你需要什么基础？</h4><p>你不需要：</p><ul><li>深度学习理论</li><li>Transformer 数学推导</li><li>算法竞赛背景</li></ul><p>但你需要：</p><ul><li>基本的编程经验</li><li>对 Web / 后端 / 系统设计有基本认知</li><li>至少实现过一个简单的 LLM 应用或 Demo</li></ul><p>如果你已经写过几次 Prompt、接过模型 API、踩过一些坑，那正是<strong>最佳起点</strong>。</p><hr><h4 id="每一模块学完-你-能做什么" tabindex="-1"><a class="header-anchor" href="#每一模块学完-你-能做什么" aria-hidden="true">#</a> 每一模块学完，你“能做什么”？</h4><p>本书的每一部分，都对应一种<strong>能力跃迁</strong>：</p><ul><li><p><strong>理解模型本质</strong> → 不再迷信“模型会自己想明白”</p></li><li><p><strong>Prompt 与约束</strong> → 能设计行为边界，而不是碰运气</p></li><li><p><strong>Context 与 Memory</strong> → 能做稳定的多轮系统</p></li><li><p><strong>RAG 与知识注入</strong> → 能让系统基于真实事实回答</p></li><li><p><strong>Function Calling 与 Agent</strong> → 能让系统完成任务，而不只是聊天</p></li><li><p><strong>评估与工程化</strong> → 能让系统长期运行、持续演进</p></li></ul><p>你最终获得的不是某个技巧，而是：</p><blockquote><p><strong>一套判断“该不该这么设计”的工程直觉。</strong></p></blockquote><hr><h4 id="推荐的学习与实践方式" tabindex="-1"><a class="header-anchor" href="#推荐的学习与实践方式" aria-hidden="true">#</a> 推荐的学习与实践方式</h4><p>这本书<strong>强烈不推荐</strong>只读不做。</p><p>更好的方式是：</p><ol><li><p><strong>以“企业知识库助手”为主线对照阅读</strong></p><ul><li>每读一章，想一想： <em>如果是我的系统，会在哪里出问题？</em></li></ul></li><li><p><strong>在你已有的 Demo 上逐步套用</strong></p><ul><li>不用一次重构</li><li>先从约束、再到上下文、再到检索</li></ul></li><li><p><strong>接受一个事实</strong></p><ul><li>LLM 应用不是“搭完就好”</li><li>而是一个会随时间退化的系统</li></ul></li></ol><p>如果你在阅读过程中不断产生这样的想法：</p><blockquote><p>“原来我之前的问题不是偶然的。” “原来这一步是迟早要做的。”</p></blockquote><p>那么，这本书正在发挥它真正的价值。</p><hr><blockquote><p><strong>这不是一本教你“怎么用模型”的书， 而是一本教你“如何与模型共处”的工程指南。</strong></p></blockquote><p>欢迎开始。</p><hr><h3 id="全书大纲" tabindex="-1"><a class="header-anchor" href="#全书大纲" aria-hidden="true">#</a> 全书大纲</h3><figure><img src="'+l+`" alt="思维导图版大纲" tabindex="0" loading="lazy"><figcaption>思维导图版大纲</figcaption></figure><p>文字版大纲如下</p><div class="language-markdown line-numbers-mode" data-ext="md"><pre class="language-markdown"><code><span class="token title important"><span class="token punctuation">#</span> 第一部分｜重新认识 LLM：不是模型问题，而是系统问题</span>

<span class="token blockquote punctuation">&gt;</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">目标：建立“工程师视角”的 LLM 认知模型</span><span class="token punctuation">**</span></span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 1 章：LLM 到底在做什么？（程序员版认知重建）</span>

<span class="token title important"><span class="token punctuation">###</span> 1.1 一个反直觉的问题：LLM 真的“理解”语言吗？</span>

<span class="token list punctuation">*</span> 如果它不理解，为什么还能推理？
<span class="token list punctuation">*</span> “下一个 token 预测”到底意味着什么？

<span class="token title important"><span class="token punctuation">###</span> 1.2 从函数视角理解 LLM</span>

<span class="token list punctuation">*</span> LLM ≈ <span class="token code-snippet code keyword">\`f(context) → token\`</span>
<span class="token list punctuation">*</span> 为什么上下文就是一切？
<span class="token list punctuation">*</span> 为什么 prompt 是“代码”？

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> 1.3 你必须接受的事实：LLM 天生不可靠</span>

<span class="token list punctuation">*</span> 什么是幻觉？为什么无法彻底消除？
<span class="token list punctuation">*</span> “不知道”为什么是最难的答案？

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> 1.4 第一性原理总结</span>

<span class="token list punctuation">*</span> LLM 擅长什么？
<span class="token list punctuation">*</span> LLM 永远不该做什么？
<span class="token list punctuation">*</span> 哪些问题必须交给系统解决？

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 2 章：模型不是重点，参数才是你真正的控制面板</span>

<span class="token title important"><span class="token punctuation">###</span> 2.1 一个问题：为什么同一个 Prompt 效果忽好忽坏？</span>

<span class="token list punctuation">*</span> 随机性从哪来？
<span class="token list punctuation">*</span> temperature / top_p 在“干什么”？

<span class="token title important"><span class="token punctuation">###</span> 2.2 参数 ≠ 配置，而是策略</span>

<span class="token list punctuation">*</span> 不同任务的参数决策逻辑
<span class="token list punctuation">*</span> 为什么大多数人“乱调参”？

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> 2.3 API 调用的本质结构</span>

<span class="token list punctuation">*</span> messages 是“状态机”
<span class="token list punctuation">*</span> system role 真正的权力边界

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">#</span> 第二部分｜Prompt 工程：让模型“稳定干活”的第一道防线</span>

<span class="token blockquote punctuation">&gt;</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">目标：从“写提示词”升级为“设计 Prompt 结构”</span><span class="token punctuation">**</span></span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 3 章：Prompt 为什么会失败？</span>

<span class="token title important"><span class="token punctuation">###</span> 3.1 一个常见误区：Prompt 写得越长越好？</span>

<span class="token list punctuation">*</span> 模糊 ≠ 自由
<span class="token list punctuation">*</span> 细节 ≠ 噪声

<span class="token title important"><span class="token punctuation">###</span> 3.2 Prompt 的三条工程原则</span>

<span class="token list punctuation">*</span> 清晰性
<span class="token list punctuation">*</span> 约束性
<span class="token list punctuation">*</span> 可复用性

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 4 章：从 Zero-shot 到 Few-shot 的设计思维</span>

<span class="token title important"><span class="token punctuation">###</span> 4.1 什么时候你真的需要 Few-shot？</span>

<span class="token list punctuation">*</span> 模型不会“猜你的规则”

<span class="token title important"><span class="token punctuation">###</span> 4.2 示例驱动 Prompt 的本质</span>

<span class="token list punctuation">*</span> 示例是在教模型“判题规则”

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 5 章：Prompt 模板化与工程落地</span>

<span class="token title important"><span class="token punctuation">###</span> 5.1 为什么 Prompt 必须版本化？</span>

<span class="token list punctuation">*</span> Prompt 就是代码

<span class="token title important"><span class="token punctuation">###</span> 5.2 通用 Prompt 模板结构</span>

<span class="token list punctuation">*</span> Role
<span class="token list punctuation">*</span> Task
<span class="token list punctuation">*</span> Constraints
<span class="token list punctuation">*</span> Output Schema

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">#</span> 第三部分｜上下文与记忆：对话为什么会“失忆”？</span>

<span class="token blockquote punctuation">&gt;</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">目标：掌握对话系统设计，而不是堆 messages</span><span class="token punctuation">**</span></span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 6 章：上下文窗口的真实边界</span>

<span class="token title important"><span class="token punctuation">###</span> 6.1 上下文不是“无限内存”</span>

<span class="token list punctuation">*</span> Token 成本、性能与遗忘

<span class="token title important"><span class="token punctuation">###</span> 6.2 为什么长对话一定会崩？</span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 7 章：三种记忆策略的工程取舍</span>

<span class="token title important"><span class="token punctuation">###</span> 7.1 短期记忆：直接塞上下文</span>

<span class="token title important"><span class="token punctuation">###</span> 7.2 摘要记忆：用 LLM 管 LLM</span>

<span class="token title important"><span class="token punctuation">###</span> 7.3 长期记忆：向量化存储历史</span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 8 章：上下文工程（Context Engineering）</span>

<span class="token title important"><span class="token punctuation">###</span> 8.1 什么信息值得留下？</span>

<span class="token title important"><span class="token punctuation">###</span> 8.2 信息如何“压缩但不失真”？</span>

<span class="token title important"><span class="token punctuation">###</span> 8.3 结构化上下文设计模式</span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">#</span> 第四部分｜能力扩展：让 LLM 走出“纯聊天”</span>

<span class="token blockquote punctuation">&gt;</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">目标：让 LLM 接入真实世界，而不是只会说话</span><span class="token punctuation">**</span></span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 9 章：为什么单靠 LLM 永远不够？</span>

<span class="token title important"><span class="token punctuation">###</span> 9.1 知识截止的问题</span>

<span class="token title important"><span class="token punctuation">###</span> 9.2 无状态的问题</span>

<span class="token title important"><span class="token punctuation">###</span> 9.3 无执行能力的问题</span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 10 章：Function Calling —— LLM 的“决策大脑”</span>

<span class="token title important"><span class="token punctuation">###</span> 10.1 模型是如何“选择工具”的？</span>

<span class="token title important"><span class="token punctuation">###</span> 10.2 Schema 设计的关键原则</span>

<span class="token list punctuation">*</span> 函数不是越多越好

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 11 章：RAG —— 企业级 LLM 的地基</span>

<span class="token title important"><span class="token punctuation">###</span> 11.1 为什么 RAG 不是“外挂知识库”？</span>

<span class="token title important"><span class="token punctuation">###</span> 11.2 RAG 解决的是哪一类问题？</span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">###</span> 11.3 文档 → Chunk → Embedding 的关键设计点</span>

<span class="token list punctuation">*</span> 切多大才合理？
<span class="token list punctuation">*</span> 为什么分割决定效果上限？

<span class="token title important"><span class="token punctuation">###</span> 11.4 检索失败的真实原因</span>

<span class="token list punctuation">*</span> 不是模型问题，而是数据问题

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">#</span> 第五部分｜Agent 思维：从调用模型到构建系统</span>

<span class="token blockquote punctuation">&gt;</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">目标：理解“智能体”不是框架，而是架构模式</span><span class="token punctuation">**</span></span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 12 章：什么是 Agent？它和 Prompt 的本质区别</span>

<span class="token title important"><span class="token punctuation">###</span> 12.1 为什么 CoT ≠ Agent？</span>

<span class="token title important"><span class="token punctuation">###</span> 12.2 ReAct / Plan-Execute 的本质抽象</span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 13 章：一个 Agent 的最小系统结构</span>

<span class="token list punctuation">*</span> 输入解析
<span class="token list punctuation">*</span> 状态管理
<span class="token list punctuation">*</span> 工具调度
<span class="token list punctuation">*</span> 结果评估

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 14 章：失败的 Agent 都失败在哪？</span>

<span class="token list punctuation">*</span> 无限循环
<span class="token list punctuation">*</span> 工具滥用
<span class="token list punctuation">*</span> 目标漂移

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">#</span> 第六部分｜实战：从 Demo 到“可上线系统”</span>

<span class="token blockquote punctuation">&gt;</span> <span class="token bold"><span class="token punctuation">**</span><span class="token content">目标：真正跑起来，而不是只在 Notebook 里成功</span><span class="token punctuation">**</span></span>

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 第 15 章：实战一：可控的多轮对话助手</span>

<span class="token list punctuation">*</span> Prompt + 记忆 + 参数策略

<span class="token title important"><span class="token punctuation">##</span> 第 16 章：实战二：企业知识库问答系统（RAG）</span>

<span class="token list punctuation">*</span> 文档接入
<span class="token list punctuation">*</span> 检索优化
<span class="token list punctuation">*</span> 引用溯源

<span class="token title important"><span class="token punctuation">##</span> 第 17 章：实战三：工具驱动型 Agent</span>

<span class="token list punctuation">*</span> Function Calling
<span class="token list punctuation">*</span> 状态管理
<span class="token list punctuation">*</span> 错误恢复

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">#</span> 终章｜下一步你该学什么？</span>

<span class="token list punctuation">*</span> 什么时候该微调？
<span class="token list punctuation">*</span> 什么时候该换模型？
<span class="token list punctuation">*</span> LLM 应用的长期演进方向

<span class="token hr punctuation">---</span>

<span class="token title important"><span class="token punctuation">##</span> 📌 附录</span>

<span class="token list punctuation">*</span> Prompt 模板速查表
<span class="token list punctuation">*</span> RAG 参数调优清单
<span class="token list punctuation">*</span> Agent 架构设计 Checklist
<span class="token list punctuation">*</span> 常见坑位与反模式总结
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,72),p=[e];function c(o,u){return s(),i("div",null,p)}const r=n(t,[["render",c],["__file","03.前言.html.vue"]]);export{r as default};

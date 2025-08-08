---
title: SpringAI
icon: material
---

这里主要介绍的是SpringAI进行AI应用开发的系列教程

注意：在使用SpringAI时，对jdk和springboot有最低的版本要求

- jdk: 17+
- SpringBoot: 3+


本篇专栏将从三个系列出发

### 1.基础教程

主要介绍SpringAI的基础使用，对应的项目工程以 `Sxx-` 开头，通过这些实例，您将掌握SpringAI的基础知识（如提示词、上下文、架构化输出、tool calling, MCP, advise, ChatClient, 多模型等），并开始使用SpringAI进行大模型应用开发

- [x] [01.创建一个SpringAI-Demo工程.md](基础篇/01.创建一个SpringAI-Demo工程.md)
- [x] [02.提示词的使用.md](基础篇/02.提示词设置.md)
- [x] [03.结构化返回](基础篇/03.结构化返回.md)
- [x] [04.聊天上下文实现多轮对话](基础篇/04.聊天上下文.md)
- [x] [05.自定义大模型接入](基础篇/05.自定义大模型接入.md)
- [x] [06.Function Tool工具调用](基础篇/06.工具调用.md)
- [x] [07.实现一个简单的McpServer](基础篇/07.实现一个简单的McpServer.md)
- [x] [08.MCP Server简单鉴权的实现](基础篇/08.MCP Server简单鉴权的实现.md)]
- [x] [09.ChatClient使用说明](基础篇/09.ChatClient使用说明.md)]
- [x] [10.Advisor实现SpringAI交互增强](基础篇/10.Advisor实现SpringAI交互增强.md)]
- [x] [11.图像模型-生成图片](基础篇/11.图像模型.md)
- [x] [12.多模态实现食材图片卡路里识别示例](基础篇/12.多模态实现食材图片卡路里识别示例.md)
- [x] [13.支持MCP Client的AI对话实现](基础篇/13.支持MCP Client的AI对话实现.md)
- [ ] [14.音频模型](基础篇/12.音频模型.md)
- [ ] [15.检索增强生成RAG](基础篇/08.检索增强生成RAG.md)

### 2.进阶教程

进阶相关将主要介绍如何更好的使用SpringAI进行大模型应用开发，对应的实例工程都放在 [advance-projects](https://github.com/liuyueyi/spring-ai-demo/tree/master/advance-projects) 下

- [x] [01.使用MySql持久化对话历史](进阶篇/A01.使用MySql持久化对话历史.md)
- [x] [02.使用H2持久化对话历史](进阶篇/A02.使用H2持久化对话历史.md)]
- [x] [03.使用Redis持久化对话历史](进阶篇/A03.使用Redis持久化对话历史.md)]

### 3.应用教程

以搭建完整可用的SpringAI应用为目的，演示SpringAI的业务边界和表现，对应项目工程以 `Xxx-` 开头


### 4.源码解读

以源码的视角，介绍SpringAI的核心实现，对应的项目工程以 `Yxx-` 开头
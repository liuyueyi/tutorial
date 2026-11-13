---
title: markdown-plugin
order: 5
index: true
icon: folder
---

markdown 渲染相关工具包，一句话概括：给一段 markdown 或者 html，输出一张图片。

整个插件主要借助 `flexmark` 和 `xhtmlrenderer` 来实现，对外提供的核心能力有：

1. markdown 转 html：`MarkDown2HtmlWrapper`
	- 基于开源库 flexmark 实现的转换封装
	- 默认支持表格语法扩展，内置 huimarkdown 默认样式
	- 支持 ofFile / ofUrl / ofStream / ofContent 四种输入姿势

2. markdown 转图片：`Html2ImageWrapper.ofMd`
	- 走 `md -> html -> image` 的链路
	- 支持自定义 css 样式（内置多套主题：huimarkdown / heyrain / hyper / koala）
	- 支持指定输出图片的宽高、自适应宽高、输出格式、字体等

3. html 转图片：`Html2ImageWrapper.of` / `ofDoc`
	- `of()`：html 片段渲染，可额外指定 css
	- `ofDoc()`：完整的 html 文档直接渲染输出图片
	- 输出方式支持 BufferedImage、本地文件、base64 字符串

## 系列教程

1. [markdown转html](./01.markdown转html.md)
2. [markdown转图片](./02.markdown转图片.md)
3. [html转图片](./03.html转图片.md)

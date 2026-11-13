---
title: phantom-plugin
order: 6
index: true
icon: folder
---

phantom-plugin 是 QuickMedia 体系里负责「网页截图」的插件，借助 PhantomJs 这个无头浏览器，把一个 html 页面渲染成图片。

它解决的场景和 markdown-plugin 里的 html 转图片不太一样：markdown-plugin 走的是 Java 侧的 xhtmlrenderer 渲染方案，纯 Java 实现、不依赖外部程序，但对复杂 css、js 动态内容的支持有限；而 phantom-plugin 则是把渲染这件事彻底交给浏览器内核，Java 侧只负责调用和拿结果，凡是浏览器能显示的页面，理论上都能截下来。

当前已支持的能力清单如：

1. html 页面转图片：`com.github.hui.quick.plugin.phantom.Html2ImageByJsWrapper`
	- 支持将一个线上 url 渲染并输出为 `BufferedImage`
	- 基于 selenium + ghostdriver 驱动本机安装的 phantomjs 完成

2. 配合 base-plugin 的工具类，可以把截图结果直接转 base64，用于网页内嵌展示

注意，使用本插件前需要在机器上安装 phantomjs（2.1.1 版本），并保证 Java 进程能找到这个可执行文件，安装姿势见下面这篇：

- [1.基于PhantomJs实现html输出图片](./01.基于PhantomJs实现html输出图片.md)

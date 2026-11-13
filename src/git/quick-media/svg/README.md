---
title: svg-plugin
order: 2
index: true
icon: folder
---

svg-plugin
---

svg 渲染工具包，借助 Apache Batik 实现 svg 文档的渲染，并输出 jpg / png / tiff 格式的图片；同时支持模板渲染，通过给 svg 模板传参，实现同一模板批量输出不同内容图片的效果。

## 能力清单

- [x] svg 渲染为图片，支持 png / jpg / tiff 三种输出格式
- [x] svg 来源灵活：本地文件（绝对路径/相对路径）、网络 url、`<svg` 开头的 svg 文本均可
- [x] 多种输出方式：输出图片对象（BufferedImage）、输出流、输出字节、输出文件
- [x] 输出文件时根据文件名后缀自动推断渲染格式，父目录不存在时自动递归创建
- [x] svg 模板渲染：按标签 id 传参，支持标签正文替换、标签属性替换、image/a 标签的链接替换
- [x] 模板渲染的 Document 结构缓存，提升同一模板反复传参渲染时的性能
- [x] 内置 batik-codec-fix，修复 batik 新版本 png 输出的兼容问题，无需额外操心

## 相关文章

- [1.svg渲染输出图片](./01.svg渲染输出图片.md)
- [2.svg模板渲染](./02.svg模板渲染.md)

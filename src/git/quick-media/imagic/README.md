---
title: imagic-plugin
order: 4
index: true
icon: folder
---

imagic-plugin 是 QuickMedia 系列中负责图片编辑的工具包，底层基于 ImageMagick（通过 im4java 进行命令行调用），上层做了 Builder 模式的链式封装，把 ImageMagick 原本冗长的 `convert` 命令行参数，收敛成一行一意、可读性很高的 Java 代码。

它的定位是"图片编辑器"：旋转、裁剪、缩放这类基本编辑操作，原生 Java（BufferedImage + Graphics2D）也能做，但会遇到 jpg 变红、精度丢失、颜色失真等老问题；ImageMagick 是 C++ 实现的专业图片处理工具，稳定性和图片质量都更有保障，缺点是需要在本机安装环境。imagic-plugin 的价值就在于：帮你把 ImageMagick 的能力用最低的成本接入 Java 项目。

当前已支持的能力清单：

1. 图片旋转：`rotate`
2. 图片裁剪：`crop`
3. 图片缩放/压缩：`scale`（支持指定宽高、按比例缩放、指定图片精度 quality、强制拉伸）
4. 上下翻转：`flip`
5. 左右镜像：`flop`
6. 添加水印：`water`（水印图支持 classpath 资源、网络图片、输入流）
7. 添加边框：`board`（可指定边框宽高与填充色）
8. 复合操作：以上操作支持链式叠加，一次调用按顺序完成多个编辑动作

输入输出都很灵活：输入支持 classpath 资源、远程图片（URI）、二进制流；输出支持文件、`InputStream`、`byte[]`、`BufferedImage` 等多种形态。

**系列文章**

- [1.基于ImageMagic实现图片编辑器](./01.基于ImageMagic实现图片编辑器.md)：ImageMagick 环境安装、依赖引入、`ImgWrapper` 全 API 使用说明与复合操作实战

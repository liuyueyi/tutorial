---
title: base-plugin
order: 10
index: true
icon: folder
---

base-plugin 是 QuickMedia 各个插件的公共基础库，它不提供面向最终用户的某个具体功能，而是把 image-plugin、qrcode-plugin、markdown-plugin 等插件里都会用到的底层能力抽出来统一维护，比如文件读取、图片加载、gif 编解码、颜色处理、http 下载等工具类。

实际使用中，它通常会随着其他插件**间接引入**，一般不需要单独依赖；但如果你的项目里恰好也缺这么一套趁手的工具方法，直接拿来用也完全没问题（中央仓库坐标 `com.github.liuyueyi.media:base-plugin`）。

当前已支持的能力清单如：

1. 文件读写：`com.github.hui.quick.plugin.base.file`
	- `FileReadUtil`：读取文件/流，兼容网络地址、绝对路径、`~` 用户目录、classpath 相对路径；魔数识别
	- `FileWriteUtil`：保存流/文本到临时目录，递归建目录，文件信息解析
	- `BasicFileUtil`：绝对路径判断、`~` 路径解析、按魔数识别文件类型

2. IO 工具：`com.github.hui.quick.plugin.base.io.IoUtil`
	- 流转可重复读的字节数组流、流转字符串

3. 图片加载与操作：`com.github.hui.quick.plugin.base.awt`
	- `ImageLoadUtil`：按路径加载图片（含 ico）、加载 gif
	- `ImageOperateUtil`：圆角图、圆形 logo、边框生成
	- `GraphicUtil`：画布创建、高质量 Graphics2D 获取、缩放、png 转 jpg
	- `ColorUtil`：int/html/字符串颜色与 `Color` 对象互转

4. gif 编解码：`com.github.hui.quick.plugin.base.gif`
	- `GifHelper`：gif 加载、多帧合成 gif 输出
	- `GifDecoder` / `GifEncoder`：gif 的逐帧解析与逐帧编码

5. http 工具：`com.github.hui.quick.plugin.base.http.HttpUtil`
	- 从网络下载资源，返回输入流

6. 系统与进程：`com.github.hui.quick.plugin.base`
	- `OSUtil`：windows 系统判断
	- `ProcessUtil`：执行外部命令（ffmpeg 转码等场景在用）

7. 其他：`Base64Util`（图片与 base64 互转）、`DomUtil`（data-uri 拼接）、`NumUtil`（进制转换）

各工具类的典型用法，请见速查手册：

- [1.公共工具类速查](./01.公共工具类速查.md)

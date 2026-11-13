---
title: audio-plugin
order: 8
index: true
icon: folder
---

# audio-plugin 音频处理

> audio-plugin 是 QuickMedia 多媒体工具箱中负责音频处理的插件，目前提供的核心能力是**音频转码**：底层封装 `ffmpeg` 命令行调用，上层对外暴露链式的 `AudioWrapper` 使用接口，几行代码就能完成本地文件、网络音频、输入流之间的格式转换（如微信语音常见的 `amr` 转 h5 可直接播放的 `mp3`）。

## 能力清单

- **音频转码**：基于 `ffmpeg` 实现任意常见音频格式之间的转换（`amr`/`mp3`/`wav`/`ogg`/`m4a`...）
- **三种输入源**：本地文件路径（绝对/相对路径）、网络 URL、`InputStream` 输入流
- **两种输出方式**：转码后保存为文件（`asFile`），或者直接拿到输出的 `InputStream`（`asStream`）
- **命令行参数可扩展**：通过 `addOption` 可以追加任意 `ffmpeg` 参数，默认自带 `-y`（覆盖写）、`write_xing 0`（解决 mac/ios 音频时长显示不对）、`loglevel quiet`（不输出日志）三个兜底配置
- **临时文件管理**：网络资源、输入流会先落到临时目录再转码，临时目录可通过系统属性 `quick.media.tmp.path` 自定义

## 相关文章

- [基于FFMPEG实现音频转码](./01.基于FFMPEG实现音频转码.md)

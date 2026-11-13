---
title: tts-plugin
order: 11
index: true
icon: folder
---

tts-plugin
---

文本转语音（Text To Speech），给一段文字，输出一段可以听的音频。

插件的核心实现思路来自开源项目 [java-tts](https://github.com/ikfly/java-tts)，通过 WebSocket 长连接调用 Edge 的语音合成服务，将文本合成为音频并保存为本地文件。

## 能力清单

- [x] 文本转语音，输出 mp3 等格式的音频文件
- [x] 300+ 音色可选（基于 Edge 语音服务，覆盖全球大部分语言）
- [x] 中文普通话、粤语、台湾普通话、东北话、陕西话等多种方言
- [x] 支持语速（rate）、音量（volume）调节
- [x] 支持多种音频输出格式（mp3 / opus / ogg / pcm / webm 等）
- [x] 支持自定义音频保存方式（保存文件 / 流式输出）
- [x] 支持合成完成后直接播放（内置 mp3、pcm 播放器）
- [x] 支持 http/socks 代理配置

## 相关文章

- [1.文本转语音](./01.文本转语音.md)

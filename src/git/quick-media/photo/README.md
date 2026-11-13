---
title: photo-plugin
order: 7
index: true
icon: folder
---

photo-plugin 是 QuickMedia 系列中负责图片风格化处理的工具包，**纯 Java 实现**（基于 BufferedImage 逐像素运算，辅以 jhlabs 图像处理库），不依赖任何外部环境，引入依赖即可使用。

它的定位是"图片风格化"：不是像 imagic-plugin 那样做旋转、裁剪这类几何编辑，而是给图片"换一种画风"——比如把一张照片变成手绘素描，或者把照片变成一张线稿。这类操作的实现原理多是图像处理中经典的滤波、卷积和混合算法，photo-plugin 把它们封装成了统一的算子（Operator）模型：每个算子对外暴露相同的用法（`of` 指定算子 → `setImg` 传图 → 链式配置参数 → `asImg`/`asFile` 输出），上手成本很低。

当前已支持的能力清单（以 `operator` 目录下实际实现的算子为准）：

1. 素描化：`OperatorEnum.SKETCH`
   - 灰度化 → 反色 → 高斯模糊 → ColorDodge（颜色减淡）混合，输出手绘素描风格
   - 支持调节高斯模糊半径 `radius` 与混合强度 `alpha`

2. 边缘检测/线稿提取：`OperatorEnum.EDGE`
   - 内置六种边缘检测算法，通过 `EdgeType` 切换：
     - `SOBEL`（默认）、`PREWITT`、`KIRSCH`、`LAPLACIAN`、`ROBERTS`：基于卷积核的经典梯度算子
     - `CANNY`：完整的 Canny 边缘检测流程（高斯平滑 → 梯度 → 非极大值抑制 → 双阈值滞后连接），线条效果最细腻
   - 线条颜色、背景颜色、判定阈值均可自定义，可以输出白底黑线、黑底白线等各种风格的线稿

输出支持 `BufferedImage`（`asImg`）和保存文件（`asFile`）两种方式。

**系列文章**

- [1.图片风格化处理](./01.图片风格化处理.md)：`PhotoOperateWrapper` 用法总览、素描/边缘检测各算子逐一示例与效果说明、Canny 边缘检测原理简述

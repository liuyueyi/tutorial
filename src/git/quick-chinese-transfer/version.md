---
title: version
icon: class
order: 2
tag:
  - QuickChinese
categorie: 
  - Quick系列
date: 2022-08-08 12:26:49
---


::: info 版本记录

记录 quick-chinese-transfer 开源项目的版本迭代历史

:::

## 0.时间线

- Nov 12, 2026 发布 transfer-core `0.2.18`，新增 `s2twp` 台湾常用语转换，修复 #37 #38 #41
- Feb 25, 2026 发布 transfer-core `0.2.17`，修复繁转简「棋圣」「教廷」等问题
- Feb 12, 2025 发布 transfer-core `0.2.16`，新增自定义词库、自定义排除词加载（#18）
- Oct 21, 2024 发布 transfer-core `0.2.15`
- May 14, 2024 hanzi-writer 模块立项（`0.1.0`），支持汉字笔顺 SVG 生成与书写动画
- Apr 5, 2023 发布 transfer-core `0.2.13`
- Mar 23, 2023 发布 transfer-core `0.2.12`
- Feb 25, 2023 发布 transfer-core `0.2.11`
- Jan 16, 2023 发布 transfer-core `0.2.10`
- Jan 1, 2023 发布 transfer-core `0.2.9`
- Sep 15, 2022 发布 transfer-core `0.2.7`
- Aug 11, 2022 发布 transfer-core `0.2.6`，首次输出配套使用教程
- Jun 6, 2022 发布 transfer-core `0.2.5`，支持词典异步预加载、卸载
- Dec 17, 2021 发布 transfer-core `0.2.4`
- Aug 7, 2021 发布 transfer-core `0.2.3`
- Jul 15, 2021 发布 transfer-core `0.2.2`
- May 30, 2021 发布 transfer-core `0.2.1`
- May 14, 2021 发布 transfer-core `0.2.0`，修复链式转换
- Nov 30, 2020 发布 transfer-core `0.1.1` / `0.1.2`
- Nov 23, 2020 项目立项，发布 transfer-core `0.1.0`，提供简繁转换能力

## 1. 版本记录

### 1.1 transfer-core（简繁转换，artifactId: quick-transfer-core）

当前最新版本：`0.2.18`

<details> <summary>版本历史</summary>

1. **0.2.18**（Nov 12, 2026）

    - 新增 `s2twp`（简体→台湾繁体，字形 + 台湾常用词汇，对应 OpenCC `s2twp.json`）
    - [#37 「新力」被自动转换成「索尼」](https://github.com/liuyueyi/quick-chinese-transfer/issues/37)
    - [#38 繁转简：多士->吐司 数位->数码](https://github.com/liuyueyi/quick-chinese-transfer/issues/38)
    - [#41 希望新增（简体 -> 台湾正体字形）](https://github.com/liuyueyi/quick-chinese-transfer/issues/41)

2. **0.2.17**（Feb 25, 2026）

    - [#31「棋圣」和「碁圣」繁体转简体问题处理](https://github.com/liuyueyi/quick-chinese-transfer/issues/31)
    - [#26 繁体转简体会将"教廷"转换为"梵蒂冈"](https://github.com/liuyueyi/quick-chinese-transfer/issues/26)

3. **0.2.16**（Feb 12, 2025）

    - [#18 新增自定义词库加载，自定义排除词加载](https://github.com/liuyueyi/quick-chinese-transfer/issues/18)

4. **0.2.15**（Oct 21, 2024）

    - [#23 繁简转换问题](https://github.com/liuyueyi/quick-chinese-transfer/issues/23)

5. **0.2.14**

    - [#17 繁简转换问题](https://github.com/liuyueyi/quick-chinese-transfer/issues/17)
    - [#19 繁简转换问题](https://github.com/liuyueyi/quick-chinese-transfer/issues/19)

6. **0.2.13**（Apr 5, 2023）

    - [#15 那么"标致"和"溜"繁简转换问题](https://github.com/liuyueyi/quick-chinese-transfer/issues/15)

7. **0.2.12**（Mar 23, 2023）

    - [#14 那么"繁简转换问题](https://github.com/liuyueyi/quick-chinese-transfer/issues/14)

8. **0.2.11**（Feb 25, 2023）

    - [#13 "福斯"繁简转换问题](https://github.com/liuyueyi/quick-chinese-transfer/issues/13)

9. **0.2.10**（Jan 16, 2023）

    - [#12 快取 高速缓存](https://github.com/liuyueyi/quick-chinese-transfer/issues/12)

10. **0.2.9**（Jan 1, 2023）

    - [#11 娘 对象 签简体转繁体](https://github.com/liuyueyi/quick-chinese-transfer/issues/11)

11. **0.2.8**

    - [#10 翻转简 洛哈=>洛哈特](https://github.com/liuyueyi/quick-chinese-transfer/issues/10)

12. **0.2.7**（Sep 15, 2022）

    - [#9 繁转简 通道会变信道](https://github.com/liuyueyi/quick-chinese-transfer/issues/9)

13. **0.2.6**（Aug 11, 2022）

    - [#8 繁转简： 那個人=>神秘人](https://github.com/liuyueyi/quick-chinese-transfer/issues/8)

14. **0.2.5**（Jun 6, 2022）

    - 删除 `唇<=>脣` 简繁转换（[#6](https://github.com/liuyueyi/quick-chinese-transfer/issues/6)）
    - 支持同步/异步预加载词典、卸载词典（[#7](https://github.com/liuyueyi/quick-chinese-transfer/issues/7)）

15. **0.2.4**（Dec 17, 2021）

    - 繁体转简体：[#5 骼 繁转简错误](https://github.com/liuyueyi/quick-chinese-transfer/issues/5)

16. **0.2.3**（Aug 7, 2021）

    - 繁体转简体：[#4 乾 繁转简错误](https://github.com/liuyueyi/quick-chinese-transfer/issues/4)

17. **0.2.2**（Jul 15, 2021）

    - 繁转简：[#3 克拉转成克拉布](https://github.com/liuyueyi/quick-chinese-transfer/issues/3)

18. **0.2.1**（May 30, 2021）

    - 繁转简：fix 奔驰、奶油、黄油转换异常

19. **0.2.0**（May 14, 2021）

    - 修复链式转换

20. **0.1.0 ~ 0.1.3**（Nov 2020 ~ Dec 2020）

    - 简繁转换首版发布

</details>

### 1.2 hanzi-writer（汉字笔顺，artifactId: hanzi-writer）

当前最新版本：`0.1.1`

<details> <summary>版本历史</summary>

1. **0.1.1**

    - 新增 GitHub Action，实现自动上传 jar 包到中央仓库（详见教程：[3. GitHub Action 自动发布 Maven 中央仓库](./03.GithubAction自动发布Maven中央仓库.md)）

2. **0.1.0**（May 14, 2024）

    - 完成初始版本：汉字笔顺 SVG 生成（田字格 / 描边 / 笔顺编号 / 逐笔拆分 / 书写动画）
    - 基于 `hanzi-writer` 开源字库数据（9574 个汉字）

</details>

### 1.3 发布方式

- 新版中央仓管理地址：[central.sonatype.com](https://central.sonatype.com/)
- 基于 GitHub Action 自动上传 jar 包到中央仓库，按发布分支区分模块：
    1. `hanzi` 分支：推送 hanzi-writer 模块到中央仓库
    2. `transfer` 分支：推送 transfer-core 模块到中央仓库
    3. `release` 分支：整个项目推送到中央仓库
- 具体实现见教程：[3. GitHub Action 自动发布 Maven 中央仓库](./03.GithubAction自动发布Maven中央仓库.md)

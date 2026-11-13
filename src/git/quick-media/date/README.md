---
title: date-plugin
order: 9
index: true
icon: folder
---

# date-plugin 农历工具

> date-plugin 是 QuickMedia 多媒体工具箱中的公历/农历转换插件，纯 Java 实现、零第三方依赖，核心是两个工具类：`ChineseDateTool` 负责公历与农历之间的相互转换，`ChineseDateExtendTool` 在转换的基础上封装了干支纪年、生肖风格的大写月日、十二时辰等中文输出，几行代码就能拿到 `己亥年伍月壹捌 辰时` 这种生辰八字风格的日期描述。

## 能力清单

- **公历转农历**：`ChineseDateTool.solarToLunar(Solar)`，输出农历年、月、日，并带闰月标记 `isleap`
- **农历转公历**：`ChineseDateTool.lunarToSolar(Lunar)`，与上面的转换可逆
- **干支纪年**：`lunarYearToGanZhi`，输出如 `己亥年`
- **农历月/日中文输出**：`lunarMonthToChinese`、`lunarDayToChinese`，输出如 `伍月`、`壹捌`，闰月自动加前缀
- **十二时辰**：`hourToChinese`，24 小时制转 `辰时` 这种传统时辰说法
- **开箱即用的组合方法**：`getNowLunarDate()`（当前时间转生辰八字风格）、`getLunarDateByTimestamp()`（毫秒时间戳转农历描述）、`parseLunar()`（Lunar 对象转字符串）

## 相关文章

- [公历与农历互转](./01.公历与农历互转.md)

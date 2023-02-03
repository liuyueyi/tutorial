import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "spring",
      icon: "leaf",
      prefix: "spring/",
      collapsible: true,
      children: [
        "basic", "db", "search", "web", "middle", "mq", "cloud", "security", "extend"
      ]
    }
  ],
  "/git/": [
    {
      text: "quick-media",
      icon: "github",
      prefix: "quick-media/",
      children: "structure",
    },
    {
      text: "quick-chinese-transfer",
      icon: "github",
      prefix: "quick-chinese-transfer/",
      children: "structure"
    },
  ],
  "/spring/basic/": [
    "",
    {
      text: "基础配置",
      collapsible: true,
      prefix: "配置/",
      children: "structure"
    },
    {
      text: "AOP专题",
      collapsible: true,
      prefix: "AOP/",
      children: "structure"
    },
    {
      text: "Bean工厂",
      collapsible: true,
      prefix: "Bean/",
      children: "structure"
    },
    {
      text: "SpEL表达式",
      collapsible: true,
      prefix: "SpEL/",
      children: "structure"
    },
    {
      text: "消息事件",
      collapsible: true,
      prefix: "事件/",
      children: "structure"
    },
    {
      text: "国际化",
      collapsible: true,
      prefix: "国际化/",
      children: "structure"
    },
    {
      text: "定时器",
      collapsible: true,
      prefix: "定时器/",
      children: "structure"
    },
    {
      text: "日志",
      collapsible: true,
      prefix: "日志/",
      children: "structure"
    },
    {
      text: "实战系列",
      collapsible: true,
      prefix: "实战/",
      children: "structure"
    },
  ],
  "/spring/db/": [
    "",
    {
      text: "H2Database",
      collapsible: true,
      prefix: "H2Database/",
      children: "structure"
    },
    {
      text: "JPA",
      collapsible: true,
      prefix: "JPA/",
      children: "structure"
    },
    {
      text: "JdbcTemplate",
      collapsible: true,
      prefix: "JdbcTemplate/",
      children: "structure"
    },
    {
      text: "Jooq",
      collapsible: true,
      prefix: "Jooq/",
      children: "structure"
    },
    {
      text: "MyBatis",
      collapsible: true,
      prefix: "Mybatis/",
      children: "structure"
    },
    {
      text: "事务",
      collapsible: true,
      prefix: "事务/",
      children: "structure"
    },
    {
      text: "MongoDB",
      collapsible: true,
      prefix: "MongoDB/",
      children: "structure"
    },
    {
      text: "Redis",
      collapsible: true,
      prefix: "Redis/",
      children: "structure"
    },
    {
      text: "实战系列",
      collapsible: true,
      prefix: "实例/",
      children: "structure"
    },
  ],
  "/spring/mq/": [
    "",
  ],
  "/spring/web/": [
    "",
  ],
  "/spring/search/": [
    "",
  ],
  "/spring/middle/": [
    "",
  ],
  "/spring/cloud/": [
    "",
  ],
  "/spring/security/": [
    "",
  ],
  "/spring/extend/": [
    "",
  ],
});

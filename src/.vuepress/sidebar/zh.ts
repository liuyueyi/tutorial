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
  "/java/": [
    "",
    {
      text: "编程小技巧",
      icon: "process",
      prefix: "skill/",
      children: "structure",
    },
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
     {
      text: "RabbitMQ",
      collapsible: true,
      prefix: "RabbitMQ/",
      children: "structure"
    },
  ],
  "/spring/web/": [
    "",
    {
      text: "Web请求知识点",
      collapsible: true,
      prefix: "Request/",
      children: "structure"
    },
    {
      text: "Web花样返回",
      collapsible: true,
      prefix: "Response/",
      children: "structure"
    },
    {
      text: "RestTemplate",
      collapsible: true,
      prefix: "RestTemplate/",
      children: "structure"
    },
    {
      text: "WebClient",
      collapsible: true,
      prefix: "WebClient/",
      children: "structure"
    },
    {
      text: "WebFlux",
      collapsible: true,
      prefix: "WebFlux/",
      children: "structure"
    },
    {
      text: "WebSocket",
      collapsible: true,
      prefix: "WebSocket/",
      children: "structure"
    },
    {
      text: "Web三剑客",
      collapsible: true,
      prefix: "Web三剑客/",
      children: "structure"
    },
    {
      text: "Web实战演示",
      collapsible: true,
      prefix: "实例/",
      children: "structure"
    },
    {
      text: "Web踩坑日记簿",
      collapsible: true,
      prefix: "其他/",
      children: "structure"
    },
  ],
  "/spring/search/": [
    "",
    {
      text: "Solr",
      collapsible: true,
      prefix: "Solr/",
      children: "structure"
    },
    {
      text: "ElasticSearch",
      collapsible: true,
      prefix: "ElasticSearch/",
      children: "structure"
    },
  ],
  "/spring/middle/": [
    "",
    {
      text: "Email",
      collapsible: true,
      prefix: "Email/",
      children: "structure"
    },
    {
      text: "Prometheus",
      collapsible: true,
      prefix: "Prometheus/",
      children: "structure"
    },
    {
      text: "ZooKeeper",
      collapsible: true,
      prefix: "ZooKeeper/",
      children: "structure"
    },
    {
      text: "Docker",
      collapsible: true,
      prefix: "Docker/",
      children: "structure"
    },
  ],
  "/spring/cloud/": [
    "",
    {
      text: "Eureka",
      collapsible: true,
      prefix: "Eureka/",
      children: "structure"
    },
    {
      text: "Feign",
      collapsible: true,
      prefix: "Feign/",
      children: "structure"
    },
  ],
  "/spring/security/": [
    "",
    {
      text: "基础教程",
      collapsible: true,
      prefix: "basic/",
      children: "structure"
    },
  ],
  "/spring/extend/": [
    "",
  ],
});

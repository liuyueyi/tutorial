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

  "/column/": [
      "",
      {
        text: "专栏",
        prefix: "",
        collapsible: false,
        children: [ "tech/", "app/", "arch/"],
      },
  ],

  "/column/tech/": [
      "",
      {
        text: "技术管理",
        icon: "people",
        prefix: "manager/",
        collapsible: true,
        children: "structure",
      },
  ],

  "/column/app/": [
    "",
    {
      text: "架构",
      icon: "define",
      prefix: "",
      children: [
        {
          text: "实时聊天",
          icon: "wechat",
          prefix: "im/",
          collapsible: true,
          children: "structure",
        },
        {
          text: "预警",
          icon: "at",
          prefix: "alarm/",
          collapsible: true,
          children: "structure",
        },
        {
          text: "SPI",
          icon: "app",
          prefix: "spi/",
          collapsible: true,
          children: "structure",
        },
        {
          text: "trace-watch-dog",
          icon: "relation",
          prefix: "trace-watch-dog/",
          collapsible: true,
          children: "structure",
        },
      ],
    },
  ],

  "/column/arch/": [
    "",
    {
      text: "架构",
      icon: "define",
      prefix: "",
      collapsible: true,
      children: [
        {
          text: "分布式专栏",
          icon: "tree",
          prefix: "distribute/",
          children: "structure",
        },
      ],
    },
  ],

  "/column/ai/": [
    "",
    {
      text: "AI",
      icon: "symbol",
      prefix: "",
      collapsible: true,
      children: [
        {
          text: "人人都是程序员",
          icon: "tree",
          prefix: "aicoding/",
          children: "structure",
        },
        {
          text: "AI游戏开发",
          icon: "tree",
          prefix: "aigame/",
          children: "structure",
        },
      ],
    },
  ],

  "/db/": [
    "",
    {
      text: "MySql",
      icon: "mysql",
      prefix: "mysql/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "MongoDB",
      icon: "file",
      prefix: "mongodb/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "influxdb",
      icon: "time",
      prefix: "influxdb/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "ClickHouse",
      icon: "OS",
      prefix: "clickhouse/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "Redis",
      icon: "cache",
      prefix: "redis/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "ElasticSearch",
      icon: "search",
      prefix: "es/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "RabbitMQ",
      icon: "notice",
      prefix: "rabbitmq/",
      collapsible: true,
      children: "structure",
    },
  ],
  "/java/": [
    "",
    {
      text: "基础使用",
      icon: "stack",
      prefix: "basic/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "编程小技巧",
      icon: "process",
      prefix: "skill/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "JDK源码",
      icon: "java",
      collapsible: true,
      children: "structure",
      prefix: "jdk/",
    },
    {
      text: "序列化",
      icon: "json",
      collapsible: true,
      children: "structure",
      prefix: "序列化/",
    },
     {
      text: "安全",
      icon: "lock",
      collapsible: true,
      children: "structure",
      prefix: "安全/",
    },
  ],
  "/codelan/": [
    "",
    {
      text: "kotlin",
      icon: "stack",
      prefix: "kotlin/",
      children: "structure",
      collapsible: true,
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
    {
      text: "MCP",
      icon: "github",
      prefix: "mcp/",
      children: "structure"
    },
  ],
  "/spring/extend/": [
    "",
    {
      text: "扩展点",
      icon: "process",
      prefix: "basic/",
      children: "structure",
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
      text: "缓存",
      collapsible: true,
      prefix: "缓存/",
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
    {
      text: "迭代记录",
      collapsible: true,
      prefix: "迭代/",
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
      text: "基础",
      collapsible: true,
      prefix: "基础/",
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
  "/tool/": [
    {
      text: "开发工具",
      prefix: "开发工具/",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Linux&Shell",
      prefix: "Linux/",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Git",
      prefix: "GIT/",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Docker",
      prefix: "Docker/",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Maven",
      prefix: "Maven/",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Nginx",
      prefix: "Nginx/",
      collapsible: true,
      children: "structure"
    },
    {
      text: "DevOps",
      prefix: "Devops/",
      collapsible: true,
      children: "structure"
    },
  ],
});

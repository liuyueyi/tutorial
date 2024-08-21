import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  {
    text: "Java",
    icon: "java",
    prefix: "/java/",
    children: [
      "",
       {
        text: "基础系列",
        prefix: "",
        children: ["basic/", "jdk/", "安全/", "序列化"],
      },
      {
        text: "编程实践",
        prefix: "skill/",
        children: [""],
      },
    ],
  },
  {
    text: "专栏",
    icon: "diagram",
    prefix: "/column/",
    children: [
      "",
      {
        text: "技术管理",
        prefix: "tech/",
        children: ["manager/"],
      },
      {
        text: "应用专栏",
        prefix: "app/",
        children: ["im/", "alarm/", "spi/", "trace-watch-dog/"],
      },
      {
        text: "架构",
        prefix: "arch/",
        children: ["distribute/"],
      },
    ],
  },
  {
    text: "Spring",
    icon: "leaf",
    prefix: "/spring/",
    children: [
      {
        text: "基础专栏",
        icon: "info",
        prefix: "basic/",
        children: [""],
      },
      {
        text: "数据库专栏",
        icon: "leaf",
        prefix: "db/",
        children: [""],
      },
      {
        text: "搜索专栏",
        icon: "search",
        prefix: "search/",
        children: [""],
      },
      {
        text: "消息队列专栏",
        icon: "app",
        prefix: "mq/",
        children: [""],
      },
      {
        text: "WEB MVC专栏",
        icon: "chrome",
        prefix: "web/",
        children: [""],
      },
      {
        text: "开源项目集成",
        icon: "change",
        prefix: "middle/",
        children: [""],
      },
      {
        text: "扩展专栏",
        icon: "extend",
        prefix: "extend/",
        children: [""],
      },
      {
        text: "Cloud",
        icon: "cycle",
        prefix: "cloud/",
        children: [""],
      },
      {
        text: "Security",
        icon: "lock",
        prefix: "security/",
        children: [""],
      },
    ],
  },
  {
    text: "数据库",
    icon: "view",
    prefix: "/db/",
    children: [
      "",
      {
        text: "MySql",
        prefix: "mysql/",
        children: [""],
      },
      {
        text: "MongoDB",
        prefix: "mongodb/",
        children: [""],
      },
      {
        text: "Influx",
        prefix: "influxdb/",
        children: [""],
      },
      {
        text: "ClickHouse",
        prefix: "clickhouse/",
        children: [""],
      },
      {
        text: "Redis",
        prefix: "redis/",
        children: [""],
      },
      {
        text: "ElasticSearch",
        prefix: "es/",
        children: [""],
      },
      {
        text: "RabbitMq",
        prefix: "rabbitmq/",
        children: [""],
      },
    ],
  },
  {
    text: "开源项目",
    icon: "github",
    prefix: "/git/",
    children: [
      {
        text: "Quick-Media",
        prefix: "quick-media/",
        children: ["qrcode", "svg", "image", "imagic", "photo", "markdown", "phantom", "audio", "date"],
      },
      {
        text: "Quick-Chinese",
        prefix: "quick-chinese-transfer",
        children: [""]
      }
    ]
  },
  {
    text: "工具|部署",
    icon: "tool",
    prefix: "/tool/",
    children: [ "开发工具", "GIT", "Linux", "Docker", "Maven", "Devops", "Nginx"]
  },
  { text: "百宝箱", icon: "tool", link: "https://tool.hhui.top/" },
  { text: "关于", icon: "valine", link: "/me/about-me" },
]);

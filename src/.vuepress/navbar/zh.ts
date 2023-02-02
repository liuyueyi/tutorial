import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  { text: "导航", icon: "discover", link: "/demo/" },
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
  { text: "工具箱", icon: "tool", link: "https://tool.hhui.top/" },
]);

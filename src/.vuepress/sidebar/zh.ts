import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "spring",
      icon: "leaf",
      prefix: "spring/",
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
  ],
  "/spring/db/": [
    "",
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

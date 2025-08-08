import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { searchProPlugin } from "vuepress-plugin-search-pro";

export default defineUserConfig({
  base: "/tutorial/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "一灰灰的站点",
      description: "一灰灰的全网知识站点",
    },
  },

  theme,
  head: [
      // meta
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "一灰灰blog" }],
    [
      "meta",
      {
        "http-equiv": "Cache-Control",
        content: "no-cache, no-store, must-revalidate",
      },
    ],
    ["meta", { "http-equiv": "Pragma", content: "no-cache" }],
    ["meta", { "http-equiv": "Expires", content: "0" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "Java基础, 多线程, JVM, 虚拟机, 数据库, MySQL, Spring, Redis, MyBatis, 系统设计, 分布式, RPC, 高可用, 高并发, 面试, 开源, GitHub, SpringAI, 大模型, LLM, 人工智能, AI",
      },
    ],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    // 添加百度统计
    [
      "script",
      {},
      `var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?f589900ec107bc271099156a209e58d5";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();`,
    ],
    // 添加谷歌广告
    [
      "script",
      {
         "data-ad-client": "ca-pub-5592000528061748",
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5592000528061748"
      },
    ],
    [
      "script",
      {},
      `(adsbygoogle = window.adsbygoogle || []).push({});`
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "/iconfont/iconfont.css",
      },
    ],
  ],

  shouldPrefetch: false,
  plugins: [
    searchProPlugin({
      // 索引全部内容
      indexContent: true,
      // 排除首页
      isSearchable: (page) => page.path !== "/",
      // 为分类和标签添加索引
      customFields: [
        {
          getter: (page) => page.frontmatter.category,
          formatter: "分类：$content",
        },
        {
          getter: (page) => page.frontmatter.tag,
          formatter: "标签：$content",
        },
        {
          getter: (page) => page.frontmatter.categorys,
          formatter: "分类：$content",
        },
        {
          getter: (page) => page.frontmatter.tags,
          formatter: "标签：$content",
        },
      ],
    }),
  ]
});

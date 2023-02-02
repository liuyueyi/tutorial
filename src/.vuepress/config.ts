import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "./",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "一灰灰的站点",
      description: "一灰灰的全网知识站点",
    },
  },

  theme,

  shouldPrefetch: false,
});

---
title: version
icon: class
order: 2
tag:
  - QuickMedia
categorie: 
  - Quick系列
date: 2022-08-08 12:26:49
---


::: info 版本记录

记录quick-media开源项目的版本变更历史

:::

## 0.时间线

- Aug 9, 2022 插件3.0升级，升级各种依赖，调整写法等
- Jul 29, 2021 二维码支持设置图片资源
- Jan 14, 2021 二维码前置图支持
- Nov 30, 2020 代码提交中央仓库
- Nov 8, 2019 动态二维码支持
- Jun 20, 2019 插件2.0版本提供
- Jun 19, 2019 添加项目主页，基于doscify搭建的简易项目主页
- Mar 13, 2019 二维码插件个性化定制升级，实现各种几何样式的二维码生成，并支持颜色、logo相关指定设置
- Apr 17, 2018 imagemagic-plugin 插件完成，提供对image-magic的调用封装，实现对图片的各种编辑功能
- Mar 30, 2018 首个web工程，提供对各插件的使用demo
- Mar 27, 2018 各插件提供使用说明文档
- Jan 14, 2018 svg-plugin 插件诞生，实现svg渲染输出图片，首次支持的就是我个人目前沿用至今的博文宣传图
- 2017.12.03 markdown-plugin 插件诞生，实现markdown与html的互转，实现html渲染输出图片的功能支持
- 2017.12.01 phamtomjs-plugin 插件诞生，封装phantomjs，其诞生主要目的就是为了支持html渲染输出图片
- 2017.11.11 image-plugin 插件提供水印生成功能
- 2017.09.18 date-plugin 插件立项，支持阴历、阳历的互转
- 2017.09.15 image-plugin 扩展，支持生成动图，第一个支持特效为打字机的动图
- 2017.08.18 image-plugin 图片合成插件立项，旨在提供一个便捷的基于java的图片合成编辑功能
- 2017.07.18 qrcode-plugin 二维码插件正式立项，2017.08.13 个性二维码插件完成
- 2017.07.13 首次提交项目提交，第一个插件功能支持音频转码




## 1. 迭代记录

<details> <summary>tag历史</summary>

1. [v0.001](https://github.com/liuyueyi/quick-media/releases/tag/v0.001)

    - 实现音频转码服务
    - 实现二维码基础服务，完成基于zxing的二维码深度定制
 
2. [v0.002](https://github.com/liuyueyi/quick-media/releases/tag/v0.002)

    - 重写zxing的二维码渲染逻辑，只使用二维码矩阵的生成逻辑，支持二维码的全面定制化

3. [v0.003](https://github.com/liuyueyi/quick-media/releases/tag/v0.003)

    - 长图文生成的支持

4. [v0.004](https://github.com/liuyueyi/quick-media/releases/tag/v0.004)
   
   - markdown 语法文本转html， 转image

5. [v0.005](https://github.com/liuyueyi/quick-media/releases/tag/v0.005)

    - fix markdown 转图片中文乱码
    - 图片合成服务支持
    - 微信小程序（图文小工具）服务端源码

6. [v0.006](https://github.com/liuyueyi/quick-media/releases/tag/v0.006)

    - svg渲染支持
    - 利用phantomjs实现html渲染
    - 实现应用网站搭建

7. [v0.007](https://github.com/liuyueyi/quick-media/releases/tag/v0.007)

    - 结构调整

8. [v0.008](https://github.com/liuyueyi/quick-media/releases/tag/v0.008)

    - 实现imagic-plugin插件，封装imagic-magic使用姿势
    - 完成图片旋转、裁剪、压缩等基本功能

9. [v1.0](https://github.com/liuyueyi/quick-media/releases/tag/v1.0)
    
    - 第一个相对稳定的正式版本
    - 全线插件，升级版本为 `2.0`

10. [2.2](https://github.com/liuyueyi/quick-media/releases/tag/2.2)
    - 升级springboot版本
    - qrcode升级2.2
    - 开启 `jitpack` maven仓库依赖
    
11. [2.4](https://github.com/liuyueyi/quick-media/releases/tag/v2.4)
    - 升级 collections-utils 3.2.2
    - 升级 guava
    - qrcode升级2.4
        - 支持圆形logo
        - 支持文字二维码
        - 重写几何二维码渲染逻辑，与图片渲染逻辑保持一致

12. [2.4.1](https://github.com/liuyueyi/quick-media/releases/tag/2.4.1)
    - qrcode升级2.4.1
        - 文字二维码支持随机+顺序两种渲染模式

13. [2.4.2](https://github.com/liuyueyi/quick-media/releases/tag/2.4.2)
    - qrcode升级2.4.2
        - fix [#74](https://github.com/liuyueyi/quick-media/issues/74) 优化logo锯齿严重问题
        - fix [#75](https://github.com/liuyueyi/quick-media/issues/75)  指定二维码0/1渲染图片时，且不指定探测图形时，0点渲染逻辑bug

14. [2.5](https://github.com/liuyueyi/quick-media/releases/tag/2.5)
    - 所有插件升级 2.5
    - 移除lombok依赖
    - image-plugin:
        - RectCell: 矩形样式支持
        - RectFillCell: 支持圆角绘制

15. [2.5.1](https://github.com/liuyueyi/quick-media/releases/tag/2.5.1)
    - qrcode升级2.5.1，修复非矩形logo绘制问题

16. [2.5.2](https://github.com/liuyueyi/quick-media/releases/tag/2.5.2)
    - qrcode升级2.5.2
    - 新增二维码圆角设置  -> [使用姿势](https://liuyueyi.github.io/quick-media/#/%E6%8F%92%E4%BB%B6/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E4%BA%8C%E7%BB%B4%E7%A0%81%E6%8F%92%E4%BB%B6%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C?id=a-%e5%9f%ba%e6%9c%ac%e4%ba%8c%e7%bb%b4%e7%a0%81)
    - 新增背景图圆角/圆形设置 -> [使用姿势](https://liuyueyi.github.io/quick-media/#/%E6%8F%92%E4%BB%B6/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E4%BA%8C%E7%BB%B4%E7%A0%81%E6%8F%92%E4%BB%B6%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C?id=d-%e6%8c%87%e5%ae%9a%e8%83%8c%e6%99%af%e5%9b%be)

17. [2.5.3](https://github.com/liuyueyi/quick-media/releases/tag/2.5.3)
    - qrcode升级2.5.3
        - 新增前置图渲染 -> [前置图](https://liuyueyi.github.io/quick-media/#/%E6%8F%92%E4%BB%B6/%E4%BA%8C%E7%BB%B4%E7%A0%81/%E4%BA%8C%E7%BB%B4%E7%A0%81%E6%8F%92%E4%BB%B6%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C?id=i-%e5%89%8d%e7%bd%ae%e5%9b%be)
        - 支持二维码周边添加渲染逻辑了
    - 其他插件 2.5.1
        - base-plugin
            - 修复win文件保存时npe问题
            - GraphicUtil 功能扩展，新增创建图片时，指定填充色
        - image-plugin
            - 修复文字竖排渲染bug
18. [2.5.4](https://github.com/liuyueyi/quick-media/releases/tag/2.5.4)
    - qrcode升级2.5.4
        - 修复二维码前置渲染模板为gif时的bug

19. [2.6.0](https://github.com/liuyueyi/quick-media/releases/tag/2.6.0)
    - 全线升级2.6.0
    - base-plugin:
        - GraphicUtil 新增 scaleImage 方法
    - qrcode-plugin:
        - 支持mini_rect二维码
20. [2.6.1](https://github.com/liuyueyi/quick-media/releases/tag/2.6.1)
    - 全线升级2.6.1
    - 修复io流未关闭bug
21. [2.6.3](https://github.com/liuyueyi/quick-media/releases/tag/2.6.3)
    - 全线升级2.6.3
    - base-plugin
        - FileWriteUtil新增写文本方法
    - image-plugin:
        - 新增图片像素化处理封装类 ImgPixelWrapper
        - 图片灰度化
        - 图片像素化
        - 图片转字符图
        - 图片生成字符数组
        - 位图转矢量图
    - qrcode-plugin
        - 升级图片渲染IMG_V2，支持更灵活的图片渲染方式

</details>

## 2. 版本说明

> 因为之前过于随意，没有记录下版本对应的改动，在2.0版本之前干了些，也不记得了...
>
> 后续的版本说明，尽量规范整齐🤕🤕🤕

<font color="red">

2020.11.29日，quick-media项目已提交到maven中央仓库，因此所有的最新版本可以直接导入依赖，不需要指定额外的源

</font>

### 2.1 audio-plugin

> 最新版本 3.0.0

- [audio插件版本历史](../version/audio-version)


---

### 2.2 date-plugin

> 最新版本 3.0.0

- [date插件版本历史](../version/date-version)

---


### 2.3 image-plugin

> 最新版本 3.0.0

- [image插件版本历史](../version/image-version)


--- 

### 2.4 imagic-plugin


> 最新版本 3.0.0

- [imagic插件版本历史](../version/imagic-version)


---

### 2.5 markdown-plugin

> 最新版本 3.0.0

- [markdown插件版本历史](../version/markdown-version)



---

### 2.6 phantom-plugin

> 最新版本 3.0.0

- [phantom插件版本历史](../version/phantom-version)


---

### 2.7 qrcode-plugin

> 最新版本 3.0.0

- [QrCode插件版本历史](../version/qrcode-version)


---

### 2.8 svg-plugin

> 最新版本 3.0.0

- [svg插件版本历史](../version/svg-version)


---

### 2.9 svg-plugin

> 最新版本 3.0.0

- [photo插件版本历史](../version/photo-version)


## 3. 最新版本

下面提供当前所有插件的最新版本，同步更新，在引入之前，先添加repository地址

### a. 中央仓库导入

中央仓库所在地址: [https://mvnrepository.com/artifact/com.github.liuyueyi.media](https://mvnrepository.com/artifact/com.github.liuyueyi.media)

**对应版本情况**


<table>
    <tr>
        <th>插件</th>
        <th>最新版本</th>
        <th>中央仓库地址</th>
        <th>说明</th>
    </tr>
    <tr>
        <td><code>audio-plugin</code></td>
        <td><textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">
<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>audio-plugin</artifactId>
</dependency>
            </textarea></td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/audio-plugin" target="_blank">超链</a></td>
        <td>音频转码</td>
    </tr>
    <tr>
        <td><code>date-plugin</code></td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">

<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>date-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/date-plugin" target="_blank">超链</a></td>
        <td>公历/农历互转</td>
    </tr>
    <tr>
        <td>
            <code>image-plugin</code>
        </td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">

<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>image-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/image-plugin" target="_blank">超链</a></td>
        <td>基于jdk图片合成</td>
    </tr>
    <tr>
        <td>
            <code>imagic-plugin</code>
        </td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">

<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>imagic-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/imagic-plugin" target="_blank">超链</a></td>
        <td>imageMagic图片编辑封装插件</td>
    </tr>
    <tr>
        <td><code>markdown-plugin</code></td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">

<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>markdown-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/markdown-plugin" target="_blank">超链</a></td>
        <td>markdown2html, html2image</td>
    </tr>
    <tr>
        <td>
            <code>phantom-plugin</code>
        </td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">

<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>phantom-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/phantom-plugin" target="_blank">超链</a></td>
        <td>phatomjs封装</td>
    </tr>
    <tr>
        <td>
            <code>qrcode-plugin</code>
        </td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">

<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>qrcode-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/qrcode-plugin" target="_blank">超链</a></td>
        <td>二维码生成解码</td>
    </tr>
    <tr>
        <td>
            <code>svg-plugin</code>
        </td>
        <td>
            <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">
<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>svg-plugin</artifactId>
</dependency>
            </textarea>
        </td>
        <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/svg-plugin" target="_blank">超链</a></td>
        <td>svg渲染</td>
    </tr>
   <tr>
    <td>
        <code>photo-plugin</code>
    </td>
    <td>
        <textarea v-pre="" data-lang="xml" style="resize:none;width: 350px;height: 200px;border: none;background-color: #ff000000;" disabled="disabled">
<dependency>
    <groupId>com.github.liuyueyi.media</groupId>
    <artifactId>photo-plugin</artifactId>
</dependency>
        </textarea>
    </td>
    <td><a href="https://mvnrepository.com/artifact/com.github.liuyueyi.media/photo-plugin" target="_blank">超链</a></td>
    <td>相片滤镜、处理</td>
</tr>
</table>


### b. jitpack 仓库

使用jitpack仓库时，同样需要添加仓库地址

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
```

当前最新的版本为`3.0.0`，如依赖所有的包

```xml
<!-- 添加所有的包依赖 -->
<dependency>
    <groupId>com.github.liuyueyi</groupId>
    <artifactId>quick-media</artifactId>
    <version>3.0.0</version>
</dependency>
```

如果只想依赖部分的包, 可以按需添加依赖，注意最新的版本都是`3.0.0`

```xml
<!-- 下面以二维码包举例说明 -->
<dependency>
    <groupId>com.github.liuyueyi.quick-media</groupId>
    <artifactId>qrcode-plugin</artifactId>
    <version>3.0.0</version>
</dependency>
```

**如果idea下载jar包失败，请不妨在控制台直接使用`mvn clean install -DskipTests=true`，可能有奇迹发生哦**
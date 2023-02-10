---
order: 1
title: 1.文件上传异常之提示The temporary upload location xxx is not valid（填坑篇）
tag: 
  - Web
category: 
  - SpringBoot
  - WEB系列
  - 采坑记录
date: 2019-02-13 22:26:21
keywords: SpringBoot,文件上传,tomcat
---

SpringBoot搭建的应用，一直工作得好好的，突然发现上传文件失败，提示`org.springframework.web.multipart.MultipartException: Failed to parse multipart servlet request; nested exception is java.io.IOException: The temporary upload location [/tmp/tomcat.6239989728636105816.19530/work/Tomcat/localhost/ROOT] is not valid`目录非法，实际查看目录，结果还真没有，下面就这个问题的表现，分析下SpringBoot针对文件上传的处理过程

<!-- more -->

## I. 问题分析

### 0. 堆栈分析

问题定位，最佳的辅助手段就是堆栈分析，首先捞出核心的堆栈信息

```
org.springframework.web.multipart.MultipartException: Failed to parse multipart servlet request; nested exception is java.io.IOException: The temporary upload location [/tmp/tomcat.6239989728636105816.19530/work/Tomcat/localhost/ROOT] is not valid
        at org.springframework.web.multipart.support.StandardMultipartHttpServletRequest.handleParseFailure(StandardMultipartHttpServletRequest.java:122)
        at org.springframework.web.multipart.support.StandardMultipartHttpServletRequest.parseRequest(StandardMultipartHttpServletRequest.java:113)
        at org.springframework.web.multipart.support.StandardMultipartHttpServletRequest.<init>(StandardMultipartHttpServletRequest.java:86)
        at org.springframework.web.multipart.support.StandardServletMultipartResolver.resolveMultipart(StandardServletMultipartResolver.java:93)
        at org.springframework.web.servlet.DispatcherServlet.checkMultipart(DispatcherServlet.java:1128)
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:960)
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:925)
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:974)
        at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:877)
        at javax.servlet.http.HttpServlet.service(HttpServlet.java:661)
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:851)
        at javax.servlet.http.HttpServlet.service(HttpServlet.java:742)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:231)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166)
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:52)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193)
```

从堆栈内容来看，问题比较清晰，目录非法，根据path路径，进入目录，结果发现，没有这个目录，那么问题的关键就是没有目录为什么会导致异常了，这个目录到底有啥用

先简单描述下上面的原因，上传的文件会缓存到本地磁盘，而缓存的路径就是上面的`/tmp/tomcat.6239989728636105816.19530/work/Tomcat/localhost/ROOT`，接着引入的疑问就是：

- 为什么上传的文件要缓存到本地
- 为什么临时目录会不存在
- 什么地方实现文件缓存

### 1. 场景模拟

要确认上面的问题，最直观的方法就是撸源码，直接看代码就有点蛋疼了，接下来采用debug方式来层层剥离，看下根源再哪里。

首先是搭建一个简单的测试项目，进行场景复现, 首先创建一个接收文件上传的Controller，如下

```java
@RestController
@RequestMapping(path = "/file")
public class FileUploadRest {

    /**
     * 保存上传的文件
     *
     * @param file
     * @return
     */
    private String saveFileToLocal(MultipartFile file) {
        try {
            String name = "/tmp/out_" + System.currentTimeMillis() + file.getName();
            FileOutputStream writer = new FileOutputStream(new File(name));
            writer.write(file.getBytes());
            writer.flush();
            writer.close();
            return name;
        } catch (Exception e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }

    @PostMapping(path = "upload")
    public String upload(@RequestParam("file") MultipartFile file) {
        String ans = saveFileToLocal(file);
        return ans;
    }
}
```

其次就是使用curl来上传文件

```bash
curl http://127.0.0.1:8080/file/upload -F "file=@/Users/user/Desktop/demo.jpg" -v
```

然后在接收文件上传的方法中开启断点，注意下面红框中的 `location`, 就是文件上传的临时目录

![IMAGE](/imgs/190213/00.jpg)


### 2. 源码定位

上面的截图可以确认确实将上传的文件保存到了临时目录，验证方式就是进入那个目录进行查看，会看到一个tmp文件，接下来我们需要确定的是在什么地方，实现将数据缓存到本地的。

注意下图，左边红框是这次请求的完整链路，我们可以通过逆推链路，去定位可能实现文件缓存的地方

![IMAGE](/imgs/190213/01.jpg)

如果对spring和tomcat的源码不熟的话，也没什么特别的好办法，从上面的链路中，多打一些断点，采用传说中的二分定位方法来缩小范围。

通过最开始的request对象和后面的request对象分析，发现一个可以作为参考标准的就是上图中右边红框的`request#parts`属性；开始是null，文件保存之后则会有数据，下面给一个最终定位的动图

![2.gif](/imgs/190213/02.gif)

所以关键就是`org.springframework.web.filter.HiddenHttpMethodFilter#doFilterInternal` 中的 `String paramValue = request.getParameter(this.methodParam);` 这一行代码

![IMAGE](/imgs/190213/03.jpg)

到这里在单步进去，主要的焦点将集中在 `org.apache.catalina.connector.Request#parseParts`

![IMAGE](/imgs/190213/04.jpg)

进入上面方法的逻辑，很容易找到具体的实现位置 `org.apache.tomcat.util.http.fileupload.FileUploadBase#parseRequest`，这个方法的实现比较有意思，有必要贴出来看一下

```java
public List<FileItem> parseRequest(RequestContext ctx)
        throws FileUploadException {
    List<FileItem> items = new ArrayList<>();
    boolean successful = false;
    try {
        FileItemIterator iter = getItemIterator(ctx);
        // 注意这里，文件工厂类，里面保存了临时目录的地址
        // 这个对象首次是在 org.apache.catalina.connector.Request#parseParts 方法的
        FileItemFactory fac = getFileItemFactory();
        if (fac == null) {
            throw new NullPointerException("No FileItemFactory has been set.");
        }
        while (iter.hasNext()) {
            final FileItemStream item = iter.next();
            // Don't use getName() here to prevent an InvalidFileNameException.
            final String fileName = ((FileItemIteratorImpl.FileItemStreamImpl) item).name;
            // 创建一个临时文件对象
            FileItem fileItem = fac.createItem(item.getFieldName(), item.getContentType(),
                                               item.isFormField(), fileName);
            items.add(fileItem);
            try {
                // 流的拷贝，这块代码也挺有意思，将输入流数据写入输出流
                // 后面会贴出源码，看下开源大佬们的玩法，和我们自己写的有啥区别
                Streams.copy(item.openStream(), fileItem.getOutputStream(), true);
            } catch (FileUploadIOException e) {
                throw (FileUploadException) e.getCause();
            } catch (IOException e) {
                throw new IOFileUploadException(String.format("Processing of %s request failed. %s",
                                                       MULTIPART_FORM_DATA, e.getMessage()), e);
            }
            final FileItemHeaders fih = item.getHeaders();
            fileItem.setHeaders(fih);
        }
        successful = true;
        return items;
    } catch (FileUploadIOException e) {
        throw (FileUploadException) e.getCause();
    } catch (IOException e) {
        throw new FileUploadException(e.getMessage(), e);
    } finally {
        if (!successful) {
            for (FileItem fileItem : items) {
                try {
                    fileItem.delete();
                } catch (Exception ignored) {
                    // ignored TODO perhaps add to tracker delete failure list somehow?
                }
            }
        }
    }
}
```

核心代码就两点，一个是文件工厂类，一个是流的拷贝；前者定义了我们的临时文件目录，也是我们解决前面问题的关键，换一个我自定义的目录永不删除，不就可以避免上面的问题了么；后面一个则是数据复用方面的

首先看下FileItemFactory的实例化位置，在`org.apache.catalina.connector.Request#parseParts`中，代码如下

![IMAGE](/imgs/190213/05.jpg)

具体的location实例化代码为

```java
// TEMPDIR = "javax.servlet.context.tempdir";
location = ((File) context.getServletContext().getAttribute(ServletContext.TEMPDIR));
```


### 3. 问题review

#### a. 解决问题

到上面，基本上就捞到了最终的问题，先看如何解决这个问题

**方法1**

- 应用重启

**方法2**

- 增加服务配置，自定义baseDir

```properties
server.tomcat.basedir=/tmp/tomcat
```

**方法3**

- 注入bean，手动配置临时目录

```java
@Bean
MultipartConfigElement multipartConfigElement() {
    MultipartConfigFactory factory = new MultipartConfigFactory();
    factory.setLocation("/tmp/tomcat");
    return factory.createMultipartConfig();
}
```

**方法4**

- 配置不删除tmp目录下的tomcat

```bash
vim /usr/lib/tmpfiles.d/tmp.conf

# 添加一行
x /tmp/tomcat.*
```

#### b. 流拷贝

tomcat中实现流的拷贝代码如下，`org.apache.tomcat.util.http.fileupload.util.Streams#copy(java.io.InputStream, java.io.OutputStream, boolean, byte[])` , 看下面的实现，直观影响就是写得真特么严谨

```java
public static long copy(InputStream inputStream,
            OutputStream outputStream, boolean closeOutputStream,
            byte[] buffer)
    throws IOException {
    OutputStream out = outputStream;
    InputStream in = inputStream;
    try {
        long total = 0;
        for (;;) {
            int res = in.read(buffer);
            if (res == -1) {
                break;
            }
            if (res > 0) {
                total += res;
                if (out != null) {
                    out.write(buffer, 0, res);
                }
            }
        }
        if (out != null) {
            if (closeOutputStream) {
                out.close();
            } else {
                out.flush();
            }
            out = null;
        }
        in.close();
        in = null;
        return total;
    } finally {
        IOUtils.closeQuietly(in);
        if (closeOutputStream) {
            IOUtils.closeQuietly(out);
        }
    }
}
```


### c. 自问自答

前面提出了几个问题，现在给一个简单的回答，因为篇幅问题，后面会单开一文，进行详细说明

#### 什么地方缓存文件

上面的定位过程给出答案，具体实现逻辑在 `org.apache.tomcat.util.http.fileupload.FileUploadBase#parseRequest`

#### 为什么目录会不存在

springboot启动时会创建一个/tmp/tomcat.*/work/Tomcat/localhost/ROOT的临时目录作为文件上传的临时目录，但是该目录会在n天之后被系统自动清理掉，这个清理是由linux操作系统完成的，具体的配置如下 `vim /usr/lib/tmpfiles.d/tmp.conf`

```conf
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

# See tmpfiles.d(5) for details

# Clear tmp directories separately, to make them easier to override
v /tmp 1777 root root 10d
v /var/tmp 1777 root root 30d

# Exclude namespace mountpoints created with PrivateTmp=yes
x /tmp/systemd-private-%b-*
X /tmp/systemd-private-%b-*/tmp
x /var/tmp/systemd-private-%b-*
X /var/tmp/systemd-private-%b-*/tmp
```

#### 为什么要缓存文件

因为流取一次消费之后，后面无法再从流中获取数据，所以缓存方便后续复用；这一块后面详细说明


### 4. 小结

定位这个问题的感觉，就是对SpringBoot和tomcat的底层，实在是不太熟悉，作为一个以Spring和tomcat吃饭的码农而言，发现问题就需要改正，列入todo列表，后续需要深入一下


## II. 其他

### 0. 项目

- 工程：[spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)


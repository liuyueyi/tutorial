---
order: 1
title: 1.整合docker镜像打包
tag: 
  - Docker
category: 
  - SpringBoot
  - 运维系列
  - Docker
date: 2021-03-04 19:27:54
keywords: docker spring springboot
---

SpringBoot项目整合docker，打包镜像工程演示

<!-- more -->

## I. 整合步骤

### 1. 基本环境

本项目借助`SpringBoot 2.2.1.RELEASE` + `maven 3.5.3` + `IDEA` + `MAC`进行开发

首先确保本机有安装docker，对于docker基本知识点，可以参考

- [Centos安装docker与使用说明](https://blog.hhui.top/hexblog/2019/12/06/191206-Centos%E5%AE%89%E8%A3%85docker%E4%B8%8E%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E/)
- [Docker 常用命令速查手册](https://blog.hhui.top/hexblog/2019/12/06/191206-Docker-%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4%E9%80%9F%E6%9F%A5%E6%89%8B%E5%86%8C/)

### 2. pom配置

创建一个基本的SpringBoot项目之后，关键是设置`pom.xml`文件，我们主要借助`docker-maven-plugin`来打镜像包

一个可用的配置如下

```xml
<artifactId>400-docker-demo</artifactId>

<properties>
    <docker.prefix>springboot</docker.prefix>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <fork>true</fork>
                <mainClass>com.git.hui.boot.docker.Application</mainClass>
            </configuration>
        </plugin>

        <!--加入maven插件 docker-maven-plugin -->
        <plugin>
            <groupId>com.spotify</groupId>
            <artifactId>docker-maven-plugin</artifactId>
            <version>0.4.13</version>
            <configuration>
                <!--镜像仓库源-->
                <imageName>${docker.prefix}/${project.artifactId}</imageName>
                <!--docker配置文件的路径-->
                <dockerDirectory>./</dockerDirectory>
                <resources>
                    <resource>
                        <targetPath>/</targetPath>
                        <directory>${project.build.directory}</directory>
                        <include>${project.build.finalName}.jar</include>
                    </resource>
                </resources>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 3. Dockerfile 文件

接下需要配置我们自己的dockerfile文件，在项目根目录下，新建文件名`Dockerfile`，如果路径有修改，需要调整上面pom配置中的`dockerDirectory`参数

```
FROM openjdk:8-jdk-alpine as builder
MAINTAINER yihui

# 创建工作目录
RUN mkdir -p /home/yihui/workspace/app
# 将jar拷贝过去
COPY /target/400-docker-demo-0.0.1-SNAPSHOT.jar /home/yihui/workspace/app/app.jar
# 将我们预期的文件拷贝过去
COPY /readme.md /home/yihui/workspace/app/readme.md
# 指定工作目录
WORKDIR /home/yihui/workspace/app
# 运行jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

关于dockerfile语法，可以参考

- [Docker Dockerfile语法说明](https://www.runoob.com/docker/docker-dockerfile.html)

我们上面的case，就是拉一个jdk8的运行环境，将打的jar包重命名为app.jar到指定目录，同时使用命令`java -jar app.jar`来启动应用

### 4. 测试demo

提供一个最基础的demo实例

```java
@SpringBootApplication
@RestController
public class Application {

    @GetMapping(path = {"", "/"})
    public String hello() {
        return "hello " + UUID.randomUUID();
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class);
    }
}
```

打包命令 `mvn clean package docker:build -DskipTests=true`


**注意**

- 打包的前提是docker已经启动了

打包成功之后，可以看到会多一个docker镜像

```bash
docker images
```

运行镜像并测试

```bash
# 运行
docker run -i -d --name ddemo -p 8080:8080 -t springboot/400-docker-demo
# 测试
curl 'http://127.0.0.1:8080'
```

![](/imgs/210304/00.jpg)

## II. 其他

### 0. 项目

- 工程：[https://github.com/liuyueyi/spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)
- 项目: [https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/400-docker-demo](https://github.com/liuyueyi/spring-boot-demo/tree/master/spring-boot/400-docker-demo)


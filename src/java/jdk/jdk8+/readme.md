---
title: jdk8+迭代记录
index: true
icon: java
---

> 这里记录JDK8+之后的新的特性

Java 8（2014年发布）到 Java 21（2023年发布）经历了多次迭代，新增了大量特性和改进。以下是主要版本（Java 9 到 Java 21）中值得关注的新特性分类整理：

---

### **一、语言特性改进**
1. **模块化系统（Java 9）**  
   - **Jigsaw 项目**：引入模块化（`module-info.java`），解决 JAR 依赖和封装问题，提升安全性和可维护性。

2. **局部变量类型推断（Java 10）**  
   - **`var` 关键字**：允许在局部变量声明时省略显式类型（如 `var list = new ArrayList<String>();`）。

3. **文本块（Java 15 正式支持）**  
   - **多行字符串**：使用 `""" ... """` 简化 HTML、JSON 等多行文本的编写。

4. **模式匹配（逐步引入）**  
   - **`instanceof` 模式匹配（Java 16）**：直接提取对象属性，如 `if (obj instanceof String s) { ... }`。  
   - **`switch` 表达式（Java 14）**：支持箭头语法和返回值，避免 `break` 的繁琐。  
   - **模式匹配 `switch`（Java 21 正式）**：支持类型匹配和复杂条件，例如：
     ```java
     switch (obj) {
         case Integer i -> System.out.println("Integer: " + i);
         case String s when s.length() > 5 -> System.out.println("Long string");
         default -> {}
     }
     ```

5. **记录类（Record，Java 16 正式）**  
   - 简化不可变数据类的定义，自动生成 `equals()`、`hashCode()` 等方法：
     ```java
     record Point(int x, int y) {}
     ```

6. **密封类（Sealed Classes，Java 17 正式）**  
   - 限制类的继承关系，明确子类范围：
     ```java
     public sealed class Shape permits Circle, Square {}
     ```

7. **字符串模板（Java 21 预览）**  
   - 类似其他语言的模板插值功能，例如：
     ```java
     String name = "John";
     String message = STR."Hello \{name}!";
     ```

---

### **二、API 增强**
1. **新的集合工厂方法（Java 9）**  
   - 快速创建不可变集合：`List.of("a", "b")`、`Set.of(1, 2)`、`Map.of("k", "v")`。

2. **Stream API 增强**  
   - **`takeWhile`/`dropWhile`（Java 9）**：根据条件截取流。  
   - **`Collectors.toUnmodifiableList()`（Java 10）**：生成不可变集合。

3. **HTTP/2 客户端（Java 11 正式）**  
   - 支持异步请求的现代 HTTP 客户端（`java.net.http.HttpClient`）。

4. **进程 API 改进（Java 9+）**  
   - 管理操作系统进程（如获取 PID、直接执行命令）。

5. **新的日期时间 API（Java 8 已有，后续优化）**  
   - `java.time` 包优化，例如 `LocalDate`、`ZonedDateTime` 等。

---

### **三、并发与性能**
1. **虚拟线程（Virtual Threads，Java 21 正式）**  
   - 轻量级线程（协程），显著提升高并发吞吐量，简化异步编程：
     ```java
     try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
         executor.submit(() -> System.out.println("Hello"));
     }
     ```

2. **结构化并发（Java 21 预览）**  
   - 通过 `StructuredTaskScope` 管理多个子任务的生命周期，避免资源泄漏。

3. **分代 ZGC（Java 21）**  
   - 低延迟垃圾收集器 ZGC 支持分代回收，减少内存占用。

4. **Shenandoah GC（Java 12+）**  
   - 另一种低停顿时间的垃圾收集器。

---

### **四、工具与 JVM 改进**
1. **JShell（Java 9）**  
   - 交互式 REPL 工具，快速测试代码片段。

2. **单文件源码运行（Java 11）**  
   - 直接运行 `.java` 文件（无需手动编译）：`java HelloWorld.java`。

3. **动态 CDS 存档（Java 13+）**  
   - 提升启动速度，通过共享类数据减少内存占用。

4. **Flight Recorder（JFR）开源（Java 11）**  
   - 生产环境性能监控工具，低开销收集 JVM 数据。

---

### **五、其他重要特性**
1. **`var` 支持 Lambda 参数（Java 11）**  
   - 允许在 Lambda 表达式中使用 `var` 声明参数。

2. **`@Deprecated` 增强（Java 9）**  
   - 标记 API 废弃状态和替代方案。

3. **接口私有方法（Java 9）**  
   - 在接口中定义私有方法，提升代码复用性。

4. **移除过时功能**  
   - 移除 Applet、Java Web Start、永久代（PermGen）等。

---

### **六、Java 21 核心特性总结**
Java 21 作为 LTS（长期支持版本），整合了此前多个预览特性，并重点优化了并发和内存管理：
- **虚拟线程**：彻底改变高并发编程模型。
- **分代 ZGC**：提升垃圾回收效率。
- **模式匹配**：简化条件分支代码。
- **字符串模板**：增强字符串处理能力。

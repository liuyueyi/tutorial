---
order: 2
title: 2.RestTemplate之urlencode参数解析异常全程分析（填坑篇）
tag: 
  - Web
  - RestTemplate
category: 
  - SpringBoot
  - WEB系列
  - 采坑记录
date: 2019-03-27 09:35:12
keywords: RestTemplate,URLEncode,Spring
---

对接外部的一个接口时，发现一个鬼畜的问题，一直提示缺少某个参数，同样的url，通过curl命令访问ok，但是改成RestTemplate请求就不行；因为提供接口的是外部的，所以也无法从服务端着手定位问题，特此记录下这个问题的定位以及解决过程

<!-- more -->

## I. 问题复现

首先我们是通过get请求访问服务端，参数直接拼接在url中；与我们常规的get请求有点不一样的是其中一个参数要求url编码之后传过去。

因为不知道服务端的实现，所以再事后定位到这个问题之后，反推了一个服务端可能实现方式

### 1. web服务模拟

模拟一个接口，要求必须传入accessKey，且这个参数必须和我们定义的一样（模拟身份标志，用户请求必须带上自己的accessKey, 且必须合法）

```java
@RestController
public class HelloRest {
    public final String ALLOW_KEY = "ASHJRK3LJFD+R32SADFLK+FASDJ=";

    @GetMapping(path = "access")
    public String access(String accessKey, String name) {
        System.out.println(accessKey + "|" + name) ;
        if (ALLOW_KEY.equals(accessKey)) {
            return "true";
        } else {
            return "false";
        }
    }
}
```

这个接口只支持get请求，把参数放在url中的时候，很明显这个accessKey需要编码


### 2. 访问验证

在拼接访问url时，首先对accessKey进行编码，得到一个访问的连接 `http://localhost:39531/access?accessKey=ASHJRK3LJFD%2BR32SADFLK%2BFASDJ%3D&name=yihuihui`

下面看下浏览器 + curl + restTemplate三种访问姿势的返回结果

浏览器访问结果：

![浏览器访问](/imgs/190327/00.jpg)

curl访问结果：

![curl访问](/imgs/190327/01.jpg)

restTemplate访问结果：

```java
@Test
public void testUrlEncode() {
    String url = "http://localhost:39531/access?accessKey=ASHJRK3LJFD%2BR32SADFLK%2BFASDJ%3D&name=yihuihui";
    RestTemplate restTemplate = new RestTemplate();
    String ans = restTemplate.getForObject(url, String.class);
    System.out.println(ans);
}
```

![restTemplate访问](/imgs/190327/02.jpg)

看到上面的输出，结果就很有意思了，同样的url为啥前面的访问没啥问题，换到RestTemplate就不对了？？？

## II. 问题定位分析

如果服务端的代码也在我们的掌控中，可以通过debug服务端，查看请求参数来定位问题；但是这个问题出现时，服务端不在掌握中，这个时候就只能从客户端出发，来推测可能出现问题的原因了；

接下来记录下我们定位这个问题的"盲人摸象"过程

### 1. 问题猜测

很容易怀疑问题出在url编码后的参数上，直接传这种编码后的url参数会不会解析有问题，既然编码之后不行，那就改成不编码试一试

```java
@Test
public void testUrlEncode() {
    String url = "http://localhost:39531/access?accessKey=ASHJRK3LJFD%2BR32SADFLK%2BFASDJ%3D&name=yihuihui";
    RestTemplate restTemplate = new RestTemplate();
    String ans = restTemplate.getForObject(url, String.class);
    System.out.println(ans);

    url = "http://localhost:39531/access?accessKey=ASHJRK3LJFD+R32SADFLK+FASDJ=&name=yihuihui";
    ans = restTemplate.getForObject(url, String.class);
    System.out.println(ans);
}
```

毫无疑问，访问依然失败，模拟case如下

![test case](/imgs/190327/03.jpg)

传编码后的不行，传编码之前的也不行，这就蛋疼了；接下来怎么办？换个http包试一试

接下来改用HttpClient访问，看下能不能正常访问

```java
@Test
public void testUrlEncode() throws IOException {
    String url = "http://localhost:39531/access?accessKey=ASHJRK3LJFD%2BR32SADFLK%2BFASDJ%3D&name=yihuihui";
    RestTemplate restTemplate = new RestTemplate();
    String ans = restTemplate.getForObject(url, String.class);
    System.out.println(ans);


    //创建httpclient对象
    CloseableHttpClient httpClient = HttpClients.createDefault();
    //创建请求方法的实例， 并指定请求url
    HttpGet httpget = new HttpGet(url);
    //获取http响应状态码
    CloseableHttpResponse response = httpClient.execute(httpget);
    HttpEntity entity = response.getEntity();
    //接收响应头
    String content = EntityUtils.toString(entity, "utf-8");
    System.out.println(httpget.getURI());
    System.out.println(content);
    httpClient.close();
}
```

输出结果如下，神器的一幕出现了，返回结果正常了

![httpclient](/imgs/190327/04.jpg)

到了这一步，基本上可以知道是RestTemplate的使用问题了，要么就是操作姿势不对，要么就是RestTemplate有什么潜规则是我们不知道的

### 2. 问题定位

同样的url，两种不同的包返回结果不一样，自然而然的就会想到对比下两个的实现方式了，看看哪里不同；如果对两个包的源码不太熟悉的话，想一下子定位都问题，并不容易，对这两个源码，我也是不熟的，不过因为巧和，没有深入到底层的实现就发现了疑是问题的关键点所在

首先看的RestTemplate的发起请求的逻辑，如下（下图中有关键点，单独看不太容易抓到）

![](/imgs/190327/05.jpg)

接下来再去debug HttpClient的请求链路中，在创建`HttpGet`对象时，看到下面这一行代码

![](/imgs/190327/06.jpg)


单独看上面两个，好像发现不了什么问题；但是两个对比着看，就发现一个有意思的地方了，在`HttpTemplate`的`execute`方法中，创建URI居然不是我们熟知的 `URI.create()`，接下来就来验证下是不是这里的问题了；

测试方法也比较简单，直接传入URI对象参数，看能否访问成功

```java
@Test
public void testUrlEncode() throws IOException {
    String url = "http://localhost:39531/access?accessKey=ASHJRK3LJFD%2BR32SADFLK%2BFASDJ%3D&name=yihuihui";
    RestTemplate restTemplate = new RestTemplate();
    String ans = restTemplate.getForObject(url, String.class);
    System.out.println(ans);


    ans = restTemplate.getForObject(URI.create(url), String.class);
    System.out.println(ans);
}
```

从截图也可以看出，返回true表示成功了，因此我们可以圈定问题的范围，就在RestTemplate中url参数的构建上了

![](/imgs/190327/07.jpg)

### 3. 原因分析

前面定位到了出问题的环节，在RestTemplate创建URI对象的地方，接下来我们深入源码，看一下这段逻辑的神奇之处

通过单步执行，下面截取关键链路的代码，下面圈出的就是定位最终实现uri创建的具体对象`org.springframework.web.util.DefaultUriBuilderFactory.DefaultUriBuilder`

![](/imgs/190327/08.jpg)

接下来重点放在具体实现方法中

```java
// org.springframework.web.util.DefaultUriBuilderFactory.DefaultUriBuilder#build(java.lang.Object...)

@Override
public URI build(Map<String, ?> uriVars) {
	if (!defaultUriVariables.isEmpty()) {
		Map<String, Object> map = new HashMap<>();
		map.putAll(defaultUriVariables);
		map.putAll(uriVars);
		uriVars = map;
	}
	if (encodingMode.equals(EncodingMode.VALUES_ONLY)) {
		uriVars = UriUtils.encodeUriVariables(uriVars);
	}
	UriComponents uriComponents = this.uriComponentsBuilder.build().expand(uriVars);
	if (encodingMode.equals(EncodingMode.URI_COMPONENT)) {
		uriComponents = uriComponents.encode();
	}
	return URI.create(uriComponents.toString());
}

@Override
public URI build(Object... uriVars) {
	if (ObjectUtils.isEmpty(uriVars) && !defaultUriVariables.isEmpty()) {
		return build(Collections.emptyMap());
	}
	if (encodingMode.equals(EncodingMode.VALUES_ONLY)) {
		uriVars = UriUtils.encodeUriVariables(uriVars);
	}
	UriComponents uriComponents = this.uriComponentsBuilder.build().expand(uriVars);
	if (encodingMode.equals(EncodingMode.URI_COMPONENT)) {
		uriComponents = uriComponents.encode();
	}
	return URI.create(uriComponents.toString());
}
```

两个builder方法提供关键URI生成逻辑，根据最后的返回可以知道，生成URI依然是使用`URI.create`，所以出问题的地方就应该是 `uriComponents.encode()` 实现url编码的地方了，对应的代码如下

```java
// org.springframework.web.util.HierarchicalUriComponents#encode

@Override
public HierarchicalUriComponents encode(Charset charset) {
	if (this.encoded) {
		return this;
	}
	String scheme = getScheme();
	String fragment = getFragment();
	String schemeTo = (scheme != null ? encodeUriComponent(scheme, charset, Type.SCHEME) : null);
	String fragmentTo = (fragment != null ? encodeUriComponent(fragment, charset, Type.FRAGMENT) : null);
	String userInfoTo = (this.userInfo != null ? encodeUriComponent(this.userInfo, charset, Type.USER_INFO) : null);
	String hostTo = (this.host != null ? encodeUriComponent(this.host, charset, getHostType()) : null);
	PathComponent pathTo = this.path.encode(charset);
	MultiValueMap<String, String> paramsTo = encodeQueryParams(charset);
	return new HierarchicalUriComponents(
			schemeTo, fragmentTo, userInfoTo, hostTo, this.port, pathTo, paramsTo, true, false);
}


// org.springframework.web.util.HierarchicalUriComponents#encodeQueryParams
private MultiValueMap<String, String> encodeQueryParams(Charset charset) {
	int size = this.queryParams.size();
	MultiValueMap<String, String> result = new LinkedMultiValueMap<>(size);
	this.queryParams.forEach((key, values) -> {
		String name = encodeUriComponent(key, charset, Type.QUERY_PARAM);
		List<String> encodedValues = new ArrayList<>(values.size());
		for (String value : values) {
			encodedValues.add(encodeUriComponent(value, charset, Type.QUERY_PARAM));
		}
		result.put(name, encodedValues);
	});
	return result;
}
```


记录下参数编码的前后对比，编码前参数为 `ASHJRK3LJFD%2BR32SADFLK%2BFASDJ%3D`

![](/imgs/190327/09.jpg)

编码之后，参数变为`ASHJRK3LJFD%252BR32SADFLK%252BFASDJ%253D`

![](/imgs/190327/10.jpg)


对比下上面的区别，发现这个参数编码，会将请求参数中的 `%` 编码为 `%25`, 所以问题就清楚了，我传进来本来就已经是编码之后的了，结果再编码一次，相当于修改了请求参数了

看到这里，自然而然就有一个想法，既然你会给我的参数进行编码，那么为啥我传入的非编码的参数也不行呢？

接下来我们改一下请求的url参数，再执行一下上面的过程，看下编码之后的参数长啥样

![](/imgs/190327/11.jpg)

从上图很明显可以看出，现编码之后的和我们URLEncode的结果不一样，加号没有被编码, 我们调用jdk的url解码，发现将上面编码后的内容解码出来，+号没了

![](/imgs/190327/12.jpg)

所以问题的原因也找到了，RestTemplate中首先url编码解码的逻辑和`URLEncode/URLDecode`不一致导致的

#### 4. 关键代码分析

最后一步，就是看下具体的url参数编码的实现方法了，下面贴出源码，并在关键地方给出说明

```java
// org.springframework.web.util.HierarchicalUriComponents#encodeUriComponent(java.lang.String, java.nio.charset.Charset, org.springframework.web.util.HierarchicalUriComponents.Type)
static String encodeUriComponent(String source, Charset charset, Type type) {
	if (!StringUtils.hasLength(source)) {
		return source;
	}
	Assert.notNull(charset, "Charset must not be null");
	Assert.notNull(type, "Type must not be null");

	byte[] bytes = source.getBytes(charset);
	ByteArrayOutputStream bos = new ByteArrayOutputStream(bytes.length);
	boolean changed = false;
	for (byte b : bytes) {
		if (b < 0) {
			b += 256;
		}
		
		// 注意这一行，我们的type实际上为 org.springframework.web.util.HierarchicalUriComponents.Type#QUERY_PARAM
		if (type.isAllowed(b)) {
			bos.write(b);
		}
		else {
			bos.write('%');
			char hex1 = Character.toUpperCase(Character.forDigit((b >> 4) & 0xF, 16));
			char hex2 = Character.toUpperCase(Character.forDigit(b & 0xF, 16));
			bos.write(hex1);
			bos.write(hex2);
			changed = true;
		}
	}
	return (changed ? new String(bos.toByteArray(), charset) : source);
}
```

if/else 这一段逻辑需要捞出来好好看一下，这里决定了什么字符会进行编码；其中 `type.isAllowed` 对应的代码为

```java
// org.springframework.web.util.HierarchicalUriComponents.Type#QUERY_PARAM
QUERY_PARAM {
	@Override
	public boolean isAllowed(int c) {
		if ('=' == c || '&' == c) {
			return false;
		}
		else {
			return isPchar(c) || '/' == c || '?' == c;
		}
	}
},

// isPchar 对应的相关代码为

/**
 * Indicates whether the given character is in the {@code pchar} set.
 * @see <a href="http://www.ietf.org/rfc/rfc3986.txt">RFC 3986, appendix A</a>
 */
protected boolean isPchar(int c) {
	return (isUnreserved(c) || isSubDelimiter(c) || ':' == c || '@' == c);
}

/**
 * Indicates whether the given character is in the {@code unreserved} set.
 * @see <a href="http://www.ietf.org/rfc/rfc3986.txt">RFC 3986, appendix A</a>
 */
protected boolean isUnreserved(int c) {
	return (isAlpha(c) || isDigit(c) || '-' == c || '.' == c || '_' == c || '~' == c);
}

/**
 * Indicates whether the given character is in the {@code sub-delims} set.
 * @see <a href="http://www.ietf.org/rfc/rfc3986.txt">RFC 3986, appendix A</a>
 */
protected boolean isSubDelimiter(int c) {
	return ('!' == c || '$' == c || '&' == c || '\'' == c || '(' == c || ')' == c || '*' == c || '+' == c ||
			',' == c || ';' == c || '=' == c);
}

/**
 * Indicates whether the given character is in the {@code ALPHA} set.
 * @see <a href="http://www.ietf.org/rfc/rfc3986.txt">RFC 3986, appendix A</a>
 */
protected boolean isAlpha(int c) {
	return (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z');
}

/**
 * Indicates whether the given character is in the {@code DIGIT} set.
 * @see <a href="http://www.ietf.org/rfc/rfc3986.txt">RFC 3986, appendix A</a>
 */
protected boolean isDigit(int c) {
	return (c >= '0' && c <= '9');
}
```

上面涉及的方法挺多，小结一下需要转码的字符为: `=`, `&`

下图是维基百科中关于url参数编码的说明，比如上例中的+号，按照维基百科的需要转码；但是在Spring中却是不需要转码的

![](/imgs/190327/13.jpg)


所以为啥Spring要这么干呢？网上搜索了一下，发现有人也遇到过这个问题，并提给了Spring的官方，对应链接为

- [HierarchicalUriComponents.encodeUriComponent() method can not encode Pchar](https://jira.spring.io/projects/SPR/issues/SPR-17621?filter=allissues)

官方人员的解释如下

> 根据 [RFC 3986](https://www.ietf.org/rfc/rfc3986.txt) 加号等符号的确实可以出现在参数中的，而且不需要编码，有问题的在于服务端的解析没有与时俱进

## III. 小结

最后复盘一下这个问题，当使用`RestTemplate`发起请求时，如果请求参数中有需要url编码时，不希望出现问题的使用姿势应传入URI对象而不是字符串，如下面两种方式

```java
@Override
@Nullable
public <T> T execute(URI url, @Nullable HttpMethod method, @Nullable RequestCallback requestCallback,
	@Nullable ResponseExtractor<T> responseExtractor) throws RestClientException {

  return doExecute(url, method, requestCallback, responseExtractor);
}

@Override
@Nullable
public <T> T getForObject(URI url, Class<T> responseType) throws RestClientException {
	RequestCallback requestCallback = acceptHeaderRequestCallback(responseType);
	HttpMessageConverterExtractor<T> responseExtractor =
			new HttpMessageConverterExtractor<>(responseType, getMessageConverters(), logger);
	return execute(url, HttpMethod.GET, requestCallback, responseExtractor);
}
```


注意Spring的url参数编码，默认只会针对 `=` 和 `&` 进行处理；为了兼容我们一般的后端的url编解码处理在需要编码参数时，目前尽量不要使用Spring默认的方式，不然接收到数据会和预期的不一致


## IV. 其他

### 0. 项目

- 工程：[spring-boot-demo](https://github.com/liuyueyi/spring-boot-demo)


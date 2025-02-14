import{_ as n,V as s,W as a,a0 as e}from"./framework-23f3cf9b.js";const t={},i=e(`<h1 id="java-15新特性-文本块-代码书写的新利器" tabindex="-1"><a class="header-anchor" href="#java-15新特性-文本块-代码书写的新利器" aria-hidden="true">#</a> Java 15新特性：文本块，代码书写的新利器！</h1><h2 id="传统字符串拼接的痛点" tabindex="-1"><a class="header-anchor" href="#传统字符串拼接的痛点" aria-hidden="true">#</a> 传统字符串拼接的痛点</h2><p>嘿，Java开发者们！有没有遇到过这样的烦恼：写代码时，字符串拼接写得自己都快崩溃了？比如，写SQL查询语句或者HTML代码片段，一不小心就拼错，还得花时间去排查问题。这事儿是不是特别烦人？</p><p>想象一下，你正在写一个SQL查询语句，代码可能是这样的：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token string">&quot;SELECT * FROM users &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;WHERE age &gt; 18 &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;AND gender = &#39;male&#39; &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;ORDER BY username;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉代码特别冗长，还容易出错？要是SQL语句更复杂，那代码简直就像“迷宫”一样，让人摸不着头脑。</p><p>再看看HTML代码片段的拼接：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> html <span class="token operator">=</span> <span class="token string">&quot;&lt;html&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;head&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;title&gt;My Page&lt;/title&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;/head&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;body&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;h1&gt;Welcome to my page!&lt;/h1&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;/body&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;/html&gt;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这种拼接方式不仅代码结构不清晰，还特别容易漏掉某个连接符。要是字符串里有特殊字符，还得用转义字符，比如：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> message <span class="token operator">=</span> <span class="token string">&quot;He said, \\&quot;Hello, world!\\&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>是不是感觉特别麻烦？这些痛点不仅让代码看起来很乱，还容易出错，降低开发效率。那有没有更好的办法呢？别急，Java 15的文本块来救场啦！</p><h2 id="java-15文本块闪亮登场" tabindex="-1"><a class="header-anchor" href="#java-15文本块闪亮登场" aria-hidden="true">#</a> Java 15文本块闪亮登场</h2><h3 id="文本块是什么" tabindex="-1"><a class="header-anchor" href="#文本块是什么" aria-hidden="true">#</a> 文本块是什么</h3><p>Java 15引入了一个超酷的新特性——文本块（Text Blocks）。它就像一个“魔法盒子”，能让你用更直观、更简洁的方式定义多行字符串。简单来说，文本块就是用三个双引号（<code>&quot;&quot;&quot;</code>）作为分隔符的字符串。在这对分隔符之间的所有内容，都会被视为字符串的一部分，而且会保留文本的格式和缩进。</p><p>举个栗子，上面的SQL查询语句用文本块写起来就超简单：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    SELECT * FROM users 
    WHERE age &gt; 18 
    AND gender = &#39;male&#39; 
    ORDER BY username;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是瞬间清爽多了？代码不仅更短，还一目了然。</p><h3 id="文本块的使用规则" tabindex="-1"><a class="header-anchor" href="#文本块的使用规则" aria-hidden="true">#</a> 文本块的使用规则</h3><p>使用文本块时，有几条简单的规则：</p><ol><li><strong>分隔符</strong>：文本块以三个双引号（<code>&quot;&quot;&quot;</code>）开始，以三个双引号结束。开始和结束的<code>&quot;&quot;&quot;</code>必须单独成行，中间不能有其他字符（除了空格和换行符）。</li><li><strong>内容</strong>：在三个双引号内，可以插入任何字符，包括换行符、制表符等。这让你定义多行文本时特别自然。</li><li><strong>缩进</strong>：文本块支持缩进，缩进会被保留在最终的字符串中。这对于保持代码的结构和格式特别有帮助。</li><li><strong>转义字符</strong>：虽然文本块减少了对转义字符的需求，但仍然可以使用<code>\\</code>来转义特殊字符，比如<code>\\&quot;</code>表示双引号，<code>\\\\</code>表示反斜杠。</li></ol><h3 id="示例代码" tabindex="-1"><a class="header-anchor" href="#示例代码" aria-hidden="true">#</a> 示例代码</h3><p>看看下面这些示例，感受一下文本块的强大：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">TextBlockExample</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 普通多行文本</span>
        <span class="token class-name">String</span> multiLineText <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
            This is a multi - line text.
                It has some indentation.
            And it can span multiple lines.
            &quot;&quot;&quot;</span><span class="token punctuation">;</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>multiLineText<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// JSON格式字符串</span>
        <span class="token class-name">String</span> json <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
            {
                &quot;name&quot;: &quot;Alice&quot;,
                &quot;age&quot;: 30,
                &quot;city&quot;: &quot;New York&quot;
            }
            &quot;&quot;&quot;</span><span class="token punctuation">;</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>json<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// XML格式字符串</span>
        <span class="token class-name">String</span> xml <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
            &lt;book&gt;
                &lt;title&gt;Java 15 Cookbook&lt;/title&gt;
                &lt;author&gt;John Doe&lt;/author&gt;
                &lt;publisher&gt;ABC Publishing&lt;/publisher&gt;
            &lt;/book&gt;
            &quot;&quot;&quot;</span><span class="token punctuation">;</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>xml<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行这段代码，你会发现输出的字符串完美地保留了你在文本块中定义的格式，是不是很神奇？</p><p><strong>小贴士</strong>：文本块特别适合处理多行文本，比如SQL语句、HTML代码、JSON和XML等，让代码更清晰、更易读。</p><h2 id="文本块在实际开发中的强大应用" tabindex="-1"><a class="header-anchor" href="#文本块在实际开发中的强大应用" aria-hidden="true">#</a> 文本块在实际开发中的强大应用</h2><h3 id="sql语句编写" tabindex="-1"><a class="header-anchor" href="#sql语句编写" aria-hidden="true">#</a> SQL语句编写</h3><p>想象一下，你正在写一个复杂的SQL查询语句，用传统方式拼接字符串，代码可能会变成这样：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> complexSql <span class="token operator">=</span> <span class="token string">&quot;SELECT u.username, p.phone, e.email &quot;</span> <span class="token operator">+</span>
                    <span class="token string">&quot;FROM users u &quot;</span> <span class="token operator">+</span>
                    <span class="token string">&quot;JOIN phones p ON u.user_id = p.user_id &quot;</span> <span class="token operator">+</span>
                    <span class="token string">&quot;JOIN emails e ON u.user_id = e.user_id &quot;</span> <span class="token operator">+</span>
                    <span class="token string">&quot;WHERE u.age &gt; 25 &quot;</span> <span class="token operator">+</span>
                    <span class="token string">&quot;AND p.phone_type = &#39;mobile&#39; &quot;</span> <span class="token operator">+</span>
                    <span class="token string">&quot;ORDER BY u.username;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉代码特别乱？要是用文本块，代码瞬间变清爽：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> complexSql <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    SELECT u.username, p.phone, e.email 
    FROM users u 
    JOIN phones p ON u.user_id = p.user_id 
    JOIN emails e ON u.user_id = e.user_id 
    WHERE u.age &gt; 25 
    AND p.phone_type = &#39;mobile&#39; 
    ORDER BY u.username;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉特别清晰？文本块不仅让代码更简洁，还减少了出错的可能性。</p><h3 id="html代码构建" tabindex="-1"><a class="header-anchor" href="#html代码构建" aria-hidden="true">#</a> HTML代码构建</h3><p>再看看HTML代码的构建。传统方式拼接字符串，代码可能是这样的：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> html <span class="token operator">=</span> <span class="token string">&quot;&lt;html&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;head&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;title&gt;My Web Page&lt;/title&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;/head&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;body&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;h1&gt;Welcome to my page!&lt;/h1&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;p&gt;This is a simple paragraph.&lt;/p&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;/body&gt;&quot;</span> <span class="token operator">+</span>
              <span class="token string">&quot;&lt;/html&gt;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉特别冗长？用文本块，代码瞬间变清爽：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> html <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    &lt;html&gt;
        &lt;head&gt;
            &lt;title&gt;My Web Page&lt;/title&gt;
        &lt;/head&gt;
        &lt;body&gt;
            &lt;h1&gt;Welcome to my page!&lt;/h1&gt;
            &lt;p&gt;This is a simple paragraph.&lt;/p&gt;
        &lt;/body&gt;
    &lt;/html&gt;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉特别清晰？文本块不仅让代码更简洁，还减少了出错的可能性。</p><h3 id="其他场景应用拓展" tabindex="-1"><a class="header-anchor" href="#其他场景应用拓展" aria-hidden="true">#</a> 其他场景应用拓展</h3><p>除了SQL语句和HTML代码，文本块在其他场景中也特别有用。比如，写JSON字符串：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> json <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    {
        &quot;name&quot;: &quot;John&quot;,
        &quot;age&quot;: 30,
        &quot;city&quot;: &quot;New York&quot;
    }
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>或者写配置文件内容：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> config <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    &lt;config&gt;
        &lt;server&gt;
            &lt;host&gt;localhost&lt;/host&gt;
            &lt;port&gt;8080&lt;/port&gt;
        &lt;/server&gt;
        &lt;database&gt;
            &lt;url&gt;jdbc:mysql://localhost:3306/mydb&lt;/url&gt;
            &lt;username&gt;root&lt;/username&gt;
            &lt;password&gt;password&lt;/password&gt;
        &lt;/database&gt;
    &lt;/config&gt;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些示例展示了文本块的强大功能。无论是处理结构化文本还是复杂的字符串内容，文本块都能让代码更简洁、更易读，提高开发效率和代码质量。</p><p><strong>小贴士</strong>：文本块特别适合处理多行文本，让代码更清晰、更易读。用它来写SQL、HTML、JSON和XML，绝对让你爽到飞起！</p><h2 id="文本块与传统字符串的深度对比" tabindex="-1"><a class="header-anchor" href="#文本块与传统字符串的深度对比" aria-hidden="true">#</a> 文本块与传统字符串的深度对比</h2><h3 id="代码简洁性" tabindex="-1"><a class="header-anchor" href="#代码简洁性" aria-hidden="true">#</a> 代码简洁性</h3><p>文本块在代码简洁性方面绝对秒杀传统字符串拼接。比如，写SQL语句，传统方式：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token string">&quot;SELECT * FROM users &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;WHERE age &gt; 18 &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;AND gender = &#39;male&#39; &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;ORDER BY username;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>用文本块：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    SELECT * FROM users 
    WHERE age &gt; 18 
    AND gender = &#39;male&#39; 
    ORDER BY username;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉文本块特别清爽？代码量瞬间减少，逻辑也更清晰。</p><h3 id="可读性" tabindex="-1"><a class="header-anchor" href="#可读性" aria-hidden="true">#</a> 可读性</h3><p>代码的可读性对于开发和维护特别重要。传统字符串拼接方式在处理多行文本时，代码逻辑结构特别模糊。比如，写JSON字符串，传统方式：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> json <span class="token operator">=</span> <span class="token string">&quot;{\\&quot;name\\&quot;:\\&quot;John\\&quot;,\\&quot;age\\&quot;:30,\\&quot;city\\&quot;:\\&quot;New York\\&quot;,\\&quot;hobbies\\&quot;:[\\&quot;reading\\&quot;,\\&quot;traveling\\&quot;]}&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>用文本块：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> json <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    {
        &quot;name&quot;: &quot;John&quot;,
        &quot;age&quot;: 30,
        &quot;city&quot;: &quot;New York&quot;,
        &quot;hobbies&quot;: [
            &quot;reading&quot;,
            &quot;traveling&quot;
        ]
    }
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉文本块特别清晰？代码结构一目了然，开发人员可以轻松理解和修改内容。</p><h3 id="维护难度" tabindex="-1"><a class="header-anchor" href="#维护难度" aria-hidden="true">#</a> 维护难度</h3><p>当代码需要修改时，维护的难度就特别明显。对于传统字符串拼接的代码，如果需要修改某一部分，比如修改SQL语句中的一个条件，传统方式：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 修改前</span>
<span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token string">&quot;SELECT * FROM users &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;WHERE age &gt; 18 &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;AND gender = &#39;male&#39; &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;ORDER BY username;&quot;</span><span class="token punctuation">;</span>

<span class="token comment">// 修改后</span>
<span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token string">&quot;SELECT * FROM users &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;WHERE age &gt; 20 &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;AND gender = &#39;male&#39; &quot;</span> <span class="token operator">+</span>
             <span class="token string">&quot;ORDER BY username;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉特别麻烦？还得小心连接符和空格。用文本块：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 修改前</span>
<span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    SELECT * FROM users 
    WHERE age &gt; 18 
    AND gender = &#39;male&#39; 
    ORDER BY username;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>

<span class="token comment">// 修改后</span>
<span class="token class-name">String</span> sql <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
    SELECT * FROM users 
    WHERE age &gt; 20 
    AND gender = &#39;male&#39; 
    ORDER BY username;
    &quot;&quot;&quot;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>是不是感觉特别简单？直接修改就行，不用担心连接符和转义字符。</p><h2 id="总结与展望" tabindex="-1"><a class="header-anchor" href="#总结与展望" aria-hidden="true">#</a> 总结与展望</h2><p>Java 15的文本块特性绝对是个“神器”，它解决了传统字符串拼接的痛点，让代码更简洁、更易读、更易维护。无论是写SQL语句、HTML代码，还是处理JSON和XML，文本块都能让你的代码瞬间“飞起来”。</p><p>未来，Java还会带来更多实用的新特性。希望你在新项目中，或者在合适的旧项目重构中，积极尝试使用文本块，让代码更优雅、更高效。</p><p>最后，如果你在使用文本块时有任何有趣的经验，或者遇到过什么坑，欢迎在评论区分享哦！</p>`,68),l=[i];function o(p,u){return s(),a("div",null,l)}const d=n(t,[["render",o],["__file","07.Java15：文本块.html.vue"]]);export{d as default};

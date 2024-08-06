import{_ as n,V as s,W as e,a0 as a}from"./framework-23f3cf9b.js";const i={},c=a(`<p>推送代码到github时，直接超时失败，提示信息如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>ssh: connect to <span class="token function">host</span> github.com port <span class="token number">22</span>: Connection timed out
fatal: Could not <span class="token builtin class-name">read</span> from remote repository.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>解决方案：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">vim</span> ~/.ssh/config


<span class="token comment"># 添加下面的内容</span>
Host github.com
  Hostname ssh.github.com
  Port <span class="token number">443</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于非mac/linux系统，即win而言，需要再 <code>c\\用户\\.ssh\\config</code> 文件中添加上面的内容，如果这个文件不存在，新建一个</p>`,5),t=[c];function o(l,d){return s(),e("div",null,t)}const u=n(i,[["render",o],["__file","230820-gihub推送代码超时问题解决方案.html.vue"]]);export{u as default};

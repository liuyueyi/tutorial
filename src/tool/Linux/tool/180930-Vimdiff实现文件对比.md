---
order: 1
title: 1. Vimdiff实现文件对比
tag:
  - Shell
category:
  - Shell
  - CMD
date: 2018-09-30 13:25:30
keywords: Vim,Vimdiff,文件对比,Shell,Linux
---

linux下文件对比的利器，vimdiff，使用说明如下


实用的vim下比较两个文件命令：
 
1、 vimdiff file1 file2
终端下输入该命令进入vim，垂直分隔窗口进行比较
 
2、 vimdiff -o file1 file2
水平分隔窗口进行比较
 
3、 ctrl+w (j,k,h,l)
上下左右切换光标所在的窗口（括号中表示可以是其中之一，按下ctrl+w，放开ctrl再按j,k,h,l）
 
4、 ctrl+w (J,K,H,L)
上下左右移动光标所在窗口的位置
 
5、 zo 和 zc
打开折叠区 和 关闭折叠区
 
6、 ]c 和 [c
将光标移动到下一个不同区 和 上一个不同区
 
7、 do 和 dp
将光标所在不同区域同步为另一个文件该位置的内容 和 将光标所在不同区域内容同步到另一个文件该位置
 
8、 :diffu[!]
vim下更新当前比较窗口，比较状态下修改文件后，可调用该命令[中括号不为命令部分，如果加!表示如果外部修改了文件，则重新加载比较]
 
9、 :diffo[!]
vim下关闭当前窗口比较状态，如果加!则关闭所有窗口的比较状态
 
10、:diffs file1
vim下加入file1和当前光标所在窗口进行比较，水平分隔窗口
 
11、:vert diffs file1
vim下加入file1和当前光标所在窗口进行比较，垂直分隔窗口
 
12、:difft
vim下将光标所在窗口变为比较窗口
 
 
其它技巧：
 
1、 diff -u file1 file2 > file3
终端下输入该命令，可以将file1和file2的比较结果输出到file3中，-u 表示以合并格式比较，-c 为上下文格式，不加为一般格式

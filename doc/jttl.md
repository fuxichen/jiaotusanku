> “我正在参加「兔了个兔」创意投稿大赛，详情请看：[「兔了个兔」创意投稿大赛](https://juejin.cn/post/7185104994801025061 "https://juejin.cn/post/7185104994801025061")”

# 游戏介绍
游戏有两个模式 `答题模式`、`出题模式`。
`答题模式` 下可以点击下方的鹅毛笔进行答题，答题模式下输入兔子数量和鸡的数量。  
如：`12,13`  
点击 `下一题` 会重新随机出一道题。
点击 `出题` 会进入 `出题模式`，`出题模式` 下输入头数和脚数系统会解出题目答案。  
如：`35,94`  
*（为了更好的游戏体验，请在H5模式下打开）*

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57ea40658b7b469d92a5b9450c88b73e~tplv-k3u1fbpfcp-watermark.image?)

# 题目动画

将题目存为数组，每行一句。
该函数接收两个参数 `头数` 和 `脚数` ,然后将这两个数据通过 `handleNumToStr` 函数转为中文数字。   
如 `21` 转为 `二十一`，然后将结果拼接到题目中并返回。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0fe1c11a70a439f8dad1ec3b224d84d~tplv-k3u1fbpfcp-watermark.image?)

`setPoetryList` 函数通过遍历生成的题目将返回的数组分割成单个字符的数字。遇到换行使用 `\n` 代替。  
第一行是题目不需要动画，所以需单独处理一下。
```js
[
    '雉兔同笼',
    '今有雉兔同笼，',
    '上有三百一十九头，',
    '下有九百六十四足，',
    '问雉兔各几何？'
]
```
转换为
```js
['雉兔同笼', '\n', '今', '有', '雉', '兔', '同', '笼', '，', '\n', '上', '有', '三', '百', '一', '十', '九', '头', '，', '\n', '下', '有', '九', '百', '六', '十', '四', '足', '，', '\n', '问', '雉', '兔', '各', '几', '何', '？']
```
然后使用定时器循环 `push` 到 `state.poetryList` 中产生动画效果。

![carbon.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4743ba5c1bb740fa963899d3fbdc6ea4~tplv-k3u1fbpfcp-watermark.image?)

动画定时器我没有采用原生的 `setInterval` 而是使用了 `setIntervalPrecision`。 他是一个用 `windowrequestAnimationFrame()` 特性实现的定时器。
该定时器的原理来自： [使用 requestAnimationFrame 实现定时器，解决 setInterval 执行次数丢失问题](https://www.cnblogs.com/whosmeya/p/14135507.html)。  
我重构并优化了他的代码并使用 `ts` 对其进行了重写。
在重构时，我选择了使用 `轮询定时任务` 的方式，减少了在多定时器情况下 `requestAnimationFrame` 函数的调用次数以及死循环与函数闭包的产生数量。

## 旧写法
每次调用定时器会生成一个loop函数闭包，且loop函数中会循环调用 `requestAnimationFrame` ,也就是调用 `n` 次定时器会产生 `n` 闭包以及 `n` 次死循环、每次屏幕刷新会执行 `n` 次 `requestAnimationFrame` 函数。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4888f739336a4dd1ab01e0781b77e01c~tplv-k3u1fbpfcp-watermark.image?)

## 新写法
新写法使用全局任务总线去调度任务，每次调用定时器会将当前任务 `push` 到队列中，整个生命周期中只生成 `1` 个闭包和死循环。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0396dec5d230491db828a00bb5e86c80~tplv-k3u1fbpfcp-watermark.image?)


# 计算鸡兔数量

在计算鸡兔数量部分，我选择采用了相对简单的**抬腿法**。
> 题：`今有雉兔同笼，上有三十五头，下有九十四足，问雉兔各几何？`  
> 题解：假如鸡与兔子都抬起两只脚，这时地上没有一只鸡是站着的 `2 - 2 = 0` ，每只兔子还剩两只脚站在地上 `4 - 2 = 2`，此时还剩下 `94 - 35 × 2 = 24` 只脚 ，又因每只兔子有两只脚在地上，所以有 `24 ÷ 2 = 12` 只兔子，总共 `35` 个头，兔子占了 `12` 个，就有 `35 - 12 = 23`只鸡。  
更多方法请查看[百度百科--鸡兔同笼](https://baike.baidu.com/item/%E9%B8%A1%E5%85%94%E5%90%8C%E7%AC%BC/5907332)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b1f72895d7441469c959100f3f68146~tplv-k3u1fbpfcp-watermark.image?)

# 随机出题

这里限定了不会超过 `999` 只脚（因为我没有这个字体库的完整版）。  
因为脚数不超过 `999` 则兔子最大的可能数为 `999 / 4 = 249 只`。所有先使用随机数取 `0-249`。  
然后兔子占用的脚数为 `4 * 兔子数量` ， 使用 `最大脚数-兔子脚数` 得到鸡的最大脚数。  
然后使用随机数取 `0-鸡的最大脚数`，得到鸡的数量。  
最后调用题目动画生成题目。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f2e97c632ffe4ce380183875f8aece1a~tplv-k3u1fbpfcp-watermark.image?)

# 答案验证

将用户输入的兔子数和吉数相加得到总数，计算 `兔子数 * 4 + 鸡数 * 2` 得到脚的总数，然后与题目数据对比。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e517dd9cfae4cd49ba5634ce8fa36e4~tplv-k3u1fbpfcp-watermark.image?)

# 字库

字体库地址：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b397cae8fe674a8bb806256557197209~tplv-k3u1fbpfcp-watermark.image?)

由于字库需要账号下载，虽然我没得账号去下载，但是我通过控制面板的 `Network` 发现了他在字库请求接口:

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c0e994c01f34ca098c6b4aa9d1504b3~tplv-k3u1fbpfcp-watermark.image?)

其中 `words=` 后面接的是字符的 `Unicode` 编码。  
于是我写了个简单的函数处理我需要的字符字体
```js
let str = '今有雉兔同笼上有头下有足，问各几何？零一二三四五六七八九十百答曰：未知'
let str1 = str.split('').map(v=>{
    return v.codePointAt().toString(16)
}).join(',');
console.log(str1);
let str2 = str.split('').map(v=>{
    return `\\U+${v.codePointAt().toString(16)}`
}).join(',');
console.log(str2);
```

其中 `src` 是字体库链接， `unicode-range` 现在该字体库包含的字符范围。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22e8345d2f644cfb9cfac28b128c5172~tplv-k3u1fbpfcp-watermark.image?)

# 在线体验地址（码上掘金）

[jcode](https://code.juejin.cn/pen/7189255196781117499)

# git仓库地址

[「兔了个兔」创意投稿--鸡兔同笼：https://github.com/fuxichen/jiaotusanku/tree/main](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ffuxichen%2Fjiaotusanku%2Ftree%2Fmain "https://github.com/fuxichen/jiaotusanku/tree/main")

我正在参加「兔了个兔」创意投稿大赛。基于 vue3 实现了一个简单的H5版本「鸡兔同笼」H5答题小游戏。  
#码上掘金# 哥哥们，快来点赞，收藏，分享，帮我白嫖优弧出分力吧[惊喜][惊喜][惊喜]
[「兔了个兔」创意投稿--鸡兔同笼](https://juejin.cn/post/7189425732471717944)
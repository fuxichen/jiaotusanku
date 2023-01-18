> “我正在参加「兔了个兔」创意投稿大赛，详情请看：[「兔了个兔」创意投稿大赛](https://juejin.cn/post/7185104994801025061 "https://juejin.cn/post/7185104994801025061")”

# 游戏介绍
「小兔翻翻乐」是一个基于 `Vue3` 的 `H5` 卡牌小游戏，游戏分为 `简单`、`容易`、`困难` 三个模式。
## 游戏玩法
点击两张卡牌，如果两张卡牌图片相同则匹配成功，否则匹配失败。  
由于卡牌阵列为 `5 * 5` 共 `25` 张，为单数无法全部匹配完，所以我在卡牌中增加了一张 `空白牌`，`空白牌` 单独翻出可直接匹配成功。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2cd1a558c0445b486d8a17a535220eb~tplv-k3u1fbpfcp-watermark.image?)

## 卡牌动画

每张卡牌数据有三个属性，分别为 `发牌状态`、`激活状态`、`值`。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41709e475e004629a57355b13649463f~tplv-k3u1fbpfcp-watermark.image?)

## 翻卡动画
每张卡牌由两个div构成，一个显示正面，一个显示背面。正反面通过设置浮动使其重叠在一起。  
通过 `transform: rotateY(180deg);` 属性将卡牌翻面，并使用 `transition` 属性为其添加动画效果。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9884b0b416684e748a0278331cc4ba47~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a7ba64f5331409ab7987de78d723fa6~tplv-k3u1fbpfcp-watermark.image?)

由于卡牌翻转 `180°` 后，文字也会翻转，我们只需要使用 `transform: rotateY(180deg);` 属性为背面图片反转 `180°` 就可以解决了。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5fc77b78e4d4d12ace044765e3fe9e9~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/143aa5b4d9754cacacf5e7abf7eb2089~tplv-k3u1fbpfcp-watermark.image?)

## 发牌动画

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ead4cbd6a2944c2b98f28e9b1812514~tplv-k3u1fbpfcp-watermark.image?)

由于我们每个卡牌之间的距离相等，我为了偷懒所以选择了利用这个特性和 `transform: translate(X, Y);` 属性实现。  
由于是 `5 * 5` 矩阵，在未发牌状态下：  
第一张(最左上角)的卡牌到卡堆的位置需要 `X` 偏移 4 个列间距 和 4 张卡牌宽度距离， `Y` 偏移 5 个行间距 和 5 个卡牌高度距离。  
第二张卡牌(第一张右边)的卡牌到卡堆的位置需要 `X` 偏移 3 个列间距 和 3 张卡牌宽度距离， `Y` 偏移 5 个行间距 和 5 个卡牌高度距离。  
第六张卡牌(第一张下边)的卡牌到卡堆的位置需要 `X` 偏移 4 个列间距 和 4 张卡牌宽度距离， `Y` 偏移 4 个行间距 和 4 个卡牌高度距离。

用二维数组遍历该矩阵，(n,m)为下标，可得每张卡牌偏移的距离为：  
`X` : (5 - 1 - m) * (卡牌宽度 + 卡牌列间距)  
`Y` : (5 - n) * (卡牌高度 + 卡牌行间距)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df02eb5326ce43cab39b28c101f52771~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/430a42c1e244461b926eba6708d188ba~tplv-k3u1fbpfcp-watermark.image?)

通过为卡牌增加 `wait` 类来控制卡牌是否偏移，并在这两张状态切换时使用 `transition` 属性为其添加动画效果。  
然后还写了个发牌函数辅助发牌动画，通过循环遍历二位数组通过给每张卡牌设置不同的延时来实现一张一张发出卡牌的效果

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2bb3b08e16c40d18b92b5f612542960~tplv-k3u1fbpfcp-watermark.image?)

# 生成卡牌

我们定义了三个不同级别的难度：  
`简单` 级别每局会出现 `3` 种不同的卡牌  
`容易` 级别每局会出现 `5` 种不同的卡牌  
`困难` 级别每局会出现 `7` 种不同的卡牌  
使用 `0-6` 7个数字表示不同花色的卡牌

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f40c7bbfc83a4489b7d83c1eb703f99e~tplv-k3u1fbpfcp-watermark.image?)

首先我们将 `0-6` 7个数字的数组顺序打乱，然后根据不同的难题取出不同数量的卡牌，这样我们在 `简单`、`容易` 这两种难度时，每局都能随机生成不同花色的卡牌。

```typescript
let imgIds = sort(sort([0, 1, 2, 3, 4, 5, 6])).slice(
  0,
  difficultyList[state.difficultyId].count
);
```

除了一张 `空白牌` 外，我们还需生成 `24` 张卡牌，为了保证卡牌两两成对，我们只需要随机生成 `12` 张不同花色的卡牌，然后 `*2` 就可以了。

```typescript
// 生成12对牌并打乱顺序
let valueList: number[] = [-1];
for (let i = 0; i < 12; i++) {
  let value = imgIds[randomNum(0, 6) % imgIds.length];
  valueList.push(value);
  valueList.push(value);
  valueList = sort(valueList);
}
```

最后得到 `25` 张卡牌数组，通过疯狂随机排序来实现打乱卡牌顺序并对其循环遍历转换成 `5 * 5` 的二维数组。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d182e5fe61b4910ac84effde5372cbc~tplv-k3u1fbpfcp-watermark.image?)

# 在线体验地址（码上掘金）
*（为了更好的游戏体验，请点击右上角查看详情模拟在H5模式下打开）*
[jcode](https://code.juejin.cn/pen/7190012204090359845)

# git仓库地址

[「兔了个兔」创意投稿--鸡兔同笼：https://github.com/fuxichen/jiaotusanku/tree/main](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ffuxichen%2Fjiaotusanku%2Ftree%2Fmain "https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ffuxichen%2Fjiaotusanku%2Ftree%2Fmain")

## 附言
图片素材来自网络以及[「兔了个兔」创意投稿大赛——吃饭睡觉打兔兔](https://juejin.cn/post/7187677611089363005)  
翻卡动画动画来自 [css3 实现 卡片翻转效果](https://blog.csdn.net/StrongerIrene/article/details/108292431)  
感谢👍👍👍

「小兔翻翻乐」是一个基于 Vue3 的 H5 卡牌小游戏，游戏分为 简单、容易、困难 三个模式。  
[「兔了个兔」创意投稿--小兔翻翻乐](https://juejin.cn/post/7190044761569361979)
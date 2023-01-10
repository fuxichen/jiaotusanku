> “我正在参加「兔了个兔」创意投稿大赛，详情请看：[「兔了个兔」创意投稿大赛](https://juejin.cn/post/7185104994801025061 "https://juejin.cn/post/7185104994801025061")”

# 页面构成

页面整体由 `开始页面`、`游戏页面`、`游戏结束页面` 三块区域构成。  
`开始页面` 区域包含 `游戏标题`、`开始游戏倒计时` 两部分。  
`游戏页面` 区域包含 `锤子区域`、`兔子窝`、`击中动画` 三部分。
通过 `gameState` 记录游戏状态

| 状态 | 值 | 展示页面 |
| --- | --- | --- |
| 0 | 待开始 | `开始页面` |
| 1 | 游戏中 | `游戏页面` |
| -1 | 游戏结束 | `游戏结束页面` |


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39a7b966883c4d3bbd85e678112438ce~tplv-k3u1fbpfcp-watermark.image?)

# 开始页面
标题主要使用 `background-clip: text;` 和不同的彩色背景图片实现渐变效果，点击会进入开始游戏倒计时。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b7d960b90904c82be141eeda52f5aeb~tplv-k3u1fbpfcp-watermark.image?)
```
<div class="text-panel" v-else>
  <div class="text text-1">狡</div>
  <div class="text text-2">兔</div>
  <div class="text text-3">三</div>
  <div class="text text-4">窟</div>
</div>
```
```
.text-1 {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 400 400'%3e%3cdefs%3e%3cfilter id='filter' width='400px' height='400px' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3e%3cfeFlood flood-color='%23f5576c' flood-opacity='1' x='0' y='0' width='250px' height='250px' result='flood3'%3e%3c/feFlood%3e%3cfeFlood flood-color='%23f093fb' flood-opacity='1' x='150px' y='150px' width='250px' height='250px' result='flood4'%3e%3c/feFlood%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood3' edgeMode='none' result='blur1'%3e%3c/feGaussianBlur%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood4' edgeMode='none' result='blur2'%3e%3c/feGaussianBlur%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur2' in2='SourceGraphic' result='blend5'%3e%3c/feBlend%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur1' in2='blend5' result='blend6'%3e%3c/feBlend%3e%3c/filter%3e%3c/defs%3e%3crect width='400' height='400' x='0' y='0' fill='%23fee140' filter='url(%23filter)'%3e%3c/rect%3e%3c/svg%3e");
}
```

# 游戏页面
`游戏页面` 区域包含 `锤子区域`、`兔子窝`、`击中动画` 三部分。  
页面结构如下图所示：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97cb9330e91246beabf5075d4763de0a~tplv-k3u1fbpfcp-watermark.image?)

`generateHammer` 函数用来不断生成新的锤子组，其中 `randomNum` 函数就是个普通的随机数生成函数。因为最大只有三个兔子窝，且每个锤子只有 0 (不生成) 1 (生成) 两种状态，所以可以利用随机 `0-7` 中的一个数然后转成二进制来处理生成逻辑。

| 十进制 | 二进制 |
| --- | --- |
| 0 | 000 |
| 1 | 001 |
| 2 | 010 |
| 3 | 011 |
| 4 | 100 |
| 5 | 101 |
| 6 | 110 |
| 7 | 111 |

由于不可能产生没有锤子的组，也不可能一组中三个都是锤子，所以我们实际生成时只随机 `1-6` 来生成锤子数据就可以了。

```
/**
 * 生成锤子
 */
function generateHammer() {
  timer = setInterval(function () {
    if (hammerData.list.length < 5) {
      let data = randomNum(1, 6).toString(2).padStart(3, '0').split('').map(v => {
        return parseInt(v)
      })
      hammerData.list.unshift({val: data, y: 0});
    }
  }, 1200);
}
```

## 锤子步进
`hammerStep` 函数用来处理锤子的步进，通过延时 `1000 / 60` 毫秒来实现60帧的动画效果，刚开始我使用的是 `requestAnimationFrame` 实现动画，但是不知道为什么换了台电脑运行步进的速度就不一样了/(ㄒoㄒ)/~~。

```
/**
 * 锤子步进
 */
function hammerStep() {
  setTimeout(function () {
    if (check()) {
      clearInterval(timer);
      setTimeout(function () {
        gameState.value = -1;
      }, 600)
      return
    }
    let { list } = hammerData;
    // 删除超出屏幕的锤子
    list = list.filter(v => {
      return clientHeight > v.y;
    })
    // 移动锤子
    list = list.map(v => {
      v.y += 3;
      return v
    });
    hammerData.list = list;
    hammerStep();
  }, 1000 / 60)
}
```

每次步进前会进行一次物体撞击检测，由于每组锤子的Y坐标是一样的，所以可以直接按组检测。  
检测逻辑就是锤子的中心点是否在兔子窝的中心点附近，上下误差范围是 `兔子高度*0.25` 。  
检测时在一组锤子进入误差范围时，还需要判断判断兔子所在的兔子窝上面是否有锤子，`rabbitCurrentHome` 表示当前兔子所在位置。

```js
let state = center > (homeCenter - height * 0.25) && center < (homeCenter + height * 0.25) && v.val.some((v, i) => {
  return v && (i + 1) === rabbitCurrentHome.value
});
```

如果检测到撞击，会将当前碰撞锤子组保存下来，然后会给碰撞的锤子、以及撞击动画、增加 `active` 类，从而激活碰撞动画

```
if (state) {
  hammerData.current = v
}
```

碰撞动画就是先锤子放大并旋转一定角度，然后缩小并反方向旋转一定角度。

```
@keyframes hammerActive {
  0% {
    transform: scale(1) rotate(0deg) translateX(var(--hammerOffsetX));
  }
  25% {
    transform: scale(1.5) rotate(45deg) translateX(var(--hammerOffsetX));
  }
  50% {
    transform: scale(1) rotate(22.5deg) translateX(var(--hammerOffsetX));
  }
  75% {
    transform: scale(0.5) rotate(0deg) translateX(var(--hammerOffsetX));
  }
  100% {
    transform: scale(1) rotate(0deg) translateX(0px);
  }
}
```
在合适的时间(锤子缩小到最小时)显示撞击特效。

```
@keyframes hammeredActive {
  0% {
    background: none;
  }
  50% {
    background: bottom / 100% 100% no-repeat url('https://i.328888.xyz/2023/01/09/0mcaw.png');
  }
  75%, 100% {
    background: none;
  }
}
```

最后暂停生成锤子组，并将游戏状态切换为游戏结束。

[jcode](https://code.juejin.cn/pen/7186531951405170699)

我正在参加「兔了个兔」创意投稿大赛。基于 vue3 模仿打地鼠游戏实现了一个简单的H5版本「狡兔三窟」游戏。
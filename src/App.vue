<script setup lang="ts">
import { onMounted, reactive, Ref, ref } from 'vue';

/**
 * 锤子组信息
 */
interface HammerItem {
  val: number[];
  y: number;
}

/**
 * 锤子数据
 */
interface HammerData {
  // 锤子列表
  list: HammerItem[];
  // 当前锤子
  current?: HammerItem;
}

/**
 * 初始化数据函数
 */
const initDataFun = {
  hammerDataCurrent() {
    return {
      val: [0, 0, 0],
      y: 0,
    };
  },
  hammerData(): HammerData {
    return {
      list: [],
      current: this.hammerDataCurrent(),
    };
  },
};

// 当前兔子所在坑位
let rabbitCurrentHome = ref(1);
// 锤子数据
let hammerData = reactive<HammerData>(initDataFun.hammerData());

// 获取屏幕可视高度
let clientHeight = document.body.clientHeight;
// 房子数据
let homeRef = ref();
let homeDomInfo = reactive({
  y: 0,
  height: 0,
});
// 定时器
let timer: number;
// 游戏状态 0: 待开始 1: 游戏中 -1: 游戏结束
let gameState = ref<0 | 1 | -1>(0);
// 倒计时
let countDown = ref(0);
// 游戏音乐Ref
let audio1 = ref();
// 切换兔子窝音乐Ref
let audio2 = ref();
// 命中音乐Ref
let audio3 = ref();
// 游戏结束音乐Ref
let audio4 = ref();

function playAudio(audio: Ref) {
  audio.value.currentTime = 0;
  audio.value.play();
}

// 切换兔子所在坑位
function clickHome(id: number) {
  playAudio(audio2);
  rabbitCurrentHome.value = id;
}

/**
 * 生成从minNum到maxNum的随机数
 */
function randomNum(minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      return parseInt(String(Math.random() * minNum + 1), 10);
      break;
    case 2:
      return parseInt(String(Math.random() * (maxNum - minNum + 1) + minNum), 10);
      break;
    default:
      return 0;
      break;
  }
}

/**
 * 生成锤子
 */
function generateHammer() {
  timer = setInterval(function () {
    if (hammerData.list.length < 5) {
      let data = randomNum(1, 6)
        .toString(2)
        .padStart(3, '0')
        .split('')
        .map((v) => {
          return parseInt(v);
        });
      hammerData.list.unshift({ val: data, y: 0 });
    }
  }, 1200);
}

onMounted(() => {
  homeDomInfo.y = homeRef.value.offsetTop;
  homeDomInfo.height = homeRef.value.offsetHeight;
});

/**
 * 检查击中
 */
function check() {
  let { list } = hammerData;
  let state = list.some((v) => {
    let { y, height } = homeDomInfo;
    let center = v.y + 71.5 / 2 - 5;
    let homeCenter = y + height / 2;
    let state =
      center > homeCenter - height * 0.25 &&
      center < homeCenter + height * 0.25 &&
      v.val.some((v, i) => {
        return v && i + 1 === rabbitCurrentHome.value;
      });
    if (state) {
      hammerData.current = v;
      playAudio(audio3);
    }
    return state;
  });
  if (!state) {
    hammerData.current = initDataFun.hammerDataCurrent();
  }
  return state;
}

/**
 * 锤子步进
 */
function hammerStep() {
  setTimeout(function () {
    if (check()) {
      clearInterval(timer);
      setTimeout(function () {
        gameState.value = -1;
        audio1.value.pause();
        playAudio(audio4);
      }, 600);
      return;
    }
    let { list } = hammerData;
    // 删除超出屏幕的锤子
    list = list.filter((v) => {
      return clientHeight > v.y;
    });
    // 移动锤子
    list = list.map((v) => {
      v.y += 3;
      return v;
    });
    hammerData.list = list;
    hammerStep();
  }, 1000 / 60);
}

/**
 * 锤子是否激活
 * @param item
 * @param index
 */
function hammerIsActive(item: HammerItem, index: number) {
  return hammerData.current === item && rabbitCurrentHome.value === index + 1;
}

/**
 * 根据碰撞状态增加active类
 * @param index 洞下标
 */
function checkHome(index: number) {
  let val = hammerData.current?.val[index - 1];
  return val && rabbitCurrentHome.value === index;
}

/**
 * 倒计时函数
 * @param num
 */
function countDownFn(num: Ref<number>) {
  return new Promise((resolve) => {
    let timer = setInterval(function () {
      num.value--;
      if (num.value <= 0) {
        clearInterval(timer);
        resolve(true);
      }
    }, 1000);
  });
}

/**
 * 初始化
 */
function init() {
  gameState.value = 1;
  rabbitCurrentHome.value = 1;
  hammerData = reactive(initDataFun.hammerData());
  playAudio(audio1);
  generateHammer();
  hammerStep();
}

/**
 * 开始
 */
function start() {
  gameState.value = 0;
  countDown.value = 3;
  countDownFn(countDown).then(() => {
    init();
  });
}

// init();
</script>

<template>
  <div class="container">
    <!-- 开始页面 -->
    <div class="start-page" v-if="gameState === 0" @click="start()">
      <div class="countdown" v-if="countDown > 0">{{ countDown }}</div>
      <div class="text-panel" v-else>
        <div class="text text-1">狡</div>
        <div class="text text-2">兔</div>
        <div class="text text-3">三</div>
        <div class="text text-4">窟</div>
      </div>
    </div>
    <!-- 锤子 -->
    <div class="hammer-panel">
      <div
        class="hammer__group"
        :style="{ '--y': `${item.y}px`, active: true }"
        v-for="item in hammerData.list"
        :key="item"
      >
        <img
          class="hammer__item"
          v-for="(item2, index) in item.val"
          :class="{ active: hammerIsActive(item, index) }"
          :key="item2"
          :src="
            item2
              ? '\n'+
'https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/8d868718094b09a011b68bb73f658b02.png'
              : 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E'
          "
        />
      </div>
    </div>
    <!-- 兔子窝 -->
    <div class="rabbit-home" ref="homeRef">
      <div class="rabbit-home__item" v-for="item in 3" :key="item" @click="clickHome(item)">
        <img
          class="rabbit"
          :class="{ active: rabbitCurrentHome === item }"
          src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/53d39b729489c52b80c57fc530570259.png"
        />
      </div>
    </div>
    <!-- 击中动画 -->
    <div class="rabbit-home-mask">
      <div
        class="rabbit-home-mask__item"
        :class="{ hammered: checkHome(item) }"
        v-for="item in 3"
        :key="item"
      ></div>
    </div>
    <!-- 游戏结束 -->
    <div class="game-over" v-if="gameState === -1">
      <img @click="start()" src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/ff1d38e27e8ad7fc52e7c0ce4ff46faf.png" />
    </div>

    <div>
      <audio ref="audio1" loop="loop">
        <source
          src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/ad5119cc6549d2c89754b022450b9cb4.mp3"
          type="audio/mpeg"
        />
      </audio>
      <audio ref="audio2">
        <source
          src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/fc52e301d266380d896c57e0784c088d.mp3"
          type="audio/mpeg"
        />
      </audio>
      <audio ref="audio3">
        <source
          src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/43aa8a13549683e6e276882a92348d00.mp3"
          type="audio/mpeg"
        />
      </audio>
      <audio ref="audio4">
        <source
          src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/c010480e4d8fb074581da3118b48c78c.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  background: bottom / 100% 100% no-repeat url('https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/a538f7135011a926b77eed6f72d0674c.jpeg');
  --hammerOffsetX: 35px;
  overflow: hidden;
}

.start-page,
.game-over {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.countdown {
  width: 1em;
  height: 1em;
  /*border:1px dashed rgba(255,255,255,0.1);*/
  font-size: 120px;
  font-family: Frijole;
  overflow: hidden;
  width: 1em;
  color: #e53f39;
  line-height: 1em;
  text-align: center;
  text-shadow: 1px 1px 2px;
}

.text-panel {
}

.text {
  height: 70px;
  display: inline-block;
  font-size: 50px;
  line-height: 1.2;
  font-family: Modak;
  padding-left: 7px;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 4px 4px 0px #d2d2d22e;
}

.text-1 {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 400 400'%3e%3cdefs%3e%3cfilter id='filter' width='400px' height='400px' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3e%3cfeFlood flood-color='%23f5576c' flood-opacity='1' x='0' y='0' width='250px' height='250px' result='flood3'%3e%3c/feFlood%3e%3cfeFlood flood-color='%23f093fb' flood-opacity='1' x='150px' y='150px' width='250px' height='250px' result='flood4'%3e%3c/feFlood%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood3' edgeMode='none' result='blur1'%3e%3c/feGaussianBlur%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood4' edgeMode='none' result='blur2'%3e%3c/feGaussianBlur%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur2' in2='SourceGraphic' result='blend5'%3e%3c/feBlend%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur1' in2='blend5' result='blend6'%3e%3c/feBlend%3e%3c/filter%3e%3c/defs%3e%3crect width='400' height='400' x='0' y='0' fill='%23fee140' filter='url(%23filter)'%3e%3c/rect%3e%3c/svg%3e");
}

.text-2 {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 400 400'%3e%3cdefs%3e%3cfilter id='filter' width='400px' height='400px' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3e%3cfeFlood flood-color='%238fd3f4' flood-opacity='1' x='0' y='0' width='250px' height='250px' result='flood3'%3e%3c/feFlood%3e%3cfeFlood flood-color='%2396e6a1' flood-opacity='1' x='150px' y='150px' width='250px' height='250px' result='flood4'%3e%3c/feFlood%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood3' edgeMode='none' result='blur1'%3e%3c/feGaussianBlur%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood4' edgeMode='none' result='blur2'%3e%3c/feGaussianBlur%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur2' in2='SourceGraphic' result='blend5'%3e%3c/feBlend%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur1' in2='blend5' result='blend6'%3e%3c/feBlend%3e%3c/filter%3e%3c/defs%3e%3crect width='400' height='400' x='0' y='0' fill='%23d4fc79' filter='url(%23filter)'%3e%3c/rect%3e%3c/svg%3e");
}

.text-3 {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 400 400'%3e%3cdefs%3e%3cfilter id='filter' width='400px' height='400px' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3e%3cfeFlood flood-color='%23cd9cf2' flood-opacity='1' x='0' y='0' width='250px' height='250px' result='flood3'%3e%3c/feFlood%3e%3cfeFlood flood-color='%23c2e9fb' flood-opacity='1' x='150px' y='150px' width='250px' height='250px' result='flood4'%3e%3c/feFlood%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood3' edgeMode='none' result='blur1'%3e%3c/feGaussianBlur%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood4' edgeMode='none' result='blur2'%3e%3c/feGaussianBlur%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur2' in2='SourceGraphic' result='blend5'%3e%3c/feBlend%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur1' in2='blend5' result='blend6'%3e%3c/feBlend%3e%3c/filter%3e%3c/defs%3e%3crect width='400' height='400' x='0' y='0' fill='%2366a6ff' filter='url(%23filter)'%3e%3c/rect%3e%3c/svg%3e");
}

.text-4 {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 400 400'%3e%3cdefs%3e%3cfilter id='filter' width='400px' height='400px' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3e%3cfeFlood flood-color='%230fd850' flood-opacity='1' x='0' y='0' width='250px' height='250px' result='flood3'%3e%3c/feFlood%3e%3cfeFlood flood-color='%2320E2D7' flood-opacity='1' x='80px' y='160px' width='250px' height='250px' result='flood4'%3e%3c/feFlood%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood3' edgeMode='none' result='blur1'%3e%3c/feGaussianBlur%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood4' edgeMode='none' result='blur2'%3e%3c/feGaussianBlur%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur2' in2='SourceGraphic' result='blend5'%3e%3c/feBlend%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur1' in2='blend5' result='blend6'%3e%3c/feBlend%3e%3c/filter%3e%3c/defs%3e%3crect width='400' height='400' x='0' y='0' fill='%23fbed96' filter='url(%23filter)'%3e%3c/rect%3e%3c/svg%3e");
}

.hammer-panel {
  width: 90vw;
  margin: 0 5vw;
  position: absolute;
  /*bottom: 45 px;*/
  z-index: 1;
  pointer-events: none;
}

.hammer__group {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  position: absolute;
  top: var(--y);
}

.hammer__item {
  width: 60px;
  height: 71.5px;
}

.hammer__item.active {
  animation: hammerActive ease 0.5s;
}

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

.rabbit-home,
.rabbit-home-mask {
  width: 90vw;
  margin: 0 5vw;
  position: absolute;
  bottom: 50px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}

.rabbit-home__item,
.rabbit-home-mask__item {
  width: 57px;
  height: calc(21px + 30px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rabbit-home__item {
  background: bottom no-repeat url('https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/e1e3518f6f797dd816bf91bb77cb3f8a.png');
  overflow: hidden;
}

.rabbit-home-mask {
  pointer-events: none;
}

.rabbit {
  width: 50px;
  height: 57.3px;
  position: relative;
  top: 55px;
  transition: top ease 0.5s;
}

.rabbit.active {
  top: 0;
}

.rabbit-home-mask__item.hammered:after {
  content: '';
  width: 79px;
  height: 72.5px;
  position: absolute;
  pointer-events: none;
  animation: hammeredActive ease 0.15s 0.4s;
}

@keyframes hammeredActive {
  0% {
    background: none;
  }
  50% {
    background: bottom / 100% 100% no-repeat url('https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/d099b0eda8bffafcaad9ef59c451c4dc.png');
  }
  75%,
  100% {
    background: none;
  }
}
</style>

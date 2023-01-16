<script setup lang="ts">
import { reactive, ref } from "vue";
import { convertNumToWord } from "@/utils/convertNumToWord";
import {
  clearIntervalPrecision,
  setIntervalPrecision,
} from "@/utils/IntervalPrecision";
import { randomNum } from "@/utils/randomNum";

const state = reactive({
  poetryList: getPoetryList(35, 94),
  totalNum: 35,
  footNum: 94,
  modeList: ["下一题", "出题"],
  currentMode: 0,
});
const penRef = ref<HTMLDivElement>();

/**
 * 处理数字转中文(补足三位数)
 * @param num
 */
function handleBunToStr(num: number) {
  let result = convertNumToWord(num);
  return num > 10 && num < 20 ? result.padStart(3, "一") : result;
}

/**
 * 获取诗词
 * @param totalNum
 * @param footNum
 */
function getPoetryList(totalNum: number, footNum: number) {
  let totalStr = handleBunToStr(totalNum);
  let footStr = handleBunToStr(footNum);
  return [
    "雉兔同笼",
    "今有雉兔同笼，",
    `上有${totalStr}头，`,
    `下有${footStr}足，`,
    "问雉兔各几何？",
  ];
}

/**
 * 生成诗词动画
 * @param totalNum
 * @param footNum
 */
function setPoetryList(
  totalNum: number,
  footNum: number,
  answer?: { state: boolean; rabbitNum: number; chickenNum: number }
) {
  let list: string[] = [];
  state.poetryList = [""];
  let result = state.poetryList;
  getPoetryList(totalNum, footNum).forEach((v, i) => {
    if (i === 0) {
      list.push(v);
      return;
    }
    list.push("\n");
    v.split("").forEach((v) => {
      list.push(v);
    });
  });
  if (answer) {
    let str = `答曰：\n${
      answer.state
        ? `${convertNumToWord(answer.rabbitNum)}兔\n${convertNumToWord(
            answer.chickenNum
          )}雉`
        : "未知"
    }`;
    list.push("\n");
    str.split("").forEach((v) => {
      list.push(v);
    });
  }
  console.log(list);
  let timer = setIntervalPrecision(() => {
    if (list[0] === "\n") {
      list.shift();
      result.push("");
    }
    let str = list.shift();
    let lineStr = result[result.length - 1];
    lineStr += str;
    result[result.length - 1] = lineStr;
    if (list.length === 0) {
      clearIntervalPrecision(timer);
    }
  }, 1000 / 15);
}

/**
 * 计算鸡兔数量
 * @param totalNum
 * @param footNum
 */
function getChickenRabbit(totalNum: number, footNum: number) {
  let state = true;
  let rabbitFootNum = footNum - totalNum * 2;
  let rabbitNum = rabbitFootNum / 2;
  let chickenNum = totalNum - rabbitNum;
  if (String(`${rabbitNum}${chickenNum}`).includes(".")) {
    state = false;
  }
  return {
    state,
    chickenNum: state ? chickenNum : 0,
    rabbitNum: state ? rabbitNum : 0,
  };
}

/**
 * 答题处理函数
 */
function inputHandle() {
  let str = prompt("请输入兔子数量");
  if (str) {
    if (!/^\d+$/.test(str)) {
      return alert("输入格式不正确");
    }
    let { totalNum, footNum } = state;
    let { chickenNum } = getChickenRabbit(totalNum, footNum);
    console.log(chickenNum);
    if (Number(str) === getChickenRabbit(totalNum, footNum).chickenNum) {
      alert("恭喜您！答对了");
    } else {
      alert("非常遗憾！答错了。\n继续加油吧!");
    }
  }
}

/**
 * 随机出题
 */
function randomQuestion() {
  let rabbitNum = randomNum(0, 249);
  let chickenNum = randomNum(0, (999 - 4 * rabbitNum) / 2);
  setPoetryList(rabbitNum + chickenNum, rabbitNum * 4 + chickenNum * 2);
}

/**
 * 出题处理函数
 */
function setAQuestion() {
  let str = prompt("请输入头数和脚数(不得大于1000如：35,94):");
  if (str) {
    if (!/^\d{1,3},\d{1,3}$/.test(str)) {
      return alert("输入格式不正确");
    }
    let numList = str.split(",").map((v) => {
      return parseInt(v);
    });
    state.totalNum = numList[0];
    state.footNum = numList[1];
    setPoetryList(
      state.totalNum,
      state.footNum,
      getChickenRabbit(state.totalNum, state.footNum)
    );
  }
}

/**
 * 切换答题/出题模式
 * @param index
 */
function changeMode(index: number) {
  state.currentMode = index;
  switch (index) {
    case 0:
      randomQuestion();
      break;
    case 1:
      setAQuestion();
      break;
  }
}

// 初始化
randomQuestion();
</script>

<template>
  <div class="container">
    <div class="mode">
      <div
        class="mode__item"
        :class="{ active: state.currentMode === index }"
        v-for="(item, index) in state.modeList"
        :key="item"
        @click="changeMode(index)"
      >
        {{ item }}
      </div>
    </div>
    <div class="poetry">
      <div class="poetry-item" v-for="item in state.poetryList" :key="item">
        {{ item }}
      </div>
      <div class="poetry-item">问雉兔各几何？</div>
    </div>
    <img
      @click="inputHandle"
      class="pen"
      ref="penRef"
      src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/1688378cfe7a25110b72fc39a8aa33e2.png"
    />
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: bottom left / 150% 100% no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/ad34998642f23e85adf985c8b1d60a3d.png");
  position: relative;
}

.mode {
  display: flex;
  padding: 20px;
}
.mode__item.active {
  color: #1e80ff;
}
.mode :not(.mode__item:last-child):after {
  content: "\u00A0/\u00A0";
  color: #2c3e50;
}

.poetry {
  font-size: 30px;
  font-family: Font10970;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  color: #000000;
}

.poetry-item {
  line-height: 1.5;
}

.poetry-item:nth-child(n + 7):nth-child(-n + 8) {
  text-align: center;
}
.poetry .poetry-item:first-child {
  text-align: center;
  margin-bottom: 10px;
}
.poetry .poetry-item:last-child {
  visibility: hidden;
}

.pen {
  width: 81.57px;
  height: 170px;
  position: fixed;
  top: calc(100vh - 31px - 170px);
  /**
  left: calc(100vw - 0px - 81.57px);
   */
  left: 78.248vw;
}
</style>

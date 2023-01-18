<script setup lang="ts">
import { reactive } from "vue";
import { randomNum } from "@/utils/randomNum";
/**
 * 难度
 */
const difficultyList = {
  1: {
    id: 1,
    count: 3,
    title: "简单",
  },
  2: {
    id: 2,
    count: 5,
    title: "容易",
  },
  3: {
    id: 3,
    count: 7,
    title: "困难",
  },
};
const state = reactive<{
  /**
   * 难度
   */
  difficultyId: 1 | 2 | 3;
  /**
   * 卡牌列表
   */
  cardList: {
    /**
     * 待发牌状态
     */
    wait: boolean;
    /**
     * 激活状态
     */
    active: boolean;
    /**
     * 值
     */
    value: number;
  }[][];
  /**
   * 激活的卡列表
   */
  activeCardList: any[];
  /**
   * 翻转动画时长
   */
  transformDuration: number;
  /**
   * 销毁数量
   */
  destroyedNum: number;
  /**
   * 点击次数
   */
  clickNum: number;
  /**
   * 时间记录
   */
  startTime: number;
}>({
  difficultyId: 1,
  cardList: [],
  activeCardList: [],
  transformDuration: 500,
  destroyedNum: 0,
  clickNum: 0,
  startTime: 0,
});

/**
 * 随机排序
 * @param list
 */
function sort(list: number[]) {
  return list.sort((a, b) => (randomNum(0, 1) ? -1 : 1));
}

/**
 * 生成牌
 */
function initCards() {
  state.destroyedNum = 0;
  state.startTime = 0;
  state.clickNum = 0;
  state.cardList = [];
  let imgIds = sort(sort([0, 1, 2, 3, 4, 5, 6])).slice(
    0,
    difficultyList[state.difficultyId].count
  );
  // 生成12对牌并打乱顺序
  let valueList: number[] = [-1];
  for (let i = 0; i < 12; i++) {
    let value = imgIds[randomNum(0, 6) % imgIds.length];
    valueList.push(value);
    valueList.push(value);
    valueList = sort(valueList);
  }

  for (let i = 0; i < 10; i++) {
    valueList = sort(valueList);
  }

  for (let i = 0; i < 5; i++) {
    state.cardList.push([]);
    for (let j = 0; j < 5; j++) {
      state.cardList[i].push({
        wait: true,
        active: false,
        value: valueList.pop()!,
      });
    }
  }
  dealCards(false);
}

/**
 * 发牌或者收牌
 */
function dealCards(wait: boolean) {
  return new Promise((resolve) => {
    state.cardList.forEach((v, i) => {
      v.forEach((v2, i2) => {
        setTimeout(() => {
          v2.wait = wait;
          if (i2 === v.length - 1 && i === state.cardList.length - 1) {
            setTimeout(() => {
              resolve(true);
            }, state.transformDuration);
          }
        }, (i * v.length + i2) * 150);
      });
    });
  });
}

let lock = false;
/**
 * 点击处理函数
 * @param rowI
 * @param colI
 */
function clickCard(rowI: number, colI: number) {
  if (lock) return;
  lock = true;
  let item = state.cardList[rowI][colI];
  if (item.active || state.activeCardList.length >= 2) {
    lock = false;
    return;
  }
  if (state.clickNum === 0) {
    state.startTime = Date.now();
  }
  state.clickNum++;
  item.active = true;
  state.activeCardList.push(item);
  setTimeout(() => {
    if (state.activeCardList.length === 2 || item.value === -1) {
      let [card1] = state.activeCardList;
      let wait = false;
      if (card1.value === item.value) {
        wait = true;
      }
      state.activeCardList.forEach((v) => {
        v.wait = wait;
        v.active = wait;
        wait && state.destroyedNum++;
      });
      state.activeCardList = [];
      if (state.destroyedNum >= 25) {
        setTimeout(passSuccess, state.transformDuration);
      }
    }
    lock = false;
  }, state.transformDuration);
}

function passSuccess() {
  let storageKey = "xtfflPreResultData";
  let endTime = Date.now();
  let time = (endTime - state.startTime) / 1000;
  let dataStr = localStorage.getItem(storageKey);
  let data = { clickNum: 0, time: 0 };

  let clickMsg = `\n你共点击了${state.clickNum}次，`;
  let timeMsg = `\n花费了${time}秒，`;
  let encourageMsg = `\n再玩一局吧!!!`;
  if (dataStr) {
    data = JSON.parse(dataStr);
    let clickNumTemp = state.clickNum - data.clickNum;
    if (clickNumTemp === 0) {
      clickMsg += `和上次差不多`;
    } else {
      clickMsg += `比上次${clickNumTemp > 0 ? "多" : "少"}用${Math.abs(
        clickNumTemp
      )}次`;
    }

    let timeTemp = time - data.time;
    if (timeTemp !== 0) {
      timeMsg += `比上次${timeTemp > 0 ? "慢" : "快"}了${Math.abs(
        timeTemp
      )}秒哦~`;
    }

    if (time < data.time || state.clickNum < data.clickNum) {
      encourageMsg = `\n您可太厉害了ヾ(@^▽^@)ノ`;
    } else {
      encourageMsg = `\n继续加油哦o(￣▽￣)ｄ good`;
    }
  }
  let msg = `恭喜您，通关成功！${clickMsg}${timeMsg}${encourageMsg}`;
  localStorage.setItem(
    storageKey,
    JSON.stringify({ clickNum: state.clickNum, time })
  );
  alert(msg);
  initCards();
}

/**
 * 切换难度
 * @param id
 */
function clickDifficulty(id: 1 | 2 | 3) {
  state.difficultyId = id;
  dealCards(true).then(() => {
    initCards();
  });
}

initCards();
</script>

<template>
  <div
    class="container"
    :style="{ '--transformDuration': `${state.transformDuration}ms` }"
  >
    <div class="row" v-for="(item, index) in state.cardList" :key="index">
      <div class="col" v-for="(item2, index2) in item" :key="index2">
        <div
          class="card"
          :class="{ active: item2.active, wait: item2.wait }"
          :style="{
            '--index': state.cardList.length - index,
            '--index2': item.length - 1 - index2,
          }"
          @click="clickCard(index, index2)"
        >
          <div class="card__bg">
            <div class="img" :class="`img${item2.value}`"></div>
          </div>
          <div class="card__fg"></div>
        </div>
      </div>
    </div>
    <div class="difficulty">
      <div
        class="difficulty__item"
        :class="{ active: item.id === state.difficultyId }"
        v-for="item in Object.values(difficultyList)"
        :key="item.id"
        @click="clickDifficulty(item.id)"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  position: unset;
}
:global(body) {
  overflow: hidden;
  margin: 0;
  padding: 0;
  background-color: #efefef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  width: 375px;
  height: 667px;
  background-color: white;
  background: top / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/942dbeeea94ce55c434b2acd1dcc27fd.png");
  position: relative;
  border-radius: 10px;
  --cardWithd: 57px;
  --cardHeight: 88px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 15px 0;
}

.col {
  width: var(--cardWithd);
  height: var(--cardHeight);
}

.card {
  width: var(--cardWithd);
  height: var(--cardHeight);
  transform-style: preserve-3d;
  transition: transform var(--transformDuration);
}
.card.active {
  transform: rotateY(180deg);
}
.card.wait {
  transform: translate(
    calc((var(--cardWithd) + 15px) * var(--index2)),
    calc((var(--cardHeight) + 30px) * var(--index))
  );
}
.card.wait.active {
  transform: translate(
      calc((var(--cardWithd) + 15px) * var(--index2)),
      calc((var(--cardHeight) + 30px) * var(--index))
    )
    rotateY(180deg);
}
.card__bg,
.card__fg {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  border-radius: 3px;
}
.card__bg {
  transform: rotateY(180deg);
  background-color: #ffffff;
}
.card__fg {
  background: top / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/5fc18d22b6e42cf17f5ea1123a149024.jpg");
}

.card__bg .img {
  width: 100%;
  height: 100%;
}

.img-1 {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='200px' height='200px' viewBox='0 0 400 400'%3e%3cdefs%3e%3cfilter id='filter' width='400px' height='400px' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3e%3cfeFlood flood-color='%230fd850' flood-opacity='1' x='0' y='0' width='250px' height='250px' result='flood3'%3e%3c/feFlood%3e%3cfeFlood flood-color='%2320E2D7' flood-opacity='1' x='80px' y='160px' width='250px' height='250px' result='flood4'%3e%3c/feFlood%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood3' edgeMode='none' result='blur1'%3e%3c/feGaussianBlur%3e%3cfeGaussianBlur stdDeviation='50 50' x='0%25' y='0%25' width='100%25' height='100%25' in='flood4' edgeMode='none' result='blur2'%3e%3c/feGaussianBlur%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur2' in2='SourceGraphic' result='blend5'%3e%3c/feBlend%3e%3cfeBlend mode='normal' x='0%25' y='0%25' width='100%25' height='100%25' in='blur1' in2='blend5' result='blend6'%3e%3c/feBlend%3e%3c/filter%3e%3c/defs%3e%3crect width='400' height='400' x='0' y='0' fill='%23fbed96' filter='url(%23filter)'%3e%3c/rect%3e%3c/svg%3e");
}
.img0 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/8908454e97aea2b6a3e17e3766e7419b.png");
}
.img1 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/f7cefaf3a574a17db221d2e109a45c74.png");
}
.img2 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/346eb7d7b989523f66919cbbdf7eae66.png");
}
.img3 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/cd8257592098d9e29cbc4957095b42b1.png");
}
.img4 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/5564871a5475cc3f4467a375d7e692e0.png");
}
.img5 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/6fe0b217cfae7ef4bda8f3e6c337e8d1.png");
}
.img6 {
  background: center / contain no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/29aeaa6d2992074552af738fb953ec40.png");
}

.difficulty {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-align: center;
  border-radius: 50px;
  //padding: 0 10px;
  margin: 15px;
  overflow: hidden;
}
.difficulty__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 30px;
  transition: background-color 0.5s ease-in-out;
  background-color: #ffffff;
}
.difficulty__item.active {
  background-color: #1e80ff;
  color: #ffffff;
}
</style>

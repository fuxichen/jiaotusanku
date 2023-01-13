<script setup lang="ts">
import { reactive } from "vue";

let state = reactive({
  poetryList: [
    "雉兔同笼",
    "今有雉兔同笼，",
    "上有三十五头，",
    "下有九十四足，",
    "问雉兔各几何？",
  ],
});
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
</script>

<template>
  <div class="container">
    <div class="poetry">
      <div class="poetry-item" v-for="item in state.poetryList" :key="item">
        {{ item }}
      </div>
    </div>
    <img
      class="pen"
      src="https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/1688378cfe7a25110b72fc39a8aa33e2.png"
    />
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: bottom / 100% 100% no-repeat
    url("https://my-picture-bucket.oss-cn-hongkong.aliyuncs.com/assets/5b2e4bcd39b910c41224605b7d7c9436.jpg");
  position: relative;
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
.poetry .poetry-item:first-child {
  text-align: center;
  margin-bottom: 10px;
}
.pen {
  width: 81.57px;
  height: 170px;
  position: fixed;
  bottom: 37px;
  right: 2px;
}
.pen.active {
}
</style>

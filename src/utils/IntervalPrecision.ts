type Callback = (count: number) => any;
interface LoopMap {
  /**
   * id
   */
  id: number;
  /**
   * 开始时间
   */
  startTime: number;
  /**
   * 延迟时间
   */
  delay: number;
  /**
   * 已执行次数
   */
  count: number;
  /**
   * 回调函数
   * @param count
   */
  callback: Callback;
}
const loopMap = new Map<number, LoopMap>();
let num = 0;
(function loop() {
  // 定时器被清除，则终止
  Array.from(loopMap.keys()).forEach((key) => {
    const obj = loopMap.get(key);
    if (!obj) return;

    // 满足条件执行回调
    if (+new Date() > obj.startTime + obj.delay * (obj.count + 1)) {
      obj.count++;
      obj.callback(obj.count);
    }
  });

  requestAnimationFrame(loop);
})();

/**
 * 设置精度定时器
 * https://www.cnblogs.com/whosmeya/p/14135507.html
 * @param {function} 回调函数
 * @param {number}   延迟时间
 * @return {number}  定时器ID
 */
export function setIntervalPrecision(
  callback: Callback,
  delay: number
): number {
  // 生成并记录定时器ID
  const intervalId = ++num;

  loopMap.set(intervalId, {
    id: intervalId,
    startTime: +new Date(),
    delay: delay || 0,
    count: 0,
    callback,
  });
  return intervalId;
}

/**
 * 清除精度定时器
 * @param {number} 定时器ID
 */
export function clearIntervalPrecision(intervalId: number) {
  if (intervalId) {
    loopMap.delete(intervalId);
  }
}

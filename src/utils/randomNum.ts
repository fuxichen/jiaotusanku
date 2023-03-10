/**
 * 生成从minNum到maxNum的随机数
 */
export function randomNum(minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      return parseInt(String(Math.random() * minNum + 1), 10);
    case 2:
      return parseInt(
        String(Math.random() * (maxNum - minNum + 1) + minNum),
        10
      );
    default:
      return 0;
  }
}

/**
 * 数字转中文
 * @param num 数字
 */
export function convertNumToWord(num: number) {
  const arr1 = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const arr2 = [
    "",
    "十",
    "百",
    "千",
    "万",
    "十",
    "百",
    "千",
    "亿",
    "十",
    "百",
    "千",
    "万",
    "十",
    "百",
    "千",
    "亿",
  ];
  if (!num || isNaN(num)) return "零";
  const english = num.toString().split("");
  let result = "";
  for (let i = 0; i < english.length; i++) {
    const des_i = english.length - 1 - i; // 倒序排列设值
    result = arr2[i] + result;
    const arr1_index = Number(english[des_i]);
    result = arr1[arr1_index] + result;
  }
  result = result.replace(/零(千|百|十)/g, "零").replace(/十零/g, "十"); // 将【零千、零百】换成【零】 【十零】换成【十】
  result = result.replace(/零+/g, "零"); // 合并中间多个零为一个零
  result = result.replace(/零亿/g, "亿").replace(/零万/g, "万"); // 将【零亿】换成【亿】【零万】换成【万】
  result = result.replace(/亿万/g, "亿"); // 将【亿万】换成【亿】
  result = result.replace(/零+$/, ""); // 移除末尾的零
  // 将【一十】换成【十】
  result = result.replace(/^一十/g, "十");
  return result;
}

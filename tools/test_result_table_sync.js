const fs = require("fs");
const vm = require("vm");

const context = { console };
vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync("data.js", "utf8")}
globalThis.results = FBTI_DATA.results;`,
  context,
);

const expected = [
  ["规则坚守×团队至上", "隐身者", "梅西", "梅西 隐身梅"],
  ["规则坚守×个人英雄", "绅士", "莫德里奇", ""],
  ["荣誉至上×团队至上", "红牌英雄", "巴尔韦德", ""],
  ["荣誉至上×个人英雄", "独裁者", "姆巴佩", "c罗 数据罗"],
  ["规则坚守×保守求稳", "老实人", "坎特", "梅西 隐身梅"],
  ["规则坚守×冒险激进", "骑士", "贝林厄姆", ""],
  ["荣誉至上×保守求稳", "卧草者", "大马丁", ""],
  ["荣誉至上×冒险激进", "跳水者", "C罗", "c罗 跳水罗"],
  ["规则坚守×冷静隐忍", "小鹿斑比", "穆西亚拉", "梅西 受气梅"],
  ["规则坚守×张扬外放", "魔人布欧", "哈兰德", ""],
  ["荣誉至上×冷静隐忍", "黄牌大师", "卡塞米罗", ""],
  ["荣誉至上×张扬外放", "挑衅者", "维尼修斯", "c罗 詹姆斯"],
  ["团队至上×保守求稳", "回传者", "赖斯", "梅西 詹姆斯"],
  ["团队至上×冒险激进", "抽奖者", "维尔茨", ""],
  ["个人英雄×保守求稳", "吃饼者", "哈兰德", ""],
  ["个人英雄×冒险激进", "舞者", "内马尔", "c罗 浪射罗"],
  ["团队至上×冷静隐忍", "“我的”人", "哈利凯恩", "梅西 散步梅"],
  ["团队至上×张扬外放", "保镖", "德保罗", ""],
  ["个人英雄×冷静隐忍", "亚洲式球王", "孙兴慜", ""],
  ["个人英雄×张扬外放", "皇毛", "亚马尔", "c罗 摊手罗"],
  ["保守求稳×冷静隐忍", "苟分者", "罗德里", "梅西 散步梅"],
  ["保守求稳×张扬外放", "场上教练", "基米希", ""],
  ["冒险激进×冷静隐忍", "带派者", "奥利赛", ""],
  ["冒险激进×张扬外放", "摊手者", "B费", "c罗 越位罗"],
];

const actual = context.results.map((result) => [
  result.key,
  result.label,
  result.player,
  result.extreme || "",
]);

if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(
    `Result table mismatch.\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`,
  );
}

console.log("All 24 result rows match the latest player classification table.");

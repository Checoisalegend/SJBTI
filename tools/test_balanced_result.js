const fs = require("fs");
const vm = require("vm");

const noop = () => {};
const element = () => ({
  classList: { toggle: noop, add: noop, remove: noop },
  style: { setProperty: noop },
  dataset: {},
  addEventListener: noop,
  querySelectorAll: () => [],
  removeAttribute: noop,
  set textContent(value) {},
  get textContent() {
    return "";
  },
  set innerHTML(value) {},
  get innerHTML() {
    return "";
  },
  disabled: false,
  hidden: false,
});

const context = {
  console,
  document: { getElementById: element },
  window: { scrollTo: noop, setTimeout: noop },
  navigator: { clipboard: { writeText: noop } },
};

vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync("data.js", "utf8")}
${fs.readFileSync("copy.js", "utf8")}
${fs.readFileSync("app.js", "utf8")}
globalThis.testBalanced = (answerCode, hiddenAnswers = {}) => {
  app.answers = { gate: "both", offPitchLife: "play", answerMode: "precise", ...hiddenAnswers };
  FBTI_DATA.questionBanks.fan.forEach((question) => {
    app.answers[question.id] = answerCode;
  });
  const result = getFinalResult();
  return {
    label: result.final.label,
    player: result.final.player,
    strengths: result.scoreRows.map((row) => row.strength),
  };
};`,
  context,
);

for (const answerCode of ["A", "B", "C", "D", "E"]) {
  const result = context.testBalanced(answerCode);
  const allEqual = result.strengths.every((strength) => strength === result.strengths[0]);
  if (result.label !== "勤笑公" || result.player !== "莱奥" || !allEqual) {
    throw new Error(`${answerCode} balanced result mismatch: ${JSON.stringify(result)}`);
  }
}

console.log("Equal four-dimension strengths trigger 勤笑公 / 莱奥.");


const fs = require("fs");
const vm = require("vm");

const noop = () => {};
const element = () => ({
  classList: { toggle: noop, add: noop, remove: noop },
  style: {},
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
${fs.readFileSync("app.js", "utf8")}
globalThis.scoreScenario = (scenario) => {
  app.answers = { gate: "both" };
  FBTI_DATA.questionBanks.fan.forEach((question) => {
    const answers = {
      leftStrong: question.leftFirst ? "A" : "E",
      leftWeak: question.leftFirst ? "B" : "D",
      neutral: "C",
      rightWeak: question.leftFirst ? "D" : "B",
      rightStrong: question.leftFirst ? "E" : "A",
    };
    app.answers[question.id] = answers[scenario];
  });
  return computeScores().map((row) => ({
    key: row.key,
    average: row.average,
    side: row.side,
    resultSide: row.resultSide,
    strength: row.strength,
  }));
};`,
  context,
);

const scenarios = {
  leftStrong: { average: -100, strength: 1 },
  leftWeak: { average: -50, strength: 0.5 },
  neutral: { average: 0, strength: 0 },
  rightWeak: { average: 50, strength: 0.5 },
  rightStrong: { average: 100, strength: 1 },
};

for (const [scenario, expected] of Object.entries(scenarios)) {
  const rows = context.scoreScenario(scenario);
  for (const row of rows) {
    if (row.average !== expected.average || row.strength !== expected.strength) {
      throw new Error(`${scenario} mismatch: ${JSON.stringify(row)}`);
    }
    if (scenario === "neutral" && row.side !== "中立") {
      throw new Error(`Neutral side mismatch: ${JSON.stringify(row)}`);
    }
  }
  console.log(scenario, rows);
}

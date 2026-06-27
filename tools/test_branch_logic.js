const fs = require("fs");
const vm = require("vm");

const noop = () => {};
const element = () => ({
  classList: { toggle: noop, add: noop, remove: noop },
  style: {},
  addEventListener: noop,
  querySelectorAll: () => [],
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
${fs.readFileSync("copy.js", "utf8")}
${fs.readFileSync("app.js", "utf8")}
globalThis.testTrollSide = (trollSide) => {
  app.answers = { gate: "meme", memeDepth: "troll", trollSide };
  const state = getIntroState();
  return {
    segment: state.segment,
    label: state.segmentLabel,
    hidden: state.hidden,
    total: getDisplayTotal(),
    questionIds: getFlow().map((question) => question.id),
  };
};`,
  context,
);

const cases = {
  A: ["fakeMessi", "novice", "troll"],
  B: ["fakeRonaldo", "novice", "troll"],
  C: ["both", "novice", "troll"],
  D: ["joke", "fan", null],
  E: ["skewer", "fan", null],
};

for (const [code, [answer, segment, hidden]] of Object.entries(cases)) {
  const result = context.testTrollSide(answer);
  if (result.segment !== segment || result.hidden !== hidden) {
    throw new Error(`${code} branch mismatch: ${JSON.stringify(result)}`);
  }
  const shouldSkipHiddenQuestion = hidden === "troll";
  if (result.questionIds.includes("offPitchLife") === shouldSkipHiddenQuestion) {
    throw new Error(`${code} hidden-question mismatch: ${JSON.stringify(result)}`);
  }
  console.log(code, result);
}


const fs = require("fs");
const vm = require("vm");

const noop = () => {};
const element = () => ({
  classList: { toggle: noop, add: noop, remove: noop },
  style: {},
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
globalThis.inspectAnswerMode = (mode) => {
  app.answers = { gate: "both", answerMode: mode };
  const regularQuestion = FBTI_DATA.questionBanks.fan[0];
  return {
    regularCodes: normalizeOptions(regularQuestion).map((option) => option.code),
    hiddenCodes: normalizeOptions(FBTI_DATA.hiddenQuestion).map((option) => option.code),
    strongLeft: getQuestionScore(regularQuestion, "A"),
    neutral: getQuestionScore(regularQuestion, "C"),
    strongRight: getQuestionScore(regularQuestion, "E"),
  };
};`,
  context,
);

const precise = context.inspectAnswerMode("precise");
const quick = context.inspectAnswerMode("quick");

if (precise.regularCodes.join("") !== "ABCDE") {
  throw new Error(`Precise mode mismatch: ${JSON.stringify(precise)}`);
}

if (quick.regularCodes.join("") !== "ACE") {
  throw new Error(`Quick mode mismatch: ${JSON.stringify(quick)}`);
}

if (precise.hiddenCodes.join("") !== "ABCDE" || quick.hiddenCodes.join("") !== "ABCDE") {
  throw new Error(`Hidden question mode mismatch: ${JSON.stringify({ precise, quick })}`);
}

if (quick.strongLeft !== -100 || quick.neutral !== 0 || quick.strongRight !== 100) {
  throw new Error(`Quick mode scoring mismatch: ${JSON.stringify(quick)}`);
}

console.log({ precise, quick });


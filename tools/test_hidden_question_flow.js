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
${fs.readFileSync("copy.js", "utf8")}
${fs.readFileSync("app.js", "utf8")}
globalThis.inspectFlow = (answers) => {
  app.answers = answers;
  return {
    total: getDisplayTotal(),
    ids: getFlow().map((question) => question.id),
    state: getIntroState(),
  };
};`,
  context,
);

const scenarios = [
  {
    name: "normal",
    answers: { gate: "both" },
    hidden: null,
    includesOffPitch: true,
    total: 19,
  },
  {
    name: "novice",
    answers: { gate: "unknown" },
    hidden: null,
    includesOffPitch: true,
    total: 19,
  },
  {
    name: "fun",
    answers: { gate: "meme", memeDepth: "debateOnly" },
    hidden: "fun",
    includesOffPitch: false,
    total: 19,
  },
  {
    name: "troll",
    answers: { gate: "meme", memeDepth: "troll", trollSide: "both" },
    hidden: "troll",
    includesOffPitch: false,
    total: 20,
  },
];

for (const scenario of scenarios) {
  const result = context.inspectFlow(scenario.answers);
  const includesOffPitch = result.ids.includes("offPitchLife");
  const offPitchIndex = result.ids.indexOf("offPitchLife");
  const modeQuestionIndex = result.ids.indexOf("answerMode");
  const firstFormalQuestionIndex = result.ids.findIndex(
    (id) => id.startsWith("fan_") || id.startsWith("novice_"),
  );
  if (
    result.state.hidden !== scenario.hidden ||
    includesOffPitch !== scenario.includesOffPitch ||
    result.total !== scenario.total ||
    modeQuestionIndex < 0 ||
    modeQuestionIndex !== firstFormalQuestionIndex - 1 ||
    (scenario.includesOffPitch && offPitchIndex !== modeQuestionIndex - 1)
  ) {
    throw new Error(`${scenario.name} mismatch: ${JSON.stringify(result)}`);
  }
  console.log(scenario.name, {
    hidden: result.state.hidden,
    includesOffPitch,
    total: result.total,
  });
}


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
globalThis.inspectOffPitch = (answers) => {
  app.answers = { gate: "both", ...answers };
  const introState = getIntroState();
  const flow = getFlow();
  const override = getHiddenOverride(introState);
  return {
    segment: getTestingSegment(introState),
    ids: flow.map((question) => question.id),
    override: override && override.label,
  };
};`,
  context,
);

const scenarios = [
  { answers: { offPitchLife: "play" }, segment: "fan", confirmation: null, override: null },
  { answers: { offPitchLife: "watch" }, segment: "fan", confirmation: null, override: null },
  { answers: { offPitchLife: "neither" }, segment: "novice", confirmation: null, override: null },
  {
    answers: { offPitchLife: "game", gameAffinity: "C" },
    segment: "novice",
    confirmation: "gameAffinity",
    override: null,
  },
  {
    answers: { offPitchLife: "game", gameAffinity: "D" },
    segment: "novice",
    confirmation: "gameAffinity",
    override: "游戏王",
  },
  {
    answers: { offPitchLife: "cat", catAffinity: "A" },
    segment: "novice",
    confirmation: "catAffinity",
    override: null,
  },
  {
    answers: { offPitchLife: "cat", catAffinity: "E" },
    segment: "novice",
    confirmation: "catAffinity",
    override: "哈基米",
  },
];

for (const scenario of scenarios) {
  const result = context.inspectOffPitch(scenario.answers);
  const confirmationIndex = scenario.confirmation
    ? result.ids.indexOf(scenario.confirmation)
    : -1;
  const modeIndex = result.ids.indexOf("answerMode");

  if (
    result.segment !== scenario.segment ||
    result.override !== scenario.override ||
    (scenario.confirmation && confirmationIndex !== modeIndex - 1) ||
    (!scenario.confirmation &&
      (result.ids.includes("gameAffinity") || result.ids.includes("catAffinity")))
  ) {
    throw new Error(`${JSON.stringify(scenario)} mismatch: ${JSON.stringify(result)}`);
  }
}

console.log("Off-pitch branching and confirmation logic passed.");


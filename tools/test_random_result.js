const fs = require("fs");
const vm = require("vm");

const noop = () => {};
const element = () => ({
  classList: { toggle: noop, add: noop, remove: noop, contains: () => false },
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
  Math,
  document: { getElementById: element },
  window: { scrollTo: noop, setTimeout: noop, addEventListener: noop },
  navigator: { clipboard: { writeText: noop } },
};

vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync("data.js", "utf8")}
${fs.readFileSync("app.js", "utf8")}
globalThis.testRandomResult = (index) => {
  app.answers = { gate: "both", offPitchLife: "play", answerMode: "random" };
  app.randomResultIndex = index;
  const result = getFinalResult();
  return {
    type: result.type,
    label: result.final.label,
    player: result.final.player,
    expectedLabel: FBTI_DATA.results[index].label,
    expectedPlayer: FBTI_DATA.results[index].player,
  };
};`,
  context,
);

for (const index of [0, 8, 17, 23]) {
  const result = context.testRandomResult(index);
  if (
    result.type !== "random" ||
    result.label !== result.expectedLabel ||
    result.player !== result.expectedPlayer
  ) {
    throw new Error(`Random result mismatch: ${JSON.stringify(result)}`);
  }
}

console.log("Random answer mode returns a standard personality directly.");

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
globalThis.presentationCoverage = {
  standard: FBTI_DATA.results.map((result) => result.label),
  hidden: Object.values(FBTI_DATA.hiddenResults).map((result) => result.label),
  extreme: FBTI_DATA.results
    .filter((result) => result.extreme)
    .map((result) => parseExtremeResult(result.extreme).label),
  available: Object.keys(RESULT_PRESENTATION),
};`,
  context,
);

const required = new Set([
  ...context.presentationCoverage.standard,
  ...context.presentationCoverage.hidden,
  ...context.presentationCoverage.extreme,
]);
const available = new Set(context.presentationCoverage.available);
const missing = [...required].filter((label) => !available.has(label));

if (missing.length > 0) {
  throw new Error(`Missing result presentation copy: ${missing.join(", ")}`);
}

console.log(`Presentation copy covers all ${required.size} result labels.`);

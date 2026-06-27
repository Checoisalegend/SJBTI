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
globalThis.presentationCoverage = {
  standard: FBTI_DATA.results.map((result) => result.label),
  special: [
    ...Object.values(FBTI_DATA.hiddenResults).map((result) => result.label),
    ...FBTI_DATA.results
      .filter((result) => result.extreme)
      .map((result) => parseExtremeResult(result.extreme).presentationKey || parseExtremeResult(result.extreme).label),
  ],
  standardAvailable: Object.keys(SJBTI_COPY.standardResults),
  specialAvailable: Object.keys(SJBTI_COPY.specialResults),
  missingVariants: FBTI_DATA.results
    .map((result) => result.label)
    .filter((label) => {
      const entry = SJBTI_COPY.standardResults[label];
      return !entry?.slogan || !entry.descriptions?.novice || !entry.descriptions?.fan;
    }),
};`,
  context,
);

const standardAvailable = new Set(context.presentationCoverage.standardAvailable);
const specialAvailable = new Set(context.presentationCoverage.specialAvailable);
const missing = [
  ...context.presentationCoverage.standard.filter((label) => !standardAvailable.has(label)),
  ...context.presentationCoverage.special.filter((label) => !specialAvailable.has(label)),
];

if (missing.length > 0) {
  throw new Error(`Missing result presentation copy: ${missing.join(", ")}`);
}

const missingVariants = context.presentationCoverage.missingVariants;

if (missingVariants.length > 0) {
  throw new Error(`Missing standard copy variants: ${missingVariants.join(", ")}`);
}

console.log("Presentation copy covers standard, hidden, and extreme result labels.");


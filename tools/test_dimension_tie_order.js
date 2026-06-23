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
globalThis.sortTiedDimensions = () => {
  const rows = [
    { key: "E", name: "情绪特质", strength: 0.5 },
    { key: "R", name: "风险偏好", strength: 0.5 },
    { key: "T", name: "团队倾向", strength: 0.5 },
    { key: "C", name: "竞技伦理", strength: 0.5 },
  ];
  return {
    all: [...rows].sort(compareDimensionStrength).map((row) => row.name),
    dominant: getDominantAxes(rows).map((row) => row.name),
  };
};`,
  context,
);

const result = context.sortTiedDimensions();
const expected = ["竞技伦理", "团队倾向", "风险偏好", "情绪特质"];

if (JSON.stringify(result.all) !== JSON.stringify(expected)) {
  throw new Error(`Tie order mismatch: ${JSON.stringify(result)}`);
}

if (JSON.stringify(result.dominant) !== JSON.stringify(expected.slice(0, 2))) {
  throw new Error(`Dominant tie order mismatch: ${JSON.stringify(result)}`);
}

console.log(result);

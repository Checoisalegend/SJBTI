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
${fs.readFileSync("app.js", "utf8")}
globalThis.inspectDescriptions = () => {
  const standard = { type: "normal", introState: { segment: "fan" }, final: { label: "隐身者", player: "梅西" }, axes: [] };
  const novice = { type: "normal", introState: { segment: "novice" }, final: { label: "隐身者", player: "梅西" }, axes: [] };
  const hidden = { type: "hidden", introState: { segment: "novice" }, final: FBTI_DATA.hiddenResults.fun, axes: [] };
  const messiJames = { type: "extreme", introState: { segment: "fan" }, final: parseExtremeResult("梅西 詹姆斯"), axes: [] };
  const ronaldoJames = { type: "extreme", introState: { segment: "fan" }, final: parseExtremeResult("c罗 詹姆斯"), axes: [] };
  return {
    fan: getResultPresentation(standard).description,
    novice: getResultPresentation(novice).description,
    hidden: getResultPresentation(hidden).description,
    messiJames: getResultPresentation(messiJames),
    ronaldoJames: getResultPresentation(ronaldoJames),
  };
};`,
  context,
);

const result = context.inspectDescriptions();

if (result.fan === result.novice) {
  throw new Error("Standard result descriptions should differ between fan and novice segments.");
}

if (!result.hidden.includes("戏剧性")) {
  throw new Error(`Hidden result description should keep its original copy: ${result.hidden}`);
}

if (
  result.messiJames.slogan === result.ronaldoJames.slogan ||
  result.messiJames.description === result.ronaldoJames.description
) {
  throw new Error("Messi James and Ronaldo James should use separate copy.");
}

console.log("Segment-specific descriptions and James variants are wired correctly.");

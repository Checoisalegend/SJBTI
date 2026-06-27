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
globalThis.testResultImages = () => ({
  messiJames: parseExtremeResult("梅西 詹姆斯"),
  ronaldoJames: parseExtremeResult("c罗 詹姆斯"),
  hiddenMessi: parseExtremeResult("梅西 隐身梅"),
  divingRonaldo: parseExtremeResult("c罗 跳水罗"),
  kante: FBTI_DATA.results.find((result) => result.player === "坎特"),
});`,
  context,
);

const result = context.testResultImages();

if (
  result.messiJames.label !== "詹姆斯" ||
  result.messiJames.imageKey !== "詹姆斯梅" ||
  result.messiJames.presentationKey !== "詹姆斯梅"
) {
  throw new Error(`Messi James mismatch: ${JSON.stringify(result.messiJames)}`);
}

if (
  result.ronaldoJames.label !== "詹姆斯" ||
  result.ronaldoJames.imageKey !== "詹姆斯罗" ||
  result.ronaldoJames.presentationKey !== "詹姆斯罗"
) {
  throw new Error(`Ronaldo James mismatch: ${JSON.stringify(result.ronaldoJames)}`);
}

if (result.hiddenMessi.imageKey !== "隐身者") {
  throw new Error(`Hidden Messi image mismatch: ${JSON.stringify(result.hiddenMessi)}`);
}

if (result.divingRonaldo.imageKey !== "跳水者") {
  throw new Error(`Diving Ronaldo image mismatch: ${JSON.stringify(result.divingRonaldo)}`);
}

if (result.kante.label !== "老实人") {
  throw new Error(`Kante label mismatch: ${JSON.stringify(result.kante)}`);
}

console.log(result);


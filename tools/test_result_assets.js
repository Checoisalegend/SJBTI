const fs = require("fs");
const path = require("path");
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
globalThis.resultFiles = () => {
  const finals = FBTI_DATA.results.map((result) => ({
    label: result.label,
    player: result.player,
  }));
  FBTI_DATA.results.forEach((result) => {
    if (result.extreme) finals.push(parseExtremeResult(result.extreme));
  });
  finals.push(...Object.values(FBTI_DATA.hiddenResults));
  return finals.map((result) => resultImageBasePath(result).replace("./", ""));
};`,
  context,
);

const extensions = [".png", ".jpg", ".jpeg"];
const missing = context
  .resultFiles()
  .filter((basePath) => !extensions.some((extension) => fs.existsSync(`${basePath}${extension}`)));

if (missing.length) {
  throw new Error(`Missing result image assets: ${[...new Set(missing)].join(", ")}`);
}

console.log("All standard and hidden result image assets exist.");

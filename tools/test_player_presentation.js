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
${fs.readFileSync("copy.js", "utf8")}
${fs.readFileSync("app.js", "utf8")}
globalThis.inspectPlayers = () => {
  const players = new Set();
  FBTI_DATA.results.forEach((result) => {
    players.add(result.player);
    if (result.extreme) players.add(result.extreme.trim().split(/\\s+/)[0]);
  });
  Object.values(FBTI_DATA.hiddenResults).forEach((result) => {
    if (result.player) players.add(result.player);
  });
  return [...players].filter((player) => !SJBTI_COPY.players[player]);
};`,
  context,
);

const missingPlayers = context.inspectPlayers();
if (missingPlayers.length) {
  throw new Error(`Missing player presentation: ${missingPlayers.join(", ")}`);
}

console.log("Player abbreviations and national colors cover every result player.");


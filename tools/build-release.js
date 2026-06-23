const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.resolve(root, "dist");
const requiredFiles = ["index.html", "styles.css", "data.js", "app.js", "_headers"];
const imageSource = path.resolve(root, "assets", "personality-images");
const imageOutput = path.resolve(output, "assets", "personality-images");

if (path.dirname(output) !== root || path.basename(output) !== "dist") {
  throw new Error(`Refusing to replace unexpected output path: ${output}`);
}

for (const file of requiredFiles) {
  const source = path.resolve(root, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Required release file is missing: ${file}`);
  }
}

if (!fs.existsSync(imageSource)) {
  throw new Error("Personality image directory is missing.");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(imageOutput, { recursive: true });

for (const file of requiredFiles) {
  fs.copyFileSync(path.resolve(root, file), path.resolve(output, file));
}

for (const entry of fs.readdirSync(imageSource, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.webp$/i.test(entry.name)) continue;
  fs.copyFileSync(path.resolve(imageSource, entry.name), path.resolve(imageOutput, entry.name));
}

const releaseFiles = [];
function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.resolve(directory, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath);
    if (entry.isFile()) releaseFiles.push(path.relative(output, fullPath));
  }
}

collectFiles(output);

const totalBytes = releaseFiles.reduce(
  (sum, file) => sum + fs.statSync(path.resolve(output, file)).size,
  0,
);

console.log(
  `Release ready: ${releaseFiles.length} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
);

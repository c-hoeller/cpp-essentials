import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDirectory = path.join(rootDirectory, "content");
const manifestPath = path.join(contentDirectory, "manifest.json");
const outputPath = path.join(rootDirectory, "assets", "cpp_lerninhalte.js");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const sections = manifest.map(function (section) {
  const htmlPath = path.join(contentDirectory, section.file);
  return {
    id: section.id,
    group: section.group,
    title: section.title,
    html: fs.readFileSync(htmlPath, "utf8").trim()
  };
});

const output = [
  "(function (window) {",
  '  "use strict";',
  "",
  "  window.CppLerninhalte = " + JSON.stringify(sections, null, 2) + ";",
  "})(window);",
  ""
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
console.log("Erstellt: assets/cpp_lerninhalte.js (" + sections.length + " Themen)");

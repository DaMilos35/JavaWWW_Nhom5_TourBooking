const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          results.push({ file: path.relative(srcDir, fullPath), lineNum: idx + 1, line: line.trim() });
        }
      });
    }
  }
  return results;
}

const found = walk(srcDir);
console.log("Total emoji occurrences found:", found.length);
found.forEach(f => console.log(`${f.file}:${f.lineNum} -> ${f.line.substring(0, 100)}`));

const fs = require("fs");

const messagePath = process.argv[2];
if (!messagePath) {
  process.exit(0);
}

const msg = fs.readFileSync(messagePath, "utf8");
const lines = msg.split(/\r?\n/);
const filtered = lines.filter((line) => !isCursorCoauthor(line));

if (filtered.length === lines.length) {
  process.exit(0);
}

let next = filtered.join("\n");
if (msg.endsWith("\n")) {
  next += "\n";
}

fs.writeFileSync(messagePath, next, "utf8");

function isCursorCoauthor(line) {
  const trimmed = line.trim();
  if (!/^Co-authored-by:/i.test(trimmed)) {
    return false;
  }

  return (
    /\bCursor\b/i.test(trimmed) ||
    /cursoragent@cursor\.com/i.test(trimmed)
  );
}

const { execSync } = require("child_process");

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

function getOutgoingCommits() {
  let upstream = "";
  try {
    upstream = execSync("git rev-parse --abbrev-ref --symbolic-full-name @{u}", {
      encoding: "utf8",
    }).trim();
  } catch {
    return [];
  }

  if (!upstream) {
    return [];
  }

  const range = `${upstream}..HEAD`;
  let shas = [];
  try {
    shas = execSync(`git rev-list ${range}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }

  return shas;
}

const offenders = [];

for (const sha of getOutgoingCommits()) {
  const body = execSync(`git log -1 --format=%B ${sha}`, { encoding: "utf8" });
  const hasCursorCoauthor = body.split(/\r?\n/).some(isCursorCoauthor);
  if (hasCursorCoauthor) {
    offenders.push(sha.slice(0, 7));
  }
}

if (offenders.length === 0) {
  process.exit(0);
}

console.error(
  [
    "Push blocked: Cursor co-author line found in outgoing commit(s):",
    offenders.join(", "),
    "",
    "Fix with:",
    "  git rebase -i @{u}",
    "  (reword affected commits, or run: git commit --amend)",
    "",
    "Future commits are cleaned automatically by the commit-msg hook.",
  ].join("\n")
);
process.exit(1);

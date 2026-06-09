import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const hookScript = path.join(__dirname, "git-hooks", "strip-cursor-coauthor.cjs");

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  process.exit(0);
}

fs.mkdirSync(hooksDir, { recursive: true });

const commitMsgHook = `#!/bin/sh
ROOT="$(git rev-parse --show-toplevel)"
exec node "$ROOT/scripts/git-hooks/strip-cursor-coauthor.cjs" "$1"
`;

const prePushHook = `#!/bin/sh
ROOT="$(git rev-parse --show-toplevel)"
exec node "$ROOT/scripts/git-hooks/check-cursor-coauthor.cjs"
`;

fs.writeFileSync(path.join(hooksDir, "commit-msg"), commitMsgHook, { mode: 0o755 });
fs.writeFileSync(path.join(hooksDir, "pre-push"), prePushHook, { mode: 0o755 });

if (!fs.existsSync(hookScript)) {
  console.warn("install-git-hooks: missing strip-cursor-coauthor.cjs");
  process.exit(1);
}

console.log("Git hooks installed: commit-msg, pre-push");

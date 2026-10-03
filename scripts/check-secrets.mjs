import fs from "node:fs";
import path from "node:path";

const ignore = new Set(["node_modules", ".git", ".next"]);
const suspicious = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i,
];
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const stat = fs.statSync(full);
      if (stat.size > 1_000_000) continue;
      const text = fs.readFileSync(full, "utf8");
      if (suspicious.some((rule) => rule.test(text))) findings.push(full);
    }
  }
}
walk(".");
if (findings.length) {
  console.error("Potential secrets detected:\n" + findings.join("\n"));
  process.exit(1);
}
console.log("Basic secret scan: OK");

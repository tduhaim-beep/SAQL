import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], { stdio: 'inherit' });
let exitCode = result.status ?? 1;
try {
  const path = 'test-results/results.json';
  if (existsSync(path)) {
    const text = readFileSync(path, 'utf8');
    const report = JSON.parse(text);
    const token = report.config?.webServer?.env?.SAQL_TEST_ACTOR_TOKEN;
    if (typeof token === 'string' && token.length > 0) {
      writeFileSync(path, text.replaceAll(token, '[test-token-redacted]'));
    }
  }
} catch {
  console.error('Unable to redact the test identity token from the E2E report.');
  exitCode = 1;
}
if (result.error) console.error('Unable to execute the Playwright runner.');
process.exitCode = exitCode;

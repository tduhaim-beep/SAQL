import fs from 'node:fs';

const expected = new Map([
  ['docs/implementation-control/TRACEABILITY_ACCEPTANCE_V2.csv', 225],
  ['docs/implementation-control/PERMISSIONS_MATRIX_V2.csv', 90],
  ['docs/implementation-control/STATE_MACHINES_V2.csv', 67],
  ['docs/implementation-control/SCORING_TEST_VECTORS_V2.csv', 9],
]);

for (const [file, count] of expected) {
  if (!fs.existsSync(file)) throw new Error(`Missing control file: ${file}`);
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim();
  const rows = text ? text.split(/\r?\n/).length - 1 : 0;
  if (rows !== count) throw new Error(`${file}: expected ${count} data rows, found ${rows}`);
}
console.log('Implementation-control baseline: OK');

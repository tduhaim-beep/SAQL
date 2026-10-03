import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function dataRows(path) {
  const text = fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, '').trim();
  return text ? text.split(/\r?\n/).length - 1 : 0;
}

test('current traceability contains 225 requirements', () => {
  assert.equal(dataRows('docs/implementation-control/TRACEABILITY_ACCEPTANCE_V2.csv'), 225);
});

test('permission matrix has the approved 90 rules baseline', () => {
  assert.equal(dataRows('docs/implementation-control/PERMISSIONS_MATRIX_V2.csv'), 90);
});

test('state-machine transition baseline has 67 transitions', () => {
  assert.equal(dataRows('docs/implementation-control/STATE_MACHINES_V2.csv'), 67);
});

test('scoring test-vector baseline has 9 vectors', () => {
  assert.equal(dataRows('docs/implementation-control/SCORING_TEST_VECTORS_V2.csv'), 9);
});

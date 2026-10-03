import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('src/app/globals.css', 'utf8');

test('Arabic RTL root layout is mandatory', () => {
  const text = fs.readFileSync('src/app/layout.tsx', 'utf8');
  assert.match(text, /lang="ar"/);
  assert.match(text, /dir="rtl"/);
});

test('SAQL Brand Identity v1.1 tokens and Tajawal baseline are active', () => {
  const upper = css.toUpperCase();
  for (const token of ['#142F43','#2F5BEA','#F4F7FB','#FFFFFF','#566575','#D9E2EE']) assert.ok(upper.includes(token), token);
  for (const old of ['#142B52','#C8954E','#F8F5ED','#6B7A90']) assert.ok(!upper.includes(old), old);
  assert.match(css, /Tajawal/i);
  assert.doesNotMatch(css, /Noto Naskh Arabic/i);
});

test('approved v1.1 logo assets are active and old visual references are historical', () => {
  assert.ok(fs.existsSync('public/brand/saql-horizontal-colour.svg'));
  assert.ok(fs.existsSync('public/brand/saql-app-icon.svg'));
  assert.ok(fs.existsSync('docs/design/references/current/approved-logo-board-v1.1.png'));
  for (const old of ['approved-brand-board.png','approved-brand-tokens-reference.png','approved-logo-reference.png','approved-public-pack1.png']) {
    assert.ok(fs.existsSync(`docs/design/references/historical/${old}`), old);
    assert.ok(!fs.existsSync(`docs/design/references/${old}`), `old current ref still active: ${old}`);
  }
});

test('foundation page uses approved logo asset and no superseded tagline', () => {
  const text = fs.readFileSync('src/app/page.tsx', 'utf8');
  assert.match(text, /saql-horizontal-colour\.svg/);
  assert.doesNotMatch(text, /نصقل التجربة\. نبني الجاهزية\./);
});

test('Pilot v2 modules replace historical v1 modules', () => {
  const required = ['opportunity','application','training-journey','training-plan','assessment-scoring','academic-overlay','academic-framework','alignment','verification','platform-admin'];
  for (const name of required) assert.ok(fs.existsSync(`src/modules/${name}/README.md`), name);
  for (const old of ['internship-case','student-eligibility','training-activation','milestones','academic-closure']) assert.ok(!fs.existsSync(`src/modules/${old}`), old);
});

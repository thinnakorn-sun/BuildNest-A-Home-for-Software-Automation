'use strict';
// Content/asset regression gates, not a substitute for real React screenshots.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const approved = read('frontend/references/m0-approved-ui/app.js');
const boundary = approved.indexOf("const STORE_KEY=");
assert.ok(boundary > 0, 'approved declarations must be available');
const original = JSON.parse(vm.runInNewContext(
  approved.slice(0, boundary) + ';JSON.stringify({products:BASE_PRODUCTS,actors:AUTO_ACTORS,i18n:I18N})',
  {}, {timeout: 1000}));
const native = JSON.parse(read('frontend/src/components/native/seed.json'));

test('native catalog and actor seed preserve approved product content', () => {
  assert.deepEqual(native.products, original.products);
  assert.deepEqual(native.actors, original.actors);
});
test('native TH/EN translations preserve approved copy and line breaks', () => {
  assert.deepEqual(native.i18n, original.i18n);
});
test('React and public base styles match the approved original stylesheet', () => {
  const css = read('frontend/references/m0-approved-ui/styles.css');
  assert.equal(read('frontend/src/app/canonical.css'), css);
  assert.equal(read('frontend/public/buildnest/styles.css'), css);
});

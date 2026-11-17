import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(fileURLToPath(new URL('..', import.meta.url)));
test('Karrik headings and Micro Grotesk body load locally', () => {
  const css = readFileSync(join(root, 'src/app/foundation.css'), 'utf8');
  const typography = readFileSync(join(root, 'src/ui/Typography.module.css'), 'utf8');
  assert.match(css, /font-family: "Karrik"/);
  assert.match(css, /--font-heading: "Karrik"/);
  assert.match(css, /Karrik-Regular\.woff2/);
  assert.match(css, /--font-body: "Micro Grotesk", "Segoe UI", system-ui, sans-serif/);
  assert.match(typography, /font-family: var\(--font-heading\)/);
  assert.ok(statSync(join(root, 'public/fonts/karrik/Karrik-Regular.woff2')).size > 5000);
  assert.ok(statSync(join(root, 'public/fonts/karrik/LICENCE.txt')).size > 500);
});

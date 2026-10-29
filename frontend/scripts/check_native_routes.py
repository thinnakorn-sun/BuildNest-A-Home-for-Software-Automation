#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'frontend/src/app/[locale]'
for rel in ['page.tsx','products/page.tsx','automations/page.tsx','tools/page.tsx','docs/page.tsx','library/page.tsx','orders/page.tsx','admin/page.tsx','products/[slug]/page.tsx']:
 s=(p/rel).read_text()
 assert 'NativeStorefront' in s, f'Route not migrated: {rel}'
 assert 'redirect(' not in s, f'Legacy redirect remains in {rel}'
assert (root/'frontend/src/components/native/seed.json').exists()
assert (root/'frontend/public/buildnest/index.html').exists()
print('PASS: 9 locale routes render native React and M1.1 backup preserved')

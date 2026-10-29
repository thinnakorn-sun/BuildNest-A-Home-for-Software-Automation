#!/usr/bin/env python3
"""Ensure the approved M0 design has not been accidentally redesigned."""
from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[2]
approved=root/'frontend/references/m0-approved-ui'
active=root/'frontend/public/buildnest'
styles=(approved/'styles.css').read_bytes()
current=(active/'styles.css').read_bytes()
if styles!=current:
    raise SystemExit('DESIGN LOCK FAILED: styles.css changed from approved M0')
for feature in ['class="sidebar"','class="brand"','class="topbar"','id="content"','id="primaryNav"','id="langToggle"']:
    if feature not in (active/'index.html').read_text():
        raise SystemExit('DESIGN LOCK FAILED: missing original shell '+feature)
for selector in ['.hero{','.nav-item.active{','.product-card{','.sidebar{','.topbar{']:
    if selector not in styles.decode():
        raise SystemExit('DESIGN LOCK FAILED: missing CSS selector '+selector)
print('DESIGN LOCK PASS: SHA-256',hashlib.sha256(current).hexdigest())

#!/usr/bin/env python3
"""Compare REAL local Next/React against approved M0 in the same Chromium runtime.
Requires a running Next server, Python playwright/Pillow and Playwright Chromium.
No production requests are allowed. Any differing pixel fails the comparison.
"""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
REFERENCE = ROOT / 'frontend/references/m0-approved-ui'
OUTPUT = ROOT / 'test-results/native-visual'
REGIONS = ['.sidebar', '.topbar', '.welcome', '.hero', '.stats-grid',
           '.product-grid', '.split-grid']
FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'


def compare(first, second, diff):
    with Image.open(first) as a, Image.open(second) as b:
        a, b = a.convert('RGB'), b.convert('RGB')
        if a.size != b.size:
            return {'equal': False, 'reference_size': a.size, 'react_size': b.size}
        delta = ImageChops.difference(a, b)
        delta.save(diff)
        changed = sum(pixel != (0, 0, 0) for pixel in delta.getdata())
        return {'equal': changed == 0, 'different_pixels': changed,
                'total_pixels': a.width * a.height,
                'different_percent': changed * 100 / (a.width * a.height)}


def measure(page):
    return page.evaluate('''selectors => Object.fromEntries(selectors.map(selector => {
      const node = document.querySelector(selector), box = node.getBoundingClientRect();
      const css = getComputedStyle(node);
      return [selector, {x:box.x,y:box.y,width:box.width,height:box.height,
        font:css.font, color:css.color, background:css.background,
        padding:css.padding, gap:css.gap, columns:css.gridTemplateColumns,
        transform:css.transform}];
    }))''', REGIONS)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', default='http://localhost:3000')
    args = parser.parse_args()
    base = args.url.rstrip('/')
    parsed = urlparse(base)
    if parsed.scheme != 'http' or parsed.hostname not in ('localhost', '127.0.0.1') or parsed.path:
        parser.error('--url must be a local HTTP origin without a path')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for width, height in [(1440, 900), (390, 844)]:
            for locale in ['en', 'th']:
                errors, blocked = [], []
                contexts, pages = [], []
                def route(request_route):
                    url = urlparse(request_route.request.url)
                    if url.netloc != parsed.netloc or url.scheme != parsed.scheme:
                        blocked.append(request_route.request.url)
                        request_route.abort()
                    elif url.path.startswith('/__approved_ui__/'):
                        name = url.path.removeprefix('/__approved_ui__/')
                        if name not in ['index.html', 'styles.css', 'app.js']:
                            request_route.abort()
                        else:
                            request_route.fulfill(path=str(REFERENCE / name))
                    elif url.path.startswith('/api/'):
                        blocked.append(request_route.request.url)
                        request_route.abort()
                    else:
                        request_route.continue_()
                for kind in ['approved', 'react']:
                    context = browser.new_context(viewport={'width': width, 'height': height},
                        device_scale_factor=1, color_scheme='light', locale='en-US',
                        timezone_id='UTC', reduced_motion='reduce', service_workers='block')
                    context.route('**/*', route)
                    page = context.new_page()
                    page.on('pageerror', lambda error: errors.append(str(error)))
                    page.goto(f'{base}/__approved_ui__/index.html' if kind == 'approved'
                              else f'{base}/{locale}', wait_until='networkidle')
                    if kind == 'approved' and locale == 'th':
                        page.locator('#langToggle').click()
                    if kind == 'react':
                        page.wait_for_function("localStorage.getItem('buildnest_react_demo_v1') !== null")
                    page.locator('.hero').wait_for()
                    page.evaluate('document.fonts.ready')
                    page.add_style_tag(content=FREEZE)
                    page.evaluate('window.scrollTo(0, 0)')
                    page.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
                    contexts.append(context)
                    pages.append(page)
                case = {'width': width, 'height': height, 'locale': locale,
                        'regions': {'approved': measure(pages[0]), 'react': measure(pages[1])},
                        'errors': errors, 'blocked_requests': blocked}
                for mode, full in [('viewport', False), ('full', True)]:
                    stem = f'{locale}-{width}-{mode}'
                    paths = [OUTPUT / f'{stem}-{kind}.png' for kind in ['approved', 'react']]
                    for page, path in zip(pages, paths):
                        page.screenshot(path=str(path), full_page=full, animations='disabled')
                    case[mode] = compare(*paths, OUTPUT / f'{stem}-diff.png')
                case['pass'] = case['viewport']['equal'] and case['full']['equal'] and not errors and not blocked
                results.append(case)
                for context in contexts:
                    context.close()
        version = browser.version
        browser.close()
    report = {'browser': version, 'reference_css_sha256': hashlib.sha256(
        (REFERENCE / 'styles.css').read_bytes()).hexdigest(), 'cases': results,
        'pass': all(case['pass'] for case in results)}
    (OUTPUT / 'results.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps({'pass': report['pass'], 'cases': [
        {key: c[key] for key in ['width', 'height', 'locale', 'pass', 'viewport', 'full']}
        for c in results]}, indent=2))
    return 0 if report['pass'] else 1


if __name__ == '__main__':
    raise SystemExit(main())

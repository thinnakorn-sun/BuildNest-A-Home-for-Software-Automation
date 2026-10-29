#!/usr/bin/env python3
"""Offline QA: test authoritative M1.1 preview against M2 canonical UI."""
import json, hashlib, sys, os
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
legacy=root/'frontend/references/m1-1-approved-preview/index.html'
active=root/'frontend/public/buildnest/index.html'
def standalone(index):
    folder=index.parent
    text=index.read_text()
    for name in ('styles.css','enhancements.css'):
        text=text.replace('<link rel="stylesheet" href="'+name+'"/>','<style>'+ (folder/name).read_text()+'</style>')
    text=text.replace('<script src="app.js"></script>','<script>'+ (folder/'app.js').read_text()+'</script>')
    return text
(root/'test-results').mkdir(exist_ok=True)
checks=[]
def check(name,actual):
    checks.append({'name':name,'pass':bool(actual)})
    print(('PASS' if actual else 'FAIL'),name)
with sync_playwright() as pw:
    executable=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH')
    browser=pw.chromium.launch(headless=True,executable_path=executable,args=['--disable-dev-shm-usage'])
    for w,h in [(1440,900),(390,844)]:
        old=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
        new=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
        errors=[];new.on('pageerror',lambda error: errors.append(str(error)))
        old.set_content(standalone(legacy),wait_until='load')
        new.set_content(standalone(active),wait_until='load')
        old.wait_for_timeout(300);new.wait_for_timeout(300)
        base=root/f'test-results/m1_1_baseline_{w}.png';live=root/f'test-results/m2_canonical_{w}.png'
        old.screenshot(path=str(base),full_page=True);new.screenshot(path=str(live),full_page=True)
        im1=Image.open(base).convert('RGBA');im2=Image.open(live).convert('RGBA')
        same=im1.size==im2.size and ImageChops.difference(im1,im2).getbbox() is None
        check(f'original Overview matches M1.1 pixel-for-pixel at {w}px',same)
        if w==1440:
            new.locator('[data-view="marketplace"]').first.click()
            check('Marketplace has optional M2 route','React / Database Catalog' in new.locator('#content').inner_text())
            new.locator('[data-view="admin"]').first.click()
            check('Admin has protected CMS entry','secured M2 Product CMS' in new.locator('#content').inner_text())
            check('Admin CMS route correct',new.locator('a[href="/en/manage/products"]').count()==1)
            new.locator('#addProductBtn').click()
            new.locator('#productForm [name="name"]').fill('Offline Example')
            new.locator('#productForm [name="desc"]').fill('Example description')
            new.locator('#productForm button[type="submit"]').click()
            check('Existing browser-only Add product preserved','Offline Example' in new.locator('.table-wrap').inner_text())
            new.locator('[data-view="free-tools"]').first.click();new.locator('#csvCheck').click()
            report=json.loads(new.locator('#csvResult').inner_text())
            check('Original CSV validator still works',report['dataRows']==4 and report['duplicateRows']==1)
        else:
            new.locator('#mobileMenu').click()
            check('Mobile sidebar still works','open' in new.locator('#sidebar').get_attribute('class'))
        check(f'No uncaught JS errors at {w}px',not errors)
        old.close();new.close()
    browser.close()
source=(root/'frontend/public/buildnest/styles.css').read_bytes()
check('CSS SHA-256 unchanged',hashlib.sha256(source).hexdigest()=='75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f')
sql=(root/'backend/supabase/migrations/0002_m2_auth_catalog.sql').read_text()
check('Admin RPC revoked from browser roles','revoke all on function public.admin_upsert_catalog_product' in sql and 'service_role;' in sql)
check('Public view uses security_invoker','security_invoker = true' in sql)
check('No client-side service key',not any('SERVICE_ROLE_KEY' in f.read_text() for f in (root/'frontend/src/components').glob('*.tsx')))
report={'version':'M2 preparation','passed':sum(c['pass'] for c in checks),'total':len(checks),'checks':checks,'full_next_nest_build':'UNVERIFIED (npm dependencies unavailable)','supabase_connection':'NOT CONFIGURED'}
(root/'test-results/M2_QA.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print('RESULT',report['passed'],'/',report['total'])
if report['passed']!=report['total']:sys.exit(1)

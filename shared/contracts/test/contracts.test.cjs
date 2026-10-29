const test=require('node:test');const assert=require('node:assert/strict');
const {parseCsv,queryCatalog,formatAmount,safeLocale}=require('../dist/index');
const {PRODUCTS}=require('../dist/catalog');
test('catalog has stable unique ids and slugs',()=>{assert.equal(PRODUCTS.length,8);assert.equal(new Set(PRODUCTS.map(p=>p.id)).size,PRODUCTS.length);assert.equal(new Set(PRODUCTS.map(p=>p.slug)).size,PRODUCTS.length);});
test('catalog query filters correctly, never mutates',()=>{assert.equal(queryCatalog(PRODUCTS,{category:'Industrial'}).length,2);assert.equal(queryCatalog(PRODUCTS,{q:'CSV'}).length,1);assert.equal(queryCatalog(PRODUCTS,{limit:2}).length,2);assert.equal(PRODUCTS.length,8);});
test('CSV handles quotes, duplicate and missing values',()=>{const d=parseCsv('name,age\n"Lee, Test",22\n"Lee, Test",22\nJo,\n');assert.equal(d.rows.length,3);assert.equal(d.duplicateRows,1);assert.equal(d.missingCells,1);assert.equal(d.invalidRows,0);});
test('CSV invalid shape and quote failures',()=>{assert.equal(parseCsv('a,b\n1').invalidRows,1);assert.throws(()=>parseCsv('a,b\n"unfinished'),/Unterminated/);});
test('CSV blank and CRLF',()=>{assert.deepEqual(parseCsv('').rows,[]);assert.equal(parseCsv('a,b\r\n1,2\r\n').rows.length,1);});
test('display formatting and locale guard',()=>{assert.equal(safeLocale('ru'),'en');assert.match(formatAmount(199,'USD','en'),/199/);assert.throws(()=>formatAmount(-1,'THB','th'));});

const test=require('node:test');const assert=require('node:assert/strict');
const {validateCatalogWrite,validateCategory}=require('../dist/index.js');
const valid={slug:'excel-workflow',categorySlug:'automation',type:'desktop_app',status:'draft',featured:false,locales:{th:{name:'Excel ไทย',summary:'รวมไฟล์',description:'รายละเอียด'},en:{name:'Excel Tool',summary:'Merge files',description:''}},prices:{THB:99000,USD:3900}};
test('valid product with two locales and integer minor-unit prices',()=>{assert.equal(validateCatalogWrite(valid).prices.THB,99000)});
test('reject price manipulation and invalid currency values',()=>{assert.throws(()=>validateCatalogWrite({...valid,prices:{THB:-1,USD:3900}}));assert.throws(()=>validateCatalogWrite({...valid,prices:{THB:9.99,USD:3900}}))});
test('reject malformed slug and status',()=>{assert.throws(()=>validateCatalogWrite({...valid,slug:'../bad'}));assert.throws(()=>validateCatalogWrite({...valid,status:'paid'}))});
test('reject missing Thai localization',()=>{assert.throws(()=>validateCatalogWrite({...valid,locales:{en:valid.locales.en}}))});
test('reject overlength content',()=>{assert.throws(()=>validateCatalogWrite({...valid,locales:{th:{...valid.locales.th,name:'x'.repeat(121)},en:valid.locales.en}}))});
test('validate category',()=>{assert.equal(validateCategory({slug:'industrial-iot',labelTh:'โรงงาน',labelEn:'Industrial'}).slug,'industrial-iot');assert.throws(()=>validateCategory({slug:'../../',labelTh:'a',labelEn:'b'}))});

const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
let ts;try{ts=require('typescript')}catch{const{execFileSync}=require('child_process');ts=require(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}
const file=path.join(__dirname,'../src/components/native/storefront.tsx');
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
const seed=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/components/native/seed.json'),'utf8'));
const mod={exports:{}},react={};vm.runInNewContext(code,{module:mod,exports:mod.exports,require:n=>n==='react'?react:seed},{timeout:3000});
const{parseCsv,validateCsv}=mod.exports;
const cases=[
 ()=>assert.equal(parseCsv('a,b\n1,2')[1][1],'2'),
 ()=>assert.equal(parseCsv('a,b\n"A,B",C')[1][0],'A,B'),
 ()=>assert.equal(parseCsv('a,b\n"one""two",C')[1][0],'one"two'),
 ()=>assert.equal(parseCsv('a,b\n"one\ntwo",C')[1][0],'one\ntwo'),
 ()=>assert.equal(validateCsv('a,b\n1,2\n1,2').duplicateRows,1),
 ()=>assert.equal(validateCsv('a,b\n1,\n2,3').emptyCells,1),
 ()=>assert.throws(()=>validateCsv('a,b\n1'),/columns/),
 ()=>assert.throws(()=>parseCsv('a,b\n"hello,world'),/Unclosed/),
 ()=>assert.throws(()=>validateCsv('a,b'),/header and data/)
];cases.forEach((test,i)=>{test();console.log(`PASS ${i+1}/${cases.length}`)});
console.log(`Native CSV tests: ${cases.length}/${cases.length} PASS`);

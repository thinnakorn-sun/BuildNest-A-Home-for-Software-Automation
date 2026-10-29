'use strict';
const fs=require('node:fs'),path=require('node:path');
let ts;try{ts=require('typescript')}catch{const{execFileSync}=require('node:child_process');ts=require(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}
const root=path.resolve(__dirname,'../..');let count=0,errors=[];
function check(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory()){if(d.name!=='dist'&&d.name!=='node_modules')check(p)}else if(/\.tsx?$/.test(d.name)){let src=fs.readFileSync(p,'utf8');const result=ts.transpileModule(src,{fileName:p,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,experimentalDecorators:true}});count++;for(const issue of result.diagnostics||[])if(issue.category===ts.DiagnosticCategory.Error)errors.push(`${p}: ${ts.flattenDiagnosticMessageText(issue.messageText,' ')}`);}}}
for(const p of ['frontend/src','backend/src','shared/contracts/src'])check(path.join(root,p));
if(errors.length){console.log(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${count} TS/TSX source files transpile without syntax errors (not a full typecheck)`);

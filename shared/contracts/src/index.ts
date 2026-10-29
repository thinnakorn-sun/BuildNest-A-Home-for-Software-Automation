export type Locale = 'th' | 'en';
export type Currency = 'THB' | 'USD';
export type Category = string;
export type ProductType = 'desktop_app' | 'automation_actor' | 'hosted_tool' | 'source_code' | 'api_credits' | 'template' | 'course' | 'other';
export interface Product {
 id:string; slug:string; category:Category; type:ProductType; icon:string; cover:string; tag:string; status:'concept'|'planned'|'demo'|'published'|'draft'|'review'|'archived';
 price:{THB:number; USD:number}; // user-facing major units, read-only display; NEVER a checkout authority
 title:{th:string;en:string}; summary:{th:string;en:string}; features:{th:string[];en:string[]};
}
export interface PublicCatalogResponse { items: Product[]; total:number; source:'sample'|'supabase'; }
export interface HealthResponse { status:'ok'; service:'buildnest-api'; mode:'development'; version:string; }
export interface AutomationTemplate { id:string; title:string; unit:string; model:'apify_marketplace'|'own_platform'; status:'concept'|'planned'; }
export function isLocale(x:unknown):x is Locale { return x==='th'||x==='en'; }
export function safeLocale(x:unknown):Locale {return isLocale(x)?x:'en';}
export function formatAmount(amount:number,currency:Currency,locale:Locale):string {if(!Number.isFinite(amount)||amount<0)throw new Error('invalid display amount');return new Intl.NumberFormat(locale==='th'?'th-TH':'en-US',{style:'currency',currency,minimumFractionDigits:currency==='THB'?0:2,maximumFractionDigits:currency==='THB'?0:2}).format(amount);}
export function queryCatalog(items:readonly Product[],opts:{q?:string;category?:string;limit?:number}={}):Product[] {
 const q=(opts.q||'').trim().toLocaleLowerCase();
 const filtered=items.filter(p=>(!opts.category||opts.category==='All'||p.category===opts.category)&&(!q||[p.title.th,p.title.en,p.summary.th,p.summary.en,p.category].some(s=>s.toLocaleLowerCase().includes(q))));
 return filtered.slice(0,Math.max(0,Math.min(100,opts.limit??100)));
}
export function parseCsv(text:string):{columns:string[];rows:string[][];missingCells:number;duplicateRows:number;invalidRows:number} {
 if(text.length>2_000_000) throw new Error('CSV file exceeds demo limit (2 MB)');
 if(!text.trim())return {columns:[],rows:[],missingCells:0,duplicateRows:0,invalidRows:0};
 const records:string[][]=[]; let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++) {const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);records.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw new Error('Unterminated quoted field');
 if(row.length||cell.length){row.push(cell);records.push(row);}
 const [columns=[],...rows]=records;let duplicateRows=0,invalidRows=0,missingCells=0;const seen=new Set<string>();
 for(const values of rows){if(values.length!==columns.length)invalidRows++;missingCells+=Array.from({length:columns.length},(_,i)=>values[i]??'').filter(v=>!v.trim()).length;const key=JSON.stringify(values);if(seen.has(key))duplicateRows++;else seen.add(key);}
 return {columns,rows,missingCells,duplicateRows,invalidRows};
}
export {validateCatalogWrite,validateCategory} from './admin';
export type {CatalogWrite,ProductStatus,CatalogProductType} from './admin';

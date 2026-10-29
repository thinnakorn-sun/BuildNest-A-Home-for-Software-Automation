/** Pure validation for M2 CMS requests. Never accept role, user ID, or prices from client as payment authority. */
export type ProductStatus = 'draft'|'review'|'published'|'archived';
export type CatalogProductType = 'desktop_app'|'source_code'|'automation_actor'|'hosted_tool'|'api_credits'|'template'|'course'|'other';
export interface CatalogWrite {
  id?:string;
  slug:string;
  categorySlug:string;
  type:CatalogProductType;
  status:ProductStatus;
  featured:boolean;
  locales:{th:{name:string;summary:string;description:string};en:{name:string;summary:string;description:string}};
  prices:{THB:number;USD:number}; // in minor units: satang and cents
}
const types=new Set(['desktop_app','source_code','automation_actor','hosted_tool','api_credits','template','course','other']);
const states=new Set(['draft','review','published','archived']);
function record(x:unknown):Record<string,unknown>{if(x===null||typeof x!=='object'||Array.isArray(x))throw new Error('expected JSON object');return x as Record<string,unknown>}
function str(x:unknown,name:string,max:number,nonempty=true):string{if(typeof x!=='string'||x.length>max||(nonempty&&!x.trim()))throw new Error('invalid '+name);return x.trim()}
function locale(x:unknown,id:string){const a=record(x);return {name:str(a.name,id+'.name',120),summary:str(a.summary,id+'.summary',500),description:str(a.description??'',id+'.description',20000,false)}}
const slugRe=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidRe=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateCatalogWrite(raw:unknown):CatalogWrite{
 const p=record(raw);const slug=str(p.slug,'slug',80);const categorySlug=str(p.categorySlug,'categorySlug',80);
 if(!slugRe.test(slug)||!slugRe.test(categorySlug))throw new Error('invalid slug');
 if(p.id!==undefined&&(typeof p.id!=='string'||!uuidRe.test(p.id)))throw new Error('invalid id');
 if(!types.has(p.type as string)||!states.has(p.status as string))throw new Error('invalid type or status');
 if(typeof p.featured!=='boolean')throw new Error('featured must be boolean');
 const locales=record(p.locales); const prices=record(p.prices);
 const THB=prices.THB,USD=prices.USD;
 if(typeof THB!=='number'||typeof USD!=='number'||![THB,USD].every(v=>Number.isSafeInteger(v)&&v>=0&&v<=100_000_000))throw new Error('invalid prices in minor units');
 if(p.status==='published'&&p.type!=='other'&&THB===0&&USD===0){/* free products allowed */}
 return {id:p.id as string|undefined,slug,categorySlug,type:p.type as CatalogProductType,status:p.status as ProductStatus,featured:p.featured,locales:{th:locale(locales.th,'th'),en:locale(locales.en,'en')},prices:{THB,USD}};
}
export function validateCategory(raw:unknown):{slug:string;labelTh:string;labelEn:string}{
 const p=record(raw);const slug=str(p.slug,'slug',80);if(!slugRe.test(slug))throw new Error('invalid category slug');
 return {slug,labelTh:str(p.labelTh,'labelTh',100),labelEn:str(p.labelEn,'labelEn',100)};
}

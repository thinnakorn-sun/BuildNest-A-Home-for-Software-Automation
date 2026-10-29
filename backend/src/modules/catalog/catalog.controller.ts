import {Controller,Get,Param,Query,NotFoundException,BadRequestException} from '@nestjs/common';
import {PRODUCTS} from '@buildnest/contracts/catalog';
import {queryCatalog} from '@buildnest/contracts';
import type {PublicCatalogResponse,Product} from '@buildnest/contracts';
import {SupabaseService} from '../../services/supabase.service';
interface DbProduct {id:string;slug:string;category:string;type:Product['type'];title_th:string;title_en:string;summary_th:string;summary_en:string;amount_thb_minor:number|null;amount_usd_minor:number|null;featured:boolean}
function mapProduct(r:DbProduct):Product{return {id:r.id,slug:r.slug,category:r.category,type:r.type,icon:'▦',cover:'indigo',tag:r.featured?'FEATURED':'PUBLISHED',status:'published',price:{THB:Math.round((r.amount_thb_minor??0)/100),USD:Number(((r.amount_usd_minor??0)/100).toFixed(2))},title:{th:r.title_th,en:r.title_en},summary:{th:r.summary_th,en:r.summary_en},features:{th:[],en:[]}}}
@Controller('catalog')
export class CatalogController{
 constructor(private readonly db:SupabaseService){}
 @Get() async list(@Query('q')q?:string,@Query('category')category?:string,@Query('limit')limit?:string):Promise<PublicCatalogResponse>{
  if((q?.length??0)>100||(category?.length??0)>60)throw new BadRequestException('query too long');
  if(limit!==undefined&&!/^[1-9]\d{0,2}$/.test(limit))throw new BadRequestException('invalid limit');
  if(!this.db.configured)return {items:queryCatalog(PRODUCTS,{q,category,limit:limit?Number(limit):100}),total:PRODUCTS.length,source:'sample'};
  const rows=await this.db.publicRest<DbProduct[]>('public_catalog_items?select=*&limit=100');
  const all=rows.map(mapProduct);
  const items=queryCatalog(all,{q,category,limit:limit?Number(limit):100});
  return {items,total:all.length,source:'supabase'};
 }
 @Get(':slug') async find(@Param('slug')slug:string){
  if(!/^[a-z0-9-]{1,80}$/.test(slug))throw new BadRequestException('invalid slug');
  if(!this.db.configured){const product=PRODUCTS.find(p=>p.slug===slug);if(!product)throw new NotFoundException('product not found');return {...product,source:'sample'};}
  const rows=await this.db.publicRest<DbProduct[]>(`public_catalog_items?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if(!rows.length)throw new NotFoundException('product not found');return {...mapProduct(rows[0]),source:'supabase'};
 }
}

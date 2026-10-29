import {Body,Controller,Get,Post,UseGuards,BadRequestException,Req,Param,NotFoundException} from '@nestjs/common';
import {validateCatalogWrite,validateCategory} from '@buildnest/contracts';
import {AdminGuard} from '../../guards/admin.guard';
import type {Identity} from '../../services/identity.service';
import {SupabaseService} from '../../services/supabase.service';
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
 constructor(private readonly db:SupabaseService){}
 @Get('products') async list(){return {items:await this.db.privateRest('products?select=id,slug,product_type,status,featured,category_id,updated_at&order=updated_at.desc&limit=100'),source:'supabase'}}
 @Get('products/:id') async detail(@Param('id') id:string){
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new BadRequestException('invalid id');
   const [p,l,prices]=await Promise.all([
     this.db.privateRest<any[]>(`products?select=id,slug,product_type,status,featured,category_id&id=eq.${id}&limit=1`),
     this.db.privateRest<any[]>(`product_localizations?select=locale,name,summary,description_md&product_id=eq.${id}`),
     this.db.privateRest<any[]>(`product_prices?select=currency,amount_minor&product_id=eq.${id}&license_tier=eq.personal`)
   ]);
   if(!p.length)throw new NotFoundException('product not found');
   const cats=await this.db.privateRest<Array<{slug:string}>>(`categories?select=slug&id=eq.${p[0].category_id}&limit=1`);
   const th=l.find(x=>x.locale==='th'),en=l.find(x=>x.locale==='en');
   const amount=(currency:string)=>prices.find(x=>x.currency===currency)?.amount_minor??0;
   return {id:p[0].id,slug:p[0].slug,categorySlug:cats[0]?.slug||'',type:p[0].product_type,status:p[0].status,featured:p[0].featured,
     locales:{th:{name:th?.name||'',summary:th?.summary||'',description:th?.description_md||''},en:{name:en?.name||'',summary:en?.summary||'',description:en?.description_md||''}},prices:{THB:amount('THB'),USD:amount('USD')}};
 }
 @Get('categories') async categories(){return {items:await this.db.privateRest('categories?select=id,slug,label_th,label_en,is_active&order=slug.asc&limit=100'),source:'supabase'}}
 @Post('categories') async category(@Body() raw:unknown,@Req() request:{actor:Identity}){
   let value;try{value=validateCategory(raw)}catch(e){throw new BadRequestException((e as Error).message)}
   const id=await this.db.privateRest<string>('rpc/admin_create_category','POST',{p_slug:value.slug,p_label_th:value.labelTh,p_label_en:value.labelEn,p_actor_id:request.actor.id});
   return {id,created:true};
 }
 @Post('products') async upsert(@Body() raw:unknown,@Req() request:{actor:Identity}){
   let p;try{p=validateCatalogWrite(raw)}catch(e){throw new BadRequestException((e as Error).message)}
   // PostgreSQL RPC is atomic; the API is protected by verified user + database membership.
   const result=await this.db.privateRest<string>('rpc/admin_upsert_catalog_product','POST',{
     p_product_id:p.id||null,p_slug:p.slug,p_category_slug:p.categorySlug,p_type:p.type,p_status:p.status,p_featured:p.featured,
     p_locales:p.locales,p_prices:p.prices,p_actor_id:request.actor.id
   });
   return {id:result,ok:true};
 }
}

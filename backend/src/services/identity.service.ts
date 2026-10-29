import {Injectable,UnauthorizedException,ForbiddenException} from '@nestjs/common';
import {SupabaseService} from './supabase.service';
export interface Identity {id:string;email:string|null;role?:'owner'|'admin'|'support'}
@Injectable()
export class IdentityService{
 constructor(private readonly db:SupabaseService){}
 async userFromBearer(header?:string):Promise<Identity>{
   const match=/^Bearer ([A-Za-z0-9._~+\/-]+={0,2})$/.exec(header??'');
   if(!match||match[1].length>8192)throw new UnauthorizedException('Missing or invalid authentication');
   let user:{id?:string;email?:string};
   try{user=await this.db.request<{id?:string;email?:string}>('/auth/v1/user',{token:match[1]});}catch{throw new UnauthorizedException('Session expired or invalid')}
   if(!user?.id||!/^[0-9a-f-]{36}$/i.test(user.id))throw new UnauthorizedException('Invalid user identity');
   return {id:user.id,email:typeof user.email==='string'?user.email:null};
 }
 async requireAdmin(header?:string):Promise<Identity>{
   const identity=await this.userFromBearer(header);
   const query=`admin_members?select=role&user_id=eq.${encodeURIComponent(identity.id)}&limit=1`;
   const rows=await this.db.privateRest<{role:string}[]>(query);
   const role=rows[0]?.role;
   if(!['owner','admin'].includes(role))throw new ForbiddenException('Administrator role required');
   return {...identity,role:role as 'owner'|'admin'};
 }
}

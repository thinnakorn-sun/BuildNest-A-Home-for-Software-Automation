import {Injectable,ServiceUnavailableException,BadGatewayException} from '@nestjs/common';

/** Backend-only Supabase REST client. Never return service-role credentials to the browser. */
@Injectable()
export class SupabaseService {
  private get url(){const u=process.env.SUPABASE_URL||'';if(!/^https:\/\//.test(u) && !/^http:\/\/localhost(?::\d+)?$/.test(u))throw new ServiceUnavailableException('Supabase not configured');return u.replace(/\/$/,'')}
  get configured(){return Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY)}
  private key(privileged:boolean){const value=privileged?process.env.SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_ANON_KEY;if(!value)throw new ServiceUnavailableException('Supabase credentials not configured');return value}
  async request<T=unknown>(path:string,{method='GET',body,privileged=false,token}:{method?:string;body?:unknown;privileged?:boolean;token?:string}={}):Promise<T>{
    if(!path.startsWith('/')||path.startsWith('//'))throw new Error('invalid Supabase path');
    const k=this.key(privileged);let resp:Response;
    try{resp=await fetch(this.url+path,{method,cache:'no-store',headers:{apikey:k,Authorization:`Bearer ${token||k}`,...(body===undefined?{}:{'Content-Type':'application/json'}),Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});}catch{throw new BadGatewayException('Data service unreachable')}
    if(!resp.ok){if(resp.status===401||resp.status===403)throw new BadGatewayException('Data service authorization failed');if(resp.status===404)throw new BadGatewayException('Database migration not applied');throw new BadGatewayException(`Data service rejected request (${resp.status})`)}
    if(resp.status===204)return undefined as T;
    return await resp.json() as T;
  }
  publicRest<T>(path:string){return this.request<T>(`/rest/v1/${path}`)}
  privateRest<T>(path:string,method='GET',body?:unknown){return this.request<T>(`/rest/v1/${path}`,{method,body,privileged:true})}
}

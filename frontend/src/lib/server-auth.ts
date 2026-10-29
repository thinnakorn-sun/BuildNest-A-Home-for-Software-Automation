/** Server-side session handling. Access/refresh tokens are never sent to browser JS. */
import {NextRequest,NextResponse} from 'next/server';
const ACCESS='bn_access';const REFRESH='bn_refresh';
export function isSameOrigin(request:NextRequest):boolean{const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
export function setSession(response:NextResponse,body:Record<string,unknown>){
 if(typeof body.access_token!=='string'||typeof body.refresh_token!=='string')return;
 const opts={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'};
 response.cookies.set(ACCESS,body.access_token,{...opts,maxAge:Math.min(Math.max(Number(body.expires_in)||3600,60),3600)});
 response.cookies.set(REFRESH,body.refresh_token,{...opts,maxAge:60*60*24*30});
}
export function clearSession(response:NextResponse){response.cookies.delete(ACCESS);response.cookies.delete(REFRESH);}
export function supabaseConfig(){const url=process.env.SUPABASE_URL||'';const key=process.env.SUPABASE_ANON_KEY||'';if(!/^https:\/\//.test(url)&&!/^http:\/\/localhost(?::\d+)?$/.test(url))return null;if(!key)return null;return {url:url.replace(/\/$/,''),key};}
export async function authRequest(endpoint:string,data:unknown){const cfg=supabaseConfig();if(!cfg)return {status:503,data:{error:'Supabase is not configured'}};
 try{const response=await fetch(`${cfg.url}/auth/v1/${endpoint}`,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)return {status:response.status===429?429:400,data:{error:response.status===429?'Too many requests':'Authentication request failed'}};
 return {status:200,data:await response.json() as Record<string,unknown>};
 }catch{return {status:502,data:{error:'Authentication service is unavailable'}};}}
export async function accessToken(request:NextRequest):Promise<{token:string;fresh?:{access_token:string;refresh_token:string;expires_in:number}}|null>{
 const current=request.cookies.get(ACCESS)?.value;const refresh=request.cookies.get(REFRESH)?.value;
 if(!current&&!refresh)return null;
 const cfg=supabaseConfig();if(!cfg)return null;
 if(current){try{const res=await fetch(`${cfg.url}/auth/v1/user`,{headers:{apikey:cfg.key,Authorization:`Bearer ${current}`},cache:'no-store',signal:AbortSignal.timeout(9000)});if(res.ok)return {token:current};}catch{/* retry refresh */}}
 if(!refresh)return null;
 const result=await authRequest('token?grant_type=refresh_token',{refresh_token:refresh});
 const data=result.data;
 if(result.status!==200||typeof data.access_token!=='string'||typeof data.refresh_token!=='string')return null;
 return {token:data.access_token,fresh:{access_token:data.access_token,refresh_token:data.refresh_token,expires_in:Number(data.expires_in)||3600}};
}
export async function apiProxy(request:NextRequest,path:string,method:'GET'|'POST'){
 const session=await accessToken(request);if(!session)return NextResponse.json({error:'Login required'},{status:401});
 const base=process.env.API_INTERNAL_URL||'http://localhost:4000';
 if(!/^https?:\/\//.test(base))return NextResponse.json({error:'Backend configuration missing'},{status:503});
 try{const upstream=await fetch(`${base.replace(/\/$/,'')}/v1/${path}`,{method,headers:{Authorization:`Bearer ${session.token}`,...(method==='POST'?{'Content-Type':'application/json'}:{})},body:method==='POST'?await request.text():undefined,cache:'no-store',signal:AbortSignal.timeout(10000)});
 const response=NextResponse.json(await upstream.json(),{status:upstream.status});
 if(session.fresh)setSession(response,session.fresh);
 return response;
 }catch{return NextResponse.json({error:'Backend service unavailable'},{status:502});}
}

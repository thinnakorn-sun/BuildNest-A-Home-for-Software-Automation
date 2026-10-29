import {NextRequest,NextResponse} from 'next/server';
import {authRequest,isSameOrigin,setSession} from '@/lib/server-auth';
export async function POST(req:NextRequest){
 if(!isSameOrigin(req))return NextResponse.json({error:'Invalid origin'},{status:403});
 let data:any;try{data=await req.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 if(typeof data.email!=='string'||data.email.length>254||typeof data.password!=='string'||data.password.length>128)return NextResponse.json({error:'Invalid credentials'},{status:400});
 const result=await authRequest('token?grant_type=password',{email:data.email,password:data.password});
 if(result.status!==200)return NextResponse.json(result.data,{status:result.status});
 const response=NextResponse.json({ok:true});setSession(response,result.data);return response;
}

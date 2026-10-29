import {NextResponse} from 'next/server';
export async function GET(){
 const base=process.env.API_INTERNAL_URL||'http://localhost:4000';
 try{const res=await fetch(`${base.replace(/\/$/,'')}/v1/catalog?limit=100`,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!res.ok)throw new Error('catalog unavailable');return NextResponse.json(await res.json(),{headers:{'Cache-Control':'no-store'}})}
 catch{return NextResponse.json({error:'Catalog backend unavailable'},{status:503})}
}

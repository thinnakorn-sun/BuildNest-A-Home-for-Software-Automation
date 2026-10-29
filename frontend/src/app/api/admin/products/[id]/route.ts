import {NextRequest,NextResponse} from 'next/server';import {apiProxy} from '@/lib/server-auth';
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:'Invalid product ID'},{status:400});return apiProxy(request,`admin/products/${encodeURIComponent(id)}`,'GET')}

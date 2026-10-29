import {NextRequest,NextResponse} from 'next/server';import {apiProxy,isSameOrigin} from '@/lib/server-auth';
export async function GET(request:NextRequest){return apiProxy(request,'admin/products','GET')}
export async function POST(request:NextRequest){if(!isSameOrigin(request))return NextResponse.json({error:'Invalid origin'},{status:403});return apiProxy(request,'admin/products','POST')}

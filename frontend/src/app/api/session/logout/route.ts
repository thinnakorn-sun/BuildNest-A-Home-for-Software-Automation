import {NextRequest,NextResponse} from 'next/server';import {clearSession,isSameOrigin} from '@/lib/server-auth';
export async function POST(request:NextRequest){if(!isSameOrigin(request))return NextResponse.json({error:'Invalid origin'},{status:403});const response=NextResponse.json({ok:true});clearSession(response);return response;}

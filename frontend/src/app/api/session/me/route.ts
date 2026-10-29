import {NextRequest} from 'next/server';import {apiProxy} from '@/lib/server-auth';
export async function GET(request:NextRequest){return apiProxy(request,'me','GET')}

import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({version:'M2 (not connected)',configured:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY),paymentsEnabled:false,automationExecutionEnabled:false},{headers:{'Cache-Control':'no-store'}})}

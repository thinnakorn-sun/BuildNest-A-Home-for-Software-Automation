import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
 const app=await NestFactory.create(AppModule,{bodyParser:true,logger:['error','warn','log']});
 app.setGlobalPrefix('v1');
 app.enableCors({origin:[process.env.WEB_ORIGIN||'http://localhost:3000'],methods:['GET','POST','HEAD','OPTIONS'],allowedHeaders:['Content-Type','Authorization'],credentials:false});
 const port=Number(process.env.API_PORT||4000);
 await app.listen(port,'0.0.0.0');
 console.log(`BuildNest API :${port}/v1 — Supabase auth/CMS gated by environment`);
}
bootstrap().catch(err=>{console.error(err);process.exitCode=1;});

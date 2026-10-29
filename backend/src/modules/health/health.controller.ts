import {Controller,Get} from '@nestjs/common';
import {SupabaseService} from '../../services/supabase.service';
@Controller('health')export class HealthController{
 constructor(private readonly db:SupabaseService){}
 @Get()get(){return {status:'ok',service:'buildnest-api',mode:this.db.configured?'supabase-configured':'preview',version:'0.3.0',authEnabled:this.db.configured};}
}

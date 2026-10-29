import {Controller,Get} from '@nestjs/common';
import {AUTOMATIONS} from '@buildnest/contracts/catalog';
@Controller('automations')export class AutomationController{
 @Get('templates')templates(){return {items:AUTOMATIONS,source:'sample',executionEnabled:false};}
}

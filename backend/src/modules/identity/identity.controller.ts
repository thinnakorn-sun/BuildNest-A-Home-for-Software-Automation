import {Controller,Get,Headers} from '@nestjs/common';
import {IdentityService} from '../../services/identity.service';
@Controller('me')
export class IdentityController{
 constructor(private readonly identities:IdentityService){}
 @Get() getMe(@Headers('authorization') auth?:string){return this.identities.userFromBearer(auth)}
}

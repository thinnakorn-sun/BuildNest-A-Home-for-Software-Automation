import {CanActivate,ExecutionContext,Injectable} from '@nestjs/common';
import {IdentityService} from '../services/identity.service';
@Injectable()
export class AdminGuard implements CanActivate{
 constructor(private readonly identities:IdentityService){}
 async canActivate(ctx:ExecutionContext):Promise<boolean>{
   const req=ctx.switchToHttp().getRequest<{headers:{authorization?:string};actor?:unknown}>();
   req.actor=await this.identities.requireAdmin(req.headers.authorization);
   return true;
 }
}

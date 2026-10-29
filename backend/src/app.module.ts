import {Module} from '@nestjs/common';
import {CatalogController} from './modules/catalog/catalog.controller';
import {HealthController} from './modules/health/health.controller';
import {AutomationController} from './modules/automation/automation.controller';
import {IdentityController} from './modules/identity/identity.controller';
import {AdminController} from './modules/admin/admin.controller';
import {SupabaseService} from './services/supabase.service';
import {IdentityService} from './services/identity.service';
import {AdminGuard} from './guards/admin.guard';
@Module({controllers:[HealthController,CatalogController,AutomationController,IdentityController,AdminController],providers:[SupabaseService,IdentityService,AdminGuard]})
export class AppModule{}

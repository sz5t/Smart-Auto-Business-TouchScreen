import { ModuleEntryComponent } from './template/module-entry/module-entry.component';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { RouteRoutingModule } from './routes-routing.module';
// dashboard pages
import { DashboardV1Component } from './dashboard/v1/v1.component';
import { DashboardAnalysisComponent } from './dashboard/analysis/analysis.component';
import { DashboardMonitorComponent } from './dashboard/monitor/monitor.component';
import { DashboardWorkplaceComponent } from './dashboard/workplace/workplace.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserRegisterResultComponent } from './passport/register-result/register-result.component';
// single pages
import { UserLockComponent } from './passport/lock/lock.component';
import { CallbackComponent } from './callback/callback.component';
import { Exception403Component } from './exception/403.component';
import { Exception404Component } from './exception/404.component';
import { Exception500Component } from './exception/500.component';
import { AuthGuard } from '@core/utility/auth-guard';
import { BtnTableFieldLimit } from '@core/pipe/btn-table-field-limit.pipe';
import { TsLoginComponent } from './passport/ts-login/ts-login.component';
import { TsWorkPlaceComponent } from './touch-screen/ts-workplace/ts-workplace.component';

@NgModule({
    imports: [SharedModule, RouteRoutingModule],
    declarations: [
        DashboardV1Component,
        DashboardAnalysisComponent,
        DashboardMonitorComponent,
        DashboardWorkplaceComponent,
        TsWorkPlaceComponent,
        ModuleEntryComponent,
        // passport pages
        
        UserLoginComponent,
        UserRegisterComponent,
        UserRegisterResultComponent,
        TsLoginComponent,
        // single pages
        UserLockComponent,
        CallbackComponent,
        Exception403Component,
        Exception404Component,
        Exception500Component
    ],
    providers: [
        AuthGuard
    ]
})

export class RoutesModule { }

import { TsLayoutDefaultComponent } from './../layout/ts-default/ts-default.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LayoutFullScreenComponent } from '../layout/fullscreen/fullscreen.component';
import { LayoutPassportComponent } from '../layout/passport/passport.component';
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
import { CallbackComponent } from './callback/callback.component';
import { UserLockComponent } from './passport/lock/lock.component';
import { Exception403Component } from './exception/403.component';
import { Exception404Component } from './exception/404.component';
import { Exception500Component } from './exception/500.component';
import { AuthGuard } from '@core/utility/auth-guard';
import { TsLoginComponent } from './passport/ts-login/ts-login.component';
import { TsWorkPlaceComponent } from './touch-screen/ts-workplace/ts-workplace.component';
import { template } from '@angular/core/src/render3';
import { TsLayoutPassportComponent } from 'app/layout/ts-passport/ts-passport.component';
import { ModuleEntryComponent } from './template/module-entry/module-entry.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'passport/ts-login',
        pathMatch: 'full',
        canActivate: [AuthGuard]
        // component: LayoutDefaultComponent, canActivate: [AuthGuard],
        // children: [
        //     { path: '', redirectTo: 'dashboard/v1', pathMatch: 'full', canActivate: [AuthGuard] },
        //     { path: 'dashboard', redirectTo: 'dashboard/v1', pathMatch: 'full', canActivate: [AuthGuard] },
        //     { path: 'dashboard/v1', component: DashboardV1Component, canActivate: [AuthGuard] },
        //     { path: 'dashboard/analysis', component: DashboardAnalysisComponent, data: { title: '工作台'}, canActivate: [AuthGuard]  },
        //     { path: 'dashboard/monitor', component: DashboardMonitorComponent, canActivate: [AuthGuard] },
        //     { path: 'dashboard/workplace', component: DashboardWorkplaceComponent, data: { title: '工作台'}, canActivate: [AuthGuard] },
        //     { path: 'widgets', loadChildren: './widgets/widgets.module#WidgetsModule' },
        //     { path: 'style', loadChildren: './style/style.module#StyleModule' },
        //     { path: 'delon', loadChildren: './delon/delon.module#DelonModule' },
        //     { path: 'extras', loadChildren: './extras/extras.module#ExtrasModule' },
        //     { path: 'pro', loadChildren: './pro/pro.module#ProModule' },
        //     { path: 'system', loadChildren: './system/system.module#SystemModule'},
        //     { path: 'settings', loadChildren: './settings/settings.module#SettingsModule'},
        //     { path: 'test', loadChildren: './cn-test/cn-test.module#CnTestModule'},
        //     { path: 'template', loadChildren: './template/template.module#TemplateModule'},
        // ]
    },
    {
        path: 'ts',
        component: TsLayoutDefaultComponent,
        children: [
            {
                path: '', redirectTo: 'workplace', pathMatch: 'full', canActivate: [AuthGuard]
            },
            {
                path: 'workplace', component: TsWorkPlaceComponent , data: { title: '工作台'}
            },
            {
                path: 'entry', component: ModuleEntryComponent , data: { title: '工作台'}, canActivate: [AuthGuard]
            },
            {
                path: 'ts_template', loadChildren: './template/template.module#TemplateModule'
            }
        ]
    },
    // 全屏布局
    {
        path: 'data-v',
        component: LayoutFullScreenComponent,
        children: [
            { path: '', loadChildren: './data-v/data-v.module#DataVModule' }
        ]
    },
    // passport
    {
        path: 'passport',
        component: TsLayoutPassportComponent,
        children: [
            // { path: 'login', component: UserLoginComponent },
            { path: 'ts-login', component: TsLoginComponent},
            { path: 'register', component: UserRegisterComponent },
            { path: 'register-result', component: UserRegisterResultComponent }
        ]
    },
    // 单页不包裹Layout
    { path: 'callback/:type', component: CallbackComponent },
    { path: 'lock', component: UserLockComponent, data: { title: '锁屏', titleI18n: 'lock' } },
    { path: '403', component: Exception403Component },
    { path: '404', component: Exception404Component },
    { path: '500', component: Exception500Component },
    { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: environment.useHash })],
    exports: [RouterModule]
  })
export class RouteRoutingModule { }

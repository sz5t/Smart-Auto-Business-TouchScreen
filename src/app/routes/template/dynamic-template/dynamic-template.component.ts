import { CacheService } from '@delon/cache';
import { ApiService } from '@core/utility/api-service';
import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cn-dynamic-template',
    templateUrl: './dynamic-template.component.html',
    styleUrls: [`./dynamic-template.component.less`]
})
export class DynamicTemplateComponent implements OnInit, OnDestroy {
    public userInfo: any;
    public title;
    public permissions;
    public config: any = {
        rows: []
    };
    public initData;
    public isLoadLayout = false;

    public isCollapsed =  true;
    public triggerTemplate: TemplateRef<void> | null = null;
    @ViewChild('trigger') public customTrigger: TemplateRef<void>;
  
    constructor(
        private _http: ApiService,
        private _cacheService: CacheService,
        private _route: ActivatedRoute
    ) { }

    public ngOnInit() {
        this._route.params.subscribe(params => {
            this._http.getLocalData(params.templateName).subscribe(data => {
                this.config = data;
                (async() => {
                    this.userInfo = this._cacheService.getNone('userInfo');
                    const userId = this.userInfo['userId'];    
                    const permission = await this._getOperationPermission(params.name, userId, 'button');
                    if (permission.isSuccess) {
                        this.permissions = permission.data;
                        this._route.queryParams.subscribe(p => {
                            this.initData = p;
                            this.isLoadLayout = true;
                        });
                    } else {
                        console.log('出现异常:未能获取权限信息');
                    }
                })();
                
            });
        });

    }
    /** custom trigger can be TemplateRef **/
    public changeTrigger(): void {
        this.triggerTemplate = this.customTrigger;
    }

    public ngOnDestroy(): void {
        this.config = null;
    }

    public async _getOperationPermission(moduleCode, roleId, type) {
        return this._http.get('common/GetButtonData', {type: type, moduleCode: moduleCode, roleId: roleId}).toPromise();
    }

}

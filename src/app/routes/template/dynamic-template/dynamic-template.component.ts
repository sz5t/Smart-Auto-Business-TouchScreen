import { CacheService } from '@delon/cache';
import { ApiService } from '@core/utility/api-service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cn-dynamic-template',
    templateUrl: './dynamic-template.component.html',
    styleUrls: [`./dynamic-template.component.less`]
})
export class DynamicTemplateComponent implements OnInit, OnDestroy {
    public title;
    public permissions;
    public config = {
        rows: []
    };
    public initData;
    public isLoadLayout = false;
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
                    const userInfo = this._cacheService.get('userInfo');
                    const userId = userInfo['value']['userId'];    
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

    public ngOnDestroy(): void {
        this.config = null;
    }

    public async _getOperationPermission(moduleCode, roleId, type) {
        return this._http.get('common/GetButtonData', {type: type, moduleCode: moduleCode, roleId: roleId}).toPromise();
    }

}

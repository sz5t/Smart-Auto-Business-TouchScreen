import { EventEmitter } from '@angular/core';
import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    Type,
    Inject,
    AfterViewInit,
    Output
} from '@angular/core';
import { ApiService } from '@core/utility/api-service';
import { CacheService } from '@delon/cache';
import {
    BSN_COMPONENT_MODES,
    BsnComponentMessage,
    BSN_COMPONENT_CASCADE,
    BSN_COMPONENT_CASCADE_MODES,
    BSN_FORM_STATUS
} from '@core/relative-Service/BsnTableStatus';
import { Observable, Observer } from 'rxjs';
import { CnComponentBase } from '@shared/components/cn-component-base';
import { initDomAdapter } from '@angular/platform-browser/src/browser';
import { CommonTools } from '@core/utility/common-tools';
import { FormGroup } from '@angular/forms';
import { BeforeOperation } from '../before-operation.base';
import { NzMessageService, NzModalService, NzDrawerService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { LayoutResolverComponent } from '@shared/resolver/layout-resolver/layout-resolver.component';
import { SettingsService, MenuService } from '@delon/theme';
import { ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bsn-detail-list',
    templateUrl: './bsn-detail-list.component.html',
    styleUrls: [`bsn-detail-list.less`]
})
export class BsnDetailListComponent extends CnComponentBase
    implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    public config;
    @Input()
    public viewId;
    @Input()
    public initData;
    public count = 0;
    public formConfig = {};
    public isLoading = true;
    public data;
    public _statusSubscription;
    public _cascadeSubscription;
    public title;
    public switchAll = false;
    public _lastItem;
    public selectedItems;
    public loadingMore = false;
    public beforeOperation: BeforeOperation;

    @Output() public updateValue = new EventEmitter();
    constructor(
        private _apiService: ApiService,
        private _cacheService: CacheService,
        private _message: NzMessageService,
        private _modal: NzModalService,
        private _drawer: NzDrawerService,
        @Inject(BSN_COMPONENT_MODES)
        private stateEvents: Observable<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascade: Observer<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascadeEvents: Observable<BsnComponentMessage>,
        private router: Router,
        public settings: SettingsService,
        private menuService: MenuService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    ) {
        super();
        this.apiResource = this._apiService;
        this.cacheValue = this._cacheService;
        this.baseModal = this._modal;
        this.baseMessage = this._message;
        this.baseDrawer = this._drawer;
    }

    public ngOnInit() {

        this.initValue = this.initData ? this.initData : {};
        // this.formConfig['viewId'] = this.config.viewId;
        // this.formConfig['forms'] = this.config.forms;
        // this.formConfig['editable'] = 'text';

        this.resolverOperation();
        this.resolverRelation();
        // 初始化前置条件验证对象
        this.beforeOperation = new BeforeOperation({
            config: this.config,
            message: this.baseMessage,
            modal: this.baseModal,
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue.getNone('userInfo')
                ? this.cacheValue.getNone('userInfo')
                : {},
            apiResource: this.apiResource
        });
        this.load();
    }

    public onLoadMore() {

    }

    public resolverOperation() {
        this.after(this, 'selectItem', () => {
            this.cascade.next(
                new BsnComponentMessage(
                    BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILD,
                    this.config.viewId,
                    {
                        data: this._lastItem
                    }
                )
            );
            if (this.config.operationMapping) {
                this.config.operationMapping.forEach(operation => {
                    if (this._lastItem[operation['field']] && this._lastItem[operation['field']] === operation['value']) {
                        this[operation['operation']]();
                    } 
                });
            } else if (this.config.drawerDialog) {
                this.drawerDialog();
            } else if (this.config.linkConfig) {
                this.link();
            }
            
        });
    }

    public resolverRelation() {
        this.statusSubscriptions = this.stateEvents.subscribe(updateState => {
            if (updateState._viewId === this.config.viewId) {
                const option = updateState.option;
                this.beforeOperation.operationItemData = option.data;
                if (!this.beforeOperation.beforeItemDataOperation(option)) {
                    switch (updateState._mode) {
                        case BSN_COMPONENT_MODES.LINK:
                            this.linkToPage(option);
                            break;
                        case BSN_COMPONENT_MODES.LOGIN_OUT:
                            this.logout();
                            break;
                        case BSN_COMPONENT_MODES.WORK_CENTER:
                        this.linkToCenter(option);
                        return;
                    }
                }
            }
        });


        if (
            this.config.componentType &&
            this.config.componentType.child === true
        ) {
            this._cascadeSubscription = this.cascadeEvents.subscribe(
                cascadeEvent => {
                    // 解析子表消息配置
                    if (
                        this.config.relations &&
                        this.config.relations.length > 0
                    ) {
                        this.config.relations.forEach(relation => {
                            if (
                                relation.relationViewId === cascadeEvent._viewId
                            ) {
                                // 获取当前设置的级联的模式
                                const mode =
                                    BSN_COMPONENT_CASCADE_MODES[
                                        relation.cascadeMode
                                    ];
                                // 获取传递的消息数据
                                const option = cascadeEvent.option;
                                // 解析参数
                                if (
                                    relation.params &&
                                    relation.params.length > 0
                                ) {
                                    relation.params.forEach(param => {
                                        if (!this.tempValue) {
                                            this.tempValue = {};
                                        }
                                        this.tempValue[param['cid']] =
                                            option.data[param['pid']];
                                    });
                                }
                                // 匹配及联模式
                                switch (mode) {
                                    case BSN_COMPONENT_CASCADE_MODES.REFRESH:
                                        this.load();
                                        break;
                                    case BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILD:
                                        this.load();
                                        break;
                                }
                            }
                        });
                    }
                }
            );
        }
    }

    private link () {
        this.config.linkConfig.forEach(link => {
            let isMapping = false;
            if (link.fieldMapping) {
                link.fieldMapping.forEach(field => {
                    if (this._lastItem[field['field']] && this._lastItem[field['field']] === field['value']) {
                        isMapping = true;
                    }
                });
            }
            if (isMapping) {
                this.linkToPage({data: this._lastItem, link: link.link, params: link.routeParams}, link)
            }
        });
    }

    /**
     * 根据表单组件routeParams属性配置参数,执行页面跳转
     * @param option 按钮操作配置参数
     */
    private linkToPage(option, link?) {
        const params = CommonTools.parametersResolver({
            params: link.routeParams ? link.routeParams : {},
            componentValue: option.data ? option.data : {},
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue
        });
        this.router.navigate([option.link], {queryParams: params});
    }

    private linkToCenter(option) {
        const params = CommonTools.parametersResolver({
            params: this.config.routeParams,
            componentValue: option.data ? option.data : {},
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue
        });
        this.router.navigate(['/ts/entry'], {queryParams: params});
    }

    public ngOnDestroy() {
        this.unsubscribe();
    }

    public async load() {
        const response = await this.get();
        if (response.isSuccess) {
            // 构建数据源
            // response.data.forEach(item => {
            //     item['checked'] = false;
            //     item['selected'] = false;
            // });

            this.data = response.data;
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
    }

    public async get() {
        return this._apiService
            .get(
                this.config.ajaxConfig.url,
                CommonTools.parametersResolver({
                    params: this.config.ajaxConfig.params,
                    tempValue: this.tempValue,
                    initValue: this.initValue,
                    cacheValue: this._cacheService,
                    routerValue: this._cacheService
                })
            )
            .toPromise();
    }


    public getItemValue(name, item) {
        let result;
        if (Array.isArray(this.config.fieldMapping)) {
            const index = this.config.fieldMapping.findIndex(s => s.name === name);
            index > -1 && (result = item[this.config.fieldMapping[index].field]);
        }
        return result;
    }

    public getMappingField(item, field) {
        let result;
        const excludeName = ['name', 'title', 'icon'];
        if (!excludeName.includes(field.name)) {
            result = item[field.field];
        }
        return result;
    }

    public selectItem(item) {
        if (item.selected) {
            // item.selected = !item.selected;
        } else {
            if (!this._lastItem) {
                this._lastItem = item;
            } else {
                this._lastItem['selected'] = false;
            }
            item['selected'] = !item['selected'];
            this._lastItem = item;
        }
        
        this.getSelectedItems();
    }

    private drawerDialog () {
        if (this.config.drawerDialog) {
            if (this.config.drawerDialog.drawerType === 'condition') {
                
                this.config.drawerDialog.drawers.forEach(drawer => {
                    let isMatch;
                    if (drawer.fieldMapping) {
                        drawer.fieldMapping.forEach(m => {
                            if (this._lastItem[m['field']] && this._lastItem[m['field']] === m['value']) {
                                isMatch = true;
                            }
                        });
                    }
                    if (isMatch === true) {
                        this.showDrawer(drawer);
                    }
                });
            } else {
                this.showDrawer(this.config.drawerDialog.drawers[0]);
            }
            
        }
    }

    /**
     * 弹出页面
     * @param dialog
     */
    private showDrawer(dialog) {
        const footer = [];
        this.apiResource.getLocalData(dialog.layoutName).subscribe(data => {
            const selectedRow = this._lastItem ? this._lastItem : {};
            const tmpValue = this.tempValue ? this.tempValue : {};
            const drawer = this.baseDrawer.create({
                // nzTitle: dialog.title,
                nzWidth: dialog.width,
                nzContent: LayoutResolverComponent,
                nzMaskClosable: true,
                nzPlacement: 'right',
                nzHeight: dialog.height,
                // nzBodyStyle: {
                //     'padding' : '8px',
                //     'background': 'hsla(0,0%,100%,.3)',
                //     'overflow': 'hidden',
                //     'scroll-y': true 
                // },
                nzClosable: false,
                nzContentParams: {
                    // permissions: this.permissions,
                    config: data,
                    initData: { ...tmpValue, ...selectedRow }
                },
            });

            drawer.afterOpen.subscribe(() => {
                
            });

            drawer.afterClose.subscribe(() => {
                
            });
            
        });
    }

    public selectItems(item) {
        item.selected = !item.selected;
        this.getSelectedItems();
    }

    public ngAfterViewInit() {
        this.load();
    }

    public switch() {
        this.data.forEach(d => d.selected = !!this.switchAll);
        this.getSelectedItems();
    }

    private getSelectedItems() {
        this.selectedItems =  this.data.filter(d => d.selected);
        this.updateValue.emit(this.selectedItems);
    }

    public logout() {
        this.baseModal.confirm({
            nzTitle: '确认要关闭本系统吗？',
            nzContent: '关闭后将清空相关操作数据！',
            nzOnOk: () => {
                this.tokenService.clear();
                this.cacheValue.clear();
                this.menuService.clear();
                // console.log(this.tokenService.login_url);
                // this.router.navigateByUrl(this.tokenService.login_url);
                // new Promise((resolve, reject) => {
                //     setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                this.router.navigateByUrl('/passport/ts-login').catch(() => {
                    this.apiResource.post('login_out');
                });    
                // }).catch(() => console.log('Oops errors!'));
            }
        });
    }
}
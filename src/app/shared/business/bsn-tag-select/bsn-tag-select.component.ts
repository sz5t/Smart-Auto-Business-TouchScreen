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
    BSN_FORM_STATUS,
    BSN_COMPONENT_MODE
} from '@core/relative-Service/BsnTableStatus';
import { Observable, Observer } from 'rxjs';
import { CnComponentBase } from '@shared/components/cn-component-base';
import { initDomAdapter } from '@angular/platform-browser/src/browser';
import { CommonTools } from '@core/utility/common-tools';
import { FormGroup } from '@angular/forms';
import { BeforeOperation } from '../before-operation.base';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bsn-tag-select',
    templateUrl: './bsn-tag-select.component.html',
    styleUrls: [`bsn-tag-select.less`]
})
export class BsnTagSelectComponent extends CnComponentBase
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
    public itemList;
    @Output() public updateValue = new EventEmitter();
    constructor(
        private _apiService: ApiService,
        private _cacheService: CacheService,
        private _message: NzMessageService,
        private _modal: NzModalService,
        @Inject(BSN_COMPONENT_MODE)
        private stateEvents: Observable<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascade: Observer<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascadeEvents: Observable<BsnComponentMessage>,
        private router: Router
    ) {
        super();
        this.apiResource = this._apiService;
        this.cacheValue = this._cacheService;
        this.baseModal = this._message;
        this.baseMessage = this._modal;
    }

    public ngOnInit() {

        this.initValue = this.initData ? this.initData : {};
        // this.formConfig['viewId'] = this.config.viewId;
        // this.formConfig['forms'] = this.config.forms;
        // this.formConfig['editable'] = 'text';

       
        this.resolverRelation();
        // 初始化前置条件验证对象
        // this.beforeOperation = new BeforeOperation({
        //     config: this.config,
        //     message: this.baseMessage,
        //     modal: this.baseModal,
        //     tempValue: this.tempValue,
        //     initValue: this.initValue,
        //     cacheValue: this.cacheValue.get('userInfo').value
        //         ? this.cacheValue.get('userInfo').value
        //         : {},
        //     apiResource: this.apiResource
        // });
    }

    public onLoadMore() {

    }

    public resolverRelation() {
        this.statusSubscriptions = this.stateEvents.subscribe(updateState => {
            if (updateState._viewId === this.config.viewId) {
                const option = updateState.option;
                this.beforeOperation.operationItemData = option.data;
                if (!this.beforeOperation.beforeItemDataOperation(option)) {
                    switch (updateState._mode) {
                        case BSN_COMPONENT_MODES.LINK:
                            // this.linkToPage(option);
                            break;
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

    // /**
    //  * 根据表单组件routeParams属性配置参数,执行页面跳转
    //  * @param option 按钮操作配置参数
    //  */
    // private linkToPage(option) {
    //     const params = CommonTools.parametersResolver({
    //         params: this.config.routeParams,
    //         componentValue: option.data ? option.data : {},
    //         tempValue: this.tempValue,
    //         initValue: this.initValue,
    //         cacheValue: this.cacheValue
    //     });
    //     this.router.navigate([option.link], {queryParams: params});
    // }

    public ngOnDestroy() {
        this.unsubscribe();
    }

    public async load() {
        const response = await this.get();
        if (response.isSuccess) {
            // 构建数据源
            response.data.forEach(item => {
                this.getFieldMapping(item);
            });
            this.itemList = response.data;
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
    }

    private getFieldMapping(item) {
        if (this.config.fieldMapping && Array.isArray(this.config.fieldMapping)) {
            this.config.fieldMapping.forEach(ele => {
                if (item[ele['field']]) {
                    item[ele['text']] = item[ele.field];
                    item['checked'] = item['checked'] ? item['checked'] : false;
                }
            });
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
                    cacheValue: this._cacheService
                })
            )
            .toPromise();
    }


    // public getItemValue(name, item) {
    //     let result;
    //     if (Array.isArray(this.config.fieldMapping)) {
    //         const index = this.config.fieldMapping.findIndex(s => s.name === name);
    //         index > -1 && (result = item[this.config.fieldMapping[index].field]);
    //     }
    //     return result;
    // }

    // public selectItem(item) {
    //     if (item.selected) {
    //         // item.selected = !item.selected;
    //     } else {
    //         if (!this._lastItem) {
    //             this._lastItem = item;
    //         } else {
    //             this._lastItem['selected'] = false;
    //         }
    //         item['selected'] = !item['selected'];
    //         this._lastItem = item;
    //     }
    //     // this.getSelectedItems();
    // }

    // public selectItems(item) {
    //     item['checked'] = !item.checked;
    //     this.getSelectedItems();
    // }

    public ngAfterViewInit() {
        if (this.config.componentType 
            && this.config.componentType.parent === true) {  
                this.load();
            }
        
    }

    // public switch() {
    //     this.data.forEach(d => d.selected = !!this.switchAll);
    //     this.getSelectedItems();
    // }

    private getCheckedItems() {
        this.selectedItems =  this.data.filter(d => d.checked);
        this.updateValue.emit(this.selectedItems);
    }

    private changeCategory($event, index) {
        if (this.config.componentType && 
            this.config.componentType.parent === true) {
                const checkedIds = [];
                const checkedItems = this.itemList
                .filter(itm => itm.checked === true)
                .forEach(itm => {
                    checkedIds.push(itm['Id']);
                });
                
                this.cascade.next(
                    new BsnComponentMessage(
                        BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILD,
                        this.config.viewId,
                        {
                            data: {_tag_select_ids: checkedIds.join(',')}
                        }
                    )
                );        
        }
        
    }
}

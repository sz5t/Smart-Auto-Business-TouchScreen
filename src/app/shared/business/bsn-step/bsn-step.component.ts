import { Router } from '@angular/router';
import { CacheService } from '@delon/cache';
import { CommonTools } from '@core/utility/common-tools';
import { CnComponentBase } from '@shared/components/cn-component-base';
import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    Type,
    Inject
} from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs/index';
import {
    BSN_COMPONENT_CASCADE,
    BSN_COMPONENT_MODES,
    BsnComponentMessage,
    BSN_EXECUTE_ACTION,
    BSN_COMPONENT_CASCADE_MODES
} from '@core/relative-Service/BsnTableStatus';
import { ApiService } from '@core/utility/api-service';
import { NzMessageService } from 'ng-zorro-antd';
import { Route } from '@angular/router';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bsn-step',
    templateUrl: './bsn-step.component.html',
    styleUrls: [
        `bsn-step.component.less`
    ]
})
export class BsnStepComponent extends CnComponentBase implements OnInit, OnDestroy {
    @Input()
    public config;
    @Input()
    public viewId;
    @Input() 
    public initData;
    public viewCfg;
    // public _tempValue = {};
    public _current = 0;
    public _status = 'wait';
    public indexContent = '';
    public itemList;
    public handleData;

    public _statusSubscription: Subscription;
    public _cascadeSubscription: Subscription;

    constructor(
        private _api: ApiService,
        private router: Router,
        private _message: NzMessageService,
        private _cache: CacheService,
        private _route: Router,
        @Inject(BSN_COMPONENT_MODES)
        private eventStatus: Observable<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascade: Observer<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascadeEvents: Observable<BsnComponentMessage>
    ) {
        super();
        this.apiResource = _api;
        this.baseMessage = _message;
        this.cacheValue = _cache;
    }

    public ngOnInit() {
        this.initValue = this.initData ? this.initData : {};
        this.resolverRelation()
        if (this.config.ajaxConfig) {
            // 异步加载步骤
            this.loadSteps();
        } else {
            // 加载固定步骤
            this.getViewCfg();
        }
    }

    public ngOnDestroy() {
        if (this._statusSubscription) {
            this._statusSubscription.unsubscribe();
        }
        if (this._cascadeSubscription) {
            this._cascadeSubscription.unsubscribe();
        }
    }

    private resolverRelation() {
        // 注册按钮状态触发接收器
        this._statusSubscription = this.eventStatus.subscribe(updateState => {
            if (updateState._viewId === this.config.viewId) {
                const option = updateState.option;
                switch (updateState._mode) {
                    case BSN_COMPONENT_MODES.LINK:
                        this.linkToPage(option, '');
                        return; 
                }
            }
        });
        // 通过配置中的组件关系类型设置对应的事件接受者
        // 表格内部状态触发接收器console.log(this.config);
        if (
            this.config.componentType &&
            this.config.componentType.parent === true
        ) {}
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
                                if (option) {
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
                                }

                                // 匹配及联模式
                                switch (mode) {
                                    case BSN_COMPONENT_CASCADE_MODES.REFRESH:
                                        
                                        break;
                                    case BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILD:
                                        
                                        break;
                                    case BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILDREN:
                                        
                                        break;
                                    case BSN_COMPONENT_CASCADE_MODES.CHECKED_ROWS:
                                        break;
                                    case BSN_COMPONENT_CASCADE_MODES.SELECTED_ROW:
                                        break;
                                }
                            }
                        });
                    }
                }
            );
        }
    }

    /**
     * 根据表单组件routeParams属性配置参数,执行页面跳转
     * @param option 按钮操作配置参数
     */
    private linkToPage(option, handleData) {
        const params = CommonTools.parametersResolver({
            params: this.config.routeParams,
            // componentValue: this.loadData ? this.loadData : this.value,
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue,
            item: handleData
        });
        this.router.navigate([option.link], {queryParams: params});
    }

    public loadSteps() {
        (async () => {
            const res: any = await this.getAsyncStepsData();
            if (res.isSuccess) {
                this.config.steps = [];
                res.data.forEach(dataItem => {
                    const d = {};
                    d['viewCfg'] = [];
                    this.config.dataMapping.forEach(dm => {
                        if (dataItem[dm.field]) {
                            d[dm.name] = dataItem[dm.field];
                        }
                    });
                    this.config.steps.push(d);
                    this.getViewCfg();
                });
            } else {
                this._message.error(res.message);
            }
        })();
    }

    public async getAsyncStepsData() {
        const params = {};
        const url = this.config.ajaxConfig.url;
        const ajaxParams = this.config.ajaxConfig.params;
        if (ajaxParams) {
            ajaxParams.forEach(param => {
                if (param.type === 'tempValue') {
                    if (this.tempValue[param.valueName]) {
                        params[param.name] = this.tempValue[param.valueName];
                    } else {
                        this._message.info('参数异常，无法加载数据');
                    }
                } else if (param.type === 'value') {
                    params[param.name] = param.value;
                } else if (param.type === 'GUID') {
                    params[param.name] = CommonTools.uuID(10);
                } else if (param.type === 'componentValue') {
                    // params[param.name] = componentValue;
                }
            });
        }
        return this.apiResource.get(url, params).toPromise();
    }

    public pre() {
        if (this._current === 0) return;
        this._current -= 1;
        this.changeContent();
    }

    public next() {
        if (this._current === this.config.steps.length) return;
        // 执行本步骤中的数据操作
        this.handleCurrent();
        // 进入下一步骤
        this._current += 1;
        this.changeContent();
    }


    // 完成最后操作
    public done() {
        const ajaxConfig = this.config.finishAjaxConfig[0];
        this.handleAjax(ajaxConfig);
        this._current = this.config.steps.length - 1;
        this.changeContent();
    }

    /**
     * 跳转回到上个页面的内容
     */
    public backTo() {
        // this.config.backAjaxConfig;
        const url = this.config.backAjaxConfig.link;
        const param = this.buildParamsters(this.config.backAjaxConfig.params, {});
        this._route.navigate([url], {queryParams: param});

    } 

    // 处理点击下一步按钮前的数据处理
    public handleCurrent() {    
        // this.config.nextAjaxConfig;
        const ajaxConfig = this.config.nextAjaxConfig[this._current];
        this.handleAjax(ajaxConfig);
    }

    private handleAjax(ajaxConfig) {
        if (ajaxConfig) {
            const {url, ajaxType, params, link, action} = ajaxConfig;
            let paramsData;
            switch (action) {
                case BSN_EXECUTE_ACTION.EXECUTE_SELECTED:
                    paramsData = this.buildParamsters(params, this.handleData);
                break;
                case BSN_EXECUTE_ACTION.EXECUTE_CHECKED:
                    paramsData = this.buildBatchParameters(params);
                    break;
                case BSN_EXECUTE_ACTION.EXECUTE_CHECKED_ID:
                    paramsData = this.buildIdsParameters(params);
                    break;
                case BSN_EXECUTE_ACTION.EXECUTE_LINK:
                    paramsData = this.buildParamsters(params, this.initValue);
                    this._route.navigate(link, paramsData);
                    return;
            }

            this.apiResource[ajaxType](url, paramsData).subscribe(result => {
                if (result.isSuccess) {
                    console.log(`current ${this._current} is success`);
                }
            }, error => {
                console.log(error);
            });
        }
    }

    private buildParamsters(param, data) {
        return CommonTools.parametersResolver({
            params: param,
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue,
            item: data
        });

    }

    private buildBatchParameters(paramCfg) {
        let params;
        if (Array.isArray(this.handleData)) {
            params = [];
            this.handleData.forEach(d => {
                const p =  this.buildParamsters(paramCfg, d);
                params.push(p);
            });
        } else if (this.handleData) {
            params = this.buildParamsters(paramCfg, this.handleData);
        }
        return params;
    }

    private buildIdsParameters(paramCfg) {
       
        const ids = [];
        const Id = this.config.keyId ? this.config.keyId : 'Id';
        if (Array.isArray(this.handleData)) {
            this.handleData.forEach(d => {
                ids.push(d[Id]);
            });
        } else if (this.handleData) {
            ids.push(this.handleData[Id]);
        }

        return this.buildParamsters(paramCfg, ids.join(','));
    }
    

    public changeContent() {
        this.getViewCfg();
    }

    public getViewCfg() {
        this.viewCfg = this.config.steps[this._current].viewCfg;
    }

    public getData() {
        this.apiResource.get('https://randomuser.me/api/?results=12')
        .toPromise().then(res => {
            this.itemList = res.results;
        })
    }

    public handleStep(data) {
        this.handleData = data;
    }
}

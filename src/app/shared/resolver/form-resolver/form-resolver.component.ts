import { BSN_COMPONENT_MODES } from './../../../core/relative-Service/BsnTableStatus';
import { CnFormBase } from './form.base';
import { BeforeOperation } from './../../business/before-operation.base';
import { LayoutResolverComponent } from './../layout-resolver/layout-resolver.component';
import { CnFormWindowResolverComponent } from '@shared/resolver/form-resolver/form-window-resolver.component';
import { BsnUploadComponent } from '@shared/business/bsn-upload/bsn-upload.component';
import { CacheService } from '@delon/cache';
import { CommonTools } from './../../../core/utility/common-tools';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    Inject,
    OnDestroy,
    AfterViewInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@core/utility/api-service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import {
    RelativeService,
    RelativeResolver
} from '@core/relative-Service/relative-service';
import { CnComponentBase } from '@shared/components/cn-component-base';
import {
    BsnComponentMessage,
    BSN_COMPONENT_CASCADE,
    BSN_COMPONENT_CASCADE_MODES,
    BSN_FORM_STATUS,
    BSN_OUTPOUT_PARAMETER_TYPE
} from '@core/relative-Service/BsnTableStatus';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cn-form-resolver,[cn-form-resolver]',
    templateUrl: './form-resolver.component.html',
    styles: [`



        :host ::ng-deep .ant-form-item {
            font-size: 1.1em;

        }

        :host ::ng-deep .ant-form-item label {
            font-size: 1.1em;
        }

        :host ::ng-deep .ant-form-text span{
            font-size: 1.1em;
            font-weight: 600;
            /*text-decoration: underline;*/
            border-bottom: 1px solid #000;
        }

        :host ::ng-deep .ad-standard-form-row {
            border: none;
            margin-top:10px;
            margin-bottom: 10px;
            padding:0px;

        }

        :host ::ng-deep .ad-standard-form-row .label >span {
            line-height:0px;
        }

        :host ::ng-deep .ant-form-item-label > label::after {
            content:'';
        }

    `]
})
export class FormResolverComponent extends CnFormBase
    implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input()
    public config;
    @Input()
    public permissions = [];
    @Input()
    public dataList;
    @Input()
    public initData;
    @Input()
    public formTitle;
    @Input()
    public formValue;
    @Input()
    public editable;
    @Output()
    public submit: EventEmitter<any> = new EventEmitter<any>();
    public _relativeResolver;
    public isSpinning = false;
    public changeConfig = [];
    public beforeOperation: BeforeOperation;
    public change_config = {};
    public cascadeList = {};
    public toolbarConfig = [];
    constructor(
        private builder: FormBuilder,
        private apiService: ApiService,
        private cacheService: CacheService,
        private message: NzMessageService,
        private modalService: NzModalService,
        private _messageService: RelativeService,
        @Inject(BSN_COMPONENT_MODES)
        private stateEvents: Observable<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascade: Observer<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascadeEvents: Observable<BsnComponentMessage>,
        private router: Router
    ) {
        super();
        this.formBuilder = this.builder;
        this.baseMessage = this.message;
        this.baseModal = this.modalService;
        this.apiResource = this.apiService;
    }

    public ngAfterViewInit() {
        if (this.config.ajaxConfig) {
            if (this.config.componentType) {
                if (!this.config.componentType.child) {
                    this.load();
                } else if (this.config.componentType.own === true) {
                    this.load();
                }
            } else {
                this.load();
            }
        } else if (this.formValue) {
            // 表单加载初始化数据
            this.setFormValue(this.formValue);
            // console.log('表单加载初始化数据', this.formValue);
        }
        // 初始化前置条件验证对象
        this.beforeOperation = new BeforeOperation({
            config: this.config,
            message: this.message,
            modal: this.modalService,
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue.getNone('userInfo')
                ? this.cacheValue.getNone('userInfo')
                : {},
            apiResource: this.apiResource
        });

        this.GetToolbarEvents();
    }

    // region: 组件生命周期事件

    public ngOnInit() {
        this.initValue = this.initData ? this.initData : {};
        this.cacheValue = this.cacheService ? this.cacheService : {};
        this.formState = this.initFormState();
        this.controls = this.initControls(this.config.forms);
        // 做参数简析
        if (this.config.select) {
            this.config.select.forEach(selectItem => {
                this.config.forms.forEach(formItem => {
                    formItem.controls.forEach(control => {
                        if (control) {
                            if (control.name === selectItem.name) {
                                control['select'] = selectItem.config;
                            }
                        }
                    });
                });
            });
        }

        this.form = this.createGroup();
        this.resolverRelation();

        const formConfigControlobject = {};
        this.config.forms.forEach(formItem => {
            formItem.controls.forEach(control => {
                formConfigControlobject[control.name] = control;
                this.change_config[control.name] = null;
            });
        });
        this.formConfigControl = formConfigControlobject;
        this.caseLoad(); // liu 20180521 测试
    }

    public ngOnDestroy() {
        this.unsubscribe();
    }

    public initFormState() {
        switch (this.config.editable) {
            case 'post':
                return 'post';
            case 'put':
                return 'put';
            case 'text':
                return 'text';
            default:
                return 'text';
        }
    }

    // region: 解析消息
    private resolverRelation() {
        // 注册按钮状态触发接收器
        this.statusSubscriptions = this.stateEvents.subscribe(updateState => {
            if (updateState._viewId === this.config.viewId) {
                const option = updateState.option;
                this.beforeOperation.operationItemData = this.value;
                if (!this.beforeOperation.beforeItemDataOperation(option)) {
                    switch (updateState._mode) {
                        case BSN_COMPONENT_MODES.REFRESH:
                            this.load();
                            break;
                        case BSN_COMPONENT_MODES.CREATE:
                            this.formState = BSN_FORM_STATUS.CREATE;
                            this.resetForm();
                            break;
                        case BSN_COMPONENT_MODES.EDIT:
                            this.load();
                            this.formState = BSN_FORM_STATUS.EDIT;
                            break;
                        case BSN_COMPONENT_MODES.CANCEL:
                            this.load();
                            this.formState = BSN_FORM_STATUS.TEXT;
                            break;
                        case BSN_COMPONENT_MODES.SAVE:
                            if (option.ajaxConfig) {
                                this.saveForm_2(option.ajaxConfig);
                            } else {
                                this.message.info('未配置任何操作!');
                            }
                            break;
                        case BSN_COMPONENT_MODES.DELETE:
                            if (option.ajaxConfig) {
                                this.modalService.confirm({
                                    nzTitle: '确认删除当前数据？',
                                    nzContent: '',
                                    nzOnOk: () => {
                                        this.delete(option.ajaxConfig);
                                    },
                                    nzOnCancel() { }
                                });
                            }
                            break;
                        case BSN_COMPONENT_MODES.EXECUTE:
                            if (option.ajaxConfig) {
                                // 根据表单状态进行具体配置操作
                                this.resolveAjaxConfig(
                                    option.ajaxConfig,
                                    this.formState,
                                    () => {
                                        // this.load();
                                        this.sendCascadeMessage();
                                    }
                                );
                            }
                            break;
                        case BSN_COMPONENT_MODES.WINDOW:
                            this.windowDialog(option);
                            break;
                        case BSN_COMPONENT_MODES.FORM:
                            this.formDialog(option);
                            break;
                        case BSN_COMPONENT_MODES.UPLOAD:
                            this.uploadDialog(option);
                            break;
                        case BSN_COMPONENT_MODES.LINK:
                            this.linkToPage(option);
                            break;
                    }
                }
            }
        });
        // 通过配置中的组件关系类型设置对应的事件接受者
        // 表格内部状态触发接收器console.log(this.config);
        if (
            this.config.componentType &&
            this.config.componentType.child === true
        ) {
            this.cascadeSubscriptions = this.cascadeEvents.subscribe(
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

    // endregion

    public ngOnChanges() {
        if (this.form) {
            const controls = Object.keys(this.form.controls);
            const configControls = this.controls.map(item => item.name);

            controls
                .filter(control => !configControls.includes(control))
                .forEach(control => this.form.removeControl(control));

            configControls
                .filter(control => !controls.includes(control))
                .forEach(name => {
                    const config = this.controls.find(
                        control => control.name === name
                    );
                    // const config = this.config.forms.find(control => control.name === name);
                    this.form.addControl(name, this.createControl(config));
                });
        }
    }

    // endregion

    // region: 数据处理

    public load() {
        if (this.config.ajaxConfig &&
            (this.formState === BSN_FORM_STATUS.EDIT || this.formState === BSN_FORM_STATUS.TEXT)) {
            setTimeout(() => {
                this.isSpinning = true;
            })
            let url: string;
            if (this.config.ajaxConfig.urlobj) {
                url = this.buildUrl(this.config.ajaxConfig.url, this.config.ajaxConfig.urlobj)
            } else {
                url = this.buildUrl(this.config.ajaxConfig.url, '');
            }
            const params = this.buildParameter(this.config.ajaxConfig.params);
            this.execute(url, this.config.ajaxConfig.ajaxType , params).then(result => {
                let res;
                if (Array.isArray(result.data)) {
                    res = result.data[0]
                } else {
                    res = result.data;
                }
                this.loadData = res;
                if (res) {
                    this.setFormValue(res);
                    // 给主键赋值
                    if (this.config.keyId) {
                        this.tempValue['_id'] =
                        res[this.config.keyId];
                    } else {
                        if (res['Id']) {
                            this.tempValue['_id'] = res['Id'];
                        }
                    }
                } else {
                    this.tempValue['_id'] && delete this.tempValue['_id'];
                    this.form.reset();
                }
            });
        }
        setTimeout(() => {
            this.isSpinning = false;
        });

    }


    public async saveForm_2(ajaxConfigs) {
        let result;
        const method = ajaxConfigs[0].ajaxType;
        result = await this[method](ajaxConfigs[0]);
        // let result;
        // const method = this.formState;
        // const index = ajaxConfigs.findIndex(
        //     item => item.ajaxType === method
        // );
        // result = await this[method](ajaxConfigs[index]);
        // // if (method === BSN_FORM_STATUS.TEXT) {
        //     this.message.warning('请在编辑数据后进行保存！');
        //     return false;
        // } else {
        //     const index = ajaxConfigs.findIndex(
        //         item => item.ajaxType === method
        //     );
        //     result = await this[method](ajaxConfigs[index]);
        // }
    }

    /**
     * 发送接口数据
     * @param getConfig 数据访问配置
     */
    private async get(getConfig) {
        let result = true;
        let url: string ;
        if (getConfig.urlobj) {
            url = this.buildUrl(getConfig.url, getConfig.urlobj);
        } else {
            url = this.buildUrl(getConfig.url, '');
        }
        const newValue = this.GetComponentValue();
        const params = this.buildParameter(getConfig.params);
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        let requestString = '';
        for(let p in params) {
            if(params.hasOwnProperty(p) && p !== undefined) {
                requestString += p + '=' + params[p] + '&';
            }
        }
        script.src = url + '?' + requestString;
        document.body.appendChild(script);
        // this.execute(url, getConfig.ajaxType, params).then( result => {});
        // return result;
    }

    /**
     * 新增数据
     * @param postConfig 数据访问配置
     */
    private async post(postConfig) {
        let result = true;
        let url: string ;
        if (postConfig.urlobj) {
            url = this.buildUrl(postConfig.url, postConfig.urlobj);
        } else {
            url = this.buildUrl(postConfig.url, '');
        }
        const newValue = this.GetComponentValue();
        const params = this.buildParameter(postConfig.params);
        const res = await this.execute(url, postConfig.ajaxType, params);
        if (res.isSuccess) {
            this.message.create('success', '操作成功');
            this.formState = BSN_FORM_STATUS.EDIT;
            // this.load();
            // 发送消息 刷新其他界面
            this.sendCascadeMessage();
        } else {
            this.baseMessage.create('error', res.message);
            result = false;
        }
        return result;
    }

    /**
     * 修改数据
     * @param putConfig 数据访问配置
     */
    private async put(putConfig) {
        let result = true;
        let url: string ;
        if (putConfig.urlobj) {
            url = this.buildUrl(putConfig.url, putConfig.urlobj);
        } else {
            url = this.buildUrl(putConfig.url, '');
        }
        const newValue = this.GetComponentValue();
        const params = this.buildParameter(putConfig.params);
        if (params && !params['Id']) {
            this.message.warning('编辑数据的Id不存在，无法进行更新！');
            return;
        } else {
            const res = await this.execute(url, putConfig.ajaxType, params);
            if (res.isSuccess) {
                this.message.create('success', '保存成功');
                this.formState = BSN_FORM_STATUS.EDIT;
                this.load();
                // 发送消息 刷新其他界面
                this.sendCascadeMessage();
            } else {
                this.message.create('error', res.message);
                result = false;
            }
        }
        return result;
    }



    /**
     * 删除数据
     * @param deleteConfig 数据访问配置
     */
    private async delete(deleteConfig) {
        const asyncResponse = [];
        for (let i = 0, len = deleteConfig.length; i < len; i++) {
            const url = this.buildUrl(deleteConfig[i].url);
            const params = this.buildParameter(deleteConfig[i].params);
            if (params && !params['_ids']) {
                this.baseMessage.warning('删除数据的_ids不存在，无法进行删除！');
                return;
            } else {
                const res = await this.execute(
                    url,
                    deleteConfig[i].ajaxType,
                    params
                );
                asyncResponse.push(res);
            }
        }
        Promise.all(asyncResponse).then(res => {
            this.baseMessage.create('success', '操作完成');
            this.formState = this.initFormState();
            this.form.reset();
            this.sendCascadeMessage();
        }, error => {
            this.baseMessage.create('error', '操作异常,未能正确删除数据');
        })
    }

    public sendCascadeMessage() {
        // 发送消息 刷新其他界面
        if (
            this.config.componentType &&
            this.config.componentType.parent === true
        ) {
            this.cascade.next(
                new BsnComponentMessage(
                    BSN_COMPONENT_CASCADE_MODES.REFRESH,
                    this.config.viewId,
                    {
                        data: { ...this.returnValue, ...this.value }
                    }
                )
            );
        }
    }

    public initParameters(data?) {
        if (!this.tempValue) {
            this.tempValue = {};
        }
        for (const d in data) {
            this.tempValue[d] = data[d];
        }
        // console.log('初始化参数', this.tempValue);
    }

    public initParametersLoad(data?) {
        if (!this.tempValue) {
            this.tempValue = {};
        }
        for (const d in data) {
            this.tempValue[d] = data[d];
        }
        this.load();
        console.log('初始化参数并load 主子刷新', this.tempValue);
    }

    /**
     * 弹出上传对话
     * @param option
     */
    public uploadDialog(option) {
        if (this.config.uploadDialog && this.config.uploadDialog.length > 0) {
            const index = this.config.uploadDialog.findIndex(
                item => item.name === option.actionName
            );
            this.openUploadDialog(this.config.uploadDialog[index]);
        }
    }

    /**
     * 弹出上传表单
     * @param dialog
     * @returns {boolean}
     */
    private openUploadDialog(dialog) {
        if (!this.value) {
            this.message.warning('请选中一条需要添加附件的记录！');
            return false;
        }
        const footer = [];
        const obj = {
            _id: this.value[dialog.keyId],
            _parentId: this.tempValue['_parentId'],
            ...this.value,
            ...this.tempValue
        };
        const modal = this.modalService.create({
            nzTitle: dialog.title,
            nzWidth: dialog.width ? dialog.width : 400,
            nzContent: BsnUploadComponent,
            nzComponentParams: {
                config: dialog.ajaxConfig,
                refObj: obj
            },
            nzFooter: footer
        });
    }

    /**
     * 弹出窗体
     * @param option
     */
    public windowDialog(option) {
        if (this.config.windowDialog && this.config.windowDialog.length > 0) {
            const index = this.config.windowDialog.findIndex(
                item => item.name === option.actionName
            );
            this.showLayout(this.config.windowDialog[index]);
        }
    }

    /**
     * 弹出表单
     * @param option
     */
    public formDialog(option) {
        if (this.config.formDialog && this.config.formDialog.length > 0) {
            const index = this.config.formDialog.findIndex(
                item => item.name === option.actionName
            );
            this.showForm(this.config.formDialog[index]);
        }
    }

    /**
     * 单条数据表单
     * @param dialog
     * @returns {boolean}
     */
    private showForm(dialog) {
        let obj;
        if (dialog.type === 'add') {
        } else if (dialog.type === 'edit') {
            if (!this.value) {
                this.message.warning('请选中一条需要添加附件的记录！');
                return false;
            }
        }
        obj = {
            _id: this.value[dialog.keyId] ? this.value[dialog.keyId] : '',
            // _parentId: this.tempValue['_parentId'] ? this.tempValue['_parentId'] : ''
            ...this.tempValue
        };

        const footer = [];
        const modal = this.modalService.create({
            nzTitle: dialog.title,
            nzWidth: dialog.width,
            nzContent: CnFormWindowResolverComponent,
            nzComponentParams: {
                config: dialog,
                tempValue: obj,
                permissions: this.permissions
            },
            nzFooter: footer
        });

        if (dialog.buttons) {
            dialog.buttons.forEach(btn => {
                const button = {};
                button['label'] = btn.text;
                button['type'] = btn.type ? btn.type : 'default';
                button['onClick'] = componentInstance => {
                    if (btn['name'] === 'save') {
                        componentInstance.buttonAction(
                            btn,
                            () => {
                                modal.close();
                                this.load();
                                this.sendCascadeMessage();
                            }
                        );
                    } else if (btn['name'] === 'saveAndKeep') {
                        componentInstance.buttonAction(
                            btn,
                            () => {
                                this.resetForm();
                                this.load();
                                this.sendCascadeMessage();
                            }
                        );
                    } else if (btn['name'] === 'close') {
                        modal.close();
                    } else if (btn['name'] === 'reset') {
                        this._resetForm(componentInstance);
                    }
                };
                footer.push(button);
            });
        }
    }
    /**
     * 重置表单
     * @param comp
     * @private
     */
    private _resetForm(comp: FormResolverComponent) {
        comp.resetForm();
    }
    /**
     * 弹出批量处理表单
     * @param option
     */
    public formBatchDialog(option) {
        if (this.config.formDialog && this.config.formDialog.length > 0) {
            const index = this.config.formDialog.findIndex(
                item => item.name === option.actionName
            );
            this.showBatchForm(this.config.formDialog[index]);
        }
    }

    /**
     * 弹出页面
     * @param dialog
     */
    private showLayout(dialog) {
        const footer = [];
        this.apiService.getLocalData(dialog.layoutName).subscribe(data => {
            const modal = this.modalService.create({
                nzTitle: dialog.title,
                nzWidth: dialog.width,
                nzContent: LayoutResolverComponent,
                nzComponentParams: {
                    config: data,
                    initData: { ...this.value, ...this.tempValue },
                    permissions: this.permissions
                },
                nzFooter: footer
            });
            if (dialog.buttons) {
                dialog.buttons.forEach(btn => {
                    const button = {};
                    button['label'] = btn.text;
                    button['type'] = btn.type ? btn.type : 'default';
                    button['show'] = true;
                    button['onClick'] = componentInstance => {
                        if (btn['name'] === 'save') {
                            (async () => {
                                const result = await componentInstance.buttonAction(
                                    btn
                                );
                                if (result) {
                                    modal.close();
                                    // todo: 操作完成当前数据后需要定位
                                    this.sendCascadeMessage();
                                    this.load();
                                }
                            })();
                        } else if (btn['name'] === 'saveAndKeep') {
                            (async () => {
                                const result = await componentInstance.buttonAction(
                                    btn
                                );
                                if (result) {
                                    // todo: 操作完成当前数据后需要定位

                                    this.load();
                                }
                            })();
                        } else if (btn['name'] === 'close') {
                            modal.close();
                            this.sendCascadeMessage();
                            this.load();
                        } else if (btn['name'] === 'reset') {
                            this._resetForm(componentInstance);
                        } else if (btn['name'] === 'ok') {
                            modal.close();
                            this.sendCascadeMessage();
                            this.load();
                            //
                        }
                    };
                    footer.push(button);
                });
            }
        });
    }

    /**
     * 批量编辑表单
     * @param dialog
     */
    private showBatchForm(dialog) {
        const footer = [];
        const checkedItems = [];
        this.dataList.map(item => {
            if (item.checked) {
                checkedItems.push(item);
            }
        });
        if (checkedItems.length > 0) {
            const obj = {
                checkedRow: checkedItems,
                ...this.tempValue
            };
            const modal = this.modalService.create({
                nzTitle: dialog.title,
                nzWidth: dialog.width,
                nzContent: CnFormWindowResolverComponent,
                nzComponentParams: {
                    config: dialog,
                    tempValue: obj,
                    permissions: this.permissions
                },
                nzFooter: footer
            });

            if (dialog.buttons) {
                dialog.buttons.forEach(btn => {
                    const button = {};
                    button['label'] = btn.text;
                    button['type'] = btn.type ? btn.type : 'default';
                    button['onClick'] = componentInstance => {
                        if (btn['name'] === 'batchSave') {
                            componentInstance.buttonAction(
                                btn,
                                () => {
                                    modal.close();
                                    this.sendCascadeMessage();
                                    this.load();
                                }
                            );
                        } else if (btn['name'] === 'close') {
                            modal.close();
                        } else if (btn['name'] === 'reset') {
                            this._resetForm(componentInstance);
                        }
                    };
                    footer.push(button);
                });
            }
        } else {
            this.message.create('warning', '请先选中需要处理的数据');
        }
    }

    /**
     * 根据表单组件routeParams属性配置参数,执行页面跳转
     * @param option 按钮操作配置参数
     */
    private linkToPage(option) {
        const params = CommonTools.parametersResolver({
            params: this.config.routeParams,
            componentValue: this.loadData ? this.loadData : this.value,
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue
        });
        // 判断跳转页面是否为根据跳转跳转不同页面
        if (Array.isArray(option.link)) {
            option.link.forEach(elem => {
                if (this.loadData[elem.field] && (this.loadData[elem.field] === elem.value)) {
                    this.router.navigate([elem.linkName], { queryParams: params });
                }
            });
        } else {
            this.router.navigate([option.link], { queryParams: params });
        }

    }
    // endregion

    public caseLoad() {
        this.cascadeList = {};
        // region: 解析开始
        if (this.config.cascade)
            this.config.cascade.forEach(c => {
                this.cascadeList[c.name] = {}; // 将关系维护到一个对象中
                // region: 解析具体对象开始
                c.CascadeObjects.forEach(cobj => {
                    // 具体对象
                    this.cascadeList[c.name][cobj.cascadeName] = {};

                    const dataType = [];
                    const valueType = [];
                    cobj['cascadeDataItems'].forEach(item => {
                        // 数据关联 （只是单纯的数据关联，内容只有ajax）
                        // cobj.data
                        const dataTypeItem = {};
                        if (item['caseValue']) {
                            // 取值， 解析 正则表达式
                            // item.case.regular; 正则
                            dataTypeItem['regularType'] = item.caseValue.type;
                            dataTypeItem['valueName'] =
                                item.caseValue.valueName;
                            dataTypeItem['regular'] = item.caseValue.regular;
                        }
                        this.cascadeList[c.name][cobj.cascadeName]['type'] =
                            item.data.type;
                        dataTypeItem['type'] = item.data.type;
                        if (item.data.type === 'option') {
                            // 静态数据集
                            this.cascadeList[c.name][cobj.cascadeName][
                                'option'
                            ] = item.data.option_data.option;
                            dataTypeItem['option'] =
                                item.data.option_data.option;
                        }
                        if (item.data.type === 'ajax') {
                            // 异步请求参数取值
                            this.cascadeList[c.name][cobj.cascadeName]['ajax'] =
                                item.data.ajax_data.option;
                            dataTypeItem['ajax'] = item.data.ajax_data.option;
                        }
                        if (item.data.type === 'setValue') {
                            // 组件赋值
                            this.cascadeList[c.name][cobj.cascadeName][
                                'setValue'
                            ] = item.data.setValue_data.option;
                            dataTypeItem['setValue'] =
                                item.data.setValue_data.option;
                        }
                        if (item.data.type === 'show') {
                            // 页面显示控制
                            this.cascadeList[c.name][cobj.cascadeName]['show'] =
                                item.data.show_data.option;
                            dataTypeItem['show'] = item.data.show_data.option;
                        }
                        if (item.data.type === 'relation') {
                            // 消息交互
                            this.cascadeList[c.name][cobj.cascadeName][
                                'relation'
                            ] = item.data.relation_data.option;
                            dataTypeItem['relation'] =
                                item.data.relation_data.option;
                        }

                        dataType.push(dataTypeItem);
                    });

                    cobj['cascadeValueItems'].forEach(item => {
                        const valueTypeItem = {};
                        if (item.caseValue) {
                            // 取值， 解析 正则表达式
                            // item.case.regular; 正则
                            valueTypeItem['regularType'] = item.caseValue.type;
                            valueTypeItem['valueName'] =
                                item.caseValue.valueName;
                            valueTypeItem['regular'] = item.caseValue.regular;
                        }
                        this.cascadeList[c.name][cobj.cascadeName]['type'] =
                            item.data.type;
                        valueTypeItem['type'] = item.data.type;
                        if (item.data.type === 'option') {
                            // 静态数据集
                            this.cascadeList[c.name][cobj.cascadeName][
                                'option'
                            ] = item.data.option_data.option;
                            valueTypeItem['option'] =
                                item.data.option_data.option;
                        }
                        if (item.data.type === 'ajax') {
                            // 异步请求参数取值
                            this.cascadeList[c.name][cobj.cascadeName]['ajax'] =
                                item.data.ajax_data.option;
                            valueTypeItem['ajax'] = item.data.ajax_data.option;
                        }
                        if (item.data.type === 'setValue') {
                            // 组件赋值
                            this.cascadeList[c.name][cobj.cascadeName][
                                'setValue'
                            ] = item.data.setValue_data.option;
                            valueTypeItem['setValue'] =
                                item.data.setValue_data.option;
                        }
                        if (item.data.type === 'show') {
                            // 页面显示控制
                            this.cascadeList[c.name][cobj.cascadeName]['show'] =
                                item.data.show_data.option;
                            valueTypeItem['show'] = item.data.show_data.option;
                        }
                        if (item.data.type === 'relation') {
                            // 消息交互
                            this.cascadeList[c.name][cobj.cascadeName][
                                'relation'
                            ] = item.data.relation_data.option;
                            valueTypeItem['relation'] =
                                item.data.relation_data.option;
                        }
                        if (item.data.type === 'link') {
                            // 跳转交互 20190522 liu
                            this.cascadeList[c.name][cobj.cascadeName][
                                'link'
                            ] = item.data.link_data.option;
                            valueTypeItem['link'] =
                                item.data.link_data.option;
                        }
                        if (item.data.type === 'message') {
                            // 异步消息提醒 20190604 liu
                            this.cascadeList[c.name][cobj.cascadeName][
                                'message'
                            ] = item.data.message_data.option;
                            valueTypeItem['message'] =
                                item.data.message_data.option;
                        }
                        valueType.push(valueTypeItem);
                    });

                    this.cascadeList[c.name][cobj.cascadeName][
                        'dataType'
                    ] = dataType;
                    this.cascadeList[c.name][cobj.cascadeName][
                        'valueType'
                    ] = valueType;
                });
                // endregion: 解析对象结束
            });
        // endregion： 解析结束
    }

    public valueChange(data?) {
        // console.log('当前表单数据：', data);
        // 第一步，知道是谁发出的级联消息（包含信息： field、json、组件类别（类别决定取值））
        // { name: this.config.name, value: name }
        const sendCasade = data.name;
        const receiveCasade = ' ';

        // 第二步，根据配置，和返回值，来构建应答数据集合
        // 第三步，
        if (this.cascadeList[sendCasade]) {
            // 判断当前组件是否有级联

            // const items = formItem.controls.filter(({ type }) => {
            //   return type !== 'button' && type !== 'submit';
            // });

            const changeConfig_new = [];

            for (const key in this.cascadeList[sendCasade]) {
                // console.log('for in 配置' , key);
                this.config.forms.forEach(formsItems => {
                    formsItems.controls.forEach(control => {
                        if (control.name === key) {
                            if (this.cascadeList[sendCasade][key]['dataType']) {
                                this.cascadeList[sendCasade][key][
                                    'dataType'
                                ].forEach(caseItem => {
                                    // region: 解析开始 根据组件类型组装新的配置【静态option组装】
                                    if (caseItem['type'] === 'option') {
                                        // 在做判断前，看看值是否存在，如果在，更新，值不存在，则创建新值
                                        let Exist = false;
                                        changeConfig_new.forEach(config_new => {
                                            if (
                                                config_new.name === control.name
                                            ) {
                                                Exist = true;
                                                config_new['options'] =
                                                    caseItem['option'];
                                            }
                                        });
                                        if (!Exist) {
                                            control.options =
                                                caseItem['option'];
                                            control = JSON.parse(
                                                JSON.stringify(control)
                                            );
                                            changeConfig_new.push(control);
                                        }
                                    }
                                    if (caseItem['type'] === 'ajax') {
                                        // 需要将参数值解析回去，？当前变量，其他组件值，则只能从form 表单取值。
                                        // 解析参数

                                        const cascadeValue = {};
                                        caseItem['ajax'].forEach(ajaxItem => {
                                            if (ajaxItem['type'] === 'value') {
                                                cascadeValue[ajaxItem['name']] =
                                                    ajaxItem['value'];
                                            }
                                            if (
                                                ajaxItem['type'] ===
                                                'selectValue'
                                            ) {
                                                // 选中行数据[这个是单值]
                                                cascadeValue[ajaxItem['name']] =
                                                    data['value'];
                                            }
                                            if (
                                                ajaxItem['type'] ===
                                                'selectObjectValue'
                                            ) {
                                                // 选中行对象数据
                                                if (data.dataItem) {
                                                    cascadeValue[
                                                        ajaxItem['name']
                                                    ] =
                                                        data.dataItem[
                                                        ajaxItem[
                                                        'valueName'
                                                        ]
                                                        ];
                                                }
                                            }
                                            // 其他取值【日后扩展部分】
                                        });
                                        let Exist = false;
                                        changeConfig_new.forEach(config_new => {
                                            if (
                                                config_new.name === control.name
                                            ) {
                                                Exist = true;
                                                config_new[
                                                    'cascadeValue'
                                                ] = cascadeValue;
                                            }
                                        });
                                        if (!Exist) {
                                            control[
                                                'cascadeValue'
                                            ] = cascadeValue;
                                            control = JSON.parse(
                                                JSON.stringify(control)
                                            );
                                            changeConfig_new.push(control);
                                        }
                                    }
                                    if (caseItem['type'] === 'setValue') {
                                        // console.log('setValueinput' , caseItem['setValue'] );

                                        const setValuedata = {};
                                        if (
                                            caseItem['setValue']['type'] ===
                                            'value'
                                        ) {
                                            // 静态数据
                                            setValuedata['data'] =
                                                caseItem['setValue']['value'];
                                        }
                                        if (
                                            caseItem['setValue']['type'] ===
                                            'selectValue'
                                        ) {
                                            // 选中行数据[这个是单值]
                                            setValuedata['data'] =
                                                data[
                                                caseItem['setValue'][
                                                'valueName'
                                                ]
                                                ];
                                        }
                                        if (
                                            caseItem['setValue']['type'] ===
                                            'selectObjectValue'
                                        ) {
                                            // 选中行对象数据
                                            if (data.dataItem) {
                                                setValuedata['data'] =
                                                    data.dataItem[
                                                    caseItem['setValue'][
                                                    'valueName'
                                                    ]
                                                    ];
                                            }
                                        }
                                        // 手动给表单赋值，将值
                                        if (
                                            setValuedata.hasOwnProperty('data')
                                        ) {
                                            this.setValue(
                                                key,
                                                setValuedata['data']
                                            );
                                        }
                                    }

                                    // endregion  解析结束
                                });
                            }
                            if (
                                this.cascadeList[sendCasade][key]['valueType']
                            ) {
                                this.cascadeList[sendCasade][key][
                                    'valueType'
                                ].forEach(caseItem => {
                                    // region: 解析开始  正则表达
                                    const reg1 = new RegExp(caseItem.regular);
                                    let regularData;
                                    if (caseItem.regularType) {
                                        if (
                                            caseItem.regularType ===
                                            'selectObjectValue'
                                        ) {
                                            if (data['dataItem']) {
                                                regularData =
                                                    data['dataItem'][
                                                    caseItem['valueName']
                                                    ];
                                            } else {
                                                regularData = data.data;
                                            }
                                        } else {
                                            regularData = data.data;
                                        }
                                    } else {
                                        regularData = data.data;
                                    }
                                    const regularflag = reg1.test(regularData);
                                    // console.log("正则结果：", caseItem, regularData, regularflag);
                                    // endregion  解析结束 正则表达
                                    if (regularflag) {
                                        // region: 解析开始 根据组件类型组装新的配置【静态option组装】
                                        if (caseItem['type'] === 'option') {
                                            let Exist = false;
                                            changeConfig_new.forEach(
                                                config_new => {
                                                    if (
                                                        config_new.name ===
                                                        control.name
                                                    ) {
                                                        Exist = true;
                                                        config_new['options'] =
                                                            caseItem['option'];
                                                    }
                                                }
                                            );
                                            if (!Exist) {
                                                control.options =
                                                    caseItem['option'];
                                                control = JSON.parse(
                                                    JSON.stringify(control)
                                                );
                                                changeConfig_new.push(control);
                                            }
                                        }
                                        if (caseItem['type'] === 'ajax') {
                                            // 需要将参数值解析回去，？当前变量，其他组件值，则只能从form 表单取值。
                                            const cascadeValue = {};
                                            caseItem['ajax'].forEach(
                                                ajaxItem => {
                                                    if (
                                                        ajaxItem['type'] ===
                                                        'value'
                                                    ) {
                                                        cascadeValue[
                                                            ajaxItem['name']
                                                        ] = ajaxItem['value'];
                                                    }
                                                    if (
                                                        ajaxItem['type'] ===
                                                        'selectValue'
                                                    ) {
                                                        // 选中行数据[这个是单值]
                                                        cascadeValue[
                                                            ajaxItem['name']
                                                        ] = data['value'];
                                                    }
                                                    if (
                                                        ajaxItem['type'] ===
                                                        'selectObjectValue'
                                                    ) {
                                                        // 选中行对象数据
                                                        if (data.dataItem) {
                                                            cascadeValue[
                                                                ajaxItem['name']
                                                            ] =
                                                                data.dataItem[
                                                                ajaxItem[
                                                                'valueName'
                                                                ]
                                                                ];
                                                        }
                                                    }
                                                    // 其他取值【日后扩展部分】
                                                }
                                            );
                                            let Exist = false;
                                            changeConfig_new.forEach(
                                                config_new => {
                                                    if (
                                                        config_new.name ===
                                                        control.name
                                                    ) {
                                                        Exist = true;
                                                        config_new[
                                                            'cascadeValue'
                                                        ] = cascadeValue;
                                                    }
                                                }
                                            );
                                            if (!Exist) {
                                                control[
                                                    'cascadeValue'
                                                ] = cascadeValue;
                                                control = JSON.parse(
                                                    JSON.stringify(control)
                                                );
                                                changeConfig_new.push(control);
                                            }
                                        }
                                        if (caseItem['type'] === 'show') {
                                            if (caseItem['show']) {
                                                //
                                                control['hidden'] =
                                                    caseItem['show']['hidden'];
                                            }
                                        }
                                        if (caseItem['type'] === 'setValue') {
                                            // console.log('setValueinput' , caseItem['setValue'] );

                                            const setValuedata = {};
                                            if (
                                                caseItem['setValue']['type'] ===
                                                'value'
                                            ) {
                                                // 静态数据
                                                setValuedata['data'] =
                                                    caseItem['setValue'][
                                                    'value'
                                                    ];
                                            }
                                            if (
                                                caseItem['setValue']['type'] ===
                                                'selectValue'
                                            ) {
                                                // 选中行数据[这个是单值]
                                                setValuedata['data'] =
                                                    data[
                                                    caseItem['setValue'][
                                                    'valueName'
                                                    ]
                                                    ];
                                            }
                                            if (
                                                caseItem['setValue']['type'] ===
                                                'selectObjectValue'
                                            ) {
                                                // 选中行对象数据
                                                if (data.dataItem) {
                                                    setValuedata['data'] =
                                                        data.dataItem[
                                                        caseItem[
                                                        'setValue'
                                                        ]['valueName']
                                                        ];
                                                }
                                            }
                                            // 手动给表单赋值，将值
                                            if (
                                                setValuedata.hasOwnProperty(
                                                    'data'
                                                )
                                            ) {
                                                this.setValue(
                                                    key,
                                                    setValuedata['data']
                                                );
                                            }
                                        }
                                        if (caseItem['type'] === 'link') {
                                          //  console.log('扫码跳转：', caseItem['link']);
                                            if (caseItem['link']) {
                                                this.linkToPages(caseItem['link'], data['dataItem'] ? data['dataItem'] : {});
                                            }
                                        }
                                        if (caseItem['type'] === 'message') {
                                           // console.log('返回信息：', caseItem['message']);
                                            if (caseItem['message']) {
                                                this.showMessage(caseItem['message'], data['dataItem'] ? data['dataItem'] : {});
                                            }
                                        }
                                        if (caseItem['type'] === 'relation') {
                                           // console.log('消息信息：', caseItem['relation']);
                                            if (caseItem['relation']) {
                                                this.valueChangeRelation(caseItem['relation'], data['dataItem'] ? data['dataItem'] : {}, data);
                                            }
                                        }
                                    }
                                    // endregion  解析结束
                                });
                            }
                        }
                    });
                });
            }

            this.changeConfig = JSON.parse(JSON.stringify(changeConfig_new));
            changeConfig_new.forEach(changeConfig => {
                setTimeout(() => {
                    this.change_config[changeConfig.name] = changeConfig;
                });

            })


            //  console.log('*****变更后配置******',  this.change_config);
        }

        // console.log('变更后的', this.config.forms);
        // console.log('form: ', this.config.viewId, data, this.form.value);
        // // 此处有消息级联的则发值
        // // 级联值= 表单数据+当前触发级联的值组合；
        // const sendData = this.value;
        // sendData[data.name] = data.value;
        // this.cascade.next(
        //     new BsnComponentMessage(
        //         BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILD,
        //         this.config.viewId,
        //         {
        //             data: sendData
        //         }
        //     )
        // );
        // console.log('send', sendData);
        const sendData = this.value;
        sendData[data.name] = data.value;

        if (this.config.cascadeRelation) {
            this.config.cascadeRelation.forEach(element => {
                if (element.name === data.name) {
                    if (element.cascadeField) {
                        element.cascadeField.forEach(feild => {
                            if (!feild['type']) {
                                if (data[feild.valueName]) {
                                    sendData[feild.name] =
                                        data[feild.valueName];
                                }
                            } else {
                                if (feild['type'] === 'selectObject') {
                                    if (data[feild.valueName]) {
                                        sendData[feild.name] =
                                            data[feild.valueName];
                                    }
                                } else if (
                                    feild['type'] === 'tempValueObject'
                                ) {
                                    sendData[feild.name] = this.tempValue;
                                } else if (feild['type'] === 'tempValue') {
                                    if (this.tempValue[feild.valueName]) {
                                        sendData[feild.name] = this.tempValue[
                                            feild.valueName
                                        ];
                                    }
                                } else if (
                                    feild['type'] === 'initValueObject'
                                ) {
                                    sendData[feild.name] = this.initValue;
                                } else if (feild['type'] === 'initValue') {
                                    if (this.initValue[feild.valueName]) {
                                        sendData[feild.name] = this.initValue[
                                            feild.valueName
                                        ];
                                    }
                                } else if (feild['type'] === 'value') {
                                    sendData[feild.name] = feild.value;
                                }
                            }
                        });
                    }
                    this.cascade.next(
                        new BsnComponentMessage(
                            BSN_COMPONENT_CASCADE_MODES[element.cascadeMode],
                            this.config.viewId,
                            {
                                data: sendData
                            }
                        )
                    );
                }
            });
        }

        this.ExecEventByValueChange(data);
    }


    /**
     * 执行值变化触发的事件 liu 20190115
     * @param data
     */
    public ExecEventByValueChange(data?) {
        const ss = {
            events: [  // 行事件、列事件
                {
                    // 首先 判断 onTrigger 什么类别触发，其次 ，看当前是新增、修改， 最后 执行onEvent
                    name: '', // 名称唯一，为日后扩充权限做准备
                    onTrigger: 'onColumnValueChange',  // 什么条件触发  例如：oncolumnValueChange   onSelectedRow  on CheckedRow
                    type: 'EditableSave',  // 需要区分 新增 修改
                    actiontype: 'add、update', // 不满足条件的 均可
                    onEvent: [
                        {
                            type: 'field',
                            field: 'code',
                            action: '',
                            execEvent: [  // 【预留目前不实现】 当前字段的 执行事件，如果 没有 conditions 则执行action
                                {
                                    conditions: [
                                        // 描述 ：【】 之间 或者or {} 之间 并且 and 条件
                                        [
                                            {
                                                name: 'enabled',
                                                value: '[0-1]',
                                                checkType: 'regexp'  //  'value'  'regexp' 'tempValue' 'initValue'  'cacheValue'
                                            }
                                        ]
                                    ],
                                    action: '', // action 就是 toolbar 里配置的执行操作配置
                                }
                            ]

                        },
                        {
                            type: 'default',
                            action: '', // 方法名称
                        }
                    ]
                }
            ]
        }
        const vc_field = data.name;
        //  ts_saveEdit data.key
        const vc_rowdata = this.GetComponentValue();
        this.form.value['currentValue'] = vc_rowdata[data.name];
        this.form.value['currentValue'] = data.name;
        // vc_rowdata['currentValue'] = vc_rowdata[data.name];
        // vc_rowdata['currentName'] = data.name;

        console.log('当前表单数据：', vc_rowdata);
        // 判断是否存在配置
        if (this.config.events) {
            const index = this.config.events.findIndex(item => item['onTrigger'] === 'onColumnValueChange');
            let c_eventConfig = {};
            if (index > -1) {
                c_eventConfig = this.config.events[index];
            } else {
                return true;
            }
            let isField = true; // 列变化触发
            // 首先适配类别、字段，不满足的时候 看是否存在default 若存在 取default
            c_eventConfig['onEvent'].forEach(eventConfig => {
                // 指定具体feild的操作
                if (eventConfig.type === 'field') {
                    if (eventConfig.field === vc_field) {
                        isField = false;
                        // 调用 执行方法，方法
                        this.ExecRowEvent(eventConfig.action);
                        return true;
                    }
                }
            });
            if (isField) {
                c_eventConfig['onEvent'].forEach(eventConfig => {
                    // 无配置 的默认项
                    if (eventConfig.type === 'default') {
                        this.ExecRowEvent(eventConfig.action);
                    }
                });
            }
        }
    }

    //  获取event 事件的配置
    public GetToolbarEvents() {
        if (this.config.toolbarEvent && Array.isArray(this.config.toolbarEvent)) {
            this.config.toolbarEvent.forEach(item => {
                if (item.group) {
                    item.group.forEach(g => {
                        this.toolbarConfig.push(g);
                    });


                } else if (item.dropdown) {
                    const dropdown = [];
                    item.dropdown.forEach(b => {
                        const down = {};
                        const { name, text, icon } = b;
                        down['name'] = name;
                        down['text'] = text;
                        down['icon'] = icon;
                        down['buttons'] = [];
                        b.buttons.forEach(btn => {
                            this.toolbarConfig.push(btn);
                        });
                    });

                }
            });
        }


    }

    /**
     * ce
     */
    public ExecRowEvent(enentname) {
        console.log(enentname, this.toolbarConfig);
        let updateState;
        const index = this.toolbarConfig.findIndex(
            item => item['name'] === enentname
        );
        if (index > -1) {
            updateState = this.toolbarConfig[index];
        }
        const option = updateState;
        this.beforeOperation.operationItemData = this.value;

        if (!this.beforeOperation.beforeItemDataOperation(option)) {
            switch (updateState.action) {
                case BSN_COMPONENT_MODES.REFRESH:
                    this.load();
                    break;
                case BSN_COMPONENT_MODES.CREATE:
                    this.formState = BSN_FORM_STATUS.CREATE;
                    this.resetForm();
                    break;
                case BSN_COMPONENT_MODES.EDIT:
                    this.load();
                    this.formState = BSN_FORM_STATUS.EDIT;
                    break;
                case BSN_COMPONENT_MODES.CANCEL:
                    this.load();
                    this.formState = BSN_FORM_STATUS.TEXT;
                    break;
                case BSN_COMPONENT_MODES.SAVE:
                    if (option.ajaxConfig) {
                        this.saveForm_2(option.ajaxConfig);
                    } else {
                        this.message.info('未配置任何操作!');
                    }
                    break;
                case BSN_COMPONENT_MODES.DELETE:
                    if (option.ajaxConfig) {
                        this.modalService.confirm({
                            nzTitle: '确认删除当前数据？',
                            nzContent: '',
                            nzOnOk: () => {
                                this.delete(option.ajaxConfig);
                            },
                            nzOnCancel() { }
                        });
                    }
                    break;
                case BSN_COMPONENT_MODES.EXECUTE:
                    if (option.ajaxConfig) {
                        // 根据表单状态进行具体配置操作
                        this.resolveAjaxConfig(
                            option.ajaxConfig,
                            this.formState,
                            () => {
                                // this.load();
                                this.sendCascadeMessage();
                            }
                        );
                    }
                    break;
                case BSN_COMPONENT_MODES.WINDOW:
                    this.windowDialog(option);
                    break;
                case BSN_COMPONENT_MODES.FORM:
                    this.formDialog(option);
                    break;
                case BSN_COMPONENT_MODES.UPLOAD:
                    this.uploadDialog(option);
                    break;
            }
        }


    }

    /**
     * 根据表单组件routeParams属性配置参数,执行页面跳转
     * @param option 按钮操作配置参数
     */
    private linkToPages(option, componentValue?) {
        const params = CommonTools.parametersResolver({
            params: option.routeParams ? option.routeParams : {},
            componentValue: componentValue ? componentValue : {},
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue
        });
        this.router.navigate([option.linkName], { queryParams: params });
    }


    /**
     * 根据表单组件配置参数,执行消息展示

     */
    private showMessage(option, componentValue?) {

       // console.log('showMessage', option, componentValue);
        let messageStr = '';
        if (option.valueName) {
            messageStr = componentValue[option.valueName];
        } else {
            messageStr = option.value ? option.value : '';
        }

        if (option.messageType) {
            if (option.messageType === 'warning') {
                this.message.warning(messageStr);
            }
            if (option.messageType === 'success') {
                this.message.success(messageStr);
            }
            if (option.messageType === 'info') {
                this.message.info(messageStr);
            }

        } else {
            this.message.info(messageStr);
        }


    }

    private valueChangeRelation(option, componentValue?, data?) {

       // console.log('valueChangeRelation', option, componentValue);
        const sendData = this.value;
        sendData[data.name] = data.value;
       const cascadeRelation = option;
        if (cascadeRelation) {
            cascadeRelation.forEach(element => {
                if (element.name === data.name) {
                    if (element.cascadeField) {
                        element.cascadeField.forEach(feild => {
                            if (!feild['type']) {
                                if (data[feild.valueName]) {
                                    sendData[feild.name] =
                                        data[feild.valueName];
                                }
                            } else {
                                if (feild['type'] === 'selectObject') {
                                    if (data[feild.valueName]) {
                                        sendData[feild.name] =
                                            data[feild.valueName];
                                    }
                                } else if (
                                    feild['type'] === 'tempValueObject'
                                ) {
                                    sendData[feild.name] = this.tempValue;
                                } else if (feild['type'] === 'tempValue') {
                                    if (this.tempValue[feild.valueName]) {
                                        sendData[feild.name] = this.tempValue[
                                            feild.valueName
                                        ];
                                    }
                                } else if (
                                    feild['type'] === 'initValueObject'
                                ) {
                                    sendData[feild.name] = this.initValue;
                                } else if (feild['type'] === 'initValue') {
                                    if (this.initValue[feild.valueName]) {
                                        sendData[feild.name] = this.initValue[
                                            feild.valueName
                                        ];
                                    }
                                } else if (feild['type'] === 'value') {
                                    sendData[feild.name] = feild.value;
                                }
                            }
                        });
                    }
                    this.cascade.next(
                        new BsnComponentMessage(
                            BSN_COMPONENT_CASCADE_MODES[element.cascadeMode],
                            this.config.viewId,
                            {
                                data: sendData
                            }
                        )
                    );
                }
            });
        }


    }



    // 【20181126】 针对级联编辑状态目前问题处理
    // 原来的结构不合理，在于变化的检测均是完全修改配置
    // 现在调整为，将级联包装成对象，给小组件，小组件自行完成
    // setValue 由form 层控制（继续使用表单内部的机制）
    // 隐藏，显示 也是由 form 控制（和渲染模板有关）
    // 顺序：ajax、option 》 setvalue
    // 异步参数？表单值



    // 级联变化，情况大致分为三种
    // 1.值变化，其他组件值变化
    // 2.值变化，其他组件启用，禁用；是否显示该字段
    // 3.值变化，其他组件数据集变化
    //  3.1 静态数据集变化
    //  3.2 动态参数变化
    //  3.3 路由+参数
    // 4. 变化的时候，考虑默认值和原来值的问题
    // 5. 特殊的可能日期的时间计算、或者起止时间选择是否合理的判断

    // 目前解决方案，单项传递，每个组件值变化如果有级联关系，
    // 触发级联，将级联结果传递到form，动态修改配置参数

    // 结构定义
    /**
     *  是否级联{
     *     父：ture，
     *     子：false，
     *     自己：false
     * }
     * 级联内容：[
     *   {
     *     级联对象：field，
     *     类型：
     *     数据集：{} 描述级联对象的应答
     *    },
     *
     * ]
     *
     * 解析级联: 将每个列维护起来，值变化的时候动态获取
     * 每个组件实现一个 output 用来传递级联信息。
     *  应答描述；【重点】cascade
     *  主要描述，级联对象，收到级联消息后的反应
     *  特别复杂的处理，不同值-》对应不同应答。 需要一种规则语言。
     *  将添加类别 cascadeValue  创建这个临时变量，动态从中取值，拼接数据
     */
}

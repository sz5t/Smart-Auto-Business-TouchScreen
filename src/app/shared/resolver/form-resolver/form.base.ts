import { TemplateRef, ViewChild } from '@angular/core';
import { BSN_FORM_STATUS } from './../../../core/relative-Service/BsnTableStatus';
import { CnComponentBase } from '@shared/components/cn-component-base';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { CommonTools } from '@core/utility/common-tools';
import { BSN_OUTPOUT_PARAMETER_TYPE } from '@core/relative-Service/BsnTableStatus';
import { NzModalRef } from 'ng-zorro-antd';
import { Template } from '@angular/compiler/src/render3/r3_ast';
export class CnFormBase extends CnComponentBase {

    private _tplModal: NzModalRef;
    public get tplModal(): NzModalRef {
        return this._tplModal;
    }
    public set tplModal(value: NzModalRef) {
        this._tplModal = value;
    }

    private _msgTitle: string;
    public get msgTitle(): string {
        return this._msgTitle;
    }
    public set msgTitle(value: string) {
        this._msgTitle = value;
    }

    private _msgContent: string;
    public get msgContent(): string {
        return this._msgContent;
    }
    public set msgContent(value: string) {
        this._msgContent = value;
    }

    @ViewChild('tplTitle')
    private _tplTitleRef: TemplateRef<any>;
    public get tplTitleRef(): TemplateRef<any> {
        return this._tplTitleRef;
    }
    public set tplTitleRef(value: TemplateRef<any>) {
        this._tplTitleRef = value;
    }


    @ViewChild('tplContent')
    private _tplContentRef: TemplateRef<any>;
    public get tplContentRef(): TemplateRef<any> {
        return this._tplContentRef;
    }
    public set tplContentRef(value: TemplateRef<any>) {
        this._tplContentRef = value;
    }

    @ViewChild('tplFooter')
    private _tplFooterRef: TemplateRef<any>;
    public get tplFooterRef(): TemplateRef<any> {
        return this._tplFooterRef;
    }
    public set tplFooterRef(value: TemplateRef<any>) {
        this._tplFooterRef = value;
    }

    @ViewChild('tplConfirmFooter')
    private _tplConfirmFooterRef: TemplateRef<any>;
    public get tplConfirmFooterRef(): TemplateRef<any> {
        return this._tplConfirmFooterRef;
    }
    public set tplConfirmFooterRef(value: TemplateRef<any>) {
        this._tplConfirmFooterRef = value;
    }

    @ViewChild('tplInnerConfirmFooter')
    private _tplInnerConfirmFooterRef: TemplateRef<any>;
    public get tplInnerConfirmFooterRef(): TemplateRef<any> {
        return this._tplInnerConfirmFooterRef;
    }
    public set tplInnerConfirmFooterRef(value: TemplateRef<any>) {
        this._tplInnerConfirmFooterRef = value;
    }

    private _loadData;
    public get loadData() {
        return this._loadData;
    }
    public set loadData(value) {
        this._loadData = value;
    }
    private _form: FormGroup;
    public get form() {
        return this._form;
    }
    public set form(value) {
        this._form = value;
    }

    private _formBuilder: FormBuilder;
    public get formBuilder(): FormBuilder {
        return this._formBuilder;
    }
    public set formBuilder(value: FormBuilder) {
        this._formBuilder = value;
    }

    private _controls;
    public get controls() {
        return this._controls;
    }
    public set controls(value) {
        this._controls = value;
    }

    private _submit;
    public get submit() {
        return this._submit;
    }
    public set submit(value) {
        this._submit = value;
    }

    private _formConfigControl;
    public get formConfigControl() {
        return this._formConfigControl ? this._formConfigControl : {};
    }
    public set formConfigControl(value) {
        this._formConfigControl = value;
    }

    private _formState;
    public get formState() {
        return this._formState;
    }
    public set formState(value) {
        this._formState = value;
    }

    private confirmExecuteObj: any;

    private innerConfirmExecuteObj: any;

    constructor() {
        super();
    }

    get changes() {
        return this.form.valueChanges;
    }

    get valid() {
        return this.form.valid;
    }

    get value() {
        return this.form.value;
    }

    public resetForm() {
        this.form.reset();
    }

    public createGroup() {
        const group = this.formBuilder.group({});
        this.controls.forEach(control => {
            group.addControl(control.name, this.createControl(control));
        });
        return group;
    }

    public createControl(control) {
        const { disabled, value } = control;
        const validations = this.getValidations(control.validations);
        return this.formBuilder.control({ disabled, value }, validations);
    }

    public getValidations(validations) {
        const validation = [];
        validations &&
            validations.forEach(valid => {
                if (valid.validator === 'required' || valid.validator === 'email') {
                    validation.push(Validators[valid.validator]);
                } else if (
                    valid.validator === 'minLength' ||
                    valid.validator === 'maxLength'
                ) {
                    validation.push(Validators[valid.validator](valid.length));
                } else if (valid.validator === 'pattern') {
                    validation.push(Validators[valid.validator](valid.pattern));
                }
            });
        return validation;
    }

    public getFormControl(name) {
        return this.form.controls[name];
    }

    public submitForm($event) {
        this.submit.emit(this.value);
    }

    public setValue(name: string, value: any) {
        const control = this.form.controls[name];
        if (control) {
            control.setValue(value, { emitEvent: true });
        }
    }

    public setFormValue(data) {
        if (data) {
            for (const d in data) {
                if (data.hasOwnProperty(d)) {
                    if (this.formConfigControl[d]) {
                        if (
                            this.formConfigControl[d]['type'] === 'selectMultiple' ||
                            this.formConfigControl[d]['type'] === 'selectTreeMultiple'
                        ) {
                            let ArrayValue = [];
                            if (data[d]) {
                                if (data[d].length > 0) {
                                    ArrayValue = data[d].split(',');
                                }
                            }
                            this.setValue(d, ArrayValue);
                        } else {
                            this.setValue(d, data[d]);
                        }
                    } else {
                        this.setValue(d, data[d]);
                    }
                }
            }
        }
    }

    public checkFormValidation() {
        if (this.form.invalid) {
            for (const i in this.form.controls) {
                this.form.controls[i].markAsDirty();
                this.form.controls[i].updateValueAndValidity();
            }
            return false;
        }
        return true;
    }

    public initControls(formConfig) {
        const controls = [];
        if (formConfig) {
            formConfig.map(formItem => {
                const items = formItem.controls.filter(({ type }) => {
                    return type !== 'button' && type !== 'submit';
                });
                controls.push(...items);
            });
        }
        return controls;
    }
    // 处理参数 liu
    public GetComponentValue() {
        // liu 表单配置
        // console.log('------', this.formConfigControl);
        const ComponentValue = {};
        // 循环 this.value
        for (const key in this.value) {
            if (this.formConfigControl[key]) {
                if (
                    this.formConfigControl[key]['type'] === 'selectMultiple' ||
                    this.formConfigControl[key]['type'] === 'selectTreeMultiple'
                ) {
                    let ArrayValue = '';
                    // console.log('数组', this.value, key);
                    this.value[key] && this.value[key].forEach(element => {
                        ArrayValue = ArrayValue + element.toString() + ',';
                    });
                    if (ArrayValue.length > 0) {
                        ArrayValue = ArrayValue.slice(0, ArrayValue.length - 1);
                    }
                    ComponentValue[key] = ArrayValue;
                    // console.log('拼接', ArrayValue);
                } else {
                    ComponentValue[key] = this.value[key];
                }
            } else {
                ComponentValue[key] = this.value[key];
            }
        }
        return ComponentValue;
    }

    public buildParameter(parameters) {
        const params = CommonTools.parametersResolver({
            params: parameters,
            item: this.value,
            componentValue: this.GetComponentValue(),
            tempValue: this.tempValue,
            initValue: this.initValue,
            cacheValue: this.cacheValue,
            routerValue: this.cacheValue,
            returnValue: this.returnValue
        });
        return params;
    }

    public buildUrl(urlConfig, urlobj?) {
        let url;
        if (urlobj) {
            const ip = CommonTools.parametersResolver({
                params: urlobj.params,
                tempValue: this.tempValue,
                initValue: this.initValue,
                cacheValue: this.cacheValue,
            });
            url = 'http://' + ip['IP'] + ':' + ip['sort'] + '/' + urlConfig;
        } else {
            if (CommonTools.isString(urlConfig)) {
                url = urlConfig;
            } else {
                const pc = CommonTools.parametersResolver({
                    params: urlConfig.params,
                    tempValue: this.tempValue,
                    initValue: this.initValue,
                    cacheValue: this.cacheValue
                });
                url = `${urlConfig.url['parent']}/${pc}/${urlConfig.url['child']}`;
            }
        }
        return url;
    }

    /**
    *
    * @param outputParams
    * @param response
    * @param callback
    * @returns {Array}
    * @private
    * 1、输出参数的配置中，消息类型的参数只能设置一次
    * 2、值类型的结果可以设置多个
    * 3、表类型的返回结果可以设置多个
    */
    public outputParametersResolver(c, response, ajaxConfig, callback) {
        const result = false;
        if (response.isSuccess) {

            const msg =
                c.outputParams[
                c.outputParams.findIndex(
                    m => m.dataType === BSN_OUTPOUT_PARAMETER_TYPE.MESSAGE
                )
                ];
            const value =
                c.outputParams[
                c.outputParams.findIndex(
                    m => m.dataType === BSN_OUTPOUT_PARAMETER_TYPE.VALUE
                )
                ];
            const table =
                c.outputParams[
                c.outputParams.findIndex(
                    m => m.dataType === BSN_OUTPOUT_PARAMETER_TYPE.TABLE
                )
                ];
            const msgObj = msg
                ? response.data[msg.name].split(':')
                : null;
            const valueObj = response.data ? response.data : {};
            // const tableObj = response.data[table.name] ? response.data[table.name] : [];
            if (msgObj && msgObj.length > 1) {
                const messageType = msgObj[0];
                let options;
                if (this.tplModal) {
                    this.destoryTplModal();
                }
                this.returnValue = valueObj;
                switch (messageType) {
                    case 'info':
                        options = {
                            nzTitle: '信息提示',
                            nzWidth: '350px',
                            nzContent: msgObj[1]
                        };
                        // this.baseModal[messageType](options);
                        this.createMessageTemplateModal2('info', '提示', msgObj[1]);
                        break;
                    case 'error':
                        options = {
                            nzTitle: '错误提示',
                            nzWidth: '350px',
                            nzContent: msgObj[1]
                        };
                        // this.baseModal[messageType](options);
                        this.createMessageTemplateModal2('error', '提示', msgObj[1]);
                        break;
                    case 'confirm':
                        this.msgTitle = '确认提示';
                        this.msgContent = msgObj[1];

                        const opts = {
                            nzTitle: this.tplTitleRef,
                            nzContent: this.tplContentRef,
                            nzFooter: this.tplInnerConfirmFooterRef
                        };

                        this.innerConfirmExecuteObj = {};
                        const childrenConfig = ajaxConfig.filter(
                            f => f.parentName && f.parentName === c.name
                        );

                        this.innerConfirmExecuteObj['c'] = childrenConfig[0];
                        this.innerConfirmExecuteObj['ajaxConfig'] = ajaxConfig,
                            this.innerConfirmExecuteObj['callback'] = callback;

                        // options = {
                        //     nzTitle: '提示',
                        //     nzContent: msgObj[1],
                        //     nzOnOk: () => {
                        //         // 是否继续后续操作，根据返回状态结果
                        //         const childrenConfig = ajaxConfig.filter(
                        //             f => f.parentName && f.parentName === c.name
                        //         );
                        //         //  目前紧支持一次执行一个分之步骤
                        //         this.getAjaxConfig(childrenConfig[0], ajaxConfig, callback);
                        //         // childrenConfig &&
                        //         //     childrenConfig.map(currentAjax => {
                        //         //         this.getAjaxConfig(
                        //         //             currentAjax,
                        //         //             ajaxConfig,
                        //         //             callback
                        //         //         );
                        //         //     });
                        //     },
                        //     nzOnCancel: () => { }
                        // };
                        // this.baseModal[messageType](options);
                        this.destoryTplModal();
                        this.createConfirmTemplateModal(opts);
                        break;
                    case 'warning':
                        options = {
                            nzTitle: '提示',
                            nzWidth: '350px',
                            nzContent: msgObj[1]
                        };
                        // this.baseModal[messageType](options);
                        this.createMessageTemplateModal2('warning', '警告提示', msgObj[1]);
                        break;
                    case 'success':
                        options = {
                            nzTitle: '',
                            nzWidth: '350px',
                            nzContent: msgObj[1]
                        };
                        // this.baseMessage.success(msgObj[1]);
                        if (this.tplModal) {
                            this.destoryTplModal();
                        }
                        this.createMessageTemplateModal2('success', '成功提示', msgObj[1]);
                        if (!this.returnValue) {
                            callback && callback();
                        }
                        break;
                }

                // if(options) {
                //     this.modalService[messageType](options);
                //
                //     // 如果成功则执行回调
                //     if(messageType === 'success') {
                //         callback && callback();
                //     }
                // }
            }
            // else {
            //     this.baseMessage.error(
            //         '存储过程返回结果异常：未获得输出的消息内容'
            //     );
            // }
            if (this.returnValue) {
                const childrenConfig = ajaxConfig.filter(
                    f => f.parentName && f.parentName === c.name
                );
                if (Array.isArray(childrenConfig) && childrenConfig.length > 0) {
                    //  目前紧支持一次执行一个分之步骤
                    this.getAjaxConfig(childrenConfig[0], ajaxConfig, callback);
                } else {
                    callback(this.returnValue);
                }
            }

        } else {

            // this.baseMessage.error('操作异常：', response.message);
            this.createMessageTemplateModal2('error', '操作异常', response.message);
        }
    }

    public executeInnerConfirmDialogOK() {

    }

    /**
     * 数据访问返回消息处理
     * @param result
     * @param message
     * @param callback
     */
    public showAjaxMessage(result, message?, callback?) {
        const rs: { success: boolean; msg: string[] } = {
            success: true,
            msg: []
        };
        let suc = false;
        if (result && Array.isArray(result)) {
            result.forEach(res => {
                rs['success'] = rs['success'] && res.isSuccess;
                if (!res.isSuccess) {
                    rs.msg.push(res.message);
                }
            });
            if (rs.success) {
                // this.baseMessage.success(message);
                this.createMessageTemplateModal2('success', '消息提示', message);

                suc = true;
            } else {
                // this.baseMessage.error(rs.msg.join('<br/>'));
                this.createMessageTemplateModal2('error', '错误提示', rs.msg.join('<br/>'));
            }
        } else {
            if (result.isSuccess) {
                // this.baseMessage.success(message);
                this.createMessageTemplateModal2('success', '消息提示', message);
                suc = true;
            } else {
                // this.baseMessage.error(result.message);
                this.createMessageTemplateModal2('error', '错误提示', result.message);
            }
        }
        if (suc && callback) {
            callback();
        }
        if (this.tplModal) {
            this.tplModal.destroy();
        }
    }

    public execute(url, method, body?) {
        return this.apiResource[method](url, body).toPromise();
    }


    public getAjaxConfig(c, ajaxConfigs, callback?) {
        if (c) {
            const url = this.buildUrl(c.url);
            const params = this.buildParameter(c.params);
            if (c.message) {
                this.confirmExecuteObj = {};
                this.confirmExecuteObj['url'] = url;
                this.confirmExecuteObj['c'] = c;
                this.confirmExecuteObj['params'] = params;
                this.confirmExecuteObj['ajaxConfigs'] = ajaxConfigs;
                callback && (this.confirmExecuteObj['callback'] = callback);
                this.msgTitle = '提示';
                this.msgContent = c.message // c.message;
                const confirmObj = {
                    nzTitle: this.tplTitleRef,
                    nzContent: this.tplContentRef,
                    nzFooter: this.tplConfirmFooterRef
                }
                this.createConfirmTemplateModal(confirmObj);
                // }
                // if (c.message) {
                //     this.baseModal.confirm({
                //         nzTitle: c.title ? c.title : '提示',
                //         nzContent: c.message ? c.message : '',
                //         nzOnOk: () => {
                //             (async () => {
                //                 const response = await this.execute(url, c.ajaxType, params);
                //                 // 处理输出参数
                //                 if (c.outputParams) {
                //                     this.outputParametersResolver(
                //                         c,
                //                         response,
                //                         ajaxConfigs,
                //                         () => {
                //                             if (callback) {
                //                                 callback();
                //                             }
                //                         }
                //                     );
                //                 } else {
                //                     // 没有输出参数，进行默认处理
                //                     this.showAjaxMessage(
                //                         response,
                //                         '操作成功',
                //                         () => {
                //                             if (callback) {
                //                                 callback();
                //                             }
                //                         }
                //                     );
                //                 }
                //             })();
                //         },
                //         nzOnCancel() { }
                //     });
            } else {
                (async () => {
                    const response = await this.execute(url, c.ajaxType, params);
                    // 处理输出参数
                    if (c.outputParams) {
                        this.outputParametersResolver(
                            c,
                            response,
                            ajaxConfigs,
                            (returnValue) => {
                                if (callback) {
                                    callback(returnValue);
                                }
                            }
                        );
                    } else {
                        // 没有输出参数，进行默认处理
                        this.showAjaxMessage(response, '操作成功', (returnValue) => {
                            if (callback) {
                                callback(returnValue);
                            }
                        });
                    }
                })();
            }
        }
    }

    public resolveAjaxConfig(ajaxConfig, formState, callback?) {
        let enterAjaxConfig;
        enterAjaxConfig = ajaxConfig.filter(item => !item.parent);
        if (Array.isArray(enterAjaxConfig) && enterAjaxConfig[0]) {
            this.getAjaxConfig(enterAjaxConfig[0], ajaxConfig, callback);
        }
        // if (formState === BSN_FORM_STATUS.TEXT) {
        //     enterAjaxConfig = ajaxConfig.filter(item => !item.parent && item.ajaxType === 'delete');

        // } else {
        //     enterAjaxConfig = ajaxConfig.filter(item => !item.parent && item.ajaxType === formState);
        // }
        // if (Array.isArray(enterAjaxConfig) && enterAjaxConfig[0]) {
        //     this.getAjaxConfig(enterAjaxConfig[0], ajaxConfig, callback);
        // } else {
        //     let msg = '';
        //     switch (formState) {
        //         case 'text':
        //         msg = '预览状态下无法执行此操作!'
        //         break;
        //         case 'post':
        //         msg = '';
        //         break;
        //         case 'put': 
        //         break;   
        //     }
        //     this.baseMessage.warning('配置异常,无法执行请求!');
        // }
    }

    public confirmDialogOK() {
        (async () => {
            const url = this.confirmExecuteObj.url;
            const c = this.confirmExecuteObj.c;
            const params = this.confirmExecuteObj.params;
            const ajaxConfigs = this.confirmExecuteObj.ajaxConfigs;

            const response = await this.execute(url, c.ajaxType, params);
            // 处理输出参数
            if (c.outputParams) {
                this.outputParametersResolver(
                    c,
                    response,
                    ajaxConfigs,
                    (returnValue) => {
                        if (this.confirmExecuteObj.callback) {
                            this.confirmExecuteObj.callback(returnValue);
                        }
                    }
                );
            } else {
                // 没有输出参数，进行默认处理
                this.showAjaxMessage(
                    response,
                    '操作成功',
                    (returnValue) => {
                        if (this.confirmExecuteObj.callback) {
                            this.confirmExecuteObj.callback(returnValue);
                        }
                    }
                );
            }
        })();
    }

    public innerConfirmDialogOK() {
        if (this.innerConfirmExecuteObj) {
            this.getAjaxConfig(
                this.innerConfirmExecuteObj.c,
                this.innerConfirmExecuteObj.ajaxConfig,
                this.innerConfirmExecuteObj.callback
            );
        }
    }

    public createConfirmTemplateModal(confirmObj) {
        this.tplModal = this.baseModal.create(confirmObj);
    }

    public createMessageTemplateModal2(type, title, content) {
        this.msgContent = content;
        this.msgTitle = title;
        this.tplModal = this.baseModal.create({
            nzTitle: this.tplTitleRef,
            nzContent: this.tplContentRef,
            nzFooter: this.tplFooterRef,
            nzMaskClosable: true,
            nzClosable: false
        });
    }

    public destoryTplModal() {
        this.tplModal.destroy();
    }

}

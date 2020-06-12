import {
    Component,
    OnInit,
    Input,
    AfterViewInit,
    Output,
    EventEmitter,
    OnChanges
} from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { ApiService } from '@core/utility/api-service';
import { APIResource } from '@core/utility/api-resource';
import { FormGroup } from '@angular/forms';
import { CacheService } from '@delon/cache';

@Component({
    selector: 'cn-form-select',
    templateUrl: './cn-form-select.component.html'
})
export class CnFormSelectComponent implements OnInit, AfterViewInit, OnChanges {
    @Input()
    config;
    @Input()
    value;
    @Input()
    bsnData;
    @Input()
    rowData;
    @Input()
    dataSet;
    @Input()
    initValue;
    @Input()
    changeConfig;
    formGroup: FormGroup;
    // @Output() updateValue = new EventEmitter();
    @Output()
    updateValue = new EventEmitter();
    _options = [];
    cascadeValue = {};
    resultData;
    cacheValue;
    // _selectedMultipleOption:any[];
    constructor(
        private apiService: ApiService,
        private cacheService: CacheService) { 
        this.cacheValue = this.cacheService;
    }
    _selectedOption;

    ngOnInit() {
        if (!this.config['multiple']) {
            this.config['multiple'] = 'default';
        }
        if (this.config['cascadeValue']) {
            // cascadeValue
            for (const key in this.config['cascadeValue']) {
                if (this.config['cascadeValue'].hasOwnProperty(key)) {
                    this.cascadeValue[key] = this.config['cascadeValue'][key];
                }
            }
        }
        // console.log('select加载固定数据', this.config);
        if (this.changeConfig) {
            if (this.changeConfig['cascadeValue']) {
                // cascadeValue
                for (const key in this.changeConfig['cascadeValue']) {
                    if (this.changeConfig['cascadeValue'].hasOwnProperty(key)) {
                        this.cascadeValue[key] = this.changeConfig['cascadeValue'][key];
                    }
                }
            }
        }

        // console.log('select_cascadeValue', this.cascadeValue);
        this._options.length = 0;
        if (this.dataSet) {
            // 加载数据集
            this._options = this.dataSet;
            this.selectedByLoaded();
        } else if (this.config.ajaxConfig) {
            // 异步加载options
            this.load();
        } else {
            // 加载固定数据
            this._options = this.config.options;
            this.selectedByLoaded();
        }
    }

    async load() {
        const result = await this.asyncLoadOptions(
            this.config.ajaxConfig,
            this.formGroup.value
        );
        // console.log('select_result', result);
        this.resultData = result;
        if (this.config.valueType && this.config.valueType === 'list') {
            const labels = this.config.labelName.split('.');
            const values = this.config.valueName.split('.');
            result.data && result.data.length > 0 && result.data.forEach(d => {
                d[this.config.valueName].forEach(v => {
                    this._options.push({
                        label: v.ParameterName,
                        value: v.ParameterName
                    });
                });
            });
        } else {
            result.data && result.data.length > 0 && result.data.forEach(d => {
                this._options.push({
                    label: d[this.config.labelName],
                    value: d[this.config.valueName]
                });
            });
        }

        // console.log('select89:', this.config.name, this._options);
        this.selectedByLoaded();
    }

    ngOnChanges() {
         console.log('select加载固定数据ngOnChanges', this.changeConfig);
        // console.log('变化时临时参数' , this.bsnData);
    }
    ngAfterViewInit() { }

    async asyncLoadOptions(p?, componentValue?, type?) {
        // console.log('select load 异步加载', componentValue); // liu
        const params = {};
        let tag = true;
        let url;
        if (p) {
            p.params.forEach(param => {
                if (param.type === 'tempValue') {
                    if (type) {
                        if (type === 'load') {
                            if (this.bsnData[param.valueName]) {
                                params[param.name] = this.bsnData[
                                    param.valueName
                                ];
                            } else {
                                // console.log('参数不全不能加载');
                                tag = false;
                                return;
                            }
                        } else {
                            params[param.name] = this.bsnData[param.valueName];
                        }
                    } else {
                        if (this.bsnData && this.bsnData[param.valueName]) {
                            // liu 参数非空判断
                            params[param.name] = this.bsnData[param.valueName];
                        }
                    }
                } else if (param.type === 'value') {
                    params[param.name] = param.value;
                } else if (param.type === 'componentValue') {
                    params[param.name] = componentValue[param.valueName];
                } else if (param.type === 'cascadeValue') {
                    params[param.name] = this.cascadeValue[param.valueName];
                } else if (param.type === 'initValue') {
                    params[param.name] = this.initValue[param.valueName];
                } else if (param.type === 'cacheValue') {
                    params[param.name] = this.cacheValue.getNone('userInfo')[param.valueName];
                }
            });
            if (this.isString(p.url)) {
                url = p.url;
            } else {
                let pc = 'null';
                p.url.params.forEach(param => {
                    if (param['type'] === 'value') {
                        pc = param.value;
                    } else if (param.type === 'componentValue') {
                        pc = componentValue[param.valueName];
                    } else if (param.type === 'tempValue') {
                        pc = this.bsnData[param.valueName];
                    }
                });

                url = p.url['parent'] + '/' + pc + '/' + p.url['child'];
            }
        }
        if (p.ajaxType === 'get' && tag) {
            /*  const dd=await this._http.getProj(APIResource[p.url], params).toPromise();
       if (dd && dd.Status === 200) {
       console.log("服务器返回执行成功返回",dd.Data);
       }
       console.log("服务器返回",dd); */

            return this.apiService.get(url, params).toPromise();
        }
        // else if (p.ajaxType === 'put') {
        //   console.log('put参数', params);
        //   return this.apiService.putProj(url, params).toPromise();
        // } else if (p.ajaxType === 'post') {
        //   console.log('post参数', params);
        //   console.log(url);
        //   return this.apiService.postProj(url, params).toPromise();
        // } else {
        //   return null;
        // }
    }

    selectedByLoaded() {
        let selected;
        if (!this.value) {
            this.value = this.config.defaultValue;
        }
        if (this.value) {
            this._options.forEach(element => {
                if (element.value === this.value) {
                    selected = element;
                }
            });
        } else {
            this._options.forEach(element => {
                if (element.value === this.config.defaultValue) {
                    selected = element;
                }
            });
        }

        this._selectedOption = selected;
    }

    async valueChange(name?) {
        // if (name) {
        //   const backValue = { name: this.config.name, value: name };
        //   this.updateValue.emit(backValue);
        // } else {
        //   const backValue = { name: this.config.name, value: name };
        //   this.updateValue.emit(backValue);
        // }
        if (name || name === 0) {
            const backValue = { name: this.config.name, value: name };
            if (this.resultData) {
                // console.log('221', this.resultData, name);
                const index = this.resultData.data.findIndex(
                    item => item[this.config['valueName']] === name
                );
                this.resultData.data &&
                    (backValue['dataItem'] = this.resultData.data[index]);
            } else {
                if (this.config.ajaxConfig) {
                    const result = await this.asyncLoadOptions(
                        this.config.ajaxConfig,
                        this.formGroup.value
                    );
                   // console.log('229', result, name);
                    const index = result.data.findIndex(
                        item => item[this.config['valueName']] === name
                    );
                    if (index > -1) {
                        result.data &&
                            (backValue['dataItem'] = result.data[index]);
                    }
                }

            }
            this.updateValue.emit(backValue);
        } else {
            const backValue = { name: this.config.name, value: name };
            this.updateValue.emit(backValue);
        }
    }

    isString(obj) {
        // 判断对象是否是字符串
        return Object.prototype.toString.call(obj) === '[object String]';
    }
}

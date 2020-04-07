import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    AfterViewInit,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { ApiService } from '@core/utility/api-service';
import { APIResource } from '@core/utility/api-resource';
import { CacheService } from '@delon/cache';

@Component({
    selector: 'cn-grid-select',
    templateUrl: './cn-grid-select.component.html'
})
export class CnGridSelectComponent implements OnInit, AfterViewInit, OnChanges {
    @Input()
    public config;
    @Input()
    public value;
    @Input()
    public initData;
    @Input()
    public bsnData;
    @Input()
    public rowData;
    @Input()
    public dataSet;
    @Input()
    public casadeData;
    @Output()
    public updateValue = new EventEmitter();
    public _options = [];
    public _selectedOption;
    public resultData;
    public cascadeValue = {};
    public cascadeSetValue = {};
    public cacheValue;
    // _selectedMultipleOption:any[];
    constructor(
        private apiService: ApiService,
        private cacheService: CacheService) { 
        this.cacheValue = this.cacheService;
    }

    public async ngOnInit() {
        // console.log('变化时临时参数', this.casadeData);
        // console.log('变化配置', this.config);
        // console.log('下拉选中的本来值: ** ', this.value);
        if (this.casadeData) {
            for (const key in this.casadeData) {
                // 临时变量的整理
                if (key === 'cascadeValue') {
                    for (const casekey in this.casadeData['cascadeValue']) {
                        if (
                            this.casadeData['cascadeValue'].hasOwnProperty(
                                casekey
                            )
                        ) {
                            this.cascadeValue[casekey] = this.casadeData[
                                'cascadeValue'
                            ][casekey];
                        }
                    }
                } else if (key === 'options') {
                    // 目前版本，静态数据集 优先级低
                    this.config.options = this.casadeData['options'];
                } else if (key === 'setValue') {
                    this.cascadeSetValue['setValue'] = JSON.parse(
                        JSON.stringify(this.casadeData['setValue'])
                    );
                    delete this.casadeData['setValue'];
                }
            }
        }

        if (this.dataSet) {
            // 加载数据集
            this._options = this.dataSet;
        } else if (this.config.ajaxConfig) {
            // 异步加载options
            this.resultData = await this.asyncLoadOptions(
                this.config.ajaxConfig
            );
            if (this.config.valueType && this.config.valueType === 'list') {
                const labels = this.config.labelName.split('.');
                const values = this.config.valueName.split('.');
                this.resultData.data.forEach(d => {
                    d[this.config.valueName].forEach(v => {
                        this._options.push({
                            label: v.ParameterName,
                            value: v.ParameterName
                        });
                    });
                });
            } else {
                if (this.resultData) {
                    this.resultData.data.forEach(d => {
                        this._options.push({
                            label: d[this.config.labelName],
                            value: d[this.config.valueName]
                        });
                    });
                } else {
                    this._options = [];
                }
            }
        } else {
            // 加载固定数据
            this._options = this.config.options;
        }
        if (this.cascadeSetValue.hasOwnProperty('setValue')) {
            this.selectedBycascade();
        } else {
            this.selectedByLoaded();
        }
    }

    public ngAfterViewInit() { }
    // casadeData
    public ngOnChanges() {
        // console.log('select加载固定数据ngOnChanges', this.config);
        // console.log('select变化时临时参数ngOnChanges', this.casadeData);
    }
    public async asyncLoadOptions(p?, componentValue?, type?) {
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
                } else if (param.type === 'cacheValue') {
                    params[param.name] = this.cacheValue.getNone('userInfo')[param.valueName];
                } else if (param.type === 'initValue') {
                    params[param.name] = this.initData[param.valueName];
                } else if (param.type === 'cascadeValue') {
                    if (this.cascadeValue[param.valueName]) {
                        params[param.name] = this.cascadeValue[param.valueName];
                    } else {
                        // console.log('参数不全不能加载');
                        tag = false;
                        return null;
                    }
                    // params[param.name] = this.cascadeValue[param.valueName];
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
                    } else if (param.type === 'cascadeValue') {
                        pc = this.cascadeValue[param.valueName];
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
        } else if (p.ajaxType === 'put') {
            // console.log('put参数', params);
            return this.apiService.put(url, params).toPromise();
        } else if (p.ajaxType === 'post') {
            // console.log('post参数', params);
            return this.apiService.post(url, params).toPromise();
        } else {
            return null;
        }
    }
    // 级联赋值
    public selectedBycascade() {
        let selected;
        this._options.forEach(element => {
            if (element.value === this.cascadeSetValue['setValue']) {
                selected = element;
                delete this.cascadeSetValue['setValue'];
            }
        });

        this._selectedOption = selected;
        this.valueChange(this._selectedOption);
    }
    public selectedByLoaded() {
        let selected;
        if (this.value && this.value['data'] !== undefined || this.value['data'] === 0) {
            this._options.forEach(element => {
                if (element.value === this.value.data) {
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
        // console.log('值不为空触发', this._selectedOption);
        if (this._selectedOption) {
            this.valueChange(this._selectedOption);
        }
    }

    public valueChange(name?) {
        // 使用当前rowData['Id'] 作为当前编辑行的唯一标识
        // 所有接收数据的组件都已自己当前行为标识进行数据及联
        // console.log('select value:',name);
        // dataItem
        if (name) {
            this.value.data = name.value;
            // 将当前下拉列表查询的所有数据传递到bsnTable组件，bsnTable处理如何及联
            if (this.resultData) {
                // valueName
                const index = this.resultData.data.findIndex(
                    item => item[this.config['valueName']] === name.value
                );
                this.resultData.data &&
                    (this.value['dataItem'] = this.resultData.data[index]);
            }
            this.updateValue.emit(this.value);
        } else {
            this.value.data = null;
            this.updateValue.emit(this.value);
        }
    }

    public isString(obj) {
        // 判断对象是否是字符串
        return Object.prototype.toString.call(obj) === '[object String]';
    }
}

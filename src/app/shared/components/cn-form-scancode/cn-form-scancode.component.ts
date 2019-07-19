import {
    Component,
    OnInit,
    Inject,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import {
    BSN_COMPONENT_MODES,
    BsnComponentMessage,
    BSN_COMPONENT_CASCADE,
    BSN_COMPONENT_CASCADE_MODES
} from '@core/relative-Service/BsnTableStatus';
import { Observable, Observer } from 'rxjs';
import { ApiService } from '@core/utility/api-service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'cn-form-scancode,[cn-form-scancode]',
    templateUrl: './cn-form-scancode.component.html',
    styleUrls: ['./cn-form-scancode.component.css']
})
export class CnFormScancodeComponent implements OnInit, AfterViewInit {
    @Input()
    public config;
    @Input()
    value;
    @Input()
    public bsnData;
    @Input()
    public rowData;
    @Input()
    public dataSet;
    @Input() public initValue;
    public formGroup: FormGroup;
    // @Output() updateValue = new EventEmitter();
    @Output()
    public updateValue = new EventEmitter();
    @ViewChild('scanInput') public scanInput: ElementRef<any>;


    public _options = [];
    public cascadeValue = {};
    public resultData;
    public _value;
    public isScan = true;
    public oldvalue = null;
    public isload = true;
    constructor(
        @Inject(BSN_COMPONENT_MODES)
        private stateEvents: Observable<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascade: Observer<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascadeEvents: Observable<BsnComponentMessage>,
        private apiService: ApiService
    ) { }

    public ngOnInit() {

    }
    public ngAfterViewInit() {

        this.scanInput.nativeElement.focus();
        this.scanInput.nativeElement.select();
    }


    public async onKeyPress(e) {
        // console.log('onKeyPress', e);
        if (e.code === 'Enter') {
            this.isScan = false;
            this.oldvalue = this._value;
            // console.log("huiche", this._value);
            let resultData;
            let resultCard = {};
            const cardresult = await this.asyncLoad(
                this.config.cardConfig ? this.config.cardConfig : null
            )
            const result = await this.asyncLoad(
                this.config.ajaxConfig ? this.config.ajaxConfig : null
            );
            if (this.config.cardConfig) {
                for (let i = 0; i < cardresult.data.length; i++) {
                    resultCard['field' + i] = cardresult.data[i];
                }
            }
            if (this.config.ajaxConfig) {
                if (this.config.ajaxConfig.ajaxType === 'proc') {
                    const backData = result.data.dataSet1 ? result.data.dataSet1 : [];
                    //  console.log('backData:', backData);
                    if (backData.length > 0) {
                        const _data = { data: backData[0] };
                        //  resultData['data'] = backData[0];
                        resultData = _data;
                        resultData['resultCard'] = resultCard;
                    }

                } else {
                    resultData = result;
                    resultData['resultCard'] = resultCard;
                }
            } else {
                resultData = result;
                resultData['resultCard'] = resultCard;
            }

            // this.cascade.next(
            //   new BsnComponentMessage(
            //     BSN_COMPONENT_CASCADE_MODES.Scan_Code_ROW,
            //     'Scan_Code_ROW',
            //     {
            //       data: { ScanCode: this._value, ScanCodeObject: result.data }
            //     }
            //   )
            // );
            this.valueChange(this._value, resultData);
            // this.cascade.next(
            //   new BsnComponentMessage(
            //     BSN_COMPONENT_CASCADE_MODES.Scan_Code_Locate_ROW,
            //     'Scan_Code_ROW',
            //     {
            //       data: { ScanCode: this._value, ScanCodeObject: result.data }
            //     }
            //   )
            // );
        } else {
            if (!this.isScan) {
                const newvalue = this._value;
                this._value = newvalue.substring(
                    this.oldvalue.length ? this.oldvalue.length : 0
                );
                this.isScan = true;
            }
        }
    }

    public async asyncLoad(p?, componentValue?, type?) {
        // console.log('asyncLoad--->initValue', this.initValue);
        if (!p) {
            return [];
        }
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
                } else if (param.type === 'scanCodeValue') {
                    params[param.name] = this._value;
                } else if (param.type === 'cascadeValue') {
                    params[param.name] = this.cascadeValue[param.valueName];
                } else if (param.type === 'initValue') {
                    params[param.name] = this.initValue[param.valueName];
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
                    } else if (param.type === 'scanCodeValue') {
                        pc = this._value;
                    } else if (param.type === 'initValue') {
                        pc = this.initValue[param.valueName];
                    }
                });

                url = p.url['parent'] + '/' + pc + '/' + p.url['child'];
            }
        }
        if (p.ajaxType === 'get' && tag) {
            return this.apiService.get(url, params).toPromise();
        }
        if (p.ajaxType === 'proc' && tag) {
            return this.apiService.post(url, params).toPromise();
        }

    }

    public isString(obj) {
        // 判断对象是否是字符串
        return Object.prototype.toString.call(obj) === '[object String]';
    }

    public valueChange(name?, dataItem?) {
        // console.log("valueChange", name);
        const backValue = { name: this.config.name, value: name };
        if (dataItem) {
            backValue['dataItem'] = dataItem.data;
            backValue['cardValue'] = dataItem.resultCard;
        }
        this.updateValue.emit(backValue);
    }


    /**
     * initLoadValue 加载初值
     */
    public async initLoadValue(v) {
        if (v && this.config.initLoadValue) {
            if (this.isload) {
                this.isload = false;
                this.isScan = false;
                this.oldvalue = this._value;
                let resultData;
                let resultCard = {};
                const cardresult = await this.asyncLoad(
                    this.config.cardConfig ? this.config.cardConfig : null
                )
                const result = await this.asyncLoad(
                    this.config.ajaxConfig ? this.config.ajaxConfig : null
                );
                if (this.config.cardConfig) {
                    for (let i = 0; i < cardresult.data.length; i++) {
                        resultCard['field' + i] = cardresult.data[i];
                    }
                }
                if (this.config.ajaxConfig) {
                    if (this.config.ajaxConfig.ajaxType === 'proc') {
                        const backData = result.data.dataSet1 ? result.data.dataSet1 : [];
                        //  console.log('backData:', backData);
                        if (backData.length > 0) {
                            const _data = { data: backData[0] };
                            //  resultData['data'] = backData[0];
                            resultData = _data;
                            resultData['resultCard'] = resultCard;
                        }

                    } else {
                        resultData = result;
                        resultData['resultCard'] = resultCard;
                    }
                } else {
                    resultData = result;
                    resultData['resultCard'] = resultCard;
                }
                this.valueChange(this._value, resultData);
            }
        }
    }



}

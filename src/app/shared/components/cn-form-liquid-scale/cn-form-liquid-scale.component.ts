import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ApiService } from '@core/utility/api-service';
import { CommonTools } from '@core/utility/common-tools';
import { CacheService } from '@delon/cache';
@Component({
  selector: 'cn-form-liquid-scale',
  templateUrl: './cn-form-liquid-scale.component.html',
  styles: [
    `
    .anticon-close-circle {
      cursor: pointer;
      color: #ccc;
      transition: color 0.3s;
      font-size: 12px;
    }

    .anticon-close-circle:hover {
      color: #999;
    }

    .anticon-close-circle:active {
      color: #666;
    }

    i {
      cursor: pointer;
    }

    .ant-input-affix-wrapper .ant-input-suffix {
      right:0px;
    }

    `
  ]
})
export class CnFormLiquidScaleComponent implements OnInit {
  @Input() public config;
  @Input() public formGroup: FormGroup;

  @Input() public value;
  @Input() public bsnData;
  @Input() public rowData;
  @Input() public dataSet;
  @Output()
  public updateValue = new EventEmitter();
  public selectoptions = [];
  public select;
  public model;

  private ajaxConfig = {
    url: 'http://localhost:2070/GetLiquidData.ashx',
    ajaxType: 'get',
    params: [
      {
        'name': 'keyId',
        'type': 'value',
        'value': '0F22C411-BF66-4E2E-A8FB-10D1C3A1CA9E'
      }
    ]
  }
  constructor(private apiService: ApiService,
    private cacheService: CacheService,
  ) { }

  public ngOnInit() {
  }

  public async getValue() {
    const url = this._buildURL(this.config.ajaxConfig.url);
    const params = {
      ...this._buildParameters(this.config.ajaxConfig.params)
    }
    const loadData = await this._load(url, params);
    if(loadData) {
      debugger;
      this.model = loadData['ACQUISITIONDATA'];
      this.valueChange();
    }
  }


  public assemblyValue() {
    this.valueChange(this.model);
  }

  public onKeyPress(e?, type?) {
    if (e.code === 'Enter') {
      //  console.log('Enter', type, 'beginValue', this.beginValue, 'endValue', this.endValue);
      this.assemblyValue();
    }
  }

  public onblur(e?, type?) {
    // console.log('onblur：', type, 'beginValue', this.beginValue, 'endValue', this.endValue);
    if (this.config.showButton) {
      return;
    }
    this.assemblyValue();

  }

  public submit(e?, type?) {
    // console.log('onblur：', type, 'beginValue', this.beginValue, 'endValue', this.endValue);
    this.assemblyValue();

  }

  public valueChange(name?) {
    console.log('valueChange', name);
    const backValue = { name: this.config.name, value: name };
    this.updateValue.emit(backValue);
  }

  private async _load(url, params) {
    return this.apiService.get(url, params).toPromise();
  }

  private _buildURL(ajaxUrl) {
    return ajaxUrl;
  }

  private _buildParameters(paramsConfig) {
    let params = {};
    if (paramsConfig) {
      params = CommonTools.parametersResolver({
        params: paramsConfig,
        cacheValue: this.cacheService,
        tempValue: this.bsnData
      });
    }
    return params;
  }

}

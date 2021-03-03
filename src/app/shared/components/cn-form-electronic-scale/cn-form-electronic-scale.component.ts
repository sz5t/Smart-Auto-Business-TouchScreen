import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ApiService } from '@core/utility/api-service';
import { CommonTools } from '@core/utility/common-tools';
import { CacheService } from '@delon/cache';

@Component({
  selector: 'cn-form-electronic-scale',
  templateUrl: './cn-form-electronic-scale.component.html',
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
export class CnFormElectronicScaleComponent implements OnInit {
  @Input() public config;
  @Input() public formGroup: FormGroup;

  @Input() public value;
  @Input() public bsnData;
  @Input() public initValue;
  @Input() public rowData;
  @Input() public dataSet;
  @Output()
  public updateValue = new EventEmitter();
  public selectoptions = [];
  public select;
  public model;
  public isEQUIPMENT = false;
  constructor(private apiService: ApiService,
    private cacheService: CacheService,
  ) { }

  public async ngOnInit() {
    if (!this.config['disabled']) {
      this.config['disabled'] = false;
    }
    if (!this.config['readonly']) {
      this.config['readonly'] = false;
    }
    const ajaxConfig = {
      url: 'common/getEquipment',
      ajaxType: 'get',
      params: [
        {
          'name': 'typeCode',
          'type': 'value',
          'value': this.config['Equipment']
        },
        {
          'name': 'clientIp',
          'type': 'cacheValue',
          'valueName': 'loginIp'
        }
      ]
    }

    this.selectoptions = await this.load(ajaxConfig);
    this.select = this.selectoptions[0].value;
  }

  public valueChange(name?) {
    console.log('valueChange', name);
    const backValue = { name: this.config.name, value: name };
    this.updateValue.emit(backValue);
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

  // 组装值
  public assemblyValue() {
    this.valueChange(this.model);
  }

  public showModal() {
    const that = this;

    if (this.isEQUIPMENT) {
      let wsconfig;
      this.selectoptions.forEach(element => {
        if (element['value'] === this.select) {
          wsconfig = element['wsconfig'];
        }
      });
      // const wsconfig = this.config.wsconfig ? this.config.wsconfig : 'ws://127.0.0.1:8086/ElectronicScale';
      console.log(wsconfig);
      const ws = new WebSocket(wsconfig);
      ws.onopen = function () {
        // Web Socket 已连接上，使用 send() 方法发送数据
        // 连接服务端socket
        ws.send('');
        console.log('数据发送中...');
      };

      ws.onmessage = function (evt) {
        const received_msg = evt.data;
        console.log(evt.data);
        console.log('数据已接收...' + received_msg + '---');
        that.model = received_msg;
        that.assemblyValue();

      };
      ws.onclose = function () {
        // 关闭 websocket
        console.log('连接已关闭...');
      };
    }

  }



  public isString(obj) {
    // 判断对象是否是字符串
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  public async load(ajaxConfig) {
    let m = [{ name: '未找到设备', value: '0' }];
    if (this.config['filterParam']) {
      ajaxConfig.params = [...ajaxConfig.params, ...this.config.filterParam];
    }
    const url = this._buildURL(ajaxConfig.url);
    const params = {
      ...this._buildParameters(ajaxConfig.params)
    };
    const loadData = await this._load(url, params);
    if (loadData && loadData.status === 200 && loadData.isSuccess) {
      if (loadData.data.length > 0) {
        loadData.data.forEach(element => {
          element['value'] = element['Id'];
          element['name'] = element['name'];
          element['wsconfig'] = 'ws://' + element['webSocketIp'] + ':' + element['webSocketPort'] + '/' + element['connEntry'];
        });
        m = loadData.data;
        this.isEQUIPMENT = true;
      }
    }
    return m;
  }
  private async _load(url, params) {
    return this.apiService.get(url, params).toPromise();
  }
  private _buildURL(ajaxUrl) {
    let url = '';
    if (ajaxUrl && this.isString(ajaxUrl)) {
      url = ajaxUrl;
    } else if (ajaxUrl) {
    }
    return url;
  }
  private _buildParameters(paramsConfig) {
    let params = {};
    if (paramsConfig) {
      params = CommonTools.parametersResolver({
        params: paramsConfig,
        cacheValue: this.cacheService,
        tempValue: this.bsnData,
        initValue: this.initValue
      });
    }
    return params;
  }

}

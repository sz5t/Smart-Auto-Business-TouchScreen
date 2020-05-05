import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '@core/utility/api-service';
import { CacheService } from '@delon/cache';
import { NzNotificationService, NzModalService } from 'ng-zorro-antd';
import { RelativeService } from '@core/relative-Service/relative-service';
import { BSN_COMPONENT_MODES, BsnComponentMessage, BSN_COMPONENT_CASCADE } from '@core/relative-Service/BsnTableStatus';
import { Observable, Observer } from 'rxjs';
import { Router } from '@angular/router';
import { MenuService } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { CnFormBase } from '@shared/resolver/form-resolver/form.base';
import { text } from '@angular/core/src/render3';
import { CommonTools } from '@core/utility/common-tools';

@Component({
  selector: 'bsn-cetac-test-x15',
  templateUrl: './bsn-cetac-test-x15.component.html',
  styleUrls: ['./bsn-cetac-test-x15.component.less']
})
export class BsnCETACTESTX15Component extends CnFormBase implements  OnInit {
  @Input() 
  public config: any;

  // @Input()
  // public tempData: any;

  @Input()
  public initData: any;

  // public formGroup: FormGroup;

  public equipmentData;

  public loading = false;

    
  constructor(
    private builder: FormBuilder,
    private apiService: ApiService,
    private cacheService: CacheService,
    private message: NzNotificationService,
    private modalService: NzModalService,
    private _messageService: RelativeService,
    @Inject(BSN_COMPONENT_MODES)
    private stateEvents: Observable<BsnComponentMessage>,
    @Inject(BSN_COMPONENT_CASCADE)
    private cascade: Observer<BsnComponentMessage>,
    @Inject(BSN_COMPONENT_CASCADE)
    private cascadeEvents: Observable<BsnComponentMessage>,
    private router: Router,
    private menuService: MenuService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) { 
    super();
    this.formBuilder = this.builder;
        this.baseMessage = this.message;
        this.baseModal = this.modalService;
        this.apiResource = this.apiService;
        this.cacheValue = this.cacheService;
  }

  public ngOnInit() {

    // if (this.initData) {
    //   this.initValue = this.initData;
    // }
    // if (this.initData) {
    //   this.tempValue = this.initData;
    // }

    this.initValue = this.initData ? this.initData : {};
    this.cacheValue = this.cacheService ? this.cacheService : {};
    this.form = this.createFormGroup();
    this.loadCEATEData();
    this.beginConnectionSocket();
    
  }


  private loadCEATEData() {
    if (this.tempValue[this.config.keyId]) {
      this.form.get('Id').setValue(this.tempValue[this.config.keyId]);
      this.form.get('singleCode').setValue(this.tempValue['singlecode']);
    }
  }

  private beginConnectionSocket() {
    const ajaxConfig = {
      url: 'common/getEquipment',
      ajaxType: 'get',
      params: [
        {
          'name': 'typeCode',
          'type': 'value',
          'value': 'CETATEST'
        },
        {
          'name': 'clientIp',
          'type': 'cacheValue',
          'valueName': 'loginIp'
        }
      ]
    };
    this.form.get('connStatus').setValue('设备连接中...');
    this.loadEquipment(ajaxConfig);
  }

  private async loadEquipment(ajaxConfig) {
    const url = this._buildURL(ajaxConfig.url);
    const params = {
      ...this._buildParameters(ajaxConfig.params)
    }

    const loadData = await this._load(url, params);
    if (loadData && loadData.status === 200 && loadData.isSuccess) {
      if (loadData.data.length > 0) {
        const data = loadData.data[0];
        console.log('CEATETEST CONFIG=========>', data);
        const wsconfig = 'ws://' + data['webSocketIp'] + ':' + data['webSocketPort'] + '/' + data['connEntry'];
        
        try {
          const ws = new WebSocket(wsconfig);
          this.connectEquipment(ws);
        } catch (e) {
            console.log(e);
        }
        
        
        
      }
    }
  }

  private connectEquipment(ws) {
    const that = this;
    ws.onopen = function() {
      that.form.get('connStatus').setValue('设备连接成功，等待检测结果');
      ws.send('begin');
      that.loading = true;
    }
    ws.onmessage = function(evt) {
      console.log(evt.data);
      const eqmData = JSON.parse(evt.data);
      console.log(eqmData);
      if(evt.data) {
        that.form.get('result').setValue(eqmData.Result);
        that.form.get('testMode').setValue(eqmData.TestMode);
        that.form.get('fillPress').setValue(eqmData.Fill);
        that.form.get('stablePress').setValue(eqmData.Stabilisation);
        that.form.get('testData').setValue(eqmData.MeasurementResult);
        that.form.get('vent').setValue(eqmData.VentPressure);
        that.form.get('connStatus').setValue('检测完成');
      }

      that.loading = false;
      
    }

    ws.onclose = function () {
      that.form.get('connStatus').setValue('设备连接断开');
    }

  }

  private setFormValueByEquipmentData(data) {
    // const value = {
    //   Id: this.tempValue[this.config.keyId],

    //   result: data.Result,
    //   testMode: data.TestMode,
    //   fillPress: data.Fill,
    //   stablePress: data.Stabilisation,
    //   testData: data.MeasurementResult,
    //   var: data.VentPressure
    // }
    // this.form.get('Id').setValue();
    
  }

  private _buildURL(ajaxUrl) {
    let url = '';
    if (ajaxUrl && this.isString(ajaxUrl)) {
      url = ajaxUrl;
    } else if (ajaxUrl) {
    }
    return url;
  }

  private async _load(url, params) {
    return this.apiService.get(url, params).toPromise();
  }

  private _buildParameters(paramsConfig) {
    let params = {};
    if (paramsConfig) {
      params = CommonTools.parametersResolver({
        params: paramsConfig,
        cacheValue: this.cacheService,
        tempValue: this.tempValue
      });
    }
    return params;
  }

  public isString(obj) {
    // 判断对象是否是字符串
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  public createFormGroup(): FormGroup {
    const group = this.formBuilder.group({});

    // controlSize: "8"
    // disabled: false
    // inputType: "text"
    // label: "产品扫码"
    // labelSize: "16"
    // layout: "column"
    // name: "remark1"
    // placeholder: ""
    // readonly: false
    // size: "default"
    // span: "24"
    // type: "scanCode"

    group.addControl('Id', this.createFormControl({name: 'Id'}));
    group.addControl('singleCode', this.createFormControl({name: 'singleCode'}));
    group.addControl('result', this.createFormControl({name: 'result'}));
    group.addControl('connStatus', this.createFormControl({name: 'connStatus'}));
    group.addControl('fillPress', this.createFormControl({name: 'fill'}));
    group.addControl('stablePress', this.createFormControl({name: 'stablePress'}));
    group.addControl('testData', this.createFormControl({name: 'testData'}));
    group.addControl('testMode', this.createFormControl({name: 'testMode'}));
    group.addControl('vent', this.createFormControl({name: 'vent'}));
    group.addControl('stableTime', this.createFormControl({name: 'stableTime'}));
    group.addControl('testTime', this.createFormControl({name: 'testTime'}));

    return group;
  }

  public createFormControl(control) {
    const {disabled, value} = control;
    const validations = this.getValidations(control.validations);
    return this.formBuilder.control({disabled, value}, validations);
  }

  public buttonAction(btn, callback?) {
    if (this.checkFormValidation()) {
        // 1、支持原生API资源调用
        // 2、支持SQL存储过程和返回结果后续操作
        if (btn.ajaxConfig) {
            this.resolveAjaxConfig(btn.ajaxConfig, this.formState, callback);
        } else {
            this.baseMessage.warning('未配置任何数据操作');
        }
    }
}

}

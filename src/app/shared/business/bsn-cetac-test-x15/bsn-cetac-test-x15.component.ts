import { Component, OnInit, Input, Inject, OnDestroy } from '@angular/core';
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
export class BsnCETACTESTX15Component extends CnFormBase implements  OnInit, OnDestroy {
  @Input() 
  public config: any;

  // @Input()
  // public tempData: any;

  @Input()
  public initData: any;

  // public formGroup: FormGroup;

  public equipmentData;

  public loading = false;

  public wsconfig: any;

  private equipmentParams: any;
  private result: any;
    
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

  public ngOnDestroy () {
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
    this.form.get('connStatus').setValue('设备连接中...，请稍后');
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
        this.wsconfig = 'ws://' + data['webSocketIp'] + ':' + data['webSocketPort'] + '/' + data['connEntry'];
        
        try {
          
          this.changeProgram();
          // this.connectEquipment(this.ws);
        } catch (e) {
            console.log(e);
        }
      }
    }
  }

  public getProgramParams() {
    const ws = new WebSocket(this.wsconfig);
    const that = this;
    ws.onopen = function() {
      that.loading = true;
      // send command
      const cmd = {CommandName: 'GET_PARAMS', CommandContent: '0D 01 09 01', IsReturnData: true};
      ws.send(JSON.stringify(cmd));
    }
    ws.onmessage = function(evt) {
      const msg = evt.data;
      const params = JSON.parse(msg);
      if (params) {
        that.form.get('TestTime').setValue(params.TestTime);
        that.form.get('Fill').setValue(params.Fill);
        that.form.get('FillTime').setValue(params.FillTime);
        that.form.get('FillUpper').setValue(params.FillUpper);
        that.form.get('FillLower').setValue(params.FillLower);
        that.form.get('Stabilisation').setValue(params.Stabilisation);
        that.form.get('VentTime').setValue(params.VentTime);
        that.form.get('Delay').setValue(params.Delay);
      }
      console.log('参数======>', params)
      ws.close();
      that.loading = false;
      // 
      that.startTest();
    }
    ws.onclose = function() {
      console.log('参数接受 socket 关闭');
      that.loading = false;

    }
    ws.onerror = function(evt) {
      that.form.get('connStatus').setValue('连接异常,请重试...');
      that.loading = false;
      console.log(evt);
    }
  }

  private changeProgram() {
    const that = this;
    const ws = new WebSocket(this.wsconfig);
    ws.onopen = function () {
      that.form.get('connStatus').setValue('准备检测程序...，请稍后');
      console.log('send change program command');
      // 发送程序跳转命令
      const cmd = {CommandName: 'CHANGE_PROGRAM', CommandContent: '0D 02 08 01 FF', IsReturnData: true};
      ws.send(JSON.stringify(cmd));
      that.loading = true;
    }

    ws.onmessage = function(evt) {
      const msg = evt.data;
      console.log('change program ======>', msg);
      that.form.get('connStatus').setValue('检测程序完成');
      ws.close();
      that.loading = false;
    }

    ws.onclose = function() {
      console.log('程序转换 socket 关闭');
      that.loading = false;
    }

    ws.onerror = function (evt) {
      that.form.get('connStatus').setValue('连接异常,请重试...');
      that.loading = false;
      console.log(evt);
    }
    
  }

  public startTest() {
    const ws = new WebSocket(this.wsconfig);
    const that = this;
    ws.onopen = function() {
      that.form.get('connStatus').setValue('检测中...，请稍后');
      const cmd = {CommandName: 'START', CommandContent: '0D 00 05', IsReturnData: true};
      ws.send(JSON.stringify(cmd));
      that.loading = true;
    }
    ws.onmessage = function(evt) {
      console.log(evt.data);
      const eqmData = JSON.parse(evt.data);
      if (eqmData) {
        that.form.get('TestMode').setValue(eqmData.TestMode);
        that.form.get('ResultStabilisation').setValue(eqmData.ResultStabilisation);
        that.form.get('ResultVent').setValue(eqmData.ResultVent);
        that.form.get('ResultMeasurement').setValue(eqmData.ResultMeasurement);
        that.form.get('TestResult').setValue(eqmData.TestResult);
      }
      console.log(eqmData);
      // if(evt.data) {
      //   that.form.get('result').setValue(eqmData.Result);
      //   that.form.get('testMode').setValue(eqmData.TestMode);
      //   that.form.get('fillPress').setValue(eqmData.Fill);
      //   that.form.get('stablePress').setValue(eqmData.Stabilisation);
      //   that.form.get('testData').setValue(eqmData.MeasurementResult);
      //   that.form.get('vent').setValue(eqmData.VentPressure);
      //   that.form.get('connStatus').setValue('检测完成');
      // }
      ws.close();
      that.loading = false;
      
    }
    ws.onclose = function () {
      that.form.get('connStatus').setValue('设备连接断开');
      that.loading = false;
    }
    ws.onerror = function(evt) {
      that.form.get('connStatus').setValue('连接异常,请重试...');
      that.loading = false;
      console.log(evt);
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
    group.addControl('connStatus', this.createFormControl({name: 'connStatus'}));

    group.addControl('Delay', this.createFormControl({name: 'Delay'}));
    group.addControl('TestMode', this.createFormControl({name: 'TestMode'}));
    group.addControl('Fill', this.createFormControl({name: 'Fill'}));
    group.addControl('FillTime', this.createFormControl({name: 'FillTime'}));
    group.addControl('FillUpper', this.createFormControl({name: 'FillUpper'}));
    group.addControl('FillLower', this.createFormControl({name: 'FillLower'}));
    group.addControl('ResultStabilisation', this.createFormControl({name: 'ResultStabilisation'}));
    group.addControl('Stabilisation', this.createFormControl({name: 'Stabilisation'}));
    group.addControl('ResultVent', this.createFormControl({name: 'ResultVent'}));
    group.addControl('VentTime', this.createFormControl({name: 'VentTime'}));
    group.addControl('ResultMeasurement', this.createFormControl({name: 'ResultMeasurement'}));
    group.addControl('TestTime', this.createFormControl({name: 'TestTime'}));
    group.addControl('TestResult', this.createFormControl({name: 'TestResult'}));

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

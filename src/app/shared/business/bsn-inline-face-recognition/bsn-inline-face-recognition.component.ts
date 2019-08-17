import { Component, OnInit, AfterViewInit, OnDestroy, Optional, Inject, Input } from '@angular/core';
import { SocialService, DA_SERVICE_TOKEN, TokenService, ITokenModel } from '@delon/auth';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CacheService } from '@delon/cache';
import { ApiService } from '@core/utility/api-service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SettingsService, TitleService, MenuService } from '@delon/theme';
import { ReuseTabService } from '@delon/abc';
import { SystemResource } from '@core/utility/system-resource';
import { CommonTools } from '@core/utility/common-tools';
import { CnComponentBase } from '@shared/components/cn-component-base';
import { BSN_COMPONENT_CASCADE, BsnComponentMessage, BSN_COMPONENT_CASCADE_MODES } from '@core/relative-Service/BsnTableStatus';
import { Observer } from 'rxjs';

@Component({
  selector: 'bsn-inline-face-recognition',
  templateUrl: './bsn-inline-face-recognition.component.html',
  styleUrls: ['./bsn-inline-face-recognition.component.less']
})
export class BsnInlineFaceRecognitionComponent extends CnComponentBase
  implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public config;
  @Input()
  public initData;
  @Input()
  public dialog;
  @Input()
  public permissions;
  // public _cardNo = {};
  private mediaStreamTrack = null;
  private errorApp = '';
  public timeout;
  private faceAjax = {
    url: 'open/getEquipment',
    ajaxType: 'get',
    params: [
      {
        'name': 'typeCode',
        'type': 'value',
        'value': 'FACERECOGNITION'
      },
      {
        'name': 'clientIp',
        'type': 'value',
        'value': ''
      }
    ]
  };
  private ipConfig = {
    url: 'utils/getClientIp',
    ajaxType: 'get',
    params: []
  };

  constructor(
    private cacheService: CacheService,
    private apiService: ApiService,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    @Inject(BSN_COMPONENT_CASCADE)
    private cascade: Observer<BsnComponentMessage>
  ) {
    super();
    // modalSrv.closeAll();
    // this.tokenService.clear();
    // this.cacheService.clear();
    // this.menuService.clear();
  }

  public ngOnInit() {
  }

  public ngAfterViewInit() {
  }

  public ngOnDestroy(): void {

  }

  public getMedia() {
    const constraints = {
      video: { width: 300, height: 300 },
      audio: true
    };
    // 获得video摄像头区域
    const video = <HTMLVideoElement>document.getElementById('video');
    // 这里介绍新的方法，返回一个 Promise对象
    // 这个Promise对象返回成功后的回调函数带一个 MediaStream 对象作为其参数
    // then()是Promise对象里的方法
    // then()方法是异步执行，当then()前的方法执行完后再执行then()内部的程序
    // 避免数据没有获取到
    const promise = navigator.mediaDevices.getUserMedia(constraints);
    const that = this;
    promise.then(function (MediaStream) {
      console.log(that.mediaStreamTrack);
      //  this.mediaStreamTrack = MediaStream.getTracks()[0];
      that.mediaStreamTrack = typeof MediaStream['stop'] === 'function' ? MediaStream : MediaStream.getTracks()[1];
      video.srcObject = MediaStream;
      video.play();
    });

    this.timeout = setTimeout(() => {
      this.takePhoto();
    }, 3000);
  }

  public takePhoto() {
    // 获得Canvas对象
    let video = <HTMLVideoElement>document.getElementById('video');
    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 500, 500);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
    // console.log(dataUrl);
    this.FaceRecognition(dataUrl);
  }

  public async FaceRecognition(image?) {
    const that = this;
    const clientIp = await this.loadClientIP();
    this.faceAjax.params[1]['value'] = clientIp;
    const wsString = await this.loadWsConfig();
    const ws = new WebSocket(wsString);
    ws.onopen = function () {
      // Web Socket 已连接上，使用 send() 方法发送数据
      // 连接服务端socket
      ws.send(image);
      console.log('数据发送中...');
    };
    ws.onmessage = function (evt) {
      const received_msg = evt.data;
      console.log('数据已接收...', received_msg);
      if (that.tempValue['faceInfo']) {
        if (received_msg !== '') {
          const facestring = that.tempValue['faceInfo'].split(',');
          const facelength = facestring.length;
          for (let i = 0; i < facelength; i++) {
            if (facestring[i] === received_msg) {
              that.showError('该人员已经完成人脸验证，不要重复验证')
              break;
            } else {
              that.tempValue['faceInfo'] += ',' + received_msg
              break;
            }
          }
        } else {
          that.showError('刷脸未成功，请重试');
        }
      } else {
        that.tempValue['faceInfo'] = received_msg;
        console.log('tempvalue', that.tempValue);
      }
      that.closeMedia();
      clearTimeout(that.timeout);
    };
    console.log('tempvalue', that.tempValue);
    ws.onclose = function () {
      // 关闭 websocket
      console.log('连接已关闭...');
    };
  }

  public showError(errmsg) {
    this.errorApp = errmsg;
  }

  public closeMedia() {
    console.log(this.mediaStreamTrack);
    this.mediaStreamTrack && this.mediaStreamTrack.stop();
  }

  public async loadClientIP() {
    let ip;
    const url = this.ipConfig.url;
    const loadData = await this._load(url, {});
    if (loadData.isSuccess) {
      ip = loadData.data.clientIp;
    }
    return ip;
  }

  public async loadWsConfig() {
    let wsString;
    const url = this._buildURL(this.faceAjax.url);
    const params = {
      ...this._buildParameters(this.faceAjax.params)
    }
    const loadData = await this._load(url, params);
    if (loadData && loadData.status === 200 && loadData.isSuccess) {
      if (loadData.data.length > 0) {
        loadData.data.forEach(element => {
          wsString = 'ws://' + element['webSocketIp'] + ':' + element['webSocketPort'] + '/' + element['connEntry'];
          return true;
        });
      }
    }
    return wsString;
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
        cacheValue: this.cacheService
      });
    }
    return params;
  }

  public isString(obj) {
    // 判断对象是否是字符串
    return Object.prototype.toString.call(obj) === '[object String]';
  }
}

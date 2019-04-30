import { AfterViewInit, Component, Input, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { NzMessageService, UploadFile, NzModalService, NzDrawerService } from 'ng-zorro-antd';
import { ApiService } from '@core/utility/api-service';
import { CommonTools } from '@core/utility/common-tools';
import { SystemResource } from '@core/utility/system-resource';
import { checkAndUpdateBinding } from '@angular/core/src/view/util';
import { CacheService } from '@delon/cache';
import { Router } from '@angular/router';
import { BSN_COMPONENT_MODES, BsnComponentMessage, BSN_COMPONENT_CASCADE, BSN_COMPONENT_CASCADE_MODES } from '@core/relative-Service/BsnTableStatus';
import { Observable, Observer, Subscription } from 'rxjs';
import { CnComponentBase } from '@shared/components/cn-component-base';

declare  var flvjs: any;

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bsn-screen-schot',
    templateUrl: './bsn-screen-shot.component.html',
    styles: [
        `    
        `
    ]
})
export class BsnScreenShotComponent extends CnComponentBase implements OnInit, AfterViewInit {
    @Input()
    public config;
    @Input() 
    public initData;
    @Input()
    public refObj;


    public _statusSubscription: Subscription;
    public _cascadeSubscription: Subscription;

    @ViewChild('videoElement') 
    public videoElement: ElementRef<any>;
    constructor(
      private _http: ApiService,
      private _message: NzMessageService,
      private modalService: NzModalService,
      private cacheService: CacheService,
      private router: Router,
      private drawerService: NzDrawerService,
      @Inject(BSN_COMPONENT_MODES)
      private stateEvents: Observable<BsnComponentMessage>,
      @Inject(BSN_COMPONENT_CASCADE)
      private cascade: Observer<BsnComponentMessage>,
      @Inject(BSN_COMPONENT_CASCADE)
      private cascadeEvents: Observable<BsnComponentMessage>
    ) {
      super();
    }

    public ngOnInit() {
        if (this.initData) {
          this.initValue = this.initData;
          this.baseMessage = this._message;
      }

      this.relativeResolver();
    }

    public ngAfterViewInit() {
      this.showVideo ();
    }

    private relativeResolver() {
      if (
        this.config.componentType &&
        this.config.componentType.child === true
    ) {
        this._cascadeSubscription = this.cascadeEvents.subscribe(
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
                            if (option) {
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
                            }
                        }
                    });
                }
            }
        );
    }   
    }

    private showVideo () {
      const s = document.getElementById('videoElement');
        const player = this.videoElement.nativeElement;
        if (flvjs.isSupported()) {
          // 创建flvjs对象
          const flvPlayer = flvjs.createPlayer({
            type: 'flv',        // 指定视频类型
            isLive: true,       // 开启直播
            hasAudio: false,    // 关闭声音
            cors: true,         // 开启跨域访问
            url: this.config.videoUrl ? this.config.videoUrl : 'http://localhost:9001/http_live?port=1935&app=rtmp_live&stream=live',       // 指定流链接
          },
          {
            enableStashBuffer: false,
            lazyLoad: true,
            lazyLoadMaxDuration: 1,
            lazyLoadRecoverDuration: 1,
            deferLoadAfterSourceOpen: false,
            statisticsInfoReportInterval: 1,
            fixAudioTimestampGap: false,
            autoCleanupSourceBuffer: true,
            autoCleanupMaxBackwardDuration: 5,
            autoCleanupMinBackwardDuration: 2,
          });

          // 将flvjs对象和DOM对象绑定
          flvPlayer.attachMediaElement(player);
          // 加载视频
          flvPlayer.load();
          // 播放视频
          flvPlayer.play();
          player.addEventListener('progress', function() {
            const len = this.buffered.length ;
            const buftime = this.buffered.end(len - 1) - this.currentTime;
            if (buftime >= 0.5) {
              this.currentTime = this.buffered.end(len - 1);
            }
          });
        }
       }

    public takeShot() {
      const that = this;
      const ws = new WebSocket(this.config.wsconfig  ? this.config.wsconfig : 'ws://127.0.0.1:9090/CameraPictureService' );
      try {
        ws.onopen = function () {
          // Web Socket 已连接上，使用 send() 方法发送数据
          let _id;
          if (that.initValue[that.config.keyId]) {
            _id = that.initValue[that.config.keyId];  
          } else if(that.tempValue[that.config.keyId]) {
            _id = that.tempValue[that.config.keyId];
          }
          this.send(_id);
          console.log('发送数据为:' + _id);
        };
  
        ws.onmessage = function (evt) {
          const received_msg = evt.data;
          if(received_msg === 'FINISH_UPLOAD') {
            // 弹框提示成功
            that.baseMessage.success('拍照完成');
          } else {
            // 弹框提示失败
            that.baseMessage.error('拍照失败');
          }
          ws.close();
        };
        ws.onclose = function () {
          // 关闭 websocket
          console.log('连接已关闭...');
        };
      } catch (error) {
        console.log(error);
      }
      
    }
}

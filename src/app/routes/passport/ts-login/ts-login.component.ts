import { SysResource } from '@core/utility/sys-resource';

import { SettingsService, TitleService, MenuService } from '@delon/theme';
import { Component, OnDestroy, Inject, Optional, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService, NzTabChangeEvent } from 'ng-zorro-antd';
import {
    SocialService,
    TokenService,
    DA_SERVICE_TOKEN,
    ITokenModel
} from '@delon/auth';
import { ReuseTabService } from '@delon/abc';
import { environment } from '@env/environment';
import { OnlineUser, UserLogin } from '../../../model/APIModel/OnlineUser';
import { AppUser, CacheInfo } from '../../../model/APIModel/AppUser';
import { APIResource } from '@core/utility/api-resource';
import { CacheService } from '@delon/cache';
import { ApiService } from '@core/utility/api-service';
// import { Md5 } from 'ts-md5/dist/md5';
import { HttpClient } from '@angular/common/http';
import { SystemResource } from '@core/utility/system-resource';
import { CommonTools } from '@core/utility/common-tools';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ts-passport-login',
    templateUrl: './ts-login.component.html',
    styleUrls: ['./ts-login.component.less'],
    providers: [SocialService]
})
export class TsLoginComponent implements OnInit, AfterViewInit, OnDestroy {
    public form: FormGroup;
    public error = '';
    public errorApp = '';
    // 登录配置/解析系统的标识：0配置平台，1解析平台
    public loading = false;
    public mediaStreamTrack = null;
    public timeout;
    // 当前选择登录系统的配置项
    public _currentSystem;
    public isCardLogin = false;
    public isFaceLogin = true;
    public isNormalLogin = false;
    private ajax = {
        url: 'open/getEquipment',
        ajaxType: 'get',
        params: [
            {
                'name': 'typeCode',
                'type': 'value',
                'value': 'CARD'
            },
            {
                'name': 'clientIp',
                'type': 'value',
                'value': ''
            }
        ]
    }
    private ipConfig = {
        url: 'utils/getClientIp',
        ajaxType: 'get',
        params: []
    };
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
    public ws;
    constructor(
        fb: FormBuilder,
        private router: Router,
        private httpClient: HttpClient,
        private cacheService: CacheService,
        private apiService: ApiService,
        public msg: NzMessageService,
        private modalSrv: NzModalService,
        private settingsService: SettingsService,
        private socialService: SocialService,
        private titleService: TitleService,
        private menuService: MenuService,
        @Optional()
        @Inject(ReuseTabService)
        private reuseTabService: ReuseTabService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService
    ) {
        this.form = fb.group({
            userName: [null, [Validators.required, Validators.minLength(1)]],
            password: [null, Validators.required],
            uName: [null, [Validators.required, Validators.minLength(1)]],
            uPassword: [null, [Validators.required]],
            remember: [true]
        });
        modalSrv.closeAll();

    }

    public ngOnInit(): void {
        this.tokenService.clear();
        this.cacheService.clear();
        this.menuService.clear();
        this.cacheService.set('currentConfig', SystemResource.settingSystem);
    }

    public async  ngAfterViewInit() {
        if (this.isFaceLogin) {
            this.getMedia();
        } else if (this.isCardLogin) {
            this.getCard();
        } else {
            this.isNormalLogin = true;
        }
    }

    public async getCard() {
        const that = this;
        const clientIp = await this.loadClientIP();
        this.ajax.params[1]['value'] = clientIp;
        const wsString = await this.loadWsConfig(1);
        this.ws = new WebSocket(wsString);
        this.ws.onopen = function () {
            // Web Socket 已连接上，使用 send() 方法发送数据
            // 连接服务端socket
            that.ws.send('客户端以上线');
            console.log('数据发送中...');
        };
        this.ws.onmessage = function (evt) {
            const received_msg = evt.data;
            console.log('数据已接收...', received_msg);
            that.apiService.login('common/card/login', { cardNo: received_msg })
                .toPromise()
                .then(user => {
                    if (user.isSuccess) {
                        // this.fullScreen();
                        // console.log(user.data);
                        that.cacheService.set('userInfo', user.data);
                        const token: ITokenModel = { token: user.data.token };
                        that.tokenService.set(token); // 后续projectId需要进行动态获取
                        // let url = user.data.modules[0].link;
                        let url = '/ts/entry';
                        that.ws.close();
                        that.ws = null;
                        that.router.navigate([`${url}`]);
                    } else {
                        that.showError(user.message);
                        that.ws.send('reload');
                    }

                });

        };
        this.ws.onclose = function () {
            // 关闭 websocket
            console.log('连接已关闭...');
        };
    }

    public async FaceRecognition(image?) {
        this._faceIdentify(image).then(user => {
            if (user.isSuccess) {
                this.cacheService.set('userInfo', user.data);
            const token: ITokenModel = { token: user.data.token };
            this.tokenService.set(token); // 后续projectId需要进行动态获取
            const url = '/ts/entry';
            this.router.navigate([`${url}`]);
            this.closeMedia();
            } else {
                this.showError(user.message);
                // this.getMedia();
                setTimeout(() => {
                    this.takePhoto();
                },
                2000);
                
            }
            
            
        });
        // const that = this;
        // const clientIp = await this.loadClientIP();
        // this.faceAjax.params[1]['value'] = clientIp;
        // const wsString = await this.loadWsConfig(2);
        // this.ws = new WebSocket(wsString);
        // this.ws.onopen = function () {
        //     // Web Socket 已连接上，使用 send() 方法发送数据
        //     // 连接服务端socket
        //     that.ws.send(image);
        //     console.log('数据发送中...');
        // };
        // this.ws.onmessage = function (evt) {
        //     const received_msg = evt.data;
        //     console.log('数据已接收...', received_msg);
        //     that.apiService.login('common/login2', { Id: received_msg })
        //         .toPromise()
        //         .then(user => {
        //             if (user.isSuccess) {
        //                 // this.fullScreen();
        //                 console.log(user.data);
        //                 that.closeMedia();
        //                 clearTimeout(that.timeout);
        //                 that.cacheService.set('userInfo', user.data);
        //                 const token: ITokenModel = { token: user.data.token };
        //                 that.tokenService.set(token); // 后续projectId需要进行动态获取
        //                 // let url = user.data.modules[0].link;
        //                 let url = '/ts/entry';
        //                 that.ws.close();
        //                 that.ws = null;
        //                 that.router.navigate([`${url}`]);
        //             } else {
        //                 that.showError(user.message);
        //                 that.ws.send('reload');
        //             }

        //         });

        // };
        // this.ws.onclose = function () {
        //     // 关闭 websocket
        //     console.log('连接已关闭...');
        // };
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
        const promise = window.navigator.mediaDevices.getUserMedia(constraints);
        const that = this;
        promise.then(function (MediaStream) {
            console.log(that.mediaStreamTrack);
            //  this.mediaStreamTrack = MediaStream.getTracks()[0];
            that.mediaStreamTrack = typeof MediaStream['stop'] === 'function' ? MediaStream : MediaStream.getTracks()[1];
            video.srcObject = MediaStream;
            video.play();
        });

        // window.navigator['getMedia'] = window.navigator.getUserMedia ||
        //     window.navigator['webkitGetUserMedia'] ||
        //     window.navigator['mozGetUserMedia'] ||
        //     window.navigator['msGetUserMedia'];
        // window.navigator['getMedia']({
        //     video: true, // 使用摄像头对象
        //     audio: false  // 不适用音频
        // }, function (MediaStream) {
        //     that.mediaStreamTrack = typeof MediaStream.stop === 'function' ? MediaStream : MediaStream.getTracks()[0];
        //     video.srcObject = MediaStream;
        //     // video.src = vendorUrl.createObjectURL(strem);
        //     video.play();

        // }, function (error) {
        //     console.log(error);
        // });

        // this.timeout = setTimeout(() => {
        //     this.takePhoto();
        // }, 2000);

        this.takePhoto();
    }

    public takePhoto() {
        // 获得Canvas对象
        const video = <HTMLVideoElement>document.getElementById('video');
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 500, 500);
        const dataUrl = canvas.toDataURL()
        // const dataUrl = canvas.toBlob(function(callback) {
        //     console.log(callback);
        // });
        console.log(dataUrl);
        
        this.FaceRecognition(dataUrl);
    }

    public closeMedia() {
        this.mediaStreamTrack && this.mediaStreamTrack.stop();
    }

    public isString(obj) {
        // 判断对象是否是字符串
        return Object.prototype.toString.call(obj) === '[object String]';
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

    public async loadWsConfig(i: number) {
        let wsString;
        let url;
        let params;
        if (i === 1) {
            url = this._buildURL(this.ajax.url);
            params = {
                ...this._buildParameters(this.ajax.params)
            };
        } else if (i === 2) {
            url = this._buildURL(this.faceAjax.url);
            params = {
                ...this._buildParameters(this.faceAjax.params)
            }
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

    // region: fields

    get userName() {
        return this.form.controls.userName;
    }
    get password() {
        return this.form.controls.password;
    }


    // endregion


    public submit() {
        this.error = '';
        this.errorApp = '';
        this.loading = true;

        const userLogin = new UserLogin();
        // 重置表单状态
        this._remarkLoginForm();
        // 构建用户登录信息
        this._buildOnlineUser(userLogin);

        if (this.isNormalLogin) {
            this.login(userLogin);
        }
    }

    public async login(userLogin) {
        const user = await this._userLogin(userLogin);
        if (user.isSuccess) {
            console.log(user.data);
            this.cacheService.set('userInfo', user.data);
            const token: ITokenModel = { token: user.data.token };
            this.tokenService.set(token); // 后续projectId需要进行动态获取\
            const url = '/ts/entry';
            this.router.navigate([`${url}`]);
        } else {
            this.showError(user.message);
        }
        this.loading = false;
    }



    public changeTab($event: NzTabChangeEvent) {
        if ($event.tab.nzTitle === '刷脸登录') {
            this.isCardLogin = false;
            this.isNormalLogin = false;
            this.getMedia();
        } else if ($event.tab.nzTitle === '刷卡登录') {
            this.isFaceLogin = false;
            this.isNormalLogin = false;
            this.getCard();
            this.closeMedia();
        } else if ($event.tab.nzTitle === '账户登录') {
            this.isCardLogin = false;
            this.isFaceLogin = false;
            this.isNormalLogin = true;
            this.closeMedia();
        }
        this.errorApp = null;
    }

    public async _userLogin(userLogin) {
        return this.apiService.login('common/login', userLogin).toPromise();
    }

    public async _faceIdentify(imageFlow) {
        return this.apiService.faceLogin('file/loginByFace', imageFlow).toPromise();
    }

    public async _getLocalAppData() {
        return this.httpClient
            .get<any>(
                // environment.SERVER_URL
                SystemResource.localResource.url
                + '/assets/app-data.json'
            )
            .toPromise();
    }

    public async _getAppConfig() {
        return this.httpClient.get('assets/app-config.json').toPromise();
    }

    public _buildOnlineUser(onlineUser: UserLogin) {
        if (this.isNormalLogin) {
            onlineUser.loginName = this.userName.value;
            onlineUser.loginPwd = this.password.value;
            this.cacheService.set(
                'currentConfig',
                SystemResource.settingSystem
            );
        }
    }

    public _remarkLoginForm() {
        if (!this.isCardLogin) {
            // 配置平台
            this.userName.markAsDirty();
            this.userName.updateValueAndValidity();
            this.password.markAsDirty();
            this.password.updateValueAndValidity();
            if (this.userName.invalid || this.password.invalid) return;
        }
    }

    public showError(errmsg) {
        this.errorApp = errmsg;
    }

    public ngOnDestroy(): void {
        
    }

    public fullScreen() {
        const el = document.documentElement;

        const rfs = el['requestFullScreen'] || el['webkitRequestFullScreen'] ||

            el['mozRequestFullScreen'] || el['msRequestFullScreen'];

        if (typeof rfs !== 'undefined' && rfs) {

            rfs.call(el);

        }
    }
}

import { CacheService } from '@delon/cache';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpErrorResponse,
    HttpSentEvent,
    HttpHeaderResponse,
    HttpProgressEvent,
    HttpResponse,
    HttpUserEvent
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { APIResource } from '@core/utility/api-resource';
import { SystemResource, SystemResource_1 } from '@core/utility/system-resource';

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
    constructor(
        private injector: Injector,
        private cacheService: CacheService
    ) {}

    get msg(): NzMessageService {
        return this.injector.get(NzMessageService);
    }

    private goTo(url: string) {
        setTimeout(() => this.injector.get(Router).navigateByUrl(url));
    }

    private handleData(
        event: HttpResponse<any> | HttpErrorResponse
    ): Observable<any> {
        // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
        this.injector.get(_HttpClient).end();
        // 业务处理：一些通用操作
        switch (event.status) {
            case 200:
                // 业务层级错误处理，以下假如响应体的 `status` 若不为 `0` 表示业务级异常
                // 并显示 `error_message` 内容

                // const body: any = event instanceof HttpResponse && event.body;
                // if (body && body.status !== 0) {
                //     this.msg.error(body.error_message);
                //     // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
                //     // this.http.get('/').subscribe() 并不会触发
                //     return ErrorObservable.throw(event);
                // }
                break;
            case 401: // 未登录状态码
                this.goTo('/passport/login');
                break;
            case 403:
            case 404:
            case 500:
                const EvMsg: any = event;
                if (
                    EvMsg.message === '请先登录或重新登录' ||
                    EvMsg.message === '闲置时间过长，请重新登录'
                ) {
                    this.goTo('/passport/login');
                } else {
                    this.msg.error(`${EvMsg.message}`);
                }
                // this.goTo(`/${event.status}`);
                break;
        }
        return of(event);
    }

    public intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<
        | HttpSentEvent
        | HttpHeaderResponse
        | HttpProgressEvent
        | HttpResponse<any>
        | HttpUserEvent<any>
    > {
        // 统一加上服务端前缀
        let url = req.url;
        let newReq;
        if (url.startsWith('http://192.168.1.200')) {
            // url = this._buildURL() + url;
            url = this._replaceCurrentURL(url)
 
            newReq = req.clone({
                url: url
            });  
        } else if (url.startsWith('api.push.message')) {
            url = this._buildURL() + url;
            url = this._replaceCurrentURL(url)
            url = url.replace('api.cfg/', '');

            newReq = req.clone({
                url: url
            });
        } else if(url.startsWith('api')) {

            url = url;
            newReq = req.clone({
                url: url
            });
        }  else if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = this._buildURL() + url;
            url = this._replaceCurrentURL(url)

            newReq = req.clone({
                url: url
            });     
        }  else {
            newReq = req.clone({
                url: url
            });
        }
        return next.handle(newReq).pipe(
            mergeMap((event: any) => {
                // 允许统一对请求错误处理，这是因为一个请求若是业务上错误的情况下其HTTP请求的状态是200的情况下需要
                if (event instanceof HttpResponse && event.status === 200)
                    return this.handleData(event);
                // 若一切都正常，则后续操作
                return of(event);
            }),
            catchError((err: HttpErrorResponse) => this.handleData(err))
        );
    }

    public _buildURL() {
        let url;
        const currentConfig: any = this.cacheService.getNone('currentConfig');
        if (!currentConfig) {
            url = SystemResource.localResource;
            // url = environment.SERVER_URL;
        } else {
            url = currentConfig.Server;
        }
        return url;
    }

    private _replaceCurrentURL(oldUrl: string): string {
        const reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        const reg_port = /:\d{1,5}/;
        const reg_all = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/
        let ip = null;
        const regOldUrlIp = reg_all.exec(oldUrl);
        if(regOldUrlIp && Array.isArray(regOldUrlIp) && regOldUrlIp.length > 0) {
            ip = regOldUrlIp[0];
        }

        const href = window.location.href;

        const port = reg_port.exec(href)[0];
        const subPort = reg_port.exec(href)[0].substring(1, port.length);

        let match, matchIP;
        if (href.indexOf('localhost') < 0) {
            match = reg.exec(window.location.href)[0].replace(/\./g, '_');

            matchIP = `url_${match}_${subPort}`;
        } else {
            matchIP = `url_localhost_${subPort}`;
        }
        let newIP;
        if (oldUrl.indexOf('api.cfg') > 0) {
            newIP = SystemResource_1[matchIP].settingSystemServer;
        } else if (oldUrl.indexOf('ReportServer.ashx') > 0) {
            newIP = SystemResource_1[matchIP].reportServerUrl;
        } else {
            newIP = SystemResource_1[matchIP].localResourceUrl;
        }
        return oldUrl.replace(ip, newIP);
    }
}

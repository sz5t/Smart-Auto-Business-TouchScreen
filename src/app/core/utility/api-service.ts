import { CommonTools } from '@core/utility/common-tools';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { APIResource } from '@core/utility/api-resource';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { SystemResource } from '@core/utility/system-resource';
import { AlainThemeConfig } from '@delon/theme';
 
@Injectable()
export class ApiService {
    public httpClient;
    constructor(
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
        private http: HttpClient
    ) {
        this.httpClient = new _HttpClient(http, new AlainThemeConfig());
    }

    public setLoginHeaders() {
        const token = this.tokenService.get().token;
        if (token !== 'null') {
            // const userToken = JSON.parse(this.tokenService.get().token);
            return new HttpHeaders()
                .set('X-Requested-With', 'XMLHttpRequest')
                .set('_projectId', '7fe971700f21d3a796d2017398812dcf');
        }
    }

    public setFaceLoginHeaders() {
        const token = this.tokenService.get().token;
        if (token !== 'null') {
            // const userToken = JSON.parse(this.tokenService.get().token);
            return new HttpHeaders()
                .set('X-Requested-With', 'XMLHttpRequest')
                .set('_projectId', '7fe971700f21d3a796d2017398812dcf')
                .set('Content-type', 'application/x-www-form-urlencoded');
        }
    }

    public setHeaders() {
        const token = this.tokenService.get().token;
        if (token !== 'null') {
            // const userToken = JSON.parse(this.tokenService.get().token);
            return new HttpHeaders()
                .set('_token', token ? token : '')
                .set('X-Requested-With', 'XMLHttpRequest')
        }       
    }

    public login(resource, body?, params?) {
        return this.httpClient.request('POST', resource, {
            body: body,
            params: params,
            headers: this.setLoginHeaders()
        }); 
    }

    public faceLogin(resource, body?, params?) {
        return this.httpClient.request('POST', resource, {
            body: body,
            params: params,
            headers: this.setFaceLoginHeaders()
        }); 
    }

    // region 操作配置平台的相关资源
    public post(resource, body?, params?) {
        return this.httpClient.request('POST', resource, {
            body: body,
            params: params,
            headers: this.setHeaders()
        });
    }

    public get(resource, params?) {
        return this.httpClient.request('GET', resource, {
            responseType: 'json',
            params: params,
            headers: this.setHeaders()
        });
    }

    public getById(resource, params?) {
        if (params) {
            resource = `${resource}/${params['Id']}`;
        }
        return this.httpClient.request('GET', resource, {
            responseType: 'json',
            headers: this.setHeaders()
        });
    }

    public put(resource, body?, params?) {
        return this.httpClient.request('PUT', resource, {
            params: params,
            body: body,
            headers: this.setHeaders()
        });
    }

    public delete(resource, params?) {
        return this.httpClient.request('DELETE', resource, {
            params: params,
            headers: this.setHeaders()
        });
    }

    // endregion

    // region: read inner config data
    public getLocalData(name) {
        const urls = `${SystemResource.localResourceConfigJson.url + name}.json?rtc='${CommonTools.uuID(10)}`;

        // const urls = `http://192.168.1.111:8081/api.cfg/files/moduleConfig/${name}.json?rtc=${CommonTools.uuID(10)}`;

        return this.httpClient.request('GET', urls, {
            // headers: this.setHeaders()
        });
    }

    public getLocalReportTemplate(name) {
        const urls = `${SystemResource.localResource.url}/assets/report_template/${name}.ssjson?rtc=${CommonTools.uuID(10)}`;
        return this.httpClient.request('GET', urls, {
            // headers: this.setHeaders()
        });
    }

    public getSystemConfig() {
        const urls = `${SystemResource.localResource.url}/assets/config.json?rtc=${CommonTools.uuID(10)}`;
        return this.http.get<any>(urls);
    }
    // endregion
}

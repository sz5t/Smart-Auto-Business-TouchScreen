import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { ApiService } from '@core/utility/api-service';
import { CommonTools } from '@core/utility/common-tools';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bsn-upload',
    templateUrl: './bsn-upload.component.html',
    styles: [
        `
            :host ::ng-deep nz-upload {
                display: block;
            }

            :host ::ng-deep .ant-upload.ant-upload-drag {
                height: 180px;
            }
            :host ::ng-deep .file-list {
                min-height: 250px;
            }
            :host ::ng-deep .uploadList-container {
                overflow: auto;
                height: 200px;
            }
        `
    ]
})
export class BsnUploadComponent implements OnInit, AfterViewInit {
    @Input()
    public config;
    @Input()
    public refObj;
    public uploading = false;
    public fileList: UploadFile[] = [];
    public uploadList = [];
    public loading = true;
    public securityLevel;
    public remark;

    constructor(
        private _message: NzMessageService,
        private _apiService: ApiService
    ) {}

    public ngOnInit() {}

    public ngAfterViewInit() {
        this.loadUploadList();
    }

    public loadUploadList() {
        this.loading = true;
        this._apiService
            .get(
                this.config.listUrl,
                CommonTools.parametersResolver({
                    params: this.config.params,
                    tempValue: this.refObj
                })
            )
            .subscribe(
                result => {
                    this.uploadList = result.data;
                    this.loading = false;
                },
                error => {
                    this.loading = false;
                }
            );
    }

    public handleChange({ file, fileList }): void {
        const status = file.status;
        if (status !== 'uploading') {
        }
        if (status === 'done') {
            this._message.success(`文件 ${file.name} 上传成功！`);
        } else if (status === 'error') {
            this._message.error(`文件 ${file.name} 上传失败！`);
        }
    }
    public beforeUpload = (file: UploadFile): boolean => {
        this.fileList.push(file);
        return false;
    };

    /**
     *  "refDataId":"",                                       --关联的业务数据主键
         "batch":"",                                           --批次，标识同一次上传的文件
         "file_1":"",                                          --上传的第一个文件
         "secretLevel_1":"",                                   --上传第一个文件的密级
         ...
         "file_x":"",                                          --上传的第x个文件
         "secretLevel_x":""                                    --上传第x个文件的密级
     */

    public handleUpload(): void {
        const formData = new FormData();
        // tslint:disable-next-line:no-any
        this.fileList.forEach((file: any, index) => {
            formData.append(`file_${index}`, file);
            formData.append(`secretLevel_${index}`, this.securityLevel);
            formData.append(`remark_${index}`, this.remark);
        });
        formData.append('refDataId', this.refObj._id);
        setTimeout(() => {
            this.uploading = true;
        });
        this._apiService.post(this.config.url, formData).subscribe(
            result => {
                setTimeout(() => {
                    this.uploading = false;    
                });
                this._message.success('上传成功！');
                this.loadUploadList();
            },
            error => {
                setTimeout(() => {
                    this.uploading = false;    
                });
                this._message.error('上传失败！');
            }
        );
    }

    public download(id) {
        this._apiService
            .get(this.config.downloadUrl, { _ids: id })
            .subscribe(result => {
                this._message.success('下载成功');
            });
    }

    public delete(id) {
        this._apiService.delete(this.config.deleteUrl, { _ids: id }).subscribe(
            result => {
                this._message.success('附件删除成功');
                this.loadUploadList();
            },
            error => {
                this._message.success('附件删除失败！');
            }
        );
    }

    public cancel() {
        return false;
    }
}

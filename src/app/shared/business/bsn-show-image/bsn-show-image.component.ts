import { Component, OnInit, AfterViewInit, Input, ViewChild, Inject, ElementRef } from '@angular/core';
import { SystemResource } from '@core/utility/system-resource';
import { ApiService } from '@core/utility/api-service';
import { CacheService } from '@delon/cache';
import { BSN_COMPONENT_MODES, BsnComponentMessage, BSN_COMPONENT_CASCADE } from '@core/relative-Service/BsnTableStatus';
import { Observable, Observer, Subscriber, from } from 'rxjs';
import { CnComponentBase } from '@shared/components/cn-component-base';
import { CommonTools } from '@core/utility/common-tools';
import { fromPromise } from 'rxjs/internal/Observable/fromPromise';

@Component({
  selector: 'bsn-show-image',
  templateUrl: './bsn-show-image.component.html',
  styleUrls: ['./bsn-show-image.component.css']
})
export class BsnShowImageComponent extends CnComponentBase
  implements OnInit, ElementRef, AfterViewInit {
  public nativeElement: any;
  @Input()
  public config;
  @Input()
  public initData;
  @Input()
  public tempValue;
  @ViewChild('showImage')
  public showImage: ElementRef;
  public isLoading = true;

  public _statusSubscription;
  public _cascadeSubscription;
  public serverPath = SystemResource.appSystem.Server;
  constructor(
    private _apiService: ApiService,
    private _cacheService: CacheService,
    @Inject(BSN_COMPONENT_MODES)
    private stateEvents: Observable<BsnComponentMessage>,
    @Inject(BSN_COMPONENT_CASCADE)
    private cascade: Observer<BsnComponentMessage>,
    @Inject(BSN_COMPONENT_CASCADE)
    private cascadeEvents: Observable<BsnComponentMessage>
  ) {
    super();
  }
  // 配置模板

  public imgList$: any = [];

  public imgList: any = [];

  public ngOnInit() {
    // // 图片集外面的DIV宽
    // document.getElementById('tsImgSCon').style.width = this.FliS(0).offsetWidth * 4 + 'px';

    // // Ul宽
    // this.FulSs().style.width = this.FliS(0).offsetWidth * this.FulS().length + 'px';

    // // 图片等比例
    // this.tsScrollResize();
    // // console.log('l.data: ', l.data);
  }

  private handleListMapping(res) {
    const source$ = from(res);
    source$.subscribe((s: any) => {
      const list = []

      return list;
    })
    return source$;
  }

  // public load() {
  //   this.imgList = [];
  //   this.get().then(response => {
  //     console.log('response :' , response);
  //       if (response.isSuccess) {
  //           // 构建数据源
  //           response.data.forEach(d => {
  //               const imgItem = {};
  //               this.config.dataMapping.forEach(element => {
  //                   if (element['field'] === 'urlPath') {
  //                       if (d[element['field']]) {
  //                           imgItem[element['name']] = (d[element['field']]).replace('/^\\/$', function(s) {
  //                               return s = '/';
  //                          });  
  //                       }              
  //                   } else {
  //                       imgItem[element['name']] = d[element['field']];                    
  //                   }

  //               });
  //               this.imgList.push(imgItem);
  //           });
  //           setTimeout(() => {
  //               this.isLoading = false;
  //           })
  //           // this.carousel.activeIndex = 0;
  //       }
  //   });
  //   // (async () => {
  //   //     const response = await this.get();
  //   //     if (response.isSuccess) {
  //   //         // 构建数据源
  //   //         response.data.forEach(d => {
  //   //             const imgItem = {};
  //   //             this.config.dataMapping.forEach(element => {
  //   //                 if (element['field'] === 'urlPath') {
  //   //                     if (d[element['field']]) {
  //   //                         imgItem[element['name']] = (d[element['field']]).replace('/^\\/$', function (s) {
  //   //                             return s = '/';
  //   //                         });
  //   //                     }
  //   //                 } else {
  //   //                     imgItem[element['name']] = d[element['field']];
  //   //                 }

  //   //             });
  //   //             this.imgList.push(imgItem);
  //   //         });
  //   //         this.isLoading = false;
  //   //         console.log('imgList :', this.imgList)
  //   //         // this.carousel.activeIndex = 0;
  //   //     }
  //   // })();

  // }

  public async get() {
    const list = [];
    const url = this.config.ajaxConfig.url;
    const params = CommonTools.parametersResolver({
      params: this.config.ajaxConfig.params,
      tempValue: this.tempValue,
      initValue: this.initValue,
      cacheValue: this._cacheService,
      routerValue: this._cacheService
    });
    const res = await this._apiService.get(url, params).toPromise();
    for (const d of res.data) {
      const imgItem = {};
      this.config.dataMapping.forEach(element => {
        if (element['field'] === 'urlPath') {
          if (d[element['field']]) {
            imgItem[element['name']] = (d[element['field']]).replace('/^\\/$', function (s) {
              return s = '/';
            });
          }
        } else {
          imgItem[element['name']] = d[element['field']];
        }

      });
      list.push(imgItem);
    }
    // res.data.foreach(d => {

    // });
    return list;
  }

  public ngAfterViewInit() {
    const divtsShop = this.showImage.nativeElement;
    divtsShop.setAttribute('id', 'tsShopContainer');
    // let that = this
    // const divtsShop = document.createElement('div');
    //   divtsShop.setAttribute('id', 'tsShopContainer');
    this.imgList$ = fromPromise(this.get()).pipe();
    // console.log('imgList:', this.imgList$);
    let list = []
    this.imgList$.subscribe(l => {
      console.log('after list', l)
      list = l;
    });
    console.log('list: ', list);
    for (let i = 0; i < list.length; i++) {
      this.imgList[i] = list[i]
    }

    const divtsImgS = document.createElement('div');
    divtsImgS.setAttribute('id', 'tsImgS');
    divtsShop.appendChild(divtsImgS);
    console.log('src:', this.imgList);
    console.log('src:', this.imgList[0]);
    // const tsImgSa = document.createElement('a')
    //   tsImgSa.setAttribute('href', this.imgList[0]['src']);
    //   tsImgSa.setAttribute('title', 'Images');
    //   tsImgSa.setAttribute('class', 'MagicZoom');
    //   tsImgSa.setAttribute('id', 'MagicZoom');
    // const aimg = document.createElement('img');
    //   aimg.setAttribute('width', '300px');
    //   aimg.setAttribute('height', '300px');
    //   aimg.setAttribute('src', this.imgList[0]['src']);
    //   tsImgSa.appendChild(aimg);
    //   divtsImgS.appendChild(tsImgSa);
    // const divtsPic = document.createElement('div');
    // const divArrL = document.createElement('div');
    //   divArrL.addEventListener('click', this.tsScrollArrLeft);
    //   divtsPic.appendChild(divArrL);
    //   divtsShop.appendChild(divtsPic);
    // const divCon = document.createElement('div');
    //   divCon.setAttribute('id', 'tsImgSCon');
    //   divtsPic.appendChild(divCon);
    // const ul = document.createElement('ul');
    //   divCon.appendChild(ul);
    //   let li = document.createElement('li');
    //   let img = document.createElement('img');
    // for (let i = 0; i < this.imgList.length ; i++) {
    //   if (i === 0) {
    //     li.setAttribute('rel', 'MagicZoom');
    //     li.setAttribute('class', 'tsSelectImg');
    //     li.addEventListener('click', function() {that.showPic(i)});
    //   } else {
    //     li.setAttribute('rel', 'MagicZoom');
    //     li.addEventListener('click', function() {that.showPic(i)});
    //   }
    //   img.setAttribute('height', '42');
    //   img.setAttribute('width', '42');
    //   img.setAttribute('src', '42');
    //   img.setAttribute('attr.tsImgS', this.serverPath + this.imgList[i].src);
    //   li.appendChild(img);
    //   ul.appendChild(li);
    // }
    console.dir(divtsShop);


    // this.load();
    // // 图片集外面的DIV宽
    // document.getElementById('tsImgSCon').style.width = this.FliS(0).offsetWidth * 4 + 'px';

    // // Ul宽
    // this.FulSs().style.width = this.FliS(0).offsetWidth * this.FulS().length + 'px';

    // // 图片等比例
    // this.tsScrollResize();
  }

  // JavaScript Document

  // 单击图片列表
  public showPic(num: any) {
    // 将所有的li样式赋值为空
    const objUl = this.FulS();
    for (let i = 0; i < objUl.length; i++) {
      objUl[i].className = '';
    }

    // 对单击的进行样式应用
    this.FliS(num).className = 'tsSelectImg';

    // 得到单击后的图片值
    const src = this.Fpic(num).getAttribute('tsImgS');

    // 进行赋值
    const Objimg = this.FimgS();

    Objimg.src = this.Fpic(num).src;


    document.getElementById('tsImgS').getElementsByTagName('a')[0].href = src;

    // 图片等比例
    this.tsScrollResize();

    // 设置导航
    this.tsScrollDh(num);


    // 滚动图片定位
    this.FulSs().style.marginLeft = '-' + (this.tsNum() * this.tsRowNum() * this.FliS(0).offsetWidth) + 'px';


  }
  // 上一页
  public tsScrollArrLeft() {
    if (this.tsNum() + 1 > 1) {
      // 设置导航
      this.tsScrollDh((this.tsNum() - 1) * this.tsRowNum());

      // 滚动图片定位
      this.FulSs().style.marginLeft = '-' + (this.tsNum()) * this.tsRowNum() * this.FliS(0).offsetWidth + 'px';

    }
  }

  // 下一页
  public tsScrollArrRight() {
    if (this.tsNum() + 2 <= this.tsRowCount()) {
      // 设置导航
      this.tsScrollDh((this.tsNum() + 1) * this.tsRowNum());
      // 滚动图片定位
      this.FulSs().style.marginLeft = '-' + (this.tsNum()) * this.tsRowNum() * this.FliS(0).offsetWidth + 'px';

    }
  }



  // 设置导航,如果不对上面的Img进行操作,那么imgno就要有参数进来
  public tsScrollDh(i) {
    // 设置上一页导航
    document.getElementById('tsImgSArrL').setAttribute('showPicNum', i);

    // 设置下一页导航
    document.getElementById('tsImgSArrR').setAttribute('showPicNum', i);

  }


  public tsScrollResize() {
    const maxWidth = 300;
    const maxHeight = 300;

    const myimg = this.FimgS();

    const imgNew = new Image();
    imgNew.src = myimg.src;

    // 将myimg存起来，相当于一个参数，不然异步的时候执行太快，一直是最后一张图
    imgNew['preImg'] = myimg;


    // 这个是为了防遨游等浏览器，图片宽、高加为0执行
    if (imgNew.width === 0 || imgNew.height === 0) {
      imgNew.onload = () => {
        this.tsScrollResizeHd(imgNew, maxWidth, maxHeight, imgNew['preImg']);
      };
    } else {
      this.tsScrollResizeHd(imgNew, maxWidth, maxHeight, myimg);
    }

  }

  public tsScrollResizeHd(imgNew: any, maxWidth: any, maxHeight: any, myimg: any) {
    let hRatio;
    let wRatio;
    let Ratio = 1;
    let w = imgNew['width'];
    let h = imgNew['height'];
    wRatio = maxWidth / w;
    hRatio = maxHeight / h;
    if (maxWidth === 0 && maxHeight === 0) {
      Ratio = 1;
    } else if (maxWidth === 0) {
      if (hRatio < 1) Ratio = hRatio;
    } else if (maxHeight === 0) {
      if (wRatio < 1) Ratio = wRatio;
    } else if (wRatio < 1 || hRatio < 1) {
      Ratio = (wRatio <= hRatio ? wRatio : hRatio);
    }
    if (Ratio < 1) {

      w = w * Ratio;
      h = h * Ratio;
    }

    if (h % 2 !== 0) {
      h = h - 1;
    }

    myimg['height'] = h;
    myimg['width'] = w;


    const tsImgsBox = document.getElementById('tsImgS');
    if (myimg.height < 300) {
      const TopBottom = (300 - myimg.height) / 2;
      tsImgsBox.style.paddingTop = TopBottom + 'px';
      tsImgsBox.style.paddingBottom = TopBottom + 'px';
    } else {
      tsImgsBox.style.paddingTop = '0px';
      tsImgsBox.style.paddingBottom = '0px';
    }
  }

  // 一行显示几个
  public tsRowNum() {
    return document.getElementById('tsImgSCon').offsetWidth / this.FliS(0).offsetWidth;
  }

  // 第几行 从0开始
  public tsNum() {
    return Math.floor(Number(document.getElementById('tsImgSArrL').getAttribute('showPicNum')) / this.tsRowNum());
  }
  // 共几行
  public tsRowCount() {
    return Math.ceil(this.FulS().length / this.tsRowNum());
  }

  // 返回图片对象
  public Fpic(i) {
    const tsImgSCon = document.getElementById('tsImgSCon').getElementsByTagName('li');
    return tsImgSCon.item(i).getElementsByTagName('img')[0];
  }
  // 返回li对象
  public FliS(i) {
    console.log('aaa: ', document.getElementById('tsImgSCon').getElementsByTagName('li')[i]);
    return document.getElementById('tsImgSCon').getElementsByTagName('li')[i];
  }

  // 返回图片列表对象
  public FulS() {
    return document.getElementById('tsImgSCon').getElementsByTagName('li');
  }
  // 查找最大的图
  public FimgS() {
    return document.getElementById('tsImgS').getElementsByTagName('img')[0];
  }
  // 查找Ul对象
  public FulSs() {
    return document.getElementById('tsImgSCon').getElementsByTagName('ul')[0];
  }
}

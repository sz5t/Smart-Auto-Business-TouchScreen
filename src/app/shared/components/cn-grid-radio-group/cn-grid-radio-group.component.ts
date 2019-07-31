import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { ApiService } from '@core/utility/api-service';

@Component({
  selector: 'cn-grid-radio-group',
  templateUrl: './cn-grid-radio-group.component.html',
  styleUrls: ['./cn-grid-radio-group.component.less']
})
export class CnGridRadioGroupComponent implements OnInit {
  @Input()
  public config;
  @Input()
  public value;
  @Input()
  public bsnData;
  @Input()
  public rowData;
  @Input()
  public dataSet;
  @Input()
  public casadeData;
  @Output()
  public updateValue = new EventEmitter();
  public opt = [];
  public _value;
  // _selectedMultipleOption:any[];
  constructor(private apiService: ApiService) { }

  public async ngOnInit() {
    
    if (this.value) {
      this._value = this.value.data;
    }
    this.opt = this.config.options;
  }

  public valueChange(name?) {
    // 使用当前rowData['Id'] 作为当前编辑行的唯一标识
    // 所有接收数据的组件都已自己当前行为标识进行数据及联
    // console.log('select value:',name);
    // dataItem
    if (name) {
      this.value.data = name;
      // 将当前下拉列表查询的所有数据传递到bsnTable组件，bsnTable处理如何及联
      this.updateValue.emit(this.value);
    } else {
      this.value.data = null;
      this.updateValue.emit(this.value);
    }
  }

  public isString(obj) {
    // 判断对象是否是字符串
    return Object.prototype.toString.call(obj) === '[object String]';
  }

}

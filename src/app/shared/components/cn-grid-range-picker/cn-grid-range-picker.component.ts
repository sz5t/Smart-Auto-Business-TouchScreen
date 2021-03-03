import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { getTime } from 'date-fns';

@Component({
  selector: 'app-cn-grid-range-picker',
  templateUrl: './cn-grid-range-picker.component.html',
})
export class CnGridRangePickerComponent implements OnInit {
  @Input()
  public config;
  @Input()
  public value;
  @Input()
  public initData;
  @Input()
  public bsnData;
  @Input()
  public rowData;

  public date;
  @Output()
  public updateValue = new EventEmitter();

  constructor(
  ) { }

  public ngOnInit() {
    // this.value = { id: 1, time: "2021-9-01,2021-9-02" }
    if (this.value) {
      // 加载数据集
      const timeValue = this.value[this.config.name];
      const dateArray = timeValue.split(',');
      const showArray = [];
      dateArray.forEach(d => {
        showArray.push(new Date(d.replace(/-/g, '/')))
      });
      this.date = showArray;
      this.valueChange(timeValue)
    }
  }

  /**
   * onChange
   */
  public onChange(result?) {
    if (result && result.length > 0) {
      for (const key in result) {
        let ArrayValue = '';
        result.forEach(e => {
          const dateValue = e.getFullYear() + '-' + (e.getMonth() + 1) + '-' + e.getDate()
          ArrayValue = ArrayValue + dateValue.toString() + ',';
        });
        if (ArrayValue.length > 0) {
          ArrayValue = ArrayValue.slice(0, ArrayValue.length - 1);
        }
        // console.log('拼接', ArrayValue);
        this.valueChange(ArrayValue);
      }
    }
  }

  public valueChange(name?) {
    if (name) {
      const backValue = { ...this.value };
      let nameArray
      if (typeof (name) === 'string') {
        nameArray = name.split(',')
      }
      // const backValue = { name: this.config.name, value: name };
      if (nameArray && nameArray.length >= 2) {
        const day3 = nameArray[0];
        const day4 = nameArray[1];
        const s3 = getTime(nameArray[0]);
        const s4 = getTime(nameArray[1]);
        const date3 = s4 - s3;

        const days = Math.floor(date3 / (24 * 3600 * 1000)) + 1;

        backValue['dataItem'] = { days: days, beginTime: day3, endTime: day4 };
        // console.log('时间范围', name, days, backValue);
      }
      this.updateValue.emit(backValue);
    } else {
      const backValue = { ...this.value };
      // const backValue = { name: 'time', value: name };
      // const backValue = { name: this.config.name, value: name };
      this.updateValue.emit(backValue);
    }



  }

}

import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'cn-form-input',
  templateUrl: './cn-form-input.component.html',
  styles: [
    `
    .anticon-close-circle {
      cursor: pointer;
      color: #ccc;
      transition: color 0.3s;
      font-size: 12px;
    }

    .anticon-close-circle:hover {
      color: #999;
    }

    .anticon-close-circle:active {
      color: #666;
    }
    `
  ]
})
export class CnFormInputComponent implements OnInit {
  @Input() public config;
  @Input() public formGroup: FormGroup;
  @Output()
  public updateValue = new EventEmitter();

  public model;
  constructor(
  ) { }

  public ngOnInit() {
    if (!this.config['disabled']) {
      this.config['disabled'] = false;
    }
    if (!this.config['readonly']) {
      this.config['readonly'] = false;
    }
  }

  public valueChange(name?) {
    console.log('valueChange', name);
    const backValue = { name: this.config.name, value: name };
    this.updateValue.emit(backValue);
  }


  public onKeyPress(e?, type?) {
    if (e.code === 'Enter') {
      //  console.log('Enter', type, 'beginValue', this.beginValue, 'endValue', this.endValue);
      this.assemblyValue();
    }
  }

  public onblur(e?, type?) {
    // console.log('onblur：', type, 'beginValue', this.beginValue, 'endValue', this.endValue);
    this.assemblyValue();

  }

  // 组装值
  public assemblyValue() {
    this.valueChange(this.model);
  }

}

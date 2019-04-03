import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'cn-form-electronic-scale',
  templateUrl: './cn-form-electronic-scale.component.html',
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
export class CnFormElectronicScaleComponent implements OnInit {
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

  public showModal() {
    const that = this;
    const ws = new WebSocket('ws://127.0.0.1:8086/ElectronicScale');
    ws.onopen = function() {
        // Web Socket 已连接上，使用 send() 方法发送数据
        // 连接服务端socket
        ws.send('客户端以上线');
        console.log('数据发送中...');
    };
    
    ws.onmessage = function (evt) { 
        const received_msg = evt.data;
        console.log('数据已接收...', received_msg);
        that.model =  received_msg;
        that.assemblyValue();

    };
    ws.onclose = function() { 
        // 关闭 websocket
        console.log('连接已关闭...'); 
    };
  }

}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cn-form-input-keyboard',
  templateUrl: './cn-form-input-keyboard.component.html',
  styleUrls: ['./cn-form-input-keyboard.component.less']
})
export class CnFormInputKeyboardComponent implements OnInit {
  public isVisible;

  constructor() { }

  ngOnInit() {
  }

  public showModal(): void {
    this.isVisible = true;
}
}

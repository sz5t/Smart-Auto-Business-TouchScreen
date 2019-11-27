import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bsn-ketboard',
  templateUrl: './bsn-ketboard.component.html',
  styleUrls: ['./bsn-ketboard.component.less']
})
export class BsnKetboardComponent implements OnInit {

  public model;
  constructor() { }

  ngOnInit() {
  }

  public SZ(e, value) {
    if (!this.model) {
      this.model = value.toString();
    } else {
      this.model += value.toString();
    }
  }

  public FH(e, fh) {
    if (fh === '.') {
      if (!this.model) {
        this.model = '0.';
      } else {
        const a = this.model.split('.');
        if (a.length > 1) {
          this.model = this.model;
        } else {
          this.model = this.model + '.';
        }
      }
    } else if (fh === '-') {
      if (!this.model) {

      } else {
        this.model = this.model.substring(0, this.model.length - 1);
      }
    }
  }

  public clear() {
    this.model = null;
  }
}

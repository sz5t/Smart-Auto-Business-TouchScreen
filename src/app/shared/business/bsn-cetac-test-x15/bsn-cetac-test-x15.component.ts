import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'bsn-cetac-test-x15',
  templateUrl: './bsn-cetac-test-x15.component.html',
  styleUrls: ['./bsn-cetac-test-x15.component.css']
})
export class BsnCETACTESTX15Component implements OnInit {
  @Input() 
  public config: any;

  public formGroup: FormGroup;
  constructor() { }

  public ngOnInit() {
  }

}

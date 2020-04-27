import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsnCETACTESTX15Component } from './bsn-cetac-test-x15.component';

describe('BsnCETACTESTX15Component', () => {
  let component: BsnCETACTESTX15Component;
  let fixture: ComponentFixture<BsnCETACTESTX15Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsnCETACTESTX15Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsnCETACTESTX15Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

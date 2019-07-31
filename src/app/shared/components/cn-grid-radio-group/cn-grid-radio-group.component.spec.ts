import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CnGridRadioGroupComponent } from './cn-grid-radio-group.component';

describe('CnGridRadioGroupComponent', () => {
  let component: CnGridRadioGroupComponent;
  let fixture: ComponentFixture<CnGridRadioGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CnGridRadioGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CnGridRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

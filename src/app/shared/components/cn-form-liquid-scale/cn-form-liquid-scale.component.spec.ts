import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CnFormLiquidScaleComponent } from './cn-form-liquid-scale.component';

describe('CnFormLiquidScaleComponent', () => {
  let component: CnFormLiquidScaleComponent;
  let fixture: ComponentFixture<CnFormLiquidScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CnFormLiquidScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CnFormLiquidScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsnShowImageComponent } from './bsn-show-image.component';

describe('BsnShowImageComponent', () => {
  let component: BsnShowImageComponent;
  let fixture: ComponentFixture<BsnShowImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsnShowImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsnShowImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

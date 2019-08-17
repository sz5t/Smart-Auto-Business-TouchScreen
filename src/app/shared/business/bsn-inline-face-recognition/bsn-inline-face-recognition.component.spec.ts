import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsnInlineFaceRecognitionComponent } from './bsn-inline-face-recognition.component';

describe('BsnInlineFaceRecognitionComponent', () => {
  let component: BsnInlineFaceRecognitionComponent;
  let fixture: ComponentFixture<BsnInlineFaceRecognitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsnInlineFaceRecognitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsnInlineFaceRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionReportComponent } from './subscription-report.component';

describe('SubscriptionReportComponent', () => {
  let component: SubscriptionReportComponent;
  let fixture: ComponentFixture<SubscriptionReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

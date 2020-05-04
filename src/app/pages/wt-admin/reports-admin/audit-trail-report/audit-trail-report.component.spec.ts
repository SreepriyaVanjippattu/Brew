import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTrailReportComponent } from './audit-trail-report.component';

describe('AuditTrailReportComponent', () => {
  let component: AuditTrailReportComponent;
  let fixture: ComponentFixture<AuditTrailReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditTrailReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditTrailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveClientUserReportComponent } from './active-client-user-report.component';

describe('ActiveClientUserReportComponent', () => {
  let component: ActiveClientUserReportComponent;
  let fixture: ComponentFixture<ActiveClientUserReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveClientUserReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveClientUserReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

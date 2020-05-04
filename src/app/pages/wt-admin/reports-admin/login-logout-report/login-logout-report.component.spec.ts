import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginLogoutReportComponent } from './login-logout-report.component';

describe('LoginLogoutReportComponent', () => {
  let component: LoginLogoutReportComponent;
  let fixture: ComponentFixture<LoginLogoutReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginLogoutReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginLogoutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

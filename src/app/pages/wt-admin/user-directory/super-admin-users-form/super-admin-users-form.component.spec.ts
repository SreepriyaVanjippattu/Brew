import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminUsersFormComponent } from './super-admin-users-form.component';

describe('SuperAdminUsersFormComponent', () => {
  let component: SuperAdminUsersFormComponent;
  let fixture: ComponentFixture<SuperAdminUsersFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminUsersFormComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminUsersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

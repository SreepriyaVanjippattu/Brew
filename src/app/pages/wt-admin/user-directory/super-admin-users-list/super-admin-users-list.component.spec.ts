import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminUsersListComponent } from './super-admin-users-list.component';

describe('SuperAdminUsersListComponent', () => {
  let component: SuperAdminUsersListComponent;
  let fixture: ComponentFixture<SuperAdminUsersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminUsersListComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

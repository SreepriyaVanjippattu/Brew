import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePrivilegesSuperAdminComponent } from './role-privileges-super-admin.component';

describe('RolePrivilegesSuperAdminComponent', () => {
  let component: RolePrivilegesSuperAdminComponent;
  let fixture: ComponentFixture<RolePrivilegesSuperAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolePrivilegesSuperAdminComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolePrivilegesSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

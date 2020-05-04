import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSuperAdminComponent } from './profile-super-admin.component';

describe('ProfileSuperAdminComponent', () => {
  let component: ProfileSuperAdminComponent;
  let fixture: ComponentFixture<ProfileSuperAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileSuperAdminComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

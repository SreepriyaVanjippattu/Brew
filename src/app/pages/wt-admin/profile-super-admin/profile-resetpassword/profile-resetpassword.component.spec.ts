import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileResetpasswordComponent } from './profile-resetpassword.component';

describe('ProfileResetpasswordComponent', () => {
  let component: ProfileResetpasswordComponent;
  let fixture: ComponentFixture<ProfileResetpasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileResetpasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileResetpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

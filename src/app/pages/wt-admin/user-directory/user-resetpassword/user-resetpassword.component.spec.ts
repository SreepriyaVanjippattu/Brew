import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResetpasswordComponent } from './user-resetpassword.component';

describe('UserResetpasswordComponent', () => {
  let component: UserResetpasswordComponent;
  let fixture: ComponentFixture<UserResetpasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserResetpasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserResetpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedClientsComponent } from './archived-clients.component';

describe('ArchivedClientsComponent', () => {
  let component: ArchivedClientsComponent;
  let fixture: ComponentFixture<ArchivedClientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivedClientsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

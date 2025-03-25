import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdminComponentComponent } from './user-admin-component.component';

describe('UserAdminComponentComponent', () => {
  let component: UserAdminComponentComponent;
  let fixture: ComponentFixture<UserAdminComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAdminComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAdminComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

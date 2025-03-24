import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioCrudComponent } from './studio-crud.component';

describe('StudioCrudComponent', () => {
  let component: StudioCrudComponent;
  let fixture: ComponentFixture<StudioCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudioCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

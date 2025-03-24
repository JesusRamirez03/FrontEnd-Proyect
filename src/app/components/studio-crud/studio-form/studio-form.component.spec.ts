import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioFormComponent } from './studio-form.component';

describe('StudioFormComponent', () => {
  let component: StudioFormComponent;
  let fixture: ComponentFixture<StudioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

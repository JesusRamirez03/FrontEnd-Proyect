import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenreCrudComponent } from './genre-crud.component';

describe('GenreCrudComponent', () => {
  let component: GenreCrudComponent;
  let fixture: ComponentFixture<GenreCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenreCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenreCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

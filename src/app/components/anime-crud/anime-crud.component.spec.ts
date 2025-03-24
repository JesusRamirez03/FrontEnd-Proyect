import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeCrudComponent } from './anime-crud.component';

describe('AnimeCrudComponent', () => {
  let component: AnimeCrudComponent;
  let fixture: ComponentFixture<AnimeCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimeCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimeCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

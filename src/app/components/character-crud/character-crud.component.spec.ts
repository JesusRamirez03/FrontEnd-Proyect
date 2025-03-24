import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterCrudComponent } from './character-crud.component';

describe('CharacterCrudComponent', () => {
  let component: CharacterCrudComponent;
  let fixture: ComponentFixture<CharacterCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

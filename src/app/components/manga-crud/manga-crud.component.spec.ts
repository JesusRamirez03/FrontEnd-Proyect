import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangaCrudComponent } from './manga-crud.component';

describe('MangaCrudComponent', () => {
  let component: MangaCrudComponent;
  let fixture: ComponentFixture<MangaCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MangaCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MangaCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

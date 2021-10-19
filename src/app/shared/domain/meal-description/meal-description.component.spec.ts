import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealDescriptionComponent } from './meal-description.component';

describe('MealDescriptionComponent', () => {
  let component: MealDescriptionComponent;
  let fixture: ComponentFixture<MealDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MealDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MealDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

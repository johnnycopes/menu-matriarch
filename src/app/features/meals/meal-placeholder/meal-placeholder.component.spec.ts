import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealPlaceholderComponent } from './meal-placeholder.component';

describe('MealPlaceholderComponent', () => {
  let component: MealPlaceholderComponent;
  let fixture: ComponentFixture<MealPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MealPlaceholderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MealPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

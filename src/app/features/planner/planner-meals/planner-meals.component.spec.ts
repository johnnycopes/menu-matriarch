import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerMealsComponent } from './planner-meals.component';

describe('PlannerMealsComponent', () => {
  let component: PlannerMealsComponent;
  let fixture: ComponentFixture<PlannerMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerMealsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

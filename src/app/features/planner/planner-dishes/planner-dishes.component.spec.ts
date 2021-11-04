import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerDishesComponent } from './planner-dishes.component';

describe('PlannerDishesComponent', () => {
  let component: PlannerDishesComponent;
  let fixture: ComponentFixture<PlannerDishesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerDishesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerDishesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

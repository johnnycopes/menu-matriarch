import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerDishComponent } from './planner-dish.component';

describe('PlannerDishComponent', () => {
  let component: PlannerDishComponent;
  let fixture: ComponentFixture<PlannerDishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerDishComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

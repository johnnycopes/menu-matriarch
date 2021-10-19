import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerDayComponent } from './planner-day.component';

describe('DayComponent', () => {
  let component: PlannerDayComponent;
  let fixture: ComponentFixture<PlannerDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

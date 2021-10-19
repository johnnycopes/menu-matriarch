import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerMenuComponent } from './planner-menu.component';

describe('PlannerMenuComponent', () => {
  let component: PlannerMenuComponent;
  let fixture: ComponentFixture<PlannerMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

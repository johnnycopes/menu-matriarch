import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishSummaryComponent } from './dish-summary.component';

describe('DishSummaryComponent', () => {
  let component: DishSummaryComponent;
  let fixture: ComponentFixture<DishSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DishSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DishSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

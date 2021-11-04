import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishPlaceholderComponent } from './dish-placeholder.component';

describe('DishPlaceholderComponent', () => {
  let component: DishPlaceholderComponent;
  let fixture: ComponentFixture<DishPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DishPlaceholderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DishPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

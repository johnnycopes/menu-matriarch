import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterableListComponent } from './filterable-list.component';

describe('FilterableListComponent', () => {
  let component: FilterableListComponent;
  let fixture: ComponentFixture<FilterableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterableListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

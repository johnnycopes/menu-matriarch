import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyViewPlaceholderComponent } from './empty-view-placeholder.component';

describe('EmptyViewPlaceholderComponent', () => {
  let component: EmptyViewPlaceholderComponent;
  let fixture: ComponentFixture<EmptyViewPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptyViewPlaceholderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyViewPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

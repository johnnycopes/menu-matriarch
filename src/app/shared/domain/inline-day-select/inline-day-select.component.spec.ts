import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDaySelectComponent } from './inline-day-select.component';

describe('InlineDaySelectComponent', () => {
  let component: InlineDaySelectComponent;
  let fixture: ComponentFixture<InlineDaySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineDaySelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDaySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

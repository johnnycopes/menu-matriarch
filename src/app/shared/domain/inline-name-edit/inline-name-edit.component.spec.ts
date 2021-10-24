import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineNameEditComponent } from './inline-name-edit.component';

describe('InlineNameEditComponent', () => {
  let component: InlineNameEditComponent;
  let fixture: ComponentFixture<InlineNameEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineNameEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineNameEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

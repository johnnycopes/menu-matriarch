import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsFormItemComponent } from './tags-form-item.component';

describe('TagsFormItemComponent', () => {
  let component: TagsFormItemComponent;
  let fixture: ComponentFixture<TagsFormItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagsFormItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsFormItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

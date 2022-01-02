import { TestBed } from '@angular/core/testing';

import { MealDocumentService } from './meal-document.service';

describe('MealDocumentService', () => {
  let service: MealDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

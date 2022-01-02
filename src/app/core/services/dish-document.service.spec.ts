import { TestBed } from '@angular/core/testing';

import { DishDocumentService } from './dish-document.service';

describe('DishDocumentService', () => {
  let service: DishDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DishDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

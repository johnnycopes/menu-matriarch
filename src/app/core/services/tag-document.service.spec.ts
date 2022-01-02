import { TestBed } from '@angular/core/testing';

import { TagDocumentService } from './tag-document.service';

describe('TagDocumentService', () => {
  let service: TagDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

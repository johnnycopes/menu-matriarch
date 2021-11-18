import { TestBed } from '@angular/core/testing';

import { DocRefService } from './doc-ref.service';

describe('DocRefService', () => {
  let service: DocRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocRefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

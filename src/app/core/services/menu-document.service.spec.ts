import { TestBed } from '@angular/core/testing';

import { MenuDocumentService } from './menu-document.service';

describe('MenuDocumentService', () => {
  let service: MenuDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

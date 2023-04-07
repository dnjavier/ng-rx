import { TestBed } from '@angular/core/testing';

import { F1DataService } from './f1-data.service';

describe('F1DataService', () => {
  let service: F1DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(F1DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

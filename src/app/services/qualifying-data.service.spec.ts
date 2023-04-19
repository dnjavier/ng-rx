import { TestBed } from '@angular/core/testing';

import { QualifyingDataService } from './qualifying-data.service';

describe('QualifyingDataService', () => {
  let service: QualifyingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QualifyingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { DriversDataService } from './drivers-data.service';

describe('F1DataService', () => {
  let service: DriversDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriversDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

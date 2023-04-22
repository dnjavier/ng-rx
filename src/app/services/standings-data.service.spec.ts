import { TestBed } from '@angular/core/testing';

import { StandingsDataService } from './standings-data.service';

describe('StandingsDataService', () => {
  let service: StandingsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandingsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

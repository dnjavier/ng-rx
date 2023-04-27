import { TestBed } from '@angular/core/testing';

import { QualifyingDataService } from './qualifying-data.service';
import { of } from 'rxjs';
import { mockSeasonQResults, mockSeasonRaces } from '../mocks/mockRaces';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { F1Service } from './f1.service';
import { RaceDataService } from './race-data.service';

fdescribe('QualifyingDataService', () => {
  let service: QualifyingDataService;
  let mockF1Service: Partial<F1Service> = {
    getQualifyingResultsInRaceAndSeason: () => of(mockSeasonQResults)
  }
  let mockRaceDataService: Partial<RaceDataService> = {
    getSeasonRaces: () => of(mockSeasonRaces)
  };
  let controls: PaginationControls = {
    page: 1,
    itemsQty: 10,
    start: 0,
    end: 10
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {
        provide: F1Service,
        useValue: mockF1Service
      }, {
        provide: RaceDataService,
        useValue: mockRaceDataService
      } ]
    });
    service = TestBed.inject(QualifyingDataService);
  });

  it('should call getResults and return Observable<QualifyingResults[]>', (done: DoneFn) => {
    service.getResults(controls).subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      done();
    });
  });
});

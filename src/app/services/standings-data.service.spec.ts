import { TestBed } from '@angular/core/testing';
import { StandingsDataService } from './standings-data.service';
import { F1Service } from './f1.service';
import { of } from 'rxjs';
import { mockStandings } from '../mocks/mockDrivers';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { RaceDataService } from './race-data.service';
import { mockSeasonRaces } from '../mocks/mockRaces';

describe('StandingsDataService', () => {
  let service: StandingsDataService;
  let mockF1Service: Partial<F1Service> = {
    getDriverStandings: () => of(mockStandings)
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
    service = TestBed.inject(StandingsDataService);
  });

  it('should call getStandings and return Observable<DriverStandings[]>', (done: DoneFn) => {
    service.getStandings(controls).subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      done();
    });
  });
});

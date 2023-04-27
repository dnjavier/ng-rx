import { TestBed } from '@angular/core/testing';

import { RaceDataService } from './race-data.service';
import { F1Service } from './f1.service';
import { mockSeasonRaceResults, mockSeasonRaces } from '../mocks/mockRaces';
import { of } from 'rxjs';

fdescribe('RaceDataService', () => {
  let service: RaceDataService;
  let mockF1Service: Partial<F1Service> = {
    getRacesPerSeason: () => of(mockSeasonRaces),
    getRaceResultsInSeason: () => of(mockSeasonRaceResults)
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ { provide: F1Service, useValue: mockF1Service } ]
    });
    service = TestBed.inject(RaceDataService);
  });

  it('should call getRaceResults and return Observable<Race[]>', (done: DoneFn) => {
    service.getRaceResults('2018', '1').subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should call getRaces and return Observable<Race[]>', (done: DoneFn) => {
    service.getRaces(1, 1, 0).subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should call requestRaces and return Observable<Race[]>', (done: DoneFn) => {
    service.requestRaces(2018, 1, 0).subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should call getSeasonRaces and return Observable<SeasonRaces>', (done: DoneFn) => {
    service.getSeasonRaces(2018, 1).subscribe(result => {
      expect(result).toBeDefined();
      done();
    });
  });
});

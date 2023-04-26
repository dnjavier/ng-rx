import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { mockDriverTable, mockSeasonDrivers, mockStandings } from '../mocks/mockDrivers';

import { F1Service } from './f1.service';
import { mockSeasonQResults, mockSeasonRaceResults, mockSeasonRaces } from '../mocks/mockRaces';
import { mockStatus } from '../mocks/mockStatus';

fdescribe('F1Service', () => {
  let service: F1Service;
  let httpController: HttpTestingController;
  let url = 'http://ergast.com/api/f1';
  let season = 2018;
  let round = 1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(F1Service);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should call getDriversPerSeason and return a DriverTable', () => {
    service.getDriversPerSeason(season).subscribe((res) => {
      expect(res).toEqual(mockDriverTable);
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${url}/${season}/drivers.json`
    });

    req.flush(mockSeasonDrivers);
  });

  it('should call getRacesPerSeason and return a SeasonRaces', () => {
    service.getRacesPerSeason(season, 1, 0).subscribe((res) => {
      expect(res).toEqual(mockSeasonRaces);
    });

    const req = httpController.expectOne({
      method: 'GET',
      url: `${url}/${season}.json?limit=1&offset=0`
    });

    req.flush(mockSeasonRaces);
  });

  it('should call getRaceResultsInSeason and return a SeasonRacesResults', () => {
    service.getRaceResultsInSeason(season + '', round + '').subscribe((res) => {
      expect(res).toEqual(mockSeasonRaceResults);
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${url}/${season}/${round}/results.json`
    });

    req.flush(mockSeasonRaceResults);
  });

  it('should call getQualifyingResultsInRaceAndSeason and return a SeasonQualifyingResults', () => {
    service.getQualifyingResultsInRaceAndSeason(season, round, 1, 0).subscribe((res) => {
      expect(res).toEqual(mockSeasonQResults);
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${url}/${season}/${round}/qualifying.json?limit=1&offset=0`
    });

    req.flush(mockSeasonQResults);
  });

  it('should call getDriverStandings and return a Standings', () => {
    service.getDriverStandings(season, round, 1, 0).subscribe((res) => {
      expect(res).toEqual(mockStandings);
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${url}/${season}/${round}/driverStandings.json?limit=1&offset=0`
    });

    req.flush(mockStandings);
  });

  it('should call getStatus and return a Status', () => {
    service.getStatus(season + '', round).subscribe((res) => {
      expect(res).toEqual(mockStatus);
    });
    const req = httpController.expectOne({
      method: 'GET',
      url: `${url}/${season}/${round}/status.json`
    });

    req.flush(mockStatus);
  });
});

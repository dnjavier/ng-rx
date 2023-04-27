import { TestBed } from '@angular/core/testing';
import { DriversDataService } from './drivers-data.service';
import { mockDriverTable } from '../mocks/mockDrivers';
import { F1Service } from './f1.service';
import { of } from 'rxjs';

fdescribe('F1DataService', () => {
  let service: DriversDataService;
  let mockF1Service: Partial<F1Service> = {
    getDriversPerSeason: (year: number) => of(mockDriverTable)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ { provide: F1Service, useValue: mockF1Service } ]
    });
    service = TestBed.inject(DriversDataService);
  });

  it('should call driversSeason$ and return DriverSeason[]', (done: DoneFn) => {
    service.driversSeason$.subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      done();
    }); 
  });
});

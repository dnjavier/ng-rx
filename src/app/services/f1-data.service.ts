import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, forkJoin, share, map } from 'rxjs';
import { F1Service } from './f1.service';
import { DriverTable } from '../utils/driver-table.interface';
import { DriverSeason } from '../utils/drivers-season.interface';
import { GlobalConstants } from '../utils/global-constants';

@Injectable({
  providedIn: 'root'
})
export class F1DataService {

  private driversSeasonSubject = new BehaviorSubject<DriverTable[]>([]);
  driversSeason$: Observable<DriverSeason[]> = this.driversSeasonSubject.asObservable().pipe(
    switchMap(() => {
      return forkJoin(GlobalConstants.seasons.map(year => this.f1Service.getDriversPerSeason(year)));
    }),
    map(data => {
      return this.parseDriverTables(data);
    }),
    share()
  );

  constructor(private f1Service: F1Service) { }

  /**
   * Creates a list of objects with the seasons and
   * its drivers based on the api response.
   * 
   * @param driverTables - A list of each season with its drivers
   * @return A list of all drivers with its season
   */
  private parseDriverTables(driverTables: DriverTable[]): DriverSeason[] {
    const driversSeason: DriverSeason[] = [];
    for (let i = 0; i < driverTables.length; i++) {
      for (let j = 0; j < driverTables[i].Drivers.length; j++) {
        driversSeason.push({
          name: driverTables[i].Drivers[j].givenName + ' ' + driverTables[i].Drivers[j].familyName,
          season: driverTables[i].season
        });
      }
    }

    return driversSeason;
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, forkJoin, share } from 'rxjs';
import { F1Service } from './f1.service';
import { DriverTable } from '../utils/driver-table.interface';

@Injectable({
  providedIn: 'root'
})
export class F1DataService {

  private seasons = ['2018', '2019', '2020', '2021', '2022'];

  private driversSeasonSubject = new BehaviorSubject<DriverTable[]>([]);
  driversSeason$: Observable<DriverTable[]> = this.driversSeasonSubject.asObservable().pipe(
    switchMap(() => {
      return forkJoin(this.seasons.map(year => this.f1Service.getDriversPerSeason(year)));
    }),
    share()
  );

  constructor(private f1Service: F1Service) { }

}

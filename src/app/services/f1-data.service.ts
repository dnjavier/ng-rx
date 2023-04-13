import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, forkJoin, share, map, tap } from 'rxjs';
import { F1Service } from './f1.service';
import { DriverTable } from '../utils/driver-table.interface';
import { DriverSeason } from '../utils/drivers-season.interface';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { Race } from '../utils/race.interface';
import { SeasonRaces } from '../utils/season-races.interface';

@Injectable({
  providedIn: 'root'
})
export class F1DataService {

  public defaultPagination: PaginationControls = {
    page: 1,
    itemsQty: 10,
    start: 0,
    end: 10
  };
  private seasons = ['2018', '2019', '2020', '2021', '2022'];

  private storedRacesResultsSubject = new BehaviorSubject<Race[]>([]);
  private storedRacesSubject = new BehaviorSubject<SeasonRaces[]>([]);
  private driversSeasonSubject = new BehaviorSubject<DriverTable[]>([]);

  driversSeason$: Observable<DriverSeason[]> = this.driversSeasonSubject.asObservable().pipe(
    switchMap(() => {
      return forkJoin(this.seasons.map(year => this.f1Service.getDriversPerSeason(year)));
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

  public getRaceResults(season: string, round: string): Observable<Race[]> {
    const storedResults = this.storedRacesResultsSubject.getValue();
    const isStored = storedResults.find(race => (race.round === round && race.season === season));
    if (isStored) {
      return this.storedRacesResultsSubject.asObservable().pipe(
        map(result => {
          return result.filter(r => (r.season === season && r.round === round));
        })
      );
    } else {
      return this.requestRaceResults(season, round);
    }
  }
  
  private requestRaceResults(season: string, round: string): Observable<Race[]> {
    return this.f1Service.getRaceResultsInSeason(season, round).pipe(
      tap(data => {
        const newResults = data.MRData.RaceTable.Races[0];
        const existingResults = this.storedRacesResultsSubject.getValue();
        existingResults.push(newResults);
        this.storedRacesResultsSubject.next(existingResults)
      }),
      map(data => data.MRData.RaceTable.Races)
    );
  }

  public getRaces(season: string, limit: number, offset: number): Observable<Race[]> {
    const storedRaces = this.storedRacesSubject.getValue();
    const isStored = storedRaces.find(race => (
      race.MRData.RaceTable.season === season &&
      Number(race.MRData.limit) === limit &&
      Number(race.MRData.offset) === offset
      ));
    if (isStored) {
      return this.storedRacesSubject.asObservable().pipe(
        map(races => {
          let allRaces: Race[] = [];
          for (let i = 0; i < races.length; i++) {
            allRaces = allRaces.concat(races[i].MRData.RaceTable.Races);
          }
          console.log('allRaces stored', allRaces);
          return allRaces.slice(offset, limit + offset);
        })
      );
    } else {
      // TO-DO: make validation to make extra request when has reached the limit of races
      // while going to next pages.
      return this.requestRaces(season, limit, offset);
    }
  }

  private requestRaces(season: string, limit: number, offset: number): Observable<Race[]> {
    return this.f1Service.getRacesPerSeason(season, limit, offset).pipe(
      tap(data => {
        const newData = data;
        const existingData = this.storedRacesSubject.getValue();
        existingData.push(newData);
        this.storedRacesSubject.next(existingData);
      }),
      map(data => data.MRData.RaceTable.Races)
    );
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, forkJoin, share, map, tap, combineLatest } from 'rxjs';
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

  private isRacePendingSubject = new BehaviorSubject<boolean>(true);
  isRacePending$: Observable<boolean> = this.isRacePendingSubject.asObservable();

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

  /**
   * Based on the params, it looks for stored data if not, it returns
   * an observable request to the API.
   * 
   * @param season 
   * @param round 
   * @returns a list of all the results from a race in a season
   */
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
  
  /**
   * Makes a request to the API, once it got the response, it
   * stored the data locally.
   *
   * @param season 
   * @param round 
   * @returns API request with results data
   */
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

  /**
   * Determines what Races should be returned based on the stored values.
   * If values are not stored, return a request to the API, if values
   * are return by the API are not enough to complete pagination, it
   * returns 2 requests combined.
   * 
   * @param page
   * @param limit 
   * @param offset 
   * @returns Observable with data stored or request to API
   */
  public getRaces(page: number, limit: number, offset: number): Observable<Race[]> {
    const storedRaces = this.storedRacesSubject.getValue();
    const allRaces = this.getAllRaces();
    const lastSeasonStored = Number(allRaces[allRaces.length - 1]?.season);
    const lastTotal = Number(storedRaces[storedRaces.length - 1]?.MRData.total);
    const allRacesLastSeason = allRaces.filter(r => Number(r.season) === lastSeasonStored);

    if (this.isDataStored(page, limit, allRaces, lastSeasonStored, lastTotal)) {
      return this.storedRacesSubject.asObservable().pipe(
        map(races => {
          return allRaces.slice(offset, limit + offset);
        })
      );
    } else if (this.isCombinedRequest(page, limit, allRacesLastSeason, lastSeasonStored, lastTotal)) {
      const season = (lastSeasonStored ? lastSeasonStored : Number(this.seasons[0]));
      const newLimit = lastTotal - allRacesLastSeason.length;
      return combineLatest([
        this.requestRaces(season + '', limit, allRacesLastSeason.length),
        this.requestRaces((season + 1) + '', limit - newLimit, 0)]).pipe(
          map(data => {
            return data[0].concat(data[1]);
          })
        );

    } else {
      const season = (lastSeasonStored ? lastSeasonStored : this.seasons[0]) + '';
      return this.requestRaces(season, limit, allRacesLastSeason.length);
    }
  }

  /**
   * Makes request to the API and when gets the data,
   * stores the reponse in a subject locally. Update 
   * property to determine if there are pending races.
   *
   * @param season 
   * @param limit 
   * @param offset 
   * @returns http request as observable
   */
  private requestRaces(season: string, limit: number, offset: number): Observable<Race[]> {
    return this.f1Service.getRacesPerSeason(season, limit, offset).pipe(
      tap(data => {
        const newData = data;
        const existingData = this.storedRacesSubject.getValue();
        existingData.push(newData);
        this.storedRacesSubject.next(existingData);

        const lastSeason = this.seasons[this.seasons.length - 1];
        const lengthRacesLastSeason = offset + data.MRData.RaceTable.Races.length;
        if (lastSeason === data.MRData.RaceTable.season && lengthRacesLastSeason === Number(data.MRData.total)) {
          // all races has been requested to the API
          this.isRacePendingSubject.next(false);
        } else {
          this.isRacePendingSubject.next(true);
        }
      }),
      map(data => data.MRData.RaceTable.Races)
    );
  }

  /**
   * Validates data obtained from previous requests, in 
   * order to determine if it is alraeady stored.
   * 
   * @param page 
   * @param limit 
   * @param allRaces 
   * @param lastSeasonStored 
   * @param lastTotal 
   * @returns true if data is stored
   */
  private isDataStored(page: number, limit: number, allRaces: Race[], lastSeasonStored: number, lastTotal: number): boolean {
    const lastSeason = Number(this.seasons[this.seasons.length - 1]);
    const isStored = page * limit <= allRaces.length;
    const allRacesLastSeason = allRaces.filter(r => Number(r.season) === lastSeasonStored);

    if (lastSeason === lastSeasonStored && allRacesLastSeason.length === lastTotal) {
      // all races has been requested to the API
      this.isRacePendingSubject.next(false);
    } else {
      this.isRacePendingSubject.next(true);
    }

    if (isStored || (lastSeason === lastSeasonStored && lastTotal === allRaces.length)) {
      return true;
    }
    return false;
  }

  /**
   * Validates existing data plus values in upcoming request
   * to determine if it is needed an extra request to complete
   * data for pagination.
   * 
   * @param page 
   * @param limit 
   * @param allRacesLastSeason 
   * @param lastSeasonStored 
   * @param lastTotal 
   * @returns 
   */
  private isCombinedRequest(page: number, limit: number, allRacesLastSeason: Race[], lastSeasonStored: number, lastTotal: number): boolean {
    const lastSeason = Number(this.seasons[this.seasons.length - 1]);

    if ((lastTotal - allRacesLastSeason.length) < limit &&
      lastTotal <= (allRacesLastSeason.length + limit) &&
      lastSeasonStored < lastSeason && page * limit > lastTotal) {
      return true;
    }
    return false;
  }

  /**
   * Loops through all previous requests in oder to
   * make an array with all stored races.
   * 
   * @returns List of all races from all seasons
   */
  private getAllRaces(): Race[] {
    const storedRaces = this.storedRacesSubject.getValue();
    let allRaces: Race[] = [];
    for (let i = 0; i < storedRaces.length; i++) {
      allRaces = allRaces.concat(storedRaces[i].MRData.RaceTable.Races);
    }
    return allRaces;
  }
}

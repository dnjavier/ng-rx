import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Race } from '../utils/race.interface';
import { SeasonRaces } from '../utils/season-races.interface';
import { F1Service } from './f1.service';
import { GlobalConstants } from '../utils/global-constants';
import { Helper } from '../utils/helper.class';

@Injectable({
  providedIn: 'root'
})
export class RaceDataService {

  private storedRacesResultsSubject = new BehaviorSubject<Race[]>([]);
  private storedRacesSubject = new BehaviorSubject<SeasonRaces[]>([]);
  private previousRaceTotal = 0;
  private storeRaces: Race[] = [];

  private isRacePendingSubject = new BehaviorSubject<boolean>(true);
  isRacePending$: Observable<boolean> = this.isRacePendingSubject.asObservable();

  constructor(private f1Service: F1Service) { }

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
    const lastSeasonStored = Number(this.storeRaces[this.storeRaces.length - 1]?.season);
    let season = (lastSeasonStored ? lastSeasonStored : GlobalConstants.seasons[0]);
    const allRacesLastSeason = this.storeRaces.filter(r => Number(r.season) === lastSeasonStored);

    // Returns data that is stored locally
    if (this.isDataStored(page, limit, this.storeRaces, lastSeasonStored, this.previousRaceTotal)) {
      return of(this.storeRaces.slice(offset, limit + offset));
    }
    
    if (page === 1 && this.storeRaces.length > 0) {
      limit = limit - this.storeRaces.length;
    }
    if (allRacesLastSeason.length && allRacesLastSeason.length === this.previousRaceTotal) {
      season ++;
      offset = 0;
    } else {
      offset = allRacesLastSeason.length
    }

    return this.f1Service.getRacesPerSeason(season, limit, offset).pipe(
      switchMap(data => {
        this.previousRaceTotal = Number(data.MRData.total);
        const newLimit = limit + offset - this.previousRaceTotal;
        
        if (newLimit > 0 && season < Helper.lastSeason) {
          season ++;
          return forkJoin([
            of(data),
            this.f1Service.getRacesPerSeason(season, newLimit, 0).pipe(
              tap(data => this.previousRaceTotal = Number(data.MRData.total))
            )
          ])
        }
        return forkJoin([of(data)]);
      }),
      map(data => {
        let races: Race[] = [];
        for (let i = 0; i < data.length; i++) {
          races = races.concat(data[i].MRData.RaceTable.Races);
        }
        this.storeRaces = this.storeRaces.concat(races);

        const allRacesLastSeason = this.storeRaces.filter(r => Number(r.season) === Helper.lastSeason);
        if (this.previousRaceTotal === allRacesLastSeason.length) {
          this.isRacePendingSubject.next(false);
        }
        if (page === 1) {
          return this.storeRaces;
        }
        return races;
      })
    )
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
  public requestRaces(season: number, limit: number, offset: number): Observable<Race[]> {
    return this.f1Service.getRacesPerSeason(season, limit, offset).pipe(
      tap(data => {
        const newData = data;
        const existingData = this.storedRacesSubject.getValue();
        existingData.push(newData);
        this.storedRacesSubject.next(existingData);

        const lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];
        const lengthRacesLastSeason = offset + data.MRData.RaceTable.Races.length;
        if (lastSeason === Number(data.MRData.RaceTable.season) && lengthRacesLastSeason === Number(data.MRData.total)) {
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
   * Makes request to the API and when gets the data,
   * stores the reponse in a subject locally.
   * 
   * @param season 
   * @returns http request as observable
   */
  public getSeasonRaces(season: number, limit: number): Observable<SeasonRaces> {
    const seasonRace = this.storedRacesSubject.getValue().find(r => r.MRData.RaceTable.season === (season + ''));
    if (seasonRace) {
      return of(seasonRace);
    }

    return this.f1Service.getRacesPerSeason(season, limit).pipe(
      tap(data => this.storedRacesSubject.next([data]))
    );
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
    const isStored = page * limit <= allRaces.length;
    const allRacesLastSeason = allRaces.filter(r => Number(r.season) === lastSeasonStored);

    if (isStored) {
      this.isRacePendingSubject.next(true);
      return true;
    } else if (Helper.lastSeason === lastSeasonStored && lastTotal === allRacesLastSeason.length) {
      this.isRacePendingSubject.next(false);
      return true
    }
    return false;
  }
}

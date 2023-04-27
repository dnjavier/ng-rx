import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { SeasonQualifyingResults } from '../utils/season-qualifying.interface';
import { Race } from '../utils/race.interface';
import { F1Service } from './f1.service';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { SeasonRaces } from '../utils/season-races.interface';
import { GlobalConstants } from '../utils/global-constants';
import { QualifyingResults } from '../utils/qualifying-results.interface';
import { Helper } from '../utils/helper.class';
import { RaceDataService } from './race-data.service';

@Injectable({
  providedIn: 'root'
})
export class QualifyingDataService {

  private isResultsPendingSubject = new BehaviorSubject<boolean>(true);
  private latestRequest!: SeasonQualifyingResults;
  private latestSeasonRequest!: SeasonRaces;
  private latestSeasonRequested = GlobalConstants.seasons[0];
  private latestRound = 1;
  private storedAllRaces: Race[] = [];
  private storedAllQResults: QualifyingResults[] = [];
  private storedResultsLastRound: Race[] = [];

  isResultsPending$: Observable<boolean> = this.isResultsPendingSubject.asObservable();

  constructor(private f1Service: F1Service,
    private raceService: RaceDataService) { }

  /**
   * Get race to know the rounds per season and validate if
   * request has been made previosuly, then switch to request
   * that returns qualifying results.
   * 
   * @param controls
   * @returns Race observable with Qualifying results
   */
  public getResults(controls: PaginationControls): Observable<QualifyingResults[]> {
    const season = this.latestSeasonRequested ? this.latestSeasonRequested : GlobalConstants.seasons[0];

    return this.raceService.getSeasonRaces(season, 1).pipe(
      tap(data => this.latestSeasonRequest = data),
      switchMap(data => this.getRacesResult(controls, data))
    );
  }

  /**
   * Based on the pagination controls, return an observable with
   * Qualifying results that are stored, if not, return the request.
   * 
   * @param controls - From pagination
   * @param seasonRace 
   * @returns 
   */
  private getRacesResult(controls: PaginationControls, seasonRace: SeasonRaces): Observable<QualifyingResults[]> {
    let season = Number(seasonRace.MRData.RaceTable.season);
    const resultsLastestRound = this.storedAllQResults.filter(r => Number(r.season) === season && r.round === this.latestRound);

    const storedData = this.getStoredData(controls, season, resultsLastestRound);
    if (storedData.length) {
      return of(storedData);
    }

    let offset = Helper.calcOffset(this.storedAllQResults, this.latestSeasonRequested, this.latestRound);

    // Increment season when all rounds have been requested
    if (this.latestRound === Number(this.latestSeasonRequest?.MRData.total) &&
        resultsLastestRound.length === Number(this.latestRequest?.MRData.total) &&
        season < Helper.lastSeason) {
      season++;
      this.latestSeasonRequested ++;
      this.latestRound = 1;
      offset = 0;
      this.storedResultsLastRound = [];
    }

    // Reset offset and result if is requesting next page
    if (this.latestRound < Number(this.latestSeasonRequest?.MRData.total) &&
      resultsLastestRound.length === Number(this.latestRequest?.MRData.total) &&
      offset >= Number(this.latestRequest?.MRData.total)) {
      this.latestRound++;
      offset = 0;
      this.storedResultsLastRound = [];
    }

    const limit = Helper.calcLimit(controls, resultsLastestRound.length);

    return this.f1Service.getQualifyingResultsInRaceAndSeason(season, this.latestRound, limit, offset).pipe(
      tap(data => Helper.updatePendingData(
                            this.latestSeasonRequest?.MRData.total,
                            this.isResultsPendingSubject,
                            data.MRData.RaceTable.Races[0]?.QualifyingResults,
                            data.MRData.RaceTable.round,
                            data.MRData.RaceTable.season,
                            data.MRData.total)),
      switchMap(data => {
        return this.addNewRequest([data], season, this.latestSeasonRequest?.MRData.total)
      }),
      switchMap(data => this.addNewRequest(data, season, this.latestSeasonRequest?.MRData.total)),
      tap(data => this.storeRacesAndResults(data)),
      map(data => {
        if (controls.page > 1) {
          return this.storedAllQResults.slice((controls.page - 1) * controls.itemsQty);
        } else {
          return this.storedAllQResults.slice(-controls.itemsQty)
        }
      })
    );
  }

  /**
   * Based on the API response, store races and 
   * results in local variables.
   * 
   * @param data new data from API
   */
  private storeRacesAndResults(data: SeasonQualifyingResults[]): void  {
    this.latestRequest = data[0];
    for (let i = 0; i < data.length; i++) {
      // Store races
      const races = data[i].MRData.RaceTable.Races;
      this.storedAllRaces = this.storedAllRaces.concat();

      if (this.latestRound === Number(data[i].MRData.RaceTable.round)) {
        this.storedResultsLastRound = this.storedResultsLastRound.concat(data[i].MRData.RaceTable.Races);
      }
      
      // Store Qualifying results from all races
      for (let j = 0; j < races.length; j++) {
        const qResults = races[j].QualifyingResults;
        if (qResults) {
          qResults.map(q => {
            q.season = races[j].season;
            q.raceName = races[j].raceName;
            q.round = Number(races[j].round);
            this.storedAllQResults.push(q);
          })
        }
      }
    }
  }

  /**
   * Based on the most recent request, determines if
   * an extra request is needed.
   * 
   * @param data - latest API response
   * @param season - previous season requested
   * @param totalRounds - rounds in season
   * @returns a observable with a list
   */
  private addNewRequest(data: SeasonQualifyingResults[], season: number, totalRounds: string): Observable<SeasonQualifyingResults[]> {
    const reqList: Observable<SeasonQualifyingResults>[] = [];

    for (let i = 0; i < data.length; i++) {
      reqList.push(of(data[i]));

      const limit = Number(data[i].MRData.limit);
      const offset = Number(data[i].MRData.offset);
      const total = Number(data[i].MRData.total);
      const newLimit = limit + offset - total;
    
      // if in the last response items are not enough to complete QTY of items in page
      if (newLimit > 0 && this.isResultsPendingSubject.getValue() && i === data.length - 1) {
        const list = data[i].MRData.RaceTable.Races[0]?.QualifyingResults;
        const lastStanding = list ? list[list.length - 1]?.position : '1';
        const lastRound = data[i].MRData.RaceTable.round;
        const newSeason = Helper.calcSeason(totalRounds, lastRound, lastStanding, total + '', season);

        if (lastStanding === total + '') {
          this.latestRound++;
        }
        if (newSeason > season) {
          this.latestSeasonRequested ++;
          this.latestRound = 1;
        }

        reqList.push(this.f1Service.getQualifyingResultsInRaceAndSeason(newSeason, this.latestRound, newLimit, 0));
      }
    }
    return forkJoin(reqList);
  }

  /**
   * Based on the existing stored values and the 
   * pagination, determines if values have already 
   * been requested.
   * 
   * @param controls - From pagination
   * @returns stored data items
   */
  private getStoredData(controls: PaginationControls, season: number, resultsLastestRound: QualifyingResults[]): QualifyingResults[] {
    const isAllDataStored = this.storedAllQResults &&
      this.storedAllQResults[this.storedAllQResults.length - 1]?.season === Helper.lastSeason + '' &&
      this.storedAllQResults[this.storedAllQResults.length - 1]?.round === Number(this.latestSeasonRequest?.MRData.total) &&
      resultsLastestRound.length === Number(this.latestRequest?.MRData.total);

    // is data stored
    if (controls.page * controls.itemsQty <= this.storedAllQResults.length && !isAllDataStored) {
      const results = this.storedAllQResults.slice(controls.start, controls.end);
      this.isResultsPendingSubject.next(true);
      return results;

    // has all data stored
    } else if (this.storedAllQResults &&
              this.storedAllQResults[this.storedAllQResults.length - 1]?.season === Helper.lastSeason + '' &&
              this.storedAllQResults[this.storedAllQResults.length - 1]?.round === Number(this.latestSeasonRequest?.MRData.total) &&
              resultsLastestRound.length === Number(this.latestRequest?.MRData.total)) {
      this.isResultsPendingSubject.next(false);
      const start = (controls.page - 1) * controls.itemsQty;
      const results = this.storedAllQResults.slice(start);
      return results;
    }
    return [];
  }
}

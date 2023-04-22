import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { SeasonQualifyingResults } from '../utils/season-qualifying.interface';
import { QualifyingResults, Race } from '../utils/race.interface';
import { F1Service } from './f1.service';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { SeasonRaces } from '../utils/season-races.interface';
import { GlobalConstants } from '../utils/global-constants';

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

  constructor(private f1Service: F1Service) { }

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

    if (Number(this.latestSeasonRequest?.MRData.RaceTable.season) === season) {
      return this.getRacesResult(controls, this.latestSeasonRequest)
    } else {
      // Get only first race of the season
      return this.f1Service.getRacesPerSeason(season, 1, 0).pipe(
        tap(data => {
          this.latestSeasonRequest = data;
        }),
        switchMap(data => {
          return this.getRacesResult(controls, data)
        })
      );
    }
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
    // is data stored
    if (controls.page * controls.itemsQty <= this.storedAllQResults.length) {
      return of(this.storedAllQResults.slice(controls.start, controls.end));
    }

    let offset = this.getOffset();
    let season = Number(seasonRace.MRData.RaceTable.season);
    const lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];

    // Increment season when all rounds have been requested
    const resultsLastestRound = this.storedAllQResults.filter(r => Number(r.season) === season && r.round === this.latestRound);
    if (this.latestRound === Number(this.latestSeasonRequest?.MRData.total) &&
        resultsLastestRound.length === Number(this.latestRequest?.MRData.total) &&
        season < lastSeason) {
      season++;
      this.latestSeasonRequested ++;
      this.latestRound = 1;
      offset = 0;
      this.storedResultsLastRound = [];
    }

    // Reset offset and result if is requesting next page
    if (this.latestRound < Number(this.latestSeasonRequest?.MRData.total) &&
      offset >= Number(this.latestRequest?.MRData.total)) {
      this.latestRound++;
      offset = 0;
      this.storedResultsLastRound = [];
    }

    return this.f1Service.getQualifyingResultsInRaceAndSeason(season, this.latestRound, this.getLimit(controls), offset).pipe(
      tap(data => {
        this.latestRequest = data;
        this.updatePendingData(data, lastSeason);
      }),
      switchMap(data => {
        const limit = Number(data.MRData.limit);
        const offset = Number(data.MRData.offset);
        const total = Number(data.MRData.total);

        // if the last response items are not enough to complete QTY of items in page
        if ((limit + offset) > total && this.isResultsPendingSubject.getValue()) {
          this.latestRound++;
          return forkJoin([of(data), this.f1Service.getQualifyingResultsInRaceAndSeason(season, this.latestRound, (limit + offset - total), 0)])
        } else {
          return forkJoin([of(data)]);
        }
      }),
      tap(data => {
        this.storeRacesAndResults(data);
      }),
      map(data => {
        // return the last items in all results
        let results = this.storedAllQResults.slice(-controls.itemsQty);
        return results;
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
   * Based on the existing results and the last round,
   * determines which is starting index for the next values
   * 
   * @returns starting index for the next set of results
   */
  private getOffset(): number {
    let offset = 0;
    if (this.storedResultsLastRound.length) {
      this.storedResultsLastRound.map(data => {
        if (data.QualifyingResults) {
          offset += data.QualifyingResults?.length;
        }
      });
    }
    return offset;
  }

  /**
   * Based on the pagination controls and the
   * stored results, determines the new limit.
   * 
   * @param controls Pagination controls
   * @returns limit
   */
  private getLimit(controls: PaginationControls): number {
    let limit = controls.itemsQty;
    if (controls.page === 1) {
      let allResultsRoundLength = 0;
      this.storedResultsLastRound.map(r => {
        if (r.QualifyingResults) {
          allResultsRoundLength += r.QualifyingResults?.length;
        }
      });
      if (allResultsRoundLength && allResultsRoundLength < limit) {
        limit -= allResultsRoundLength;
      }
    }
    return limit;
  }

  /**
   * Based on the values that are being returned, update
   * the isPendingResults subject accordingly.
   *
   * @param data
   * @param lastSeason 
   */
  private updatePendingData(data: SeasonQualifyingResults, lastSeason: number): void {
    let allResultsRoundLength = 0;
    this.storedResultsLastRound.map(r => {
      if (r.QualifyingResults) {
        allResultsRoundLength += r.QualifyingResults?.length;
      }
    });
    if (Number(data.MRData.RaceTable.season) === lastSeason &&
        data.MRData.RaceTable.round === this.latestSeasonRequest.MRData.total &&
        Number(data.MRData.total) === allResultsRoundLength) {
        // Has requested all results from last round in last season
      this.isResultsPendingSubject.next(false);
    } else {
      const existingValue = this.isResultsPendingSubject.getValue();
      if (!existingValue) {
        this.isResultsPendingSubject.next(true);
      }
    }
  }
}

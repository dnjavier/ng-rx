import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { SeasonQualifyingResults } from '../utils/season-qualifying.interface';
import { Race } from '../utils/race.interface';
import { F1Service } from './f1.service';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { SeasonRaces } from '../utils/season-races.interface';
import { GlobalConstants } from '../utils/global-constants';

@Injectable({
  providedIn: 'root'
})
export class QualifyingDataService {

  private storedRequestsSubject = new BehaviorSubject<SeasonQualifyingResults[]>([]);
  private storedResultsSubject = new BehaviorSubject<Race[]>([]);
  private isResultsPendingSubject = new BehaviorSubject<boolean>(true);
  private latestRequest!: SeasonQualifyingResults;
  private latestSeasonRequest!: SeasonRaces;
  private latestSeasonRequested!: number;
  private latestRound = 1;
  private storedAllRaces: Race[] = [];
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
  public getResults(controls: PaginationControls): Observable<Race[]> {
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

  private getRacesResult(controls: PaginationControls, seasonRace: SeasonRaces): Observable<Race[]> {
    let offset = this.getOffset();
    let season = Number(seasonRace.MRData.RaceTable.season);
    const lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];

    // Validate when season needs to be incremented
    if (this.latestRound === Number(this.latestSeasonRequest?.MRData.total) &&
        season < lastSeason) {
      season++;
      this.latestSeasonRequested ++;
      this.latestRound = 1;
      offset = 0;
      this.storedResultsLastRound = [];
    }

    if (this.latestRound < Number(this.latestSeasonRequest?.MRData.total) &&
      offset >= Number(this.latestRequest?.MRData.total)) {
      this.latestRound++;
      offset = 0;
      this.storedResultsLastRound = [];
    }

    return this.f1Service.getQualifyingResultsInRaceAndSeason(season, this.latestRound, this.getLimit(controls), offset).pipe(
      tap(data => {
        this.latestRequest = data;
        this.storedResultsLastRound = this.storedResultsLastRound.concat(data.MRData.RaceTable.Races);
        this.storedAllRaces = this.storedAllRaces.concat(this.storedResultsLastRound);
        this.updatePendingData(data, lastSeason);
      }),
      map(data => data.MRData.RaceTable.Races)
    );
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
    let lastResultsLength = this.storedResultsLastRound[0]?.QualifyingResults?.length;
    if (controls.page === 1 && lastResultsLength &&
        lastResultsLength < limit) {
      limit -= lastResultsLength;
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

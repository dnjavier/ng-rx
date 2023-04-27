import { Injectable } from '@angular/core';
import { F1Service } from './f1.service';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { DriverStandings, Standings } from '../utils/driver-standings.interface';
import { BehaviorSubject, Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { RaceDataService } from './race-data.service';
import { GlobalConstants } from '../utils/global-constants';
import { SeasonRaces } from '../utils/season-races.interface';
import { Helper } from '../utils/helper.class';

@Injectable({
  providedIn: 'root'
})
export class StandingsDataService {

  private latestSeasonRequest!: SeasonRaces;
  private latestStandingsRequest!: Standings;
  private latestRound = 1;
  private storedAllDStandings: DriverStandings[] = [];
  private latestSeasonRequested = GlobalConstants.seasons[0];
  private isDataPendingSubject = new BehaviorSubject<boolean>(true);

  isDataPending$: Observable<boolean> = this.isDataPendingSubject.asObservable();

  constructor(private f1Service: F1Service,
    private raceService: RaceDataService) { }

  /**
   * Get the race to know the rounds per season and validate if
   * request has been made previosuly, then switch to request
   * that returns Driver Standings after a race.
   * 
   * @param controls - From pagination
   * @returns Driver standings after a race
   */
  public getStandings(controls: PaginationControls): Observable<DriverStandings[]> {
    if (this.getStoredData(controls).length) {
      return of(this.getStoredData(controls));
    }

    let season  = this.latestSeasonRequested ? this.latestSeasonRequested : GlobalConstants.seasons[0];
    const lastStanding = this.storedAllDStandings[this.storedAllDStandings.length - 1]?.position;

    const newSeason = Helper.calcSeason(
      this.latestSeasonRequest?.MRData.total,
      this.latestRound + '',
      lastStanding,
      this.latestStandingsRequest?.MRData.total,
      season);

    if (newSeason > season) {
      // Season was incremented
      this.latestSeasonRequested ++;
      this.latestRound = 1;
    }

    return this.raceService.getSeasonRaces(season, 1).pipe(
      tap(data => this.latestSeasonRequest = data),
      switchMap(data => this.getDriverStandings(controls, data))
    );
  }

  /**
   * Based on the pagination controls, determines the offset
   * and limit to request new data to the API, also, if 
   * latest request does not complete items on page, makes
   * an extra request.
   * 
   * @param controls - From pagination
   * @param seasonRace - Season request
   * @returns List of standing drivers
   */
  private getDriverStandings(controls: PaginationControls, seasonRace: SeasonRaces): Observable<DriverStandings[]> {
    let season = Number(seasonRace.MRData.RaceTable.season);
    const totalRounds = this.latestSeasonRequest?.MRData.total;
    const dataLatestRound = this.storedAllDStandings.filter(d => Number(d.season) === season && d.round === this.latestRound);
    const limit = Helper.calcLimit(controls, dataLatestRound.length);
    let offset = Helper.calcOffset(this.storedAllDStandings, this.latestSeasonRequested, this.latestRound);

    // Reset offset and data if is requesting next page
    if (this.latestRound < Number(totalRounds) &&
    dataLatestRound.length === Number(this.latestStandingsRequest?.MRData.total) &&
      offset >= Number(this.latestStandingsRequest?.MRData.total)) {
      this.latestRound++;
      offset = 0;
    }

    return this.f1Service.getDriverStandings(season, this.latestRound, limit, offset).pipe(
      tap(data => Helper.updatePendingData(
                            totalRounds,
                            this.isDataPendingSubject,
                            data.MRData.StandingsTable.StandingsLists[0].DriverStandings,
                            data.MRData.StandingsTable.round,
                            data.MRData.StandingsTable.season,
                            data.MRData.total)),
      switchMap(data => this.addNewRequest([data], season, totalRounds)),
      // some cases require a third request to complete page
      switchMap(data => this.addNewRequest(data, season, totalRounds)),
      tap(data => this.storeDriverStandings(data)),
      map(data => {
        if (controls.page > 1) {
          return this.storedAllDStandings.slice((controls.page - 1) * controls.itemsQty);
        } else {
          return this.storedAllDStandings.slice(-controls.itemsQty)
        }
      })
    );
  }

  /**
   * Save requested values from API in
   * local variables to prevent requests.
   * 
   * @param data - From API
   */
  private storeDriverStandings(data: Standings[]): void {
    this.latestStandingsRequest = data[0];

    for (let i = 0; i < data.length; i++) {
      const stands = data[i].MRData.StandingsTable.StandingsLists[0].DriverStandings;
      
      for (let j = 0; j < stands.length; j++) {
        stands[j].season = data[i].MRData.StandingsTable.season;
        stands[j].round = Number(data[i].MRData.StandingsTable.round);

        this.storedAllDStandings.push(stands[j]);
      }
    }
  }

  /**
   * Based on the existing stored values and the 
   * pagination, determines if values have already 
   * been requested.
   * 
   * @param controls - From pagination
   * @returns stored data items
   */
  private getStoredData(controls: PaginationControls): DriverStandings[] {
    let results: DriverStandings[] = [];
    const lastAllStandings = this.storedAllDStandings[this.storedAllDStandings.length - 1];
    if (controls.page * controls.itemsQty <= this.storedAllDStandings.length) {
      results = this.storedAllDStandings.slice(controls.start, controls.end);
    } else if ((controls.page - 1) * controls.itemsQty <= this.storedAllDStandings.length &&
                lastAllStandings?.position === this.latestStandingsRequest?.MRData.total &&
                lastAllStandings?.season === Helper.lastSeason + '' && 
                lastAllStandings?.round === Number(this.latestSeasonRequest?.MRData.total)) {
      const start = (controls.page - 1) * controls.itemsQty;
      results = this.storedAllDStandings.slice(start);
    }

    const lastResult = results[results.length - 1];
    if (lastResult?.season === Helper.lastSeason + '' && 
        lastResult?.round === Number(this.latestSeasonRequest?.MRData.total) &&
        lastResult.position === this.latestStandingsRequest.MRData.total) {
      this.isDataPendingSubject.next(false);
    } else {
      const existingValue = this.isDataPendingSubject.getValue();
      if (!existingValue) {
        this.isDataPendingSubject.next(true);
      }
    }

    return results;
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
  private addNewRequest(data: Standings[], season: number, totalRounds: string): Observable<Standings[]> {
    const reqList: Observable<Standings>[] = [];

    for (let i = 0; i < data.length; i++) {
      reqList.push(of(data[i]));

      const limit = Number(data[i].MRData.limit);
      const offset = Number(data[i].MRData.offset);
      const total = Number(data[i].MRData.total);
      const newLimit = limit + offset - total;
    
      // if in the last response items are not enough to complete QTY of items in page
      if (newLimit > 0 && this.isDataPendingSubject.getValue() && i === data.length - 1) {
        const list = data[i].MRData.StandingsTable.StandingsLists[0]?.DriverStandings;
        const lastStanding = list[list.length - 1]?.position;
        const lastRound = data[i].MRData.StandingsTable.round;
        const newSeason = Helper.calcSeason(totalRounds, lastRound, lastStanding, total + '', season);

        if (lastStanding === total + '') {
          this.latestRound++;
        }
        if (newSeason > season) {
          this.latestSeasonRequested ++;
          this.latestRound = 1;
        }

        reqList.push(this.f1Service.getDriverStandings(newSeason, this.latestRound, newLimit, 0));
      }
    }
    return forkJoin(reqList);
  }
}

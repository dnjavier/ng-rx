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
  private storedDStandingsLastRound: DriverStandings[] = [];
  private latestSeasonRequested = GlobalConstants.seasons[0];
  private isDataPendingSubject = new BehaviorSubject<boolean>(true);
  private lastSeason = GlobalConstants.seasons[GlobalConstants.seasons.length - 1];

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
    let season  = this.latestSeasonRequested ? this.latestSeasonRequested : GlobalConstants.seasons[0];
    const lastStanding = this.storedAllDStandings[this.storedAllDStandings.length - 1]?.position;

    // Increment season when all rounds have been requested
    if (this.latestRound === Number(this.latestSeasonRequest?.MRData.total) &&
    lastStanding === this.latestStandingsRequest?.MRData.total &&
    season < this.lastSeason) {
      season++;
      this.latestSeasonRequested ++;
      this.latestRound = 1;
      this.storedDStandingsLastRound = [];
    }

    return this.raceService.getSeasonRaces(season, 1).pipe(
      tap(data => this.latestSeasonRequest = data),
      switchMap(data => this.getDriverStandings(controls, data))
    );
  }

  private getDriverStandings(controls: PaginationControls, seasonRace: SeasonRaces): Observable<DriverStandings[]> {
    let season = Number(seasonRace.MRData.RaceTable.season);
    const dataLatestRound = this.storedAllDStandings.filter(d => Number(d.season) === season && d.round === this.latestRound);
    const limit = Helper.calcLimit(controls, dataLatestRound.length);
    let offset = Helper.calcOffset(this.storedAllDStandings, this.latestSeasonRequested, this.latestRound);

    // Reset offset and data if is requesting next page
    if (this.latestRound < Number(this.latestSeasonRequest?.MRData.total) &&
    dataLatestRound.length === Number(this.latestStandingsRequest?.MRData.total) &&
      offset >= Number(this.latestStandingsRequest?.MRData.total)) {
      this.latestRound++;
      offset = 0;
      this.storedDStandingsLastRound = [];
    }

    return this.f1Service.getDriverStandings(season, this.latestRound, limit, offset).pipe(
      switchMap(data => {
        const limit = Number(data.MRData.limit);
        const offset = Number(data.MRData.offset);
        const total = Number(data.MRData.total);

        // if in the last response items are not enough to complete QTY of items in page
        if ((limit + offset) > total && this.isDataPendingSubject.getValue()) {
          this.latestRound++;
          return forkJoin([
            of(data),
            this.f1Service.getDriverStandings(season, this.latestRound, (limit + offset - total), 0)])
        } else {
          return forkJoin([of(data)]);
        }
      }),
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
}

import { Injectable } from '@angular/core';
import { F1Service } from './f1.service';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { DriverStandings, StandingsLists } from '../utils/driver-standings.interface';
import { Observable, map, switchMap, tap } from 'rxjs';
import { RaceDataService } from './race-data.service';
import { GlobalConstants } from '../utils/global-constants';
import { SeasonRaces } from '../utils/season-races.interface';
import { Helper } from '../utils/helper.class';

@Injectable({
  providedIn: 'root'
})
export class StandingsDataService {

  private latestSeasonRequest!: SeasonRaces;
  private latestRound = 1;
  private storedAllDStandings: DriverStandings[] = [];
  private latestSeasonRequested = GlobalConstants.seasons[0];

  constructor(private f1Service: F1Service,
    private raceService: RaceDataService) { }

  public getStandings(controls: PaginationControls): Observable<DriverStandings[]> {
    // TODO: make season dynamic
    const season  = GlobalConstants.seasons[0];

    return this.raceService.getSeasonRaces(season, 1).pipe(
      tap(data => this.latestSeasonRequest = data),
      switchMap(data => this.getDriverStandings(controls, data))
    );
  }

  private getDriverStandings(controls: PaginationControls, seasonRace: SeasonRaces): Observable<DriverStandings[]> {
    const season = Number(seasonRace.MRData.RaceTable.season);
    const limit = controls.itemsQty;
    const offset = Helper.calcOffset(this.storedAllDStandings, this.latestSeasonRequested, this.latestRound);

    return this.f1Service.getDriverStandings(season, this.latestRound, limit, offset).pipe(
      tap(data => console.log(data.MRData)),
      tap(data => this.storeDriverStandings(data.MRData.StandingsTable.StandingsLists)),
      map(data => data.MRData.StandingsTable.StandingsLists[0].DriverStandings)
    );
  }

  private storeDriverStandings(data: StandingsLists[]): void {
    for (let i = 0; i < data.length; i++) {
      const stands = data[i].DriverStandings;
      
      for (let j = 0; j < stands.length; j++) {
        stands[j].season = data[i].season;
        stands[j].round = data[i].round;

        this.storedAllDStandings.push(stands[j]);
      }
    }
  }
}

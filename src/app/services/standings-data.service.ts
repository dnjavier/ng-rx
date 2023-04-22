import { Injectable } from '@angular/core';
import { F1Service } from './f1.service';
import { PaginationControls } from '../utils/pagination-controls.interface';
import { DriverStandings } from '../utils/driver-standings.interface';
import { Observable, map, switchMap, tap } from 'rxjs';
import { RaceDataService } from './race-data.service';
import { GlobalConstants } from '../utils/global-constants';
import { SeasonRaces } from '../utils/season-races.interface';

@Injectable({
  providedIn: 'root'
})
export class StandingsDataService {

  private latestSeasonRequest!: SeasonRaces;
  private latestRound = 1;

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
    const offset = controls.start;
    
    return this.f1Service.getDriverStandings(season, this.latestRound, limit, offset).pipe(
      tap(data => console.log(data.MRData)),
      map(data => data.MRData.StandingsTable.StandingsLists[0].DriverStandings)
    );
  }
}

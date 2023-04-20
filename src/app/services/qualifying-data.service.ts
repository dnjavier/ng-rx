import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { SeasonQualifyingResults } from '../utils/season-qualifying.interface';
import { Race } from '../utils/race.interface';
import { F1Service } from './f1.service';
import { RaceDataService } from './race-data.service';
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
  private totalRacesLatestSeason!: number;
  private latestSeasonRequested!: number;

  isResultsPending$: Observable<boolean> = this.isResultsPendingSubject.asObservable();

  constructor(private f1Service: F1Service) { }

  public getResults(controls: PaginationControls): Observable<Race[]> {
    const season = this.latestSeasonRequested ? this.latestSeasonRequested : GlobalConstants.seasons[0];
    // Get only first race of the season
    return this.f1Service.getRacesPerSeason(season, 1, 0).pipe(
      tap(data => {
        this.totalRacesLatestSeason = Number(data.MRData.total);
        this.latestSeasonRequested = Number(data.MRData.RaceTable.season);
      }),
      switchMap(data => {
        return this.getRacesResult(controls, data)
      })
    );
  }

  private getRacesResult(controls: PaginationControls, seasonRace: SeasonRaces): Observable<Race[]> {
    const limit = controls.itemsQty;
    const season = Number(seasonRace.MRData.RaceTable.season);
    const round = Number(seasonRace.MRData.RaceTable.Races[0].round);
    const offset = controls.start;
    return this.f1Service.getQualifyingResultsInRaceAndSeason(season, round, limit, offset).pipe(
      map(data => data.MRData.RaceTable.Races)
    )
  }
}

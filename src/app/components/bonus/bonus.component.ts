import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin, switchMap } from 'rxjs';
import { F1Service } from 'src/app/services/f1.service';
import { RaceDataService } from 'src/app/services/race-data.service';
import { StatsDataService } from 'src/app/services/stats-data.service';
import { GlobalConstants } from 'src/app/utils/global-constants';
import { Status, StatusValue } from 'src/app/utils/status.interface';

@Component({
  selector: 'app-bonus',
  templateUrl: './bonus.component.html',
  styleUrls: ['./bonus.component.scss']
})
export class BonusComponent implements OnInit, OnDestroy {

  public finished!: number;
  public accident!: number;
  public plus1Lap!: number;
  public isLoading = false;

  private statsSubscription!: Subscription;

  constructor(private f1Service: F1Service,
    private raceService: RaceDataService,
    private statsService: StatsDataService) {}

  ngOnInit(): void {
    this.finished = this.statsService.finished;
    this.accident = this.statsService.accident;
    this.plus1Lap = this.statsService.plus1Lap;

    if (!this.finished && !this.accident && !this.plus1Lap) {
      this.isLoading = true;
      // 1 req for each season
      this.statsSubscription = forkJoin(GlobalConstants.seasons.map(year => this.raceService.getSeasonRaces(year, 1).pipe(
        switchMap(data => {
          const listRequests = [];
          for (let i = 0; i < Number(data.MRData.total); i++) {
            // 1 req for each round of the season
            listRequests.push(this.f1Service.getStatus(data.MRData.RaceTable.season, i));
          }
          return forkJoin(listRequests);
        })
      ))).subscribe(data => {
        this.isLoading = false;
        this.extractStats(data);
      });
    }
  }

  ngOnDestroy(): void {
    this.statsSubscription?.unsubscribe();
  }

  /**
   * Loops through all the values in the API response
   * and accumulate the values according to its status.
   * 
   * @param data - API response
   */
  private extractStats(data: Status[][]): void {
    this.finished = 0;
    this.plus1Lap = 0;
    this.accident = 0;

    // loop seasons
    for (let i = 0; i < data.length; i++) {
      // loop rounds
      for (let j = 0; j < data[i].length; j++) {
        // loop statuses
        for (let k = 0; k < data[i][j].MRData.StatusTable.Status.length; k++) {
          const statusItem = data[i][j].MRData.StatusTable.Status[k];
          if (data[i][j].MRData.StatusTable.Status[k].status === StatusValue.finished) {
            this.finished += Number(statusItem.count);
          }
          if (data[i][j].MRData.StatusTable.Status[k].status === StatusValue.accident) {
            this.accident += Number(statusItem.count);
          }
          if (data[i][j].MRData.StatusTable.Status[k].status === StatusValue.plus1Lap) {
            this.plus1Lap += Number(statusItem.count);
          }
        }
      }
    }

    this.statsService.finished = this.finished;
    this.statsService.accident = this.accident;
    this.statsService.plus1Lap = this.plus1Lap;
  }

}

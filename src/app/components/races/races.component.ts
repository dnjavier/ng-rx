import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { RaceDataService } from 'src/app/services/race-data.service';
import { GlobalConstants } from 'src/app/utils/global-constants';
import { PaginationControls } from 'src/app/utils/pagination-controls.interface';
import { Race } from 'src/app/utils/race.interface';

@Component({
  selector: 'app-races',
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.scss']
})
export class RacesComponent implements OnInit, OnDestroy {

  showResults = false;
  raceResults: any;
  races!: any[];
  results!: any[] | undefined;
  pendingPages$: Observable<boolean> = this.dataService.isRacePending$;
  paginationSubject = new BehaviorSubject<PaginationControls>(GlobalConstants.defaultPagination);
  races$: Observable<Race[]> = this.paginationSubject.asObservable().pipe(
    switchMap(controls => {
      return this.dataService.getRaces(controls.page, controls.itemsQty, controls.start);
    })
  );

  private results$!: Subscription;

  constructor(private dataService: RaceDataService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.results$?.unsubscribe();
  }

  /**
   * Catch the event from pagination component and
   * triggers the paginationSubject to display the
   * list of drivers accordingly.
   * 
   * @param controls - Value emitted from pagination component.
   */
  controlsChanged(controls: PaginationControls): void {
    if (controls.page && controls.itemsQty) {
      this.paginationSubject.next(controls);
    }
  }

  /**
   * 
   * @param race 
   */
  viewResults(race: Race): void {
    this.showResults = true;
    this.results$ = this.dataService.getRaceResults(race.season, race.round).subscribe(data => {
      this.raceResults = data;
    });
  }

  hideResults(): void {
    this.showResults = false;
    this.raceResults = null;
    this.results$.unsubscribe();
  }
}

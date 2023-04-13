import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { F1DataService } from 'src/app/services/f1-data.service';
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
  public paginationSubject = new BehaviorSubject<PaginationControls>(this.f1Data.defaultPagination);
  public races$: Observable<Race[]> = this.paginationSubject.asObservable().pipe(
    switchMap(controls => {
      console.log('controls', controls);
      return this.f1Data.getRaces('2018', controls.itemsQty, controls.start);
    })
  );

  private results$!: Subscription;

  constructor(private f1Data: F1DataService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.results$.unsubscribe();
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

  viewResults(race: any): void {
    this.showResults = true;
    this.results$ = this.f1Data.getRaceResults(race.season, race.round).subscribe(data => {
      this.raceResults = data;
    });
  }

  hideResults(): void {
    this.showResults = false;
    this.raceResults = null;
    this.results$.unsubscribe();
  }
}

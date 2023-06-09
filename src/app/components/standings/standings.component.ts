import { Component } from '@angular/core';
import { BehaviorSubject, Observable, delay, switchMap, tap } from 'rxjs';
import { StandingsDataService } from 'src/app/services/standings-data.service';
import { DriverStandings } from 'src/app/utils/driver-standings.interface';
import { GlobalConstants } from 'src/app/utils/global-constants';
import { PaginationControls } from 'src/app/utils/pagination-controls.interface';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss']
})
export class StandingsComponent {

  isLoadingData = true;
  pendingPages$: Observable<boolean> = this.dataService.isDataPending$;
  paginationSubject = new BehaviorSubject<PaginationControls>(GlobalConstants.defaultPagination);
  standings$: Observable<DriverStandings[]> = this.paginationSubject.asObservable().pipe(
    tap(data => this.isLoadingData = true),
    delay(0),
    switchMap(controls => {
      return this.dataService.getStandings(controls).pipe(
        tap(data => this.isLoadingData = false)
      );
    })
  );

  constructor(private dataService: StandingsDataService) {}

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

}

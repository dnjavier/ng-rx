import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { QualifyingDataService } from 'src/app/services/qualifying-data.service';
import { GlobalConstants } from 'src/app/utils/global-constants';
import { PaginationControls } from 'src/app/utils/pagination-controls.interface';
import { Race } from 'src/app/utils/race.interface';

@Component({
  selector: 'app-qualifying',
  templateUrl: './qualifying.component.html',
  styleUrls: ['./qualifying.component.scss']
})
export class QualifyingComponent {

  paginationSubject = new BehaviorSubject<PaginationControls>(GlobalConstants.defaultPagination);
  races$: Observable<Race[]> = this.paginationSubject.asObservable().pipe(
    switchMap(controls => {
      return this.dataService.getResults(controls);
    })
  );

  constructor(private dataService: QualifyingDataService) { }

  // TO-DO:
  // Get first race of the season to know how many races are in that season
  // Iterate races of the season to GET qualifying results
  // Paginate qualifying results
  // When got all qualifying results of that season, increase season number

  // in service
  // concat observable request to complete items on page


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

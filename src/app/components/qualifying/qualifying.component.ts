import { Component } from '@angular/core';
import { BehaviorSubject, Observable, delay, switchMap, tap } from 'rxjs';
import { QualifyingDataService } from 'src/app/services/qualifying-data.service';
import { GlobalConstants } from 'src/app/utils/global-constants';
import { PaginationControls } from 'src/app/utils/pagination-controls.interface';
import { QualifyingResults } from 'src/app/utils/qualifying-results.interface';

@Component({
  selector: 'app-qualifying',
  templateUrl: './qualifying.component.html',
  styleUrls: ['./qualifying.component.scss']
})
export class QualifyingComponent {

  isLoadingData = true;
  pendingPages$: Observable<boolean> = this.dataService.isResultsPending$;
  paginationSubject = new BehaviorSubject<PaginationControls>(GlobalConstants.defaultPagination);
  races$: Observable<QualifyingResults[]> = this.paginationSubject.asObservable().pipe(
    tap(data => this.isLoadingData = true),
    delay(0),
    switchMap(controls => {
      return this.dataService.getResults(controls).pipe(
        tap(data => this.isLoadingData = false),
      );
    })
  );

  constructor(private dataService: QualifyingDataService) { }

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

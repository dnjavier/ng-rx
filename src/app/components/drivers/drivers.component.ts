import { Component, OnInit } from '@angular/core';
import { DriverSeason } from 'src/app/utils/drivers-season.interface';
import { Subscription, BehaviorSubject } from 'rxjs';
import { F1DataService } from 'src/app/services/f1-data.service';
import { PaginationControls } from 'src/app/utils/pagination-controls.interface';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {

  public pageDrivers?: DriverSeason[];
  public itemsLength!: number;
  public paginationSubject = new BehaviorSubject<PaginationControls>(this.f1Data.defaultPagination);
  private drivers$?: Subscription;
  private items$?: Subscription;

  constructor(private f1Data: F1DataService) {}

  ngOnInit(): void {
    this.getDrivers();
  }

  ngOnDestroy(): void {
    this.drivers$?.unsubscribe();
    this.items$?.unsubscribe();
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
   * Gets all the drivers from the different seasons and
   * call setPageDrivers.
   */
  getDrivers(): void {
    this.drivers$ = this.f1Data.driversSeason$.subscribe((allDrivers => {
      this.setPageDrivers(allDrivers);
    }));
  }

  /**
   * Update the pageDrivers based on all drivers and
   * pagination values so those are displayed on the 
   * screen accordingly.
   * 
   * @param allDrivers - List of all drivers
   */
  private setPageDrivers(allDrivers: DriverSeason[]): void {
    this.itemsLength = allDrivers.length;
    this.items$ = this.paginationSubject.asObservable().subscribe((value) => {
      this.pageDrivers = allDrivers?.slice(value.start, value.end);
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { F1DataService } from './services/f1-data.service';
import { DriverSeason } from './utils/drivers-season.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'ng-rx';
  public activeTab = '';
  public pageDrivers?: DriverSeason[];
  public allDrivers?: DriverSeason[];
  public currentPageSubject = new BehaviorSubject<number>(1);

  private itemsSubject = new BehaviorSubject<number>(10);
  private drivers$?: Subscription;

  constructor(private f1Data: F1DataService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.drivers$?.unsubscribe();
    this.itemsSubject.unsubscribe;
  }

  controlsChanged(controls: {page: number | null, itemsQty: number}): void {
    if (controls.page && controls.itemsQty) {
      this.currentPageSubject.next(controls.page);
      this.itemsSubject.next(controls.itemsQty);
    }
  }

  getDrivers(): void {
    this.drivers$ = this.f1Data.driversSeason$.subscribe((response) => {
      this.allDrivers = response;
      this.setPageDrivers();
    });
  }

  toggleTab(selectedTab: string): void {
    this.activeTab = selectedTab;
  }

  private setPageDrivers(): void {
    this.itemsSubject.asObservable().subscribe((value) => {
      const start = value * (this.currentPageSubject.getValue() - 1);
      const end = value * this.currentPageSubject.getValue();
      this.pageDrivers = this.allDrivers?.slice(start, end);
    });
  }
}

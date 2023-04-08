import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
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
  public drivers?: DriverSeason[];

  private drivers$?: Subscription;

  constructor(private f1Data: F1DataService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.drivers$?.unsubscribe();
  }

  public getDrivers(): void {
    this.drivers$ = this.f1Data.driversSeason$.subscribe((response) => {
      this.drivers = response;
    });
  }

  toggleTab(selectedTab: string): void {
    this.activeTab = selectedTab;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { F1DataService } from './services/f1-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'ng-rx';
  public activeTab = '';
  public driversSeason?: {
    name: string;
    season: string;
  }[] = [];

  private drivers$?: Subscription;

  constructor(private f1Data: F1DataService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.drivers$?.unsubscribe();
  }

  /**
   * Creates a list of objects with the seasons and
   * its drivers and gets the information the data service.
   */
  public getDrivers(): void {
    this.drivers$ = this.f1Data.driversSeason$.subscribe((response) => {
      for (let i = 0; i < response.length; i++) {
        for (let j = 0; j < response[i].Drivers.length; j++) {
          this.driversSeason?.push({
            name: response[i].Drivers[j].givenName + ' ' + response[i].Drivers[j].familyName,
            season: response[i].season
          });
        }
      }
    });
  }

  toggleTab(selectedTab: string): void {
    this.activeTab = selectedTab;
  }
}

import { Component, OnInit } from '@angular/core';
import { F1Service } from './services/f1.service';
import { Observable } from 'rxjs';
import { DriverTable } from './utils/driver-table.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ng-rx';
  drivers$?: Observable<DriverTable>;

  constructor(private f1: F1Service) { }

  ngOnInit(): void {
    this.drivers$ = this.f1.getDriversPerSeason('2018');
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeasonDrivers } from '../utils/season-drivers.interface';

@Injectable({
  providedIn: 'root'
})
export class F1Service {

  constructor(private http: HttpClient) { }

  /**
   * Makes a request to the API in order to get all drivers
   * who participated in the season accordingly.
   * 
   * @param year 
   * @returns A list of Drivers
   */
  public getDriversPerSeason(year: string): Observable<SeasonDrivers> {
    return this.http.get<SeasonDrivers>(`http://ergast.com/api/f1/${year}/drivers.json`);
  }
}

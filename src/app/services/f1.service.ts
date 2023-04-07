import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeasonDrivers } from '../utils/season-drivers.interface';
import { SeasonRaces } from '../utils/season-races.interface';
import { SeasonRacesResults } from '../utils/season-races-results.interface';

@Injectable({
  providedIn: 'root'
})
export class F1Service {

  private baseUrl = 'http://ergast.com/api/f1';

  constructor(private http: HttpClient) { }

  /**
   * Makes a request to the API in order to get all drivers
   * who participated in the season accordingly.
   * 
   * @param year - Season's period
   * @returns An observable with a list of Drivers
   */
  public getDriversPerSeason(year: string): Observable<SeasonDrivers> {
    return this.http.get<SeasonDrivers>(`${this.baseUrl}/${year}/drivers.json`);
  }

  /**
   * Makes a request to the API in order to get all races
   * that happened in the season accordingly.
   * 
   * @param year - Season's period
   * @returns An observable with a list of Races
   */
  public getRacesPerSeason(year: string): Observable<SeasonRaces> {
    return this.http.get<SeasonRaces>(`${this.baseUrl}/${year}.json`);
  }

  /**
   * Makes a request to the API in order to get the results
   * of a race in a season.
   * 
   * @param year - Season's period
   * @param round - Race sequence number
   * @returns An observable with a list of races' Results
   */
  public getRaceResultsInSeason(year: string, round: string): Observable<SeasonRacesResults> {
    return this.http.get<SeasonRacesResults>(`${this.baseUrl}/${year}/${round}/results.json`);
  }
}

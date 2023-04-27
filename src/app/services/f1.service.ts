import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SeasonDrivers } from '../utils/season-drivers.interface';
import { SeasonRaces } from '../utils/season-races.interface';
import { SeasonRacesResults } from '../utils/season-races-results.interface';
import { SeasonQualifyingResults } from '../utils/season-qualifying.interface';
import { DriverTable } from '../utils/driver-table.interface';
import { Standings } from '../utils/driver-standings.interface';
import { Status } from '../utils/status.interface';

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
  public getDriversPerSeason(year: number): Observable<DriverTable> {
    return this.http.get<SeasonDrivers>(`${this.baseUrl}/${year}/drivers.json`).pipe(
      map(data => {
        return data.MRData.DriverTable;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Makes a request to the API in order to get all races
   * that happened in the season accordingly.
   * 
   * @param year - Season's period
   * @param limit - Max values returned
   * @param offset - Starting index
   * @returns An observable with a list of Races
   */
  public getRacesPerSeason(year: number, limit?: number, offset?: number): Observable<SeasonRaces> {
    const options = {
      params: {
        limit: limit + '',
        offset: offset + ''
      }
    };
    return this.http.get<SeasonRaces>(`${this.baseUrl}/${year}.json`, options).pipe(
      catchError(this.handleError));
  }

  /**
   * Makes a request to the API in order to get the results
   * of a race in a season.
   * 
   * @param year - Season's period
   * @param round - Race sequence number
   * @param limit - Max values returned
   * @param offset - Starting index
   * @returns An observable with a list of races' Results
   */
  public getRaceResultsInSeason(year: string, round: string): Observable<SeasonRacesResults> {
    return this.http.get<SeasonRacesResults>(`${this.baseUrl}/${year}/${round}/results.json`).pipe(
      catchError(this.handleError));
  }

  /**
   * Makes a request to the API in order to get the Qualifying results
   * of a race in a season.
   * 
   * @param year - Season's period
   * @param round - Race sequence number
   * @param limit - Max values returned
   * @param offset - Starting index
   * @returns An observable with a list of Qualifying results
   */
  public getQualifyingResultsInRaceAndSeason(year: number, round: number, limit: number, offset: number): Observable<SeasonQualifyingResults> {
    const options = {
      params: {
        limit: limit + '',
        offset: offset + ''
      }
    };
    return this.http.get<SeasonQualifyingResults>(`${this.baseUrl}/${year}/${round}/qualifying.json`, options).pipe(
      catchError(this.handleError));
  }

  /**
   * Makes a request to the API in order to get the Driver standings
   * after a race.
   * 
   * @param year - Season's period
   * @param round - Race sequence number
   * @param limit - Max values returned
   * @param offset - Starting index
   * @returns An observable with a list of Driver Standings
   */
  public getDriverStandings(year: number, round: number, limit: number, offset: number): Observable<Standings> {
    const options = {
      params: {
        limit: limit + '',
        offset: offset + ''
      }
    };
    return this.http.get<Standings>(`${this.baseUrl}/${year}/${round}/driverStandings.json`, options).pipe(
      catchError(this.handleError));
  }

  /**
   * Makes a request to the API in order to get all statuses
   * of rounds in seasons.
   * 
   * @param year - Season's period
   * @returns An observable with a list of Drivers
   */
  public getStatus(year: string, round: number): Observable<Status> {
    return this.http.get<Status>(`${this.baseUrl}/${year}/${round}/status.json`).pipe(
      catchError(this.handleError));
  }

  /**
   * Takes care of the error, it prints the error in the
   * browser's console and returns a new custom error.
   * 
   * @param error
   * @returns
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`API returned error code: ${error.status}, body was: ${error.error}`);
    return throwError(() => new Error('Something bad happened, please try again later.'));
  }
}

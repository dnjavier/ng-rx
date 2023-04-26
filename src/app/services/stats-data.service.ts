import { Injectable } from '@angular/core';
import { F1Service } from './f1.service';
import { RaceDataService } from './race-data.service';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { GlobalConstants } from '../utils/global-constants';

@Injectable({
  providedIn: 'root'
})
export class StatsDataService {

  private _finished!: number;
  private _accident!: number;
  private _plus1Lap!: number;

  get finished(): number {
    return this._finished;
  }

  set finished(value: number) {
    this._finished = value;
  }

  get accident(): number {
    return this._accident;
  }

  set accident(value: number) {
    this._accident = value;
  }

  get plus1Lap(): number {
    return this._plus1Lap;
  }

  set plus1Lap(value: number) {
    this._plus1Lap = value;
  }
}

import { Circuit } from './circuit.interface';
import { Driver } from './driver.interface';

export interface Race {
  Circuit: Circuit;
  Results?: Result[];
  date: string;
  raceName: string;
  round: string;
  season: string;
  time: string;
  url: string;
}

interface Result {
  Constructor: {};
  Driver: Driver;
  FastestLap: {
    AverageSpeed: {
      speed: string;
      units: string;
    };
    Time: {
      time: string;
    };
    lap: string;
    rank: string;
  };
  Time: {
    milis: string;
    time: string;
  };
  grid: string;
  laps: string;
  number: string;
  points: string;
  position: string;
  positionText: string;
  status: string;
}
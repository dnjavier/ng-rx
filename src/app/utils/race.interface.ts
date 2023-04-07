import { Circuit } from './circuit.interface';
import { Driver } from './driver.interface';

export interface Race {
  Circuit: Circuit;
  Results?: Result[];
  QualifyingResults?: QualifyingResults[];
  date: string;
  raceName: string;
  round: string;
  season: string;
  time: string;
  url: string;
}

interface Result {
  Constructor: Constructor;
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

interface QualifyingResults {
  Constructor: Constructor;
  Driver: Driver;
  Q1: string;
  Q2: string;
  Q3: string;
  number: string;
  position: string;
}

interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  url: string;
}
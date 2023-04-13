import { Constructor } from "./constructor.interface";
import { Driver } from "./driver.interface";

export interface Result {
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
import { Circuit } from './circuit.interface';
import { Driver } from './driver.interface';
import { Race } from './race.interface';

export interface SeasonRacesResults {
  MRData: {
    RaceTable: {
      Races: Race[];
      round: string;
      season: string;
    };
    limit: string;
    offset: string;
    series: string;
    total: string;
  }
}
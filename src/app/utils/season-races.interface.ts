import { Race } from './race.interface';

export interface SeasonRaces {
  MRData: {
    RaceTable: {
      Races: Race[];
      season: string;
    }
    limit: string;
    offset: string;
    series: string;
    total: string;
    xmlns: string;
    url: string;
  }
}
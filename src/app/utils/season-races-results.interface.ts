import { RaceTable } from './race-table.interface';

export interface SeasonRacesResults {
  MRData: {
    RaceTable: RaceTable;
    limit: string;
    offset: string;
    series: string;
    total: string;
    url: string;
    xmlns: string;
  }
}
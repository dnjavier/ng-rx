import { RaceTable } from './race-table.interface';

export interface SeasonQualifyingResults {
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
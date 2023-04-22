import { Constructor } from './constructor.interface';
import { Driver } from './driver.interface';

export interface Standings {
  MRData: {
    StandingsTable: StandingsTable;
    limit: string;
    offset: string;
    series: string;
    total: string;
  }
}

export interface StandingsTable {
  StandingsLists: StandingsLists[];
  round: string;
  season: string;
}

export interface StandingsLists {
  DriverStandings: DriverStandings[];
  round: string;
  season: string;
}

export interface DriverStandings {
  Constructors: Constructor[];
  Driver: Driver;
  points: string;
  position: string;
  positionText: string;
  wins: string;
}
import { Driver } from './driver.interface';

export interface SeasonDrivers {
  MRData: {
    DriverTable: {
      Drivers: Driver[];
      season: string;
    };
    limit: string;
    offset: string;
    series: string;
    total: string;
  }
}
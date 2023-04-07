import { DriverTable } from './driver-table.interface';

export interface SeasonDrivers {
  MRData: {
    DriverTable: DriverTable;
    limit: string;
    offset: string;
    series: string;
    total: string;
  }
}
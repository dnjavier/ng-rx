
export interface Status {
  MRData: {
    StatusTable: {
      Status: StatusItem[];
      round: string;
      season: string;
    },
    limit: string;
    offset: string;
    series: string;
    total: string;
  }
}

export interface StatusItem {
  count: string;
  status: StatusValue;
  statusId: string;
}

export enum StatusValue {
  finished = 'Finished',
  accident = 'Accident',
  plus1Lap = '+1 Lap'
}
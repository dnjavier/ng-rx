import { Circuit } from './circuit.interface';
import { QualifyingResults } from './qualifying-results.interface';
import { Result } from './result.interface';

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

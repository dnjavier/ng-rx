import { Circuit } from './circuit.interface';
import { Constructor } from './constructor.interface';
import { Driver } from './driver.interface';
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

export interface QualifyingResults {
  Constructor: Constructor;
  Driver: Driver;
  Q1: string;
  Q2: string;
  Q3: string;
  number: string;
  position: string;
  season?: string;
  raceName?: string;
  round?: number;
}
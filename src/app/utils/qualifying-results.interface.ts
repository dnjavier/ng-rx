import { Constructor } from './constructor.interface';
import { Driver } from './driver.interface';

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
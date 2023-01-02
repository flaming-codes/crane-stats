import path from 'node:path';
import fs from 'node:fs';
import { AggregationRange, DataRecord } from './types';
import { subDays, subMonths, subWeeks } from 'date-fns';

export const dataPath = path.join(process.cwd(), 'data');

export function joinDataPath(...rest: string[]) {
  return path.join(dataPath, ...rest);
}

export function writeDataRecord<T>(filepath: string, record: DataRecord<T>) {
  fs.writeFileSync(filepath, JSON.stringify(record), { encoding: 'utf-8' });
}

export function mapAggregationRangeToDate(range: AggregationRange, date: Date): Date {
  switch (range) {
    case AggregationRange['24h']:
      return subDays(date, 1);
    case AggregationRange.week:
      return subWeeks(date, 1);
    case AggregationRange['2-weeks']:
      return subWeeks(date, 2);
    case AggregationRange.month:
      return subMonths(date, 1);
    default:
      throw new Error(`Invalid range: ${range}`);
  }
}

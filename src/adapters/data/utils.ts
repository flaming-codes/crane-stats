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

export function mapAggregationRangeToDate(range: AggregationRange, now: Date): Date {
  switch (range) {
    case '24h':
      return subDays(now, 1);
    case 'week':
      return subWeeks(now, 1);
    case '2-weeks':
      return subWeeks(now, 2);
    case 'month':
      return subMonths(now, 1);
  }
}

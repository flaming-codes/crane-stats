import path from 'node:path';
import fs from 'node:fs';
import { AggregationRange, DataRecord } from './types';
import { subDays, subMonths, subWeeks } from 'date-fns';
import { gzip } from 'compressing';

export const dataPath = path.join(process.cwd(), 'data');

export function joinDataPath(...rest: string[]) {
  return path.join(dataPath, ...rest);
}

export async function readDataRecord<T>(filepath: string): Promise<DataRecord<T>> {
  let buffer = Buffer.alloc(0);
  await gzip.uncompress(buffer, filepath);
  return JSON.parse(buffer.toString('utf-8'));
}

export async function writeDataRecord<T>(filepath: string, record: DataRecord<T>): Promise<void> {
  const buffer = Buffer.from(JSON.stringify(record), 'utf-8');
  await gzip.compressFile(buffer, filepath);
}

export function mapAggregationRangeToDate(range: AggregationRange, date: Date): Date {
  switch (range) {
    case AggregationRange['24h']:
      return subDays(date, 1);
    case AggregationRange['48h']:
      return subDays(date, 2);
    case AggregationRange['72h']:
      return subDays(date, 3);
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

import path from 'node:path';
import fs from 'node:fs';
import { AggregationRange, DataRecord } from './types';
import { subHours, subMonths, subWeeks } from 'date-fns';
import { gzip } from 'compressing';

export const dataPath = path.join(process.cwd(), 'data');

export function joinDataPath(...rest: string[]) {
  return path.join(dataPath, ...rest);
}

export async function readDataRecord<T>(filepath: string): Promise<DataRecord<T>> {
  console.log('filepath', filepath);

  const targetFile = filepath.split('/').slice(-1)[0];
  const targetDir = path.join(filepath.split('/').slice(0, -1).join('/'), 'temp');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }
  await gzip.uncompress(filepath, targetDir);

  console.log('uncompressed', targetDir);

  const uncompressedFile = fs.readFileSync(path.join(targetDir, targetFile), 'utf-8');

  console.log('buffer');

  return JSON.parse(uncompressedFile);
}

export async function writeDataRecord<T>(filepath: string, record: DataRecord<T>): Promise<void> {
  const buffer = Buffer.from(JSON.stringify(record), 'utf-8');
  await gzip.compressFile(buffer, filepath);
}

export function mapAggregationRangeToDate(range: AggregationRange, date: Date): Date {
  switch (range) {
    case AggregationRange['6h']:
      return subHours(date, 6);
    case AggregationRange['12h']:
      return subHours(date, 12);
    case AggregationRange['24h']:
      return subHours(date, 24);
    case AggregationRange['48h']:
      return subHours(date, 48);
    case AggregationRange['72h']:
      return subHours(date, 72);
    case AggregationRange['1-week']:
      return subWeeks(date, 1);
    case AggregationRange['2-weeks']:
      return subWeeks(date, 2);
    case AggregationRange['1-month']:
      return subMonths(date, 1);
    default:
      throw new Error(`Invalid range: ${range}`);
  }
}

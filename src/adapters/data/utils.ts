import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { AggregationRange, DataRecord } from './types';
import { subHours, subMonths, subWeeks } from 'date-fns';
import { gzip } from 'compressing';

export const dataPath = path.join(process.cwd(), 'data');

export function joinDataPath(...rest: string[]) {
  return path.join(dataPath, ...rest);
}

export async function readDataRecord<T>(filepath: string): Promise<DataRecord<T>> {
  // The 'gzip.uncompress' op expects a file, so we need to write the data to a temp file.
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crane-stats'));
  const tempFile = path.join(tmpDir, 'temp.json');

  await gzip.uncompress(filepath, tempFile);

  const uncompressedFile = fs.readFileSync(tempFile, 'utf-8');
  fs.unlinkSync(tempFile);

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

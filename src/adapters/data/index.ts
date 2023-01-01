import fs from 'node:fs';
import path from 'node:path';
import { Provider } from '../../provider';
import { AggregationRange, DataRecord } from './types';
import { joinDataPath, mapAggregationRangeToDate, writeDataRecord } from './utils';

/**
 * Adapter to interact with the data-directory.
 *
 * @param provider The name of the provider to use.
 */
export class DataAdapter<T> {
  provider: Provider;
  private baseDir: string;
  private snapshotsDir: string;
  private aggregatesDir: string;

  constructor(props: { provider: Provider }) {
    const { provider } = props;
    this.provider = provider;

    this.baseDir = joinDataPath(provider.name);
    this.snapshotsDir = joinDataPath(provider.name, 'snapshots');
    this.aggregatesDir = joinDataPath(provider.name, 'aggregates');
  }

  private stringifyDate(date: Date): string {
    return date.toISOString();
  }

  private parseDate(date: string): Date {
    return new Date(date);
  }

  /**
   * Create a single snapshot for the provider.
   *
   * @param time
   * @returns
   */
  async composeSnapshot(time: Date): Promise<T> {
    throw new Error('Not implemented: composeSnapshot');
  }

  /**
   * Write the snapshot to the respective directory.
   *
   * @param time
   */
  async saveSnapshot(params: { time: Date }): Promise<void> {
    const { time } = params;

    const res = await this.composeSnapshot(time);
    const filename = `${this.stringifyDate(time)}.json`;
    const filepath = path.join(this.snapshotsDir, filename);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir);
    }

    writeDataRecord(filepath, {
      date: time.toISOString(),
      data: JSON.stringify(res)
    });
  }

  async saveAggregation(params: { time: Date; range: AggregationRange }): Promise<void> {
    const { time, range } = params;
    const rangeDir = path.join(this.aggregatesDir, range);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.aggregatesDir)) {
      fs.mkdirSync(this.aggregatesDir);
    }
    if (!fs.existsSync(rangeDir)) {
      fs.mkdirSync(rangeDir);
    }

    const lowerBound = this.stringifyDate(mapAggregationRangeToDate(range, time));
    const files = fs.readdirSync(this.snapshotsDir);

    const records: DataRecord<T>[] = files
      .filter((file) => file.startsWith(lowerBound))
      .map((file) => {
        const filepath = path.join(this.snapshotsDir, file);
        const data = fs.readFileSync(filepath, { encoding: 'utf-8' });
        return JSON.parse(data);
      });
  }
}

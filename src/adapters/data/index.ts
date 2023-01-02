import fs from 'node:fs';
import path from 'node:path';
import { Provider } from '../../provider';
import { AggregationRange, Aggregator, DataRecord } from './types';
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
  /** Get the aggregated entity. */
  private aggregator: Aggregator<T>;

  constructor(props: { provider: Provider; aggregator: Aggregator<T> }) {
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

  private composeFilename(date: Date | string): string {
    return typeof date === 'string' ? `${date}.json` : `${this.stringifyDate(date)}.json`;
  }

  /**
   * Create a single snapshot for the provider.
   *
   * @param time
   * @returns
   */
  async composeSnapshot(params: { date: Date }): Promise<T> {
    throw new Error('Not implemented: composeSnapshot');
  }

  /**
   * Write the snapshot to the respective directory.
   *
   * @param time
   */
  async saveSnapshot(params: { date: Date }): Promise<T> {
    const { date } = params;

    const res = await this.composeSnapshot({ date });
    const filename = this.composeFilename(date);
    const filepath = path.join(this.snapshotsDir, filename);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir);
    }

    writeDataRecord(filepath, {
      date: this.stringifyDate(date),
      data: JSON.stringify(res)
    });

    return res;
  }

  /**
   *
   * @param params
   * @returns
   */
  async saveRangeValue(params: {
    latestRecord: T;
    date: Date;
    range: AggregationRange;
  }): Promise<T | void> {
    const { latestRecord, date, range } = params;
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

    const pastIsoDate = this.stringifyDate(mapAggregationRangeToDate(range, date));
    const files = fs.readdirSync(this.snapshotsDir);

    //  Check if there is a snapshot for the given range.
    if (!files.includes(pastIsoDate)) {
      console.warn(`No snapshot for ${pastIsoDate} in range ${range} found.`);

      return;
    }

    const snapshotDir = path.join(this.snapshotsDir, this.composeFilename(pastIsoDate));
    const file = fs.readFileSync(snapshotDir, { encoding: 'utf-8' });
    const pastRecord = JSON.parse(file) as DataRecord<T>;

    const next = this.aggregator(latestRecord, pastRecord.data);
    const aggregatedRecordDir = path.join(
      this.aggregatesDir,
      this.composeFilename(AggregationRange['24h'])
    );
    fs.writeFileSync(aggregatedRecordDir, JSON.stringify(next), { encoding: 'utf-8' });

    return next;
  }

  /*
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
  */
}

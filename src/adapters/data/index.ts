import fs from 'node:fs';
import path from 'node:path';
import { Provider } from '../../provider';
import { AggregationRange, Aggregator } from './types';
import { joinDataPath, mapAggregationRangeToDate, readDataRecord, writeDataRecord } from './utils';

/**
 * Adapter to interact with the data-directory.
 *
 * @param provider The name of the provider to use.
 */
export class DataAdapter<
  // Original data type.
  D,
  // Transformed data type for storage.
  Dt
> {
  provider: Provider;
  private version: number = 1;
  private baseDir: string;
  private snapshotsDir: string;
  private aggregatesDir: string;
  /** Get the aggregated entity. */
  private aggregator: Aggregator<D, Dt>;

  constructor(props: { provider: Provider; aggregator: Aggregator<D, Dt>; version?: number }) {
    const { provider, version, aggregator } = props;

    this.provider = provider;
    this.version = version ?? this.version;
    this.aggregator = aggregator;

    this.baseDir = joinDataPath(provider.name);
    this.snapshotsDir = joinDataPath(provider.name, 'snapshots');
    this.aggregatesDir = joinDataPath(provider.name, 'trends');
  }

  private stringifyDate(date: Date): string {
    return date.toISOString();
  }

  private parseDate(date: string): Date {
    return new Date(date);
  }

  private composeFilename(date: Date | string, suffix: 'json' | 'gzip'): string {
    return typeof date === 'string' ? `${date}.${suffix}` : `${this.stringifyDate(date)}.${suffix}`;
  }

  /**
   * Create a single snapshot for the provider.
   *
   * @param time
   * @returns
   */
  async composeSnapshot(params: { date: Date }): Promise<D> {
    throw new Error('Not implemented: composeSnapshot');
  }

  /**
   * Write the snapshot to the respective directory.
   *
   * @param time
   */
  async saveSnapshot(params: { date: Date }): Promise<D> {
    const { date } = params;

    const res = await this.composeSnapshot({ date });
    const filename = this.composeFilename(date, 'gzip');
    const filepath = path.join(this.snapshotsDir, filename);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir);
    }

    await writeDataRecord(filepath, {
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
  async saveAggregation(params: {
    latestRecord: D;
    date: Date;
    range: AggregationRange;
  }): Promise<Dt | void> {
    const { latestRecord, date, range } = params;
    const rangeDir = path.join(this.aggregatesDir, range);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.aggregatesDir)) {
      fs.mkdirSync(this.aggregatesDir);
    }

    const pastIsoDate = this.stringifyDate(mapAggregationRangeToDate(range, date));
    const files = fs.readdirSync(this.snapshotsDir);

    //  Check if there is a snapshot for the given range.
    if (!files.includes(pastIsoDate)) {
      console.warn(`No snapshot for ${pastIsoDate} in range ${range} found.`);

      return;
    }

    const snapshotDir = path.join(this.snapshotsDir, this.composeFilename(pastIsoDate, 'gzip'));
    const pastRecord = await readDataRecord<D>(snapshotDir);

    const next = this.aggregator(latestRecord, pastRecord.data);
    const aggregatedRecordDir = path.join(this.aggregatesDir, this.composeFilename(range, 'json'));
    fs.writeFileSync(aggregatedRecordDir, JSON.stringify(next), { encoding: 'utf-8' });

    return next;
  }
}

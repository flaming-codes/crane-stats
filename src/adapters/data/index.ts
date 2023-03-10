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
  /** E.g. 'stars'. */
  private aggregatesDir: string;
  /** Get the aggregated entity. */
  private aggregator: Aggregator<D, Dt>;

  constructor(props: {
    provider: Provider;
    snapshotsDir: string;
    aggregatesDir: string;
    aggregator: Aggregator<D, Dt>;
    version?: number;
  }) {
    const { provider, version, snapshotsDir, aggregatesDir, aggregator } = props;

    this.provider = provider;
    this.version = version ?? this.version;
    this.aggregator = aggregator;

    this.baseDir = joinDataPath(provider.name);
    this.snapshotsDir = joinDataPath(provider.name, 'snapshots', snapshotsDir);
    this.aggregatesDir = joinDataPath(provider.name, 'trends', aggregatesDir);
  }

  private stringifyDate(date: Date): string {
    return date.toISOString();
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
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }

    await writeDataRecord(filepath, {
      date: this.stringifyDate(date),
      data: res
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

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.aggregatesDir)) {
      fs.mkdirSync(this.aggregatesDir, { recursive: true });
    }

    const snapshotFile = this.composeFilename(mapAggregationRangeToDate(range, date), 'gzip');
    const files = fs.readdirSync(this.snapshotsDir);

    //  Check if there is a snapshot for the given range.
    if (!files.includes(snapshotFile)) {
      console.warn(
        `No snapshot for ${snapshotFile} in range ${range} in '${this.aggregatesDir}' found.`
      );
      return;
    }

    const snapshotDir = path.join(this.snapshotsDir, snapshotFile);
    const pastRecord = await readDataRecord<D>(snapshotDir);

    const next = await this.aggregator(latestRecord, pastRecord.data);
    const aggregatedRecordDir = path.join(this.aggregatesDir, this.composeFilename(range, 'json'));
    fs.writeFileSync(aggregatedRecordDir, JSON.stringify(next), { encoding: 'utf-8' });

    return next;
  }
}

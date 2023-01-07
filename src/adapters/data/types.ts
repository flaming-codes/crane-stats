export type DataRecord<D> = {
  date: string;
  data: D;
};

export enum AggregationRange {
  '1h' = '1h',
  '6h' = '6h',
  '12h' = '12h',
  '24h' = '24h',
  '48h' = '48h',
  '72h' = '72h',
  '1-week' = '1w',
  '2-weeks' = '2w',
  '1-month' = '1m'
}

export type Aggregator<D, Dt> = (latest: D, past: D) => Dt | Promise<Dt>;

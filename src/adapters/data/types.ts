export type DataRecord<D> = {
  date: string;
  data: D;
};

export enum AggregationRange {
  '24h' = '24h',
  'week' = 'week',
  '2-weeks' = '2-weeks',
  'month' = 'month'
}

export type Aggregator<D, Dt> = (latest: D, past: D) => Dt;

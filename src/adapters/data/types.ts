export type DataRecord<T> = {
  date: string;
  data: T;
};

export enum AggregationRange {
  '24h' = '24h',
  'week' = 'week',
  '2-weeks' = '2-weeks',
  'month' = 'month'
}

export type Aggregator<T> = (latest: T, past: T) => T;

export type DataRecord<T> = {
  date: string;
  data: T;
};

export type AggregationRange = '24h' | 'week' | '2-weeks' | 'month';

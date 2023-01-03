import { roundToNearestMinutes } from 'date-fns';
import 'dotenv/config';
import { AggregationRange } from './adapters/data/types';

async function run() {
  const now = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: 'floor'
  });

  const providers = [import('./providers/github')];

  for await (const { adapter } of providers) {
    const record = await adapter.saveSnapshot({ date: now });
    const ranges = Object.values(AggregationRange);

    await Promise.all(
      ranges.map((range) => adapter.saveAggregation({ latestRecord: record, date: now, range }))
    );
  }
}

run().then(() => {
  process.exit(0);
});

import 'dotenv/config';
import { roundToNearestMinutes } from 'date-fns';
import { AggregationRange } from './adapters/data/types';

const providers = [import('./providers/github')];

async function run() {
  let now = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: 'floor'
  });

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

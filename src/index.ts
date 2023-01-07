import 'dotenv/config';
import { roundToNearestMinutes } from 'date-fns';
import { AggregationRange } from './adapters/data/types';
import { fetchCraneDataAuthors, fetchCraneDataIdItems } from './crane-data/net';

const providers = [
  import('./providers/github/repos-by-stars'),
  import('./providers/github/users-by-followers')
];

async function run() {
  let now = roundToNearestMinutes(new Date(), {
    nearestTo: 30,
    roundingMethod: 'floor'
  });

  for await (const { adapter } of providers) {
    const record: any = await adapter.saveSnapshot({ date: now });
    const ranges = Object.values(AggregationRange);

    await Promise.all(
      ranges.map((range) => adapter.saveAggregation({ latestRecord: record, date: now, range }))
    );
  }
}

run().then(() => {
  process.exit(0);
});

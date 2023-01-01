import 'dotenv/config';

async function run() {
  /*
  const now = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: "floor",
  });
  */

  const now = new Date();

  const providers = [import('./providers/github')];
  for await (const { adapter } of providers) {
    await adapter.saveSnapshot(now);
  }
}

run().then(() => {
  process.exit(0);
});

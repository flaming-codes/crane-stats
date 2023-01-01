import "dotenv/config";

import { roundToNearestMinutes } from "date-fns";
import { adapter as octoAdapter } from "./providers/github";

const now = roundToNearestMinutes(new Date(), {
  nearestTo: 15,
  roundingMethod: "floor",
});

async function run() {}

run().then(() => {
  process.exit(0);
});

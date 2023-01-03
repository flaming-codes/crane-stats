# crane-stats

Data-repo to hold all aggregated statistics consumed at the [CRAN/E](https://cran-e.com) PWA. This repo is considered in a very early state and is subject to change.

## Usage

The data is served as static JSON files at the URLs corresponding to the `data` folder structure. Currently, only Github stars trends are served for various time ranges.

### Snapshots

A cron job generates a snapshot of the current data at the beginning of every hour. The snapshots are stored in the `data/snapshots` folder. The snapshots are also served at the same URL structure as the `data` folder, but not meant for direct consumption. Each item is gzip'd and uses the full hours ISO timestamp as the filename.

### Trends

The trends are generated from the snapshots and are stored in the `data/:provider/trends` folder. Each trend corresponds to a specific time range. The enum `AggregationRange` with all ranges is visible [here](https://github.com/flaming-codes/crane-stats/blob/2169d04a5426ababa2ee92b5bcf7f3bbad24afad/src/adapters/data/types.ts).

#### Example

The following example shows the Github stars trends for the last 24 hours. Please note that if no data is available for a specific time range, not enough data is yet available to generate the trend.

```bash
curl https://raw.githubusercontent.com/flaming-codes/crane-stats/main/data/github/trends/24h.json
```

## Development

### Server

You can start a local server to test the data locally. The server is a simple Node.js server that serves the data from the `data` folder w/ the same URL structure as the repository.

```bash
npm run dev:server
```

For more information, please see the README in the `src/server` folder.

<br />
<br />
<br />

<p align="center"><img src="./assets/gh-social.webp" /></p>
<h2 align="center">
<a href="https://www.cran-e.com">CRAN/E</a>
</h2>
<p align="center">This repository holds all aggregated statistics consumed by the CRAN/E PWA. This repo is considered in a very early state and is subject to change.</p>

<br />
<br />
<br />
<br />
<br />

## Motivation

Certain statistics (like the number of stars for R-code repositories) are available via APIs, but only for a single point in time. This repo therefore offers the following features:

- provide a time-series aspect to statistical data from 3rd party APIs
- provide general statistics either as aggregation of 3rd party APIs or completely custom ones

## Usage

The data is served as static JSON files at the URLs corresponding to the `data` folder structure and is consumed by [flaming-codes/crane-app](https://github.com/flaming-codes/crane-app).

### Snapshots

A cron job generates a snapshot of the current data at the beginning of every hour. The snapshots are stored in the `data/snapshots` folder. The snapshots are also served at the same URL structure as the `data` folder, but not meant for direct consumption. Each item is gzip'd and uses the full hours ISO timestamp as the filename.

### Trends

The trends are generated from the snapshots and are stored in the `data/:provider/trends` folder. Each trend corresponds to a specific time range. The enum `AggregationRange` with all ranges is visible [here](https://github.com/flaming-codes/crane-stats/blob/2169d04a5426ababa2ee92b5bcf7f3bbad24afad/src/adapters/data/types.ts).

#### Example

The following example shows the Github stars trends for the last 24 hours. Please note that if no data is available for a specific time range, not enough data is yet available to generate the trend.

```bash
curl https://raw.githubusercontent.com/flaming-codes/crane-stats/main/data/github/trends/repos-by-stars/24h.json
```

## Development

### Server

You can start a local server to test the data locally. The server is a simple Node.js server that serves the data from the `data` folder w/ the same URL structure as the repository.

```bash
npm run dev:server
```

For more information, please see the README in the `src/server` folder.

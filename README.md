# crane-stats

Data-repo to hold all aggregated statistics consumed at the [CRAN/E](https://cran-e.com) PWA. This repo is considered in a very early state and is subject to change.

## Usage

The data is served as a static JSON files at the URLs corresponding to the `data` folder structure. Currently, only Github stars trends are served for various time ranges.

## Development

### Server

You can start a local server to test the data locally. The server is a simple Node.js server that serves the data from the `data` folder w/ the same URL structure as the repository.

```bash
npm run dev:server
```

For more information, please see the README in the `src/server` folder.

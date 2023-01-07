import { DataAdapter } from '../../adapters/data';
import { Aggregator } from '../../adapters/data/types';
import { fetchCraneDataIdItems } from '../../crane-data/net';
import { Provider } from '../../provider';
import { getReposByStars } from './lib';

type DataItem = Awaited<ReturnType<typeof getReposByStars>>['items'][number];

type TrendDataItem = {
  original: DataItem;
  trend: {
    stargazers_count: number;
  };
};

class GithubDataAdapter extends DataAdapter<DataItem[], TrendDataItem[]> {
  async composeSnapshot() {
    const { items } = await getReposByStars();
    return items;
  }
}

const provider = new Provider({ name: 'github' });

const aggregator: Aggregator<DataItem[], TrendDataItem[]> = async (latest, past) => {
  const next: TrendDataItem[] = [];

  for (const item of latest) {
    const existing = past.find((i) => i.id === item.id);

    if (existing) {
      next.push({
        original: item,
        trend: {
          stargazers_count: item.stargazers_count - existing.stargazers_count
        }
      });
    } else {
      next.push({
        original: item,
        trend: {
          stargazers_count: item.stargazers_count
        }
      });
    }
  }

  next.sort((a, b) => b.trend.stargazers_count - a.trend.stargazers_count);

  // Now add CRAN/E metadata.
  const packageNames = await fetchCraneDataIdItems();
  return next.map((item) => {
    const next = { ...item, crane: { packageSlug: '' } };
    const pkg = packageNames.find((pkg) => pkg.id === item.original.name);
    if (pkg) {
      next.crane.packageSlug = pkg.slug;
    }
    return next;
  });
};

export const adapter = new GithubDataAdapter({
  provider,
  aggregator,
  snapshotsDir: 'repos-by-stars',
  aggregatesDir: 'repos-by-stars'
});

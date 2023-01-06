import { DataAdapter } from '../../adapters/data';
import { Aggregator } from '../../adapters/data/types';
import { Provider } from '../../provider';
import { getUsersByFollowers } from './lib';

type DataItem = Awaited<ReturnType<typeof getUsersByFollowers>>['items'][number];

type TrendDataItem = {
  original: DataItem;
  trend: {
    followers: number;
  };
};

class GithubDataAdapter extends DataAdapter<DataItem[], TrendDataItem[]> {
  async composeSnapshot() {
    const { items } = await getUsersByFollowers();
    return items;
  }
}

const provider = new Provider({ name: 'github' });

const aggregator: Aggregator<DataItem[], TrendDataItem[]> = (latest, past) => {
  const next: TrendDataItem[] = [];

  for (const item of latest) {
    const existing = past.find((i) => i.id === item.id);

    if (existing) {
      next.push({
        original: item,
        trend: {
          followers: (item.followers ?? 0) - (existing.followers ?? 0)
        }
      });
    } else {
      next.push({
        original: item,
        trend: {
          followers: item.followers ?? 0
        }
      });
    }
  }

  next.sort((a, b) => b.trend.followers - a.trend.followers);

  return next;
};

export const adapter = new GithubDataAdapter({
  provider,
  aggregator,
  snapshotsDir: 'users-by-followers',
  aggregatesDir: 'users-by-followers'
});

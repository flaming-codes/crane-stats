import { DataAdapter } from '../../adapters/data';
import { Aggregator } from '../../adapters/data/types';
import { Provider } from '../../provider';
import { getReposByStars } from './lib';

type DataItem = Awaited<ReturnType<typeof getReposByStars>>['items'][number];

class GithubDataAdapter extends DataAdapter<DataItem[]> {
  async composeSnapshot() {
    const { items } = await getReposByStars();
    return items;
  }
}

const provider = new Provider({ name: 'github' });

const aggregator: Aggregator<DataItem[]> = (latest, past) => {
  const next: DataItem[] = [];

  for (const item of latest) {
    const existing = past.find((i) => i.id === item.id);

    if (existing) {
      next.push({
        ...item,
        stargazers_count: item.stargazers_count - existing.stargazers_count
      });
    } else {
      next.push(item);
    }
  }

  return next;
};

export const adapter = new GithubDataAdapter({ provider, aggregator });

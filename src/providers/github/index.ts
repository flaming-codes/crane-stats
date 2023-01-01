import { DataAdapter } from '../../adapters/data';
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

export const adapter = new GithubDataAdapter({ provider });

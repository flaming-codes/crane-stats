import { joinDataPath } from "./data";
import { Provider } from "./provider";

/**
 * Adapter to interact with the data-directory.
 *
 * @param provider The name of the provider to use.
 */
export class DataAdapter {
  provider: Provider;
  baseDir: string;

  constructor(props: { provider: Provider }) {
    const { provider } = props;
    this.provider = provider;

    this.baseDir = joinDataPath(provider.name);
  }

  async saveSnapshot(time: Date) {}
}

import fs from "node:fs";
import path from "node:path";
import { Provider } from "../../provider";
import { DataRecord } from "./types";
import { joinDataPath, writeDataRecord } from "./utils";

/**
 * Adapter to interact with the data-directory.
 *
 * @param provider The name of the provider to use.
 */
export class DataAdapter<T> {
  provider: Provider;
  baseDir: string;
  snapshotsDir: string;

  constructor(props: { provider: Provider }) {
    const { provider } = props;
    this.provider = provider;

    this.baseDir = joinDataPath(provider.name);
    this.snapshotsDir = joinDataPath(provider.name, "snapshots");
  }

  /**
   * Create a single snapshot for the provider.
   *
   * @param time
   * @returns
   */
  async composeSnapshot(time: Date): Promise<T> {
    return {} as any;
  }

  /**
   * Write the snapshot to the respective directory.
   *
   * @param time
   */
  async saveSnapshot(time: Date) {
    const res = await this.composeSnapshot(time);
    const filename = `${time.toISOString()}.json`;
    const filepath = path.join(this.snapshotsDir, filename);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir);
    }

    writeDataRecord(filepath, {
      date: time.toISOString(),
      data: JSON.stringify(res),
    });
  }
}

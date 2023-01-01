import path from "node:path";
import fs from "node:fs";
import { DataRecord } from "./types";

export const dataPath = path.join(process.cwd(), "data");

export function joinDataPath(...rest: string[]) {
  return path.join(dataPath, ...rest);
}

export function writeDataRecord<T>(filepath: string, record: DataRecord<T>) {
  fs.writeFileSync(filepath, JSON.stringify(record), { encoding: "utf-8" });
}

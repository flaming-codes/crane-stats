import path from "node:path";

export const dataPath = path.join(process.cwd(), "data");

export function joinDataPath(...rest: string[]) {
  return path.join(dataPath, ...rest);
}

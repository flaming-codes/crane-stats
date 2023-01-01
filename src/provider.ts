import { DataAdapter } from "./adapters/data";

export class Provider {
  name: string;

  constructor(props: { name: string }) {
    const { name } = props;
    this.name = name;
  }
}

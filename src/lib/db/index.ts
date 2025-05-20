import Dexie, { Table } from "dexie";

export interface Kind0Entry {
  pubkey: string;
  event: unknown;
}

class AppDB extends Dexie {
  kind0!: Table<Kind0Entry, string>;
  constructor() {
    super("npub.dev");
    this.version(1).stores({ kind0: "&pubkey" });
  }
}

export const db = new AppDB();

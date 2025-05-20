import Dexie, { Table } from "dexie";

export interface Kind0Entry {
  pubkey: string;
  event: unknown;
}

export interface Kind10002Entry {
  pubkey: string;
  event: unknown;
}

export interface Nip11Entry {
  url: string;
  name?: string;
  icon_url?: string;
  last_checked?: number;
}

class NostrDatabase extends Dexie {
  kind0!: Table<Kind0Entry, string>;
  kind10002!: Table<Kind10002Entry, string>;
  nip11!: Table<Nip11Entry, string>;

  constructor() {
    super("nostr");
    this.version(1).stores({
      kind0: "&pubkey",
      kind10002: "&pubkey",
      nip11: "&url,name,icon_url,last_checked",
    });
  }
}

export const db = new NostrDatabase();

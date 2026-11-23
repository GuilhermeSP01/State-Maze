/** 0: floor off; 1: floor on; 2: wall. */
export type Tile = 0 | 1 | 2;

/** Zero-based coordinates in the map. */
export type Position = {
  readonly row: number;
  readonly column: number;
};

/** Titles keyed by language code, with English as the fallback. */
export type LocalizedTitle = Readonly<Record<string, string>> & {
  readonly en: string;
};

export type WorldDefinition = {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly title: LocalizedTitle;
};

/** Initial stage data. IDs are UUIDs; stage numbers are local to each world. */
export type StageDefinition = {
  readonly schemaVersion: 2;
  readonly id: string;
  readonly worldId: string;
  readonly number: number;
  readonly map: readonly (readonly Tile[])[];
  readonly playerStart: Position;
};

/** 0: floor off; 1: floor on; 2: wall. */
export type Tile = 0 | 1 | 2;

/** Zero-based coordinates in the map. */
export type Position = {
  readonly row: number;
  readonly column: number;
};

/** Initial stage data. Copy each map row before changing tiles during play. */
export type StageDefinition = {
  readonly schemaVersion: 1;
  readonly id: number;
  readonly map: readonly (readonly Tile[])[];
  readonly playerStart: Position;
};

import type { WorldDefinition } from '@state-maze/stages';

const files = import.meta.glob<WorldDefinition>(
  '../../../../packages/stages/worlds/*.json',
  { import: 'default' },
);

const loaders = new Map(
  Object.entries(files).map(([path, load]) => [
    path.slice(path.lastIndexOf('/') + 1, -5),
    load,
  ]),
);

export async function loadWorld(worldId: string): Promise<WorldDefinition | null> {
  const load = loaders.get(worldId);
  return load ? load() : null;
}

export async function listWorlds(): Promise<WorldDefinition[]> {
  return Promise.all([...loaders.values()].map((load) => load()));
}

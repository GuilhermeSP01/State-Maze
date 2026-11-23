import type { StageDefinition } from '@state-maze/stages';

const files = import.meta.glob<StageDefinition>(
  '../../../../packages/stages/maps/*.json',
  { import: 'default' },
);

const loaders = new Map(
  Object.entries(files).map(([path, load]) => [
    path.slice(path.lastIndexOf('/') + 1, -5),
    load,
  ]),
);

export async function loadStage(stageId: string): Promise<StageDefinition | null> {
  const load = loaders.get(stageId);
  return load ? load() : null;
}

export async function listStages() {
  const stages = await Promise.all([...loaders.values()].map((load) => load()));
  return stages.map(({ id, worldId, number }) => ({ id, worldId, number }));
}

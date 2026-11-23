import type { StageDefinition } from '@state-maze/stages';

const files = import.meta.glob<StageDefinition>(
  '../../../../packages/stages/maps/*.json',
  { import: 'default' },
);

const loaders = new Map(
  Object.entries(files).map(([path, load]) => [
    Number(path.slice(path.lastIndexOf('/') + 1, -5)),
    load,
  ]),
);

export const availableStageNumbers = [...loaders.keys()].sort((a, b) => a - b);

export async function loadStage(stageNumber: number): Promise<StageDefinition | null> {
  const load = loaders.get(stageNumber);
  return load ? load() : null;
}

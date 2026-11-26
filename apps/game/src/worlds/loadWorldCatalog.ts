import { getWorldStages, listStages } from '../stages/loadStage';
import { listWorlds } from './loadWorld';

export async function loadWorldCatalog() {
  const [worlds, stages] = await Promise.all([listWorlds(), listStages()]);

  return worlds.map((world) => ({
    world,
    stages: getWorldStages(stages, world.id),
  }));
}

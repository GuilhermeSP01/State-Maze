import { listStages } from '../stages/loadStage';
import { listWorlds } from './loadWorld';

export async function loadWorldCatalog() {
  const [worlds, stages] = await Promise.all([listWorlds(), listStages()]);

  return worlds.map((world) => ({
    world,
    stages: stages
      .filter((stage) => stage.worldId === world.id)
      .sort((a, b) => a.number - b.number),
  }));
}

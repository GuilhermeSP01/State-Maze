import type { WorldDefinition } from '@state-maze/stages';

export function getWorldTitle(world: WorldDefinition, language: string): string {
  return world.title[language] ?? world.title[language.split('-')[0]] ?? world.title.en;
}

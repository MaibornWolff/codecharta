import { EncounterResolver } from './EncounterResolver.js'

// An ES module file: the import has to name the emitted .js file.
export function encounterReport(resolver: EncounterResolver): string {
  if (resolver.isEmpty()) {
    return 'no encounter in the dungeon'
  }
  return 'encounter resolved'
}

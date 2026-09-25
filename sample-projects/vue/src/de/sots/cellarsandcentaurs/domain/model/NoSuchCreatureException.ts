import { CreatureId } from './CreatureId'

export class NoSuchCreatureException extends Error {
  constructor(id: CreatureId) {
    super('No such creature in the dungeon: ' + id.id)
    this.name = 'NoSuchCreatureException'
  }
}

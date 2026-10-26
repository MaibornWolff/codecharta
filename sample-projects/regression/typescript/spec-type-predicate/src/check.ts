import type { Centaur, Creature } from './model'

export function isCentaur(creature: Creature): creature is Centaur {
    return creature !== undefined
}

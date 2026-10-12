<script setup lang="ts">
import type { Creature } from '../model/Creature'
import { Dice } from '../model/Dice'
import { SpeedType } from '../model/SpeedType'

/**
 * Resolves an encounter between two creatures in the dungeon.
 * The attacker rolls against the armor class of the defender.
 * Terrain and bonus shift the damage.
 * The numbers of this file are compared across all languages.
 */
class EncounterResolver {
  private rounds: number = 0

  resolve(attacker: Creature, defender: Creature, roll: number, bonus: number, terrain: string): number {
    // a natural one always misses
    if (roll === 1) {
      return 0
    } else if (roll === 20) {
      bonus += 2
    } else {
      bonus += 0
    }
    let damage = 0
    for (const [speedType, speed] of attacker.getSpeeds()) {
      if (speedType === SpeedType.WALKING && speed.getSpeed() > 30) {
        damage += 1
      }
    }
    /* the charge wears off
       one step at a time */
    let charge = bonus
    while (charge > 3) {
      charge -= 3
      damage += 1
    }
    switch (terrain) {
      case 'cellar':
        damage += 1
        break
      case 'lair':
        damage += 2
        break
      case 'stable':
        damage -= 1
        break
      default:
        damage += 0
    }
    const armor = defender.getArmorClass() ? 10 : 0 // the armor class is simplified
    // damage = damage * 2
    const hits = roll + bonus > armor || roll === 20
    this.rounds += 1
    return Number(hits) * damage
  }

  describe(creature: Creature): string {
    // one chain of five calls and one of three
    const label = creature.getType().toString().trim().toLowerCase().padEnd(12)
    const first = creature.getSpeeds().keys().next()
    return label + String(first.done)
  }

  safeRoll(dice: Dice): number {
    try {
      return [dice.roll().value].map((value) => {
        if (value > 20) return 20
        return value
      })[0]
    } catch (error) {
      return 1
    } finally {
      this.rounds += 1
    }
  }

  initiativeOrder(creatures: Creature[]): Creature[] {
    function byInitiative(left: Creature, right: Creature): number {
      return right.rollInitiative() - left.rollInitiative()
    }
    // only the first eight creatures act
    if (creatures.length > 8) {
      return this.initiativeOrder(creatures.slice(0, 8))
    }
    return [...creatures].sort(byInitiative)
  }

  isEmpty(): boolean {
    return this.rounds === 0
  }
}
</script>

<template>
  <p class="encounter-resolver">Encounter resolver</p>
</template>

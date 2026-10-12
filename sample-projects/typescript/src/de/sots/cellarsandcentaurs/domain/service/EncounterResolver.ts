import { Creature } from "../model/Creature";
import { Dice } from "../model/Dice";
import { SpeedType } from "../model/SpeedType";

/**
 * Resolves an encounter between two creatures in the dungeon.
 * The attacker rolls the dice and adds its bonus to the roll.
 * The armor class of the defender decides whether the hit lands.
 * The terrain of the cellar changes the damage of a hit.
 */
export class EncounterResolver {
    private readonly log: string[] = [];

    resolve(attacker: Creature, defender: Creature, roll: number, bonus: number, terrain: string): boolean {
        // A natural one always misses.
        if (roll === 1) {
            return false;
        } else if (roll === 20) {
            this.log.push("critical");
        } else {
            this.log.push("normal");
        }
        let damage = roll + bonus; // the bonus may be negative
        for (const [speedType, speed] of attacker.getSpeeds()) {
            if (speedType === SpeedType.FLYING && speed.getSpeed() > 30) {
                damage += 2;
            }
        }
        /* Damage above ten is carried over
           in steps of ten. */
        let remaining = damage;
        while (remaining > 10) {
            remaining -= 10;
        }
        // The terrain shifts the damage.
        switch (terrain) {
            case "cellar":
                damage += 1;
                break;
            case "lair":
                damage += 2;
                break;
            case "stable":
                damage -= 1;
                break;
            default:
                break;
        }
        // damage = Math.max(damage, 0);
        const armor = defender.getArmorClass() === undefined ? 10 : 15;
        return damage >= armor || remaining === 0;
    }

    describe(creature: Creature): string {
        // Type and id make up the label.
        const typeLabel = creature.getType().toString().trim().toLowerCase().padEnd(12);
        const idLabel = creature.getId().toString().toUpperCase();
        return typeLabel + idLabel;
    }

    safeRoll(dice: Dice): number {
        const clamp = (value: number): number => {
            if (value > 20) {
                return 20;
            }
            return value;
        };
        try {
            return clamp(dice.roll().value);
        } catch (error) {
            return 1;
        } finally {
            this.log.push("rolled");
        }
    }

    initiativeOrder(creatures: Creature[]): Creature[] {
        function fastestFirst(remaining: Creature[]): Creature[] {
            if (remaining.length <= 1) {
                return remaining;
            }
            const [first, ...rest] = remaining;
            return [...fastestFirst(rest), first];
        }
        return fastestFirst(creatures);
    }

    isEmpty(): boolean {
        return this.log.length === 0;
    }
}

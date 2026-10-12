import { SpeedType } from "../model/SpeedType.js";

/**
 * Resolves one round of an encounter between two creatures.
 * The attacker rolls, the armor class of the defender decides.
 * Every sample project carries the same logic in its own language.
 * The numbers of the unified parser are therefore comparable.
 */
export class EncounterResolver {
    // rounds that were resolved so far
    rounds = 0;

    resolve(attacker, defender, roll, bonus, terrain) {
        // a natural one always misses
        if (roll === 1) {
            return 0;
        } else if (roll === 20) {
            bonus = bonus * 2;
        } else {
            bonus = bonus + 1;
        }
        let damage = 0;
        const speeds = Array.from(attacker.getSpeeds());
        for (let index = 0; index < speeds.length; index++) {
            if (speeds[index][0] === SpeedType.FLYING && speeds[index][1].getSpeed() > 30) {
                damage += 2;
            }
        }
        let remaining = roll + bonus;
        while (remaining > defender.getArmorClass().getTotal()) {
            damage += 1;
            remaining -= 5;
        }
        switch (terrain) {
            case "cellar":
                damage += 1;
                break;
            case "lair":
                damage += 2;
                break;
            case "dungeon":
                damage -= 1;
                break;
            default:
                break;
        }
        /* the stable is neutral ground,
           nobody is hurt there */
        const capped = damage > 10 ? 10 : damage; // cap the damage
        this.blocked = terrain === "stable" || capped < 0;
        // this.rounds = this.rounds + 1;
        this.rounds++;
        return capped;
    }

    describe(creature) {
        const type = creature.getType().toString().trim().toLowerCase().replace("_", " ");
        const label = creature.getId().toString().toUpperCase();
        return type + " " + label;
    }

    safeRoll(dice) {
        const clamp = (value) => {
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
            this.rounds++;
        }
    }

    initiativeOrder(creatures) {
        // only the first eight creatures act in a round
        function byInitiative(left, right) {
            return right.initiative - left.initiative;
        }
        if (creatures.length > 8) {
            return this.initiativeOrder(creatures.slice(0, 8));
        }
        return creatures.slice().sort(byInitiative);
    }

    isEmpty() {
        return this.rounds === 0;
    }
}

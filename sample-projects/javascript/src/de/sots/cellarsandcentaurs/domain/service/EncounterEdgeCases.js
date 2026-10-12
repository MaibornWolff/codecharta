#!/usr/bin/env node

import { Speed } from "../model/Speed.js";
import { HitPoints } from "../model/HitPoints.js";
import { CreatureId } from "../model/CreatureId.js";
import { Centaur } from "../model/Centaur.js";
import { Dice } from "../model/Dice.js";
import { ArmorClass } from "../model/ArmorClass.js";
import CreatureType from "../model/CreatureType.js";
import { SpeedType } from "../model/SpeedType.js";

export function forOf(creatures) {
    let total = 0;
    for (const creature of creatures) {
        if (creature.isAlive()) {
            total += 1;
        }
    }
    return total;
}

export function forIn(speeds) {
    let total = 0;
    for (const key in speeds) {
        total += speeds[key];
    }
    return total;
}

export function doWhile(roll) {
    let rounds = 0;
    do {
        rounds += 1;
        roll -= 5;
    } while (roll > 0);
    return rounds;
}

export function nullishCoalescing(creature) {
    return creature.name ?? "nameless";
}

export function nullishAssignment(options) {
    options.terrain ??= "cellar";
    return options;
}

export function orAssignment(options) {
    options.terrain ||= "lair";
    return options;
}

export function andAssignment(options) {
    options.terrain &&= "dungeon";
    return options;
}

export function optionalChaining(creature) {
    return creature?.speeds?.size;
}

export function optionalCallChain(creature) {
    return creature?.getSpeeds()?.values()?.next()?.toString();
}

export function brokenChain(creature) {
    return creature.getSpeeds().values().next().value.getSpeed().toFixed(0);
}

export const arrowExpression = (id) => new Centaur(id);

export const arrowBlock = (roll, bonus) => {
    if (roll > 10) {
        return roll + bonus;
    }
    return roll;
};

export const asyncArrow = async (dice) => await dice.roll();

export const functionExpression = function (dice) {
    return dice.roll();
};

export class GetterLair {
    get krakenTreasure() {
        return CreatureType.DRAGON;
    }
}

export class SetterLair {
    set hydraTreasure(value) {
        this.hoard = value;
    }
}

export class StaticBlockLair {
    static capacity;
    static {
        StaticBlockLair.capacity = HitPoints.MAX_HIT_POINTS > 100 ? 8 : 4;
    }
}

export class PrivateLair {
    #wyvernHoard = 0;
    #count(speedType) {
        return speedType === SpeedType.WALKING ? this.#wyvernHoard : 0;
    }
}

export class ConstructorLair {
    constructor(hoard, guards) {
        this.hoard = hoard;
        this.guards = guards;
    }
}

export class StaticMethodLair {
    static create() {
        return new StaticMethodLair();
    }
}

export class FieldArrowLair {
    guard = (intruder) => intruder.flee();
}

export function* rollManticore(sides) {
    while (true) {
        yield new Dice(sides).roll();
    }
}

export async function awaitEach(stream) {
    let total = 0;
    for await (const roll of stream) {
        total += roll;
    }
    return total;
}

export async function awaitOne(repository) {
    const creature = await repository.find();
    return creature;
}

export function defaultParameters(roll, speed = new Speed(30), bonus = 2) {
    return roll + speed.getSpeed() + bonus;
}

export function restParameters(first, ...others) {
    return first + others.length;
}

export function destructuredParameters({ pegasusRoll, bonus }, [first, second]) {
    return pegasusRoll + bonus + first + second;
}

export function parameterOnly(chimeraRoll) {
    return chimeraRoll;
}

export const naturalArmor = (function () {
    return new ArmorClass(10, 0);
})();

export function promiseChain(repository) {
    return repository
        .load()
        .then((creature) => creature.rest())
        .catch(() => null)
        .finally(() => repository.close());
}

export function callbackLambdas(creatures) {
    return creatures.filter((creature) => creature.isAlive()).map((creature) => creature.getId());
}

export function labelledBreak(grid) {
    let found = 0;
    minotaurLoop: for (const row of grid) {
        for (const cell of row) {
            if (cell === 0) {
                break minotaurLoop;
            }
            found += 1;
        }
    }
    return found;
}

export function fallthrough(type) {
    switch (type) {
        case "dragon":
        case "fiend":
            return 2;
        case "beast": {
            return 1;
        }
        default:
            return 0;
    }
}

export function nestedTernary(roll) {
    return roll > 15 ? "hit" : roll > 5 ? "graze" : "miss";
}

export function mixedLogic(roll, bonus) {
    return (roll > 10 && bonus > 0) || roll === 20;
}

export function bracelessIf(roll) {
    if (roll > 15) return 2;
    else if (roll > 5) return 1;
    else return 0;
}

export function optionalCatchBinding(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export function templateLiteral(alive) {
    return `https://cellar.example/${CreatureId.name}/${alive ? "alive" : "dead"} // griffin`;
}

export function multiLineTemplate(name) {
    return `Dear ${name},
// phoenix is text, not a comment
/* neither is this */
the dungeon awaits.`;
}

export function regexLiteral(text) {
    return /basilisk[/*]+/.test(text) || /[*/]$/.test(text);
}

export function stringMarkers() {
    const text = "// cyclops is not a comment /* nor is ogre */";
    return text + '/* still a string */';
}

/**
 * Counts the guards of a lair.
 * @param {number} guards
 */
export function commentKinds(guards) {
    /* block comment */
    // line comment
    return guards; /* trailing block */ // trailing line
}

export const lairKeeper = {
    sphinxDoor: 3,
    open(door) {
        return door.unlock();
    },
    close: function (door) {
        return door.lock();
    },
    knock: (door) => door.knock(),
    get doors() {
        return this.sphinxDoor;
    },
};

export default function defaultEncounter(roll) {
    return roll;
}

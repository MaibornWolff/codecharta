/**
 * Constructs of TypeScript that a parser is likely to miscount, one per declaration.
 */
import { Creature } from "../model/Creature";
import type { Centaur } from "../model/Centaur";
import { CreatureId } from "../model/CreatureId";
import { rollD20 } from "../model/Dice";
import { HitPoints } from "../model/HitPoints";
import { NoSuchCreatureException } from "../model/NoSuchCreatureException";
import { Speed } from "../model/Speed";
import { SpeedType } from "../model/SpeedType";
import { countHoard } from "../model/hoardLedger.cjs";
import { openLair } from "../model/lairKeeper.mjs";

export function forOfLoop(speeds: number[]): number {
    let total = 0;
    for (const speed of speeds) {
        total += speed;
    }
    return total;
}

export function forInLoop(hoard: Record<string, number>): number {
    let total = 0;
    for (const treasure in hoard) {
        total += hoard[treasure];
    }
    return total;
}

export function classicForLoop(rounds: number): number {
    let total = 0;
    for (let round = 0; round < rounds; round++) {
        total += round;
    }
    return total;
}

export function doWhileLoop(hitPoints: number): number {
    let rounds = 0;
    do {
        hitPoints -= 3;
        rounds++;
    } while (hitPoints > 0);
    return rounds;
}

export function nullishCoalescing(bonus?: number): number {
    return bonus ?? 0;
}

export function nullishAssignment(lair: { capacity?: number }): number {
    lair.capacity ??= 12;
    return lair.capacity;
}

export function logicalAssignment(lair: { name: string; open: boolean }): string {
    lair.name ||= "cellar";
    lair.open &&= lair.name.length > 0;
    return lair.name;
}

export function optionalChaining(creature?: Creature): number | undefined {
    return creature?.getHitPoints()?.current;
}

export const arrowExpressionBody = (speed: number): number => speed * 2;

export const arrowBlockBody = (speed: number): number => {
    if (speed > 30) {
        return 30;
    }
    return speed;
};

export const functionExpression = function (roll: number): number {
    return roll + 1;
};

export function inlineCallbacks(rolls: number[]): number[] {
    return rolls.map((roll) => roll * 2).filter((roll) => roll > 2);
}

export function overloaded(value: string): string;
export function overloaded(value: number): number;
export function overloaded(value: string | number): string | number {
    return value;
}

export abstract class AbstractLair {
    abstract capacity(): number;
    isFull(creatureCount: number): boolean {
        return creatureCount >= this.capacity();
    }
}

export interface LairPort {
    enter(creature: Creature): void;
    leave(creature: Creature): void;
}

export class ParameterProperties {
    constructor(
        private readonly lairName: string,
        public depth: number = 1,
    ) {}
}

export class Accessors {
    private storedXPValue = 0;
    get xpValue(): number {
        return this.storedXPValue;
    }
    set xpValue(value: number) {
        if (value >= 0) {
            this.storedXPValue = value;
        }
    }
}

export class PrivateMethods {
    #secretPassage(): string {
        return "behind the hoard";
    }
    reveal(): string {
        return this.#secretPassage();
    }
}

export class StaticBlock {
    static readonly lairs: string[] = [];
    static {
        if (StaticBlock.lairs.length === 0) {
            StaticBlock.lairs.push("lair");
        }
    }
}

export function* generatorRolls(count: number): Generator<number> {
    for (let index = 0; index < count; index++) {
        yield index;
    }
}

export async function asyncLoad(creatureName: string): Promise<string> {
    const loaded = await Promise.resolve(creatureName);
    return loaded;
}

export async function forAwaitLoop(rolls: AsyncIterable<number>): Promise<number> {
    let total = 0;
    for await (const roll of rolls) {
        total += roll;
    }
    return total;
}

export function defaultParameter(roll: number, bonus: number = rollD20()): number {
    return roll + bonus;
}

export function restParameter(...rolls: number[]): number {
    return rolls.length;
}

export function optionalParameter(roll: number, bonus?: number): number {
    return roll + (bonus as number);
}

export function destructuredParameter({ roll, bonus }: { roll: number; bonus: number }): number {
    return roll + bonus;
}

export function thisParameter(this: { bonus: number }, roll: number): number {
    return roll + this.bonus;
}

export function isCentaur(creature: Creature): creature is Centaur {
    return "gallop" in creature;
}

export type SpeedValue<T> = T extends Speed ? number : never;

export enum ComputedLair {
    Small = 1 << 0,
    Large = Small | 2,
    NameLength = "lair".length,
}

export namespace EdgeNamespace {
    export function innerRoll(): number {
        return 20;
    }
}

function logged(target: unknown, propertyKey: string): void {
    void [target, propertyKey];
}
export class Decorated {
    @logged
    decoratedMethod(): void {}
}

export const lairConfig = { current: 1, max: 1, temporary: 0 } satisfies Pick<HitPoints, "current" | "max" | "temporary">;

export function templateLiteral(wounded: boolean): string {
    return `http://cellar/${wounded ? "lair" : "stable"} /* not a comment */`;
}

/**
 * TSDoc for the commented function.
 * @param roll the dice roll
 */
export function commented(roll: number): number {
    /* block comment */
    // line comment
    // @ts-ignore
    const untyped: string = roll; // trailing line comment
    return untyped.length; /* trailing block comment */
}

export function commentMarkersInStrings(): string[] {
    return ["// not a comment", '/* neither */', "/** nor this */"];
}

export const multiLineTemplate = `first line of the hoard list
// looks like a comment
last line of the hoard list`;

export function labelledBreak(grid: number[][]): number {
    let found = 0;
    outer: for (const row of grid) {
        for (const cell of row) {
            if (cell < 0) {
                break outer;
            }
            found += cell;
        }
    }
    return found;
}

export function switchFallthrough(roll: number): string {
    switch (roll) {
        case 1:
        case 2:
            return "miss";
        case 20:
            return "critical";
        default:
            return "hit";
    }
}

export function optionalCatchBinding(dice: { roll(): number }): number {
    try {
        return dice.roll();
    } catch {
        return 1;
    }
}

export function nestedTernary(roll: number): string {
    return roll === 1 ? "miss" : roll === 20 ? "critical" : "hit";
}

export class ArrowProperty {
    handleRoll = (roll: number): number => roll;
}

export const lairObject = {
    open(): void {},
    close: (): void => {},
    get size(): number {
        return 1;
    },
};

export function genericConstraint<T extends CreatureId>(creatureId: T): T {
    return creatureId;
}

export function instanceofInCatch(lookup: () => number): number {
    try {
        return lookup();
    } catch (error) {
        if (error instanceof NoSuchCreatureException) {
            return 0;
        }
        throw error;
    }
}

export declare function ambientRoll(sides: number): number;

export type RollCallback = (roll: number, bonus: number) => number;

export type SpeedName = keyof typeof SpeedType;

export function optionalMessageChain(creature: Creature): string | undefined {
    return creature.getId()?.toString()?.trim()?.toLowerCase();
}

export function propertyInChain(creature: Creature): string {
    return creature.getId().id.trim().toLowerCase().toUpperCase();
}

export function multiLineChain(creature: Creature): string {
    return creature
        .getType()
        .toString()
        .trim()
        .toLowerCase();
}

export class LongConstructor {
    constructor(
        readonly attacker: Creature,
        readonly defender: Creature,
        readonly roll: number,
        readonly bonus: number,
        readonly terrain: string,
    ) {}
}

export function extensionVariants(): number {
    return countHoard([1, 2]) + openLair().größe();
}

const $treasureMap = 1;
const _hoardSize = 2;
const lairHTTPGate = 3;
const HTTPSLairURL = 4;
export const identifierForms = [$treasureMap, _hoardSize, lairHTTPGate, HTTPSLairURL];

export type Terrain = "swamp" | "volcano";

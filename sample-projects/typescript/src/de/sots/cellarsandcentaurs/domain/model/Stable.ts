import "./registerCreatureTypes";

export namespace Stable {
    export class Groom {
        constructor(private readonly stableName: string) {}

        brush(creatureName: string): string {
            return `${this.stableName}: brushed ${creatureName}`;
        }
    }

    export const CAPACITY = 12;
}

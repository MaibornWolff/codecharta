export class CreatureId {
    constructor(readonly id: string) {}

    equals(other: CreatureId): boolean {
        return this.id === other.id;
    }
}

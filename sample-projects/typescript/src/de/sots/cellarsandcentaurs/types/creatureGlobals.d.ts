interface CreatureTypeRegistry {
    has(creatureTypeName: string): boolean;
    register(creatureTypeName: string): void;
}

declare var creatureTypeRegistry: CreatureTypeRegistry;

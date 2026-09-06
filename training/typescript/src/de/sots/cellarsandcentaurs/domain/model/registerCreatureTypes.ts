/// <reference path="../../typings/creatureGlobals.d.ts" />

const knownCreatureTypes = ["monstrosity", "beast", "aberration", "celestial", "dragon", "fiend", "humanoid", "undead"];

for (const creatureTypeName of knownCreatureTypes) {
    if (!creatureTypeRegistry.has(creatureTypeName)) {
        creatureTypeRegistry.register(creatureTypeName);
    }
}

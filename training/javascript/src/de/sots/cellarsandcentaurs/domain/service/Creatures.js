/** @typedef {import("../model/Creature.js").Creature} Creature */
/** @typedef {import("../model/CreatureId.js").CreatureId} CreatureId */

export class Creatures {
    /**
     * @param {Creature} creature
     * @returns {Promise<void>}
     */
    async save(creature) {
        throw new Error("not implemented");
    }

    /**
     * @param {CreatureId} id
     * @returns {Promise<Creature>}
     */
    async find(id) {
        throw new Error("not implemented");
    }
}

import { CreatureId } from "./CreatureId.js";

export class NoSuchCreatureException extends Error {
    /**
     * @param {CreatureId} id
     */
    constructor(id) {
        super("No such creature in the dungeon: " + id.id);
        this.name = "NoSuchCreatureException";
    }
}
